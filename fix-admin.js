// Simple script to fix admin user issue
// Run this with: node fix-admin.js

const { createClient } = require('@supabase/supabase-js')

// You need to set these environment variables or replace with your actual values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

if (supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
  console.log('❌ Please set your Supabase environment variables:')
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function makeUserAdmin(email) {
  try {
    console.log(`🔍 Checking if user ${email} exists...`)
    
    // First check if user exists in profiles
    const { data: existingUser, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking user:', checkError)
      return false
    }

    if (existingUser) {
      console.log(`✅ User found: ${existingUser.email} (current role: ${existingUser.role})`)
      
      if (existingUser.role === 'admin') {
        console.log('✅ User is already an admin!')
        return true
      }
      
      // Update existing user to admin role
      console.log('🔄 Updating user role to admin...')
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          role: 'admin',
          updated_at: new Date().toISOString()
        })
        .eq('id', existingUser.id)

      if (updateError) {
        console.error('❌ Error updating user role:', updateError)
        return false
      }

      console.log('✅ User role updated to admin successfully!')
      return true
    } else {
      console.log(`❌ User ${email} not found in profiles table`)
      console.log('🔄 Creating new admin user...')
      
      // Create new admin user
      const { data: newUser, error: insertError } = await supabase
        .from('profiles')
        .insert({
          email: email,
          role: 'admin',
          name: email.split('@')[0],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (insertError) {
        console.error('❌ Error creating admin user:', insertError)
        return false
      }

      console.log('✅ Admin user created successfully!')
      return true
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return false
  }
}

async function main() {
  console.log('🚀 Starting admin user fix...')
  
  const email = 'adamsofi@codecikgu.com'
  const success = await makeUserAdmin(email)
  
  if (success) {
    console.log('🎉 Admin user fix completed successfully!')
    console.log(`✅ ${email} is now an admin user`)
  } else {
    console.log('❌ Failed to fix admin user')
    process.exit(1)
  }
}

main()
