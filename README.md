# FIN-SHIELD — Autonomous Financial Risk & Operations Intelligence Platform

FIN-SHIELD is a enterprise-grade AI financial risk, anomaly detection, and operational workflow intelligence platform. It autonomously identifies financial anomalies, correlates cross-entity risk factors, explains decisions with forensic clarity, enforces ERP payment holds, and routes high-risk cases to human controllers.

---

## Tech Stack & Architecture

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui tokens, Framer Motion, Recharts, TanStack Query, Lucide Icons.
- **Backend API**: Node.js, Express.js, TypeScript, Repository pattern.
- **Database & Data Layer**: Supabase PostgreSQL 15+, Row Level Security (RLS), Supabase Storage.
- **AI & Forensics Engine**: Deterministic statistical risk scoring + Qwen multi-signal financial reasoning engine.
- **ERP Integration Simulation**: EnterPro ERP event bus & bidirectional payment holds.

```
React 19 Client (Obsidian Sentinel Stitch UI)
        │
        ▼ (HTTP REST / JWT)
Node.js + Express API Layer
        │
        ▼ (@supabase/supabase-js)
Supabase PostgreSQL 15+ & RLS
        ├── 18 Relational Tables (UUID PKs, FK Cascades, B-Tree Indexes)
        ├── 4-Tier Security Definer RLS Policies (Admin, Manager, Analyst, Employee)
        └── Private Storage Buckets (invoice-documents, investigation-reports)
```

---

## Directory Structure

```
FIN-SHIELD/
├── client/                     # Frontend Application (Vite + React 19 + TypeScript)
│   ├── src/
│   │   ├── components/         # Shared UI tokens (Badge, Button, Card, Input)
│   │   ├── features/           # Feature pages (Dashboard, Invoices, Risk, Operations, etc.)
│   │   ├── types/              # Database types (database.types.ts)
│   │   └── App.tsx             # Application Shell & Routing (28+ routes)
├── server/                     # Backend API & Repository Data Access (Node + Express)
│   ├── src/
│   │   ├── config/             # Supabase admin & user client configuration
│   │   ├── repositories/       # Typed Supabase repository modules
│   │   ├── scripts/            # Seed execution runner
│   │   ├── types/              # Database types matching Supabase schema
│   │   ├── app.ts              # Express application factory
│   │   └── server.ts           # Server bootstrap
├── supabase/                   # Supabase Database Migrations & Seeds
│   ├── migrations/
│   │   ├── 20260912000001_initial_schema.sql  # 18 PostgreSQL tables & indexes
│   │   ├── 20260912000002_rls_policies.sql    # Security definer functions & RLS
│   │   └── 20260912000003_storage.sql         # Private storage buckets & policies
│   └── seed.sql                               # Deterministic synthetic financial dataset
└── docs/                       # Technical architecture & setup manuals
    └── SUPABASE_SETUP.md       # Step-by-step Supabase deployment guide
```

---

## Getting Started

### 1. Database Setup
Follow the step-by-step instructions in [docs/SUPABASE_SETUP.md](file:///c:/Users/vinod/OneDrive/Desktop/FIN-SHIELD/docs/SUPABASE_SETUP.md) to apply migrations and seed data.

### 2. Run the Backend API
```bash
cd server
npm install
npm run build
npm run dev
```

### 3. Run the Frontend
```bash
cd client
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.
