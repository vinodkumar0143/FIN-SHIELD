import { supabase } from '@/lib/supabaseClient'
import type { RealtimeChannel } from '@supabase/supabase-js'

export type RealtimeTable =
  | 'invoices'
  | 'alerts'
  | 'investigations'
  | 'workflow_tasks'
  | 'approvals'
  | 'escalations'
  | 'audit_logs'
  | 'profiles'

export interface RealtimeChangeEvent<T = any> {
  table: RealtimeTable
  eventType: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
  new: T
  old: T
}

class RealtimeService {
  private channels: Map<string, RealtimeChannel> = new Map()
  private listenerCounts: Map<string, number> = new Map()

  /**
   * Subscribe to postgres_changes on a specific public table.
   * Returns an unsubscribe cleanup function.
   */
  subscribe<T = any>(
    table: RealtimeTable,
    callback: (event: RealtimeChangeEvent<T>) => void,
    channelName = `realtime-${table}`
  ): () => void {
    const currentCount = this.listenerCounts.get(channelName) || 0
    this.listenerCounts.set(channelName, currentCount + 1)

    let channel = this.channels.get(channelName)
    if (!channel) {
      channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes' as any,
          { event: '*', schema: 'public', table },
          (payload: any) => {
            callback({
              table,
              eventType: payload.eventType,
              new: payload.new,
              old: payload.old
            })
          }
        )
        .subscribe()

      this.channels.set(channelName, channel)
    }

    // Cleanup function on unmount
    return () => {
      const count = (this.listenerCounts.get(channelName) || 1) - 1
      this.listenerCounts.set(channelName, count)

      if (count <= 0) {
        const chan = this.channels.get(channelName)
        if (chan) {
          supabase.removeChannel(chan)
          this.channels.delete(channelName)
        }
        this.listenerCounts.delete(channelName)
      }
    }
  }

  /**
   * Global multi-table operations subscriber.
   */
  subscribeToOperations(
    callback: (event: RealtimeChangeEvent) => void
  ): () => void {
    const channelName = 'global-operations-stream'
    const currentCount = this.listenerCounts.get(channelName) || 0
    this.listenerCounts.set(channelName, currentCount + 1)

    let channel = this.channels.get(channelName)
    if (!channel) {
      channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes' as any,
          { event: '*', schema: 'public', table: 'workflow_tasks' },
          (p: any) => callback({ table: 'workflow_tasks', eventType: p.eventType, new: p.new, old: p.old })
        )
        .on(
          'postgres_changes' as any,
          { event: '*', schema: 'public', table: 'approvals' },
          (p: any) => callback({ table: 'approvals', eventType: p.eventType, new: p.new, old: p.old })
        )
        .on(
          'postgres_changes' as any,
          { event: '*', schema: 'public', table: 'escalations' },
          (p: any) => callback({ table: 'escalations', eventType: p.eventType, new: p.new, old: p.old })
        )
        .on(
          'postgres_changes' as any,
          { event: '*', schema: 'public', table: 'invoices' },
          (p: any) => callback({ table: 'invoices', eventType: p.eventType, new: p.new, old: p.old })
        )
        .on(
          'postgres_changes' as any,
          { event: '*', schema: 'public', table: 'alerts' },
          (p: any) => callback({ table: 'alerts', eventType: p.eventType, new: p.new, old: p.old })
        )
        .subscribe()

      this.channels.set(channelName, channel)
    }

    return () => {
      const count = (this.listenerCounts.get(channelName) || 1) - 1
      this.listenerCounts.set(channelName, count)

      if (count <= 0) {
        const chan = this.channels.get(channelName)
        if (chan) {
          supabase.removeChannel(chan)
          this.channels.delete(channelName)
        }
        this.listenerCounts.delete(channelName)
      }
    }
  }
}

export const realtimeService = new RealtimeService()
