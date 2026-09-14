# 🛡️ FIN-SHIELD

### AI-Powered Financial Investigation & Risk Operations Platform

> **Detect. Investigate. Explain. Act.**

FIN-SHIELD helps enterprise finance and operations teams detect suspicious financial activity, investigate supporting evidence, understand risk using explainable AI, and move cases through controlled approval and response workflows.

---

### ⚡ Core Operating Principle

$$\textbf{Deterministic risk detection first} \longrightarrow \textbf{Evidence-backed AI reasoning second} \longrightarrow \textbf{Human-controlled action always}$$

Risk indicators surface objective mathematical discrepancies before language models generate structured forensic explanations. Every automated recommendation requires authorized human sign-off before financial operations change.

---

## 🌐 Live Application

| Environment | Endpoint | Status |
|---|---|---|
| **Production Web App** | [https://finshield-amber-theta.vercel.app](https://finshield-amber-theta.vercel.app) | Live on Vercel |
| **Backend API Health** | [https://fin-shield.onrender.com/health](https://fin-shield.onrender.com/health) | Live on Render |

---

## 🔍 What FIN-SHIELD Does

- **Detect**: Continuously evaluates invoices, payments, and vendor activity across statistical outliers, duplicate submission heuristics, PO mismatches, and budget boundary breaches.
- **Investigate**: Assembles linked evidence into interactive case workspaces, correlating vendor history, document line items, contracts, and previous disbursement patterns.
- **Explain**: Uses Qwen structured reasoning to translate complex multi-signal anomalies into transparent, human-readable forensic narratives with explicit confidence scoring.
- **Act**: Executes decisive, policy-backed operations—such as placing emergency ERP payment holds, initiating multi-tier approvals, or routing executive escalations.
- **Audit**: Automatically records tamper-evident, append-only logs for every user action, status transition, review note, and workflow outcome to ensure compliance.

---

## 💡 Killer Investigation Example

Consider an actual high-risk scenario evaluated by the platform:

```text
Invoice:  INV-28491
Vendor:   ABC Supplies
Amount:   ₹4,82,000
```

### Quantified Risk Signals
- **Historical Baseline**: Vendor average ₹2,10,000 → **+129.5% deviation**
- **Duplicate Candidate**: Matches INV-28177 → **94% similarity**
- **Purchase Order**: Linked PO at ₹3,20,000 → **₹1.62L mismatch**
- **Department Budget**: Remaining ₹3.50L → **₹1.32L exposure overrun**
- **Deterministic Risk Score**: **87 / 100**
- **Risk Level**: **HIGH**

> **Controlled Decision Principle**  
> Risk is not treated as proof of fraud. FinShield separates risk signals, evidence, AI reasoning, confidence, and recommended action so humans remain in control.

---

## 🏗️ Architecture

```text
Financial Data (Invoices, POs, Vendors, ERP Events)
     ↓
Validation & Normalization
     ↓
Deterministic Risk Engine
     ↓
Evidence & Investigation Graph
     ↓
Qwen Structured Reasoning
     ↓
Risk + Confidence + Explanation
     ↓
Recommendation
     ↓
Workflow / Hold / Approval / Escalation
     ↓
Audit Trail
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS |
| **UI Components** | shadcn/ui, Framer Motion, Lucide, Recharts |
| **Data Fetching** | TanStack Query |
| **Backend** | Node.js, Express.js, TypeScript |
| **Data Access** | Repository pattern + Supabase SDK |
| **Database** | Supabase PostgreSQL 15+ |
| **Security** | Supabase Auth + PostgreSQL RLS |
| **Storage** | Supabase Storage |
| **AI** | Qwen structured financial reasoning |
| **Risk Engine** | Deterministic multi-signal scoring |
| **ERP Workflow** | EnterPro ERP simulation |
| **Frontend Hosting** | Vercel |
| **Backend Hosting** | Render |

---

## 📁 Project Structure

```text
FinShield/
├── client/       # React 19 frontend application (Vite, Tailwind, TanStack Query)
├── server/       # Express.js REST API & Repository data access layer
├── supabase/     # PostgreSQL migrations, RLS security policies & seed dataset
└── docs/         # Architecture guides and operational documentation
```

---

## 🛡️ Security & Governance

- **Authentication**: Email/password and Google authentication via Supabase Auth.
- **Protected Client Routes**: Route guards verifying identity, role assignment, and profile completion.
- **Authenticated API Access**: Bearer token authorization headers verified on all protected Express routes.
- **PostgreSQL Row-Level Security (RLS)**: Database-enforced access policies across all public tables.
- **Credential Protection**: Server-side service-role key is never exposed to the frontend bundle.
- **Private Storage**: Secure Supabase Storage buckets restricted to verified finance roles.
- **Role-Aware Permissions**: Granular clearance rules across `ADMIN`, `FINANCE_MANAGER`, `FINANCE_ANALYST`, and `EMPLOYEE`.
- **Comprehensive Audit Logging**: Append-only records tracking review notes, hold requests, and approval actions.
- **Explainable Decision Bounds**: The risk score does not automatically declare fraud; final disposition requires human authorization.

---

## 💻 Run Locally

### Prerequisites
- Node.js 20+
- npm 10+

### 1. Backend Service
```bash
cd server
npm install
npm run build
npm run dev
```

### 2. Frontend Application
```bash
cd client
npm install
npm run dev
```
Open `http://localhost:5173` to access the FinShield dashboard.

---

## 🔐 Environment Variables

### Backend (`server/.env`)
```bash
PORT=3000
NODE_ENV=development
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
CORS_ORIGIN=http://localhost:5173
```

### Frontend (`client/.env`)
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

## 🗄️ Database

Supabase PostgreSQL provides the production relational data layer. Database migrations reside under `supabase/migrations/`:
- `20260912000001_initial_schema.sql` (18 core relational tables, indexes, constraints)
- `20260912000002_rls_policies.sql` (Row-Level Security policies and security definer functions)
- `20260912000003_storage.sql` (Private document storage buckets and access rules)

`supabase/seed.sql` contains the synthetic demonstration dataset populating personas, vendors, invoices, anomalies, and audit records.

---

## 🎯 Platform Standard

Built for explainable financial risk investigation, controlled response workflows, and auditable operations.
