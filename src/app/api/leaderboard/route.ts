import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const QuerySchema = z.object({
  period: z.enum(['weekly', 'monthly', 'all']).default('weekly'),
  limit: z.coerce.number().int().min(1).max(100).default(20)
})

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const params = Object.fromEntries(url.searchParams.entries())
    const { period, limit } = QuerySchema.parse({
      period: (params.period || 'weekly').toLowerCase(),
      limit: params.limit ? Number(params.limit) : 20
    })

    const supabase = createRouteHandlerClient({ cookies })

    const { data, error } = await supabase.rpc('get_leaderboard', {
      p_period: period === 'all' ? 'all' : period,
      p_limit: limit
    })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
    }

    return NextResponse.json({ period, limit, results: data || [] })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}


