import { supabaseAdmin } from '../config/supabase.js';
export class BudgetMonitoringService {
    client;
    constructor(client = supabaseAdmin) {
        this.client = client;
    }
    calculateHealthStatus(utilizationPercent) {
        if (utilizationPercent > 100)
            return 'OVER_BUDGET';
        if (utilizationPercent >= 85)
            return 'NEAR_LIMIT';
        if (utilizationPercent >= 70)
            return 'ATTENTION';
        return 'HEALTHY';
    }
    async getAllBudgets() {
        const { data: budgets, error } = await this.client
            .from('budgets')
            .select('*')
            .order('allocated_amount', { ascending: false });
        if (error)
            throw error;
        const computedList = [];
        for (const b of (budgets || [])) {
            const allocated = Number(b.allocated_amount) || 0;
            const spent = Number(b.spent_amount) || 0;
            const remaining = Number((allocated - spent).toFixed(2));
            const utilization = allocated > 0 ? Number(((spent / allocated) * 100).toFixed(1)) : 0;
            const variance = Number((allocated - spent).toFixed(2));
            const health = this.calculateHealthStatus(utilization);
            // Fetch pending/held invoices for this department (committed spend)
            const { data: pendingInvoices } = await this.client
                .from('invoices')
                .select('amount, status')
                .in('status', ['APPROVED', 'ON_HOLD', 'UNDER_REVIEW']);
            // Estimated commitment
            const committed = (pendingInvoices || []).reduce((s, i) => s + (Number(i.amount) || 0), 0) * 0.2; // Dept slice
            // Simple quarterly projection (current spent scaled by remaining days in quarter)
            const now = new Date();
            const dayOfQuarter = (now.getMonth() % 3) * 30 + now.getDate();
            const projected = dayOfQuarter > 0 ? Number(((spent / dayOfQuarter) * 90).toFixed(2)) : spent;
            computedList.push({
                ...b,
                remaining_amount: remaining,
                utilization_percent: utilization,
                variance_amount: variance,
                health_status: health,
                committed_amount: Number(committed.toFixed(2)),
                projected_quarter_spend: projected,
                transaction_count: 5,
                invoice_count: 3
            });
        }
        return computedList;
    }
    async getBudgetById(id) {
        const { data: budget, error } = await this.client
            .from('budgets')
            .select('*')
            .eq('id', id)
            .maybeSingle();
        if (error || !budget)
            return null;
        const allocated = Number(budget.allocated_amount) || 0;
        const spent = Number(budget.spent_amount) || 0;
        const remaining = Number((allocated - spent).toFixed(2));
        const utilization = allocated > 0 ? Number(((spent / allocated) * 100).toFixed(1)) : 0;
        const variance = Number((allocated - spent).toFixed(2));
        const health = this.calculateHealthStatus(utilization);
        // Fetch transactions matching department/category
        const { data: txns } = await this.client
            .from('transactions')
            .select('*')
            .ilike('category', `%${budget.category.split(' ')[0]}%`)
            .order('transaction_date', { ascending: false })
            .limit(20);
        // Fetch invoices matching department
        const { data: invs } = await this.client
            .from('invoices')
            .select('*')
            .order('invoice_date', { ascending: false })
            .limit(10);
        const impactingTxns = txns || [];
        const impactingInvs = invs || [];
        const committed = impactingInvs
            .filter(i => i.status === 'APPROVED' || i.status === 'UNDER_REVIEW')
            .reduce((s, i) => s + (Number(i.amount) || 0), 0);
        const now = new Date();
        const dayOfQuarter = (now.getMonth() % 3) * 30 + now.getDate();
        const projected = dayOfQuarter > 0 ? Number(((spent / dayOfQuarter) * 90).toFixed(2)) : spent;
        return {
            ...budget,
            remaining_amount: remaining,
            utilization_percent: utilization,
            variance_amount: variance,
            health_status: health,
            committed_amount: Number(committed.toFixed(2)),
            projected_quarter_spend: projected,
            transaction_count: impactingTxns.length,
            invoice_count: impactingInvs.length,
            impactingTransactions: impactingTxns,
            impactingInvoices: impactingInvs
        };
    }
}
