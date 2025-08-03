'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, AlertTriangle, GraduationCap, Star } from 'lucide-react'
import { supabase } from '@/utils/supabase'
import { LoadingSpinner } from '@/components/LoadingSpinner'

interface User {
  id: string
  email: string
  role: string
}

interface GamificationAccessControlProps {
  children: React.ReactNode
}

export default function GamificationAccessControl({ children }: GamificationAccessControlProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()

  // Check user authentication and role
  useEffect(() => {
    const checkUser = async () => {
      try {
        setIsClient(true)
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session || !session.user) {
          // Not authenticated, redirect to login
          router.push('/login')
          return
        }

        // Get user role from database
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()

        if (error || !profile) {
          console.error('Error fetching user profile:', error)
          router.push('/login')
          return
        }

        const userRole = profile.role || 'awam'
        setUser({ id: session.user.id, email: session.user.email || '', role: userRole })
      } catch (error) {
        console.error('Error checking user:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [router])

  // Show loading while checking authentication
  if (!isClient || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" />
          <p className="text-gray-400 mt-4">Checking access...</p>
        </div>
      </div>
    )
  }

  // Show access denied for non-murid users
  if (user && user.role !== 'murid') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="glass-dark rounded-2xl p-8">
            <div className="text-orange-400 mb-6">
              <Lock className="w-16 h-16 mx-auto" />
            </div>

            <h1 className="text-2xl font-bold text-white mb-4">
              Akses Terhad
            </h1>

            <p className="text-gray-400 mb-6 leading-relaxed">
              Maaf, sistem gamifikasi hanya boleh diakses oleh murid yang berdaftar. 
              Anda sedang log masuk sebagai <strong>{user.role}</strong>.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/dashboard-awam')}
                className="btn-primary flex items-center justify-center space-x-2"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Ke Dashboard</span>
              </button>

              <button
                onClick={() => router.push('/')}
                className="btn-secondary flex items-center justify-center space-x-2"
              >
                <Star className="w-4 h-4" />
                <span>Ke Laman Utama</span>
              </button>
            </div>

            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-center space-x-2 text-blue-400 mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">Maklumat</span>
              </div>
              <p className="text-xs text-gray-300">
                Untuk mengakses sistem gamifikasi, anda perlu mendaftar sebagai murid. 
                Hubungi admin untuk pendaftaran.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show loading if user is not yet loaded
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" />
          <p className="text-gray-400 mt-4">Memuat sistem gamifikasi...</p>
        </div>
      </div>
    )
  }

  // User is authenticated and has murid role, render children
  return <>{children}</>
} 