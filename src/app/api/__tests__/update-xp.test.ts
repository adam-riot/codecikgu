import { NextRequest } from 'next/server'
import { POST } from '../update-xp/route'

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

// Mock Next.js cookies
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => new Map())
}))

describe('/api/update-xp', () => {
  const mockSupabase = require('@supabase/auth-helpers-nextjs').createRouteHandlerClient()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  const createRequest = (body: any): NextRequest => {
    return new NextRequest('http://localhost:3000/api/update-xp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })
  }

  describe('POST /api/update-xp', () => {
    it('should return 405 for non-POST requests', async () => {
      const request = new NextRequest('http://localhost:3000/api/update-xp', {
        method: 'GET'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(405)
      expect(data.error).toBe('Method not allowed')
    })

    it('should return 400 for invalid input data', async () => {
      const request = createRequest({
        userId: 'invalid-uuid',
        activity: '',
        xpAmount: -1
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid input data')
      expect(data.details).toBeDefined()
    })

    it('should return 401 for unauthenticated requests', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      })

      const request = createRequest({
        userId: '123e4567-e89b-12d3-a456-426614174000',
        activity: 'test activity',
        xpAmount: 10
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 403 when user tries to update another user\'s XP', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null
      })

      const request = createRequest({
        userId: 'user-2',
        activity: 'test activity',
        xpAmount: 10
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Forbidden - can only update own XP')
    })

    it('should return 404 when user profile not found', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null
      })

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Profile not found' }
            })
          }))
        }))
      })

      const request = createRequest({
        userId: 'user-1',
        activity: 'test activity',
        xpAmount: 10
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('User profile not found')
    })

    it('should successfully update XP', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null
      })

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: { id: 'user-1', xp: 100 },
              error: null
            })
          }))
        })),
        insert: jest.fn().mockResolvedValue({ error: null }),
        update: jest.fn().mockResolvedValue({ error: null })
      })

      const request = createRequest({
        userId: 'user-1',
        activity: 'test activity',
        xpAmount: 50
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('XP updated successfully')
      expect(data.newXp).toBe(150)
      expect(data.activity).toBe('test activity')
      expect(data.xpEarned).toBe(50)
    })

    it('should handle XP log insertion error', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null
      })

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: { id: 'user-1', xp: 100 },
              error: null
            })
          }))
        })),
        insert: jest.fn().mockResolvedValue({ 
          error: { message: 'Database error' } 
        })
      })

      const request = createRequest({
        userId: 'user-1',
        activity: 'test activity',
        xpAmount: 50
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to log XP activity')
    })

    it('should handle profile update error', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null
      })

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: { id: 'user-1', xp: 100 },
              error: null
            })
          }))
        })),
        insert: jest.fn().mockResolvedValue({ error: null }),
        update: jest.fn().mockResolvedValue({ 
          error: { message: 'Update failed' } 
        })
      })

      const request = createRequest({
        userId: 'user-1',
        activity: 'test activity',
        xpAmount: 50
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to update XP')
    })

    it('should handle unexpected errors', async () => {
      mockSupabase.auth.getUser.mockRejectedValue(new Error('Unexpected error'))

      const request = createRequest({
        userId: 'user-1',
        activity: 'test activity',
        xpAmount: 50
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
    })

    it('should validate XP amount limits', async () => {
      const request = createRequest({
        userId: '123e4567-e89b-12d3-a456-426614174000',
        activity: 'test activity',
        xpAmount: 15000 // Exceeds max limit
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid input data')
    })

    it('should validate activity length', async () => {
      const longActivity = 'a'.repeat(300) // Exceeds max length
      const request = createRequest({
        userId: '123e4567-e89b-12d3-a456-426614174000',
        activity: longActivity,
        xpAmount: 50
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid input data')
    })
  })
}) 