import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const EventSchema = z.object({
  eventType: z.string().min(1).max(100),
  metadata: z.record(z.any()).optional()
})

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { eventType, metadata } = EventSchema.parse(body)

    const { error } = await supabase
      .from('events')
      .insert({ user_id: user.id, event_type: eventType, metadata: metadata || null })

    if (error) return NextResponse.json({ error: 'Failed to log event' }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}


