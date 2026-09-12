-- ==============================================================================
-- FIN-SHIELD — Autonomous Financial Risk & Operations Intelligence Platform
-- Seed Data: supabase/seed.sql
-- Description: Deterministic Realistic Synthetic Dataset for FIN-SHIELD Demo
-- ==============================================================================

-- Ensure clean execution
BEGIN;

-- 1. SEED AUTH USERS (Mock entries for foreign key integrity in Supabase)
INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES 
(
    'a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'admin@finshield.ai',
    crypt('FinShield2026!', gen_salt('bf')), NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Dr. Evelyn Vance"}'::jsonb, NOW(), NOW()
),
(
    'a0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'marcus.s@finshield.ai',
    crypt('FinShield2026!', gen_salt('bf')), NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Marcus Sterling"}'::jsonb, NOW(), NOW()
),
(
    'a0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'sarah.c@finshield.ai',
    crypt('FinShield2026!', gen_salt('bf')), NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Sarah Chen"}'::jsonb, NOW(), NOW()
),
(
    'a0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'rahul.s@finshield.ai',
    crypt('FinShield2026!', gen_salt('bf')), NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Rahul Sharma"}'::jsonb, NOW(), NOW()
),
(
    'a0000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'ananya.r@finshield.ai',
    crypt('FinShield2026!', gen_salt('bf')), NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Ananya Roy"}'::jsonb, NOW(), NOW()
)
ON CONFLICT (id) DO NOTHING;

-- 2. SEED PROFILES
INSERT INTO public.profiles (id, full_name, email, role, department, avatar_url, status)
VALUES
(
    'a0000000-0000-0000-0000-000000000001',
    'Dr. Evelyn Vance',
    'admin@finshield.ai',
    'ADMIN',
    'Executive Leadership',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    'ACTIVE'
),
(
    'a0000000-0000-0000-0000-000000000002',
    'Marcus Sterling',
    'marcus.s@finshield.ai',
    'FINANCE_MANAGER',
    'Treasury & Audit',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    'ACTIVE'
),
(
    'a0000000-0000-0000-0000-000000000003',
    'Sarah Chen',
    'sarah.c@finshield.ai',
    'FINANCE_ANALYST',
    'Forensic Accounting',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    'ACTIVE'
),
(
    'a0000000-0000-0000-0000-000000000004',
    'Rahul Sharma',
    'rahul.s@finshield.ai',
    'FINANCE_ANALYST',
    'Risk Operations',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    'ACTIVE'
),
(
    'a0000000-0000-0000-0000-000000000005',
    'Ananya Roy',
    'ananya.r@finshield.ai',
    'EMPLOYEE',
    'Procurement & Operations',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    'ACTIVE'
)
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    department = EXCLUDED.department;

