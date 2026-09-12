import { supabaseAdmin } from '../config/supabase.js';
export class AuditLogsRepository {
    client;
    constructor(client = supabaseAdmin) {
        this.client = client;
    }
    async findAll(limit = 100, offset = 0) {
        const { data, error } = await this.client
            .from('audit_logs')
            .select('*')
            .order('timestamp', { ascending: false })
            .range(offset, offset + limit - 1);
        if (error)
            throw error;
        return data || [];
    }
    async findByEntity(entityType, entityId) {
        const { data, error } = await this.client
            .from('audit_logs')
            .select('*')
            .eq('entity_type', entityType)
            .eq('entity_id', entityId)
            .order('timestamp', { ascending: false });
        if (error)
            throw error;
        return data || [];
    }
    /**
     * Append-only ledger recording.
     * Modifying or deleting audit records is forbidden by PostgreSQL RLS.
     */
    async record(entry) {
        const { data, error } = await this.client
            .from('audit_logs')
            .insert(entry)
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
}
