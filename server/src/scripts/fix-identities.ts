import pg from 'pg'
import dotenv from 'dotenv'
dotenv.config()

const { Pool } = pg
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

async function fix() {
  try {
    console.log('1. Updating raju123 identity email_verified to true...')
    await pool.query(`
      UPDATE auth.identities
      SET identity_data = jsonb_set(identity_data, '{email_verified}', 'true'::jsonb)
      WHERE email = 'raju123@gmail.com';
    `)

    console.log('2. Inserting missing identities for the 5 seed accounts...')
    const seedUsers = [
      { id: 'a0000000-0000-0000-0000-000000000001', email: 'admin@finshield.ai', name: 'Dr. Evelyn Vance', role: 'ADMIN' },
      { id: 'a0000000-0000-0000-0000-000000000002', email: 'marcus.s@finshield.ai', name: 'Marcus Sterling', role: 'FINANCE_MANAGER' },
      { id: 'a0000000-0000-0000-0000-000000000003', email: 'sarah.c@finshield.ai', name: 'Sarah Chen', role: 'FINANCE_ANALYST' },
      { id: 'a0000000-0000-0000-0000-000000000004', email: 'rahul.s@finshield.ai', name: 'Rahul Sharma', role: 'FINANCE_ANALYST' },
      { id: 'a0000000-0000-0000-0000-000000000005', email: 'ananya.r@finshield.ai', name: 'Ananya Roy', role: 'EMPLOYEE' }
    ]

    for (const u of seedUsers) {
      await pool.query(`
        INSERT INTO auth.identities (
          id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
        ) VALUES (
          gen_random_uuid(),
          $1::text,
          $2::uuid,
          jsonb_build_object(
            'sub', $1::text,
            'email', $3::text,
            'email_verified', true,
            'full_name', $4::text,
            'role', $5::text
          ),
          'email',
          NOW(),
          NOW(),
          NOW()
        )
        ON CONFLICT (provider_id, provider) DO UPDATE SET
          identity_data = EXCLUDED.identity_data,
          updated_at = NOW();
      `, [u.id, u.id, u.email, u.name, u.role])
    }

    console.log('Identities updated successfully!')
  } catch (err: any) {
    console.error('Fix error:', err.message)
  } finally {
    await pool.end()
  }
}

fix()
