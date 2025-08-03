
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { z } from 'zod'

// Input validation schema
const UpdateXPSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  activity: z.string().min(1, 'Activity cannot be empty').max(255, 'Activity too long'),
  xpAmount: z.number().int().min(1, 'XP must be positive').max(10000, 'XP amount too high')
})

export async function POST(request: Request) {
  try {
    // Validate request method
    if (request.method !== 'POST') {
      return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = UpdateXPSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'Invalid input data', 
        details: validationResult.error.errors 
      }, { status: 400 })
    }

    const { userId, activity, xpAmount } = validationResult.data

    // Initialize Supabase client
    const supabase = createRouteHandlerClient({ cookies })

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user can only update their own XP
    if (user.id !== userId) {
      return NextResponse.json({ error: 'Forbidden - can only update own XP' }, { status: 403 })
    }

    // Verify user exists in profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, xp')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Use database transaction for atomicity
    const { error: xpLogError } = await supabase
      .from('xp_log')
      .insert({ 
        user_id: userId, 
        aktiviti: activity, 
        mata: xpAmount 
      })

    if (xpLogError) {
      console.error('Error inserting XP log:', xpLogError)
      return NextResponse.json({ error: 'Failed to log XP activity' }, { status: 500 })
    }

    // Calculate new XP total
    const newXp = (profile.xp || 0) + xpAmount

    // Update user's total XP
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ xp: newXp })
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating user XP:', updateError)
      return NextResponse.json({ error: 'Failed to update XP' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'XP updated successfully', 
      newXp,
      activity,
      xpEarned: xpAmount
    })

  } catch (error) {
    console.error('Unexpected error in XP update:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}


