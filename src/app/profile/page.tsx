'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase'

interface UserProfile {
  id: string
  email: string
  full_name: string
  phone: string
  school: string
  grade: string
  birth_date: string
  gender: string
  address: string
  city: string
  state: string
  postcode: string
  emergency_contact_name: string
  emergency_contact_phone: string
  role: string
  created_at: string
  updated_at: string
}

interface UserStats {
  totalXP: number
  currentLevel: number
  completedChallenges: number
  notesRead: number
  playgroundSessions: number
  timeSpent: number
  favoriteLanguage: string
  achievements: string[]
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<UserProfile>>({})

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        setUser(user)

        // Simulasi data profil pengguna
        const mockProfile: UserProfile = {
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || '',
          phone: user.user_metadata?.phone || '',
          school: user.user_metadata?.school || '',
          grade: user.user_metadata?.grade || '',
          birth_date: user.user_metadata?.birth_date || '',
          gender: user.user_metadata?.gender || '',
          address: user.user_metadata?.address || '',
          city: user.user_metadata?.city || '',
          state: user.user_metadata?.state || '',
          postcode: user.user_metadata?.postcode || '',
          emergency_contact_name: user.user_metadata?.emergency_contact_name || '',
          emergency_contact_phone: user.user_metadata?.emergency_contact_phone || '',
          role: user.user_metadata?.role || 'awam',
          created_at: user.created_at || '',
          updated_at: new Date().toISOString()
        }

        setProfile(mockProfile)
        setFormData(mockProfile)

