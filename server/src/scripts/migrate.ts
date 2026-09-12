import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const { Client } = pg

async function runMigrations() {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    console.error('❌ Error: DATABASE_URL is not set in server/.env')
    process.exit(1)
  }

  if (databaseUrl.includes('[YOUR-PASSWORD]')) {
    console.error('❌ Error: You must replace [YOUR-PASSWORD] in server/.env with your real Supabase database password!')
    console.error('Example: DATABASE_URL=postgresql://postgres.tlxlilpzngyggyilygst:MySecretPassword123@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres')
    process.exit(1)
  }

  console.log('🔄 Connecting to Supabase PostgreSQL database...')
  
  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  })

  try {
    await client.connect()
    console.log('✅ Connected successfully to Supabase PostgreSQL!')

    const migrationFiles = [
      { name: 'Phase 2A: Schema (18 Tables)', file: '../../../supabase/migrations/20260912000001_initial_schema.sql' },
      { name: 'Phase 2B: RLS Security Policies', file: '../../../supabase/migrations/20260912000002_rls_policies.sql' },
      { name: 'Phase 2D: Storage Buckets & Policies', file: '../../../supabase/migrations/20260912000003_storage.sql' },
      { name: 'Phase 2C: Realistic Seed Dataset', file: '../../../supabase/seed.sql' }
    ]

    for (const item of migrationFiles) {
      const fullPath = path.resolve(__dirname, item.file)
      console.log(`\n⏳ Executing: ${item.name} (${path.basename(fullPath)})...`)
      
      if (!fs.existsSync(fullPath)) {
        throw new Error(`File not found: ${fullPath}`)
      }

      const sql = fs.readFileSync(fullPath, 'utf8')
      await client.query(sql)
      console.log(`✅ Completed: ${item.name}`)
    }

    console.log('\n🎉 ALL MIGRATIONS AND SEED DATA APPLIED SUCCESSFULLY!')
  } catch (err: any) {
    console.error('\n❌ Migration failed:', err.message)
    if (err.message.includes('password authentication failed')) {
      console.error('👉 Tip: Double check your database password in server/.env')
    }
    process.exit(1)
  } finally {
    await client.end()
  }
}

runMigrations()
