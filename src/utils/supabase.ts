// src/utils/supabase.ts

import { createClient } from '@supabase/supabase-js'

// Baca pembolehubah persekitaran dengan cara yang paling serasi
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Semak jika pembolehubah wujud sebelum mencipta client
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL or Anon Key is missing from environment variables.')
}

// Cipta dan eksport client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
