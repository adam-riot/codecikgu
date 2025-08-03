import '@testing-library/jest-dom'
import React from 'react'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    }
  },
}))

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Supabase
jest.mock('@/utils/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } }
      })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
          order: jest.fn(() => ({ data: [], error: null }))
        })),
        order: jest.fn(() => ({ data: [], error: null }))
      })),
      insert: jest.fn(() => ({ data: null, error: null })),
      update: jest.fn(() => ({ data: null, error: null })),
      delete: jest.fn(() => ({ data: null, error: null })),
    })),
  },
  getUserProfile: jest.fn(),
  getUserRole: jest.fn(),
  getUserDisplayName: jest.fn(),
  isAdmin: jest.fn(),
  isStudent: jest.fn(),
  isPublic: jest.fn(),
  getDashboardUrl: jest.fn(),
  getHomeUrl: jest.fn(),
  hasAdminAccess: jest.fn(),
  hasStudentAccess: jest.fn(),
  getRoleDisplayInfo: jest.fn(),
  updateUserProfile: jest.fn(),
  createUserProfile: jest.fn(),
  clearProfileCache: jest.fn(),
}))

// Mock Monaco Editor
jest.mock('@monaco-editor/react', () => {
  return function MockMonacoEditor(props) {
    const { value, onChange, ...otherProps } = props
    return React.createElement('textarea', {
      'data-testid': 'monaco-editor',
      value: value,
      onChange: (e) => onChange?.(e.target.value),
      ...otherProps
    })
  }
})

// Mock Intersection Observer
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock Resize Observer
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock Performance API
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByType: jest.fn(() => []),
  },
  writable: true,
})

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.sessionStorage = sessionStorageMock

// Mock fetch
global.fetch = jest.fn()

// Mock Request and Response globals for API testing
global.Request = class Request {
  constructor(url, options = {}) {
    this.url = url
    this.method = options.method || 'GET'
    this.headers = new Map(Object.entries(options.headers || {}))
    this.body = options.body || null
  }
  
  async json() {
    return this.body ? JSON.parse(this.body) : {}
  }
}

global.Response = class Response {
  constructor(body, options = {}) {
    this.body = body
    this.status = options.status || 200
    this.statusText = options.statusText || 'OK'
    this.headers = new Map(Object.entries(options.headers || {}))
  }
  
  async json() {
    return typeof this.body === 'string' ? JSON.parse(this.body) : this.body
  }
}

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return
    }
    originalConsoleError.call(console, ...args)
  }
  
  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('componentWillReceiveProps') ||
       args[0].includes('componentWillUpdate'))
    ) {
      return
    }
    originalConsoleWarn.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalConsoleError
  console.warn = originalConsoleWarn
})

// Custom matchers for testing
expect.extend({
  toHaveBeenCalledWithMatch(received, ...expected) {
    const pass = received.mock.calls.some((call) =>
      expected.every((arg, index) => {
        if (typeof arg === 'object') {
          return expect(call[index]).toMatchObject(arg)
        }
        return call[index] === arg
      })
    )
    
    if (pass) {
      return {
        message: () =>
          `expected ${received.getMockName()} not to have been called with arguments matching ${expected}`,
        pass: true,
      }
    } else {
      return {
        message: () =>
          `expected ${received.getMockName()} to have been called with arguments matching ${expected}`,
        pass: false,
      }
    }
  },
})

// Global test utilities
global.testUtils = {
  waitFor: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  mockIntersectionObserver: (isIntersecting = true) => {
    const mockIntersectionObserver = jest.fn()
    mockIntersectionObserver.mockReturnValue({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null,
    })
    global.IntersectionObserver = mockIntersectionObserver
    return mockIntersectionObserver
  },
  mockResizeObserver: () => {
    const mockResizeObserver = jest.fn()
    mockResizeObserver.mockReturnValue({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null,
    })
    global.ResizeObserver = mockResizeObserver
    return mockResizeObserver
  },
} 