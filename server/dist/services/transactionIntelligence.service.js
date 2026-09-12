import { supabaseAdmin } from '../config/supabase.js';
export class TransactionIntelligenceService {
    client;
    constructor(client = supabaseAdmin) {
        this.client = client;
    }
    async calculateMetrics(filters) {
        let query = this.client
            .from('transactions')
            .select('*, vendor:vendors(id, name)');
        if (filters?.vendorId) {
            query = query.eq('vendor_id', filters.vendorId);
        }
        if (filters?.category) {
            query = query.eq('category', filters.category);
        }
        if (filters?.fromDate) {
            query = query.gte('transaction_date', filters.fromDate);
        }
        if (filters?.toDate) {
            query = query.lte('transaction_date', filters.toDate);
        }
        const { data: transactions, error } = await query;
        if (error)
            throw error;
        const txns = transactions || [];
        const totalCount = txns.length;
        if (totalCount === 0) {
            return {
                totalCount: 0,
                totalVolume: 0,
                incomingAmount: 0,
                outgoingAmount: 0,
                netCashflow: 0,
                averageTransaction: 0,
                largestTransaction: null,
                statusBreakdown: {},
                categoryTotals: [],
                vendorConcentration: [],
                dailyTotals: [],
                monthlySpendingTrend: [],
                recurringPatterns: []
            };
        }
        let totalVolume = 0;
        let incomingAmount = 0;
        let outgoingAmount = 0;
        let largestTxn = null;
        const statusMap = {};
        const categoryMap = {};
        const vendorMap = {};
        const dailyMap = {};
        const monthlyMap = {};
        // Grouping by vendor + amount for recurring pattern detection
        const vendorAmountMap = {};
        for (const t of txns) {
            const amt = Number(t.amount) || 0;
            totalVolume += amt;
            const isIncoming = t.transaction_type === 'INFLOW' || t.transaction_type === 'HOLD_REVERSAL';
            if (isIncoming) {
                incomingAmount += amt;
            }
            else {
                outgoingAmount += amt;
            }
            // Largest transaction
            if (!largestTxn || amt > largestTxn.amount) {
                largestTxn = {
                    id: t.id,
                    reference: t.transaction_reference,
                    amount: amt,
                    vendorName: t.vendor?.name || 'Unknown',
                    date: t.transaction_date
                };
            }
            // Status breakdown
            if (!statusMap[t.status]) {
                statusMap[t.status] = { count: 0, volume: 0 };
            }
            statusMap[t.status].count += 1;
            statusMap[t.status].volume += amt;
            // Category totals
            const cat = t.category || 'General';
            if (!categoryMap[cat]) {
                categoryMap[cat] = { count: 0, volume: 0 };
            }
            categoryMap[cat].count += 1;
            categoryMap[cat].volume += amt;
            // Vendor totals
            const vId = t.vendor_id;
            const vName = t.vendor?.name || 'Unknown';
            if (!vendorMap[vId]) {
                vendorMap[vId] = { name: vName, volume: 0 };
            }
            vendorMap[vId].volume += amt;
            // Daily totals
            const d = t.transaction_date;
            if (!dailyMap[d]) {
                dailyMap[d] = { inflow: 0, outflow: 0, count: 0 };
            }
            dailyMap[d].count += 1;
            if (isIncoming) {
                dailyMap[d].inflow += amt;
            }
            else {
                dailyMap[d].outflow += amt;
            }
            // Monthly trend
            const m = d.substring(0, 7); // YYYY-MM
            if (!monthlyMap[m]) {
                monthlyMap[m] = { amount: 0, count: 0 };
            }
            monthlyMap[m].amount += amt;
            monthlyMap[m].count += 1;
            // Recurring pattern tracking
            if (!vendorAmountMap[vId]) {
                vendorAmountMap[vId] = [];
            }
            vendorAmountMap[vId].push({ date: d, amount: amt });
        }
        const averageTransaction = totalCount > 0 ? Number((totalVolume / totalCount).toFixed(2)) : 0;
        const netCashflow = Number((incomingAmount - outgoingAmount).toFixed(2));
        // Format category totals
        const categoryTotals = Object.entries(categoryMap)
            .map(([category, info]) => ({
            category,
            count: info.count,
            totalAmount: Number(info.volume.toFixed(2)),
            percentage: totalVolume > 0 ? Number(((info.volume / totalVolume) * 100).toFixed(1)) : 0
        }))
            .sort((a, b) => b.totalAmount - a.totalAmount);
        // Format vendor concentration (Top 5)
        const vendorConcentration = Object.entries(vendorMap)
            .map(([vendorId, info]) => ({
            vendorId,
            vendorName: info.name,
            totalAmount: Number(info.volume.toFixed(2)),
            percentage: totalVolume > 0 ? Number(((info.volume / totalVolume) * 100).toFixed(1)) : 0
        }))
            .sort((a, b) => b.totalAmount - a.totalAmount)
            .slice(0, 5);
        // Format daily totals sorted
        const dailyTotals = Object.entries(dailyMap)
            .map(([date, info]) => ({
            date,
            inflow: Number(info.inflow.toFixed(2)),
            outflow: Number(info.outflow.toFixed(2)),
            count: info.count
        }))
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(-30);
        // Format monthly trend sorted
        const monthlySpendingTrend = Object.entries(monthlyMap)
            .map(([month, info]) => ({
            month,
            amount: Number(info.amount.toFixed(2)),
            count: info.count
        }))
            .sort((a, b) => a.month.localeCompare(b.month));
        // Compute recurring patterns
        const recurringPatterns = [];
        for (const [vId, txList] of Object.entries(vendorAmountMap)) {
            if (txList.length >= 2) {
                txList.sort((a, b) => a.date.localeCompare(b.date));
                // Check for similar amount cadence
                const avgAmt = txList.reduce((s, x) => s + x.amount, 0) / txList.length;
                const allSimilar = txList.every(x => Math.abs(x.amount - avgAmt) / avgAmt < 0.1);
                if (allSimilar) {
                    const d1 = new Date(txList[0].date).getTime();
                    const d2 = new Date(txList[txList.length - 1].date).getTime();
                    const diffDays = Math.round((d2 - d1) / (1000 * 60 * 60 * 24 * (txList.length - 1)));
                    recurringPatterns.push({
                        vendorId: vId,
                        vendorName: vendorMap[vId]?.name || 'Unknown',
                        approximateAmount: Number(avgAmt.toFixed(2)),
                        frequencyDays: diffDays > 0 ? diffDays : 30,
                        occurrences: txList.length
                    });
                }
            }
        }
        return {
            totalCount,
            totalVolume: Number(totalVolume.toFixed(2)),
            incomingAmount: Number(incomingAmount.toFixed(2)),
            outgoingAmount: Number(outgoingAmount.toFixed(2)),
            netCashflow,
            averageTransaction,
            largestTransaction: largestTxn,
            statusBreakdown: statusMap,
            categoryTotals,
            vendorConcentration,
            dailyTotals,
            monthlySpendingTrend,
            recurringPatterns
        };
    }
}
