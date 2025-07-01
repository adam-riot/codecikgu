'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'
import Link from 'next/link'

interface Post {
  id: string
  title: string
  content: string
  created_at: string
  author_id: string
}

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3)

      if (error) {
        console.error('Error fetching posts:', error)
      } else {
        setPosts(data || [])
      }
      setLoading(false)
    }

    fetchPosts()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-circuit">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-grid opacity-20"></div>
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-electric-blue/20 to-neon-cyan/20 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-gradient-to-br from-neon-green/20 to-electric-blue/20 rounded-full blur-xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-br from-neon-cyan/20 to-electric-blue/20 rounded-full blur-xl animate-float" style={{animationDelay: '4s'}}></div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-gradient bg-gradient-to-r from-electric-blue via-neon-cyan to-neon-green bg-clip-text text-transparent leading-tight">
              Selamat Datang ke <br />
              <span className="text-6xl md:text-8xl">CodeCikgu</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Platform pembelajaran <span className="text-gradient font-semibold">Sains Komputer</span> yang interaktif untuk murid Tingkatan 4 & 5. 
              Belajar dengan cara yang menyeronokkan dan dapatkan ganjaran!
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link href="/daftar" className="btn-primary text-lg px-8 py-4 group">
                <span className="flex items-center gap-2">
                  🚀 Daftar Sekarang
                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
              <Link href="/login" className="btn-secondary text-lg px-8 py-4">
                Log Masuk
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
              <div className="glass-dark rounded-lg p-4 card-hover">
                <div className="text-2xl md:text-3xl font-bold text-gradient">1,250+</div>
                <div className="text-gray-400 text-sm">Murid Aktif</div>
              </div>
              <div className="glass-dark rounded-lg p-4 card-hover">
                <div className="text-2xl md:text-3xl font-bold text-gradient">85+</div>
                <div className="text-gray-400 text-sm">Sekolah</div>
              </div>
              <div className="glass-dark rounded-lg p-4 card-hover">
                <div className="text-2xl md:text-3xl font-bold text-gradient">24</div>
                <div className="text-gray-400 text-sm">Topik</div>
              </div>
              <div className="glass-dark rounded-lg p-4 card-hover">
                <div className="text-2xl md:text-3xl font-bold text-gradient">15+</div>
                <div className="text-gray-400 text-sm">Ganjaran</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-electric-blue rounded-full flex justify-center">
            <div className="w-1 h-3 bg-electric-blue rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Active Campaign Section */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gradient">
              🎉 Pengumuman Terkini
            </h2>
            
            <div className="glass-dark rounded-2xl p-8 neon-glow card-hover">
              <div className="text-center">
                <h3 className="text-2xl md:text-3xl font-bold text-gradient-green mb-4">
                  Kempen Pembelajaran Aktif 2025!
                </h3>
                <p className="text-gray-300 text-lg mb-6">
                  Sertai kempen pembelajaran aktif dan dapatkan XP berganda untuk setiap topik yang diselesaikan!
                </p>
                <div className="flex items-center justify-center gap-4 text-neon-cyan">
                  <span className="text-sm">📅 Tempoh:</span>
                  <span className="font-semibold">1 Januari - 31 Mac 2025</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Posts Section */}
      <section className="py-16 bg-gradient-to-r from-dark-black/50 to-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gradient">
              📰 Post Terkini
            </h2>
            
            {loading ? (
              <div className="text-center text-gray-400">
                <div className="loading-dots">Memuat post</div>
              </div>
            ) : posts.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
                  <div key={post.id} className="glass-dark rounded-xl p-6 card-hover">
                    <h3 className="text-xl font-semibold text-primary mb-3">{post.title}</h3>
                    <p className="text-gray-400 mb-4 line-clamp-3">
                      {post.content.length > 150 ? `${post.content.substring(0, 150)}...` : post.content}
                    </p>
                    <p className="text-sm text-electric-blue">
                      {new Date(post.created_at).toLocaleDateString('ms-MY')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400">
                Tiada post tersedia pada masa ini.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Why Choose CodeCikgu Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gradient">
              Mengapa Pilih CodeCikgu?
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="glass-dark rounded-xl p-8 card-hover text-center">
                <div className="text-4xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-primary mb-4">Kurikulum Rasmi</h3>
                <p className="text-gray-400">
                  Kandungan pembelajaran yang selaras dengan Dokumen Standard Kurikulum dan Pentaksiran (DSKP) rasmi.
                </p>
              </div>
              
              <div className="glass-dark rounded-xl p-8 card-hover text-center">
                <div className="text-4xl mb-4">🎮</div>
                <h3 className="text-xl font-semibold text-primary mb-4">Gamifikasi</h3>
                <p className="text-gray-400">
                  Sistem XP, lencana, dan ganjaran yang memotivasikan pembelajaran berterusan.
                </p>
              </div>
              
              <div className="glass-dark rounded-xl p-8 card-hover text-center">
                <div className="text-4xl mb-4">🏆</div>
                <h3 className="text-xl font-semibold text-primary mb-4">Persaingan Sihat</h3>
                <p className="text-gray-400">
                  Bersaing secara sihat dengan rakan-rakan dari seluruh Malaysia dalam papan pendahulu global.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 bg-gradient-to-r from-electric-blue/10 via-neon-cyan/10 to-neon-green/10">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gradient">
              Sertai Ribuan Murid Lain
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              yang telah memilih CodeCikgu sebagai platform pembelajaran Sains Komputer mereka.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/daftar" className="btn-primary text-lg px-8 py-4">
                Mulakan Pembelajaran
              </Link>
              <Link href="/leaderboard" className="btn-secondary text-lg px-8 py-4">
                Lihat Leaderboard
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