-- 3. SEED VENDORS (15+ realistic vendors)
INSERT INTO public.vendors (id, name, tax_id, category, contact_email, contact_phone, address, risk_score, risk_level, total_exposure, status, payment_terms)
VALUES
(
    'b0000000-0000-0000-0000-000000000001',
    'ABC Supplies Pvt Ltd',
    '27AABCA1234F1Z8',
    'Office Supplies & Consumables',
    'billing@abcsupplies.in',
    '+91 22 6123 4567',
    'Plot 42, Andheri East, Mumbai, MH 400069',
    87,
    'CRITICAL',
    1240000.00,
    'FLAGGED',
    'NET_15'
),
(
    'b0000000-0000-0000-0000-000000000002',
    'Acme Industrial Corporation',
    '07AAACA9876Q1ZB',
    'Heavy Machinery & Facility Parts',
    'accounts@acmeindustrial.com',
    '+91 11 4123 9876',
    'Okhla Industrial Area Phase III, New Delhi, DL 110020',
    94,
    'CRITICAL',
    1840000.00,
    'FLAGGED',
    'IMMEDIATE'
),
(
    'b0000000-0000-0000-0000-000000000003',
    'Apex Cloud Infrastructure Services',
    '29AAPCA4567M1ZX',
    'Cloud Hosting & Enterprise SaaS',
    'invoicing@apexcloud.io',
    '+91 80 4912 3000',
    'Outer Ring Road, Bellandur, Bengaluru, KA 560103',
    14,
    'LOW',
    2450000.00,
    'ACTIVE',
    'NET_30'
),
(
    'b0000000-0000-0000-0000-000000000004',
    'Starlight Freight & Logistics',
    '33AAAFS2345K1ZK',
    'Logistics & Supply Chain',
    'dispatch@starlightlogistics.in',
    '+91 44 2812 7700',
    'Guindy Industrial Estate, Chennai, TN 600032',
    42,
    'MEDIUM',
    890000.00,
    'ACTIVE',
    'NET_30'
),
(
    'b0000000-0000-0000-0000-000000000005',
    'Nova Cyber Systems Ltd',
    '36AAACN7890P1ZN',
    'Cybersecurity & Network Defense',
    'accounts@novacyber.co.in',
    '+91 40 6712 5500',
    'Hitec City, Madhapur, Hyderabad, TS 500081',
    18,
    'LOW',
    1420000.00,
    'ACTIVE',
    'NET_45'
),
(
    'b0000000-0000-0000-0000-000000000006',
    'Zenith Legal & Advisory Partners',
    '27AAAFZ3322B1ZL',
    'Legal & Statutory Compliance',
    'finance@zenithlegal.com',
    '+91 22 2288 9900',
    'Nariman Point, Mumbai, MH 400021',
    28,
    'LOW',
    650000.00,
    'ACTIVE',
    'NET_30'
),
(
    'b0000000-0000-0000-0000-000000000007',
    'Global Talent Search Partners',
    '06AAACG1122D1ZG',
    'HR Recruitment & Contingent Staffing',
    'billing@globaltalent.in',
    '+91 124 456 7890',
    'Cyber City Phase II, Gurugram, HR 122002',
    52,
    'MEDIUM',
    780000.00,
    'ACTIVE',
    'NET_30'
),
(
    'b0000000-0000-0000-0000-000000000008',
    'OmniTech Hardware Solutions',
    '29AAACO9988L1ZV',
    'Workstations & Peripheral Hardware',
    'orders@omnitech.in',
    '+91 80 2555 1234',
    'Electronic City Phase I, Bengaluru, KA 560100',
    64,
    'HIGH',
    980000.00,
    'ACTIVE',
    'NET_30'
),
(
    'b0000000-0000-0000-0000-000000000009',
    'Metro Facility Management Services',
    '27AAACM4455R1ZR',
    'Corporate Facilities & Janitorial',
    'ops@metrofacility.com',
    '+91 22 2833 4455',
    'Kanjurmarg West, Mumbai, MH 400078',
    22,
    'LOW',
    340000.00,
    'ACTIVE',
    'NET_30'
),
(
    'b0000000-0000-0000-0000-000000000010',
    'Delta Media & Brand Communications',
    '07AAACD6677T1ZM',
    'Digital Marketing & Ad Networks',
    'billing@deltamedia.agency',
    '+91 11 2655 4433',
    'Hauz Khas, New Delhi, DL 110016',
    48,
    'MEDIUM',
    1150000.00,
    'ACTIVE',
    'NET_30'
),
(
    'b0000000-0000-0000-0000-000000000011',
    'Prism Travel & Hospitality Corp',
    '29AAACP2211C1ZO',
    'Corporate Travel Management',
    'corporate@prismtravel.in',
    '+91 80 4111 8899',
    'MG Road, Bengaluru, KA 560001',
    35,
    'LOW',
    420000.00,
    'ACTIVE',
    'NET_15'
),
(
    'b0000000-0000-0000-0000-000000000012',
    'Vanguard Network Technologies',
    '33AAACV8899Q1ZY',
    'SD-WAN & Fiber Backhaul Services',
    'accounts@vanguardnet.in',
    '+91 44 4333 2211',
    'Taramani, Chennai, TN 600113',
    19,
    'LOW',
    820000.00,
    'ACTIVE',
    'NET_45'
),
(
    'b0000000-0000-0000-0000-000000000013',
    'Krypton Security Devices Pvt Ltd',
    '27AAACK1133F1ZU',
    'Physical Security & Biometric Readers',
    'invoicing@kryptonsecurity.co.in',
    '+91 22 6677 8899',
    'MIDC Industrial Area, Navi Mumbai, MH 400705',
    71,
    'HIGH',
    640000.00,
    'ACTIVE',
    'NET_30'
),
(
    'b0000000-0000-0000-0000-000000000014',
    'Synthetix AI Research Labs',
    '29AAACS5544J1ZQ',
    'AI Research Subscriptions & Compute',
    'finance@synthetix.ai',
    '+91 80 6122 3344',
    'Indiranagar, Bengaluru, KA 560038',
    12,
    'LOW',
    1950000.00,
    'ACTIVE',
    'NET_30'
),
(
    'b0000000-0000-0000-0000-000000000015',
    'Reliant Green Energy Systems',
    '24AAACR7788P1ZT',
    'Solar Backups & Energy Audits',
    'sales@reliantenergy.in',
    '+91 79 2644 5566',
    'SG Highway, Ahmedabad, GJ 380054',
    25,
    'LOW',
    510000.00,
    'ACTIVE',
    'NET_30'
)
ON CONFLICT (id) DO NOTHING;

