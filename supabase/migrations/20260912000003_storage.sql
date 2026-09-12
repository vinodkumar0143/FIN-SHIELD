-- ==============================================================================
-- FIN-SHIELD — Autonomous Financial Risk & Operations Intelligence Platform
-- Migration: 20260912000003_storage.sql
-- Description: Private Supabase Storage Buckets & Storage Security Policies
-- ==============================================================================

-- 1. Create Private Storage Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('invoice-documents', 'invoice-documents', false, 20971520, ARRAY['application/pdf', 'image/png', 'image/jpeg']),
    ('investigation-reports', 'investigation-reports', false, 52428800, ARRAY['application/pdf', 'application/json'])
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Storage Policies for `invoice-documents`
-- Only authenticated finance members or document owner can read invoice documents
DROP POLICY IF EXISTS "invoice_documents_select_policy" ON storage.objects;
CREATE POLICY "invoice_documents_select_policy"
ON storage.objects FOR SELECT TO authenticated
USING (
    bucket_id = 'invoice-documents' 
    AND (
        public.is_finance_member() 
        OR (auth.uid()::text = (storage.foldername(name))[1])
    )
);

-- Authenticated users can upload to invoice-documents
DROP POLICY IF EXISTS "invoice_documents_insert_policy" ON storage.objects;
CREATE POLICY "invoice_documents_insert_policy"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'invoice-documents'
);

-- Only Finance Managers can delete invoice documents
DROP POLICY IF EXISTS "invoice_documents_delete_policy" ON storage.objects;
CREATE POLICY "invoice_documents_delete_policy"
ON storage.objects FOR DELETE TO authenticated
USING (
    bucket_id = 'invoice-documents' 
    AND public.is_finance_manager()
);

-- 3. Storage Policies for `investigation-reports`
DROP POLICY IF EXISTS "investigation_reports_select_policy" ON storage.objects;
CREATE POLICY "investigation_reports_select_policy"
ON storage.objects FOR SELECT TO authenticated
USING (
    bucket_id = 'investigation-reports' 
    AND public.is_finance_member()
);

DROP POLICY IF EXISTS "investigation_reports_insert_policy" ON storage.objects;
CREATE POLICY "investigation_reports_insert_policy"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'investigation-reports' 
    AND public.is_finance_member()
);
