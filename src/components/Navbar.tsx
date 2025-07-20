'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase, getUserRole, getUserDisplayName, type CustomUser } from '@/utils/supabase'
import { ThemeToggle } from '@/components/ThemeProvider'
import { TutorialSelector } from '@/components/TutorialSystem'

export default function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState<CustomUser | null>(null)
  const [userRole, setUserRole] = useState<string>('awam')
  const [userName, setUserName] = useState<string>('Tetamu')
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        console.log('🔍 Navbar - Auth user:', user) // Enhanced debug log
        
        if (user) {
          const userData = user as CustomUser
          setUser(userData)
          
          // Enhanced role detection with multiple fallbacks
          console.log('🔍 Navbar - User metadata:', userData.user_metadata) // Debug log
          console.log('🔍 Navbar - User email:', userData.email) // Debug log
          
          // Fetch role and name from database with enhanced logging
          const [role, name] = await Promise.all([
            getUserRole(userData),
            getUserDisplayName(userData)
          ])
          
          console.log('✅ Navbar - Final fetched role:', role) // Enhanced debug log
          console.log('✅ Navbar - Final fetched name:', name) // Enhanced debug log
          
          setUserRole(role)
          setUserName(name)
          
          // Additional verification
          console.log('🎯 Navbar - State updated with role:', role)
        } else {
          console.log('❌ Navbar - No user found')
          setUser(null)
          setUserRole('awam')
          setUserName('Tetamu')
        }
      } catch (error) {
        console.error('❌ Navbar - Error fetching user data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()

    // Listen for auth changes with enhanced logging
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      console.log('🔄 Navbar - Auth state changed:', event, session?.user?.email) // Enhanced debug log
      
      if (session?.user) {
        const userData = session.user as CustomUser
        setUser(userData)
        
        const [role, name] = await Promise.all([
          getUserRole(userData),
          getUserDisplayName(userData)
        ])
        
        console.log('🔄 Navbar - Auth change - New role:', role) // Enhanced debug log
        console.log('🔄 Navbar - Auth change - New name:', name) // Enhanced debug log
        
        setUserRole(role)
        setUserName(name)
      } else {
        console.log('🔄 Navbar - Auth change - User logged out')
        setUser(null)
        setUserRole('awam')
        setUserName('Tetamu')
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setUserRole('awam')
      setUserName('Tetamu')
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Navigation items - ALWAYS include "Laman Utama" pointing to "/"
  const navigationItems = [
    { href: '/', label: 'Laman Utama' },
    { href: '/playground', label: 'Playground' },
    { href: '/gamification', label: 'Gamifikasi' },
    { href: '/nota', label: 'Nota' },
    { href: '/leaderboard', label: 'Leaderboard' }
  ]

  // Add role-specific navigation items
  if (user && userRole === 'admin') {
    navigationItems.push(
      { href: '/dashboard-admin/nota', label: 'Urus Nota' },
      { href: '/dashboard-admin/cabaran', label: 'Urus Cabaran' }
    )
  }

  // Enhanced dashboard link with better role detection
  const getDashboardLink = () => {
    if (!user) {
      console.log('🎯 getDashboardLink - No user, returning null')
      return null
    }
    
    console.log('🎯 getDashboardLink - Current userRole:', userRole) // Enhanced debug log
    
    switch (userRole) {
      case 'admin':
        console.log('🎯 getDashboardLink - Returning admin dashboard')
        return {
          href: '/dashboard-admin',
          label: 'Dashboard Admin',
          color: 'neon-green'
        }
      case 'murid':
        console.log('🎯 getDashboardLink - Returning murid dashboard')
        return {
          href: '/dashboard-murid',
          label: 'Dashboard Murid',
          color: 'electric-blue'
        }
      case 'awam':
        console.log('🎯 getDashboardLink - Returning awam dashboard')
        return {
          href: '/dashboard-awam',
          label: 'Dashboard Awam',
          color: 'electric-blue'
        }
      default:
        console.log('🎯 getDashboardLink - Unknown role, defaulting to awam:', userRole)
        return {
          href: '/dashboard-awam',
          label: 'Dashboard Awam',
          color: 'electric-blue'
        }
    }
  }

  const dashboardLink = getDashboardLink()
  
  // Enhanced debug logging for dashboard link
  console.log('🎯 Navbar render - userRole:', userRole, 'dashboardLink:', dashboardLink)

  if (loading) {
    return (
      <nav className="bg-dark-black/95 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
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
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-8 bg-gray-800/50 rounded animate-pulse"></div>
              <div className="w-16 h-8 bg-gray-800/50 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-dark-black/95 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-8">
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
            <div className="hidden md:flex items-center space-x-6">
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
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <TutorialSelector />
            <ThemeToggle />
            {user ? (
              <>
                {dashboardLink && (
                  <Link
                    href={dashboardLink.href}
                    className={`px-4 py-2 rounded-lg border transition-all duration-300 font-medium ${
                      dashboardLink.color === 'neon-green'
                        ? 'bg-neon-green/20 border-neon-green/30 text-neon-green hover:bg-neon-green/30'
                        : 'bg-electric-blue/20 border-electric-blue/30 text-electric-blue hover:bg-electric-blue/30'
                    }`}
                    title={`Role: ${userRole}`} // Debug tooltip
                  >
                    {dashboardLink.label}
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="text-gray-300 hover:text-white transition-colors duration-300"
                  title={`User: ${userName} (${userRole})`} // Debug tooltip
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

            {/* Theme Toggle for Mobile */}
            <div className="py-2 flex justify-center">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
      
      {/* Debug Info (only in development) */}
      {process.env.NODE_ENV === 'development' && user && (
        <div className="bg-red-900/20 text-red-300 text-xs p-2 text-center border-b border-red-800">
          DEBUG: User={userName} | Role={userRole} | Dashboard={dashboardLink?.label || 'None'}
        </div>
      )}
    </nav>
  )
}

