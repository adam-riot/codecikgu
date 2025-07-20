'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'
import { useRouter } from 'next/navigation'
import { BookOpen, Video, FileText, Upload, Trophy, Star, Clock, CheckCircle, Code } from 'lucide-react'
import Link from 'next/link'
import { SkeletonStats, SkeletonCard } from '@/components/LoadingSkeletons'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { AchievementSummary } from '@/components/AchievementSystem'
import { useMobileGestures } from '@/components/MobileGestures'

interface Challenge {
  id: string
  title: string
  description: string
  type: 'quiz' | 'video' | 'reading' | 'upload'
  subject: string
  tingkatan: string
  xp_reward: number
  deadline: string | null
  is_active: boolean
  created_at: string
  challenge_submissions?: {
    id: string
    score: number
    max_score: number
    passed: boolean
    xp_earned: number
    submitted_at: string
  }[]
  submission?: {
    id: string
    score: number
    max_score: number
    passed: boolean
    xp_earned: number
    submitted_at: string
  }
}

interface UserStats {
  total_xp: number
  completed_challenges: number
  total_challenges: number
  average_score: number
}

interface User {
  id: string
  email?: string
}

export default function DashboardMurid() {
  const router = useRouter()
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [userStats, setUserStats] = useState<UserStats>({
    total_xp: 0,
    completed_challenges: 0,
    total_challenges: 0,
    average_score: 0
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('available')
    const [/* user */, setUser] = useState<User | null>(null)
  
  // Add mobile gesture support
  useMobileGestures()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)
      
      try {
        // Fetch challenges with user submissions
        const { data: challengesData } = await supabase
          .from('challenges')
          .select(`
            *,
            challenge_submissions!left (
              id,
              score,
              max_score,
              passed,
              xp_earned,
              submitted_at
            )
          `)
          .eq('is_active', true)
          .eq('challenge_submissions.user_id', user.id)
          .order('created_at', { ascending: false })

        if (challengesData) {
          const formattedChallenges = challengesData.map((challenge: Challenge) => ({
            ...challenge,
            submission: challenge.challenge_submissions?.[0] || null
          }))
          setChallenges(formattedChallenges)
        }

        // Fetch user statistics
        const { data: statsData } = await supabase
          .rpc('get_user_challenge_stats', { user_uuid: user.id })

        if (statsData && statsData.length > 0) {
          setUserStats(statsData[0])
        }

      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'quiz': return BookOpen
      case 'video': return Video
      case 'reading': return FileText
      case 'upload': return Upload
      default: return BookOpen
    }
  }

  const getChallengeTypeLabel = (type: string) => {
    switch (type) {
      case 'quiz': return '📝 Kuiz'
      case 'video': return '🎥 Video'
      case 'reading': return '📖 Bacaan'
      case 'upload': return '📤 Upload'
      default: return type
    }
  }

  const getStatusBadge = (challenge: Challenge) => {
    if (challenge.submission) {
      if (challenge.submission.passed) {
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Selesai
          </span>
        )
      } else {
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
            <Clock className="w-3 h-3 mr-1" />
            Perlu Diperbaiki
          </span>
        )
      }
    }
    
    if (challenge.deadline) {
      const isExpired = new Date(challenge.deadline) < new Date()
      if (isExpired) {
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
            Tamat Tempoh
          </span>
        )
      }
    }
    
    return (
      <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
        Tersedia
      </span>
    )
  }

  const handleStartChallenge = (challengeId: string, type: string) => {
    router.push(`/challenges/${challengeId}?type=${type}`)
  }

  const filteredChallenges = challenges.filter(challenge => {
    if (activeTab === 'available') {
      return !challenge.submission || !challenge.submission.passed
    } else if (activeTab === 'completed') {
      return challenge.submission && challenge.submission.passed
    }
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black">
        {/* Hero Section Skeleton */}
        <section className="relative py-16 overflow-hidden bg-circuit">
          <div className="absolute inset-0 bg-grid opacity-10"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-6xl mx-auto text-center">
              <div className="h-12 bg-gray-700 rounded w-64 mx-auto mb-6 animate-pulse"></div>
              <div className="h-6 bg-gray-700 rounded w-96 mx-auto mb-8 animate-pulse"></div>
            </div>
          </div>
        </section>

        {/* Stats Section Skeleton */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <SkeletonStats />
            </div>
          </div>
        </section>

        {/* Challenges Section Skeleton */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="h-8 bg-gray-700 rounded w-48 mb-8 animate-pulse"></div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black">
      <Breadcrumbs />
      
      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden bg-circuit">
        <div className="absolute inset-0 bg-grid opacity-10"></div>
        <div className="absolute top-10 right-10 w-40 h-40 bg-gradient-to-br from-electric-blue/20 to-neon-cyan/20 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-gradient-to-br from-neon-green/20 to-electric-blue/20 rounded-full blur-xl animate-float" style={{animationDelay: '3s'}}></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gradient text-center">
              🎓 Dashboard Murid
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 text-center mb-8">
              Jelajahi cabaran dan tingkatkan kemahiran anda
            </p>
            
            {/* Quick Access Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Link href="/playground" className="glass-dark rounded-xl p-6 card-hover neon-glow-green group">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-r from-neon-green/20 to-electric-blue/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <Code className="w-8 h-8 text-neon-green" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">🚀 CodeCikgu Playground</h3>
                    <p className="text-gray-400">Tulis, edit dan jalankan kod dalam pelbagai bahasa pengaturcaraan</p>
                  </div>
                </div>
              </Link>
              
              <Link href="/leaderboard" className="glass-dark rounded-xl p-6 card-hover neon-glow group">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-r from-electric-blue/20 to-neon-cyan/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <Trophy className="w-8 h-8 text-electric-blue" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">🏆 Leaderboard</h3>
                    <p className="text-gray-400">Lihat kedudukan anda dalam ranking dan bersaing dengan rakan</p>
                  </div>
                </div>
              </Link>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="glass-dark rounded-xl p-6 text-center card-hover neon-glow">
                <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">
                  {userStats.total_xp}
                </div>
                <div className="text-gray-400">Total XP</div>
                <div className="text-2xl mt-2">⭐</div>
              </div>
              
              <div className="glass-dark rounded-xl p-6 text-center card-hover neon-glow-green">
                <div className="text-3xl md:text-4xl font-bold text-gradient-green mb-2">
                  {userStats.completed_challenges}
                </div>
                <div className="text-gray-400">Selesai</div>
                <div className="text-2xl mt-2">✅</div>
              </div>
              
              <div className="glass-dark rounded-xl p-6 text-center card-hover neon-glow-cyan">
                <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">
                  {userStats.total_challenges}
                </div>
                <div className="text-gray-400">Jumlah Cabaran</div>
                <div className="text-2xl mt-2">🏆</div>
              </div>
              
              <div className="glass-dark rounded-xl p-6 text-center card-hover neon-glow">
                <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">
                  {userStats.average_score.toFixed(0)}%
                </div>
                <div className="text-gray-400">Purata Skor</div>
                <div className="text-2xl mt-2">📊</div>
              </div>
            </div>
            
            {/* Achievement Summary */}
            <AchievementSummary stats={{
              totalXP: userStats.total_xp,
              challengesCompleted: userStats.completed_challenges,
              codeExecutions: 0, // Would need to track this
              consecutiveDays: 0, // Would need to track this
              notesRead: 0, // Would need to track this
              tutorialsCompleted: 0, // Would need to track this
            }} />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Tab Navigation */}
          <div className="glass-dark rounded-2xl p-2 mb-8">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTab('available')}
                className={`px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === 'available'
                    ? 'bg-gradient-to-r from-electric-blue to-neon-cyan text-white'
                    : 'text-gray-400 hover:text-electric-blue hover:bg-electric-blue/10'
                }`}
              >
                🎯 Cabaran Tersedia
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === 'completed'
                    ? 'bg-gradient-to-r from-electric-blue to-neon-cyan text-white'
                    : 'text-gray-400 hover:text-electric-blue hover:bg-electric-blue/10'
                }`}
              >
                ✅ Selesai
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === 'all'
                    ? 'bg-gradient-to-r from-electric-blue to-neon-cyan text-white'
                    : 'text-gray-400 hover:text-electric-blue hover:bg-electric-blue/10'
                }`}
              >
                📋 Semua
              </button>
            </div>
          </div>

          {/* Challenges Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChallenges.map((challenge) => {
              const IconComponent = getChallengeIcon(challenge.type)
              return (
                <div key={challenge.id} className="glass-dark rounded-xl overflow-hidden card-hover">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-electric-blue/20 rounded-lg">
                          <IconComponent className="w-6 h-6 text-electric-blue" />
                        </div>
                        <div>
                          <span className="text-xs text-gray-400">{getChallengeTypeLabel(challenge.type)}</span>
                          <div className="text-sm text-gray-300">{challenge.subject}</div>
                        </div>
                      </div>
                      {getStatusBadge(challenge)}
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2">{challenge.title}</h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{challenge.description}</p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-neon-green" />
                        <span className="text-neon-green font-semibold">{challenge.xp_reward} XP</span>
                      </div>
                      <div className="text-xs text-gray-400">{challenge.tingkatan}</div>
                    </div>

                    {challenge.deadline && (
                      <div className="flex items-center space-x-2 mb-4 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>Tamat: {new Date(challenge.deadline).toLocaleDateString('ms-MY')}</span>
                      </div>
                    )}

                    {challenge.submission && (
                      <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Skor Terakhir:</span>
                          <span className="text-white font-semibold">
                            {challenge.submission.score}/{challenge.submission.max_score}
                          </span>
                        </div>
                        {challenge.submission.passed && (
                          <div className="flex items-center justify-between text-sm mt-1">
                            <span className="text-gray-400">XP Diperoleh:</span>
                            <span className="text-neon-green font-semibold">+{challenge.submission.xp_earned}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => handleStartChallenge(challenge.id, challenge.type)}
                      className="w-full btn-primary"
                      disabled={!!(challenge.deadline && new Date(challenge.deadline) < new Date())}
                    >
                      {challenge.submission && challenge.submission.passed 
                        ? 'Lihat Semula' 
                        : challenge.submission 
                        ? 'Cuba Lagi' 
                        : 'Mula Cabaran'
                      }
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {filteredChallenges.length === 0 && (
            <div className="glass-dark rounded-xl p-12 text-center">
              <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-300 mb-2">
                {activeTab === 'available' ? 'Tiada cabaran tersedia' : 
                 activeTab === 'completed' ? 'Belum ada cabaran selesai' : 
                 'Tiada cabaran dijumpai'}
              </h3>
              <p className="text-gray-400">
                {activeTab === 'available' ? 'Semua cabaran telah diselesaikan atau belum ada cabaran baru.' : 
                 activeTab === 'completed' ? 'Mulakan cabaran pertama anda untuk melihat kemajuan di sini.' : 
                 'Tiada cabaran tersedia pada masa ini.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

