'use client'

import { useEffect, useState } from 'react'

export default function EnvironmentStatus() {
  const [hasSupabaseConfig, setHasSupabaseConfig] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    setHasSupabaseConfig(Boolean(supabaseUrl && supabaseKey))
  }, [])

  if (!isClient) return null

  if (hasSupabaseConfig) {
    return null // Don't show anything if config is present
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-yellow-500 text-black p-4 rounded-lg shadow-lg max-w-sm">
      <div className="font-bold mb-2">⚠️ Configuration Required</div>
      <div className="text-sm mb-2">
        Supabase environment variables are not configured. Some features may not work properly.
      </div>
      <div className="text-xs text-gray-700">
        Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment.
      </div>
    </div>
  )
}