-- 4. SEED BUDGETS (Departmental Allocations)
INSERT INTO public.budgets (id, name, department, category, allocated_amount, spent_amount, period_start, period_end, status)
VALUES
(
    'c0000000-0000-0000-0000-000000000001',
    'Q3 Operations & Facility Budget',
    'Operations',
    'Facilities & Consumables',
    5000000.00,
    5925000.00, -- Overrun: +18.5%
    '2026-07-01',
    '2026-09-30',
    'EXCEEDED'
),
(
    'c0000000-0000-0000-0000-000000000002',
    'FY26 Cloud Infrastructure & DevOps',
    'Technology',
    'Software & Cloud Hosting',
    12000000.00,
    8650000.00,
    '2026-04-01',
    '2027-03-31',
    'ACTIVE'
),
(
    'c0000000-0000-0000-0000-000000000003',
    'Q3 Demand Generation & Digital Ads',
    'Marketing',
    'Advertising & PR',
    3500000.00,
    3320000.00, -- 94.8% near limit
    '2026-07-01',
    '2026-09-30',
    'NEAR_LIMIT'
),
(
    'c0000000-0000-0000-0000-000000000004',
    'Q3 Global Travel & Client Engagements',
    'Corporate Travel',
    'Travel & Hospitality',
    1800000.00,
    1150000.00,
    '2026-07-01',
    '2026-09-30',
    'ACTIVE'
),
(
    'c0000000-0000-0000-0000-000000000005',
    'FY26 Talent Acquisition & Training',
    'Human Resources',
    'Recruitment & Learning',
    2500000.00,
    1480000.00,
    '2026-04-01',
    '2027-03-31',
    'ACTIVE'
),
(
    'c0000000-0000-0000-0000-000000000006',
    'Q3 Central Procurement & Hardware',
    'Procurement',
    'Hardware & Capital Assets',
    4000000.00,
    2980000.00,
    '2026-07-01',
    '2026-09-30',
    'ACTIVE'
)
ON CONFLICT (id) DO NOTHING;

-- 5. SEED PURCHASE ORDERS
INSERT INTO public.purchase_orders (id, po_number, vendor_id, department, total_amount, currency, status, order_date, expected_delivery, created_by)
VALUES
(
    'd0000000-0000-0000-0000-000000000001',
    'PO-2026-0812',
    'b0000000-0000-0000-0000-000000000001', -- ABC Supplies
    'Operations',
    350000.00, -- Mismatch with invoice amount (₹4,82,000)
    'INR',
    'APPROVED',
    '2026-08-15',
    '2026-08-30',
    'a0000000-0000-0000-0000-000000000005'
),
(
    'd0000000-0000-0000-0000-000000000002',
    'PO-2026-0901',
    'b0000000-0000-0000-0000-000000000002', -- Acme Industrial
    'Operations',
    1200000.00, -- Mismatch with invoice amount (₹18,40,000)
    'INR',
    'APPROVED',
    '2026-08-20',
    '2026-09-05',
    'a0000000-0000-0000-0000-000000000005'
),
(
    'd0000000-0000-0000-0000-000000000003',
    'PO-2026-0744',
    'b0000000-0000-0000-0000-000000000003', -- Apex Cloud
    'Technology',
    2450000.00,
    'INR',
    'FULFILLED',
    '2026-07-01',
    '2026-07-15',
    'a0000000-0000-0000-0000-000000000002'
),
(
    'd0000000-0000-0000-0000-000000000004',
    'PO-2026-0850',
    'b0000000-0000-0000-0000-000000000004', -- Starlight
    'Operations',
    420000.00,
    'INR',
    'FULFILLED',
    '2026-08-10',
    '2026-08-25',
    'a0000000-0000-0000-0000-000000000005'
),
(
    'd0000000-0000-0000-0000-000000000005',
    'PO-2026-0910',
    'b0000000-0000-0000-0000-000000000005', -- Nova Cyber
    'Technology',
    710000.00,
    'INR',
    'APPROVED',
    '2026-09-01',
    '2026-09-20',
    'a0000000-0000-0000-0000-000000000002'
)
ON CONFLICT (id) DO NOTHING;

