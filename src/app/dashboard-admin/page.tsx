'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'
import { useRouter } from 'next/navigation'
import { AdminGamificationPanel } from '@/components/gamification'

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
  
  // Form states
  const [newGanjaran, setNewGanjaran] = useState({
    nama: '',
    deskripsi: '',
    syarat_xp: 0,
    imej_url: ''
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

      // Fetch challenges
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

  const getStats = () => {
    const totalUsers = profiles.length
    const totalStudents = profiles.filter(p => p.role === 'murid').length
    const totalPublic = profiles.filter(p => p.role === 'awam').length
    const totalXP = profiles.reduce((sum, p) => sum + (p.xp || 0), 0)
    const totalChallenges = challenges.length
    const activeChallenges = challenges.filter(c => c.is_active).length
    
    return { totalUsers, totalStudents, totalPublic, totalXP, totalChallenges, activeChallenges }
  }

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
              <button
                onClick={() => setActiveTab('gamification')}
                className={`px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === 'gamification'
                    ? 'bg-gradient-to-r from-electric-blue to-neon-cyan text-white'
                    : 'text-gray-400 hover:text-electric-blue hover:bg-electric-blue/10'
                }`}
              >
                🎮 Gamifikasi
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
              {/* Challenges Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-dark rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Jumlah Cabaran</p>
                      <p className="text-2xl font-bold text-white">{stats.totalChallenges}</p>
                    </div>
                    <div className="text-2xl">🏆</div>
                  </div>
                </div>
                <div className="glass-dark rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Cabaran Aktif</p>
                      <p className="text-2xl font-bold text-white">{stats.activeChallenges}</p>
                    </div>
                    <div className="text-2xl">✅</div>
                  </div>
                </div>
                <div className="glass-dark rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total XP Tersedia</p>
                      <p className="text-2xl font-bold text-white">
                        {challenges.reduce((sum, c) => sum + c.xp_reward, 0)}
                      </p>
                    </div>
                    <div className="text-2xl">⭐</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="glass-dark rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Tindakan Pantas</h3>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => router.push('/dashboard-admin/cabaran')}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <span>➕</span>
                    <span>Cipta Cabaran Baru</span>
                  </button>
                  <button
                    onClick={() => router.push('/dashboard-admin/cabaran')}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <span>📊</span>
                    <span>Urus Semua Cabaran</span>
                  </button>
                </div>
              </div>

              {/* Recent Challenges */}
              <div className="glass-dark rounded-xl overflow-hidden">
                <div className="p-6 border-b border-gray-700/50">
                  <h2 className="text-2xl font-bold text-primary flex items-center">
                    <span className="mr-3">🏆</span>
                    Cabaran Terkini
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-electric-blue/20 to-neon-cyan/20">
                      <tr>
                        <th className="px-4 py-4 text-left text-xs font-medium text-electric-blue uppercase tracking-wider">Tajuk</th>
                        <th className="px-4 py-4 text-left text-xs font-medium text-electric-blue uppercase tracking-wider">Jenis</th>
                        <th className="px-4 py-4 text-left text-xs font-medium text-electric-blue uppercase tracking-wider">Subjek</th>
                        <th className="px-4 py-4 text-left text-xs font-medium text-electric-blue uppercase tracking-wider">XP</th>
                        <th className="px-4 py-4 text-left text-xs font-medium text-electric-blue uppercase tracking-wider">Status</th>
                        <th className="px-4 py-4 text-left text-xs font-medium text-electric-blue uppercase tracking-wider">Penyertaan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700/50">
                      {challenges.slice(0, 10).map((challenge) => (
                        <tr key={challenge.id} className="hover:bg-electric-blue/5 transition-all duration-300">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-100">{challenge.title}</div>
                            <div className="text-sm text-gray-400 max-w-xs truncate">{challenge.description}</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              challenge.type === 'quiz' 
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                : challenge.type === 'video'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : challenge.type === 'reading'
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                            }`}>
                              {challenge.type === 'quiz' ? '📝 Kuiz' : 
                               challenge.type === 'video' ? '🎥 Video' :
                               challenge.type === 'reading' ? '📖 Bacaan' : '📤 Upload'}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-gray-300 text-sm">{challenge.subject}</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="font-bold text-neon-green">{challenge.xp_reward} XP</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              challenge.is_active
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                            }`}>
                              {challenge.is_active ? '✅ Aktif' : '⏸️ Tidak Aktif'}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-gray-300 text-sm">
                              {challenge.challenge_submissions?.[0]?.count || 0} penyertaan
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {challenges.length === 0 && (
                  <div className="p-8 text-center">
                    <div className="text-gray-400 text-lg mb-4">Tiada cabaran dijumpai</div>
                    <button
                      onClick={() => router.push('/dashboard-admin/cabaran')}
                      className="btn-primary"
                    >
                      Cipta Cabaran Pertama
                    </button>
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
                          <div className="font-medium text-gray-100">{log.profiles?.name || 'Unknown'}</div>
                          <div className="text-sm text-gray-400">{log.profiles?.email}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-gray-300 max-w-xs">{log.aktiviti}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="font-bold text-neon-green">+{log.mata}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-gray-300 text-sm">
                            {new Date(log.created_at).toLocaleDateString('ms-MY')}
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
            <div className="space-y-8">
              {/* Add New Reward Form */}
              <div className="glass-dark rounded-2xl p-8 card-hover">
                <h2 className="text-2xl font-bold text-primary mb-6 flex items-center">
                  <span className="mr-3">➕</span>
                  Tambah Ganjaran Baru
                </h2>
                <form onSubmit={handleAddGanjaran} className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Nama Ganjaran</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 bg-gray-800/50 border border-electric-blue/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric-blue/50 text-gray-100"
                      value={newGanjaran.nama}
                      onChange={(e) => setNewGanjaran(prev => ({ ...prev, nama: e.target.value }))}
                      placeholder="Contoh: Lencana Pemula"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Syarat XP</label>
                    <input
                      type="number"
                      required
                      min="0"
                      className="w-full px-4 py-3 bg-gray-800/50 border border-electric-blue/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric-blue/50 text-gray-100"
                      value={newGanjaran.syarat_xp}
                      onChange={(e) => setNewGanjaran(prev => ({ ...prev, syarat_xp: parseInt(e.target.value) }))}
                      placeholder="100"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Deskripsi</label>
                    <textarea
                      required
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-electric-blue/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric-blue/50 text-gray-100"
                      value={newGanjaran.deskripsi}
                      onChange={(e) => setNewGanjaran(prev => ({ ...prev, deskripsi: e.target.value }))}
                      placeholder="Deskripsi ganjaran..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">URL Imej</label>
                    <input
                      type="url"
                      className="w-full px-4 py-3 bg-gray-800/50 border border-electric-blue/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric-blue/50 text-gray-100"
                      value={newGanjaran.imej_url}
                      onChange={(e) => setNewGanjaran(prev => ({ ...prev, imej_url: e.target.value }))}
                      placeholder="https://example.com/image.png"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      className="btn-primary w-full"
                    >
                      Tambah Ganjaran
                    </button>
                  </div>
                </form>
              </div>

              {/* Existing Rewards */}
              <div className="glass-dark rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-gray-700/50">
                  <h2 className="text-2xl font-bold text-primary flex items-center">
                    <span className="mr-3">🎁</span>
                    Senarai Ganjaran
                  </h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                  {ganjaran.map((reward) => (
                    <div key={reward.id} className="glass-dark rounded-xl p-6 card-hover">
                      {reward.imej_url && (
                        <img 
                          src={reward.imej_url} 
                          alt={reward.nama}
                          className="w-full h-32 object-cover rounded-lg mb-4"
                        />
                      )}
                      <h3 className="text-lg font-bold text-white mb-2">{reward.nama}</h3>
                      <p className="text-gray-400 text-sm mb-4">{reward.deskripsi}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-neon-green font-bold">{reward.syarat_xp} XP</span>
                        <button
                          onClick={() => handleDeleteGanjaran(reward.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {ganjaran.length === 0 && (
                  <div className="p-8 text-center">
                    <div className="text-gray-400 text-lg">Tiada ganjaran dijumpai</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'gamification' && (
            <AdminGamificationPanel />
          )}
        </div>
      </div>
    </div>
  )
}

