import { supabaseAdmin } from '../config/supabase.js'

async function testAdmin() {
  console.log('Testing supabaseAdmin.auth.admin.listUsers()...')
  const { data, error } = await supabaseAdmin.auth.admin.listUsers()
  if (error) {
    console.error('listUsers error:', error)
  } else {
    console.log('listUsers SUCCESS! Total users:', data.users.length)
    data.users.forEach(u => console.log(`- ${u.email} (${u.id})`))
  }
}

testAdmin()