-- 6. SEED PURCHASE ORDER ITEMS
INSERT INTO public.purchase_order_items (id, purchase_order_id, description, quantity, unit_price, total)
VALUES
(
    'e0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    'Premium Commercial Ergonomic Supplies Batch A',
    100.00,
    2500.00,
    250000.00
),
(
    'e0000000-0000-0000-0000-000000000002',
    'd0000000-0000-0000-0000-000000000001',
    'High-Yield Printer Consumables & Cartridges',
    20.00,
    5000.00,
    100000.00
),
(
    'e0000000-0000-0000-0000-000000000003',
    'd0000000-0000-0000-0000-000000000002',
    'Heavy Industrial Chiller Pump & Assemblies',
    2.00,
    600000.00,
    1200000.00
)
ON CONFLICT (id) DO NOTHING;

-- 7. SEED INVOICES (Including Hero Cases INV-28491 & INV-20481)
INSERT INTO public.invoices (
    id, invoice_number, vendor_id, purchase_order_id, amount, tax, currency,
    invoice_date, due_date, status, payment_status, risk_score, risk_level,
    anomaly_status, duplicate_status, document_path, submitted_by
)
VALUES
-- HERO CASE 1: ABC Supplies Pvt Ltd (INV-28491)
(
    'f0000000-0000-0000-0000-000000000001',
    'INV-28491',
    'b0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    482000.00,
    86760.00,
    'INR',
    '2026-09-08',
    '2026-09-23',
    'ON_HOLD',
    'HELD',
    87,
    'CRITICAL',
    'CONFIRMED',
    'POTENTIAL_DUPLICATE',
    'invoices/INV-28491/invoice_abc_28491.pdf',
    'a0000000-0000-0000-0000-000000000005'
),
-- PREVIOUS SOFT-DUPLICATE INVOICE (INV-28412)
(
    'f0000000-0000-0000-0000-000000000002',
    'INV-28412',
    'b0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    478000.00,
    86040.00,
    'INR',
    '2026-08-25',
    '2026-09-10',
    'PAID',
    'PAID',
    22,
    'LOW',
    'NONE',
    'UNIQUE',
    'invoices/INV-28412/invoice_abc_28412.pdf',
    'a0000000-0000-0000-0000-000000000005'
),
-- HERO CASE 2: Acme Industrial Corp (INV-20481)
(
    'f0000000-0000-0000-0000-000000000003',
    'INV-20481',
    'b0000000-0000-0000-0000-000000000002',
    'd0000000-0000-0000-0000-000000000002',
    1840000.00,
    331200.00,
    'INR',
    '2026-09-06',
    '2026-09-06',
    'ON_HOLD',
    'HELD',
    94,
    'CRITICAL',
    'CONFIRMED',
    'POTENTIAL_DUPLICATE',
    'invoices/INV-20481/acme_invoice_20481.pdf',
    'a0000000-0000-0000-0000-000000000005'
),
-- Normal Invoices across other vendors
(
    'f0000000-0000-0000-0000-000000000004',
    'INV-2026-0902',
    'b0000000-0000-0000-0000-000000000003', -- Apex Cloud
    'd0000000-0000-0000-0000-000000000003',
    1225000.00,
    220500.00,
    'INR',
    '2026-09-01',
    '2026-10-01',
    'APPROVED',
    'UNPAID',
    12,
    'LOW',
    'NONE',
    'UNIQUE',
    'invoices/INV-2026-0902/apex_sep_cloud.pdf',
    'a0000000-0000-0000-0000-000000000002'
),
(
    'f0000000-0000-0000-0000-000000000005',
    'INV-2026-0888',
    'b0000000-0000-0000-0000-000000000004', -- Starlight
    'd0000000-0000-0000-0000-000000000004',
    420000.00,
    75600.00,
    'INR',
    '2026-08-28',
    '2026-09-28',
    'PAID',
    'PAID',
    35,
    'LOW',
    'NONE',
    'UNIQUE',
    'invoices/INV-2026-0888/starlight_freight.pdf',
    'a0000000-0000-0000-0000-000000000005'
),
(
    'f0000000-0000-0000-0000-000000000006',
    'INV-2026-0933',
    'b0000000-0000-0000-0000-000000000008', -- OmniTech
    NULL,
    580000.00,
    104400.00,
    'INR',
    '2026-09-04',
    '2026-10-04',
    'FLAGGED',
    'UNPAID',
    68,
    'HIGH',
    'SUSPECTED',
    'UNIQUE',
    'invoices/INV-2026-0933/omnitech_monitors.pdf',
    'a0000000-0000-0000-0000-000000000005'
)
ON CONFLICT (id) DO NOTHING;

