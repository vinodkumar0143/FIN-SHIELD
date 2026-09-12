-- ==============================================================================
-- FIN-SHIELD — Autonomous Financial Risk & Operations Intelligence Platform
-- Migration: 20260912000002_rls_policies.sql
-- Description: Row Level Security (RLS) & Non-Recursive Role Access Policies
-- ==============================================================================

-- 1. Helper function to securely resolve current authenticated user's role
-- SECURITY DEFINER and strict search_path prevents infinite RLS recursion
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM public.profiles
    WHERE id = auth.uid();
    
    RETURN COALESCE(user_role, 'EMPLOYEE');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Helper function to check if current user is finance personnel (Admin, Manager, or Analyst)
CREATE OR REPLACE FUNCTION public.is_finance_member()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN public.get_user_role() IN ('ADMIN', 'FINANCE_MANAGER', 'FINANCE_ANALYST');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Helper function to check if current user is finance authority (Admin or Finance Manager)
CREATE OR REPLACE FUNCTION public.is_finance_manager()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN public.get_user_role() IN ('ADMIN', 'FINANCE_MANAGER');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ==============================================================================
-- 2. ENABLE RLS ON ALL 18 TABLES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investigations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investigation_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 3. PROFILES POLICIES
-- ==============================================================================
-- Authenticated users can read all active profiles (for mentions, assignees, team rosters)
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles
    FOR SELECT TO authenticated
    USING (true);

-- Users can update their own profile
DROP POLICY IF EXISTS "profiles_update_own_policy" ON public.profiles;
CREATE POLICY "profiles_update_own_policy" ON public.profiles
    FOR UPDATE TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Admins can update any profile
DROP POLICY IF EXISTS "profiles_admin_update_policy" ON public.profiles;
CREATE POLICY "profiles_admin_update_policy" ON public.profiles
    FOR ALL TO authenticated
    USING (public.get_user_role() = 'ADMIN');

-- ==============================================================================
-- 4. VENDORS POLICIES
-- ==============================================================================
-- All authenticated users can view vendors (needed for submission / reference)
DROP POLICY IF EXISTS "vendors_select_policy" ON public.vendors;
CREATE POLICY "vendors_select_policy" ON public.vendors
    FOR SELECT TO authenticated
    USING (true);

-- Finance managers and Admins can create/update vendors
DROP POLICY IF EXISTS "vendors_write_policy" ON public.vendors;
CREATE POLICY "vendors_write_policy" ON public.vendors
    FOR INSERT TO authenticated
    WITH CHECK (public.is_finance_manager());

DROP POLICY IF EXISTS "vendors_update_policy" ON public.vendors;
CREATE POLICY "vendors_update_policy" ON public.vendors
    FOR UPDATE TO authenticated
    USING (public.is_finance_manager())
    WITH CHECK (public.is_finance_manager());

-- ==============================================================================
-- 5. PURCHASE ORDERS & ITEMS POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "po_select_policy" ON public.purchase_orders;
CREATE POLICY "po_select_policy" ON public.purchase_orders
    FOR SELECT TO authenticated
    USING (public.is_finance_member() OR created_by = auth.uid());

DROP POLICY IF EXISTS "po_insert_policy" ON public.purchase_orders;
CREATE POLICY "po_insert_policy" ON public.purchase_orders
    FOR INSERT TO authenticated
    WITH CHECK (public.is_finance_member() OR created_by = auth.uid());

DROP POLICY IF EXISTS "po_update_policy" ON public.purchase_orders;
CREATE POLICY "po_update_policy" ON public.purchase_orders
    FOR UPDATE TO authenticated
    USING (public.is_finance_manager() OR created_by = auth.uid());

DROP POLICY IF EXISTS "po_items_select_policy" ON public.purchase_order_items;
CREATE POLICY "po_items_select_policy" ON public.purchase_order_items
    FOR SELECT TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.purchase_orders po
        WHERE po.id = purchase_order_items.purchase_order_id
        AND (public.is_finance_member() OR po.created_by = auth.uid())
    ));

DROP POLICY IF EXISTS "po_items_insert_policy" ON public.purchase_order_items;
CREATE POLICY "po_items_insert_policy" ON public.purchase_order_items
    FOR INSERT TO authenticated
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.purchase_orders po
        WHERE po.id = purchase_order_items.purchase_order_id
        AND (public.is_finance_member() OR po.created_by = auth.uid())
    ));

