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

export default function DashboardAwam() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) {
        console.error('Error fetching posts:', error)
      } else {
        setPosts(data || [])
      }
      setLoading(false)
    }

    fetchPosts()
  }, [])

  const publicMaterials = [
    {
      title: 'Pengenalan Sains Komputer',
      description: 'Ketahui asas-asas Sains Komputer dan kepentingannya dalam dunia moden.',
      icon: '💻',
      status: 'open',
      color: 'from-electric-blue to-neon-cyan'
    },
    {
      title: 'Sejarah Komputer',
      description: 'Pelajari evolusi teknologi komputer dari masa ke masa.',
      icon: '📚',
      status: 'open',
      color: 'from-neon-green to-electric-blue'
    },
    {
      title: 'Asas Pemrograman',
      description: 'Modul pembelajaran interaktif untuk asas pemrograman.',
      icon: '⚡',
      status: 'restricted',
      color: 'from-gray-600 to-gray-800'
    },
    {
      title: 'Struktur Data',
      description: 'Pembelajaran mendalam tentang struktur data dan algoritma.',
      icon: '🔧',
      status: 'restricted',
      color: 'from-gray-600 to-gray-800'
    }
  ]

  const quickLinks = [
    { title: 'Tentang CodeCikgu', href: '/about', icon: '🏢' },
    { title: 'Papan Pendahulu Global', href: '/leaderboard', icon: '🏆' },
    { title: 'Log Masuk', href: '/login', icon: '🔐' },
    { title: 'Hubungi Sokongan', href: 'mailto:support@codecikgu.com', icon: '📧' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-circuit">
        <div className="absolute inset-0 bg-grid opacity-10"></div>
        <div className="absolute top-10 right-10 w-40 h-40 bg-gradient-to-br from-electric-blue/20 to-neon-cyan/20 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-gradient-to-br from-neon-green/20 to-electric-blue/20 rounded-full blur-xl animate-float" style={{animationDelay: '3s'}}></div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gradient">
            Dashboard Pengguna Awam
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Selamat datang! Nikmati akses terbuka kepada kandungan <span className="text-gradient font-semibold">CodeCikgu</span>
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Welcome Message */}
            <div className="glass-dark rounded-2xl p-8 card-hover neon-glow">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-electric-blue to-neon-cyan rounded-full flex items-center justify-center mr-4">
                  <span className="text-2xl">👋</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gradient">Selamat Datang ke CodeCikgu!</h2>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Sebagai pengguna awam, anda mempunyai akses kepada kandungan terbuka dan maklumat umum tentang platform pembelajaran Sains Komputer kami.
              </p>
              <div className="glass rounded-lg p-4 border border-electric-blue/30">
                <p className="text-electric-blue font-medium flex items-center">
                  <span className="text-2xl mr-3">💡</span>
                  <span><strong>Tip:</strong> Untuk akses penuh kepada semua ciri pembelajaran interaktif, daftar sebagai murid menggunakan email rasmi MOE!</span>
                </p>
              </div>
            </div>

            {/* Latest Posts */}
            <div className="glass-dark rounded-2xl p-8 card-hover">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-neon-green to-electric-blue rounded-lg flex items-center justify-center mr-4">
                  <span className="text-xl">📰</span>
                </div>
                <h2 className="text-2xl font-bold text-primary">Post Terkini</h2>
              </div>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 loading-dots">Memuat post</div>
                </div>
              ) : posts.length > 0 ? (
                <div className="space-y-6">
                  {posts.map((post) => (
                    <div key={post.id} className="glass rounded-xl p-6 border border-electric-blue/20 card-hover">
                      <h3 className="text-xl font-semibold mb-3 text-gradient">{post.title}</h3>
                      <p className="text-gray-300 mb-4 leading-relaxed">
                        {post.content.length > 200 ? `${post.content.substring(0, 200)}...` : post.content}
                      </p>
                      <div className="flex items-center text-sm text-electric-blue">
                        <span className="mr-2">📅</span>
                        <span>Diterbitkan pada {new Date(post.created_at).toLocaleDateString('ms-MY')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <div className="text-4xl mb-4">📭</div>
                  <div>Tiada post tersedia pada masa ini.</div>
                </div>
              )}
            </div>

            {/* Public Learning Materials */}
            <div className="glass-dark rounded-2xl p-8 card-hover">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-electric-blue to-neon-cyan rounded-lg flex items-center justify-center mr-4">
                  <span className="text-xl">📚</span>
                </div>
                <h2 className="text-2xl font-bold text-primary">Bahan Pembelajaran Terbuka</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {publicMaterials.map((material, index) => (
                  <div key={material.title} className={`glass rounded-xl p-6 card-hover border ${material.status === 'open' ? 'border-electric-blue/30' : 'border-gray-600/30'} ${material.status === 'restricted' ? 'opacity-60' : ''}`}>
                    <div className="flex items-center mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${material.color} rounded-lg flex items-center justify-center mr-4`}>
                        <span className="text-xl">{material.icon}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-primary">{material.title}</h3>
                    </div>
                    <p className="text-gray-300 mb-4 text-sm leading-relaxed">
                      {material.description}
                    </p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      material.status === 'open' 
                        ? 'bg-neon-green/20 text-neon-green border border-neon-green/30' 
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {material.status === 'open' ? '🔓 Terbuka' : '🔒 Murid Sahaja'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* CTA untuk Daftar Murid */}
            <div className="glass-dark rounded-2xl p-6 card-hover neon-glow-green">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-neon-green to-electric-blue rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎓</span>
                </div>
                <h3 className="text-xl font-bold text-gradient-green mb-4">Daftar Sebagai Murid</h3>
                <p className="text-gray-300 mb-4 text-sm">
                  Dapatkan akses penuh kepada:
                </p>
                <ul className="text-sm space-y-2 mb-6 text-left">
                  <li className="flex items-center text-gray-300">
                    <span className="text-electric-blue mr-2">⚡</span>
                    Pembelajaran interaktif
                  </li>
                  <li className="flex items-center text-gray-300">
                    <span className="text-electric-blue mr-2">🎮</span>
                    Sistem gamifikasi XP
                  </li>
                  <li className="flex items-center text-gray-300">
                    <span className="text-electric-blue mr-2">🏆</span>
                    Papan pendahulu
                  </li>
                  <li className="flex items-center text-gray-300">
                    <span className="text-electric-blue mr-2">🎁</span>
                    Ganjaran dan lencana
                  </li>
                  <li className="flex items-center text-gray-300">
                    <span className="text-electric-blue mr-2">📊</span>
                    Penjejakan kemajuan
                  </li>
                </ul>
                <Link href="/daftar" className="btn-primary w-full block text-center">
                  🚀 Daftar Sekarang
                </Link>
              </div>
            </div>

            {/* Platform Statistics */}
            <div className="glass-dark rounded-2xl p-6 card-hover">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-electric-blue to-neon-cyan rounded-lg flex items-center justify-center mr-3">
                  <span className="text-lg">📊</span>
                </div>
                <h3 className="text-xl font-semibold text-primary">Statistik Platform</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 flex items-center">
                    <span className="mr-2">👨‍🎓</span>
                    Murid Aktif:
                  </span>
                  <span className="font-bold text-gradient">1,250+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 flex items-center">
                    <span className="mr-2">🏫</span>
                    Sekolah Terlibat:
                  </span>
                  <span className="font-bold text-gradient">85+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 flex items-center">
                    <span className="mr-2">📚</span>
                    Topik Tersedia:
                  </span>
                  <span className="font-bold text-gradient">24</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 flex items-center">
                    <span className="mr-2">🎁</span>
                    Ganjaran:
                  </span>
                  <span className="font-bold text-gradient">15+</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="glass-dark rounded-2xl p-6 card-hover">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-neon-green to-electric-blue rounded-lg flex items-center justify-center mr-3">
                  <span className="text-lg">🔗</span>
                </div>
                <h3 className="text-xl font-semibold text-primary">Pautan Pantas</h3>
              </div>
              <div className="space-y-3">
                {quickLinks.map((link) => (
                  <Link 
                    key={link.title}
                    href={link.href} 
                    className="flex items-center text-gray-300 hover:text-electric-blue transition-all duration-300 p-2 rounded-lg hover:bg-electric-blue/10"
                  >
                    <span className="mr-3 text-lg">{link.icon}</span>
                    <span>{link.title}</span>
                    <span className="ml-auto text-electric-blue">→</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Announcement */}
            <div className="glass rounded-2xl p-6 border border-yellow-400/30 neon-glow-cyan">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-lg">📢</span>
                </div>
                <h3 className="text-lg font-semibold text-yellow-300">Pengumuman</h3>
              </div>
              <p className="text-yellow-200 text-sm leading-relaxed">
                Kempen pembelajaran aktif sedang berlangsung! Daftar sekarang dan dapatkan XP berganda untuk bulan pertama.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <section className="py-16 bg-gradient-to-r from-electric-blue/10 via-neon-cyan/10 to-neon-green/10">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gradient">
              Sedia untuk Mula Belajar?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Sertai ribuan murid lain yang telah memilih CodeCikgu untuk menguasai Sains Komputer!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/daftar" className="btn-primary text-lg px-8 py-4">
                🎓 Daftar Sebagai Murid
              </Link>
              <Link href="/" className="btn-secondary text-lg px-8 py-4">
                🏠 Kembali ke Laman Utama
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

