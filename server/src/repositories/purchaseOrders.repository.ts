import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/database.types.js'
import { supabaseAdmin } from '../config/supabase.js'

export type PurchaseOrderRow = Database['public']['Tables']['purchase_orders']['Row']
export type PurchaseOrderInsert = Database['public']['Tables']['purchase_orders']['Insert']
export type PurchaseOrderUpdate = Database['public']['Tables']['purchase_orders']['Update']
export type PurchaseOrderItemRow = Database['public']['Tables']['purchase_order_items']['Row']
export type PurchaseOrderItemInsert = Database['public']['Tables']['purchase_order_items']['Insert']

export class PurchaseOrdersRepository {
  constructor(private client: SupabaseClient<Database> = supabaseAdmin) {}

  async findAll(limit: number = 50, offset: number = 0): Promise<PurchaseOrderRow[]> {
    const { data, error } = await this.client
      .from('purchase_orders')
      .select('*')
      .order('order_date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return data || []
  }

  async findById(id: string): Promise<PurchaseOrderRow | null> {
    const { data, error } = await this.client
      .from('purchase_orders')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return null
    return data
  }

  async findByPoNumber(poNumber: string): Promise<PurchaseOrderRow | null> {
    const { data, error } = await this.client
      .from('purchase_orders')
      .select('*')
      .ilike('po_number', poNumber.trim())
      .maybeSingle()

    if (error) return null
    return data
  }

  async findByVendorId(vendorId: string): Promise<PurchaseOrderRow[]> {
    const { data, error } = await this.client
      .from('purchase_orders')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('order_date', { ascending: false })

    if (error) throw error
    return data || []
  }

  async findItems(purchaseOrderId: string): Promise<PurchaseOrderItemRow[]> {
    const { data, error } = await this.client
      .from('purchase_order_items')
      .select('*')
      .eq('purchase_order_id', purchaseOrderId)

    if (error) throw error
    return data || []
  }

  async create(po: PurchaseOrderInsert, items?: PurchaseOrderItemInsert[]): Promise<{ po: PurchaseOrderRow; items: PurchaseOrderItemRow[] }> {
    const { data: poData, error: poError } = await this.client
      .from('purchase_orders')
      .insert(po)
      .select()
      .single()

    if (poError) throw poError

    let insertedItems: PurchaseOrderItemRow[] = []
    if (items && items.length > 0) {
      const itemsToInsert = items.map(item => ({
        ...item,
        purchase_order_id: poData.id
      }))

      const { data: itemData, error: itemError } = await this.client
        .from('purchase_order_items')
        .insert(itemsToInsert)
        .select()

      if (itemError) throw itemError
      insertedItems = itemData || []
    }

    return { po: poData, items: insertedItems }
  }
}
