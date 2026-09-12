import { supabaseAdmin } from '../config/supabase.js';
export class InvestigationsRepository {
    client;
    constructor(client = supabaseAdmin) {
        this.client = client;
    }
    async findAll(limit = 50, offset = 0) {
        const { data, error } = await this.client
            .from('investigations')
            .select('*')
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        if (error)
            throw error;
        return data || [];
    }
    async findById(id) {
        const { data, error } = await this.client
            .from('investigations')
            .select('*')
            .eq('id', id)
            .single();
        if (error)
            return null;
        return data;
    }
    async findByInvestigationId(investigationId) {
        const { data, error } = await this.client
            .from('investigations')
            .select('*')
            .eq('investigation_id', investigationId)
            .single();
        if (error)
            return null;
        return data;
    }
    async findEvidence(investigationId) {
        const { data, error } = await this.client
            .from('investigation_evidence')
            .select('*')
            .eq('investigation_id', investigationId)
            .order('risk_contribution', { ascending: false });
        if (error)
            throw error;
        return data || [];
    }
    async addEvidence(evidence) {
        const { data, error } = await this.client
            .from('investigation_evidence')
            .insert(evidence)
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
    async create(investigation) {
        const { data, error } = await this.client
            .from('investigations')
            .insert(investigation)
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
    async update(id, updates) {
        const { data, error } = await this.client
            .from('investigations')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
}
