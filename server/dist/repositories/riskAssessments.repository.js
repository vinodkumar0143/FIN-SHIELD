import { supabaseAdmin } from '../config/supabase.js';
export class RiskAssessmentsRepository {
    client;
    constructor(client = supabaseAdmin) {
        this.client = client;
    }
    async findByEntity(entityType, entityId) {
        const { data, error } = await this.client
            .from('risk_assessments')
            .select('*')
            .eq('entity_type', entityType)
            .eq('entity_id', entityId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
        if (error)
            return null;
        return data;
    }
    async create(assessment) {
        const { data, error } = await this.client
            .from('risk_assessments')
            .insert(assessment)
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
}
