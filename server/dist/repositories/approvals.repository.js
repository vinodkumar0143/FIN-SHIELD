import { supabaseAdmin } from '../config/supabase.js';
export class ApprovalsRepository {
    client;
    constructor(client = supabaseAdmin) {
        this.client = client;
    }
    async findAll(limit = 50, offset = 0) {
        const { data, error } = await this.client
            .from('approvals')
            .select('*')
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        if (error)
            throw error;
        return data || [];
    }
    async findById(id) {
        const { data, error } = await this.client
            .from('approvals')
            .select('*')
            .eq('id', id)
            .single();
        if (error)
            return null;
        return data;
    }
    async findPending() {
        const { data, error } = await this.client
            .from('approvals')
            .select('*')
            .eq('status', 'PENDING')
            .order('amount', { ascending: false });
        if (error)
            throw error;
        return data || [];
    }
    async create(approval) {
        const { data, error } = await this.client
            .from('approvals')
            .insert(approval)
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
    async update(id, updates) {
        const { data, error } = await this.client
            .from('approvals')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
}
