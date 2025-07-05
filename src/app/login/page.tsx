'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/utils/supabase'
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Code, 
  Sparkles, 
  BookOpen, 
  Trophy,
  Users,
  Zap,
  Shield,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface Notification {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      addNotification('error', 'Sila masukkan email dan password')
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        addNotification('error', error.message)
      } else {
        addNotification('success', 'Login berjaya! Mengalihkan ke dashboard...')
        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
      }
    } catch (error) {
      addNotification('error', 'Ralat tidak dijangka berlaku')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Code Symbols */}
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
        
        {/* Gradient Orbs */}
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
        {/* Left Side - Branding & Features */}
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
                Platform pembelajaran programming yang interaktif dengan playground kod online
              </p>
            </div>

            {/* Features */}
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-electric-blue/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-electric-blue" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Pembelajaran Interaktif</h3>
                  <p className="text-gray-400">Nota, video, dan latihan yang mudah difahami untuk semua tahap</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-neon-green/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Code className="w-5 h-5 text-neon-green" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Playground Kod Online</h3>
                  <p className="text-gray-400">Editor kod dengan syntax highlighting untuk JavaScript, PHP, Python, dan lagi</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Sistem XP & Leaderboard</h3>
                  <p className="text-gray-400">Kumpul XP, naik level, dan bersaing dengan pelajar lain</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Komuniti Pelajar</h3>
                  <p className="text-gray-400">Belajar bersama dan berkongsi pengetahuan dengan rakan-rakan</p>
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
              <p className="text-gray-400">Selamat kembali ke platform pembelajaran programming</p>
            </div>

            {/* Login Form */}
            <div className="glass-dark rounded-2xl p-8 border border-gray-700/50">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Log Masuk</h2>
                <p className="text-gray-400">Masukkan maklumat akaun anda untuk meneruskan pembelajaran</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent transition-all duration-300"
                      placeholder="nama@example.com"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-electric-blue focus:ring-electric-blue border-gray-600 rounded bg-gray-800"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                      Ingat saya
                    </label>
                  </div>
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
                      Sedang log masuk...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <span>Log Masuk</span>
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </div>
                  )}
                </button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gray-800 text-gray-400">atau</span>
                  </div>
                </div>

                {/* Register Link */}
                <div className="text-center">
                  <p className="text-gray-400">
                    Belum ada akaun?{' '}
                    <Link
                      href="/daftar"
                      className="text-electric-blue hover:text-electric-blue/80 font-medium transition-colors duration-300"
                    >
                      Daftar sekarang
                    </Link>
                  </p>
                </div>
              </form>

              {/* Security Badge */}
              <div className="mt-6 flex items-center justify-center text-gray-500 text-xs">
                <Shield className="w-4 h-4 mr-1" />
                <span>Dilindungi dengan enkripsi end-to-end</span>
              </div>
            </div>

            {/* Quick Access */}
            <div className="mt-6 text-center">
              <p className="text-gray-500 text-sm mb-3">Akses pantas:</p>
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

