import { supabaseAdmin } from '../config/supabase.js'

async function main() {
  console.log('--- Checking Supabase Auth Users ---')
  const { data: users, error: usersErr } = await supabaseAdmin.auth.admin.listUsers()
  if (usersErr) {
    console.error('listUsers error:', usersErr)
  } else {
    console.log(`Found ${users.users.length} auth users:`)
    users.users.forEach(u => {
      console.log(`- ${u.email} (id: ${u.id}, confirmed: ${!!u.email_confirmed_at}, role: ${u.role})`)
    })
  }

  console.log('\n--- Checking public.profiles ---')
  const { data: profiles, error: profErr } = await supabaseAdmin.from('profiles').select('*')
  if (profErr) {
    console.error('profiles query error:', profErr)
  } else {
    console.log(`Found ${profiles?.length} profiles:`)
    profiles?.forEach(p => {
      console.log(`- ${p.full_name} <${p.email}> [${p.role}] (id: ${p.id})`)
    })
  }
}

main().catch(console.error)
