import pg from 'pg'
import dotenv from 'dotenv'
dotenv.config()

const { Pool } = pg
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

async function check() {
  try {
    const res = await pool.query(`
      SELECT id, email, created_at, email_confirmed_at 
      FROM auth.users;
    `)
    console.log('Direct PG auth.users count:', res.rows.length)
    console.log('Direct PG auth.users rows:', res.rows)
  } catch (err: any) {
    console.error('Direct PG query error:', err.message)
  } finally {
    await pool.end()
  }
}

check()
