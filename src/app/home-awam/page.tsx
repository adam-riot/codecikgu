'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'

export default function HomeAwamPage() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    notesAccessed: 0,
    playgroundSessions: 0,
    timeSpent: 0,
    favoriteLanguage: 'JavaScript'
  })

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    const fetchStats = async () => {
      // Simulasi data statistik pengguna awam
      setStats({
        notesAccessed: 5,
        playgroundSessions: 12,
        timeSpent: 3.5,
        favoriteLanguage: 'Python'
      })
    }

    fetchUser()
    fetchStats()
  }, [])

  return (
    <div className="min-h-screen bg-circuit dark:bg-gray-900 text-white">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-6">
              <span className="inline-block px-4 py-2 bg-electric-blue/20 border border-electric-blue/30 rounded-full text-electric-blue text-sm font-semibold mb-4">
                🌟 Pengguna Awam
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-gradient">Selamat Datang</span>
              <br />
              <span className="text-gradient">ke CodeCikgu!</span>
            </h1>
            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
              Jelajahi dunia pengaturcaraan dengan bebas. Akses nota pembelajaran, 
              gunakan playground untuk berlatih, dan tingkatkan kemahiran coding anda!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/dashboard-awam" 
                className="btn-primary flex items-center justify-center gap-2 px-8 py-4 text-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                </svg>
                Dashboard Awam
              </Link>
              <Link 
                href="/playground" 
                className="btn-secondary flex items-center justify-center gap-2 px-8 py-4 text-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Playground
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Activity Stats */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gradient mb-4">Aktiviti Anda</h2>
            <p className="text-gray-400">Pantau penggunaan dan aktiviti pembelajaran anda</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-dark rounded-xl p-6 text-center neon-glow">
              <div className="w-12 h-12 bg-electric-blue/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-electric-blue" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-electric-blue mb-2">{stats.notesAccessed}</h3>
              <p className="text-gray-400">Nota Diakses</p>
            </div>

            <div className="glass-dark rounded-xl p-6 text-center neon-glow-green">
              <div className="w-12 h-12 bg-neon-green/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-neon-green" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-neon-green mb-2">{stats.playgroundSessions}</h3>
              <p className="text-gray-400">Sesi Playground</p>
            </div>

            <div className="glass-dark rounded-xl p-6 text-center neon-glow">
              <div className="w-12 h-12 bg-neon-cyan/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-neon-cyan" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-neon-cyan mb-2">{stats.timeSpent}h</h3>
              <p className="text-gray-400">Masa Pembelajaran</p>
            </div>

            <div className="glass-dark rounded-xl p-6 text-center neon-glow">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-purple-400 mb-2">{stats.favoriteLanguage}</h3>
              <p className="text-gray-400">Bahasa Kegemaran</p>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Resources */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gradient mb-4">Sumber Pembelajaran</h2>
            <p className="text-gray-400">Akses sumber pembelajaran yang tersedia untuk anda</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/nota" className="glass-dark rounded-xl p-6 card-hover neon-glow group">
              <div className="w-12 h-12 bg-electric-blue/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-electric-blue/30 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-electric-blue" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Nota Pembelajaran</h3>
              <p className="text-gray-400">Akses nota dan bahan pembelajaran untuk Sains Komputer</p>
            </Link>

            <Link href="/playground" className="glass-dark rounded-xl p-6 card-hover neon-glow group">
              <div className="w-12 h-12 bg-neon-green/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-neon-green/30 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-neon-green" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Playground</h3>
              <p className="text-gray-400">Berlatih coding dalam pelbagai bahasa pengaturcaraan</p>
            </Link>

            <Link href="/leaderboard" className="glass-dark rounded-xl p-6 card-hover neon-glow group">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-yellow-500/30 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Leaderboard</h3>
              <p className="text-gray-400">Lihat ranking dan pencapaian pelajar terbaik</p>
            </Link>

            <Link href="/about" className="glass-dark rounded-xl p-6 card-hover neon-glow group">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-500/30 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Tentang CodeCikgu</h3>
              <p className="text-gray-400">Ketahui lebih lanjut tentang platform pembelajaran ini</p>
            </Link>

            <Link href="/profile" className="glass-dark rounded-xl p-6 card-hover neon-glow group">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-500/30 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Profil Saya</h3>
              <p className="text-gray-400">Kemaskini maklumat profil dan tetapan akaun</p>
            </Link>

            <Link href="/dashboard-awam" className="glass-dark rounded-xl p-6 card-hover neon-glow group">
              <div className="w-12 h-12 bg-neon-cyan/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-neon-cyan/30 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-neon-cyan" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Dashboard Penuh</h3>
              <p className="text-gray-400">Akses dashboard awam yang lengkap dengan semua ciri</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="glass-dark rounded-xl p-8 text-center">
            <h2 className="text-3xl font-bold text-gradient mb-4">Mula Pembelajaran Anda</h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Sebagai pengguna awam, anda boleh mengakses nota pembelajaran dan menggunakan playground untuk berlatih. 
              Daftar sebagai pelajar untuk mendapat akses kepada cabaran dan sistem XP!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/nota" className="btn-primary">
                Mula dengan Nota
              </Link>
              <Link href="/playground" className="btn-secondary">
                Cuba Playground
              </Link>
              <Link href="/daftar" className="px-6 py-3 border border-electric-blue/30 text-electric-blue rounded-lg hover:bg-electric-blue/10 transition-all duration-300">
                Daftar sebagai Pelajar
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Welcome Message */}
      {user && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="glass-dark rounded-xl p-8 text-center">
              <h2 className="text-2xl font-bold text-gradient mb-4">
                Selamat Datang, {user.email}!
              </h2>
              <p className="text-gray-400 mb-6">
                Anda log masuk sebagai Pengguna Awam. Nikmati akses kepada sumber pembelajaran yang tersedia!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard-awam" className="btn-primary">
                  Pergi ke Dashboard Awam
                </Link>
                <Link href="/nota" className="btn-secondary">
                  Baca Nota
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

