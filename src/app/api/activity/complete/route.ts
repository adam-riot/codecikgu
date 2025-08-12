import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const BodySchema = z.object({
  activityKey: z.string().min(1).max(255),
  activityType: z.enum(['reading', 'video', 'other']).default('other'),
  xp: z.number().int().min(1).max(1000),
  metadata: z.record(z.any()).optional()
})

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const json = await request.json()
    const { activityKey, activityType, xp, metadata } = BodySchema.parse(json)

    // Idempotent: unique(user_id, activity_key)
    const { error: insertErr } = await supabase
      .from('activity_completions')
      .insert({ user_id: user.id, activity_key: activityKey, activity_type: activityType, metadata: metadata || null })

    if (insertErr) {
      // If duplicate, treat as already completed
      if (insertErr.code === '23505') {
        return NextResponse.json({ message: 'Already completed', xpEarned: 0, duplicate: true })
      }
      return NextResponse.json({ error: 'Failed to record completion' }, { status: 500 })
    }

    // Award XP via RPC (atomic)
    const { error: xpErr } = await supabase.rpc('award_xp', {
      p_user_id: user.id,
      p_activity: `activity:${activityKey}`,
      p_xp: xp
    })
    if (xpErr) return NextResponse.json({ error: 'Failed to award XP' }, { status: 500 })

    return NextResponse.json({ success: true, xpEarned: xp })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}


