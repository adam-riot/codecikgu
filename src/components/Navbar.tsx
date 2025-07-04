"use client"

import Link from 'next/link'
import { supabase, getUserRole, type CustomUser } from '@/utils/supabase'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState<CustomUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      console.log('User data:', user) // Debug log
      setUser(user as CustomUser)
      setLoading(false)
    }

    fetchUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', session?.user) // Debug log
      setUser((session?.user as CustomUser) || null)
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      router.push('/login')
    } else {
      console.error('Error signing out:', error.message)
    }
  }

  // Get role-specific navigation items
  const getNavigationItems = () => {
    const role = getUserRole(user)

    // Common items for all users
    const commonItems = [
      { href: '/', label: 'Laman Utama' },
      { href: '/about', label: 'Tentang Kami' },
      { href: '/leaderboard', label: 'Leaderboard' }
    ]

    // Add role-specific items
    if (user) {
      if (role === 'admin') {
        return [
          ...commonItems,
          { href: '/playground', label: 'Playground' },
          { href: '/nota', label: 'Nota' },
          { href: '/profile', label: 'Profil' }
        ]
      } else if (role === 'murid') {
        return [
          ...commonItems,
          { href: '/playground', label: 'Playground' },
          { href: '/nota', label: 'Nota' },
          { href: '/profile', label: 'Profil' }
        ]
      } else {
        // awam or default
        return [
          ...commonItems,
          { href: '/playground', label: 'Playground' },
          { href: '/nota', label: 'Nota' },
          { href: '/profile', label: 'Profil' }
        ]
      }
    }

    return commonItems
  }

  // Get role-specific dashboard link
  const getDashboardLink = () => {
    const role = getUserRole(user)
    
    if (!user || !role) return null

    const dashboardLinks = {
      admin: { href: '/dashboard-admin', label: 'Dashboard Admin', color: 'neon-green' },
      murid: { href: '/dashboard-murid', label: 'Dashboard Murid', color: 'electric-blue' },
      awam: { href: '/dashboard-awam', label: 'Dashboard Awam', color: 'electric-blue' }
    }

    return dashboardLinks[role as keyof typeof dashboardLinks] || dashboardLinks.awam
  }

  // Get role-specific home page link
  const getHomeLink = () => {
    const role = getUserRole(user)
    
    if (!user || !role) return '/'
    
    const homeLinks = {
      admin: '/home-admin',
      murid: '/home-murid', 
      awam: '/home-awam'
    }

    return homeLinks[role as keyof typeof homeLinks] || '/'
  }

  const navigationItems = getNavigationItems()
  const dashboardLink = getDashboardLink()

  return (
    <nav className="bg-gradient-to-r from-dark-black via-gray-900 to-dark-black backdrop-blur-lg border-b border-electric-blue/20 sticky top-0 z-50 shadow-lg shadow-electric-blue/10">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={getHomeLink()} className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-electric-blue to-neon-cyan rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-all duration-300">
              <span className="text-dark-black font-bold text-sm">C</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-electric-blue to-neon-cyan bg-clip-text text-transparent">
              CodeCikgu
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navigationItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href} 
                className="text-gray-300 hover:text-electric-blue transition-all duration-300 relative group"
              >
                <span>{item.label}</span>
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-electric-blue to-neon-cyan group-hover:w-full transition-all duration-300"></div>
              </Link>
            ))}
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {!loading && user ? (
              <>
                {dashboardLink && (
                  <Link 
                    href={dashboardLink.href} 
                    className={`px-4 py-2 bg-gradient-to-r ${
                      dashboardLink.color === 'neon-green' 
                        ? 'from-neon-green/20 to-electric-blue/20 border-neon-green/30 text-neon-green hover:bg-neon-green/30 hover:shadow-neon-green/25' 
                        : 'from-electric-blue/20 to-neon-cyan/20 border-electric-blue/30 text-electric-blue hover:bg-electric-blue/30 hover:shadow-electric-blue/25'
                    } border rounded-lg transition-all duration-300 hover:shadow-lg`}
                  >
                    {dashboardLink.label}
                  </Link>
                )}
                <button 
                  onClick={handleSignOut} 
                  className="px-4 py-2 bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25"
                >
                  Log Keluar
                </button>
              </>
            ) : (
              <>
                <Link href="/daftar" className="text-gray-300 hover:text-electric-blue transition-all duration-300">
                  Daftar
                </Link>
                <Link href="/login" className="px-4 py-2 bg-gradient-to-r from-electric-blue to-neon-cyan text-dark-black font-semibold rounded-lg hover:shadow-lg hover:shadow-electric-blue/50 transition-all duration-300 transform hover:scale-105">
                  Log Masuk
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-300 hover:text-electric-blue transition-colors duration-300"
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              <span className={`bg-current block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${mobileMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-0.5'}`}></span>
              <span className={`bg-current block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
              <span className={`bg-current block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${mobileMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-0.5'}`}></span>
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
          <div className="py-4 space-y-4 border-t border-electric-blue/20">
            {navigationItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href} 
                className="block text-gray-300 hover:text-electric-blue transition-colors duration-300 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            
            {!loading && user ? (
              <>
                {dashboardLink && (
                  <Link 
                    href={dashboardLink.href} 
                    className={`block py-2 ${
                      dashboardLink.color === 'neon-green' ? 'text-neon-green' : 'text-electric-blue'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {dashboardLink.label}
                  </Link>
                )}
                <button 
                  onClick={() => {
                    handleSignOut()
                    setMobileMenuOpen(false)
                  }} 
                  className="block text-red-400 py-2 w-full text-left"
                >
                  Log Keluar
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/daftar" 
                  className="block text-gray-300 hover:text-electric-blue transition-colors duration-300 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Daftar
                </Link>
                <Link 
                  href="/login" 
                  className="block text-electric-blue py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log Masuk
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

