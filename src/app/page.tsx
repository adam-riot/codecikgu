'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, getUserRole, type CustomUser } from '@/utils/supabase'

export default function HomePage() {
  const router = useRouter()
  const [user, setUser] = useState<CustomUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          // User is logged in, redirect to role-specific home page
          const role = getUserRole(user as CustomUser)
          
          console.log('User logged in with role:', role) // Debug log
          
          // Redirect to role-specific home page
          switch (role) {
            case 'admin':
              router.push('/home-admin')
              return
            case 'murid':
              router.push('/home-murid')
              return
            case 'awam':
            default:
              router.push('/home-awam')
              return
          }
        } else {
          // User not logged in, show public landing page
          setUser(null)
          setLoading(false)
        }
      } catch (error) {
        console.error('Error checking user:', error)
        setLoading(false)
      }
    }

    checkUserAndRedirect()

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        checkUserAndRedirect()
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [router])

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-circuit dark:bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-electric-blue mb-4"></div>
          <p className="text-gray-400">Memuat...</p>
        </div>
      </div>
    )
  }

  // Public landing page for non-logged-in users
  return (
    <div className="min-h-screen bg-circuit dark:bg-gray-900 text-white">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-gradient">Selamat Datang</span>
              <br />
              <span className="text-gradient-green">ke CodeCikgu</span>
            </h1>
            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
              Platform pembelajaran <span className="text-electric-blue font-semibold">Sains Komputer</span> yang interaktif untuk murid 
              Tingkatan 4 & 5. Belajar dengan cara yang menyeronokkan dan 
              dapatkan ganjaran!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link 
                href="/daftar" 
                className="btn-primary flex items-center justify-center gap-2 px-8 py-4 text-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                </svg>
                🚀 Daftar Sekarang
              </Link>
              <Link 
                href="/login" 
                className="btn-secondary flex items-center justify-center gap-2 px-8 py-4 text-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Log Masuk
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gradient mb-4">Ciri-Ciri Platform CodeCikgu</h2>
            <p className="text-gray-400">Semua yang anda perlukan untuk pembelajaran Sains Komputer</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="glass-dark rounded-xl p-6 text-center neon-glow">
              <div className="w-12 h-12 bg-electric-blue/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-electric-blue" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-electric-blue mb-2">Playground</h3>
              <p className="text-gray-400 text-sm">Kod Editor Interaktif</p>
            </div>
            
            <div className="glass-dark rounded-xl p-6 text-center neon-glow">
              <div className="w-12 h-12 bg-neon-green/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-neon-green" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-neon-green mb-2">Nota</h3>
              <p className="text-gray-400 text-sm">Sumber Pembelajaran</p>
            </div>
            
            <div className="glass-dark rounded-xl p-6 text-center neon-glow">
              <div className="w-12 h-12 bg-neon-cyan/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-neon-cyan" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-neon-cyan mb-2">Leaderboard</h3>
              <p className="text-gray-400 text-sm">Ranking & Pencapaian</p>
            </div>
            
            <div className="glass-dark rounded-xl p-6 text-center neon-glow">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-yellow-400 mb-2">Profil</h3>
              <p className="text-gray-400 text-sm">Pengurusan Akaun</p>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Languages Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gradient mb-4">Bahasa Pengaturcaraan yang Disokong</h2>
            <p className="text-gray-400">Belajar dengan pelbagai bahasa pengaturcaraan popular</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            <div className="glass-dark rounded-xl p-4 text-center neon-glow hover:scale-105 transition-transform duration-300">
              <div className="text-3xl mb-2">☕</div>
              <h4 className="font-semibold text-orange-400">Java</h4>
            </div>
            
            <div className="glass-dark rounded-xl p-4 text-center neon-glow hover:scale-105 transition-transform duration-300">
              <div className="text-3xl mb-2">🐍</div>
              <h4 className="font-semibold text-green-400">Python</h4>
            </div>
            
            <div className="glass-dark rounded-xl p-4 text-center neon-glow hover:scale-105 transition-transform duration-300">
              <div className="text-3xl mb-2">⚡</div>
              <h4 className="font-semibold text-blue-400">C++</h4>
            </div>
            
            <div className="glass-dark rounded-xl p-4 text-center neon-glow hover:scale-105 transition-transform duration-300">
              <div className="text-3xl mb-2">🌐</div>
              <h4 className="font-semibold text-yellow-400">JavaScript</h4>
            </div>
            
            <div className="glass-dark rounded-xl p-4 text-center neon-glow hover:scale-105 transition-transform duration-300">
              <div className="text-3xl mb-2">🔷</div>
              <h4 className="font-semibold text-blue-500">C#</h4>
            </div>
            
            <div className="glass-dark rounded-xl p-4 text-center neon-glow hover:scale-105 transition-transform duration-300">
              <div className="text-3xl mb-2">🦀</div>
              <h4 className="font-semibold text-orange-500">Rust</h4>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gradient mb-4">Kenapa Pilih CodeCikgu?</h2>
            <p className="text-gray-400">Platform pembelajaran yang direka khas untuk pelajar Malaysia</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="glass-dark rounded-xl p-6 card-hover neon-glow">
              <div className="w-12 h-12 bg-electric-blue/20 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-electric-blue" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Playground Interaktif</h3>
              <p className="text-gray-400">Tulis dan jalankan kod terus dalam pelayar. Sokongan untuk Java, Python, C++, dan banyak lagi!</p>
            </div>

            <div className="glass-dark rounded-xl p-6 card-hover neon-glow">
              <div className="w-12 h-12 bg-neon-green/20 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-neon-green" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Sukatan Pelajaran SPM</h3>
              <p className="text-gray-400">Mengikut sukatan pelajaran Sains Komputer SPM untuk Tingkatan 4 & 5 yang terkini.</p>
            </div>

            <div className="glass-dark rounded-xl p-6 card-hover neon-glow">
              <div className="w-12 h-12 bg-neon-cyan/20 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-neon-cyan" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Nota Lengkap</h3>
              <p className="text-gray-400">Akses nota pembelajaran yang lengkap dalam format PDF, PowerPoint, dan Word.</p>
            </div>

            <div className="glass-dark rounded-xl p-6 card-hover neon-glow">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Sistem Ranking</h3>
              <p className="text-gray-400">Kumpul XP, naik level, dan bersaing dengan rakan-rakan dalam leaderboard!</p>
            </div>

            <div className="glass-dark rounded-xl p-6 card-hover neon-glow">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Multi-Role Support</h3>
              <p className="text-gray-400">Dashboard khusus untuk pelajar, awam, dan admin dengan ciri yang sesuai.</p>
            </div>

            <div className="glass-dark rounded-xl p-6 card-hover neon-glow">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Percuma Selamanya</h3>
              <p className="text-gray-400">Semua ciri asas percuma untuk semua pelajar. Tiada bayaran tersembunyi!</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="glass-dark rounded-xl p-8 text-center">
            <h2 className="text-3xl font-bold text-gradient mb-4">Sedia untuk Mula Belajar?</h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Sertai platform pembelajaran Sains Komputer yang direka khas untuk pelajar Malaysia. 
              Daftar sekarang dan mula perjalanan pembelajaran anda!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/daftar" className="btn-primary text-lg px-8 py-4">
                Daftar Percuma Sekarang
              </Link>
              <Link href="/about" className="btn-secondary text-lg px-8 py-4">
                Ketahui Lebih Lanjut
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

