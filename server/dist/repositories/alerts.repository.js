import { supabaseAdmin } from '../config/supabase.js';
export class AlertsRepository {
    client;
    constructor(client = supabaseAdmin) {
        this.client = client;
    }
    async findAll(limit = 50, offset = 0) {
        const { data, error } = await this.client
            .from('alerts')
            .select('*')
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        if (error)
            throw error;
        return data || [];
    }
    async findActive() {
        const { data, error } = await this.client
            .from('alerts')
            .select('*')
            .eq('status', 'ACTIVE')
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        return data || [];
    }
    async create(alert) {
        const { data, error } = await this.client
            .from('alerts')
            .insert(alert)
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
    async markAsRead(id) {
        const { data, error } = await this.client
            .from('alerts')
            .update({ read_state: true })
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
    async resolve(id) {
        const { data, error } = await this.client
            .from('alerts')
            .update({ status: 'RESOLVED', resolved_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
}
