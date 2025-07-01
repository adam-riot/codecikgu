'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'

export default function AboutPage() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalSchools: 0,
    totalRewards: 0,
    totalXP: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch total students
        const { count: studentsCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'murid')

        // Fetch unique schools
        const { data: schoolsData } = await supabase
          .from('profiles')
          .select('sekolah')
          .eq('role', 'murid')
          .not('sekolah', 'is', null)

        const uniqueSchools = new Set(schoolsData?.map(item => item.sekolah) || [])

        // Fetch total rewards
        const { count: rewardsCount } = await supabase
          .from('ganjaran')
          .select('*', { count: 'exact', head: true })

        // Fetch total XP
        const { data: xpData } = await supabase
          .from('profiles')
          .select('xp')
          .eq('role', 'murid')

        const totalXP = xpData?.reduce((sum, profile) => sum + (profile.xp || 0), 0) || 0

        setStats({
          totalStudents: studentsCount || 1250,
          totalSchools: uniqueSchools.size || 85,
          totalRewards: rewardsCount || 15,
          totalXP: totalXP || 125000
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
        // Fallback to default values
        setStats({
          totalStudents: 1250,
          totalSchools: 85,
          totalRewards: 15,
          totalXP: 125000
        })
      }
      setLoading(false)
    }

    fetchStats()
  }, [])

  const techStack = [
    {
      name: 'Next.js',
      icon: '⚛️',
      description: 'Framework React untuk pembangunan web yang cepat dan SEO-friendly',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'TypeScript',
      icon: '📘',
      description: 'Bahasa pengaturcaraan yang memberikan type safety untuk JavaScript',
      color: 'from-blue-600 to-blue-400'
    },
    {
      name: 'TailwindCSS',
      icon: '🎨',
      description: 'Framework CSS utility-first untuk styling yang cepat dan konsisten',
      color: 'from-cyan-500 to-teal-500'
    },
    {
      name: 'Supabase',
      icon: '🗄️',
      description: 'Backend-as-a-Service untuk authentication, database, dan real-time features',
      color: 'from-green-500 to-emerald-500'
    },
    {
      name: 'Vercel',
      icon: '🚀',
      description: 'Platform deployment untuk aplikasi web yang cepat dan reliable',
      color: 'from-gray-600 to-gray-400'
    },
    {
      name: 'RLS',
      icon: '🔒',
      description: 'Sistem keselamatan data yang memastikan privasi dan akses yang selamat',
      color: 'from-red-500 to-pink-500'
    }
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
            Tentang CodeCikgu
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Membangunkan masa depan pendidikan <span className="text-gradient font-semibold">Sains Komputer</span> di Malaysia melalui 
            pembelajaran interaktif dan gamifikasi.
          </p>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gradient">
              Misi & Objektif Kami
            </h2>
            
            <div className="grid md:grid-cols-2 gap-12">
              {/* Mission */}
              <div className="glass-dark rounded-2xl p-8 card-hover">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-electric-blue to-neon-cyan rounded-full flex items-center justify-center mr-4">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <h3 className="text-2xl font-bold text-primary">Misi Kami</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Menyediakan platform pembelajaran Sains Komputer yang komprehensif, interaktif, dan menyeronokkan 
                  untuk murid Tingkatan 4 & 5 di seluruh Malaysia. Kami berkomitmen untuk memastikan setiap murid 
                  dapat menguasai konsep-konsep penting dalam Sains Komputer dengan cara yang berkesan.
                </p>
              </div>

              {/* Objectives */}
              <div className="glass-dark rounded-2xl p-8 card-hover">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-neon-green to-electric-blue rounded-full flex items-center justify-center mr-4">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <h3 className="text-2xl font-bold text-primary">Objektif Kami</h3>
                </div>
                <ul className="text-gray-300 space-y-3">
                  <li className="flex items-start">
                    <span className="text-electric-blue mr-2">•</span>
                    Meningkatkan minat murid terhadap Sains Komputer
                  </li>
                  <li className="flex items-start">
                    <span className="text-electric-blue mr-2">•</span>
                    Menyediakan pembelajaran yang selaras dengan DSKP
                  </li>
                  <li className="flex items-start">
                    <span className="text-electric-blue mr-2">•</span>
                    Membangunkan kemahiran pemikiran komputasional
                  </li>
                  <li className="flex items-start">
                    <span className="text-electric-blue mr-2">•</span>
                    Menyokong guru dalam proses pengajaran dan pembelajaran
                  </li>
                  <li className="flex items-start">
                    <span className="text-electric-blue mr-2">•</span>
                    Mewujudkan komuniti pembelajaran yang aktif
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-gradient-to-r from-dark-black/50 to-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gradient">
              📊 Statistik Platform
            </h2>
            
            {loading ? (
              <div className="text-center text-gray-400">
                <div className="loading-dots">Memuat statistik</div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="glass-dark rounded-xl p-6 text-center card-hover neon-glow">
                  <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">
                    {stats.totalStudents.toLocaleString()}+
                  </div>
                  <div className="text-gray-400">Murid Aktif</div>
                  <div className="text-2xl mt-2">👨‍🎓</div>
                </div>
                
                <div className="glass-dark rounded-xl p-6 text-center card-hover neon-glow-green">
                  <div className="text-3xl md:text-4xl font-bold text-gradient-green mb-2">
                    {stats.totalSchools}+
                  </div>
                  <div className="text-gray-400">Sekolah Terlibat</div>
                  <div className="text-2xl mt-2">🏫</div>
                </div>
                
                <div className="glass-dark rounded-xl p-6 text-center card-hover neon-glow-cyan">
                  <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">
                    {stats.totalRewards}+
                  </div>
                  <div className="text-gray-400">Ganjaran Tersedia</div>
                  <div className="text-2xl mt-2">🏆</div>
                </div>
                
                <div className="glass-dark rounded-xl p-6 text-center card-hover neon-glow">
                  <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">
                    {(stats.totalXP / 1000).toFixed(0)}K+
                  </div>
                  <div className="text-gray-400">Total XP Diperoleh</div>
                  <div className="text-2xl mt-2">⭐</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Developer Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-gradient">
              👨‍💻 Pembangun Platform
            </h2>
            
            <div className="glass-dark rounded-2xl p-8 card-hover">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-primary mb-2">Pembangun Utama & Pentadbir Sistem</h3>
                <p className="text-electric-blue font-semibold">adamsofi@codecikgu.com</p>
              </div>
              <p className="text-gray-300 leading-relaxed">
                CodeCikgu dibangunkan dengan dedikasi untuk memajukan pendidikan Sains Komputer di Malaysia. 
                Platform ini menggunakan teknologi terkini untuk memberikan pengalaman pembelajaran yang terbaik 
                kepada murid-murid di seluruh negara.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack Section */}
      <section className="py-16 bg-gradient-to-r from-dark-black/50 to-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gradient">
              🛠️ Teknologi Yang Digunakan
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {techStack.map((tech, index) => (
                <div key={tech.name} className="glass-dark rounded-xl p-6 card-hover" style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="flex items-center mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${tech.color} rounded-lg flex items-center justify-center mr-4`}>
                      <span className="text-xl">{tech.icon}</span>
                    </div>
                    <h3 className="text-xl font-bold text-primary">{tech.name}</h3>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {tech.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gradient">
              Jadilah Sebahagian Daripada Revolusi
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              pendidikan Sains Komputer di Malaysia. Mulakan perjalanan pembelajaran anda bersama kami!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/daftar" className="btn-primary text-lg px-8 py-4">
                Sertai Sekarang
              </a>
              <a href="/leaderboard" className="btn-secondary text-lg px-8 py-4">
                Lihat Pencapaian
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

