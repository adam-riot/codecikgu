
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { userId, activity, xpAmount } = await request.json()
  const supabase = createRouteHandlerClient({ cookies })

  // Insert into xp_log
  const { error: xpLogError } = await supabase
    .from('xp_log')
    .insert({ user_id: userId, aktiviti: activity, mata: xpAmount })

  if (xpLogError) {
    console.error('Error inserting XP log:', xpLogError)
    return NextResponse.json({ error: xpLogError.message }, { status: 500 })
  }

  // Update user's total XP in profiles table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('xp')
    .eq('id', userId)
    .single()

  if (profileError) {
    console.error('Error fetching profile for XP update:', profileError)
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  const newXp = (profile?.xp || 0) + xpAmount

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ xp: newXp })
    .eq('id', userId)

  if (updateError) {
    console.error('Error updating user XP:', updateError)
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'XP updated successfully', newXp })
}