-- 8. SEED INVOICE LINE ITEMS (For Hero Case INV-28491)
INSERT INTO public.invoice_line_items (id, invoice_id, description, quantity, unit_price, tax, total)
VALUES
(
    '10000000-0000-0000-0000-000000000001',
    'f0000000-0000-0000-0000-000000000001',
    'Commercial Grade Ergonomic Executive Workstation Supplies',
    100.00,
    3420.00, -- Overbilling compared to PO unit price (2500.00)
    61560.00,
    342000.00
),
(
    '10000000-0000-0000-0000-000000000002',
    'f0000000-0000-0000-0000-000000000001',
    'High Capacity Toner and Drum Cartridge Multipack',
    20.00,
    7000.00, -- Overbilling compared to PO unit price (5000.00)
    25200.00,
    140000.00
)
ON CONFLICT (id) DO NOTHING;

-- 9. SEED TRANSACTIONS
INSERT INTO public.transactions (
    id, transaction_reference, vendor_id, invoice_id, purchase_order_id,
    transaction_type, category, amount, currency, transaction_date, status,
    risk_score, risk_level, anomaly_flag, description
)
VALUES
(
    '20000000-0000-0000-0000-000000000001',
    'TXN-2026-0908-01',
    'b0000000-0000-0000-0000-000000000001', -- ABC Supplies
    'f0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    'OUTFLOW',
    'Office Supplies & Facilities',
    482000.00,
    'INR',
    '2026-09-08',
    'BLOCKED',
    87,
    'CRITICAL',
    TRUE,
    'EnterPro Autonomous Hold #WF-9042 intercepted settlement attempt'
),
(
    '20000000-0000-0000-0000-000000000002',
    'TXN-2026-0828-44',
    'b0000000-0000-0000-0000-000000000001', -- ABC Supplies
    'f0000000-0000-0000-0000-000000000002',
    'd0000000-0000-0000-0000-000000000001',
    'OUTFLOW',
    'Office Supplies & Facilities',
    478000.00,
    'INR',
    '2026-08-28',
    'CLEARED',
    22,
    'LOW',
    FALSE,
    'Monthly routine facility disbursement'
),
(
    '20000000-0000-0000-0000-000000000003',
    'TXN-2026-0906-88',
    'b0000000-0000-0000-0000-000000000002', -- Acme Industrial
    'f0000000-0000-0000-0000-000000000003',
    'd0000000-0000-0000-0000-000000000002',
    'OUTFLOW',
    'Heavy Machinery',
    1840000.00,
    'INR',
    '2026-09-06',
    'BLOCKED',
    94,
    'CRITICAL',
    TRUE,
    'Immediate settlement blocked due to extreme PO price delta (+53.3%)'
),
(
    '20000000-0000-0000-0000-000000000004',
    'TXN-2026-0902-12',
    'b0000000-0000-0000-0000-000000000003', -- Apex Cloud
    'f0000000-0000-0000-0000-000000000004',
    'd0000000-0000-0000-0000-000000000003',
    'OUTFLOW',
    'Cloud Hosting & Enterprise SaaS',
    1225000.00,
    'INR',
    '2026-09-02',
    'CLEARED',
    12,
    'LOW',
    FALSE,
    'Monthly AWS/GCP direct debit'
)
ON CONFLICT (id) DO NOTHING;

-- 10. SEED INVESTIGATIONS (Hero Cockpit Case: INV-CASE-28491)
INSERT INTO public.investigations (
    id, investigation_id, entity_type, entity_id, title, summary,
    risk_score, risk_level, status, recommendation, confidence, assigned_to
)
VALUES
(
    '30000000-0000-0000-0000-000000000001',
    'INV-CASE-28491',
    'INVOICE',
    'f0000000-0000-0000-0000-000000000001',
    'Critical Anomaly Cluster: ABC Supplies Pvt Ltd (INV-28491)',
    'Multi-signal financial breach: Bank routing changed 4 days prior, PO amount mismatch (+37.7%), duplicate similarity score 0.88 with INV-28412, and Q3 Operations budget exceeded by +18.5%.',
    87,
    'CRITICAL',
    'OPEN',
    'EXECUTE PAYMENT HOLD & ESCALATE TO FORENSIC AUDIT',
    0.965,
    'a0000000-0000-0000-0000-000000000003' -- Sarah Chen
),
(
    '30000000-0000-0000-0000-000000000002',
    'INV-CASE-20481',
    'INVOICE',
    'f0000000-0000-0000-0000-000000000003',
    'High Delta PO Price Discrepancy: Acme Industrial (INV-20481)',
    'Gross invoice amount ₹18,40,000 exceeds approved Purchase Order PO-2026-0901 by ₹6,40,000 without prior change-order documentation.',
    94,
    'CRITICAL',
    'INVESTIGATING',
    'REJECT AND DEMAND REVISED PURCHASE ORDER AMENDMENT',
    0.982,
    'a0000000-0000-0000-0000-000000000004' -- Rahul Sharma
)
ON CONFLICT (id) DO NOTHING;

