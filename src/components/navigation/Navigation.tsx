"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase'
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  BookOpen, 
  Trophy, 
  Play, 
  Settings,
  Home,
  Users,
  FileText,
  BarChart3,
  GraduationCap,
  Award,
  Gamepad2
} from 'lucide-react'

interface UserProfile {
  id: string
  name: string
  email: string
  role: 'admin' | 'murid' | 'awam'
  xp?: number
  level?: number
}

export default function Navigation() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id, name, email, role, xp, level')
          .eq('id', session.user.id)
          .single()

        if (profile) {
          setUser(profile)
        }
      }
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      router.push('/')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const getNavigationItems = () => {
    if (!user) return []

    switch (user.role) {
      case 'admin':
        return [
          { href: '/dashboard-admin', label: 'Dashboard Admin', icon: BarChart3 },
          { href: '/dashboard-admin/nota', label: 'Kelola Nota', icon: FileText },
          { href: '/dashboard-admin/cabaran', label: 'Kelola Cabaran', icon: Trophy },
          { href: '/gamification', label: 'Gamifikasi', icon: Gamepad2 },
          { href: '/leaderboard', label: 'Leaderboard', icon: Award }
        ]
      case 'murid':
        return [
          { href: '/dashboard-murid', label: 'Dashboard Murid', icon: Home },
          { href: '/nota', label: 'Nota', icon: BookOpen },
          { href: '/challenges', label: 'Cabaran', icon: Trophy },
          { href: '/playground', label: 'Playground', icon: Play },
          { href: '/gamification', label: 'Gamifikasi', icon: Gamepad2 },
          { href: '/leaderboard', label: 'Leaderboard', icon: Award }
        ]
      case 'awam':
        return [
          { href: '/dashboard-awam', label: 'Dashboard Awam', icon: Home },
          { href: '/nota', label: 'Nota', icon: BookOpen },
          { href: '/playground', label: 'Playground', icon: Play },
          { href: '/leaderboard', label: 'Leaderboard', icon: Award }
        ]
      default:
        return []
    }
  }

  const getUserDisplayName = () => {
    if (!user) return ''
    return user.name || user.email?.split('@')[0] || 'User'
  }

  const getRoleDisplayName = () => {
    if (!user) return ''
    switch (user.role) {
      case 'admin': return 'Admin'
      case 'murid': return 'Murid'
      case 'awam': return 'Awam'
      default: return ''
    }
  }

  if (loading) {
    return (
      <nav className="bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-3 text-white no-underline">
                <Image alt="CodeCikgu" width={32} height={32} src="/favicon.svg" />
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  CodeCikgu
                </span>
              </Link>
            </div>
            <div className="animate-pulse bg-slate-700 h-8 w-32 rounded"></div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 text-white no-underline hover:opacity-80 transition-opacity">
              <Image alt="CodeCikgu" width={32} height={32} src="/favicon.svg" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                CodeCikgu
              </span>
            </Link>

            {/* Navigation Items - Desktop */}
            {user && (
              <div className="hidden md:flex items-center gap-1">
                {getNavigationItems().map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all duration-200"
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* Right Side - Auth Buttons or User Menu */}
          <div className="flex items-center gap-4">
            {user ? (
              /* User Menu */
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-3 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium">{getUserDisplayName()}</div>
                    <div className="text-xs text-slate-400">{getRoleDisplayName()}</div>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50">
                    <div className="p-4 border-b border-slate-700">
                      <div className="text-sm font-medium text-white">{getUserDisplayName()}</div>
                      <div className="text-xs text-slate-400">{user.email}</div>
                      {user.role === 'murid' && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                          <Trophy className="w-3 h-3" />
                          Level {user.level || 1} • {user.xp || 0} XP
                        </div>
                      )}
                    </div>
                    
                    <div className="p-2">
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 w-full px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        Profil
                      </Link>
                      
                      {user.role === 'murid' && (
                        <Link
                          href="/gamification"
                          className="flex items-center gap-3 w-full px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Gamepad2 className="w-4 h-4" />
                          Gamifikasi
                        </Link>
                      )}
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Log Keluar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Auth Buttons */
              <div className="flex items-center gap-3">
                <Link
                  href="/daftar"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Daftar
                </Link>
                <Link
                  href="/login"
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
                >
                  Log Masuk
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            {user && (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {user && isMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-700">
            <div className="space-y-2">
              {getNavigationItems().map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </nav>
  )
}
