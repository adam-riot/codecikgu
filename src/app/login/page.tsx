'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/utils/supabase'
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  ArrowRight, 
  Code, 
  Sparkles, 
  BookOpen, 
  Trophy,
  Users,
  Zap,
  Shield,
  CheckCircle,
  AlertCircle,
  User,
  GraduationCap
} from 'lucide-react'

interface Notification {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
}

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Add notification function
  const addNotification = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString()
    const notification: Notification = { id, type, message }
    
    setNotifications(prev => [...prev, notification])
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 5000)
  }

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        await redirectBasedOnRole(session.user.id)
      }
    }
    checkUser()
  }, [])

  // Function to get user role and redirect accordingly
  const redirectBasedOnRole = useCallback(async (userId: string) => {
    try {
      console.log('Getting user role for redirect...', userId)
      
      // Get user profile to determine role
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role, name, email')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        // Fallback: redirect to awam dashboard if profile not found
        console.log('Profile not found, redirecting to awam dashboard')
        router.push('/dashboard-awam')
        return
      }

      console.log('User profile found:', profile)

      // Redirect based on role
      if (profile.role === 'murid') {
        console.log('Redirecting murid to /dashboard-murid')
        addNotification('success', `Selamat datang, ${profile.name}! (Murid)`)
        router.push('/dashboard-murid')
      } else {
        console.log('Redirecting awam to /dashboard-awam')
        addNotification('success', `Selamat datang, ${profile.name}! (Awam)`)
        router.push('/dashboard-awam')
      }
    } catch (error: unknown) {
      console.error('Error in redirectBasedOnRole:', error)
      // Fallback to awam dashboard
      addNotification('info', 'Selamat datang! Mengalihkan ke dashboard awam.')
      router.push('/dashboard-awam')
    }
  }, [router, addNotification])

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        await redirectBasedOnRole(session.user.id)
      }
    }
    checkUser()
  }, [redirectBasedOnRole])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      addNotification('error', 'Sila masukkan email dan password')
      return
    }

    setLoading(true)

    try {
      console.log('Starting login process...', formData.email)

      // Attempt login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })

      if (error) {
        console.error('Login error:', error)
        
        if (error.message.includes('Invalid login credentials')) {
          addNotification('error', 'Email atau password tidak betul')
        } else if (error.message.includes('Email not confirmed')) {
          addNotification('error', 'Sila sahkan email anda terlebih dahulu')
        } else {
          addNotification('error', `Ralat log masuk: ${error.message}`)
        }
        return
      }

      if (data.user) {
        console.log('Login successful, user ID:', data.user.id)
        
        // Get user role and redirect accordingly
        await redirectBasedOnRole(data.user.id)
      } else {
        addNotification('error', 'Ralat: Log masuk tidak berjaya')
      }

    } catch (error: unknown) {
      console.error('Unexpected login error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      addNotification('error', `Ralat tidak dijangka: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 text-electric-blue/20 text-6xl font-mono animate-pulse">
          {'</>'}
        </div>
        <div className="absolute top-40 right-20 text-neon-green/20 text-4xl font-mono animate-bounce">
          {'{}'}
        </div>
        <div className="absolute bottom-40 left-20 text-purple-400/20 text-5xl font-mono animate-pulse">
          {'()'}
        </div>
        <div className="absolute bottom-20 right-10 text-orange-400/20 text-3xl font-mono animate-bounce">
          {'[]'}
        </div>
        
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-electric-blue/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-neon-green/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`flex items-center space-x-2 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 backdrop-blur-sm ${
              notification.type === 'success' 
                ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                : notification.type === 'error'
                ? 'bg-red-500/20 border border-red-500/30 text-red-400'
                : 'bg-blue-500/20 border border-blue-500/30 text-blue-400'
            }`}
          >
            {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {notification.type === 'error' && <AlertCircle className="w-5 h-5" />}
            {notification.type === 'info' && <AlertCircle className="w-5 h-5" />}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Branding & Benefits */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-16">
          <div className="max-w-lg">
            {/* Logo & Brand */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-electric-blue to-neon-green rounded-xl flex items-center justify-center mr-4">
                  <Code className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gradient">CodeCikgu</h1>
              </div>
              <p className="text-xl text-gray-300 leading-relaxed">
                Selamat kembali! Log masuk untuk meneruskan journey programming anda
              </p>
            </div>

            {/* Role-based Access Info */}
            <div className="mb-8 space-y-4">
              <div className="p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl border border-green-500/20">
                <div className="flex items-center mb-3">
                  <GraduationCap className="w-6 h-6 text-green-400 mr-2" />
                  <h4 className="text-lg font-semibold text-white">Pelajar MOE (Murid)</h4>
                </div>
                <p className="text-gray-300 text-sm">
                  Akses penuh ke dashboard murid dengan semua features XP, challenges, dan leaderboard
                </p>
              </div>

              <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20">
                <div className="flex items-center mb-3">
                  <User className="w-6 h-6 text-blue-400 mr-2" />
                  <h4 className="text-lg font-semibold text-white">Pengguna Awam</h4>
                </div>
                <p className="text-gray-300 text-sm">
                  Akses ke dashboard awam dengan nota, playground, dan features pembelajaran asas
                </p>
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-electric-blue/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-electric-blue" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Pembelajaran Berterusan</h3>
                  <p className="text-gray-400">Akses ke nota, video, dan playground kod yang dikemas kini</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-neon-green/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-neon-green" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Progress Tracking</h3>
                  <p className="text-gray-400">Jejak kemajuan pembelajaran dan pencapaian anda</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Code className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Kod Playground</h3>
                  <p className="text-gray-400">Editor kod canggih untuk practice dan experiment</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Komuniti</h3>
                  <p className="text-gray-400">Belajar dan berkongsi dengan komuniti programmer</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-electric-blue to-neon-green rounded-xl flex items-center justify-center mr-3">
                  <Code className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gradient">CodeCikgu</h1>
              </div>
              <p className="text-gray-400">Selamat kembali! Log masuk untuk meneruskan pembelajaran</p>
            </div>

            {/* Login Form */}
            <div className="glass-dark rounded-2xl p-8 border border-gray-700/50">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Log Masuk</h2>
                <p className="text-gray-400">Masukkan maklumat akaun anda</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent transition-all duration-300"
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="w-full pl-10 pr-12 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent transition-all duration-300"
                      placeholder="Masukkan password anda"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors duration-300"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Forgot Password Link */}
                <div className="text-right">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-electric-blue hover:text-electric-blue/80 transition-colors duration-300"
                  >
                    Lupa password?
                  </Link>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-electric-blue to-neon-green text-white font-semibold rounded-lg hover:from-electric-blue/90 hover:to-neon-green/90 focus:outline-none focus:ring-2 focus:ring-electric-blue focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Log masuk...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <span>Log Masuk</span>
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </div>
                  )}
                </button>

                {/* Register Link */}
                <div className="text-center">
                  <p className="text-gray-400">
                    Belum ada akaun?{' '}
                    <Link
                      href="/daftar"
                      className="text-electric-blue hover:text-electric-blue/80 font-medium transition-colors duration-300"
                    >
                      Daftar di sini
                    </Link>
                  </p>
                </div>
              </form>

              {/* Security Badge */}
              <div className="mt-6 flex items-center justify-center text-gray-500 text-xs">
                <Shield className="w-4 h-4 mr-1" />
                <span>Sambungan anda dilindungi dengan enkripsi SSL</span>
              </div>
            </div>

            {/* Quick Access */}
            <div className="mt-6 text-center">
              <p className="text-gray-500 text-sm mb-3">Atau jelajahi tanpa log masuk:</p>
              <div className="flex justify-center space-x-4">
                <Link
                  href="/playground"
                  className="flex items-center px-3 py-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg text-gray-300 hover:text-white transition-all duration-300 text-sm"
                >
                  <Code className="w-4 h-4 mr-1" />
                  Playground
                </Link>
                <Link
                  href="/nota"
                  className="flex items-center px-3 py-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg text-gray-300 hover:text-white transition-all duration-300 text-sm"
                >
                  <BookOpen className="w-4 h-4 mr-1" />
                  Nota
                </Link>
                <Link
                  href="/leaderboard"
                  className="flex items-center px-3 py-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg text-gray-300 hover:text-white transition-all duration-300 text-sm"
                >
                  <Trophy className="w-4 h-4 mr-1" />
                  Leaderboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

