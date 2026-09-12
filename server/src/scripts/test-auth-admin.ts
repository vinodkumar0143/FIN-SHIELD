import pg from 'pg'
import dotenv from 'dotenv'
dotenv.config()

const { Pool } = pg
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

async function testAsAuthAdmin() {
  try {
    const client = await pool.connect()
    try {
      console.log('Switching role to supabase_auth_admin...')
      await client.query('SET ROLE supabase_auth_admin;')
      
      console.log('Querying auth.users as supabase_auth_admin...')
      const res = await client.query('SELECT * FROM auth.users LIMIT 5;')
      console.log('Users query success, count:', res.rowCount)

      console.log('Querying auth.identities as supabase_auth_admin...')
      const idRes = await client.query('SELECT * FROM auth.identities LIMIT 5;')
      console.log('Identities query success, count:', idRes.rowCount)

      console.log('Testing join...')
      const joinRes = await client.query(`
        SELECT u.id, u.email, count(i.id) 
        FROM auth.users u 
        LEFT JOIN auth.identities i ON u.id = i.user_id 
        GROUP BY u.id, u.email;
      `)
      console.log('Join success:', joinRes.rows)

    } catch (queryErr: any) {
      console.error('Query as supabase_auth_admin FAILED:', queryErr)
    } finally {
      client.release()
    }
  } catch (err: any) {
    console.error('Connection error:', err.message)
  } finally {
    await pool.end()
  }
}

testAsAuthAdmin()
