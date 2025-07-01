'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'
import { useRouter } from 'next/navigation'

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

export default function DashboardMurid() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [progress, setProgress] = useState<Progress[]>([])
  const [ganjaran, setGanjaran] = useState<Ganjaran[]>([])
  const [loading, setLoading] = useState(true)

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
          </div>
        </div>
      </section>

      {/* Main Dashboard Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Learning Topics */}
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

            {/* Available Rewards */}
            {availableRewards.length > 0 && (
              <div className="glass-dark rounded-2xl p-8 card-hover neon-glow-green">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-neon-green to-electric-blue rounded-lg flex items-center justify-center mr-4">
                    <span className="text-xl">🎁</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gradient-green">Ganjaran Tersedia</h2>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {availableRewards.map((reward) => (
                    <div key={reward.id} className="glass rounded-xl p-6 border border-neon-green/30 card-hover">
                      <h3 className="text-lg font-semibold text-neon-green mb-2">{reward.nama}</h3>
                      <p className="text-gray-300 text-sm mb-4">{reward.deskripsi}</p>
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

            {/* Quick Actions */}
            <div className="glass-dark rounded-2xl p-6 card-hover">
              <h3 className="text-xl font-semibold text-primary mb-4 flex items-center">
                <span className="mr-2">⚡</span>
                Tindakan Pantas
              </h3>
              <div className="space-y-3">
                <button className="w-full btn-secondary text-left">
                  <span className="mr-2">🏆</span>
                  Lihat Leaderboard
                </button>
                <button className="w-full btn-secondary text-left">
                  <span className="mr-2">👤</span>
                  Kemaskini Profil
                </button>
                <button className="w-full btn-secondary text-left">
                  <span className="mr-2">📊</span>
                  Laporan Kemajuan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