        // Simulasi statistik berdasarkan role
        if (user.user_metadata?.role === 'murid') {
          setStats({
            totalXP: 245,
            currentLevel: 3,
            completedChallenges: 8,
            notesRead: 12,
            playgroundSessions: 25,
            timeSpent: 15.5,
            favoriteLanguage: 'Python',
            achievements: ['First Steps', 'Code Warrior', 'Note Reader']
          })
        } else {
          setStats({
            totalXP: 0,
            currentLevel: 1,
            completedChallenges: 0,
            notesRead: 5,
            playgroundSessions: 12,
            timeSpent: 3.5,
            favoriteLanguage: 'JavaScript',
            achievements: ['Explorer']
          })
        }

      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  const handleSaveProfile = async () => {
    if (!user || !formData) return

    setSaving(true)
    try {
      // Simulasi update profil
      const updatedProfile = { ...profile, ...formData, updated_at: new Date().toISOString() }
      setProfile(updatedProfile as UserProfile)
      setIsEditing(false)
      
      // Dalam implementasi sebenar, update ke Supabase
      // const { error } = await supabase.auth.updateUser({
      //   data: formData
      // })
      
      alert('Profil berjaya dikemaskini!')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Gagal mengemaskini profil.')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const getDashboardLink = () => {
    const role = user?.user_metadata?.role
    const dashboardLinks = {
      admin: '/dashboard-admin',
      murid: '/dashboard-murid',
      awam: '/dashboard-awam'
    }
    return role ? dashboardLinks[role as keyof typeof dashboardLinks] : '/dashboard-awam'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-circuit dark:bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-electric-blue mb-4"></div>
          <p className="text-gray-400">Memuat profil...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-circuit dark:bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Profil Tidak Ditemui</h2>
          <p className="text-gray-400 mb-6">Tidak dapat memuat maklumat profil anda.</p>
          <Link href={getDashboardLink()} className="btn-primary">
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-circuit dark:bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gradient">Profil Saya</h1>
            <p className="text-gray-400 mt-2">Urus maklumat peribadi dan tetapan akaun anda</p>
          </div>
          <Link 
            href={getDashboardLink()} 
            className="btn-primary flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Kembali ke Dashboard
          </Link>
        </div>

        {/* Profile Header Card */}
        <div className="glass-dark rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-electric-blue to-neon-cyan rounded-full flex items-center justify-center text-3xl font-bold text-dark-black">
              {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : profile.email.charAt(0).toUpperCase()}
            </div>
            <div className="text-center md:text-left flex-1">
              <h2 className="text-2xl font-bold text-gradient mb-2">
                {profile.full_name || 'Nama Belum Ditetapkan'}
              </h2>
              <p className="text-gray-400 mb-2">{profile.email}</p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  profile.role === 'murid' 
                    ? 'bg-electric-blue/20 text-electric-blue border border-electric-blue/30'
                    : profile.role === 'admin'
                    ? 'bg-neon-green/20 text-neon-green border border-neon-green/30'
                    : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                }`}>
                  {profile.role === 'murid' ? '🎓 Pelajar' : profile.role === 'admin' ? '👨‍💼 Admin' : '🌟 Awam'}
                </span>
                {profile.school && (
                  <span className="px-3 py-1 rounded-full text-sm bg-gray-700 text-gray-300">
                    🏫 {profile.school}
                  </span>
                )}
                {profile.grade && (
                  <span className="px-3 py-1 rounded-full text-sm bg-gray-700 text-gray-300">
                    📚 {profile.grade}
                  </span>
                )}
              </div>
            </div>
            {stats && profile.role === 'murid' && (
              <div className="text-center">
                <div className="text-2xl font-bold text-electric-blue mb-1">Level {stats.currentLevel}</div>
                <div className="text-sm text-gray-400">{stats.totalXP} XP</div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === 'profile'
                ? 'bg-electric-blue/20 text-electric-blue border border-electric-blue/30'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            📝 Maklumat Peribadi
          </button>
          {stats && (
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === 'stats'
                  ? 'bg-electric-blue/20 text-electric-blue border border-electric-blue/30'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              📊 Statistik & Pencapaian
            </button>
          )}
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === 'settings'
                ? 'bg-electric-blue/20 text-electric-blue border border-electric-blue/30'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            ⚙️ Tetapan
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <div className="glass-dark rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gradient">Maklumat Peribadi</h3>
              <button
                onClick={() => {
                  if (isEditing) {
                    handleSaveProfile()
                  } else {
                    setIsEditing(true)
                  }
                }}
                disabled={saving}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  isEditing
                    ? 'bg-neon-green/20 text-neon-green border border-neon-green/30 hover:bg-neon-green/30'
                    : 'bg-electric-blue/20 text-electric-blue border border-electric-blue/30 hover:bg-electric-blue/30'
                }`}
              >
                {saving ? 'Menyimpan...' : isEditing ? '💾 Simpan' : '✏️ Edit'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Nama Penuh</label>
                <input
                  type="text"
                  value={formData.full_name || ''}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-electric-blue disabled:opacity-50"
                  placeholder="Masukkan nama penuh anda"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  disabled={true}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 opacity-50"
                  placeholder="Email tidak boleh diubah"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Nombor Telefon</label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-electric-blue disabled:opacity-50"
                  placeholder="Contoh: 012-3456789"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Tarikh Lahir</label>
                <input
                  type="date"
                  value={formData.birth_date || ''}
                  onChange={(e) => handleInputChange('birth_date', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-electric-blue disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Jantina</label>
                <select
                  value={formData.gender || ''}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-electric-blue disabled:opacity-50"
                >
                  <option value="">Pilih jantina</option>
                  <option value="lelaki">Lelaki</option>
                  <option value="perempuan">Perempuan</option>
                </select>
              </div>

              {/* Education Information */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Sekolah</label>
                <input
                  type="text"
                  value={formData.school || ''}
                  onChange={(e) => handleInputChange('school', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-electric-blue disabled:opacity-50"
                  placeholder="Nama sekolah"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Tingkatan</label>
                <select
                  value={formData.grade || ''}
                  onChange={(e) => handleInputChange('grade', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-electric-blue disabled:opacity-50"
                >
                  <option value="">Pilih tingkatan</option>
                  <option value="Tingkatan 1">Tingkatan 1</option>
                  <option value="Tingkatan 2">Tingkatan 2</option>
                  <option value="Tingkatan 3">Tingkatan 3</option>
                  <option value="Tingkatan 4">Tingkatan 4</option>
                  <option value="Tingkatan 5">Tingkatan 5</option>
                  <option value="Tingkatan 6">Tingkatan 6</option>
                  <option value="Universiti">Universiti</option>
                  <option value="Lain-lain">Lain-lain</option>
                </select>
              </div>

              {/* Address Information */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-2">Alamat</label>
                <textarea
                  value={formData.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  disabled={!isEditing}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-electric-blue disabled:opacity-50"
                  placeholder="Alamat penuh"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Bandar</label>
                <input
                  type="text"
                  value={formData.city || ''}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-electric-blue disabled:opacity-50"
                  placeholder="Bandar"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Negeri</label>
                <select
                  value={formData.state || ''}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-electric-blue disabled:opacity-50"
                >
                  <option value="">Pilih negeri</option>
                  <option value="Johor">Johor</option>
                  <option value="Kedah">Kedah</option>
                  <option value="Kelantan">Kelantan</option>
                  <option value="Melaka">Melaka</option>
                  <option value="Negeri Sembilan">Negeri Sembilan</option>
                  <option value="Pahang">Pahang</option>
                  <option value="Perak">Perak</option>
                  <option value="Perlis">Perlis</option>
                  <option value="Pulau Pinang">Pulau Pinang</option>
                  <option value="Sabah">Sabah</option>
                  <option value="Sarawak">Sarawak</option>
                  <option value="Selangor">Selangor</option>
                  <option value="Terengganu">Terengganu</option>
                  <option value="Wilayah Persekutuan Kuala Lumpur">Wilayah Persekutuan Kuala Lumpur</option>
                  <option value="Wilayah Persekutuan Labuan">Wilayah Persekutuan Labuan</option>
                  <option value="Wilayah Persekutuan Putrajaya">Wilayah Persekutuan Putrajaya</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Poskod</label>
                <input
                  type="text"
                  value={formData.postcode || ''}
                  onChange={(e) => handleInputChange('postcode', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-electric-blue disabled:opacity-50"
                  placeholder="Poskod"
                />
              </div>

              {/* Emergency Contact */}
              <div className="md:col-span-2">
                <h4 className="text-lg font-semibold text-gradient mb-4">Maklumat Kecemasan</h4>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Nama Kenalan Kecemasan</label>
                <input
                  type="text"
                  value={formData.emergency_contact_name || ''}
                  onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-electric-blue disabled:opacity-50"
                  placeholder="Nama ibu bapa/penjaga"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Telefon Kenalan Kecemasan</label>
                <input
                  type="tel"
                  value={formData.emergency_contact_phone || ''}
                  onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-electric-blue disabled:opacity-50"
                  placeholder="Nombor telefon kecemasan"
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end gap-4 mt-6 pt-6 border-t border-gray-700">
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setFormData(profile)
                  }}
                  className="px-6 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-all duration-300"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="px-6 py-2 rounded-lg bg-neon-green/20 text-neon-green border border-neon-green/30 hover:bg-neon-green/30 transition-all duration-300 disabled:opacity-50"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && stats && (
          <div className="space-y-6">
            {/* Progress Overview */}
            {profile.role === 'murid' && (
              <div className="glass-dark rounded-xl p-6">
                <h3 className="text-xl font-bold text-gradient mb-6">Progress Pembelajaran</h3>
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-electric-blue mb-2">Level {stats.currentLevel}</div>
                  <div className="text-gray-400 mb-4">{stats.totalXP} XP</div>
                  <div className="w-full bg-gray-700 rounded-full h-4">
                    <div 
                      className="bg-gradient-to-r from-electric-blue to-neon-cyan h-4 rounded-full transition-all duration-500"
                      style={{ width: `${(stats.totalXP % 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    {100 - (stats.totalXP % 100)} XP lagi untuk Level {stats.currentLevel + 1}
                  </p>
                </div>
              </div>
            )}

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {profile.role === 'murid' && (
                <div className="glass-dark rounded-xl p-6 text-center neon-glow">
                  <div className="w-12 h-12 bg-electric-blue/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-electric-blue" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-electric-blue mb-2">{stats.totalXP}</h3>
                  <p className="text-gray-400">Total XP</p>
                </div>
              )}

              {profile.role === 'murid' && (
                <div className="glass-dark rounded-xl p-6 text-center neon-glow-green">
                  <div className="w-12 h-12 bg-neon-green/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-neon-green" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-neon-green mb-2">{stats.completedChallenges}</h3>
                  <p className="text-gray-400">Cabaran Selesai</p>
                </div>
              )}

              <div className="glass-dark rounded-xl p-6 text-center neon-glow">
                <div className="w-12 h-12 bg-neon-cyan/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-neon-cyan" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-neon-cyan mb-2">{stats.notesRead}</h3>
                <p className="text-gray-400">Nota Dibaca</p>
              </div>

              <div className="glass-dark rounded-xl p-6 text-center neon-glow">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-purple-400 mb-2">{stats.playgroundSessions}</h3>
                <p className="text-gray-400">Sesi Playground</p>
              </div>

              <div className="glass-dark rounded-xl p-6 text-center neon-glow">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-yellow-400 mb-2">{stats.timeSpent}h</h3>
                <p className="text-gray-400">Masa Pembelajaran</p>
              </div>

              <div className="glass-dark rounded-xl p-6 text-center neon-glow">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-green-400 mb-2">{stats.favoriteLanguage}</h3>
                <p className="text-gray-400">Bahasa Kegemaran</p>
              </div>
            </div>

            {/* Achievements */}
            {profile.role === 'murid' && stats.achievements.length > 0 && (
              <div className="glass-dark rounded-xl p-6">
                <h3 className="text-xl font-bold text-gradient mb-6">Pencapaian</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stats.achievements.map((achievement, index) => (
                    <div key={index} className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-4 text-center">
                      <div className="text-2xl mb-2">🏆</div>
                      <h4 className="font-semibold text-yellow-400">{achievement}</h4>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="glass-dark rounded-xl p-6">
            <h3 className="text-xl font-bold text-gradient mb-6">Tetapan Akaun</h3>
            
            <div className="space-y-6">
              {/* Account Information */}
              <div className="border-b border-gray-700 pb-6">
                <h4 className="text-lg font-semibold mb-4">Maklumat Akaun</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">ID Pengguna</label>
                    <p className="text-white font-mono text-sm bg-gray-800 p-2 rounded">{profile.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Tarikh Daftar</label>
                    <p className="text-white">{new Date(profile.created_at).toLocaleDateString('ms-MY')}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Kemaskini Terakhir</label>
                    <p className="text-white">{new Date(profile.updated_at).toLocaleDateString('ms-MY')}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Status Akaun</label>
                    <span className="inline-block px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                      ✅ Aktif
                    </span>
                  </div>
                </div>
              </div>

              {/* Privacy Settings */}
              <div className="border-b border-gray-700 pb-6">
                <h4 className="text-lg font-semibold mb-4">Tetapan Privasi</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium">Profil Awam</h5>
                      <p className="text-sm text-gray-400">Benarkan pengguna lain melihat profil anda</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-electric-blue"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium">Notifikasi Email</h5>
                      <p className="text-sm text-gray-400">Terima notifikasi melalui email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-electric-blue"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div>
                <h4 className="text-lg font-semibold text-red-400 mb-4">Zon Bahaya</h4>
                <div className="space-y-4">
                  <button className="w-full md:w-auto px-6 py-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all duration-300">
                    🔄 Reset Kata Laluan
                  </button>
                  <button className="w-full md:w-auto px-6 py-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all duration-300 ml-0 md:ml-4">
                    🗑️ Padam Akaun
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

