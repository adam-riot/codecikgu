"use client"

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function HomePage() {
  const [currentFeature, setCurrentFeature] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % 4)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const features = [
    {
      icon: '🚀',
      title: 'Pembelajaran Interaktif',
      description: 'Belajar melalui praktikal dan simulasi langsung',
      color: '#3b82f6'
    },
    {
      icon: '🎮',
      title: 'Sistem Gamifikasi',
      description: 'Earn XP, unlock levels, dan compete dengan rakan-rakan',
      color: '#10b981'
    },
    {
      icon: '📊',
      title: 'Analytics Terperinci',
      description: 'Track progress dan identify areas for improvement',
      color: '#8b5cf6'
    },
    {
      icon: '🤖',
      title: 'AI Learning Assistant',
      description: 'Personalized learning dengan AI guidance',
      color: '#06b6d4'
    }
  ]

  const stats = [
    { number: '1000+', label: 'Pelajar Aktif' },
    { number: '50+', label: 'Topik Sains Komputer' },
    { number: '100+', label: 'Coding Challenges' },
    { number: '24/7', label: 'Akses Platform' }
  ]

  const testimonials = [
    {
      name: 'Ahmad Zulkarnain',
      role: 'Pelajar Tingkatan 5',
      content: 'CodeCikgu membantu saya memahami programming dengan lebih mudah. Sistem gamifikasi sangat menarik!',
      avatar: '👨‍🎓'
    },
    {
      name: 'Siti Nurul Ain',
      role: 'Pelajar Tingkatan 4',
      content: 'Platform yang sangat user-friendly. Saya suka cara ia mengajar step-by-step.',
      avatar: '👩‍🎓'
    },
    {
      name: 'Muhammad Amir',
      role: 'Pelajar Tingkatan 5',
      content: 'Best platform untuk belajar coding! Challenges dan leaderboard sangat motivating.',
      avatar: '👨‍💻'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section with Animated Background */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_1px_1px,rgba(156,146,172,0.15)_1px,transparent_0)] bg-[length:20px_20px]"></div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-cyan-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-40 left-20 w-24 h-24 bg-purple-500/20 rounded-full blur-xl animate-pulse delay-2000"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Logo and Title */}
            <div className="mb-8">
              <div className="text-8xl mb-6 animate-bounce">🖥️</div>
              <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600 bg-clip-text text-transparent">
                CodeCikgu
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
                Platform Pembelajaran Sains Komputer yang <span className="text-cyan-400 font-semibold">Interaktif</span> dan <span className="text-blue-400 font-semibold">Gamified</span> untuk Pelajar Malaysia
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link 
                href="/daftar" 
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50"
              >
                <span className="relative z-10">🚀 Mula Sekarang - Percuma</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-cyan-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              <Link 
                href="/login" 
                className="px-8 py-4 bg-white/10 backdrop-blur-md text-white font-semibold rounded-xl text-lg border border-white/20 transition-all duration-300 hover:bg-white/20 hover:scale-105"
              >
                🔑 Log Masuk
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div 
                  key={index}
                  className={`text-center p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 transition-all duration-500 hover:scale-105 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                  style={{ transitionDelay: `${index * 200}ms` }}
                >
                  <div className="text-2xl md:text-3xl font-bold text-cyan-400 mb-2">{stat.number}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-800 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              ✨ Ciri-ciri Utama
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Semua yang anda perlukan untuk menguasai Sains Komputer dengan cara yang menyeronokkan dan berkesan
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`group relative p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md border border-white/10 transition-all duration-500 hover:scale-105 hover:shadow-2xl ${
                  currentFeature === index ? 'ring-2 ring-cyan-400/50' : ''
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                <div 
                  className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl transition-all duration-300"
                  style={{ backgroundColor: feature.color }}
                ></div>
              </div>
            ))}
          </div>

          {/* Interactive Demo Section */}
          <div className="text-center">
            <div className="inline-block p-8 rounded-2xl bg-gradient-to-r from-blue-600/20 to-cyan-600/20 backdrop-blur-md border border-blue-500/30">
              <h3 className="text-2xl font-bold text-white mb-4">🎯 Lihat Demo Langsung</h3>
              <p className="text-gray-300 mb-6">Cuba playground kami untuk merasai pengalaman pembelajaran yang interaktif</p>
              <Link 
                href="/playground" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                🚀 Cuba Sekarang
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-slate-800 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              🔄 Bagaimana Ia Berfungsi
            </h2>
            <p className="text-xl text-gray-300">Proses pembelajaran yang mudah dan berkesan</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Daftar & Pilih Topik', desc: 'Buat akaun percuma dan pilih topik yang ingin dipelajari', icon: '📝' },
              { step: '2', title: 'Belajar & Praktikal', desc: 'Ikuti nota interaktif dan selesaikan coding challenges', icon: '🎓' },
              { step: '3', title: 'Earn XP & Level Up', desc: 'Dapatkan mata ganjaran dan unlock level baru', icon: '⭐' }
            ].map((item, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-3xl font-bold text-white group-hover:scale-110 transition-transform duration-300">
                    {item.step}
                  </div>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 transform -translate-y-1/2"></div>
                  )}
                </div>
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-b from-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              💬 Kata Mereka
            </h2>
            <p className="text-xl text-gray-300">Apa kata pelajar yang telah menggunakan CodeCikgu</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 transition-all duration-300 hover:scale-105 hover:bg-white/10"
              >
                <div className="text-4xl mb-4">{testimonial.avatar}</div>
                <p className="text-gray-300 mb-6 italic">&ldquo;{testimonial.content}&rdquo;</p>
                <div>
                  <div className="font-semibold text-white">{testimonial.name}</div>
                  <div className="text-sm text-gray-400">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900 via-slate-900 to-purple-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_1px_1px,rgba(156,146,172,0.15)_1px,transparent_0)] bg-[length:20px_20px]"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
            🎓 Mula Pembelajaran Anda Hari Ini
          </h2>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Sertai ribuan pelajar yang telah memulakan perjalanan pembelajaran Sains Komputer mereka dengan CodeCikgu. 
            Platform yang direka khusus untuk kurikulum Malaysia.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/daftar" 
              className="group relative px-10 py-5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl text-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/50"
            >
              <span className="relative z-10">🚀 Daftar Sekarang - Percuma</span>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            <Link 
              href="/playground" 
              className="px-10 py-5 bg-white/10 backdrop-blur-md text-white font-semibold rounded-xl text-xl border border-white/20 transition-all duration-300 hover:bg-white/20 hover:scale-105"
            >
              🎮 Cuba Playground
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: '📚', label: 'Nota Lengkap' },
              { icon: '💻', label: 'Coding Challenges' },
              { icon: '🏆', label: 'Leaderboard' },
              { icon: '🎯', label: 'Progress Tracking' }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl mb-2">{item.icon}</div>
                <div className="text-sm text-gray-400">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

