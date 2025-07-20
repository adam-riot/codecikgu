'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase, getUserRole, getUserDisplayName, type CustomUser } from '@/utils/supabase'
import { Play, BookOpen, Trophy, UserPlus } from 'lucide-react'

export default function HomePage() {
  const [user, setUser] = useState<CustomUser | null>(null)
  const [userRole, setUserRole] = useState<string>('awam')
  const [userName, setUserName] = useState<string>('Tetamu')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        console.log('Main page - Auth user:', user) // Debug log
        
        if (user) {
          const userData = user as CustomUser
          setUser(userData)
          
          // Fetch role and name from database
          const [role, name] = await Promise.all([
            getUserRole(userData),
            getUserDisplayName(userData)
          ])
          
          console.log('Main page - Fetched role:', role) // Debug log
          console.log('Main page - Fetched name:', name) // Debug log
          
          setUserRole(role)
          setUserName(name)
        } else {
          // No user logged in
          setUser(null)
          setUserRole('awam')
          setUserName('Tetamu')
        }
      } catch (error) {
        console.error('Error in checkUser:', error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black flex items-center justify-center">
        <div className="glass-dark rounded-2xl p-8 text-center">
          <div className="text-2xl text-gradient loading-dots">Memuat halaman</div>
        </div>
      </div>
    )
  }

  // Always show public landing page content (no auto-redirect)
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Dynamic greeting based on user status */}
            {user ? (
              <div className="mb-4">
                <span className="text-lg text-gray-400">
                  {userRole === 'admin' ? '👨‍💼 Admin' : userRole === 'murid' ? '👨‍🎓 Murid' : '👤 Pengguna'} • {userName}
                </span>
              </div>
            ) : null}
            
            <h1 className="text-4xl md:text-7xl font-bold mb-8 text-gradient leading-tight">
              Selamat Datang<br />
              ke CodeCikgu
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed">
              Platform pembelajaran <span className="text-electric-blue font-semibold">Sains Komputer</span> yang interaktif untuk murid Tingkatan 4 & 5.<br />
              Belajar dengan cara yang menyeronokkan dan dapatkan ganjaran!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              {user ? (
                <>
                  <Link href="/playground" className="btn-primary text-lg px-8 py-4 flex items-center space-x-3">
                    <Play className="w-6 h-6" />
                    <span>🚀 Mula Kod</span>
                  </Link>
                  <Link href="/nota" className="btn-secondary text-lg px-8 py-4 flex items-center space-x-3">
                    <BookOpen className="w-6 h-6" />
                    <span>📚 Baca Nota</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/daftar" className="btn-primary text-lg px-8 py-4 flex items-center space-x-3">
                    <UserPlus className="w-6 h-6" />
                    <span>🚀 Daftar Sekarang</span>
                  </Link>
                  <Link href="/login" className="btn-secondary text-lg px-8 py-4 flex items-center space-x-3">
                    <span>🔐 Log Masuk</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Animated background elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-electric-blue/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-neon-cyan/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-neon-green/10 rounded-full blur-xl animate-pulse delay-500"></div>
      </section>

      {/* Quick Access Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 text-gradient">
              🎯 Ciri-Ciri Platform
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Link href="/playground" className="glass-dark rounded-xl p-8 card-hover neon-glow group text-center">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🖥️</div>
                <h3 className="text-xl font-bold text-white mb-3">Playground</h3>
                <p className="text-gray-400 text-sm mb-4">Kod Editor Interaktif dengan sokongan pelbagai bahasa</p>
                <div className="text-electric-blue group-hover:underline">Mula Kod →</div>
              </Link>

              <Link href="/nota" className="glass-dark rounded-xl p-8 card-hover neon-glow-green group text-center">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">📚</div>
                <h3 className="text-xl font-bold text-white mb-3">Nota</h3>
                <p className="text-gray-400 text-sm mb-4">Sumber pembelajaran lengkap untuk Tingkatan 4 & 5</p>
                <div className="text-neon-green group-hover:underline">Baca Nota →</div>
              </Link>

              <Link href="/leaderboard" className="glass-dark rounded-xl p-8 card-hover neon-glow-cyan group text-center">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🏆</div>
                <h3 className="text-xl font-bold text-white mb-3">Leaderboard</h3>
                <p className="text-gray-400 text-sm mb-4">Ranking & pencapaian pelajar terbaik</p>
                <div className="text-neon-cyan group-hover:underline">Lihat Ranking →</div>
              </Link>

              {user ? (
                <Link href={`/dashboard-${userRole}`} className="glass-dark rounded-xl p-8 card-hover neon-glow-purple group text-center">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {userRole === 'admin' ? '👨‍💼' : userRole === 'murid' ? '👨‍🎓' : '👤'}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Dashboard</h3>
                  <p className="text-gray-400 text-sm mb-4">Akses dashboard {userRole === 'admin' ? 'admin' : userRole === 'murid' ? 'murid' : 'awam'} anda</p>
                  <div className="text-purple-400 group-hover:underline">Ke Dashboard →</div>
                </Link>
              ) : (
                <Link href="/daftar" className="glass-dark rounded-xl p-8 card-hover neon-glow-purple group text-center">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">👤</div>
                  <h3 className="text-xl font-bold text-white mb-3">Daftar</h3>
                  <p className="text-gray-400 text-sm mb-4">Cipta akaun untuk akses penuh semua ciri</p>
                  <div className="text-purple-400 group-hover:underline">Daftar Sekarang →</div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Programming Languages */}
      <section className="py-20 bg-gradient-to-r from-gray-900/50 to-dark-black/50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 text-gradient">
              💻 Bahasa Pengaturcaraan
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              <div className="glass-dark rounded-xl p-6 text-center card-hover group">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">☕</div>
                <h3 className="text-lg font-bold text-white mb-2">Java</h3>
                <p className="text-gray-400 text-sm">Object-oriented programming</p>
              </div>

              <div className="glass-dark rounded-xl p-6 text-center card-hover group">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">🐍</div>
                <h3 className="text-lg font-bold text-white mb-2">Python</h3>
                <p className="text-gray-400 text-sm">Beginner-friendly syntax</p>
              </div>

              <div className="glass-dark rounded-xl p-6 text-center card-hover group">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">⚡</div>
                <h3 className="text-lg font-bold text-white mb-2">C++</h3>
                <p className="text-gray-400 text-sm">High-performance computing</p>
              </div>

              <div className="glass-dark rounded-xl p-6 text-center card-hover group">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">🌐</div>
                <h3 className="text-lg font-bold text-white mb-2">JavaScript</h3>
                <p className="text-gray-400 text-sm">Web development</p>
              </div>

              <div className="glass-dark rounded-xl p-6 text-center card-hover group">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">🔷</div>
                <h3 className="text-lg font-bold text-white mb-2">C#</h3>
                <p className="text-gray-400 text-sm">Microsoft ecosystem</p>
              </div>

              <div className="glass-dark rounded-xl p-6 text-center card-hover group">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">🦀</div>
                <h3 className="text-lg font-bold text-white mb-2">Rust</h3>
                <p className="text-gray-400 text-sm">Memory-safe systems</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 text-gradient">
              ✨ Mengapa CodeCikgu?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="glass-dark rounded-xl p-8 card-hover">
                <div className="text-4xl mb-4">🎮</div>
                <h3 className="text-xl font-bold text-white mb-4">Pembelajaran Interaktif</h3>
                <p className="text-gray-400">
                  Belajar sambil bermain dengan playground interaktif dan sistem ganjaran XP yang menarik.
                </p>
              </div>

              <div className="glass-dark rounded-xl p-8 card-hover">
                <div className="text-4xl mb-4">📖</div>
                <h3 className="text-xl font-bold text-white mb-4">Sukatan Pelajaran SPM</h3>
                <p className="text-gray-400">
                  Nota dan bahan pembelajaran yang mengikut sukatan pelajaran Sains Komputer SPM terkini.
                </p>
              </div>

              <div className="glass-dark rounded-xl p-8 card-hover">
                <div className="text-4xl mb-4">📱</div>
                <h3 className="text-xl font-bold text-white mb-4">Multi-Platform</h3>
                <p className="text-gray-400">
                  Akses dari mana-mana peranti - desktop, tablet, atau telefon pintar dengan responsive design.
                </p>
              </div>

              <div className="glass-dark rounded-xl p-8 card-hover">
                <div className="text-4xl mb-4">🏆</div>
                <h3 className="text-xl font-bold text-white mb-4">Sistem Ranking</h3>
                <p className="text-gray-400">
                  Bersaing dengan rakan-rakan melalui sistem XP dan leaderboard untuk motivasi pembelajaran.
                </p>
              </div>

              <div className="glass-dark rounded-xl p-8 card-hover">
                <div className="text-4xl mb-4">👥</div>
                <h3 className="text-xl font-bold text-white mb-4">Multi-Role Support</h3>
                <p className="text-gray-400">
                  Sokongan untuk admin, murid, dan pengguna awam dengan ciri-ciri yang disesuaikan.
                </p>
              </div>

              <div className="glass-dark rounded-xl p-8 card-hover">
                <div className="text-4xl mb-4">💰</div>
                <h3 className="text-xl font-bold text-white mb-4">Percuma Selamanya</h3>
                <p className="text-gray-400">
                  Platform pembelajaran yang sepenuhnya percuma untuk semua pelajar Malaysia.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Info */}
      <section className="py-20 bg-gradient-to-r from-dark-black/50 to-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 text-gradient">
              📊 Platform Info
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl mb-4">🚀</div>
                <div className="text-3xl font-bold text-electric-blue mb-2">Beta</div>
                <div className="text-gray-400">Status Platform</div>
              </div>

              <div className="text-center">
                <div className="text-4xl mb-4">💻</div>
                <div className="text-3xl font-bold text-neon-green mb-2">6</div>
                <div className="text-gray-400">Bahasa Disokong</div>
              </div>

              <div className="text-center">
                <div className="text-4xl mb-4">📅</div>
                <div className="text-3xl font-bold text-neon-cyan mb-2">2024</div>
                <div className="text-gray-400">Tahun Pelancaran</div>
              </div>

              <div className="text-center">
                <div className="text-4xl mb-4">💰</div>
                <div className="text-3xl font-bold text-purple-400 mb-2">Free</div>
                <div className="text-gray-400">Harga Penggunaan</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-8 text-gradient">
              🎓 {user ? 'Teruskan Pembelajaran Anda' : 'Mula Pembelajaran Anda Hari Ini'}
            </h2>
            <p className="text-xl text-gray-300 mb-12">
              {user 
                ? `Selamat kembali, ${userName}! Teruskan perjalanan pembelajaran Sains Komputer anda.`
                : 'Sertai ribuan pelajar yang telah memulakan perjalanan pembelajaran Sains Komputer mereka dengan CodeCikgu'
              }
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              {user ? (
                <>
                  <Link href="/playground" className="btn-primary text-xl px-10 py-5 flex items-center space-x-3">
                    <Play className="w-6 h-6" />
                    <span>Mula Kod</span>
                  </Link>
                  <Link href={`/dashboard-${userRole}`} className="btn-secondary text-xl px-10 py-5 flex items-center space-x-3">
                    <Trophy className="w-6 h-6" />
                    <span>Ke Dashboard</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/daftar" className="btn-primary text-xl px-10 py-5 flex items-center space-x-3">
                    <UserPlus className="w-6 h-6" />
                    <span>Daftar Percuma Sekarang</span>
                  </Link>
                  <Link href="/playground" className="btn-secondary text-xl px-10 py-5 flex items-center space-x-3">
                    <Play className="w-6 h-6" />
                    <span>Cuba Playground</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

