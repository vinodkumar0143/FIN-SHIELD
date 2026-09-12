import pg from 'pg'
import dotenv from 'dotenv'
dotenv.config()

const { Pool } = pg
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

async function confirmUsers() {
  try {
    const res = await pool.query(`
      UPDATE auth.users
      SET email_confirmed_at = NOW()
      WHERE email_confirmed_at IS NULL;
    `)
    console.log('Confirmed users count:', res.rowCount)

    const list = await pool.query(`
      SELECT id, email, email_confirmed_at FROM auth.users;
    `)
    console.log('All auth users now:', list.rows)
  } catch (err: any) {
    console.error('Error confirming users:', err.message)
  } finally {
    await pool.end()
  }
}

confirmUsers()
