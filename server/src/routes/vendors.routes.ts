import { Router, Response } from 'express'
import { VendorsRepository } from '../repositories/vendors.repository.js'
import { VendorIntelligenceService } from '../services/vendorIntelligence.service.js'
import { supabaseAdmin } from '../config/supabase.js'
import {
  requireAuth,
  requirePermission,
  type AuthenticatedRequest
} from '../middleware/auth.middleware.js'

export function createVendorsRouter(): Router {
  const router = Router()
  const vendorsRepo = new VendorsRepository()
  const intelligenceService = new VendorIntelligenceService()

  // 1. List Vendors with Search, Filtering, Pagination
  router.get('/', requireAuth, requirePermission('vendors.view'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1
      const pageSize = parseInt(req.query.pageSize as string) || 50
      const offset = (page - 1) * pageSize

      let query = supabaseAdmin
        .from('vendors')
        .select('*', { count: 'exact' })

      if (req.query.search) {
        const s = (req.query.search as string).trim()
        query = query.or(`name.ilike.%${s}%,category.ilike.%${s}%,tax_id.ilike.%${s}%`)
      }

      if (req.query.riskLevel) {
        query = query.eq('risk_level', req.query.riskLevel as any)
      }

      if (req.query.category) {
        query = query.eq('category', req.query.category as string)
      }

      if (req.query.status) {
        query = query.eq('status', req.query.status as any)
      }

      const sortBy = (req.query.sortBy as string) || 'total_exposure'
      const sortOrder = req.query.sortOrder === 'asc' ? true : false

      query = query
        .order(sortBy, { ascending: sortOrder })
        .range(offset, offset + pageSize - 1)

      const { data, count, error } = await query

      if (error) throw error

      res.json({
        success: true,
        data: {
          vendors: data || [],
          total: count || 0,
          page,
          pageSize,
          totalPages: Math.ceil((count || 0) / pageSize) || 1
        }
      })
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'VENDORS_FETCH_ERROR', message: err.message }
      })
    }
  })

  // 2. Vendor Intelligence Profile by ID
  router.get('/:id', requireAuth, requirePermission('vendors.view'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const data = await intelligenceService.getVendorIntelligence(req.params.id as string)
      if (!data) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Vendor record not found' }
        })
        return
      }

      res.json({
        success: true,
        data
      })
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'VENDOR_INTELLIGENCE_ERROR', message: err.message }
      })
    }
  })

  return router
}
