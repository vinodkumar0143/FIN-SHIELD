import { useState, useRef } from 'react'
import {
  Upload,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Eye,
  ArrowLeft,
  Save,
  Sparkles
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { apiClient } from '@/services/apiClient'
import { toast } from 'sonner'

interface InvoiceUploadPageProps {
  onNavigate: (path: string) => void
}

export function InvoiceUploadPage({ onNavigate }: InvoiceUploadPageProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadResult, setUploadResult] = useState<any | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Editable form state after extraction
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    vendorId: '',
    vendorName: '',
    amount: 0,
    tax: 0,
    invoiceDate: '',
    dueDate: '',
    poNumber: '',
    currency: 'INR'
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      processFile(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      processFile(file)
    }
  }

  const processFile = async (file: File) => {
    if (file.size > 15 * 1024 * 1024) {
      toast.error('File size exceeds maximum permitted limit of 15MB')
      return
    }

    setSelectedFile(file)
    setIsUploading(true)
    setUploadResult(null)

    const form = new FormData()
    form.append('file', file)

    try {
      toast.info('Uploading document to private Supabase Storage...')
      const result = await apiClient.upload<any>('/api/invoices/upload', form)
      setUploadResult(result)

      // Pre-fill editable form with extracted fields
      const ext = result.extraction
      setFormData({
        invoiceNumber: ext.invoiceNumber.value,
        vendorId: ext.vendorId.value || '',
        vendorName: ext.vendorName.value,
        amount: ext.total.value,
        tax: ext.tax.value,
        invoiceDate: ext.invoiceDate.value,
        dueDate: ext.dueDate.value,
        poNumber: ext.poNumber.value || '',
        currency: ext.currency.value
      })

      toast.success('Document uploaded and metadata parsed successfully!')
    } catch (err: any) {
      console.error('[UPLOAD ERROR]', err)
      toast.error(err.message || 'Failed to upload and parse document')
    } finally {
      setIsUploading(false)
    }
  }

  const handleLoadSample = async () => {
    // Generate sample mock file
    const sampleContent = 'INVOICE NO: INV-2026-9488\nVENDOR: Acme Industrial Corporation\nAMOUNT: 1840000.00\nPO: PO-2026-0901\nDATE: 2026-09-12'
    const blob = new Blob([sampleContent], { type: 'application/pdf' })
    const sampleFile = new File([blob], 'acme_industrial_inv_9488.pdf', { type: 'application/pdf' })
    await processFile(sampleFile)
  }

  const handleSaveInvoice = async () => {
    if (!formData.invoiceNumber || !formData.vendorId || !formData.amount) {
      toast.error('Invoice Number, Vendor, and Amount are required.')
      return
    }

    setIsSaving(true)
    try {
      const res = await apiClient.post<any>('/api/invoices', {
        invoiceNumber: formData.invoiceNumber,
        vendorId: formData.vendorId,
        amount: formData.amount,
        tax: formData.tax,
        currency: formData.currency,
        invoiceDate: formData.invoiceDate,
        dueDate: formData.dueDate,
        documentPath: uploadResult?.storagePath,
        lineItems: uploadResult?.extraction?.lineItems || []
      })

      toast.success(`Invoice ${formData.invoiceNumber} registered in Supabase ledger!`)
      if (res.invoice?.id) {
        onNavigate(`/invoices/${res.invoice.id}`)
      } else {
        onNavigate('/invoices')
      }
    } catch (err: any) {
      console.error('[SAVE INVOICE ERROR]', err)
      toast.error(err.message || 'Failed to register invoice')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('/invoices')}
          className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Invoices</span>
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLoadSample}
            disabled={isUploading || isSaving}
            className="gap-1.5 text-xs border-cyan-500/30 text-cyan-400"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Quick Load Sample Document
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Ingest & Validate Invoice Document
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Store documents to private Supabase Storage, run OCR extraction, and perform deterministic 3-way matching.
          </p>
        </div>

        {/* Drag & Drop Upload Card */}
        <Card
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="p-10 border-2 border-dashed border-border/80 hover:border-cyan-500/60 transition-all cursor-pointer bg-card/40 backdrop-blur-sm text-center group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="mx-auto w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
            {isUploading ? (
              <RefreshCw className="w-8 h-8 animate-spin" />
            ) : (
              <Upload className="w-8 h-8" />
            )}
          </div>

          <h3 className="mt-4 text-base font-semibold text-foreground">
            {selectedFile ? selectedFile.name : 'Drop invoice document here or click to browse'}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Supports PDF, PNG, JPG / JPEG up to 15MB. Encrypted and stored in private Supabase Storage.
          </p>

          {isUploading && (
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-cyan-400">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Parsing metadata & verifying GST/Tax totals...</span>
            </div>
          )}
        </Card>

        {/* Extracted Data & Verification Form */}
        {uploadResult && (
          <Card className="p-6 border border-border/80 bg-card/60 backdrop-blur-md space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">Extracted Invoice Metadata</h3>
                  <p className="text-xs text-muted-foreground">Review and adjust fields before committing to database ledger</p>
                </div>
              </div>

              {uploadResult.signedUrl && (
                <a
                  href={uploadResult.signedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Uploaded File
                </a>
              )}
            </div>

            {/* Pre-Match Warnings if any */}
            {uploadResult.duplicateCheck?.duplicateStatus === 'CONFIRMED_DUPLICATE' && (
              <div className="p-3.5 rounded-lg bg-rose-950/20 border border-rose-500/40 text-xs text-rose-300 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Potential Duplicate Warning:</span>
                  <span>An invoice with identical number or amount already exists for this vendor account.</span>
                </div>
              </div>
            )}

            {/* Editable Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-muted-foreground font-medium">Invoice Number</label>
                <input
                  type="text"
                  value={formData.invoiceNumber}
                  onChange={e => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                  className="w-full px-3 py-2 rounded-md bg-secondary/50 border border-border/80 text-foreground font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-muted-foreground font-medium">Vendor Name</label>
                <input
                  type="text"
                  value={formData.vendorName}
                  onChange={e => setFormData(prev => ({ ...prev, vendorName: e.target.value }))}
                  className="w-full px-3 py-2 rounded-md bg-secondary/50 border border-border/80 text-foreground focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-muted-foreground font-medium">Total Amount (₹)</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={e => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 rounded-md bg-secondary/50 border border-border/80 text-foreground font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-muted-foreground font-medium">Tax / GST (₹)</label>
                <input
                  type="number"
                  value={formData.tax}
                  onChange={e => setFormData(prev => ({ ...prev, tax: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 rounded-md bg-secondary/50 border border-border/80 text-foreground font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-muted-foreground font-medium">Invoice Date</label>
                <input
                  type="date"
                  value={formData.invoiceDate}
                  onChange={e => setFormData(prev => ({ ...prev, invoiceDate: e.target.value }))}
                  className="w-full px-3 py-2 rounded-md bg-secondary/50 border border-border/80 text-foreground font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-muted-foreground font-medium">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={e => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full px-3 py-2 rounded-md bg-secondary/50 border border-border/80 text-foreground font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Action Save Button */}
            <div className="pt-4 border-t border-border/60 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUploadResult(null)}
                disabled={isSaving}
              >
                Cancel
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveInvoice}
                disabled={isSaving}
                className="gap-2 shadow-lg shadow-cyan-500/20"
              >
                {isSaving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Commit to Supabase Ledger
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
