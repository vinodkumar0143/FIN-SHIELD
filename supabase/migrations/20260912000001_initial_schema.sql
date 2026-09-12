-- ==============================================================================
-- FIN-SHIELD — Autonomous Financial Risk & Operations Intelligence Platform
-- Migration: 20260912000001_initial_schema.sql
-- Description: Core 18 Relational PostgreSQL Tables, Indexes, and Constraints
-- ==============================================================================

-- 1. Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Helper trigger for automatic updated_at maintenance
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 1. PROFILES (Linked 1:1 to auth.users)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('ADMIN', 'FINANCE_MANAGER', 'FINANCE_ANALYST', 'EMPLOYEE')),
    department TEXT NOT NULL DEFAULT 'Finance',
    avatar_url TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 2. VENDORS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    tax_id TEXT,
    category TEXT NOT NULL,
    contact_email TEXT,
    contact_phone TEXT,
    address TEXT,
    risk_score INTEGER NOT NULL DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_level TEXT NOT NULL DEFAULT 'LOW' CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    total_exposure NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PENDING_VERIFICATION', 'FLAGGED', 'SUSPENDED')),
    payment_terms TEXT NOT NULL DEFAULT 'NET_30',
    historical_metrics JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_vendors_updated_at ON public.vendors;
CREATE TRIGGER set_vendors_updated_at
    BEFORE UPDATE ON public.vendors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 3. PURCHASE ORDERS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_number TEXT NOT NULL UNIQUE,
    vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE RESTRICT,
    department TEXT NOT NULL,
    total_amount NUMERIC(15, 2) NOT NULL CHECK (total_amount >= 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PARTIALLY_FULFILLED', 'FULFILLED', 'CANCELLED')),
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_delivery DATE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_purchase_orders_updated_at ON public.purchase_orders;
CREATE TRIGGER set_purchase_orders_updated_at
    BEFORE UPDATE ON public.purchase_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 4. PURCHASE ORDER ITEMS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.purchase_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1.00 CHECK (quantity > 0),
    unit_price NUMERIC(15, 2) NOT NULL CHECK (unit_price >= 0),
    total NUMERIC(15, 2) NOT NULL CHECK (total >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 5. INVOICES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT NOT NULL UNIQUE,
    vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE RESTRICT,
    purchase_order_id UUID REFERENCES public.purchase_orders(id) ON DELETE SET NULL,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount >= 0),
    tax NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (tax >= 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'UPLOADED' CHECK (status IN (
        'UPLOADED', 'PROCESSING', 'VALIDATED', 'FLAGGED', 'UNDER_REVIEW', 'APPROVED', 'ON_HOLD', 'REJECTED', 'PAID'
    )),
    payment_status TEXT NOT NULL DEFAULT 'UNPAID' CHECK (payment_status IN ('UNPAID', 'PARTIALLY_PAID', 'PAID', 'HELD')),
    risk_score INTEGER NOT NULL DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_level TEXT NOT NULL DEFAULT 'LOW' CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    anomaly_status TEXT NOT NULL DEFAULT 'NONE' CHECK (anomaly_status IN ('NONE', 'SUSPECTED', 'CONFIRMED')),
    duplicate_status TEXT NOT NULL DEFAULT 'UNIQUE' CHECK (duplicate_status IN ('UNIQUE', 'POTENTIAL_DUPLICATE', 'CONFIRMED_DUPLICATE')),
    document_path TEXT,
    submitted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_invoices_updated_at ON public.invoices;
CREATE TRIGGER set_invoices_updated_at
    BEFORE UPDATE ON public.invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 6. INVOICE LINE ITEMS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.invoice_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1.00 CHECK (quantity > 0),
    unit_price NUMERIC(15, 2) NOT NULL CHECK (unit_price >= 0),
    tax NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (tax >= 0),
    total NUMERIC(15, 2) NOT NULL CHECK (total >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 7. TRANSACTIONS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_reference TEXT NOT NULL UNIQUE,
    vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE RESTRICT,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    purchase_order_id UUID REFERENCES public.purchase_orders(id) ON DELETE SET NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('OUTFLOW', 'INFLOW', 'ADJUSTMENT', 'HOLD_REVERSAL')),
    category TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount >= 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CLEARED', 'RECONCILED', 'FLAGGED', 'BLOCKED')),
    risk_score INTEGER NOT NULL DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_level TEXT NOT NULL DEFAULT 'LOW' CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    anomaly_flag BOOLEAN NOT NULL DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_transactions_updated_at ON public.transactions;
CREATE TRIGGER set_transactions_updated_at
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 8. BUDGETS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    category TEXT NOT NULL,
    allocated_amount NUMERIC(15, 2) NOT NULL CHECK (allocated_amount >= 0),
    spent_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (spent_amount >= 0),
    remaining_amount NUMERIC(15, 2) GENERATED ALWAYS AS (allocated_amount - spent_amount) STORED,
    utilization NUMERIC(5, 2) GENERATED ALWAYS AS (
        CASE WHEN allocated_amount > 0 THEN ROUND((spent_amount / allocated_amount) * 100, 2) ELSE 0.00 END
    ) STORED,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'NEAR_LIMIT', 'EXCEEDED', 'CLOSED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_budgets_updated_at ON public.budgets;
CREATE TRIGGER set_budgets_updated_at
    BEFORE UPDATE ON public.budgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 9. INVESTIGATIONS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.investigations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigation_id TEXT NOT NULL UNIQUE,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('INVOICE', 'TRANSACTION', 'VENDOR', 'BUDGET', 'PURCHASE_ORDER')),
    entity_id UUID NOT NULL,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_level TEXT NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN (
        'OPEN', 'INVESTIGATING', 'AI_ANALYSIS', 'AWAITING_REVIEW', 'RESOLVED', 'ESCALATED'
    )),
    recommendation TEXT,
    confidence NUMERIC(4, 3) CHECK (confidence >= 0.000 AND confidence <= 1.000),
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

