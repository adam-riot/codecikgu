// src/utils/supabase.ts

import { createClient } from '@supabase/supabase-js'

// Define custom user type to avoid TypeScript errors
export interface CustomUser {
  id: string
  email?: string
  user_metadata?: {
    role?: string
    full_name?: string
    phone?: string
    school?: string
    grade?: string
    birth_date?: string
    gender?: string
    address?: string
    city?: string
    state?: string
    postcode?: string
    emergency_contact_name?: string
    emergency_contact_phone?: string
    [key: string]: any
  }
  app_metadata?: {
    role?: string
    [key: string]: any
  }
  created_at?: string
  updated_at?: string
  [key: string]: any
}

// Baca pembolehubah persekitaran dengan cara yang paling serasi
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Semak jika pembolehubah wujud sebelum mencipta client
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL or Anon Key is missing from environment variables.')
}

// Cipta dan eksport client Supabase dengan custom types
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function untuk type-safe user role detection
export const getUserRole = (user: CustomUser | null): string => {
  if (!user) return 'awam'
  
  // Check user_metadata for role
  const metadataRole = user.user_metadata?.role
  if (metadataRole) {
    console.log('Found role in user_metadata:', metadataRole, 'for user:', user.email)
    return metadataRole
  }
  
  // Check app_metadata for role (fallback)
  const appMetadataRole = user.app_metadata?.role
  if (appMetadataRole) {
    console.log('Found role in app_metadata:', appMetadataRole, 'for user:', user.email)
    return appMetadataRole
  }
  
  // Fallback based on email pattern
  if (user.email?.includes('admin')) {
    console.log('Detected admin role from email:', user.email)
    return 'admin'
  }
  
  // Default fallback
  console.log('Using default role awam for user:', user.email)
  return 'awam'
}

