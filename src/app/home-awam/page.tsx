'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomeAwam() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to dashboard-awam
    router.replace('/dashboard-awam')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black flex items-center justify-center">
      <div className="glass-dark rounded-2xl p-8 text-center">
        <div className="text-2xl text-gradient loading-dots">Mengalihkan ke dashboard awam</div>
      </div>
    </div>
  )
}

