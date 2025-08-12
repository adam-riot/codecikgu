import { POST } from '../update-xp/route'

// Mock Next.js modules
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => new Map())
}))

// Mock Supabase
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn()
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn()
        }))
      })),
      insert: jest.fn(),
      update: jest.fn()
    }))
  }))
}))

describe('/api/update-xp', () => {
  const mockSupabase = jest.requireMock('@supabase/auth-helpers-nextjs').createRouteHandlerClient()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 405 for non-POST requests', async () => {
    const request = new Request('http://localhost:3000/api/update-xp', {
      method: 'GET'
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(405)
    expect(data.error).toBe('Method not allowed')
  })

  it('should return 400 for invalid input', async () => {
    const request = new Request('http://localhost:3000/api/update-xp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: 'invalid-uuid',
        activity: '',
        xpAmount: -1
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid input data')
  })

  it('should return 401 for unauthenticated requests', async () => {
    // Mock unauthenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    })

    const request = new Request('http://localhost:3000/api/update-xp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: '123e4567-e89b-12d3-a456-426614174000',
        activity: 'test activity',
        xpAmount: 10
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return 403 when user tries to update another user\'s XP', async () => {
    // Mock authenticated user with different ID
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'different-user-id' } },
      error: null
    })

    const request = new Request('http://localhost:3000/api/update-xp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: '123e4567-e89b-12d3-a456-426614174000',
        activity: 'test activity',
        xpAmount: 10
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toBe('Forbidden - can only update own XP')
  })

  it('should return 404 when user profile not found', async () => {
    // Mock authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: '123e4567-e89b-12d3-a456-426614174000' } },
      error: null
    })

    // Mock profile not found
    const mockFrom = mockSupabase.from
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { code: 'PGRST116' }
          })
        })
      })
    })

    const request = new Request('http://localhost:3000/api/update-xp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: '123e4567-e89b-12d3-a456-426614174000',
        activity: 'test activity',
        xpAmount: 10
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('User profile not found')
  })

  it('should successfully update XP for valid request', async () => {
    // Mock authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: '123e4567-e89b-12d3-a456-426614174000' } },
      error: null
    })

    // Mock existing profile
    const mockFrom = mockSupabase.from
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: '123e4567-e89b-12d3-a456-426614174000', xp: 100 },
            error: null
          })
        })
      }),
      insert: jest.fn().mockResolvedValue({ error: null }),
      update: jest.fn().mockResolvedValue({ error: null })
    })

    const request = new Request('http://localhost:3000/api/update-xp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: '123e4567-e89b-12d3-a456-426614174000',
        activity: 'test activity',
        xpAmount: 10
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('XP updated successfully')
    expect(data.newXp).toBe(110)
    expect(data.xpEarned).toBe(10)
  })
}) 