-- 11. SEED INVESTIGATION EVIDENCE (For Hero Case INV-CASE-28491)
INSERT INTO public.investigation_evidence (
    id, investigation_id, evidence_type, source_entity, source_entity_id,
    title, description, value, significance, risk_contribution, metadata
)
VALUES
(
    '40000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    'BANK_ROUTING_CHANGE',
    'VENDOR_PROFILE',
    'b0000000-0000-0000-0000-000000000001',
    'Unverified Bank Routing Account Modification',
    'Beneficiary IFSC altered from HDFC0001234 to YESB0009876 exactly 4 calendar days prior to invoice dispatch.',
    'YESB0009876 (New Unverified)',
    'CRITICAL',
    35,
    '{"old_ifsc":"HDFC0001234","new_ifsc":"YESB0009876","days_prior":4}'::jsonb
),
(
    '40000000-0000-0000-0000-000000000002',
    '30000000-0000-0000-0000-000000000001',
    'DUPLICATE_HASH',
    'INVOICE',
    'f0000000-0000-0000-0000-000000000002',
    'Soft Duplicate Cosine Similarity Match',
    'Line item descriptions and total amount match settled invoice INV-28412 with 88.4% lexical token similarity.',
    '88.4% Match with INV-28412',
    'HIGH',
    25,
    '{"comparison_invoice_id":"INV-28412","lexical_similarity":0.884}'::jsonb
),
(
    '40000000-0000-0000-0000-000000000003',
    '30000000-0000-0000-0000-000000000001',
    'PO_MISMATCH',
    'PURCHASE_ORDER',
    'd0000000-0000-0000-0000-000000000001',
    'Unit Price Inflation Exceeding PO Contract',
    'Unit rates on workstation supplies billed at ₹3,420 vs ₹2,500 approved in Purchase Order PO-2026-0812.',
    '+37.7% Price Escalation',
    'HIGH',
    20,
    '{"contracted_rate":2500,"billed_rate":3420,"delta_pct":36.8}'::jsonb
),
(
    '40000000-0000-0000-0000-000000000004',
    '30000000-0000-0000-0000-000000000001',
    'BUDGET_OVERRUN',
    'BUDGET',
    'c0000000-0000-0000-0000-000000000001',
    'Q3 Operations Cost Center Threshold Breached',
    'Disbursement of ₹4,82,000 pushes department spend to ₹59,25,000 against approved budget ceiling of ₹50,00,000.',
    '+18.5% Budget Overrun',
    'MEDIUM',
    15,
    '{"budget_cap":5000000,"projected_spend":5925000,"overrun_pct":18.5}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- 12. SEED RISK ASSESSMENTS
INSERT INTO public.risk_assessments (
    id, entity_type, entity_id, overall_score, risk_level, component_scores, reasons
)
VALUES
(
    '50000000-0000-0000-0000-000000000001',
    'INVOICE',
    'f0000000-0000-0000-0000-000000000001', -- INV-28491
    87,
    'CRITICAL',
    '{
        "duplicate_risk": 82,
        "vendor_risk": 91,
        "amount_risk": 74,
        "transaction_risk": 68,
        "budget_risk": 95,
        "po_mismatch_risk": 89,
        "behavioral_risk": 86
    }'::jsonb,
    '[
        "Recent unverified banking destination alteration (4 days prior)",
        "Soft duplicate match against settled disbursement INV-28412",
        "Overrun on Q3 Operations departmental budget allocation (+18.5%)",
        "Purchase Order contract rate variance +36.8%"
    ]'::jsonb
),
(
    '50000000-0000-0000-0000-000000000002',
    'INVOICE',
    'f0000000-0000-0000-0000-000000000003', -- INV-20481
    94,
    'CRITICAL',
    '{
        "duplicate_risk": 45,
        "vendor_risk": 88,
        "amount_risk": 98,
        "transaction_risk": 92,
        "budget_risk": 96,
        "po_mismatch_risk": 99,
        "behavioral_risk": 90
    }'::jsonb,
    '[
        "Discrepancy of ₹6.4L between invoice and Purchase Order PO-2026-0901",
        "Vendor classified under Critical Risk due to repetitive billing spikes"
    ]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- 13. SEED RECOMMENDATIONS
