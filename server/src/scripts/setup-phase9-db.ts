import dotenv from 'dotenv'
import pg from 'pg'

dotenv.config()

const { Client } = pg

export async function setupPhase9Database() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.warn('DATABASE_URL not found in environment. Skipping direct pg migration.')
    return
  }

  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  })

  try {
    await client.connect()
    console.log('Connected to Supabase PostgreSQL for Phase 9 setup...')

    // 1. Create public.system_settings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.system_settings (
          key TEXT PRIMARY KEY,
          value JSONB NOT NULL,
          description TEXT,
          updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      -- Index on updated_at
      CREATE INDEX IF NOT EXISTS idx_system_settings_updated_at ON public.system_settings(updated_at);
    `)

    // 2. Insert default configuration if not exists
    const defaultSettings = {
      orgName: 'Apex Global Technologies Corp',
      currency: 'INR',
      currencySymbol: '₹',
      timezone: 'Asia/Kolkata (IST)',
      dateFormat: 'DD/MM/YYYY',
      fiscalYearStart: 'April',
      riskThresholdHigh: 70,
      riskThresholdCritical: 80,
      budgetAlertThreshold: 85,
      budgetBreachThreshold: 100,
      autoHoldEnabled: true,
      emailAlertsEnabled: true,
      slackAlertsEnabled: false,
      forecastDefaultHorizon: '30D',
      aiModelPreference: 'qwen-plus',
      immutableAuditLedger: true
    }

    await client.query(`
      INSERT INTO public.system_settings (key, value, description)
      VALUES (
        'app_config',
        $1::jsonb,
        'Enterprise global platform and financial risk intelligence preferences'
      )
      ON CONFLICT (key) DO NOTHING;
    `, [JSON.stringify(defaultSettings)])

    console.log('✅ public.system_settings table and default configuration created successfully!')
  } catch (err: any) {
    console.error('Phase 9 DB Setup notice:', err.message)
  } finally {
    await client.end()
  }
}

// Run standalone if executed directly
if (process.argv[1]?.includes('setup-phase9-db')) {
  setupPhase9Database().then(() => process.exit(0)).catch(() => process.exit(1))
}
