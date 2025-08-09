'use client'

import React, { useState } from 'react'
import { 
  Trophy, 
  BookOpen, 
  Target, 
  Star,
  Gamepad2,
  GraduationCap,
  Code,
  Brain,
  Network,
  Database,
  FileText,
  Users,
  Award,
  TrendingUp,
  Calendar,
  Zap,
  Shield,
  Lightbulb,
  Rocket,
  Crown
} from 'lucide-react'
import dynamic from 'next/dynamic'
const EnhancedLevelSystem = dynamic(() => import('@/components/gamification/EnhancedLevelSystem'), { ssr: false })
const ExerciseLibrary = dynamic(() => import('@/components/gamification/ExerciseLibrary'), { ssr: false })
import GamificationAccessControl from '@/components/auth/GamificationAccessControl'

interface LearningPath {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  progress: number
  totalLessons: number
  completedLessons: number
  xpEarned: number
  status: 'locked' | 'in-progress' | 'completed'
  color: string
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  earned: boolean
  progress: number
  maxProgress: number
  xpReward: number
  category: string
}

export default function GamificationPage() {
  const [currentView, setCurrentView] = useState<'overview' | 'levels' | 'exercises' | 'achievements' | 'leaderboard'>('overview')

  // Learning paths based on DSKP curriculum
  const learningPaths: LearningPath[] = [
    {
      id: 'system-computer',
      title: 'Sistem Komputer',
      description: 'Perkakasan, perisian, dan sistem pengendalian',
      icon: <Code className="w-6 h-6" />,
      progress: 75,
      totalLessons: 12,
      completedLessons: 9,
      xpEarned: 450,
      status: 'in-progress',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'network',
      title: 'Rangkaian Komputer',
      description: 'LAN, WAN, protokol, dan keselamatan siber',
      icon: <Network className="w-6 h-6" />,
      progress: 60,
      totalLessons: 10,
      completedLessons: 6,
      xpEarned: 300,
      status: 'in-progress',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'problem-solving',
      title: 'Penyelesaian Masalah',
      description: 'Algoritma, carta alir, dan pseudokod',
      icon: <Brain className="w-6 h-6" />,
      progress: 90,
      totalLessons: 8,
      completedLessons: 7,
      xpEarned: 600,
      status: 'in-progress',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'python-basic',
      title: 'Python Asas',
      description: 'Sintaks, pembolehubah, dan operator',
      icon: <FileText className="w-6 h-6" />,
      progress: 100,
      totalLessons: 15,
      completedLessons: 15,
      xpEarned: 750,
      status: 'completed',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'control-structures',
      title: 'Struktur Kawalan',
      description: 'If-else, gelung, dan kawalan bersarang',
      icon: <Zap className="w-6 h-6" />,
      progress: 40,
      totalLessons: 12,
      completedLessons: 5,
      xpEarned: 200,
      status: 'in-progress',
      color: 'from-red-500 to-pink-500'
    },
    {
      id: 'functions',
      title: 'Fungsi',
      description: 'Definisi, parameter, dan modulariti',
      icon: <Shield className="w-6 h-6" />,
      progress: 0,
      totalLessons: 10,
      completedLessons: 0,
      xpEarned: 0,
      status: 'locked',
      color: 'from-gray-500 to-gray-600'
    },
    {
      id: 'data-structures',
      title: 'Senarai dan String',
      description: 'Operasi senarai dan manipulasi string',
      icon: <Database className="w-6 h-6" />,
      progress: 0,
      totalLessons: 8,
      completedLessons: 0,
      xpEarned: 0,
      status: 'locked',
      color: 'from-gray-500 to-gray-600'
    },
    {
      id: 'files-database',
      title: 'Fail dan Pangkalan Data',
      description: 'Operasi fail, CSV, dan pengendalian data',
      icon: <FileText className="w-6 h-6" />,
      progress: 0,
      totalLessons: 10,
      completedLessons: 0,
      xpEarned: 0,
      status: 'locked',
      color: 'from-gray-500 to-gray-600'
    }
  ]

  // Achievements based on DSKP learning objectives
  const achievements: Achievement[] = [
    {
      id: 'bronze-coder',
      title: 'Bronze Coder',
      description: 'Tulis 10 program Python pertama',
      icon: <Trophy className="w-5 h-5" />,
      earned: true,
      progress: 10,
      maxProgress: 10,
      xpReward: 100,
      category: 'skill'
    },
    {
      id: 'hardware-hero',
      title: 'Hardware Hero',
      description: 'Kuasai komponen sistem komputer',
      icon: <Code className="w-5 h-5" />,
      earned: true,
      progress: 12,
      maxProgress: 12,
      xpReward: 150,
      category: 'knowledge'
    },
    {
      id: 'network-ninja',
      title: 'Network Ninja',
      description: 'Mahir dalam rangkaian komputer',
      icon: <Network className="w-5 h-5" />,
      earned: false,
      progress: 6,
      maxProgress: 10,
      xpReward: 200,
      category: 'knowledge'
    },
    {
      id: 'logic-master',
      title: 'Logic Master',
      description: 'Cemerlang dalam penyelesaian masalah',
      icon: <Brain className="w-5 h-5" />,
      earned: true,
      progress: 8,
      maxProgress: 8,
      xpReward: 250,
      category: 'skill'
    },
    {
      id: 'python-pro',
      title: 'Python Pro',
      description: 'Pakar dalam semua aspek Python',
      icon: <FileText className="w-5 h-5" />,
      earned: false,
      progress: 15,
      maxProgress: 20,
      xpReward: 300,
      category: 'skill'
    },
    {
      id: 'consistent-learner',
      title: 'Consistent Learner',
      description: 'Login 30 hari berturut-turut',
      icon: <Calendar className="w-5 h-5" />,
      earned: false,
      progress: 15,
      maxProgress: 30,
      xpReward: 500,
      category: 'social'
    },
    {
      id: 'team-player',
      title: 'Team Player',
      description: 'Aktif dalam projek berkumpulan',
      icon: <Users className="w-5 h-5" />,
      earned: false,
      progress: 2,
      maxProgress: 5,
      xpReward: 150,
      category: 'social'
    },
    {
      id: 'knowledge-seeker',
      title: 'Knowledge Seeker',
      description: 'Baca semua nota tambahan',
      icon: <BookOpen className="w-5 h-5" />,
      earned: false,
      progress: 25,
      maxProgress: 50,
      xpReward: 200,
      category: 'knowledge'
    }
  ]

  const navItems = [
    { 
      id: 'overview', 
      label: 'Overview', 
      icon: <Target className="w-5 h-5" />,
      description: 'Kemajuan pembelajaran dan pencapaian'
    },
    { 
      id: 'levels', 
      label: 'Jejak Pembelajaran', 
      icon: <Trophy className="w-5 h-5" />,
      description: 'Cabaran berstruktur dan kemajuan'
    },
    { 
      id: 'exercises', 
      label: 'Perpustakaan Latihan', 
      icon: <BookOpen className="w-5 h-5" />,
      description: 'Latihan tambahan dan bonus XP'
    },
    {
      id: 'achievements',
      label: 'Pencapaian',
      icon: <Award className="w-5 h-5" />,
      description: 'Lencana dan pencapaian terkumpul'
    },
    {
      id: 'leaderboard',
      label: 'Papan Kedudukan',
      icon: <Crown className="w-5 h-5" />,
      description: 'Ranking dan pertandingan'
    }
  ]

  if (currentView === 'levels') {
    return (
      <GamificationAccessControl>
        <EnhancedLevelSystem />
      </GamificationAccessControl>
    )
  }

  if (currentView === 'exercises') {
    return (
      <GamificationAccessControl>
        <ExerciseLibrary />
      </GamificationAccessControl>
    )
  }

  if (currentView === 'achievements') {
    return (
      <GamificationAccessControl>
        <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black">
          <div className="max-w-7xl mx-auto p-6">
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <Award className="w-10 h-10 text-yellow-400" />
                <div>
                  <h1 className="text-4xl font-bold text-gradient">Pencapaian & Lencana</h1>
                  <p className="text-gray-400">Kumpulkan lencana dan buktikan kemahiran anda</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`glass-dark rounded-xl p-6 transition-all duration-300 ${
                    achievement.earned 
                      ? 'border-2 border-yellow-500/50 bg-yellow-500/10' 
                      : 'border border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className={`p-3 rounded-xl ${
                      achievement.earned 
                        ? 'bg-yellow-500/20 text-yellow-400' 
                        : 'bg-gray-700 text-gray-400'
                    }`}>
                      {achievement.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{achievement.title}</h3>
                      <p className="text-sm text-gray-400">{achievement.description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Kemajuan</span>
                      <span className="text-white">{achievement.progress}/{achievement.maxProgress}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          achievement.earned 
                            ? 'bg-yellow-500' 
                            : 'bg-gradient-to-r from-electric-blue to-neon-cyan'
                        }`}
                        style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">XP Reward</span>
                      <span className="text-yellow-400 font-bold">+{achievement.xpReward} XP</span>
                    </div>
                    {achievement.earned && (
                      <div className="flex items-center space-x-2 text-yellow-400 text-sm">
                        <Star className="w-4 h-4" />
                        <span>Lencana Diperoleh!</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </GamificationAccessControl>
    )
  }

  if (currentView === 'leaderboard') {
    return (
      <GamificationAccessControl>
        <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black">
          <div className="max-w-7xl mx-auto p-6">
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <Crown className="w-10 h-10 text-yellow-400" />
                <div>
                  <h1 className="text-4xl font-bold text-gradient">Papan Kedudukan</h1>
                  <p className="text-gray-400">Lihat ranking dan pertandingan dengan rakan-rakan</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Weekly Leaderboard */}
              <div className="glass-dark rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  <span>Minggu Ini</span>
                </h3>
                <div className="space-y-3">
                  {[
                    { rank: 1, name: 'Ahmad Ali', xp: 1250, avatar: 'AA' },
                    { rank: 2, name: 'Siti Sarah', xp: 1100, avatar: 'SS' },
                    { rank: 3, name: 'Mohd Zain', xp: 950, avatar: 'MZ' },
                    { rank: 4, name: 'Nur Ain', xp: 800, avatar: 'NA' },
                    { rank: 5, name: 'Khairul Anuar', xp: 750, avatar: 'KA' }
                  ].map((player) => (
                    <div key={player.rank} className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        player.rank === 1 ? 'bg-yellow-500 text-black' :
                        player.rank === 2 ? 'bg-gray-400 text-black' :
                        player.rank === 3 ? 'bg-orange-600 text-white' :
                        'bg-gray-600 text-white'
                      }`}>
                        {player.rank}
                      </div>
                      <div className="w-8 h-8 bg-gradient-to-br from-electric-blue to-neon-cyan rounded-full flex items-center justify-center text-xs font-bold text-white">
                        {player.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium">{player.name}</div>
                        <div className="text-sm text-gray-400">{player.xp} XP</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly Champions */}
              <div className="glass-dark rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <span>Juara Bulanan</span>
                </h3>
                <div className="space-y-3">
                  {[
                    { rank: 1, name: 'Ahmad Ali', xp: 5200, badge: 'Python Pro' },
                    { rank: 2, name: 'Siti Sarah', xp: 4800, badge: 'Logic Master' },
                    { rank: 3, name: 'Mohd Zain', xp: 4500, badge: 'Hardware Hero' }
                  ].map((champion) => (
                    <div key={champion.rank} className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        champion.rank === 1 ? 'bg-yellow-500 text-black' :
                        champion.rank === 2 ? 'bg-gray-400 text-black' :
                        'bg-orange-600 text-white'
                      }`}>
                        {champion.rank}
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium">{champion.name}</div>
                        <div className="text-sm text-gray-400">{champion.xp} XP</div>
                        <div className="text-xs text-electric-blue">{champion.badge}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subject Masters */}
              <div className="glass-dark rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                  <GraduationCap className="w-5 h-5 text-green-400" />
                  <span>Pakar Subjek</span>
                </h3>
                <div className="space-y-3">
                  {[
                    { subject: 'Python', name: 'Ahmad Ali', score: 95 },
                    { subject: 'Sistem Komputer', name: 'Siti Sarah', score: 92 },
                    { subject: 'Rangkaian', name: 'Mohd Zain', score: 88 },
                    { subject: 'Algoritma', name: 'Nur Ain', score: 90 }
                  ].map((master) => (
                    <div key={master.subject} className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                        {master.subject.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium">{master.subject}</div>
                        <div className="text-sm text-gray-400">{master.name}</div>
                      </div>
                      <div className="text-green-400 font-bold">{master.score}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </GamificationAccessControl>
    )
  }

  return (
    <GamificationAccessControl>
      <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <Gamepad2 className="w-10 h-10 text-electric-blue" />
              <div>
                <h1 className="text-4xl font-bold text-gradient">CodeCikgu Learning System</h1>
                <p className="text-gray-400">Platform pembelajaran Sains Komputer berdasarkan DSKP Malaysia</p>
                <div className="flex items-center space-x-2 mt-2">
                  <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                    Murid Berdaftar
                  </div>
                  <div className="px-3 py-1 bg-electric-blue/20 text-electric-blue rounded-full text-sm font-medium">
                    Akses Penuh
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Cards */}
          <div className="grid gap-6 md:grid-cols-5 mb-8">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as any)}
                className="glass-dark rounded-2xl p-6 text-left transition-all duration-300 hover:scale-105 hover:border-electric-blue/30 group"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-electric-blue/20 rounded-xl text-electric-blue group-hover:bg-electric-blue/30 transition-colors">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{item.label}</h3>
                    <p className="text-gray-400 text-sm">{item.description}</p>
                  </div>
                </div>
                
                <div className="text-electric-blue text-sm font-medium group-hover:text-white transition-colors">
                  Klik untuk meneroka →
                </div>
              </button>
            ))}
          </div>

          {/* Quick Stats Overview */}
          <div className="glass-dark rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Jejak Pembelajaran DSKP</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-electric-blue mb-2">2,450</div>
                <div className="text-gray-400">Total XP</div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                  <div className="bg-gradient-to-r from-electric-blue to-neon-cyan h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-2">Level 3.2</div>
                <div className="text-gray-400">Tahap Semasa</div>
                <div className="text-sm text-gray-500 mt-2">Struktur Kawalan</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">28</div>
                <div className="text-gray-400">Cabaran Selesai</div>
                <div className="text-sm text-gray-500 mt-2">85% kadar penyelesaian</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">12</div>
                <div className="text-gray-400">Lencana Diperoleh</div>
                <div className="text-sm text-gray-500 mt-2">+1,200 bonus XP</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recent Achievements */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Pencapaian Terkini</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
                    <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <div className="text-white font-medium">Python Pro!</div>
                      <div className="text-sm text-gray-400">Selesai semua aspek Python asas</div>
                    </div>
                    <div className="text-xs text-gray-500">2 jam lalu</div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
                    <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                      <Star className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <div className="text-white font-medium">Logic Master</div>
                      <div className="text-sm text-gray-400">Cemerlang dalam penyelesaian masalah</div>
                    </div>
                    <div className="text-xs text-gray-500">1 hari lalu</div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-white font-medium">Hardware Hero</div>
                      <div className="text-sm text-gray-400">Kuasa komponen sistem komputer</div>
                    </div>
                    <div className="text-xs text-gray-500">3 hari lalu</div>
                  </div>
                </div>
              </div>

              {/* Quick Access */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Teruskan Pembelajaran</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => setCurrentView('levels')}
                    className="w-full p-4 bg-gradient-to-r from-electric-blue/20 to-neon-cyan/20 border border-electric-blue/30 rounded-lg text-left hover:from-electric-blue/30 hover:to-neon-cyan/30 transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <Trophy className="w-6 h-6 text-electric-blue" />
                      <div>
                        <div className="text-white font-medium">Cabaran Seterusnya</div>
                        <div className="text-sm text-gray-300">Struktur Kawalan: Gelung While</div>
                      </div>
                    </div>
                  </button>
                  <button 
                    onClick={() => setCurrentView('exercises')}
                    className="w-full p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg text-left hover:from-purple-500/30 hover:to-pink-500/30 transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <BookOpen className="w-6 h-6 text-purple-400" />
                      <div>
                        <div className="text-white font-medium">Latihan Harian</div>
                        <div className="text-sm text-gray-300">Algoritma untuk bonus XP</div>
                      </div>
                    </div>
                  </button>
                  <button 
                    onClick={() => setCurrentView('achievements')}
                    className="w-full p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg text-left hover:from-yellow-500/30 hover:to-orange-500/30 transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <Award className="w-6 h-6 text-yellow-400" />
                      <div>
                        <div className="text-white font-medium">Lencana Baru</div>
                        <div className="text-sm text-gray-300">3 lencana hampir diperoleh</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Learning Path Overview */}
          <div className="glass-dark rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Jejak Pembelajaran DSKP</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {learningPaths.map((path) => (
                <div key={path.id} className={`p-4 rounded-xl border-2 transition-all ${
                  path.status === 'completed' ? 'border-green-500/50 bg-green-500/10' :
                  path.status === 'in-progress' ? 'border-electric-blue/50 bg-electric-blue/10' :
                  'border-gray-700 bg-gray-800/30'
                }`}>
                  <div className="text-center">
                    <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${
                      path.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      path.status === 'in-progress' ? 'bg-electric-blue/20 text-electric-blue' :
                      'bg-gray-700 text-gray-500'
                    }`}>
                      {path.icon}
                    </div>
                    <div className={`font-bold text-sm mb-1 ${
                      path.status === 'locked' ? 'text-gray-500' : 'text-white'
                    }`}>
                      {path.title}
                    </div>
                    <div className={`text-xs mb-2 ${
                      path.status === 'locked' ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {path.description}
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1">
                      <div 
                        className={`h-1 rounded-full transition-all ${
                          path.status === 'completed' ? 'bg-green-500' :
                          path.status === 'in-progress' ? 'bg-electric-blue' :
                          'bg-gray-700'
                        }`}
                        style={{ width: `${path.progress}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-400 mt-2">
                      {path.completedLessons}/{path.totalLessons} Pelajaran
                    </div>
                    <div className="text-xs text-yellow-400 mt-1">
                      +{path.xpEarned} XP
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <button 
                onClick={() => setCurrentView('levels')}
                className="btn-primary"
              >
                <Trophy className="w-5 h-5 mr-2" />
                Teruskan Jejak Pembelajaran
              </button>
            </div>
          </div>
        </div>
      </div>
    </GamificationAccessControl>
  )
}