INSERT INTO public.recommendations (
    id, investigation_id, recommendation_type, recommendation_text, confidence, reasoning_summary, status
)
VALUES
(
    '60000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    'HOLD',
    'Maintain autonomous ERP payment hold #WF-9042 and dispatch vendor re-verification token to ABC Supplies chief accounting officer.',
    0.965,
    'The convergence of altered banking destination, near-verbatim duplicate line items, and PO rate discrepancies indicates severe fraud exposure.',
    'PENDING'
),
(
    '60000000-0000-0000-0000-000000000002',
    '30000000-0000-0000-0000-000000000002',
    'REJECT',
    'Reject invoice submission INV-20481 until formal change order PO-2026-0901-REV1 is executed and countersigned by Procurement VP.',
    0.982,
    'Amount deviates by +53.3% from legal commitment without authorized PO amendment.',
    'ACCEPTED'
)
ON CONFLICT (id) DO NOTHING;

-- 14. SEED WORKFLOW TASKS
INSERT INTO public.workflow_tasks (
    id, task_id, entity_type, entity_id, workflow_type, assigned_role,
    assigned_user_id, status, priority, due_date, source
)
VALUES
(
    '70000000-0000-0000-0000-000000000001',
    'WF-9042',
    'INVOICE',
    'f0000000-0000-0000-0000-000000000001',
    'PAYMENT_HOLD',
    'FINANCE_MANAGER',
    'a0000000-0000-0000-0000-000000000002', -- Marcus Sterling
    'ACTIVE',
    'CRITICAL',
    '2026-09-14',
    'ENTERPRO_ERP'
),
(
    '70000000-0000-0000-0000-000000000002',
    'WF-9045',
    'INVOICE',
    'f0000000-0000-0000-0000-000000000003',
    'FORENSIC_REVIEW',
    'FINANCE_ANALYST',
    'a0000000-0000-0000-0000-000000000003', -- Sarah Chen
    'ACTIVE',
    'CRITICAL',
    '2026-09-15',
    'FIN_SHIELD_AI'
),
(
    '70000000-0000-0000-0000-000000000003',
    'WF-8890',
    'VENDOR',
    'b0000000-0000-0000-0000-000000000001',
    'VENDOR_REAUTHENTICATION',
    'FINANCE_ANALYST',
    'a0000000-0000-0000-0000-000000000004', -- Rahul Sharma
    'PENDING',
    'HIGH',
    '2026-09-18',
    'COMPLIANCE_AGENT'
)
ON CONFLICT (id) DO NOTHING;

-- 15. SEED APPROVALS
INSERT INTO public.approvals (
    id, approval_id, entity_type, entity_id, requester_id, approver_id,
    amount, currency, approval_level, status, comments
)
VALUES
(
    '80000000-0000-0000-0000-000000000001',
    'APP-2026-088',
    'INVOICE',
    'f0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000005', -- Ananya Roy
    'a0000000-0000-0000-0000-000000000002', -- Marcus Sterling
    482000.00,
    'INR',
    'LEVEL_2',
    'ESCALATED',
    'Payment halted autonomously by FIN-SHIELD engine. Escalated for forensic review.'
),
(
    '80000000-0000-0000-0000-000000000002',
    'APP-2026-079',
    'INVOICE',
    'f0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    1225000.00,
    'INR',
    'EXECUTIVE',
    'APPROVED',
    'Verified monthly cloud recurring retainer. Approved for clearance.'
)
ON CONFLICT (id) DO NOTHING;

-- 16. SEED ESCALATIONS
INSERT INTO public.escalations (
    id, entity_type, entity_id, reason, severity, assigned_to, status, comments
)
VALUES
(
    '90000000-0000-0000-0000-000000000001',
    'INVOICE',
    'f0000000-0000-0000-0000-000000000001',
    'Altered bank routing coordinates detected immediately prior to invoice disbursement of ₹4,82,000.',
    'CRITICAL',
    'a0000000-0000-0000-0000-000000000002',
    'INVESTIGATING',
    'Vendor controller reached by telephone; awaiting written verification.'
)
ON CONFLICT (id) DO NOTHING;

