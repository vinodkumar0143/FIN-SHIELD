import { supabaseAdmin } from '../config/supabase.js';
export class BudgetsRepository {
    client;
    constructor(client = supabaseAdmin) {
        this.client = client;
    }
    async findAll() {
        const { data, error } = await this.client
            .from('budgets')
            .select('*')
            .order('allocated_amount', { ascending: false });
        if (error)
            throw error;
        return data || [];
    }
    async findById(id) {
        const { data, error } = await this.client
            .from('budgets')
            .select('*')
            .eq('id', id)
            .single();
        if (error)
            return null;
        return data;
    }
    async findByDepartment(department) {
        const { data, error } = await this.client
            .from('budgets')
            .select('*')
            .eq('department', department);
        if (error)
            throw error;
        return data || [];
    }
    async create(budget) {
        const { data, error } = await this.client
            .from('budgets')
            .insert(budget)
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
    async update(id, updates) {
        const { data, error } = await this.client
            .from('budgets')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
}