DROP TRIGGER IF EXISTS set_investigations_updated_at ON public.investigations;
CREATE TRIGGER set_investigations_updated_at
    BEFORE UPDATE ON public.investigations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 10. INVESTIGATION EVIDENCE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.investigation_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigation_id UUID NOT NULL REFERENCES public.investigations(id) ON DELETE CASCADE,
    evidence_type TEXT NOT NULL CHECK (evidence_type IN (
        'DUPLICATE_HASH', 'PO_MISMATCH', 'BANK_ROUTING_CHANGE', 'BUDGET_OVERRUN', 'FREQUENCY_ANOMALY', 'OCR_DISCREPANCY', 'EXTERNAL_WATCHLIST'
    )),
    source_entity TEXT NOT NULL,
    source_entity_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    value TEXT NOT NULL,
    significance TEXT NOT NULL DEFAULT 'HIGH' CHECK (significance IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    risk_contribution INTEGER NOT NULL DEFAULT 0 CHECK (risk_contribution >= 0 AND risk_contribution <= 100),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 11. RISK ASSESSMENTS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.risk_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('INVOICE', 'TRANSACTION', 'VENDOR', 'BUDGET')),
    entity_id UUID NOT NULL,
    overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
    risk_level TEXT NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    component_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
    reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 12. RECOMMENDATIONS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigation_id UUID NOT NULL REFERENCES public.investigations(id) ON DELETE CASCADE,
    recommendation_type TEXT NOT NULL CHECK (recommendation_type IN (
        'APPROVE', 'APPROVE_WITH_REVIEW', 'HOLD', 'REQUEST_INFORMATION', 'REJECT', 'ESCALATE', 'INVESTIGATE_VENDOR'
    )),
    recommendation_text TEXT NOT NULL,
    confidence NUMERIC(4, 3) NOT NULL CHECK (confidence >= 0.000 AND confidence <= 1.000),
    reasoning_summary TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'OVERRIDDEN', 'REJECTED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 13. WORKFLOW TASKS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.workflow_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id TEXT NOT NULL UNIQUE,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    workflow_type TEXT NOT NULL CHECK (workflow_type IN (
        'PAYMENT_HOLD', 'FORENSIC_REVIEW', 'VENDOR_REAUTHENTICATION', 'BUDGET_OVERRIDE', 'COMPLIANCE_SIGN_OFF'
    )),
    assigned_role TEXT NOT NULL DEFAULT 'FINANCE_MANAGER',
    assigned_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PENDING', 'COMPLETED', 'ESCALATED', 'CANCELLED')),
    priority TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    due_date DATE,
    source TEXT NOT NULL DEFAULT 'ENTERPRO_ERP',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

