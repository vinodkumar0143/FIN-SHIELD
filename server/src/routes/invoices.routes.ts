import { Router, Response } from 'express'
import multer from 'multer'
import { randomUUID } from 'crypto'
import { InvoicesRepository } from '../repositories/invoices.repository.js'
import { AuditLogsRepository } from '../repositories/auditLogs.repository.js'
import { PoMatchingService } from '../services/poMatching.service.js'
import { DuplicateDetectionService } from '../services/duplicateDetection.service.js'
import { InvoiceExtractionService } from '../services/invoiceExtraction.service.js'
import { supabaseAdmin } from '../config/supabase.js'
import {
  requireAuth,
  requirePermission,
  type AuthenticatedRequest
} from '../middleware/auth.middleware.js'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024 // 15MB limit
  },
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']
    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only PDF, PNG, and JPEG documents are permitted.'))
    }
  }
})

export function createInvoicesRouter(): Router {
  const router = Router()
  const invoicesRepo = new InvoicesRepository()
  const auditLogsRepo = new AuditLogsRepository()
  const poMatchingService = new PoMatchingService()
  const duplicateDetectionService = new DuplicateDetectionService()
  const extractionService = new InvoiceExtractionService()

  // 1. List Invoices with Search, Filters, Sorting, Pagination
  router.get('/', requireAuth, requirePermission('invoices.view'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1
      const pageSize = parseInt(req.query.pageSize as string) || 50
      const offset = (page - 1) * pageSize

      const result = await invoicesRepo.findFiltered({
        search: req.query.search as string,
        status: req.query.status as string,
        vendorId: req.query.vendorId as string,
        fromDate: req.query.fromDate as string,
        toDate: req.query.toDate as string,
        minAmount: req.query.minAmount ? parseFloat(req.query.minAmount as string) : undefined,
        maxAmount: req.query.maxAmount ? parseFloat(req.query.maxAmount as string) : undefined,
        paymentStatus: req.query.paymentStatus as string,
        duplicateStatus: req.query.duplicateStatus as string,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as any,
        limit: pageSize,
        offset
      })

      const totalPages = Math.ceil(result.total / pageSize) || 1

      res.json({
        success: true,
        data: {
          invoices: result.data,
          total: result.total,
          page,
          pageSize,
          totalPages
        }
      })
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'INVOICES_FETCH_ERROR', message: err.message }
      })
    }
  })

  // 2. Upload Document + Extract + Validate
  router.post('/upload', requireAuth, requirePermission('invoices.create'), upload.single('file'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: { code: 'NO_FILE_PROVIDED', message: 'Please attach a document file (PDF or Image)' }
        })
        return
      }

      const file = req.file
      const tempId = randomUUID()
      const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')
      const storagePath = `invoices/${tempId}/${sanitizedFilename}`

      // 1. Upload to Supabase Storage bucket
      const { error: uploadError } = await supabaseAdmin.storage
        .from('invoice-documents')
        .upload(storagePath, file.buffer, {
          contentType: file.mimetype,
          upsert: true
        })

      if (uploadError) {
        console.error('[STORAGE UPLOAD ERROR]', uploadError)
      }

      // 2. Generate signed URL for document preview
      const { data: signedUrlData } = await supabaseAdmin.storage
        .from('invoice-documents')
        .createSignedUrl(storagePath, 3600)

      // 3. Extract & Validate Fields
      const extraction = await extractionService.extractAndValidate(file.buffer, sanitizedFilename)

      // 4. Pre-run PO matching & Duplicate checks if vendor identified
      let poMatch = null
      let duplicateCheck = null

      if (extraction.vendorId.value) {
        if (extraction.poNumber.value) {
          poMatch = await poMatchingService.matchInvoice({
            invoiceAmount: extraction.total.value,
            currency: extraction.currency.value,
            vendorId: extraction.vendorId.value,
            poNumber: extraction.poNumber.value,
            lineItems: extraction.lineItems
          })
        }

        duplicateCheck = await duplicateDetectionService.checkDuplicates({
          vendorId: extraction.vendorId.value,
          invoiceNumber: extraction.invoiceNumber.value,
          amount: extraction.total.value,
          invoiceDate: extraction.invoiceDate.value
        })
      }

      res.json({
        success: true,
        data: {
          storagePath,
          signedUrl: signedUrlData?.signedUrl || null,
          extraction,
          poMatch,
          duplicateCheck
        }
      })
    } catch (err: any) {
      console.error('[UPLOAD CONTROLLER ERROR]', err)
      res.status(500).json({
        success: false,
        error: { code: 'UPLOAD_PROCESSING_ERROR', message: err.message }
      })
    }
  })

  // 3. Get Single Invoice Detail with PO match, Duplicate check, and Signed URL
  router.get('/:id', requireAuth, requirePermission('invoices.view'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const invoiceId = req.params.id as string
      const invoice = await invoicesRepo.findByIdWithDetails(invoiceId)
      if (!invoice) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Invoice not found' }
        })
        return
      }

      // PO match computation
      let poMatch = null
      if (invoice.purchase_order_id || (invoice.purchase_order as any)?.po_number) {
        poMatch = await poMatchingService.matchInvoice({
          invoiceAmount: invoice.amount,
          currency: invoice.currency,
          vendorId: invoice.vendor_id,
          purchaseOrderId: invoice.purchase_order_id,
          lineItems: invoice.line_items
        })
      }

      // Duplicate check computation
      const duplicateDetection = await duplicateDetectionService.checkDuplicates({
        excludeInvoiceId: invoice.id,
        vendorId: invoice.vendor_id,
        invoiceNumber: invoice.invoice_number,
        amount: invoice.amount,
        invoiceDate: invoice.invoice_date,
        poId: invoice.purchase_order_id
      })

      // Generate signed URL if document path exists
      let signedDocumentUrl: string | null = null
      if (invoice.document_path) {
        const { data: signedData } = await supabaseAdmin.storage
          .from('invoice-documents')
          .createSignedUrl(invoice.document_path, 3600)
        signedDocumentUrl = signedData?.signedUrl || null
      }

      res.json({
        success: true,
        data: {
          invoice,
          poMatch,
          duplicateDetection,
          signedDocumentUrl
        }
      })
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'INVOICE_FETCH_ERROR', message: err.message }
      })
    }
  })

  // 4. Create Invoice (+ line items, duplicate check, PO match, audit log)
  router.post('/', requireAuth, requirePermission('invoices.create'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const {
        invoiceNumber,
        vendorId,
        purchaseOrderId,
        amount,
        tax,
        currency = 'INR',
        invoiceDate,
        dueDate,
        documentPath,
        lineItems = []
      } = req.body

      if (!invoiceNumber || !vendorId || amount === undefined || !invoiceDate || !dueDate) {
        res.status(400).json({
          success: false,
          error: { code: 'MISSING_REQUIRED_FIELDS', message: 'Invoice number, vendor, amount, invoice date, and due date are mandatory.' }
        })
        return
      }

      // 1. Run Duplicate check
      const duplicateResult = await duplicateDetectionService.checkDuplicates({
        vendorId,
        invoiceNumber,
        amount,
        invoiceDate,
        poId: purchaseOrderId
      })

      // 2. Run PO matching if PO provided
      let poMatchResult = null
      if (purchaseOrderId) {
        poMatchResult = await poMatchingService.matchInvoice({
          invoiceAmount: amount,
          currency,
          vendorId,
          purchaseOrderId,
          lineItems
        })
      }

      // Determine initial risk & status
      let initialStatus: any = 'VALIDATED'
      let initialRiskScore = 15
      let initialRiskLevel: any = 'LOW'

      if (duplicateResult.duplicateStatus === 'CONFIRMED_DUPLICATE') {
        initialStatus = 'FLAGGED'
        initialRiskScore = 85
        initialRiskLevel = 'HIGH'
      } else if (poMatchResult && poMatchResult.status === 'MISMATCH') {
        initialStatus = 'UNDER_REVIEW'
        initialRiskScore = 65
        initialRiskLevel = 'MEDIUM'
      }

      const createdInvoice = await invoicesRepo.createWithLineItems(
        {
          invoice_number: invoiceNumber.trim(),
          vendor_id: vendorId,
          purchase_order_id: purchaseOrderId || null,
          amount,
          tax: tax || 0,
          currency,
          invoice_date: invoiceDate,
          due_date: dueDate,
          status: initialStatus,
          payment_status: 'UNPAID',
          risk_score: initialRiskScore,
          risk_level: initialRiskLevel,
          anomaly_status: 'NONE',
          duplicate_status: duplicateResult.duplicateStatus,
          document_path: documentPath || null,
          submitted_by: req.user?.id || null
        },
        lineItems
      )

      // Record Audit Log
      await auditLogsRepo.record({
        user_id: req.user?.id || null,
        user_name: req.user?.profile?.full_name || req.user?.email || 'System Operator',
        user_role: req.user?.role || 'EMPLOYEE',
        action: 'INVOICE_CREATED',
        entity_type: 'invoice',
        entity_id: createdInvoice.id,
        source: 'FIN-SHIELD Engine',
        new_state: {
          invoice_number: createdInvoice.invoice_number,
          amount: createdInvoice.amount,
          vendor_id: createdInvoice.vendor_id,
          duplicate_status: duplicateResult.duplicateStatus
        }
      })

      res.status(201).json({
        success: true,
        data: {
          invoice: createdInvoice,
          duplicateResult,
          poMatchResult
        }
      })
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'INVOICE_CREATE_ERROR', message: err.message }
      })
    }
  })

  // 5. Update Invoice (e.g. status, payment_status, hold)
  router.patch('/:id', requireAuth, requirePermission('invoices.edit'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = req.params.id as string
      const existing = await invoicesRepo.findById(id)
      if (!existing) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Invoice not found' }
        })
        return
      }

      const allowedUpdates: any = {}
      if (req.body.status) allowedUpdates.status = req.body.status
      if (req.body.payment_status) allowedUpdates.payment_status = req.body.payment_status
      if (req.body.due_date) allowedUpdates.due_date = req.body.due_date
      if (req.body.amount !== undefined) allowedUpdates.amount = req.body.amount
      if (req.body.tax !== undefined) allowedUpdates.tax = req.body.tax

      const updated = await invoicesRepo.update(id, allowedUpdates)

      // Audit Log
      await auditLogsRepo.record({
        user_id: req.user?.id || null,
        user_name: req.user?.profile?.full_name || req.user?.email || 'System Operator',
        user_role: req.user?.role || 'EMPLOYEE',
        action: 'INVOICE_UPDATED',
        entity_type: 'invoice',
        entity_id: id,
        source: 'FIN-SHIELD Engine',
        previous_state: { status: existing.status, payment_status: existing.payment_status },
        new_state: { status: updated.status, payment_status: updated.payment_status }
      })

      res.json({
        success: true,
        data: updated
      })
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'INVOICE_UPDATE_ERROR', message: err.message }
      })
    }
  })

  // 6. Delete Invoice (requires invoices.delete)
  router.delete('/:id', requireAuth, requirePermission('invoices.delete'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = req.params.id as string
      const existing = await invoicesRepo.findById(id)
      if (!existing) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Invoice not found' }
        })
        return
      }

      await invoicesRepo.delete(id)

      await auditLogsRepo.record({
        user_id: req.user?.id || null,
        user_name: req.user?.profile?.full_name || req.user?.email || 'System Operator',
        user_role: req.user?.role || 'EMPLOYEE',
        action: 'INVOICE_DELETED',
        entity_type: 'invoice',
        entity_id: id,
        source: 'FIN-SHIELD Engine',
        previous_state: { invoice_number: existing.invoice_number, amount: existing.amount }
      })

      res.json({
        success: true,
        message: `Invoice ${existing.invoice_number} deleted successfully`
      })
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'INVOICE_DELETE_ERROR', message: err.message }
      })
    }
  })

  return router
}
