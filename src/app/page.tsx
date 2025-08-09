'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Play, BookOpen, Trophy, UserPlus } from 'lucide-react'

export default function HomePage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
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

  // Always show public landing page content
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-7xl font-bold mb-8 text-gradient leading-tight">
              Selamat Datang<br />
              ke CodeCikgu
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed">
              Platform pembelajaran <span className="text-electric-blue font-semibold">Sains Komputer</span> yang interaktif untuk murid Tingkatan 4 & 5.<br />
              Belajar dengan cara yang menyeronokkan dan dapatkan ganjaran!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/daftar" className="btn-primary text-lg px-8 py-4 flex items-center space-x-3">
                <UserPlus className="w-6 h-6" />
                <span>🚀 Daftar Sekarang</span>
              </Link>
              <Link href="/login" className="btn-secondary text-lg px-8 py-4 flex items-center space-x-3">
                <span>🔐 Log Masuk</span>
              </Link>
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

              <Link href="/daftar" className="glass-dark rounded-xl p-8 card-hover neon-glow-purple group text-center">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">👤</div>
                <h3 className="text-xl font-bold text-white mb-3">Daftar</h3>
                <p className="text-gray-400 text-sm mb-4">Cipta akaun untuk akses penuh semua ciri</p>
                <div className="text-purple-400 group-hover:underline">Daftar Sekarang →</div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-8 text-gradient">
              🎓 Mula Pembelajaran Anda Hari Ini
            </h2>
            <p className="text-xl text-gray-300 mb-12">
              Sertai ribuan pelajar yang telah memulakan perjalanan pembelajaran Sains Komputer mereka dengan CodeCikgu
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/daftar" className="btn-primary text-xl px-10 py-5 flex items-center space-x-3">
                <UserPlus className="w-6 h-6" />
                <span>Daftar Percuma Sekarang</span>
              </Link>
              <Link href="/playground" className="btn-secondary text-xl px-10 py-5 flex items-center space-x-3">
                <Play className="w-6 h-6" />
                <span>Cuba Playground</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

