import { supabaseAdmin } from '../config/supabase.js';
export class VendorsRepository {
    client;
    constructor(client = supabaseAdmin) {
        this.client = client;
    }
    async findAll(limit = 50, offset = 0) {
        const { data, error } = await this.client
            .from('vendors')
            .select('*')
            .order('risk_score', { ascending: false })
            .range(offset, offset + limit - 1);
        if (error)
            throw error;
        return data || [];
    }
    async findById(id) {
        const { data, error } = await this.client
            .from('vendors')
            .select('*')
            .eq('id', id)
            .single();
        if (error)
            return null;
        return data;
    }
    async findByRiskLevel(riskLevel) {
        const { data, error } = await this.client
            .from('vendors')
            .select('*')
            .eq('risk_level', riskLevel)
            .order('total_exposure', { ascending: false });
        if (error)
            throw error;
        return data || [];
    }
    async create(vendor) {
        const { data, error } = await this.client
            .from('vendors')
            .insert(vendor)
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
    async update(id, updates) {
        const { data, error } = await this.client
            .from('vendors')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
}