-- 17. SEED ALERTS
INSERT INTO public.alerts (
    id, alert_type, severity, title, description, entity, entity_id, status, read_state, route
)
VALUES
(
    'a1000000-0000-0000-0000-000000000001',
    'BANK_CHANGE',
    'CRITICAL',
    'High Risk Bank Routing Alteration Detected',
    'Vendor ABC Supplies Pvt Ltd updated settlement bank 4 days before invoice INV-28491 dispatch.',
    'ABC Supplies Pvt Ltd',
    'b0000000-0000-0000-0000-000000000001',
    'ACTIVE',
    FALSE,
    '/investigations/INV-CASE-28491'
),
(
    'a1000000-0000-0000-0000-000000000002',
    'BUDGET_BREACH',
    'CRITICAL',
    'Operations Cost Center Overrun (+18.5%)',
    'Total committed spend on Q3 Operations budget exceeded ceiling of ₹50.0L by ₹9.25L.',
    'Operations Budget',
    'c0000000-0000-0000-0000-000000000001',
    'ACTIVE',
    FALSE,
    '/budgets/c0000000-0000-0000-0000-000000000001'
),
(
    'a1000000-0000-0000-0000-000000000003',
    'DUPLICATE_INVOICE',
    'WARNING',
    'Soft Duplicate Invoice Candidate Flagged',
    'Invoice INV-28491 exhibits 88.4% token similarity with previously cleared INV-28412.',
    'INV-28491',
    'f0000000-0000-0000-0000-000000000001',
    'ACTIVE',
    FALSE,
    '/invoices/f0000000-0000-0000-0000-000000000001'
)
ON CONFLICT (id) DO NOTHING;

-- 18. SEED REPORTS
INSERT INTO public.reports (
    id, report_name, report_type, reporting_period, generated_by, status,
    storage_path, file_size, metadata
)
VALUES
(
    'b1000000-0000-0000-0000-000000000001',
    'Executive Financial Risk & Anomaly Audit',
    'RISK_REPORT',
    'September 2026 MTD',
    'a0000000-0000-0000-0000-000000000001',
    'COMPLETED',
    'investigation-reports/FIN-AUD-2026-0908.pdf',
    '1.8 MB',
    '{"hash":"e8f1c90...3b4a","total_exposure":482000,"status":"VERIFIED"}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- 19. SEED AUDIT LOGS (Immutable Cryptographic Ledger)
INSERT INTO public.audit_logs (
    id, user_id, user_name, user_role, action, entity_type, entity_id,
    previous_state, new_state, reason, source, workflow_reference, timestamp
)
VALUES
(
    'c1000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'FIN-SHIELD Autonomous Sentinel',
    'SYSTEM_DAEMON',
    'PAYMENT_HOLD_ENFORCED',
    'INVOICE',
    'INV-28491',
    '{"status":"UNDER_REVIEW","risk_score":45}'::jsonb,
    '{"status":"ON_HOLD","risk_score":87,"hold_id":"WF-9042"}'::jsonb,
    'Triggered by Critical composite score 87/100 (Bank routing deviation + duplicate hash)',
    'ENTERPRO_ERP_BUS',
    'WF-9042',
    NOW() - INTERVAL '2 hours'
),
(
    'c1000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000002',
    'Marcus Sterling',
    'FINANCE_MANAGER',
    'CASE_ESCALATED',
    'INVESTIGATION',
    'INV-CASE-28491',
    '{"status":"OPEN"}'::jsonb,
    '{"status":"INVESTIGATING","assigned_to":"sarah.c@finshield.ai"}'::jsonb,
    'Assigned to Forensic Accounting team for primary source verification',
    'FIN_SHIELD_UI',
    'WF-9042',
    NOW() - INTERVAL '1 hour 45 minutes'
),
(
    'c1000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000003',
    'Sarah Chen',
    'FINANCE_ANALYST',
    'EVIDENCE_ATTACHED',
    'INVESTIGATION_EVIDENCE',
    '40000000-0000-0000-0000-000000000001',
    '{}'::jsonb,
    '{"evidence_type":"BANK_ROUTING_CHANGE","significance":"CRITICAL"}'::jsonb,
    'Verified IFSC change occurred on 2026-09-04 without secondary callback',
    'ENTERPRO_AUDIT_LOG',
    'WF-9042',
    NOW() - INTERVAL '40 minutes'
);

COMMIT;
