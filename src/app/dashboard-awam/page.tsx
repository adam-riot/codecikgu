'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, getUserRole, getUserDisplayName, type CustomUser } from '@/utils/supabase'
import { 
  BookOpen, 
  Code, 
  Trophy, 
  Target, 
  Clock, 
  TrendingUp,
  Users,
  Star,
  Play,
  FileText,
  Award,
  Activity
} from 'lucide-react'

export default function DashboardAwam() {
  const router = useRouter()
  const [user, setUser] = useState<CustomUser | null>(null)
  const [userRole, setUserRole] = useState<string>('awam')
  const [userName, setUserName] = useState<string>('Tetamu')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/login')
          return
        }

        const userData = user as CustomUser
        setUser(userData)
        
        // Fetch role and name from database
        const [role, name] = await Promise.all([
          getUserRole(userData),
          getUserDisplayName(userData)
        ])
        
        console.log('Dashboard awam - Fetched role:', role) // Debug log
        console.log('Dashboard awam - Fetched name:', name) // Debug log
        
        setUserRole(role)
        setUserName(name)
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black flex items-center justify-center">
        <div className="glass-dark rounded-2xl p-8 text-center">
          <div className="text-2xl text-gradient loading-dots">Memuat dashboard</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black flex items-center justify-center">
        <div className="glass-dark rounded-2xl p-8 text-center">
          <div className="text-2xl text-red-400">Akses ditolak</div>
          <Link href="/login" className="btn-primary mt-4">Log Masuk</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <span className="px-4 py-2 bg-neon-cyan/20 border border-neon-cyan/30 text-neon-cyan rounded-full text-sm font-medium">
                ⭐ Pengguna Awam
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gradient">
              Selamat Datang ke CodeCikgu!
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Jelajahi dunia pengaturcaraan dengan bebas. Akses nota pembelajaran, gunakan playground untuk 
              berlatih, dan tingkatkan kemahiran coding anda!
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Link href="/playground" className="glass-dark rounded-xl p-8 card-hover neon-glow group">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-electric-blue/20 rounded-lg mr-4 group-hover:scale-110 transition-transform duration-300">
                  <Code className="w-8 h-8 text-electric-blue" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">🚀 Playground</h3>
                  <p className="text-gray-400">Tulis dan jalankan kod dalam pelbagai bahasa pengaturcaraan</p>
                </div>
              </div>
              <div className="text-electric-blue group-hover:underline font-medium">
                Mula Kod Sekarang →
              </div>
            </Link>

            <Link href="/nota" className="glass-dark rounded-xl p-8 card-hover neon-glow-green group">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-neon-green/20 rounded-lg mr-4 group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="w-8 h-8 text-neon-green" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">📚 Nota</h3>
                  <p className="text-gray-400">Akses nota pembelajaran Sains Komputer</p>
                </div>
              </div>
              <div className="text-neon-green group-hover:underline font-medium">
                Baca Nota →
              </div>
            </Link>
          </div>

          {/* Activity Section */}
          <div className="glass-dark rounded-xl p-8 mb-12">
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
              <Activity className="w-6 h-6 mr-3 text-neon-cyan" />
              📊 Aktiviti Anda
            </h2>
            
            <p className="text-gray-400 mb-6">
              Pantau penggunaan dan aktiviti pembelajaran anda
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-gray-800/30 rounded-lg">
                <div className="text-3xl mb-2">📖</div>
                <div className="text-2xl font-bold text-electric-blue mb-1">5</div>
                <div className="text-sm text-gray-400">Nota Dibaca</div>
              </div>

              <div className="text-center p-6 bg-gray-800/30 rounded-lg">
                <div className="text-3xl mb-2">⏱️</div>
                <div className="text-2xl font-bold text-neon-green mb-1">12</div>
                <div className="text-sm text-gray-400">Sesi Playground</div>
              </div>

              <div className="text-center p-6 bg-gray-800/30 rounded-lg">
                <div className="text-3xl mb-2">🕐</div>
                <div className="text-2xl font-bold text-neon-cyan mb-1">3.5h</div>
                <div className="text-sm text-gray-400">Masa Pembelajaran</div>
              </div>

              <div className="text-center p-6 bg-gray-800/30 rounded-lg">
                <div className="text-3xl mb-2">🐍</div>
                <div className="text-2xl font-bold text-purple-400 mb-1">Python</div>
                <div className="text-sm text-gray-400">Bahasa Kegemaran</div>
              </div>
            </div>
          </div>

          {/* Learning Resources */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Popular Notes */}
            <div className="glass-dark rounded-xl p-8">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-400" />
                📚 Nota Popular
              </h3>
              
              <div className="space-y-4">
                <Link href="/nota/tingkatan-4" className="flex items-center p-4 bg-gray-800/30 hover:bg-gray-800/50 rounded-lg transition-colors duration-300 group">
                  <FileText className="w-5 h-5 text-electric-blue mr-3" />
                  <div className="flex-1">
                    <div className="font-medium text-white group-hover:text-electric-blue transition-colors duration-300">
                      Asas Pengaturcaraan
                    </div>
                    <div className="text-sm text-gray-400">Tingkatan 4 • Bab 1-3</div>
                  </div>
                  <div className="text-gray-400 group-hover:text-electric-blue transition-colors duration-300">→</div>
                </Link>

                <Link href="/nota/tingkatan-5" className="flex items-center p-4 bg-gray-800/30 hover:bg-gray-800/50 rounded-lg transition-colors duration-300 group">
                  <FileText className="w-5 h-5 text-neon-green mr-3" />
                  <div className="flex-1">
                    <div className="font-medium text-white group-hover:text-neon-green transition-colors duration-300">
                      Pemrograman Web
                    </div>
                    <div className="text-sm text-gray-400">Tingkatan 5 • HTML, CSS, JS</div>
                  </div>
                  <div className="text-gray-400 group-hover:text-neon-green transition-colors duration-300">→</div>
                </Link>

                <Link href="/nota/tingkatan-5" className="flex items-center p-4 bg-gray-800/30 hover:bg-gray-800/50 rounded-lg transition-colors duration-300 group">
                  <FileText className="w-5 h-5 text-neon-cyan mr-3" />
                  <div className="flex-1">
                    <div className="font-medium text-white group-hover:text-neon-cyan transition-colors duration-300">
                      Pangkalan Data
                    </div>
                    <div className="text-sm text-gray-400">Tingkatan 5 • SQL & Database</div>
                  </div>
                  <div className="text-gray-400 group-hover:text-neon-cyan transition-colors duration-300">→</div>
                </Link>
              </div>
            </div>

            {/* Community Leaderboard Preview */}
            <div className="glass-dark rounded-xl p-8">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                🏆 Leaderboard Komuniti
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-lg border border-yellow-500/30">
                  <div className="text-2xl mr-3">🥇</div>
                  <div className="flex-1">
                    <div className="font-medium text-white">Ahmad Zaki</div>
                    <div className="text-sm text-gray-400">2,450 XP • Level 24</div>
                  </div>
                  <div className="text-yellow-400 font-bold">#1</div>
                </div>

                <div className="flex items-center p-4 bg-gradient-to-r from-gray-400/20 to-gray-500/20 rounded-lg border border-gray-400/30">
                  <div className="text-2xl mr-3">🥈</div>
                  <div className="flex-1">
                    <div className="font-medium text-white">Siti Nurhaliza</div>
                    <div className="text-sm text-gray-400">2,180 XP • Level 21</div>
                  </div>
                  <div className="text-gray-400 font-bold">#2</div>
                </div>

                <div className="flex items-center p-4 bg-gradient-to-r from-orange-500/20 to-orange-600/20 rounded-lg border border-orange-500/30">
                  <div className="text-2xl mr-3">🥉</div>
                  <div className="flex-1">
                    <div className="font-medium text-white">Muhammad Ali</div>
                    <div className="text-sm text-gray-400">1,950 XP • Level 19</div>
                  </div>
                  <div className="text-orange-400 font-bold">#3</div>
                </div>

                <Link href="/leaderboard" className="block text-center p-3 bg-gray-800/30 hover:bg-gray-800/50 rounded-lg transition-colors duration-300 text-electric-blue hover:text-white">
                  Lihat Leaderboard Penuh →
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/playground" className="glass-dark rounded-xl p-6 text-center card-hover group">
              <div className="text-4xl mb-3">💻</div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-electric-blue transition-colors duration-300">
                Playground
              </h3>
              <p className="text-gray-400 text-sm">Kod editor interaktif</p>
            </Link>

            <Link href="/nota" className="glass-dark rounded-xl p-6 text-center card-hover group">
              <div className="text-4xl mb-3">📚</div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-neon-green transition-colors duration-300">
                Nota Pembelajaran
              </h3>
              <p className="text-gray-400 text-sm">Sumber pembelajaran lengkap</p>
            </Link>

            <Link href="/leaderboard" className="glass-dark rounded-xl p-6 text-center card-hover group">
              <div className="text-4xl mb-3">🏆</div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-neon-cyan transition-colors duration-300">
                Leaderboard
              </h3>
              <p className="text-gray-400 text-sm">Ranking komuniti</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

