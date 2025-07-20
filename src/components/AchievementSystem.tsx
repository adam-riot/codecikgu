'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Trophy, Star, Zap, Target, Award, Medal } from 'lucide-react'
import { useNotifications } from './NotificationProvider'

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  category: 'learning' | 'coding' | 'social' | 'milestone'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  xpReward: number
  condition: (stats: UserStats) => boolean
  unlockedAt?: Date
}

interface UserStats {
  totalXP: number
  challengesCompleted: number
  codeExecutions: number
  consecutiveDays: number
  notesRead: number
  tutorialsCompleted: number
  leaderboardPosition?: number
}

const achievements: Achievement[] = [
  {
    id: 'first-steps',
    title: 'Langkah Pertama',
    description: 'Selesaikan tutorial pertama anda',
    icon: <Star className="w-6 h-6" />,
    category: 'learning',
    rarity: 'common',
    xpReward: 50,
    condition: (stats) => stats.tutorialsCompleted >= 1
  },
  {
    id: 'code-warrior',
    title: 'Pahlawan Kod',
    description: 'Jalankan kod 100 kali',
    icon: <Zap className="w-6 h-6" />,
    category: 'coding',
    rarity: 'rare',
    xpReward: 200,
    condition: (stats) => stats.codeExecutions >= 100
  },
  {
    id: 'challenge-master',
    title: 'Master Cabaran',
    description: 'Selesaikan 25 cabaran',
    icon: <Target className="w-6 h-6" />,
    category: 'learning',
    rarity: 'epic',
    xpReward: 500,
    condition: (stats) => stats.challengesCompleted >= 25
  },
  {
    id: 'top-performer',
    title: 'Prestasi Tertinggi',
    description: 'Capai top 10 dalam papan pendahulu',
    icon: <Trophy className="w-6 h-6" />,
    category: 'social',
    rarity: 'legendary',
    xpReward: 1000,
    condition: (stats) => (stats.leaderboardPosition || 999) <= 10
  },
  {
    id: 'knowledge-seeker',
    title: 'Pencari Ilmu',
    description: 'Baca 50 nota pembelajaran',
    icon: <Award className="w-6 h-6" />,
    category: 'learning',
    rarity: 'rare',
    xpReward: 300,
    condition: (stats) => stats.notesRead >= 50
  },
  {
    id: 'consistent-learner',
    title: 'Pembelajar Konsisten',
    description: 'Belajar selama 7 hari berturut-turut',
    icon: <Medal className="w-6 h-6" />,
    category: 'milestone',
    rarity: 'epic',
    xpReward: 750,
    condition: (stats) => stats.consecutiveDays >= 7
  }
]

interface AchievementContextType {
  achievements: Achievement[]
  unlockedAchievements: Achievement[]
  checkAchievements: (stats: UserStats) => void
  getProgress: (achievementId: string, stats: UserStats) => number
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined)

export const useAchievements = () => {
  const context = useContext(AchievementContext)
  if (!context) {
    throw new Error('useAchievements must be used within an AchievementProvider')
  }
  return context
}

export const AchievementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([])
  const { addNotification } = useNotifications()

  useEffect(() => {
    // Load unlocked achievements from localStorage
    const saved = localStorage.getItem('codecikgu-achievements')
    if (saved) {
      const savedIds = JSON.parse(saved)
      const unlocked = achievements.filter(a => savedIds.includes(a.id))
      setUnlockedAchievements(unlocked)
    }
  }, [])

  const checkAchievements = (stats: UserStats) => {
    const newUnlocked: Achievement[] = []
    
    achievements.forEach(achievement => {
      const isAlreadyUnlocked = unlockedAchievements.some(u => u.id === achievement.id)
      const meetsCondition = achievement.condition(stats)
      
      if (!isAlreadyUnlocked && meetsCondition) {
        const unlockedAchievement = { ...achievement, unlockedAt: new Date() }
        newUnlocked.push(unlockedAchievement)
        
        // Show notification
        addNotification({
          type: 'success',
          title: '🏆 Pencapaian Dibuka!',
          message: `${achievement.title} - ${achievement.description}`,
          duration: 8000,
          action: {
            label: 'Lihat',
            onClick: () => {
              // Could open achievements modal
            }
          }
        })
      }
    })

    if (newUnlocked.length > 0) {
      const updatedUnlocked = [...unlockedAchievements, ...newUnlocked]
      setUnlockedAchievements(updatedUnlocked)
      
      // Save to localStorage
      const achievementIds = updatedUnlocked.map(a => a.id)
      localStorage.setItem('codecikgu-achievements', JSON.stringify(achievementIds))
    }
  }

  const getProgress = (achievementId: string, stats: UserStats): number => {
    const achievement = achievements.find(a => a.id === achievementId)
    if (!achievement) return 0

    // Calculate progress based on achievement type
    switch (achievement.id) {
      case 'first-steps':
        return Math.min(stats.tutorialsCompleted, 1) * 100
      case 'code-warrior':
        return Math.min(stats.codeExecutions / 100, 1) * 100
      case 'challenge-master':
        return Math.min(stats.challengesCompleted / 25, 1) * 100
      case 'top-performer':
        return stats.leaderboardPosition ? Math.max(0, (11 - stats.leaderboardPosition) / 10 * 100) : 0
      case 'knowledge-seeker':
        return Math.min(stats.notesRead / 50, 1) * 100
      case 'consistent-learner':
        return Math.min(stats.consecutiveDays / 7, 1) * 100
      default:
        return 0
    }
  }

  return (
    <AchievementContext.Provider value={{
      achievements,
      unlockedAchievements,
      checkAchievements,
      getProgress
    }}>
      {children}
    </AchievementContext.Provider>
  )
}

