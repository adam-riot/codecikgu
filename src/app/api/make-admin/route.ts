import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/utils/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // First check if user exists in profiles
    const { data: existingUser, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking user:', checkError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (existingUser) {
      // Update existing user to admin role
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          role: 'admin',
          updated_at: new Date().toISOString()
        })
        .eq('id', existingUser.id)

      if (updateError) {
        console.error('Error updating user role:', updateError)
        return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true, 
        message: `User ${email} is now an admin`,
        user: {
          id: existingUser.id,
          email: existingUser.email,
          role: 'admin'
        }
      })
    } else {
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
        console.error('Error creating admin user:', insertError)
        return NextResponse.json({ error: 'Failed to create admin user' }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true, 
        message: `Admin user ${email} created successfully`,
        user: {
          id: newUser.id,
          email: newUser.email,
          role: 'admin'
        }
      })
    }
  } catch (error) {
    console.error('Error in make-admin API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
