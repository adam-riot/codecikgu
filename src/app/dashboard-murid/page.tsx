'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Profile {
  id: string
  name: string
  email: string
  sekolah: string
  tingkatan: string
  xp: number
}

interface Progress {
  id: string
  topik: string
  selesai: boolean
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
  due_date?: string
  challenge_submissions?: {
    id: string
    status: 'pending' | 'completed' | 'failed'
    score?: number
    submitted_at: string
  }[]
}

export default function DashboardMurid() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [progress, setProgress] = useState<Progress[]>([])
  const [ganjaran, setGanjaran] = useState<Ganjaran[]>([])
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  const topics = [
    { name: 'Pengenalan Sains Komputer', xp: 100, icon: '💻' },
    { name: 'Sistem Nombor', xp: 150, icon: '🔢' },
    { name: 'Asas Pemrograman', xp: 200, icon: '⚡' },
    { name: 'Struktur Data', xp: 250, icon: '🗂️' },
    { name: 'Algoritma', xp: 300, icon: '🧠' },
    { name: 'Pangkalan Data', xp: 200, icon: '🗄️' }
  ]

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
      }

      // Fetch progress
      const { data: progressData } = await supabase
        .from('progress')
        .select('*')
        .eq('user_id', user.id)

      if (progressData) {
        setProgress(progressData)
      }

      // Fetch ganjaran
      const { data: ganjaranData } = await supabase
        .from('ganjaran')
        .select('*')
        .order('syarat_xp', { ascending: true })

      if (ganjaranData) {
        setGanjaran(ganjaranData)
      }

      // Fetch challenges with submissions
      const { data: challengesData } = await supabase
        .from('challenges')
        .select(`
          *,
          challenge_submissions!inner(
            id,
            status,
            score,
            submitted_at
          )
        `)
        .eq('is_active', true)
        .eq('challenge_submissions.user_id', user.id)
        .order('created_at', { ascending: false })

      // Also fetch challenges without submissions
      const { data: availableChallenges } = await supabase
        .from('challenges')
        .select(`
          *,
          challenge_submissions(
            id,
            status,
            score,
            submitted_at
          )
        `)
        .eq('is_active', true)
        .not('challenge_submissions.user_id', 'eq', user.id)
        .order('created_at', { ascending: false })

      const allChallenges = [
        ...(challengesData || []),
        ...(availableChallenges || [])
      ]

      setChallenges(allChallenges)
      setLoading(false)
    }

    fetchData()
  }, [router])

  const handleCompleteTopik = async (topikName: string, xpReward: number) => {
    if (!profile) return

    try {
      // Update progress
      const { error: progressError } = await supabase
        .from('progress')
        .upsert({
          user_id: profile.id,
          topik: topikName,
          selesai: true
        })

      if (progressError) throw progressError

      // Update XP
      const newXP = profile.xp + xpReward
      const { error: xpError } = await supabase
        .from('profiles')
        .update({ xp: newXP })
        .eq('id', profile.id)

      if (xpError) throw xpError

      // Log XP gain
      const { error: logError } = await supabase
        .from('xp_log')
        .insert({
          user_id: profile.id,
          aktiviti: `Menyelesaikan topik: ${topikName}`,
          mata: xpReward
        })

      if (logError) throw logError

      // Update local state
      setProfile(prev => prev ? { ...prev, xp: newXP } : null)
      setProgress(prev => [
        ...prev.filter(p => p.topik !== topikName),
        { id: Date.now().toString(), topik: topikName, selesai: true }
      ])

    } catch (error) {
      console.error('Error completing topic:', error)
    }
  }

  const getXPLevel = (xp: number) => {
    if (xp >= 1000) return { level: 'Expert', color: 'from-purple-500 to-pink-500', icon: '👑' }
    if (xp >= 500) return { level: 'Advanced', color: 'from-neon-green to-electric-blue', icon: '⭐' }
    if (xp >= 200) return { level: 'Intermediate', color: 'from-electric-blue to-neon-cyan', icon: '🚀' }
    return { level: 'Beginner', color: 'from-gray-500 to-gray-700', icon: '🌱' }
  }

  const getProgressPercentage = () => {
    const completedTopics = progress.filter(p => p.selesai).length
    return Math.round((completedTopics / topics.length) * 100)
  }

  const getAvailableRewards = () => {
    if (!profile) return []
    return ganjaran.filter(g => profile.xp >= g.syarat_xp)
  }

  const getChallengeTypeIcon = (type: string) => {
    switch (type) {
      case 'quiz': return '📝'
      case 'video': return '🎥'
      case 'reading': return '📖'
      case 'upload': return '📤'
      default: return '🏆'
    }
  }

  const getChallengeTypeName = (type: string) => {
    switch (type) {
      case 'quiz': return 'Kuiz'
      case 'video': return 'Video'
      case 'reading': return 'Bacaan'
      case 'upload': return 'Muat Naik'
      default: return 'Cabaran'
    }
  }

  const getChallengeStats = () => {
    const completed = challenges.filter(c => c.challenge_submissions?.[0]?.status === 'completed').length
    const pending = challenges.filter(c => c.challenge_submissions?.[0]?.status === 'pending').length
    const available = challenges.filter(c => !c.challenge_submissions?.length).length
    const totalXPFromChallenges = challenges
      .filter(c => c.challenge_submissions?.[0]?.status === 'completed')
      .reduce((sum, c) => sum + c.xp_reward, 0)
    
    return { completed, pending, available, totalXPFromChallenges }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black flex items-center justify-center">
        <div className="glass-dark rounded-2xl p-8 text-center">
          <div className="text-2xl text-gradient loading-dots">Memuat dashboard</div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black flex items-center justify-center">
        <div className="glass-dark rounded-2xl p-8 text-center">
          <div className="text-xl text-red-400">Profil tidak ditemui. Sila lengkapkan profil anda.</div>
        </div>
      </div>
    )
  }

  const levelInfo = getXPLevel(profile.xp)
  const progressPercentage = getProgressPercentage()
  const availableRewards = getAvailableRewards()
  const challengeStats = getChallengeStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black">
      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden bg-circuit">
        <div className="absolute inset-0 bg-grid opacity-10"></div>
        <div className="absolute top-10 right-10 w-40 h-40 bg-gradient-to-br from-electric-blue/20 to-neon-cyan/20 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-gradient-to-br from-neon-green/20 to-electric-blue/20 rounded-full blur-xl animate-float" style={{animationDelay: '3s'}}></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-gradient">
              Selamat Datang, {profile.name}!
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8">
              {profile.sekolah} • Tingkatan {profile.tingkatan}
            </p>
            
            {/* XP and Level Display */}
            <div className="glass-dark rounded-2xl p-6 neon-glow">
              <div className="flex items-center justify-center mb-4">
                <div className={`w-16 h-16 bg-gradient-to-br ${levelInfo.color} rounded-full flex items-center justify-center mr-4 animate-pulse-glow`}>
                  <span className="text-2xl">{levelInfo.icon}</span>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gradient">{profile.xp} XP</div>
                  <div className={`text-sm bg-gradient-to-r ${levelInfo.color} bg-clip-text text-transparent font-semibold`}>
                    {levelInfo.level}
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                <div 
                  className="bg-gradient-to-r from-electric-blue to-neon-cyan h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-400">
                Kemajuan Keseluruhan: {progressPercentage}% ({progress.filter(p => p.selesai).length}/{topics.length} topik selesai)
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="glass-dark rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-gradient">{challengeStats.completed}</div>
                <div className="text-sm text-gray-400">Cabaran Selesai</div>
              </div>
              <div className="glass-dark rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-gradient">{challengeStats.available}</div>
                <div className="text-sm text-gray-400">Cabaran Tersedia</div>
              </div>
              <div className="glass-dark rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-gradient">{challengeStats.totalXPFromChallenges}</div>
                <div className="text-sm text-gray-400">XP dari Cabaran</div>
              </div>
              <div className="glass-dark rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-gradient">{availableRewards.length}</div>
                <div className="text-sm text-gray-400">Ganjaran Tersedia</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="container mx-auto px-4 py-8">
        <div className="glass-dark rounded-2xl p-2 mb-8 max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-electric-blue to-neon-cyan text-white'
                  : 'text-gray-400 hover:text-electric-blue hover:bg-electric-blue/10'
              }`}
            >
              📊 Gambaran Keseluruhan
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
              onClick={() => setActiveTab('topics')}
              className={`px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeTab === 'topics'
                  ? 'bg-gradient-to-r from-electric-blue to-neon-cyan text-white'
                  : 'text-gray-400 hover:text-electric-blue hover:bg-electric-blue/10'
              }`}
            >
              📚 Topik Pembelajaran
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
        <div className="max-w-6xl mx-auto">
          {activeTab === 'overview' && (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Quick Actions */}
                <div className="glass-dark rounded-2xl p-8 card-hover">
                  <h2 className="text-2xl font-bold text-primary mb-6 flex items-center">
                    <span className="mr-3">⚡</span>
                    Tindakan Pantas
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Link href="/challenges" className="glass rounded-xl p-6 card-hover border border-electric-blue/30 hover:border-electric-blue/50 transition-all duration-300 block">
                      <div className="flex items-center mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-electric-blue to-neon-cyan rounded-lg flex items-center justify-center mr-4">
                          <span className="text-xl">🏆</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">Cabaran Baru</h3>
                          <p className="text-sm text-gray-400">{challengeStats.available} tersedia</p>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm">Ambil cabaran baru dan dapatkan XP!</p>
                    </Link>

                    <Link href="/playground" className="glass rounded-xl p-6 card-hover border border-neon-green/30 hover:border-neon-green/50 transition-all duration-300 block">
                      <div className="flex items-center mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-neon-green to-electric-blue rounded-lg flex items-center justify-center mr-4">
                          <span className="text-xl">💻</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">Code Playground</h3>
                          <p className="text-sm text-gray-400">Editor online</p>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm">Tulis dan test kod secara online!</p>
                    </Link>
                  </div>
                </div>

                {/* Recent Challenges */}
                <div className="glass-dark rounded-2xl p-8 card-hover">
                  <h2 className="text-2xl font-bold text-primary mb-6 flex items-center">
                    <span className="mr-3">🏆</span>
                    Cabaran Terkini
                  </h2>
                  <div className="space-y-4">
                    {challenges.slice(0, 3).map((challenge) => {
                      const submission = challenge.challenge_submissions?.[0]
                      return (
                        <div key={challenge.id} className="glass rounded-xl p-4 border border-gray-700/50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <span className="text-2xl mr-3">{getChallengeTypeIcon(challenge.type)}</span>
                              <div>
                                <h3 className="font-semibold text-white">{challenge.title}</h3>
                                <p className="text-sm text-gray-400">{getChallengeTypeName(challenge.type)} • {challenge.xp_reward} XP</p>
                              </div>
                            </div>
                            <div className="text-right">
                              {submission ? (
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  submission.status === 'completed' 
                                    ? 'bg-neon-green/20 text-neon-green border border-neon-green/30'
                                    : submission.status === 'pending'
                                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                }`}>
                                  {submission.status === 'completed' ? 'Selesai' : 
                                   submission.status === 'pending' ? 'Menunggu' : 'Gagal'}
                                </span>
                              ) : (
                                <Link href={`/challenges/${challenge.id}`} className="px-4 py-2 bg-gradient-to-r from-electric-blue to-neon-cyan text-white rounded-lg text-sm hover:shadow-lg transition-all duration-300">
                                  Mula
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-6 text-center">
                    <Link href="/challenges" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-electric-blue to-neon-cyan text-white rounded-lg hover:shadow-lg transition-all duration-300">
                      Lihat Semua Cabaran
                      <span className="ml-2">→</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="glass-dark rounded-2xl p-6 card-hover">
                  <h3 className="text-xl font-semibold text-primary mb-4 flex items-center">
                    <span className="mr-2">📊</span>
                    Statistik Anda
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Total XP:</span>
                      <span className="font-bold text-gradient">{profile.xp}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Level:</span>
                      <span className={`font-bold bg-gradient-to-r ${levelInfo.color} bg-clip-text text-transparent`}>
                        {levelInfo.level}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Topik Selesai:</span>
                      <span className="font-bold text-neon-green">{progress.filter(p => p.selesai).length}/{topics.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Cabaran Selesai:</span>
                      <span className="font-bold text-electric-blue">{challengeStats.completed}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Ganjaran:</span>
                      <span className="font-bold text-electric-blue">{availableRewards.length}</span>
                    </div>
                  </div>
                </div>

                {/* Next Level Progress */}
                <div className="glass-dark rounded-2xl p-6 card-hover">
                  <h3 className="text-xl font-semibold text-primary mb-4 flex items-center">
                    <span className="mr-2">🎯</span>
                    Level Seterusnya
                  </h3>
                  <div className="text-center">
                    {profile.xp < 200 ? (
                      <>
                        <div className="text-2xl mb-2">🚀</div>
                        <div className="text-lg font-semibold text-electric-blue mb-2">Intermediate</div>
                        <div className="text-sm text-gray-400 mb-4">Perlukan {200 - profile.xp} XP lagi</div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-electric-blue to-neon-cyan h-2 rounded-full"
                            style={{ width: `${(profile.xp / 200) * 100}%` }}
                          ></div>
                        </div>
                      </>
                    ) : profile.xp < 500 ? (
                      <>
                        <div className="text-2xl mb-2">⭐</div>
                        <div className="text-lg font-semibold text-neon-green mb-2">Advanced</div>
                        <div className="text-sm text-gray-400 mb-4">Perlukan {500 - profile.xp} XP lagi</div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-neon-green to-electric-blue h-2 rounded-full"
                            style={{ width: `${((profile.xp - 200) / 300) * 100}%` }}
                          ></div>
                        </div>
                      </>
                    ) : profile.xp < 1000 ? (
                      <>
                        <div className="text-2xl mb-2">👑</div>
                        <div className="text-lg font-semibold text-purple-400 mb-2">Expert</div>
                        <div className="text-sm text-gray-400 mb-4">Perlukan {1000 - profile.xp} XP lagi</div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                            style={{ width: `${((profile.xp - 500) / 500) * 100}%` }}
                          ></div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-2xl mb-2">🏆</div>
                        <div className="text-lg font-semibold text-gradient mb-2">Master Level!</div>
                        <div className="text-sm text-gray-400">Anda telah mencapai tahap tertinggi!</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'challenges' && (
            <div className="space-y-6">
              {/* Challenge Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="glass-dark rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-gradient mb-2">{challengeStats.available}</div>
                  <div className="text-gray-400">Tersedia</div>
                </div>
                <div className="glass-dark rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-gradient mb-2">{challengeStats.pending}</div>
                  <div className="text-gray-400">Menunggu</div>
                </div>
                <div className="glass-dark rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-gradient mb-2">{challengeStats.completed}</div>
                  <div className="text-gray-400">Selesai</div>
                </div>
                <div className="glass-dark rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-gradient mb-2">{challengeStats.totalXPFromChallenges}</div>
                  <div className="text-gray-400">XP Diperoleh</div>
                </div>
              </div>

              {/* Challenges List */}
              <div className="glass-dark rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-gray-700/50">
                  <h2 className="text-2xl font-bold text-primary flex items-center">
                    <span className="mr-3">🏆</span>
                    Semua Cabaran
                  </h2>
                </div>
                <div className="divide-y divide-gray-700/50">
                  {challenges.map((challenge) => {
                    const submission = challenge.challenge_submissions?.[0]
                    return (
                      <div key={challenge.id} className="p-6 hover:bg-electric-blue/5 transition-all duration-300">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-2xl">{getChallengeTypeIcon(challenge.type)}</span>
                              <h3 className="text-lg font-bold text-white">{challenge.title}</h3>
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-electric-blue/20 text-electric-blue border border-electric-blue/30">
                                {getChallengeTypeName(challenge.type)}
                              </span>
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
                              {challenge.due_date && (
                                <span className="flex items-center gap-1">
                                  <span>📅</span>
                                  <span>{new Date(challenge.due_date).toLocaleDateString('ms-MY')}</span>
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {submission ? (
                              <div className="text-right">
                                <div className={`px-3 py-1 rounded-full text-xs font-semibold mb-2 ${
                                  submission.status === 'completed' 
                                    ? 'bg-neon-green/20 text-neon-green border border-neon-green/30'
                                    : submission.status === 'pending'
                                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                }`}>
                                  {submission.status === 'completed' ? 'Selesai' : 
                                   submission.status === 'pending' ? 'Menunggu' : 'Gagal'}
                                </div>
                                {submission.score !== undefined && (
                                  <div className="text-sm text-gray-400">
                                    Markah: {submission.score}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <Link 
                                href={`/challenges/${challenge.id}`}
                                className="px-6 py-2 bg-gradient-to-r from-electric-blue to-neon-cyan text-white rounded-lg font-medium hover:shadow-lg hover:shadow-electric-blue/25 transition-all duration-300"
                              >
                                Mula Cabaran
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'topics' && (
            <div className="glass-dark rounded-2xl p-8 card-hover">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-electric-blue to-neon-cyan rounded-lg flex items-center justify-center mr-4">
                  <span className="text-xl">📚</span>
                </div>
                <h2 className="text-2xl font-bold text-primary">Topik Pembelajaran</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {topics.map((topic) => {
                  const isCompleted = progress.some(p => p.topik === topic.name && p.selesai)
                  return (
                    <div key={topic.name} className={`glass rounded-xl p-6 card-hover border ${isCompleted ? 'border-neon-green/50 bg-neon-green/5' : 'border-electric-blue/30'}`}>
                      <div className="flex items-center mb-4">
                        <div className={`w-12 h-12 bg-gradient-to-br ${isCompleted ? 'from-neon-green to-electric-blue' : 'from-electric-blue to-neon-cyan'} rounded-lg flex items-center justify-center mr-4`}>
                          <span className="text-xl">{isCompleted ? '✅' : topic.icon}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-primary">{topic.name}</h3>
                          <div className="text-sm text-electric-blue">+{topic.xp} XP</div>
                        </div>
                      </div>
                      
                      {isCompleted ? (
                        <div className="text-center">
                          <span className="inline-block px-4 py-2 bg-neon-green/20 text-neon-green rounded-lg border border-neon-green/30">
                            ✅ Selesai
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleCompleteTopik(topic.name, topic.xp)}
                          className="w-full btn-primary"
                        >
                          🚀 Mula Belajar
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {activeTab === 'rewards' && availableRewards.length > 0 && (
            <div className="glass-dark rounded-2xl p-8 card-hover neon-glow-green">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-neon-green to-electric-blue rounded-lg flex items-center justify-center mr-4">
                  <span className="text-xl">🎁</span>
                </div>
                <h2 className="text-2xl font-bold text-gradient-green">Ganjaran Tersedia</h2>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableRewards.map((reward) => (
                  <div key={reward.id} className="glass rounded-xl p-6 border border-neon-green/30 card-hover">
                    {reward.imej_url && (
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden bg-gradient-to-br from-electric-blue/20 to-neon-cyan/20 flex items-center justify-center">
                        <img src={reward.imej_url} alt={reward.nama} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <h3 className="text-lg font-semibold text-neon-green mb-2 text-center">{reward.nama}</h3>
                    <p className="text-gray-300 text-sm mb-4 text-center">{reward.deskripsi}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-electric-blue">Syarat: {reward.syarat_xp} XP</span>
                      <button className="px-4 py-2 bg-gradient-to-r from-neon-green/20 to-electric-blue/20 border border-neon-green/30 text-neon-green rounded-lg hover:bg-neon-green/30 transition-all duration-300">
                        🎉 Tuntut
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
