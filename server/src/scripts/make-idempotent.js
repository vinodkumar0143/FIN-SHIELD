import fs from 'fs'

// 1. Initial schema: add DROP TRIGGER IF EXISTS
let schema = fs.readFileSync('../supabase/migrations/20260912000001_initial_schema.sql', 'utf8')
schema = schema.replace(/CREATE TRIGGER\s+(\w+)\s+BEFORE UPDATE ON\s+([^\s]+)/g, 'DROP TRIGGER IF EXISTS $1 ON $2;\nCREATE TRIGGER $1\n    BEFORE UPDATE ON $2')
fs.writeFileSync('../supabase/migrations/20260912000001_initial_schema.sql', schema, 'utf8')
console.log('✅ Updated initial schema triggers')

// 2. RLS policies: add DROP POLICY IF EXISTS
let rls = fs.readFileSync('../supabase/migrations/20260912000002_rls_policies.sql', 'utf8')
rls = rls.replace(/CREATE POLICY\s+"([^"]+)"\s+ON\s+([^\s]+)/g, 'DROP POLICY IF EXISTS "$1" ON $2;\nCREATE POLICY "$1" ON $2')
fs.writeFileSync('../supabase/migrations/20260912000002_rls_policies.sql', rls, 'utf8')
console.log('✅ Updated RLS policies')

// 3. Storage policies: add DROP POLICY IF EXISTS
let storage = fs.readFileSync('../supabase/migrations/20260912000003_storage.sql', 'utf8')
storage = storage.replace(/CREATE POLICY\s+"([^"]+)"\s*\nON\s+([^\s]+)/g, 'DROP POLICY IF EXISTS "$1" ON $2;\nCREATE POLICY "$1"\nON $2')
fs.writeFileSync('../supabase/migrations/20260912000003_storage.sql', storage, 'utf8')
console.log('✅ Updated Storage policies')