// Achievement display components
export const AchievementCard: React.FC<{ 
  achievement: Achievement
  isUnlocked: boolean
  progress?: number 
}> = ({ achievement, isUnlocked, progress = 0 }) => {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-500 to-gray-600'
      case 'rare': return 'from-blue-500 to-blue-600'
      case 'epic': return 'from-purple-500 to-purple-600'
      case 'legendary': return 'from-yellow-500 to-yellow-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  return (
    <div className={`relative p-4 rounded-xl border transition-all duration-300 ${
      isUnlocked 
        ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-electric-blue/50 shadow-lg shadow-electric-blue/20' 
        : 'bg-gray-900/50 border-gray-700 opacity-60'
    }`}>
      {/* Rarity indicator */}
      <div className={`absolute top-2 right-2 w-3 h-3 rounded-full bg-gradient-to-r ${getRarityColor(achievement.rarity)}`} />
      
      {/* Icon */}
      <div className={`mb-3 ${isUnlocked ? 'text-electric-blue' : 'text-gray-500'}`}>
        {achievement.icon}
      </div>
      
      {/* Content */}
      <h3 className={`font-semibold mb-1 ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>
        {achievement.title}
      </h3>
      <p className={`text-sm mb-3 ${isUnlocked ? 'text-gray-300' : 'text-gray-500'}`}>
        {achievement.description}
      </p>
      
      {/* Progress bar (if not unlocked) */}
      {!isUnlocked && progress > 0 && (
        <div className="mb-2">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Kemajuan</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-electric-blue to-neon-cyan h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      
      {/* XP Reward */}
      <div className="flex items-center justify-between">
        <span className={`text-xs px-2 py-1 rounded-full ${
          isUnlocked ? 'bg-electric-blue/20 text-electric-blue' : 'bg-gray-700 text-gray-400'
        }`}>
          {achievement.category}
        </span>
        <span className={`text-sm font-medium ${isUnlocked ? 'text-neon-green' : 'text-gray-500'}`}>
          +{achievement.xpReward} XP
        </span>
      </div>
      
      {/* Unlocked date */}
      {isUnlocked && achievement.unlockedAt && (
        <div className="mt-2 text-xs text-gray-400">
          Dibuka: {achievement.unlockedAt.toLocaleDateString('ms-MY')}
        </div>
      )}
    </div>
  )
}

// Achievement summary component
export const AchievementSummary: React.FC<{ stats: UserStats }> = ({ /* stats */ }) => {
  const { achievements, unlockedAchievements } = useAchievements()
  
  const totalXP = unlockedAchievements.reduce((sum, a) => sum + a.xpReward, 0)
  const completionRate = (unlockedAchievements.length / achievements.length) * 100

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="glass-dark rounded-xl p-4 text-center">
        <div className="text-2xl font-bold text-electric-blue">{unlockedAchievements.length}</div>
        <div className="text-sm text-gray-400">Pencapaian</div>
      </div>
      <div className="glass-dark rounded-xl p-4 text-center">
        <div className="text-2xl font-bold text-neon-green">+{totalXP}</div>
        <div className="text-sm text-gray-400">XP Bonus</div>
      </div>
      <div className="glass-dark rounded-xl p-4 text-center">
        <div className="text-2xl font-bold text-purple-400">{Math.round(completionRate)}%</div>
        <div className="text-sm text-gray-400">Lengkap</div>
      </div>
    </div>
  )
}
