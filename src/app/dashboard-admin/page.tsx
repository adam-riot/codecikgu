'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/utils/supabase'
import { useRouter } from 'next/navigation'
import CreateChallenge from '@/components/CreateChallenge'
import Image from 'next/image' // Import Image component

interface Profile {
  id: string
  name: string
  email: string
  sekolah: string
  tingkatan: string
  role: string
  xp: number
  created_at: string
}

interface XPLog {
  id: string
  user_id: string
  aktiviti: string
  mata: number
  created_at: string
  profiles: {
    name: string
    email: string
  }
}

interface Ganjaran {
  id: string
  nama: string
  deskripsi: string
  syarat_xp: number
  imej_url: string
}

interface Challenge {
  id: string
  title: string
  description: string
  type: 'quiz' | 'video' | 'reading' | 'upload'
  subject: string
  tingkatan: string
  xp_reward: number
  is_active: boolean
  created_at: string
  due_date?: string
  evaluation_type: 'automatic' | 'manual'
  content?: any
  pass_criteria?: any
  challenge_submissions?: { count: number }[]
}

export default function DashboardAdmin() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [xpLogs, setXpLogs] = useState<XPLog[]>([])
  const [ganjaran, setGanjaran] = useState<Ganjaran[]>([])
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('users')
  const [showAddChallengeModal, setShowAddChallengeModal] = useState(false)
  const [showCreateChallengeWizard, setShowCreateChallengeWizard] = useState(false)
  
  // Form states
  const [newGanjaran, setNewGanjaran] = useState({
    nama: '',
    deskripsi: '',
    syarat_xp: 0,
    imej_url: ''
  })

  const [newChallenge, setNewChallenge] = useState({
    title: '',
    description: '',
    type: 'quiz' as 'quiz' | 'video' | 'reading' | 'upload',
    subject: '',
    tingkatan: '',
    xp_reward: 0,
    due_date: '',
    evaluation_type: 'automatic' as 'automatic' | 'manual',
    content: {}
  })

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user || user.email !== 'adamsofi@codecikgu.com') {
        router.push('/login')
        return
      }

      await fetchData()
    }

    checkAuth()
  }, [router])

  const fetchData = async () => {
    try {
      // Fetch all profiles
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (profilesData) {
        setProfiles(profilesData)
      }

      // Fetch XP logs with profile info
      const { data: xpLogsData } = await supabase
        .from('xp_log')
        .select(`
          *,
          profiles (
            name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50)

      if (xpLogsData) {
        setXpLogs(xpLogsData)
      }

      // Fetch ganjaran
      const { data: ganjaranData } = await supabase
        .from('ganjaran')
        .select('*')
        .order('syarat_xp', { ascending: true })

      if (ganjaranData) {
        setGanjaran(ganjaranData)
      }

      // Fetch challenges with submission counts
      const { data: challengesData } = await supabase
        .from('challenges')
        .select(`
          *,
          challenge_submissions(count)
        `)
        .order('created_at', { ascending: false })

      if (challengesData) {
        setChallenges(challengesData)
      }

    } catch (error) {
      console.error('Error fetching data:', error)
    }
    setLoading(false)
  }

  const handleAddGanjaran = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const { error } = await supabase
        .from('ganjaran')
        .insert([newGanjaran])

      if (error) throw error

      // Reset form
      setNewGanjaran({
        nama: '',
        deskripsi: '',
        syarat_xp: 0,
        imej_url: ''
      })

      // Refresh data
      await fetchData()
      
    } catch (error) {
      console.error('Error adding ganjaran:', error)
    }
  }

  const handleAddChallenge = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const { error } = await supabase
        .from('challenges')
        .insert([{
          ...newChallenge,
          is_active: true
        }])

      if (error) throw error

      // Reset form
      setNewChallenge({
        title: '',
        description: '',
        type: 'quiz',
        subject: '',
        tingkatan: '',
        xp_reward: 0,
        due_date: '',
        evaluation_type: 'automatic',
        content: {}
      })

      setShowAddChallengeModal(false)
      await fetchData()
      
    } catch (error) {
      console.error('Error adding challenge:', error)
    }
  }

  const handleDeleteGanjaran = async (id: string) => {
    if (!confirm('Adakah anda pasti ingin memadam ganjaran ini?')) return

    try {
      const { error } = await supabase
        .from('ganjaran')
        .delete()
        .eq('id', id)

      if (error) throw error

      await fetchData()
    } catch (error) {
      console.error('Error deleting ganjaran:', error)
    }
  }

  const handleToggleChallengeStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('challenges')
        .update({ is_active: !currentStatus })
        .eq('id', id)

      if (error) throw error

      await fetchData()
    } catch (error) {
      console.error('Error updating challenge status:', error)
    }
  }

  const handleDeleteChallenge = async (id: string) => {
    if (!confirm('Adakah anda pasti ingin memadam cabaran ini?')) return

    try {
      const { error } = await supabase
        .from('challenges')
        .delete()
        .eq('id', id)

      if (error) throw error

      await fetchData()
    } catch (error) {
      console.error('Error deleting challenge:', error)
    }
  }

  const getStats = useCallback(() => {
    const totalUsers = profiles.length
    const totalStudents = profiles.filter(p => p.role === 'murid').length
    const totalPublic = profiles.filter(p => p.role === 'awam').length
    const totalXP = profiles.reduce((sum, p) => sum + (p.xp || 0), 0)
    const totalChallenges = challenges.length
    const activeChallenges = challenges.filter(c => c.is_active).length
    
    return { totalUsers, totalStudents, totalPublic, totalXP, totalChallenges, activeChallenges }
  }, [profiles, challenges])

  const getChallengeTypeIcon = useCallback((type: string) => {
    switch (type) {
      case 'quiz': return '📝'
      case 'video': return '🎥'
      case 'reading': return '📖'
      case 'upload': return '📤'
      default: return '🏆'
    }
  }, [])

  const getChallengeTypeName = useCallback((type: string) => {
    switch (type) {
      case 'quiz': return 'Kuiz'
      case 'video': return 'Video'
      case 'reading': return 'Bacaan'
      case 'upload': return 'Muat Naik'
      default: return 'Cabaran'
    }
  }, [])

  const getChallengeStats = useCallback(() => {
    const quizCount = challenges.filter(c => c.type === 'quiz').length
    const videoCount = challenges.filter(c => c.type === 'video').length
    const readingCount = challenges.filter(c => c.type === 'reading').length
    const uploadCount = challenges.filter(c => c.type === 'upload').length
    const totalSubmissions = challenges.reduce((sum, c) => sum + (c.challenge_submissions?.[0]?.count || 0), 0)
    
    return { quizCount, videoCount, readingCount, uploadCount, totalSubmissions }
  }, [challenges])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black flex items-center justify-center">
        <div className="glass-dark rounded-2xl p-8 text-center">
          <div className="text-2xl text-gradient loading-dots">Memuat dashboard admin</div>
        </div>
      </div>
    )
  }

  const stats = getStats()
  const challengeStats = getChallengeStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black">
      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden bg-circuit">
        <div className="absolute inset-0 bg-grid opacity-10"></div>
        <div className="absolute top-10 right-10 w-40 h-40 bg-gradient-to-br from-electric-blue/20 to-neon-cyan/20 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-gradient-to-br from-neon-green/20 to-electric-blue/20 rounded-full blur-xl animate-float" style={{animationDelay: '3s'}}></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gradient text-center">
              🛠️ Dashboard Admin
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 text-center mb-8">
              Panel kawalan untuk pengurusan platform CodeCikgu
            </p>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="glass-dark rounded-xl p-6 text-center card-hover neon-glow">
                <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">
                  {stats.totalUsers}
                </div>
                <div className="text-gray-400">Total Pengguna</div>
                <div className="text-2xl mt-2">👥</div>
              </div>
              
              <div className="glass-dark rounded-xl p-6 text-center card-hover neon-glow-green">
                <div className="text-3xl md:text-4xl font-bold text-gradient-green mb-2">
                  {stats.totalStudents}
                </div>
                <div className="text-gray-400">Murid</div>
                <div className="text-2xl mt-2">🎓</div>
              </div>
              
              <div className="glass-dark rounded-xl p-6 text-center card-hover neon-glow-cyan">
                <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">
                  {stats.totalPublic}
                </div>
                <div className="text-gray-400">Pengguna Awam</div>
                <div className="text-2xl mt-2">👤</div>
              </div>
              
              <div className="glass-dark rounded-xl p-6 text-center card-hover neon-glow">
                <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">
                  {(stats.totalXP / 1000).toFixed(0)}K
                </div>
                <div className="text-gray-400">Total XP</div>
                <div className="text-2xl mt-2">⭐</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Tab Navigation */}
          <div className="glass-dark rounded-2xl p-2 mb-8">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTab('users')}
                className={`px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === 'users'
                    ? 'bg-gradient-to-r from-electric-blue to-neon-cyan text-white'
                    : 'text-gray-400 hover:text-electric-blue hover:bg-electric-blue/10'
                }`}
              >
                👥 Pengguna
              </button>
              <button
                onClick={() => setActiveTab('challenges')}
                className={`px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === 'challenges'
                    ? 'bg-gradient-to-r from-electric-blue to-neon-cyan text-white'
                    : 'text-gray-400 hover:text-electric-blue hover:bg-electric-blue/10'
                }`}
              >
                🏆 Cabaran
              </button>
              <button
                onClick={() => setActiveTab('xp-logs')}
                className={`px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === 'xp-logs'
                    ? 'bg-gradient-to-r from-electric-blue to-neon-cyan text-white'
                    : 'text-gray-400 hover:text-electric-blue hover:bg-electric-blue/10'
                }`}
              >
                📊 Log XP
              </button>
              <button
                onClick={() => setActiveTab('rewards')}
                className={`px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === 'rewards'
                    ? 'bg-gradient-to-r from-electric-blue to-neon-cyan text-white'
                    : 'text-gray-400 hover:text-electric-blue hover:bg-electric-blue/10'
                }`}
              >
                🎁 Ganjaran
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'users' && (
            <div className="glass-dark rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-gray-700/50">
                <h2 className="text-2xl font-bold text-primary flex items-center">
                  <span className="mr-3">👥</span>
                  Senarai Pengguna
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-electric-blue/20 to-neon-cyan/20">
                    <tr>
                      <th className="px-4 py-4 text-left text-xs font-medium text-electric-blue uppercase tracking-wider">Nama</th>
                      <th className="px-4 py-4 text-left text-xs font-medium text-electric-blue uppercase tracking-wider">Email</th>
                      <th className="px-4 py-4 text-left text-xs font-medium text-electric-blue uppercase tracking-wider hidden md:table-cell">Sekolah</th>
                      <th className="px-4 py-4 text-left text-xs font-medium text-electric-blue uppercase tracking-wider hidden sm:table-cell">Tingkatan</th>
                      <th className="px-4 py-4 text-left text-xs font-medium text-electric-blue uppercase tracking-wider">Role</th>
                      <th className="px-4 py-4 text-left text-xs font-medium text-electric-blue uppercase tracking-wider">XP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/50">
                    {profiles.map((profile) => (
                      <tr key={profile.id} className="hover:bg-electric-blue/5 transition-all duration-300">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-100">{profile.name || 'Tiada nama'}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-gray-300 text-sm">{profile.email}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap hidden md:table-cell">
                          <div className="text-gray-300 text-sm max-w-xs truncate">{profile.sekolah || '-'}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap hidden sm:table-cell">
                          <div className="text-gray-300 text-sm">{profile.tingkatan || '-'}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            profile.role === 'admin' 
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : profile.role === 'murid'
                              ? 'bg-neon-green/20 text-neon-green border border-neon-green/30'
                              : 'bg-electric-blue/20 text-electric-blue border border-electric-blue/30'
                          }`}>
                            {profile.role === 'admin' ? '👑 Admin' : profile.role === 'murid' ? '🎓 Murid' : '👤 Awam'}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="font-bold text-electric-blue">{profile.xp || 0}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'challenges' && (
            <div className="space-y-6">
              {/* Enhanced Challenges Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="glass-dark rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-xs">Total Cabaran</p>
                      <p className="text-xl font-bold text-white">{stats.totalChallenges}</p>
                    </div>
                    <div className="text-xl">🏆</div>
                  </div>
                </div>
                <div className="glass-dark rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-xs">Aktif</p>
                      <p className="text-xl font-bold text-white">{stats.activeChallenges}</p>
                    </div>
                    <div className="text-xl">✅</div>
                  </div>
                </div>
                <div className="glass-dark rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-xs">Kuiz</p>
                      <p className="text-xl font-bold text-white">{challengeStats.quizCount}</p>
                    </div>
                    <div className="text-xl">📝</div>
                  </div>
                </div>
                <div className="glass-dark rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-xs">Video</p>
                      <p className="text-xl font-bold text-white">{challengeStats.videoCount}</p>
                    </div>
                    <div className="text-xl">🎥</div>
                  </div>
                </div>
                <div className="glass-dark rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-xs">Bacaan</p>
                      <p className="text-xl font-bold text-white">{challengeStats.readingCount}</p>
                    </div>
                    <div className="text-xl">📖</div>
                  </div>
                </div>
                <div className="glass-dark rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-xs">Upload</p>
                      <p className="text-xl font-bold text-white">{challengeStats.uploadCount}</p>
                    </div>
                    <div className="text-xl">📤</div>
                  </div>
                </div>
              </div>

              {/* Enhanced Quick Actions */}
              <div className="glass-dark rounded-xl p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h3 className="text-xl font-bold text-white">Pengurusan Cabaran</h3>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setShowCreateChallengeWizard(true)}
                      className="bg-gradient-to-r from-electric-blue to-neon-cyan text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg hover:shadow-electric-blue/25 transition-all duration-300 flex items-center space-x-2"
                    >
                      <span>🧙‍♂️</span>
                      <span>Wizard Cabaran</span>
                    </button>
                    <button
                      onClick={() => setShowAddChallengeModal(true)}
                      className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
                    >
                      <span>➕</span>
                      <span>Tambah Pantas</span>
                    </button>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-400">
                  <p>💡 <strong>Wizard Cabaran:</strong> Cipta cabaran lengkap dengan soalan kuiz, video URL, atau kandungan bacaan</p>
                  <p>⚡ <strong>Tambah Pantas:</strong> Cipta cabaran asas dengan cepat (boleh edit kemudian)</p>
                </div>
              </div>

              {/* Challenges List */}
              <div className="glass-dark rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-gray-700/50">
                  <h2 className="text-2xl font-bold text-primary flex items-center">
                    <span className="mr-3">🏆</span>
                    Senarai Cabaran
                  </h2>
                </div>
                
                {challenges.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="text-6xl mb-4">🏆</div>
                    <h3 className="text-xl font-bold text-gray-300 mb-2">Tiada Cabaran</h3>
                    <p className="text-gray-500 mb-6">Belum ada cabaran yang dicipta. Mulakan dengan menambah cabaran pertama!</p>
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => setShowCreateChallengeWizard(true)}
                        className="bg-gradient-to-r from-electric-blue to-neon-cyan text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg hover:shadow-electric-blue/25 transition-all duration-300"
                      >
                        🧙‍♂️ Guna Wizard
                      </button>
                      <button
                        onClick={() => setShowAddChallengeModal(true)}
                        className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
                      >
                        ➕ Tambah Pantas
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-700/50">
                    {challenges.map((challenge) => (
                      <div key={challenge.id} className="p-6 hover:bg-electric-blue/5 transition-all duration-300">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-2xl">{getChallengeTypeIcon(challenge.type)}</span>
                              <h3 className="text-lg font-bold text-white">{challenge.title}</h3>
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                challenge.is_active 
                                  ? 'bg-neon-green/20 text-neon-green border border-neon-green/30'
                                  : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                              }`}>
                                {challenge.is_active ? 'Aktif' : 'Tidak Aktif'}
                              </span>
                              {challenge.content && Object.keys(challenge.content).length > 0 && (
                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                  Lengkap
                                </span>
                              )}
                            </div>
                            <p className="text-gray-300 text-sm mb-3">{challenge.description}</p>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                              <span className="flex items-center gap-1">
                                <span>📚</span>
                                <span>{challenge.subject}</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <span>🎓</span>
                                <span>Tingkatan {challenge.tingkatan}</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <span>⭐</span>
                                <span>{challenge.xp_reward} XP</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <span>🏷️</span>
                                <span>{getChallengeTypeName(challenge.type)}</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <span>📊</span>
                                <span>{challenge.challenge_submissions?.[0]?.count || 0} submissions</span>
                              </span>
                              {challenge.due_date && (
                                <span className="flex items-center gap-1">
                                  <span>📅</span>
                                  <span>{new Date(challenge.due_date).toLocaleDateString('ms-MY')}</span>
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleChallengeStatus(challenge.id, challenge.is_active)}
                              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                                challenge.is_active
                                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                  : 'bg-neon-green/20 text-neon-green border border-neon-green/30'
                              }`}
                            >
                              {challenge.is_active ? 'Nyahaktif' : 'Aktifkan'}
                            </button>
                            <button
                              onClick={() => handleDeleteChallenge(challenge.id)}
                              className="px-4 py-2 rounded-lg font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 transition-all duration-300"
                            >
                              Padam
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'xp-logs' && (
            <div className="glass-dark rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-gray-700/50">
                <h2 className="text-2xl font-bold text-primary flex items-center">
                  <span className="mr-3">📊</span>
                  Log Aktiviti XP
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-electric-blue/20 to-neon-cyan/20">
                    <tr>
                      <th className="px-4 py-4 text-left text-xs font-medium text-electric-blue uppercase tracking-wider">Pengguna</th>
                      <th className="px-4 py-4 text-left text-xs font-medium text-electric-blue uppercase tracking-wider">Aktiviti</th>
                      <th className="px-4 py-4 text-left text-xs font-medium text-electric-blue uppercase tracking-wider">XP</th>
                      <th className="px-4 py-4 text-left text-xs font-medium text-electric-blue uppercase tracking-wider">Tarikh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/50">
                    {xpLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-electric-blue/5 transition-all duration-300">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-100">{log.profiles?.name || 'Pengguna Tidak Diketahui'}</div>
                          <div className="text-gray-400 text-sm">{log.profiles?.email}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-gray-300">{log.aktiviti}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="font-bold text-electric-blue">+{log.mata}</span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-gray-400 text-sm">
                            {new Date(log.created_at).toLocaleDateString('ms-MY', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'rewards' && (
            <div className="space-y-6">
              {/* Add Reward Form */}
              <div className="glass-dark rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">Tambah Ganjaran Baru</h3>
                <form onSubmit={handleAddGanjaran} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Nama Ganjaran
                    </label>
                    <input
                      type="text"
                      value={newGanjaran.nama}
                      onChange={(e) => setNewGanjaran({...newGanjaran, nama: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue transition-colors"
                      placeholder="Contoh: Badge Pemula"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Syarat XP
                    </label>
                    <input
