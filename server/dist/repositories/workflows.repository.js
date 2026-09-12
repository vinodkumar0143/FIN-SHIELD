import { supabaseAdmin } from '../config/supabase.js';
export class WorkflowsRepository {
    client;
    constructor(client = supabaseAdmin) {
        this.client = client;
    }
    async findAll(limit = 50, offset = 0) {
        const { data, error } = await this.client
            .from('workflow_tasks')
            .select('*')
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        if (error)
            throw error;
        return data || [];
    }
    async findByTaskId(taskId) {
        const { data, error } = await this.client
            .from('workflow_tasks')
            .select('*')
            .eq('task_id', taskId)
            .single();
        if (error)
            return null;
        return data;
    }
    async findActivePaymentHolds() {
        const { data, error } = await this.client
            .from('workflow_tasks')
            .select('*')
            .eq('workflow_type', 'PAYMENT_HOLD')
            .eq('status', 'ACTIVE')
            .order('priority', { ascending: false });
        if (error)
            throw error;
        return data || [];
    }
    async create(task) {
        const { data, error } = await this.client
            .from('workflow_tasks')
            .insert(task)
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
    async update(id, updates) {
        const { data, error } = await this.client
            .from('workflow_tasks')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
}
