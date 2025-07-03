'use client'

import dynamic from 'next/dynamic'

// Gunakan dynamic import untuk menghindari SSR issues
const ChallengeClient = dynamic(
  () => import('@/components/challenges/ChallengeClient'),
  { ssr: false, loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black flex items-center justify-center">
      <div className="glass-dark rounded-2xl p-8 text-center">
        <div className="text-2xl text-gradient loading-dots">Memuat cabaran</div>
      </div>
    </div>
  )}
)

export default function ChallengePage() {
  return <ChallengeClient />
}

