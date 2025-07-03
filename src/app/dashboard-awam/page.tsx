'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'
import { useRouter } from 'next/navigation'
import { BookOpen, Video, FileText, Upload, Trophy, Star, Clock, CheckCircle, Code, Users, Award } from 'lucide-react'
import Link from 'next/link'

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
}

interface LeaderboardEntry {
  id: string
  name: string
  total_xp: number
  tingkatan: string
}

export default function DashboardAwam() {
  const router = useRouter()
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)
      await fetchData()
    }

    checkAuth()
  }, [router])

  const fetchData = async () => {
    try {
      // Fetch public challenges (limited view)
      const { data: challengesData } = await supabase
        .from('challenges')
        .select('id, title, description, type, subject, tingkatan, xp_reward, deadline, is_active, created_at')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(6)

      if (challengesData) {
        setChallenges(challengesData)
      }

      // Fetch top leaderboard (public view)
      const { data: leaderboardData } = await supabase
        .from('profiles')
        .select('id, name, total_xp, tingkatan')
        .order('total_xp', { ascending: false })
        .limit(5)

      if (leaderboardData) {
        setLeaderboard(leaderboardData)
      }

    } catch (error) {
      console.error('Error fetching data:', error)
    }
    setLoading(false)
  }

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black flex items-center justify-center">
        <div className="glass-dark rounded-2xl p-8 text-center">
          <div className="text-2xl text-gradient loading-dots">Memuat dashboard awam</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black">
      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden bg-circuit">
        <div className="absolute inset-0 bg-grid opacity-10"></div>
        <div className="absolute top-10 right-10 w-40 h-40 bg-gradient-to-br from-electric-blue/20 to-neon-cyan/20 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-gradient-to-br from-neon-green/20 to-electric-blue/20 rounded-full blur-xl animate-float" style={{animationDelay: '3s'}}></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gradient text-center">
              🌟 Dashboard Awam
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 text-center mb-8">
              Jelajahi platform pembelajaran dan lihat prestasi komuniti
            </p>
            
            {/* Quick Access Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Link href="/playground" className="glass-dark rounded-xl p-6 card-hover neon-glow-green group">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-r from-neon-green/20 to-electric-blue/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <Code className="w-8 h-8 text-neon-green" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">🚀 CodeCikgu Playground</h3>
                    <p className="text-gray-400">Tulis dan edit kod dalam pelbagai bahasa pengaturcaraan</p>
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
                    <p className="text-gray-400">Lihat ranking prestasi komuniti</p>
                  </div>
                </div>
              </Link>
              
              <Link href="/about" className="glass-dark rounded-xl p-6 card-hover neon-glow-cyan group">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-r from-neon-cyan/20 to-electric-blue/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-8 h-8 text-neon-cyan" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">ℹ️ Tentang Platform</h3>
                    <p className="text-gray-400">Ketahui lebih lanjut tentang CodeCikgu</p>
                  </div>
                </div>
              </Link>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-dark rounded-xl p-6 text-center card-hover neon-glow">
                <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">
                  {challenges.length}+
                </div>
                <div className="text-gray-400">Cabaran Tersedia</div>
                <div className="text-2xl mt-2">📚</div>
              </div>
              
              <div className="glass-dark rounded-xl p-6 text-center card-hover neon-glow-green">
                <div className="text-3xl md:text-4xl font-bold text-gradient-green mb-2">
                  {leaderboard.length}+
                </div>
                <div className="text-gray-400">Pelajar Aktif</div>
                <div className="text-2xl mt-2">👥</div>
              </div>
              
              <div className="glass-dark rounded-xl p-6 text-center card-hover neon-glow-cyan">
                <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">
                  {leaderboard.reduce((total, entry) => total + entry.total_xp, 0)}
                </div>
                <div className="text-gray-400">Total XP Komuniti</div>
                <div className="text-2xl mt-2">⭐</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Challenges Preview */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white">🎯 Cabaran Terkini</h2>
              <p className="text-gray-400">Daftar sebagai pelajar untuk menyertai cabaran</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {challenges.map((challenge) => {
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
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          Tersedia
                        </span>
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

                      <Link
                        href="/daftar"
                        className="w-full btn-primary"
                      >
                        Daftar untuk Menyertai
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Leaderboard Preview */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white">🏆 Top Performers</h2>
              <Link href="/leaderboard" className="text-electric-blue hover:underline">
                Lihat Semua →
              </Link>
            </div>
            
            <div className="glass-dark rounded-xl overflow-hidden">
              <div className="p-6">
                <div className="space-y-4">
                  {leaderboard.map((entry, index) => (
                    <div key={entry.id} className="flex items-center space-x-4 p-4 bg-gray-800/30 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-dark-black' :
                          index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-dark-black' :
                          index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-dark-black' :
                          'bg-gray-700 text-gray-300'
                        }`}>
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium truncate">{entry.name}</h3>
                        <p className="text-gray-400 text-sm">Tingkatan {entry.tingkatan}</p>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-neon-green" />
                          <span className="text-neon-green font-semibold">{entry.total_xp} XP</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="glass-dark rounded-xl p-8 text-center">
            <Award className="w-16 h-16 text-electric-blue mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">Sertai Komuniti CodeCikgu</h3>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              Daftar sebagai pelajar untuk menyertai cabaran, mengumpul XP, dan bersaing dengan rakan-rakan. 
              Mulakan perjalanan pembelajaran anda hari ini!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/daftar" className="btn-primary">
                Daftar Sekarang
              </Link>
              <Link href="/login" className="btn-secondary">
                Log Masuk
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

