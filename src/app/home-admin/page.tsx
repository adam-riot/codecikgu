'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'

export default function HomeAdminPage() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalNotes: 0,
    totalChallenges: 0,
    activeUsers: 0
  })

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    const fetchStats = async () => {
      // Simulasi data statistik
      setStats({
        totalStudents: 156,
        totalNotes: 24,
        totalChallenges: 12,
        activeUsers: 89
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
              <span className="inline-block px-4 py-2 bg-neon-green/20 border border-neon-green/30 rounded-full text-neon-green text-sm font-semibold mb-4">
                👨‍💼 Admin Dashboard
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-gradient">Selamat Datang</span>
              <br />
              <span className="text-gradient-green">Admin CodeCikgu</span>
            </h1>
            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
              Urus platform pembelajaran dengan mudah. Pantau aktiviti pelajar, tambah nota baharu, 
              dan cipta cabaran yang menarik untuk meningkatkan pengalaman pembelajaran.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/dashboard-admin" 
                className="btn-primary flex items-center justify-center gap-2 px-8 py-4 text-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                Dashboard Admin
              </Link>
              <Link 
                href="/dashboard-admin/nota" 
                className="btn-secondary flex items-center justify-center gap-2 px-8 py-4 text-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                Urus Nota
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gradient mb-4">Statistik Platform</h2>
            <p className="text-gray-400">Pantau prestasi dan aktiviti platform CodeCikgu</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-dark rounded-xl p-6 text-center neon-glow-green">
              <div className="w-12 h-12 bg-neon-green/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-neon-green" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-neon-green mb-2">{stats.totalStudents}</h3>
              <p className="text-gray-400">Jumlah Pelajar</p>
            </div>

            <div className="glass-dark rounded-xl p-6 text-center neon-glow">
              <div className="w-12 h-12 bg-electric-blue/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-electric-blue" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-electric-blue mb-2">{stats.totalNotes}</h3>
              <p className="text-gray-400">Nota Tersedia</p>
            </div>

            <div className="glass-dark rounded-xl p-6 text-center neon-glow">
              <div className="w-12 h-12 bg-neon-cyan/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-neon-cyan" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-neon-cyan mb-2">{stats.totalChallenges}</h3>
              <p className="text-gray-400">Cabaran Aktif</p>
            </div>

            <div className="glass-dark rounded-xl p-6 text-center neon-glow-green">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                  <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-green-400 mb-2">{stats.activeUsers}</h3>
              <p className="text-gray-400">Pengguna Aktif</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gradient mb-4">Tindakan Pantas</h2>
            <p className="text-gray-400">Akses pantas kepada fungsi pengurusan utama</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/dashboard-admin/nota" className="glass-dark rounded-xl p-6 card-hover neon-glow group">
              <div className="w-12 h-12 bg-electric-blue/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-electric-blue/30 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-electric-blue" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Urus Nota</h3>
              <p className="text-gray-400">Tambah, edit, dan padam nota pembelajaran untuk pelajar</p>
            </Link>

            <Link href="/dashboard-admin/cabaran" className="glass-dark rounded-xl p-6 card-hover neon-glow group">
              <div className="w-12 h-12 bg-neon-cyan/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-neon-cyan/30 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-neon-cyan" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Urus Cabaran</h3>
              <p className="text-gray-400">Cipta dan urus cabaran pembelajaran untuk pelajar</p>
            </Link>

            <Link href="/playground" className="glass-dark rounded-xl p-6 card-hover neon-glow group">
              <div className="w-12 h-12 bg-neon-green/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-neon-green/30 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-neon-green" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Playground</h3>
              <p className="text-gray-400">Uji dan jalankan kod dalam pelbagai bahasa pengaturcaraan</p>
            </Link>

            <Link href="/leaderboard" className="glass-dark rounded-xl p-6 card-hover neon-glow group">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-yellow-500/30 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Leaderboard</h3>
              <p className="text-gray-400">Pantau ranking dan pencapaian pelajar</p>
            </Link>

            <Link href="/dashboard-admin" className="glass-dark rounded-xl p-6 card-hover neon-glow group">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-500/30 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Dashboard Penuh</h3>
              <p className="text-gray-400">Akses dashboard admin yang lengkap dengan semua ciri</p>
            </Link>

            <Link href="/about" className="glass-dark rounded-xl p-6 card-hover neon-glow group">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-500/30 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Tentang Platform</h3>
              <p className="text-gray-400">Maklumat tentang CodeCikgu dan visi misi platform</p>
            </Link>
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
                Anda log masuk sebagai Admin. Anda mempunyai akses penuh kepada semua ciri pengurusan platform CodeCikgu.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard-admin" className="btn-primary">
                  Pergi ke Dashboard Admin
                </Link>
                <Link href="/dashboard-admin/nota" className="btn-secondary">
                  Urus Nota
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

