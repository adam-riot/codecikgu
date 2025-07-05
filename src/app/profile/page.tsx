'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, getUserRole, getUserDisplayName, type CustomUser } from '@/utils/supabase'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  School, 
  Calendar, 
  Edit3, 
  Save, 
  X, 
  Trophy, 
  Target, 
  BookOpen, 
  Code,
  ArrowLeft,
  Shield,
  Settings,
  Bell,
  Lock
} from 'lucide-react'

interface ProfileData {
  id: string
  email: string
  full_name: string
  phone: string
  address: string
  school: string
  role: string
  created_at: string
  xp_points?: number
  level?: number
  completed_challenges?: number
  notes_read?: number
  activities_completed?: number
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<CustomUser | null>(null)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [userRole, setUserRole] = useState<string>('awam')
  const [userName, setUserName] = useState<string>('Tetamu')
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: '',
    address: '',
    school: ''
  })

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/login')
          return
        }

        setUser(user as CustomUser)
        
        // Enhanced role detection with multiple sources
        console.log('🔍 Profile - Auth user:', user) // Debug log
        console.log('🔍 Profile - User metadata:', user.user_metadata) // Debug log
        
        // Fetch role and name from database with enhanced logging
        const [role, name] = await Promise.all([
          getUserRole(user as CustomUser),
          getUserDisplayName(user as CustomUser)
        ])
        
        console.log('✅ Profile - Fetched role:', role) // Enhanced debug log
        console.log('✅ Profile - Fetched name:', name) // Enhanced debug log
        
        setUserRole(role)
        setUserName(name)
        
        // Fetch profile data from database
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Error fetching profile:', error)
          // Create default profile if doesn't exist
          const defaultProfile: ProfileData = {
            id: user.id,
            email: user.email || '',
            full_name: name,
            phone: '',
            address: '',
            school: '',
            role: role, // Use the fetched role
            created_at: user.created_at || new Date().toISOString(),
            xp_points: 0,
            level: 1,
            completed_challenges: 0,
            notes_read: 0,
            activities_completed: 0
          }
          
          setProfileData(defaultProfile)
          setEditForm({
            full_name: name,
            phone: '',
            address: '',
            school: ''
          })
        } else {
          // Update profile with current role if different
          const updatedProfile = {
            ...profile,
            role: role, // Ensure role is current
            full_name: profile.full_name || name
          }
          
          setProfileData(updatedProfile)
          setEditForm({
            full_name: updatedProfile.full_name || '',
            phone: updatedProfile.phone || '',
            address: updatedProfile.address || '',
            school: updatedProfile.school || ''
          })
        }
      } catch (error) {
        console.error('Error in fetchUserProfile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [router])

  const handleSaveProfile = async () => {
    if (!user || !profileData) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: profileData.email,
          full_name: editForm.full_name,
          phone: editForm.phone,
          address: editForm.address,
          school: editForm.school,
          role: userRole, // Use current detected role
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error saving profile:', error)
        alert('Gagal menyimpan profil. Sila cuba lagi.')
      } else {
        setProfileData({
          ...profileData,
          full_name: editForm.full_name,
          phone: editForm.phone,
          address: editForm.address,
          school: editForm.school,
          role: userRole // Update with current role
        })
        setEditing(false)
        alert('Profil berjaya dikemaskini!')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Ralat berlaku. Sila cuba lagi.')
    } finally {
      setSaving(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return '👨‍💼'
      case 'murid': return '👨‍🎓'
      case 'awam': return '👤'
      default: return '👤'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-neon-green bg-neon-green/20 border-neon-green/30'
      case 'murid': return 'text-electric-blue bg-electric-blue/20 border-electric-blue/30'
      case 'awam': return 'text-neon-cyan bg-neon-cyan/20 border-neon-cyan/30'
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30'
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin'
      case 'murid': return 'Murid'
      case 'awam': return 'Awam'
      default: return 'Awam'
    }
  }

  const getDashboardLink = (role: string) => {
    switch (role) {
      case 'admin': return '/dashboard-admin'
      case 'murid': return '/dashboard-murid'
      case 'awam': return '/dashboard-awam'
      default: return '/dashboard-awam'
    }
  }

  const getLevel = (xp: number) => {
    return Math.floor(xp / 100) + 1
  }

  const getXPForNextLevel = (xp: number) => {
    const currentLevel = getLevel(xp)
    return currentLevel * 100 - xp
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black flex items-center justify-center">
        <div className="glass-dark rounded-2xl p-8 text-center">
          <div className="text-2xl text-gradient loading-dots">Memuat profil</div>
        </div>
      </div>
    )
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black flex items-center justify-center">
        <div className="glass-dark rounded-2xl p-8 text-center">
          <div className="text-2xl text-red-400">Gagal memuat profil</div>
          <Link href="/" className="btn-primary mt-4">Kembali ke Laman Utama</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Link 
              href={getDashboardLink(userRole)}
              className="flex items-center text-gray-400 hover:text-electric-blue transition-colors duration-300"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Kembali ke Dashboard
            </Link>
            
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(userRole)}`}>
                {getRoleIcon(userRole)} {getRoleDisplayName(userRole)}
              </span>
            </div>
          </div>

          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gradient">
              👤 Profil Pengguna
            </h1>
            <p className="text-xl text-gray-300">
              Urus maklumat peribadi dan lihat pencapaian anda
            </p>
          </div>

          {/* Profile Header Card */}
          <div className="glass-dark rounded-xl p-8 mb-8">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-gradient-to-br from-electric-blue to-neon-cyan rounded-full flex items-center justify-center text-3xl font-bold text-white">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {userName || 'Nama Belum Ditetapkan'}
                </h2>
                <p className="text-gray-400 mb-3">{profileData.email}</p>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(userRole)}`}>
                  {getRoleIcon(userRole)} {getRoleDisplayName(userRole)}
                </span>
              </div>
              {userRole === 'murid' && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-electric-blue mb-1">
                    Level {getLevel(profileData.xp_points || 0)}
                  </div>
                  <div className="text-sm text-gray-400">
                    {profileData.xp_points || 0} XP
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Info */}
            <div className="lg:col-span-2">
              <div className="glass-dark rounded-xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <User className="w-6 h-6 mr-3 text-electric-blue" />
                    Maklumat Peribadi
                  </h2>
                  
                  {!editing ? (
                    <button
                      onClick={() => setEditing(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-electric-blue/20 border border-electric-blue/30 text-electric-blue hover:bg-electric-blue/30 rounded-lg transition-all duration-300"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="flex items-center space-x-2 px-4 py-2 bg-neon-green/20 border border-neon-green/30 text-neon-green hover:bg-neon-green/30 rounded-lg transition-all duration-300 disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        <span>{saving ? 'Menyimpan...' : 'Simpan'}</span>
                      </button>
                      <button
                        onClick={() => {
                          setEditing(false)
                          setEditForm({
                            full_name: profileData.full_name || '',
                            phone: profileData.phone || '',
                            address: profileData.address || '',
                            school: profileData.school || ''
                          })
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 rounded-lg transition-all duration-300"
                      >
                        <X className="w-4 h-4" />
                        <span>Batal</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Nama Penuh
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        value={editForm.full_name}
                        onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue transition-colors duration-300"
                        placeholder="Masukkan nama penuh"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-800/30 border border-gray-700 rounded-lg text-white">
                        {profileData.full_name || 'Belum ditetapkan'}
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Email
                    </label>
                    <div className="px-4 py-3 bg-gray-800/30 border border-gray-700 rounded-lg text-gray-400">
                      {profileData.email}
                      <span className="text-xs ml-2">(tidak boleh diubah)</span>
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Nombor Telefon
                    </label>
                    {editing ? (
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue transition-colors duration-300"
                        placeholder="Contoh: 012-3456789"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-800/30 border border-gray-700 rounded-lg text-white">
                        {profileData.phone || 'Belum ditetapkan'}
                      </div>
                    )}
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <MapPin className="w-4 h-4 inline mr-2" />
                      Alamat
                    </label>
                    {editing ? (
                      <textarea
                        value={editForm.address}
                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue transition-colors duration-300"
                        placeholder="Masukkan alamat lengkap"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-800/30 border border-gray-700 rounded-lg text-white min-h-[80px]">
                        {profileData.address || 'Belum ditetapkan'}
                      </div>
                    )}
                  </div>

                  {/* School */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <School className="w-4 h-4 inline mr-2" />
                      Sekolah/Institusi
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        value={editForm.school}
                        onChange={(e) => setEditForm({ ...editForm, school: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue transition-colors duration-300"
                        placeholder="Contoh: SMK Bandar Utama"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-800/30 border border-gray-700 rounded-lg text-white">
                        {profileData.school || 'Belum ditetapkan'}
                      </div>
                    )}
                  </div>

                  {/* Account Created */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Akaun Dicipta
                    </label>
                    <div className="px-4 py-3 bg-gray-800/30 border border-gray-700 rounded-lg text-gray-400">
                      {new Date(profileData.created_at).toLocaleDateString('ms-MY', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats & Settings */}
            <div className="space-y-8">
              {/* Stats Card */}
              {(userRole === 'murid' || userRole === 'awam') && (
                <div className="glass-dark rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                    <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                    Pencapaian
                  </h3>
                  
                  <div className="space-y-4">
                    {userRole === 'murid' && (
                      <>
                        {/* XP and Level */}
                        <div className="text-center p-4 bg-gradient-to-r from-electric-blue/20 to-neon-cyan/20 rounded-lg border border-electric-blue/30">
                          <div className="text-2xl font-bold text-electric-blue mb-1">
                            Level {getLevel(profileData.xp_points || 0)}
                          </div>
                          <div className="text-sm text-gray-300 mb-2">
                            {profileData.xp_points || 0} XP
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-electric-blue to-neon-cyan h-2 rounded-full transition-all duration-300"
                              style={{ 
                                width: `${((profileData.xp_points || 0) % 100)}%` 
                              }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {getXPForNextLevel(profileData.xp_points || 0)} XP ke level seterusnya
                          </div>
                        </div>

                        {/* Challenges */}
                        <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                          <div className="flex items-center">
                            <Target className="w-5 h-5 text-neon-green mr-2" />
                            <span className="text-gray-300">Cabaran Selesai</span>
                          </div>
                          <span className="text-neon-green font-bold">{profileData.completed_challenges || 0}</span>
                        </div>
                      </>
                    )}

                    {/* Notes Read */}
                    <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                      <div className="flex items-center">
                        <BookOpen className="w-5 h-5 text-electric-blue mr-2" />
                        <span className="text-gray-300">Nota Dibaca</span>
                      </div>
                      <span className="text-electric-blue font-bold">{profileData.notes_read || 0}</span>
                    </div>

                    {/* Activities */}
                    <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                      <div className="flex items-center">
                        <Code className="w-5 h-5 text-neon-cyan mr-2" />
                        <span className="text-gray-300">Aktiviti Selesai</span>
                      </div>
                      <span className="text-neon-cyan font-bold">{profileData.activities_completed || 0}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Account Settings */}
              <div className="glass-dark rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-gray-400" />
                  Tetapan Akaun
                </h3>
                
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-3 bg-gray-800/30 hover:bg-gray-800/50 rounded-lg transition-colors duration-300 text-left">
                    <div className="flex items-center">
                      <Bell className="w-5 h-5 text-yellow-400 mr-3" />
                      <span className="text-gray-300">Notifikasi</span>
                    </div>
                    <span className="text-gray-400">→</span>
                  </button>

                  <button className="w-full flex items-center justify-between p-3 bg-gray-800/30 hover:bg-gray-800/50 rounded-lg transition-colors duration-300 text-left">
                    <div className="flex items-center">
                      <Lock className="w-5 h-5 text-red-400 mr-3" />
                      <span className="text-gray-300">Keselamatan</span>
                    </div>
                    <span className="text-gray-400">→</span>
                  </button>

                  <button className="w-full flex items-center justify-between p-3 bg-gray-800/30 hover:bg-gray-800/50 rounded-lg transition-colors duration-300 text-left">
                    <div className="flex items-center">
                      <Shield className="w-5 h-5 text-green-400 mr-3" />
                      <span className="text-gray-300">Privasi</span>
                    </div>
                    <span className="text-gray-400">→</span>
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="glass-dark rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">Akses Pantas</h3>
                
                <div className="space-y-3">
                  <Link 
                    href="/playground"
                    className="w-full flex items-center p-3 bg-electric-blue/20 hover:bg-electric-blue/30 border border-electric-blue/30 rounded-lg transition-colors duration-300"
                  >
                    <Code className="w-5 h-5 text-electric-blue mr-3" />
                    <span className="text-electric-blue">Playground</span>
                  </Link>

                  <Link 
                    href="/nota"
                    className="w-full flex items-center p-3 bg-neon-green/20 hover:bg-neon-green/30 border border-neon-green/30 rounded-lg transition-colors duration-300"
                  >
                    <BookOpen className="w-5 h-5 text-neon-green mr-3" />
                    <span className="text-neon-green">Nota</span>
                  </Link>

                  <Link 
                    href="/leaderboard"
                    className="w-full flex items-center p-3 bg-neon-cyan/20 hover:bg-neon-cyan/30 border border-neon-cyan/30 rounded-lg transition-colors duration-300"
                  >
                    <Trophy className="w-5 h-5 text-neon-cyan mr-3" />
                    <span className="text-neon-cyan">Leaderboard</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Debug Info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-blue-900/20 text-blue-300 text-xs p-2 text-center border-t border-blue-800">
          DEBUG PROFILE: User={userName} | Role={userRole} | ProfileRole={profileData?.role}
        </div>
      )}
    </div>
  )
}

