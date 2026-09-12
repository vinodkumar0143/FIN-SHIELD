import { supabaseAdmin } from '../config/supabase.js';
export class TransactionsRepository {
    client;
    constructor(client = supabaseAdmin) {
        this.client = client;
    }
    async findAll(limit = 50, offset = 0) {
        const { data, error } = await this.client
            .from('transactions')
            .select('*')
            .order('transaction_date', { ascending: false })
            .range(offset, offset + limit - 1);
        if (error)
            throw error;
        return data || [];
    }
    async findById(id) {
        const { data, error } = await this.client
            .from('transactions')
            .select('*')
            .eq('id', id)
            .single();
        if (error)
            return null;
        return data;
    }
    async findByVendor(vendorId) {
        const { data, error } = await this.client
            .from('transactions')
            .select('*')
            .eq('vendor_id', vendorId)
            .order('transaction_date', { ascending: false });
        if (error)
            throw error;
        return data || [];
    }
    async findAnomalies() {
        const { data, error } = await this.client
            .from('transactions')
            .select('*')
            .eq('anomaly_flag', true)
            .order('risk_score', { ascending: false });
        if (error)
            throw error;
        return data || [];
    }
    async create(transaction) {
        const { data, error } = await this.client
            .from('transactions')
            .insert(transaction)
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
}