-- ==============================================================================
-- 6. INVOICES & LINE ITEMS POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "invoices_select_policy" ON public.invoices;
CREATE POLICY "invoices_select_policy" ON public.invoices
    FOR SELECT TO authenticated
    USING (public.is_finance_member() OR submitted_by = auth.uid());

DROP POLICY IF EXISTS "invoices_insert_policy" ON public.invoices;
CREATE POLICY "invoices_insert_policy" ON public.invoices
    FOR INSERT TO authenticated
    WITH CHECK (public.is_finance_member() OR submitted_by = auth.uid());

DROP POLICY IF EXISTS "invoices_update_policy" ON public.invoices;
CREATE POLICY "invoices_update_policy" ON public.invoices
    FOR UPDATE TO authenticated
    USING (public.is_finance_manager() OR (submitted_by = auth.uid() AND status = 'UPLOADED'));

DROP POLICY IF EXISTS "invoice_items_select_policy" ON public.invoice_line_items;
CREATE POLICY "invoice_items_select_policy" ON public.invoice_line_items
    FOR SELECT TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.invoices inv
        WHERE inv.id = invoice_line_items.invoice_id
        AND (public.is_finance_member() OR inv.submitted_by = auth.uid())
    ));

DROP POLICY IF EXISTS "invoice_items_insert_policy" ON public.invoice_line_items;
CREATE POLICY "invoice_items_insert_policy" ON public.invoice_line_items
    FOR INSERT TO authenticated
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.invoices inv
        WHERE inv.id = invoice_line_items.invoice_id
        AND (public.is_finance_member() OR inv.submitted_by = auth.uid())
    ));

-- ==============================================================================
-- 7. TRANSACTIONS POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "transactions_select_policy" ON public.transactions;
CREATE POLICY "transactions_select_policy" ON public.transactions
    FOR SELECT TO authenticated
    USING (public.is_finance_member());

DROP POLICY IF EXISTS "transactions_insert_policy" ON public.transactions;
CREATE POLICY "transactions_insert_policy" ON public.transactions
    FOR INSERT TO authenticated
    WITH CHECK (public.is_finance_manager());

DROP POLICY IF EXISTS "transactions_update_policy" ON public.transactions;
CREATE POLICY "transactions_update_policy" ON public.transactions
    FOR UPDATE TO authenticated
    USING (public.is_finance_manager());

-- ==============================================================================
-- 8. BUDGETS POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "budgets_select_policy" ON public.budgets;
CREATE POLICY "budgets_select_policy" ON public.budgets
    FOR SELECT TO authenticated
    USING (true); -- Public/company-wide budget awareness

DROP POLICY IF EXISTS "budgets_write_policy" ON public.budgets;
CREATE POLICY "budgets_write_policy" ON public.budgets
    FOR ALL TO authenticated
    USING (public.is_finance_manager());

-- ==============================================================================
-- 9. INVESTIGATIONS & EVIDENCE POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "investigations_select_policy" ON public.investigations;
CREATE POLICY "investigations_select_policy" ON public.investigations
    FOR SELECT TO authenticated
    USING (public.is_finance_member());

DROP POLICY IF EXISTS "investigations_write_policy" ON public.investigations;
CREATE POLICY "investigations_write_policy" ON public.investigations
    FOR ALL TO authenticated
    USING (public.is_finance_member());

DROP POLICY IF EXISTS "evidence_select_policy" ON public.investigation_evidence;
CREATE POLICY "evidence_select_policy" ON public.investigation_evidence
    FOR SELECT TO authenticated
    USING (public.is_finance_member());

DROP POLICY IF EXISTS "evidence_write_policy" ON public.investigation_evidence;
CREATE POLICY "evidence_write_policy" ON public.investigation_evidence
    FOR ALL TO authenticated
    USING (public.is_finance_member());

-- ==============================================================================
-- 10. RISK ASSESSMENTS & RECOMMENDATIONS POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "risk_select_policy" ON public.risk_assessments;
CREATE POLICY "risk_select_policy" ON public.risk_assessments
    FOR SELECT TO authenticated
    USING (public.is_finance_member());

