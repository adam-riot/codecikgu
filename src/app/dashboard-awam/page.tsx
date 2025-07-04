'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'
import { useRouter } from 'next/navigation'
import { BookOpen, Video, FileText, Upload, Trophy, Star, Clock, CheckCircle, Code, Users, Award } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

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
      // Mock data for demo since we don't have real challenges table
      const mockChallenges: Challenge[] = [
        {
          id: '1',
          title: 'Pengenalan kepada Java',
          description: 'Belajar asas-asas pengaturcaraan Java dan sintaks asas',
          type: 'reading',
          subject: 'Sains Komputer',
          tingkatan: 'Tingkatan 4',
          xp_reward: 50,
          deadline: '2024-12-31',
          is_active: true,
          created_at: '2024-01-01'
        },
        {
          id: '2',
          title: 'Algoritma Sorting',
          description: 'Memahami pelbagai algoritma pengisihan data',
          type: 'video',
          subject: 'Sains Komputer',
          tingkatan: 'Tingkatan 5',
          xp_reward: 75,
          deadline: '2024-12-31',
          is_active: true,
          created_at: '2024-01-02'
        },
        {
          id: '3',
          title: 'Struktur Data Array',
          description: 'Belajar menggunakan array dalam pengaturcaraan',
          type: 'quiz',
          subject: 'Sains Komputer',
          tingkatan: 'Tingkatan 4',
          xp_reward: 40,
          deadline: null,
          is_active: true,
          created_at: '2024-01-03'
        }
      ]

      const mockLeaderboard: LeaderboardEntry[] = [
        { id: '1', name: 'Ahmad Zaki', total_xp: 1250, tingkatan: '5' },
        { id: '2', name: 'Siti Nurhaliza', total_xp: 1100, tingkatan: '4' },
        { id: '3', name: 'Muhammad Ali', total_xp: 950, tingkatan: '5' },
        { id: '4', name: 'Fatimah Zahra', total_xp: 800, tingkatan: '4' },
        { id: '5', name: 'Omar Khattab', total_xp: 750, tingkatan: '5' }
      ]

      setChallenges(mockChallenges)
      setLeaderboard(mockLeaderboard)

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
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black flex items-center justify-center">
          <div className="glass-dark rounded-2xl p-8 text-center">
            <div className="text-2xl text-gradient loading-dots">Memuat dashboard awam</div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black">
        {/* Hero Section */}
        <section className="relative py-16 overflow-hidden bg-circuit">
          <div className="absolute inset-0 bg-grid opacity-10"></div>
          <div className="absolute top-10 right-10 w-40 h-40 bg-gradient-to-br from-electric-blue/20 to-neon-cyan/20 rounded-full blur-xl animate-float"></div>
          <div className="absolute bottom-10 left-10 w-32 h-32 bg-gradient-to-br from-neon-green/20 to-electric-blue/20 rounded-full blur-xl animate-float" style={{animationDelay: '3s'}}></div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-8">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-electric-blue/20 text-electric-blue border border-electric-blue/30 mb-4">
                  ⭐ Pengguna Awam
                </span>
                <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gradient">
                  Selamat Datang ke CodeCikgu!
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 mb-8">
                  Jelajahi dunia pengaturcaraan dengan bebas. Akses nota pembelajaran, gunakan playground 
                  untuk berlatih, dan tingkatkan kemahiran coding anda!
                </p>
              </div>
              
              {/* Quick Access Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Link href="/playground" className="glass-dark rounded-xl p-6 card-hover neon-glow-green group">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-r from-neon-green/20 to-electric-blue/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                      <Code className="w-8 h-8 text-neon-green" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">🚀 Playground</h3>
                      <p className="text-gray-400">Tulis dan jalankan kod dalam pelbagai bahasa pengaturcaraan</p>
                    </div>
                  </div>
                </Link>
                
                <Link href="/nota" className="glass-dark rounded-xl p-6 card-hover neon-glow group">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-r from-electric-blue/20 to-neon-cyan/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                      <BookOpen className="w-8 h-8 text-electric-blue" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">📚 Nota</h3>
                      <p className="text-gray-400">Akses nota pembelajaran Sains Komputer</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-7xl mx-auto">
            {/* Activity Stats */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-white mb-6 text-center">📊 Aktiviti Anda</h2>
              <p className="text-gray-400 text-center mb-8">Pantau penggunaan dan aktiviti pembelajaran anda</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="glass-dark rounded-xl p-6 text-center card-hover neon-glow">
                  <div className="text-3xl mb-2">📄</div>
                  <div className="text-2xl font-bold text-electric-blue mb-1">5</div>
                  <div className="text-gray-400 text-sm">Nota Diakses</div>
                </div>
                
                <div className="glass-dark rounded-xl p-6 text-center card-hover neon-glow-green">
                  <div className="text-3xl mb-2">💻</div>
                  <div className="text-2xl font-bold text-neon-green mb-1">12</div>
                  <div className="text-gray-400 text-sm">Sesi Playground</div>
                </div>
                
                <div className="glass-dark rounded-xl p-6 text-center card-hover neon-glow-cyan">
                  <div className="text-3xl mb-2">⏱️</div>
                  <div className="text-2xl font-bold text-neon-cyan mb-1">3.5h</div>
                  <div className="text-gray-400 text-sm">Masa Pembelajaran</div>
                </div>
                
                <div className="glass-dark rounded-xl p-6 text-center card-hover neon-glow">
                  <div className="text-3xl mb-2">🐍</div>
                  <div className="text-2xl font-bold text-purple-400 mb-1">Python</div>
                  <div className="text-gray-400 text-sm">Bahasa Kegemaran</div>
                </div>
              </div>
            </div>

            {/* Learning Resources */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-white mb-6">📚 Sumber Pembelajaran</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link href="/nota/tingkatan-4" className="glass-dark rounded-xl p-6 card-hover neon-glow group">
                  <div className="text-center">
                    <div className="text-4xl mb-4">📖</div>
                    <h3 className="text-xl font-bold text-white mb-2">Nota Tingkatan 4</h3>
                    <p className="text-gray-400 text-sm mb-4">Asas pengaturcaraan dan algoritma</p>
                    <div className="text-electric-blue group-hover:underline">Baca Sekarang →</div>
                  </div>
                </Link>
                
                <Link href="/nota/tingkatan-5" className="glass-dark rounded-xl p-6 card-hover neon-glow-green group">
                  <div className="text-center">
                    <div className="text-4xl mb-4">📚</div>
                    <h3 className="text-xl font-bold text-white mb-2">Nota Tingkatan 5</h3>
                    <p className="text-gray-400 text-sm mb-4">Struktur data dan projek</p>
                    <div className="text-neon-green group-hover:underline">Baca Sekarang →</div>
                  </div>
                </Link>
                
                <Link href="/playground" className="glass-dark rounded-xl p-6 card-hover neon-glow-cyan group">
                  <div className="text-center">
                    <div className="text-4xl mb-4">💻</div>
                    <h3 className="text-xl font-bold text-white mb-2">Playground</h3>
                    <p className="text-gray-400 text-sm mb-4">Berlatih kod secara interaktif</p>
                    <div className="text-neon-cyan group-hover:underline">Mula Coding →</div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Community Leaderboard Preview */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-white">🏆 Komuniti Terbaik</h2>
                <Link href="/leaderboard" className="text-electric-blue hover:underline">
                  Lihat Semua →
                </Link>
              </div>
              
              <div className="glass-dark rounded-xl overflow-hidden">
                <div className="p-6">
                  <div className="space-y-4">
                    {leaderboard.slice(0, 3).map((entry, index) => (
                      <div key={entry.id} className="flex items-center space-x-4 p-4 bg-gray-800/30 rounded-lg">
                        <div className="flex-shrink-0">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                            index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-dark-black' :
                            index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-dark-black' :
                            'bg-gradient-to-r from-orange-400 to-orange-600 text-dark-black'
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
              <h3 className="text-2xl font-bold text-white mb-4">Tingkatkan Pembelajaran Anda</h3>
              <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
                Daftar sebagai pelajar untuk mendapat akses penuh kepada cabaran, sistem XP, dan ciri-ciri eksklusif lain. 
                Mulakan perjalanan pembelajaran yang lebih terstruktur!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/daftar" className="btn-primary">
                  Daftar Sebagai Pelajar
                </Link>
                <Link href="/playground" className="btn-secondary">
                  Teruskan Sebagai Awam
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

