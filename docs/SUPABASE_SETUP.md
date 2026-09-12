# FIN-SHIELD — Supabase Database, Security, Storage & Seed Setup

This guide details how to configure the **Supabase PostgreSQL** data layer, apply migrations, enforce Row Level Security (RLS), configure private document storage, and seed deterministic financial test data.

---

## Architecture Overview

FIN-SHIELD utilizes **Supabase PostgreSQL** as its sole source of truth:

```
[ React 19 Client ]
        │
        ▼ (HTTP REST / JWT)
[ Node.js + Express API ]
        │
        ▼ (@supabase/supabase-js with Service-Role or User JWT)
[ Supabase PostgreSQL + RLS + Storage ]
```

- **Service-Role Key**: Strictly confined to the server (`server/.env`). Never leaked to the frontend bundle.
- **Anon Key & JWT**: Used on the client / user requests to enforce database RLS policies.
- **Document Storage**: Two private buckets (`invoice-documents` and `investigation-reports`).

---

## 1. Environment Configuration

### Backend (`server/.env`)
Create a `.env` file in `server/` with the following:

```env
PORT=5000
NODE_ENV=development

# Supabase Credentials
SUPABASE_URL=https://<your-project-id>.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

CORS_ORIGIN=http://localhost:5173
```

---

## 2. Migration Files & Execution Order

All database changes are declared in `supabase/migrations/` in deterministic order:

| Step | Migration File | Description |
|---|---|---|
| 1 | `20260912000001_initial_schema.sql` | 18 PostgreSQL tables, UUID PKs, constraints, foreign keys, triggers, and targeted B-tree indexes. |
| 2 | `20260912000002_rls_policies.sql` | `get_user_role()` security definer function, enables RLS on all 18 tables, and defines role-based access for `ADMIN`, `FINANCE_MANAGER`, `FINANCE_ANALYST`, and `EMPLOYEE`. |
| 3 | `20260912000003_storage.sql` | Creates private `invoice-documents` (20MB) and `investigation-reports` (50MB) storage buckets with storage RLS. |
| 4 | `seed.sql` | Deterministic synthetic financial dataset including hero cases `INV-28491` & `INV-20481`, 15+ vendors, POs, transactions, budgets, investigations, evidence, and audit logs. |

### Applying via Supabase CLI
```bash
# Push migrations and apply seed
npx supabase db reset
```

### Applying via Supabase Dashboard (SQL Editor)
If managing a cloud Supabase project:
1. Open your project at [https://supabase.com/dashboard](https://supabase.com/dashboard).
2. Go to the **SQL Editor**.
3. Copy and run the contents of `supabase/migrations/20260912000001_initial_schema.sql`.
4. Copy and run `supabase/migrations/20260912000002_rls_policies.sql`.
5. Copy and run `supabase/migrations/20260912000003_storage.sql`.
6. Copy and run `supabase/seed.sql`.

---

## 3. Row Level Security (RLS) & Permissions Matrix

| Entity / Table | ADMIN | FINANCE_MANAGER | FINANCE_ANALYST | EMPLOYEE |
|---|:---:|:---:|:---:|:---:|
| `profiles` | Full CRUD | Read All / Update Own | Read All / Update Own | Read All / Update Own |
| `vendors` | Full CRUD | Read / Create / Update | Read Only | Read Only |
| `purchase_orders` | Full CRUD | Read / Create / Update | Read / Create | Read / Create Own |
| `invoices` | Full CRUD | Read / Create / Update | Read / Create / Submit | Read / Submit Own |
| `transactions` | Full CRUD | Read / Record / Update | Read Only | No Access |
| `budgets` | Full CRUD | Read / Create / Update | Read Only | Read Only |
| `investigations` | Full CRUD | Read / Manage / Resolve | Read / Create Drafts | No Access |
| `investigation_evidence` | Full CRUD | Read / Attach / Edit | Read / Attach | No Access |
| `risk_assessments` | Full CRUD | Read / Create | Read Only | No Access |
| `workflow_tasks` | Full CRUD | Read / Assign / Resolve | Read / Update Assigned | Read Assigned |
| `approvals` | Full CRUD | Read / Decide / Escalate | Read Only | Request / Read Own |
| `alerts` | Full CRUD | Read / Acknowledge / Resolve | Read / Acknowledge | No Access |
| `reports` | Full CRUD | Read / Generate / Export | Read / Generate Draft | No Access |
| `audit_logs` | Read Only (Append-Only) | Read Only (Append-Only) | No Access | No Access |

> **Note on Audit Logs**: The `audit_logs` table is strictly append-only. `UPDATE` and `DELETE` policies are blocked by RLS for all user roles, ensuring tamper-evident forensic validity.

---

## 4. Supabase Storage Configuration

- **`invoice-documents`**
  - Visibility: **Private**
  - File Size Limit: 20 MB
  - Allowed MIME Types: `application/pdf`, `image/png`, `image/jpeg`
  - Path Pattern: `invoices/{invoice_id}/{filename}`
  - Access: Authenticated finance personnel or owner of the submitted invoice.
- **`investigation-reports`**
  - Visibility: **Private**
  - File Size Limit: 50 MB
  - Allowed MIME Types: `application/pdf`, `application/json`
  - Path Pattern: `investigation-reports/{filename}`
  - Access: Authenticated finance personnel only.

---

## 5. Seed Dataset Highlights (Demo Case)

The seed dataset contains the hero scenario featured across the platform:
- **Hero Case 1**:
  - **Invoice**: `INV-28491`
  - **Vendor**: *ABC Supplies Pvt Ltd* (`b0000000-0000-0000-0000-000000000001`)
  - **Amount**: ₹4,82,000
  - **Risk Score**: 87/100 (CRITICAL)
  - **Status**: `ON_HOLD` (Hold `#WF-9042`)
  - **Signals**: Bank routing changed 4 days prior, PO contract rate inflated (+36.8%), 88.4% soft duplicate similarity with settled `INV-28412`, Q3 Operations departmental budget overrun (+18.5%).
- **Hero Case 2**:
  - **Invoice**: `INV-20481`
  - **Vendor**: *Acme Industrial Corporation*
  - **Amount**: ₹18,40,000 (PO PO-2026-0901 mismatch +53.3%)
  - **Risk Score**: 94/100 (CRITICAL)
  - **Status**: `ON_HOLD`
