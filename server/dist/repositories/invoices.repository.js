import { supabaseAdmin } from '../config/supabase.js';
export class InvoicesRepository {
    client;
    constructor(client = supabaseAdmin) {
        this.client = client;
    }
    async findAll(limit = 50, offset = 0) {
        const { data, error } = await this.client
            .from('invoices')
            .select('*')
            .order('invoice_date', { ascending: false })
            .range(offset, offset + limit - 1);
        if (error)
            throw error;
        return data || [];
    }
    async findFiltered(options) {
        const limit = options.limit || 50;
        const offset = options.offset || 0;
        const sortBy = options.sortBy || 'invoice_date';
        const sortOrder = options.sortOrder || 'desc';
        let query = this.client
            .from('invoices')
            .select('*, vendor:vendors(*), purchase_order:purchase_orders(*)', { count: 'exact' });
        if (options.status && options.status !== 'ALL') {
            if (options.status === 'FLAGGED') {
                query = query.in('status', ['FLAGGED', 'UNDER_REVIEW', 'ON_HOLD']);
            }
            else {
                query = query.eq('status', options.status);
            }
        }
        if (options.vendorId) {
            query = query.eq('vendor_id', options.vendorId);
        }
        if (options.paymentStatus) {
            query = query.eq('payment_status', options.paymentStatus);
        }
        if (options.duplicateStatus) {
            query = query.eq('duplicate_status', options.duplicateStatus);
        }
        if (options.fromDate) {
            query = query.gte('invoice_date', options.fromDate);
        }
        if (options.toDate) {
            query = query.lte('invoice_date', options.toDate);
        }
        if (options.minAmount !== undefined) {
            query = query.gte('amount', options.minAmount);
        }
        if (options.maxAmount !== undefined) {
            query = query.lte('amount', options.maxAmount);
        }
        if (options.search && options.search.trim()) {
            const s = options.search.trim();
            query = query.ilike('invoice_number', `%${s}%`);
        }
        query = query
            .order(sortBy, { ascending: sortOrder === 'asc' })
            .range(offset, offset + limit - 1);
        const { data, count, error } = await query;
        if (error)
            throw error;
        // Fetch line items for returned invoices
        const invoiceIds = (data || []).map(i => i.id);
        let lineItemsByInvoice = {};
        if (invoiceIds.length > 0) {
            const { data: lineItems } = await this.client
                .from('invoice_line_items')
                .select('*')
                .in('invoice_id', invoiceIds);
            if (lineItems) {
                lineItems.forEach(item => {
                    if (!lineItemsByInvoice[item.invoice_id]) {
                        lineItemsByInvoice[item.invoice_id] = [];
                    }
                    lineItemsByInvoice[item.invoice_id].push(item);
                });
            }
        }
        const detailedInvoices = (data || []).map((inv) => ({
            ...inv,
            line_items: lineItemsByInvoice[inv.id] || []
        }));
        return {
            data: detailedInvoices,
            total: count || 0
        };
    }
    async findById(id) {
        const { data, error } = await this.client
            .from('invoices')
            .select('*')
            .eq('id', id)
            .maybeSingle();
        if (error)
            return null;
        return data;
    }
    async findByIdWithDetails(id) {
        const { data: invoice, error } = await this.client
            .from('invoices')
            .select('*, vendor:vendors(*), purchase_order:purchase_orders(*)')
            .eq('id', id)
            .maybeSingle();
        if (error || !invoice)
            return null;
        const lineItems = await this.findLineItems(id);
        // Also fetch any transactions referencing this invoice
        const { data: transactions } = await this.client
            .from('transactions')
            .select('*')
            .eq('invoice_id', id)
            .order('transaction_date', { ascending: false });
        return {
            ...invoice,
            line_items: lineItems,
            transactions: transactions || []
        };
    }
    async findByInvoiceNumber(invoiceNumber) {
        const { data, error } = await this.client
            .from('invoices')
            .select('*')
            .ilike('invoice_number', invoiceNumber.trim())
            .maybeSingle();
        if (error)
            return null;
        return data;
    }
    async findLineItems(invoiceId) {
        const { data, error } = await this.client
            .from('invoice_line_items')
            .select('*')
            .eq('invoice_id', invoiceId);
        if (error)
            throw error;
        return data || [];
    }
    async create(invoice) {
        const { data, error } = await this.client
            .from('invoices')
            .insert(invoice)
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
    async createWithLineItems(invoice, lineItems) {
        const { data: newInvoice, error: invError } = await this.client
            .from('invoices')
            .insert(invoice)
            .select('*, vendor:vendors(*), purchase_order:purchase_orders(*)')
            .single();
        if (invError)
            throw invError;
        let insertedItems = [];
        if (lineItems && lineItems.length > 0) {
            const itemsToInsert = lineItems.map(item => ({
                ...item,
                invoice_id: newInvoice.id
            }));
            const { data: itemData, error: itemError } = await this.client
                .from('invoice_line_items')
                .insert(itemsToInsert)
                .select();
            if (itemError)
                throw itemError;
            insertedItems = itemData || [];
        }
        return {
            ...newInvoice,
            line_items: insertedItems
        };
    }
    async update(id, updates) {
        const { data, error } = await this.client
            .from('invoices')
            .update({
            ...updates,
            updated_at: new Date().toISOString()
        })
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
    async delete(id) {
        // Delete line items first
        await this.client
            .from('invoice_line_items')
            .delete()
            .eq('invoice_id', id);
        // Delete invoice
        const { error } = await this.client
            .from('invoices')
            .delete()
            .eq('id', id);
        if (error)
            throw error;
    }
}