DROP TRIGGER IF EXISTS set_workflow_tasks_updated_at ON public.workflow_tasks;
CREATE TRIGGER set_workflow_tasks_updated_at
    BEFORE UPDATE ON public.workflow_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 14. APPROVALS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    approval_id TEXT NOT NULL UNIQUE,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('INVOICE', 'PURCHASE_ORDER', 'BUDGET_OVERRIDE', 'PAYMENT_RELEASE')),
    entity_id UUID NOT NULL,
    requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    approver_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount >= 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    approval_level TEXT NOT NULL DEFAULT 'LEVEL_1' CHECK (approval_level IN ('LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'EXECUTIVE')),
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'ESCALATED')),
    comments TEXT,
    decision_timestamp TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_approvals_updated_at ON public.approvals;
CREATE TRIGGER set_approvals_updated_at
    BEFORE UPDATE ON public.approvals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 15. ESCALATIONS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.escalations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    reason TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'HIGH' CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'INVESTIGATING', 'RESOLVED', 'DISMISSED')),
    comments TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- ==============================================================================
-- 16. ALERTS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_type TEXT NOT NULL CHECK (alert_type IN (
        'BUDGET_BREACH', 'SUSPICIOUS_PAYMENT', 'BANK_CHANGE', 'DUPLICATE_INVOICE', 'VELOCITY_SPIKE', 'SYSTEM_AUDIT'
    )),
    severity TEXT NOT NULL DEFAULT 'INFO' CHECK (severity IN ('INFO', 'WARNING', 'CRITICAL')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id UUID,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED')),
    read_state BOOLEAN NOT NULL DEFAULT FALSE,
    route TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- ==============================================================================
-- 17. REPORTS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_name TEXT NOT NULL,
    report_type TEXT NOT NULL CHECK (report_type IN (
        'FINANCIAL_SUMMARY', 'RISK_REPORT', 'VENDOR_RISK_REPORT', 'BUDGET_REPORT', 'ANOMALY_REPORT', 'INVESTIGATION_REPORT'
    )),
    reporting_period TEXT NOT NULL,
    generated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('GENERATING', 'COMPLETED', 'FAILED')),
    storage_path TEXT,
    file_size TEXT DEFAULT '1.2 MB',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_reports_updated_at ON public.reports;
CREATE TRIGGER set_reports_updated_at
    BEFORE UPDATE ON public.reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 18. AUDIT LOGS (Immutable Append-Only Ledger)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    user_role TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    previous_state JSONB,
    new_state JSONB,
    reason TEXT,
    source TEXT NOT NULL DEFAULT 'SYSTEM',
    workflow_reference TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- TARGETED B-TREE INDEXES
-- ==============================================================================
-- Invoices
CREATE INDEX IF NOT EXISTS idx_invoices_vendor_id ON public.invoices(vendor_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON public.invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_risk_level ON public.invoices(risk_level);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON public.invoices(due_date);

-- Purchase Orders
CREATE INDEX IF NOT EXISTS idx_po_vendor_id ON public.purchase_orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_po_number ON public.purchase_orders(po_number);
CREATE INDEX IF NOT EXISTS idx_po_status ON public.purchase_orders(status);

-- Transactions
CREATE INDEX IF NOT EXISTS idx_transactions_vendor_id ON public.transactions(vendor_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_risk_level ON public.transactions(risk_level);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);

-- Vendors
CREATE INDEX IF NOT EXISTS idx_vendors_risk_score ON public.vendors(risk_score);
CREATE INDEX IF NOT EXISTS idx_vendors_risk_level ON public.vendors(risk_level);
CREATE INDEX IF NOT EXISTS idx_vendors_status ON public.vendors(status);

-- Investigations & Evidence
CREATE INDEX IF NOT EXISTS idx_investigations_status ON public.investigations(status);
CREATE INDEX IF NOT EXISTS idx_investigations_risk_level ON public.investigations(risk_level);
CREATE INDEX IF NOT EXISTS idx_investigations_entity ON public.investigations(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_evidence_investigation ON public.investigation_evidence(investigation_id);

-- Workflows & Approvals
CREATE INDEX IF NOT EXISTS idx_workflows_status ON public.workflow_tasks(status);
CREATE INDEX IF NOT EXISTS idx_workflows_assigned_user ON public.workflow_tasks(assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_approvals_status ON public.approvals(status);
CREATE INDEX IF NOT EXISTS idx_approvals_requester ON public.approvals(requester_id);

-- Alerts & Audit Logs
CREATE INDEX IF NOT EXISTS idx_alerts_status ON public.alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON public.alerts(severity);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON public.audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON public.audit_logs(entity_type, entity_id);