DROP POLICY IF EXISTS "risk_write_policy" ON public.risk_assessments;
CREATE POLICY "risk_write_policy" ON public.risk_assessments
    FOR ALL TO authenticated
    USING (public.is_finance_member());

DROP POLICY IF EXISTS "recommendations_select_policy" ON public.recommendations;
CREATE POLICY "recommendations_select_policy" ON public.recommendations
    FOR SELECT TO authenticated
    USING (public.is_finance_member());

DROP POLICY IF EXISTS "recommendations_write_policy" ON public.recommendations;
CREATE POLICY "recommendations_write_policy" ON public.recommendations
    FOR ALL TO authenticated
    USING (public.is_finance_member());

-- ==============================================================================
-- 11. WORKFLOW TASKS POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "workflow_select_policy" ON public.workflow_tasks;
CREATE POLICY "workflow_select_policy" ON public.workflow_tasks
    FOR SELECT TO authenticated
    USING (public.is_finance_member() OR assigned_user_id = auth.uid());

DROP POLICY IF EXISTS "workflow_update_policy" ON public.workflow_tasks;
CREATE POLICY "workflow_update_policy" ON public.workflow_tasks
    FOR UPDATE TO authenticated
    USING (public.is_finance_manager() OR assigned_user_id = auth.uid());

-- ==============================================================================
-- 12. APPROVALS & ESCALATIONS POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "approvals_select_policy" ON public.approvals;
CREATE POLICY "approvals_select_policy" ON public.approvals
    FOR SELECT TO authenticated
    USING (public.is_finance_member() OR requester_id = auth.uid() OR approver_id = auth.uid());

DROP POLICY IF EXISTS "approvals_insert_policy" ON public.approvals;
CREATE POLICY "approvals_insert_policy" ON public.approvals
    FOR INSERT TO authenticated
    WITH CHECK (requester_id = auth.uid() OR public.is_finance_member());

DROP POLICY IF EXISTS "approvals_update_policy" ON public.approvals;
CREATE POLICY "approvals_update_policy" ON public.approvals
    FOR UPDATE TO authenticated
    USING (public.is_finance_manager() OR approver_id = auth.uid());

DROP POLICY IF EXISTS "escalations_select_policy" ON public.escalations;
CREATE POLICY "escalations_select_policy" ON public.escalations
    FOR SELECT TO authenticated
    USING (public.is_finance_member());

DROP POLICY IF EXISTS "escalations_write_policy" ON public.escalations;
CREATE POLICY "escalations_write_policy" ON public.escalations
    FOR ALL TO authenticated
    USING (public.is_finance_manager());

-- ==============================================================================
-- 13. ALERTS & REPORTS POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "alerts_select_policy" ON public.alerts;
CREATE POLICY "alerts_select_policy" ON public.alerts
    FOR SELECT TO authenticated
    USING (public.is_finance_member());

DROP POLICY IF EXISTS "alerts_update_policy" ON public.alerts;
CREATE POLICY "alerts_update_policy" ON public.alerts
    FOR UPDATE TO authenticated
    USING (public.is_finance_member());

DROP POLICY IF EXISTS "reports_select_policy" ON public.reports;
CREATE POLICY "reports_select_policy" ON public.reports
    FOR SELECT TO authenticated
    USING (public.is_finance_member());

DROP POLICY IF EXISTS "reports_write_policy" ON public.reports;
CREATE POLICY "reports_write_policy" ON public.reports
    FOR ALL TO authenticated
    USING (public.is_finance_member());

-- ==============================================================================
-- 14. AUDIT LOGS POLICIES (Read-only for Finance, Immutable)
-- ==============================================================================
DROP POLICY IF EXISTS "audit_select_policy" ON public.audit_logs;
CREATE POLICY "audit_select_policy" ON public.audit_logs
    FOR SELECT TO authenticated
    USING (public.is_finance_manager());

-- Audit logs cannot be updated or deleted by anyone (Append-Only)
DROP POLICY IF EXISTS "audit_insert_policy" ON public.audit_logs;
CREATE POLICY "audit_insert_policy" ON public.audit_logs
    FOR INSERT TO authenticated
    WITH CHECK (true);
