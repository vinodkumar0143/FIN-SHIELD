import { supabaseAdmin } from '../config/supabase.js';
export class PurchaseOrdersRepository {
    client;
    constructor(client = supabaseAdmin) {
        this.client = client;
    }
    async findAll(limit = 50, offset = 0) {
        const { data, error } = await this.client
            .from('purchase_orders')
            .select('*')
            .order('order_date', { ascending: false })
            .range(offset, offset + limit - 1);
        if (error)
            throw error;
        return data || [];
    }
    async findById(id) {
        const { data, error } = await this.client
            .from('purchase_orders')
            .select('*')
            .eq('id', id)
            .single();
        if (error)
            return null;
        return data;
    }
    async findByPoNumber(poNumber) {
        const { data, error } = await this.client
            .from('purchase_orders')
            .select('*')
            .ilike('po_number', poNumber.trim())
            .maybeSingle();
        if (error)
            return null;
        return data;
    }
    async findByVendorId(vendorId) {
        const { data, error } = await this.client
            .from('purchase_orders')
            .select('*')
            .eq('vendor_id', vendorId)
            .order('order_date', { ascending: false });
        if (error)
            throw error;
        return data || [];
    }
    async findItems(purchaseOrderId) {
        const { data, error } = await this.client
            .from('purchase_order_items')
            .select('*')
            .eq('purchase_order_id', purchaseOrderId);
        if (error)
            throw error;
        return data || [];
    }
    async create(po, items) {
        const { data: poData, error: poError } = await this.client
            .from('purchase_orders')
            .insert(po)
            .select()
            .single();
        if (poError)
            throw poError;
        let insertedItems = [];
        if (items && items.length > 0) {
            const itemsToInsert = items.map(item => ({
                ...item,
                purchase_order_id: poData.id
            }));
            const { data: itemData, error: itemError } = await this.client
                .from('purchase_order_items')
                .insert(itemsToInsert)
                .select();
            if (itemError)
                throw itemError;
            insertedItems = itemData || [];
        }
        return { po: poData, items: insertedItems };
    }
}
