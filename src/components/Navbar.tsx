"use client"

import Link from 'next/link'
import Image from 'next/image'
import { supabase, getUserRole, getDashboardUrl, getUserDisplayName, type CustomUser } from '@/utils/supabase'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState<CustomUser | null>(null)
  const [userRole, setUserRole] = useState<string>('awam')
  const [userName, setUserName] = useState<string>('Tetamu')
  const [dashboardUrl, setDashboardUrl] = useState<string>('/dashboard-awam')
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        console.log('Auth user data:', user) // Debug log
        
        if (user) {
          setUser(user as CustomUser)
          
          // Fetch role, name, and dashboard URL from database
          const [role, name, dashUrl] = await Promise.all([
            getUserRole(user as CustomUser),
            getUserDisplayName(user as CustomUser),
            getDashboardUrl(user as CustomUser)
          ])
          
          console.log('Fetched role:', role) // Debug log
          console.log('Fetched name:', name) // Debug log
          console.log('Dashboard URL:', dashUrl) // Debug log
          
          setUserRole(role)
          setUserName(name)
          setDashboardUrl(dashUrl)
        } else {
          setUser(null)
          setUserRole('awam')
          setUserName('Tetamu')
          setDashboardUrl('/dashboard-awam')
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('Auth state changed:', session?.user) // Debug log
      
      if (session?.user) {
        const userData = session.user as CustomUser
        setUser(userData)
        
        // Fetch updated role and dashboard info
        const [role, name, dashUrl] = await Promise.all([
          getUserRole(userData),
          getUserDisplayName(userData),
          getDashboardUrl(userData)
        ])
        
        setUserRole(role)
        setUserName(name)
        setDashboardUrl(dashUrl)
      } else {
        setUser(null)
        setUserRole('awam')
        setUserName('Tetamu')
        setDashboardUrl('/dashboard-awam')
      }
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      router.push('/login')
    } else {
      console.error('Error signing out:', error.message)
    }
  }

  // Get role-specific navigation items
  const getNavigationItems = () => {
    // Common items for all users
    const commonItems = [
      { href: '/', label: 'Laman Utama' },
      { href: '/playground', label: 'Playground' },
      { href: '/nota', label: 'Nota' },
      { href: '/leaderboard', label: 'Leaderboard' }
    ]

    // Role-specific additional items
    const roleSpecificItems = []
    
    if (userRole === 'admin') {
      roleSpecificItems.push(
        { href: '/dashboard-admin/nota', label: 'Urus Nota' },
        { href: '/dashboard-admin/cabaran', label: 'Urus Cabaran' }
      )
    }

    return [...commonItems, ...roleSpecificItems]
  }

  // Get role-specific dashboard link
  const getDashboardLink = () => {
    switch (userRole) {
      case 'admin':
        return { href: '/dashboard-admin', label: 'Dashboard Admin', color: 'neon-green' }
      case 'murid':
        return { href: '/dashboard-murid', label: 'Dashboard Murid', color: 'electric-blue' }
      case 'awam':
      default:
        return { href: '/dashboard-awam', label: 'Dashboard Awam', color: 'electric-blue' }
    }
  }

  if (loading) {
    return (
      <nav className="bg-dark-black/95 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-700 rounded animate-pulse"></div>
              <div className="w-24 h-6 bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div className="w-20 h-8 bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      </nav>
    )
  }

  const navigationItems = getNavigationItems()
  const dashboardLink = getDashboardLink()

  return (
    <nav className="bg-dark-black/95 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-300">
            <Image
              src="/favicon.svg"
              alt="CodeCikgu"
              width={32}
              height={32}
              className="hover:scale-110 transition-transform duration-300"
            />
            <span className="text-xl font-bold text-gradient">CodeCikgu</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-300 hover:text-electric-blue transition-colors duration-300 font-medium"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  href={dashboardLink.href}
                  className={`px-4 py-2 rounded-lg border transition-all duration-300 font-medium ${
                    dashboardLink.color === 'neon-green'
                      ? 'bg-neon-green/20 border-neon-green/30 text-neon-green hover:bg-neon-green/30'
                      : 'bg-electric-blue/20 border-electric-blue/30 text-electric-blue hover:bg-electric-blue/30'
                  }`}
                >
                  {dashboardLink.label}
                </Link>
                <Link
                  href="/profile"
                  className="text-gray-300 hover:text-white transition-colors duration-300"
                >
                  👤 {userName}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-red-400 hover:text-red-300 transition-colors duration-300"
                >
                  Log Keluar
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/daftar"
                  className="text-gray-300 hover:text-electric-blue transition-colors duration-300"
                >
                  Daftar
                </Link>
                <Link
                  href="/login"
                  className="px-4 py-2 bg-electric-blue/20 border border-electric-blue/30 text-electric-blue hover:bg-electric-blue/30 rounded-lg transition-all duration-300"
                >
                  Log Masuk
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-300 hover:text-white transition-colors duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="py-4 space-y-2 border-t border-gray-800">
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
            
            {user ? (
              <>
                <Link
                  href={dashboardLink.href}
                  className={`block py-2 ${
                    dashboardLink.color === 'neon-green' ? 'text-neon-green' : 'text-electric-blue'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {dashboardLink.label}
                </Link>
                <Link
                  href="/profile"
                  className="block text-gray-300 hover:text-white transition-colors duration-300 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  👤 {userName}
                </Link>
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
