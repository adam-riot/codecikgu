'use client'

import React, { useState, useEffect } from 'react'
import { 
  Flame, 
  Calendar, 
  Trophy, 
  Target, 
  CheckCircle, 
  Clock,
  Award,
  Star,
  Gift,
  Zap
} from 'lucide-react'
import { useNotifications } from './NotificationProvider'

interface StreakData {
  currentStreak: number
  longestStreak: number
  totalDays: number
  weeklyGoal: number
  monthlyGoal: number
  lastActivityDate: string
  streakStartDate: string
  activities: ActivityEntry[]
  milestones: Milestone[]
  rewards: StreakReward[]
}

interface ActivityEntry {
  date: string
  activities: string[]
  xpEarned: number
  timeSpent: number // in minutes
  isCompleted: boolean
}

interface Milestone {
  id: string
  title: string
  description: string
  requirement: number
  isUnlocked: boolean
  reward: string
  icon: string
}

interface StreakReward {
  id: string
  title: string
  description: string
  streakRequired: number
  xpBonus: number
  badge?: string
  isClaimed: boolean
}

// Sample data
const sampleStreakData: StreakData = {
  currentStreak: 7,
  longestStreak: 23,
  totalDays: 67,
  weeklyGoal: 5,
  monthlyGoal: 20,
  lastActivityDate: '2024-01-12',
  streakStartDate: '2024-01-06',
  activities: [
    {
      date: '2024-01-12',
      activities: ['Completed PHP Challenge', 'Watched CSS Tutorial', 'Practiced JavaScript'],
      xpEarned: 150,
      timeSpent: 90,
      isCompleted: true
    },
    {
      date: '2024-01-11',
      activities: ['Solved Algorithm Problem', 'Read Documentation'],
      xpEarned: 100,
      timeSpent: 60,
      isCompleted: true
    },
    {
      date: '2024-01-10',
      activities: ['Built Calculator Project', 'Quiz on Variables'],
      xpEarned: 200,
      timeSpent: 120,
      isCompleted: true
    },
    {
      date: '2024-01-09',
      activities: ['Morning Coding Session'],
      xpEarned: 75,
      timeSpent: 45,
      isCompleted: true
    },
    {
      date: '2024-01-08',
      activities: ['Database Tutorial', 'SQL Practice'],
      xpEarned: 125,
      timeSpent: 80,
      isCompleted: true
    },
    {
      date: '2024-01-07',
      activities: ['HTML/CSS Review', 'Portfolio Update'],
      xpEarned: 90,
      timeSpent: 70,
      isCompleted: true
    },
    {
      date: '2024-01-06',
      activities: ['Started New Challenge'],
      xpEarned: 50,
      timeSpent: 30,
      isCompleted: true
    }
  ],
  milestones: [
    {
      id: 'first-week',
      title: 'Minggu Pertama',
      description: 'Belajar selama 7 hari berturut-turut',
      requirement: 7,
      isUnlocked: true,
      reward: '100 XP + Badge',
      icon: '🔥'
    },
    {
      id: 'two-weeks',
      title: 'Dua Minggu',
      description: 'Mengekalkan streak selama 14 hari',
      requirement: 14,
      isUnlocked: false,
      reward: '250 XP + Special Badge',
      icon: '⚡'
    },
    {
      id: 'one-month',
      title: 'Satu Bulan',
      description: 'Konsisten belajar selama 30 hari',
      requirement: 30,
      isUnlocked: false,
      reward: '500 XP + Premium Features',
      icon: '🏆'
    },
    {
      id: 'hundred-days',
      title: 'Seratus Hari',
      description: 'Pencapaian luar biasa: 100 hari berturut-turut',
      requirement: 100,
      isUnlocked: false,
      reward: '1000 XP + Hall of Fame',
      icon: '👑'
    }
  ],
  rewards: [
    {
      id: 'week-1',
      title: 'Ganjaran Minggu Pertama',
      description: 'Tahniah kerana konsisten selama seminggu!',
      streakRequired: 7,
      xpBonus: 100,
      badge: 'Streak Starter',
      isClaimed: true
    },
    {
      id: 'week-2',
      title: 'Penguasa Dua Minggu',
      description: 'Menunjukkan dedikasi yang luar biasa',
      streakRequired: 14,
      xpBonus: 250,
      badge: 'Dedication Master',
      isClaimed: false
    },
    {
      id: 'month-1',
      title: 'Pencinta Pembelajaran',
      description: 'Sebulan penuh pembelajaran tanpa putus',
      streakRequired: 30,
      xpBonus: 500,
      badge: 'Learning Lover',
      isClaimed: false
    }
  ]
}

export function StudyStreakTracker() {
  const [streakData, setStreakData] = useState<StreakData>(sampleStreakData)
  const [currentView, setCurrentView] = useState<'overview' | 'calendar' | 'milestones' | 'rewards'>('overview')
  const { addNotification } = useNotifications()

  // Load streak data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('codecikgu-streak-data')
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        setStreakData({ ...sampleStreakData, ...parsed })
      } catch (error) {
        console.error('Error loading streak data:', error)
      }
    }
  }, [])

  // Save streak data to localStorage
  const saveStreakData = (data: StreakData) => {
    setStreakData(data)
    localStorage.setItem('codecikgu-streak-data', JSON.stringify(data))
  }

  const claimReward = (rewardId: string) => {
    const updatedData = {
      ...streakData,
      rewards: streakData.rewards.map(reward =>
        reward.id === rewardId ? { ...reward, isClaimed: true } : reward
      )
    }
    
    saveStreakData(updatedData)
    
    const reward = streakData.rewards.find(r => r.id === rewardId)
    if (reward) {
      addNotification({
        type: 'success',
        title: '🎁 Ganjaran Diperoleh!',
        message: `+${reward.xpBonus} XP dan badge "${reward.badge}"`
      })
    }
  }

  const formatTimeSpent = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    
    if (hours > 0) {
      return `${hours}j ${mins}m`
    }
    return `${mins}m`
  }

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return 'text-purple-400'
    if (streak >= 14) return 'text-orange-400'
    if (streak >= 7) return 'text-yellow-400'
    if (streak >= 3) return 'text-green-400'
    return 'text-gray-400'
  }

  if (currentView === 'calendar') {
    return <StreakCalendar streakData={streakData} onBack={() => setCurrentView('overview')} />
  }

  if (currentView === 'milestones') {
    return <StreakMilestones streakData={streakData} onBack={() => setCurrentView('overview')} />
  }

  if (currentView === 'rewards') {
    return <StreakRewards streakData={streakData} onBack={() => setCurrentView('overview')} onClaimReward={claimReward} />
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gradient mb-2">Jejak Pembelajaran</h2>
        <p className="text-gray-400">Kekalkan momentum pembelajaran anda setiap hari</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass-dark rounded-xl p-6 text-center">
          <Flame className={`w-12 h-12 mx-auto mb-3 ${getStreakColor(streakData.currentStreak)}`} />
          <h3 className={`text-3xl font-bold mb-1 ${getStreakColor(streakData.currentStreak)}`}>
            {streakData.currentStreak}
          </h3>
          <p className="text-gray-400 text-sm">Hari Berturut-turut</p>
        </div>

        <div className="glass-dark rounded-xl p-6 text-center">
          <Trophy className="w-12 h-12 mx-auto mb-3 text-yellow-400" />
          <h3 className="text-3xl font-bold text-white mb-1">{streakData.longestStreak}</h3>
          <p className="text-gray-400 text-sm">Rekod Terpanjang</p>
        </div>

        <div className="glass-dark rounded-xl p-6 text-center">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-blue-400" />
          <h3 className="text-3xl font-bold text-white mb-1">{streakData.totalDays}</h3>
          <p className="text-gray-400 text-sm">Jumlah Hari Aktif</p>
        </div>

        <div className="glass-dark rounded-xl p-6 text-center">
          <Target className="w-12 h-12 mx-auto mb-3 text-green-400" />
          <h3 className="text-3xl font-bold text-white mb-1">
            {streakData.activities.filter(a => a.date >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]).length}/{streakData.weeklyGoal}
          </h3>
          <p className="text-gray-400 text-sm">Sasaran Mingguan</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="glass-dark rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Aktiviti Terkini</h3>
              <button
                onClick={() => setCurrentView('calendar')}
                className="text-electric-blue hover:text-electric-blue/80 text-sm"
              >
                Lihat Kalendar →
              </button>
            </div>

            <div className="space-y-4">
              {streakData.activities.slice(0, 5).map((activity) => (
                <div key={activity.date} className="flex items-start space-x-4 p-4 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-electric-blue/20">
                    <CheckCircle className="w-4 h-4 text-electric-blue" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium">
                        {new Date(activity.date).toLocaleDateString('ms-MY', { 
                          weekday: 'long', 
                          day: 'numeric', 
                          month: 'short' 
                        })}
                      </h4>
                      <div className="flex items-center space-x-3 text-sm text-gray-400">
                        <span className="flex items-center space-x-1">
                          <Zap className="w-3 h-3" />
                          <span>+{activity.xpEarned} XP</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatTimeSpent(activity.timeSpent)}</span>
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {activity.activities.map((act, actIndex) => (
                        <span key={actIndex} className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded">
                          {act}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          {/* Progress Ring */}
          <div className="glass-dark rounded-xl p-6 text-center">
            <h3 className="text-lg font-semibold text-white mb-4">Sasaran Mingguan</h3>
            <div className="relative w-24 h-24 mx-auto mb-4">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="rgb(55 65 81)"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="rgb(59 130 246)"
                  strokeWidth="3"
                  strokeDasharray={`${(streakData.currentStreak / streakData.weeklyGoal) * 100}, 100`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-white">
                  {Math.min(streakData.currentStreak, streakData.weeklyGoal)}/{streakData.weeklyGoal}
                </span>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              {streakData.weeklyGoal - Math.min(streakData.currentStreak, streakData.weeklyGoal)} hari lagi
            </p>
          </div>

          {/* Navigation Cards */}
          <div className="space-y-3">
            <button
              onClick={() => setCurrentView('milestones')}
              className="w-full glass-dark rounded-xl p-4 text-left hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Award className="w-5 h-5 text-purple-400" />
                <div>
                  <h4 className="text-white font-medium">Pencapaian</h4>
                  <p className="text-gray-400 text-sm">Lihat milestone anda</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setCurrentView('rewards')}
              className="w-full glass-dark rounded-xl p-4 text-left hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Gift className="w-5 h-5 text-green-400" />
                <div>
                  <h4 className="text-white font-medium">Ganjaran</h4>
                  <p className="text-gray-400 text-sm">Tuntut ganjaran anda</p>
                </div>
              </div>
            </button>
          </div>

          {/* Motivation Quote */}
          <div className="glass-dark rounded-xl p-6">
            <div className="text-center">
              <Star className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <p className="text-gray-300 text-sm italic mb-2">
                &quot;Konsistensi adalah kunci kepada kejayaan.&quot;
              </p>
              <p className="text-gray-500 text-xs">- Motivasi Harian</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Streak Calendar Component
function StreakCalendar({ streakData, onBack }: { streakData: StreakData, onBack: () => void }) {
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  
  const getCalendarDays = () => {
    const year = selectedMonth.getFullYear()
    const month = selectedMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()
    
    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dateStr = date.toISOString().split('T')[0]
      const activity = streakData.activities.find(a => a.date === dateStr)
      
      days.push({
        date: dateStr,
        day: day,
        hasActivity: !!activity,
        activity: activity,
        isToday: dateStr === new Date().toISOString().split('T')[0],
        isFuture: date > new Date()
      })
    }
    
    return days
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setSelectedMonth(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const calendarDays = getCalendarDays()

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ← Kembali
        </button>
        <h2 className="text-2xl font-bold text-white">Kalendar Pembelajaran</h2>
        <div></div>
      </div>

      <div className="glass-dark rounded-xl p-6">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            ←
          </button>
          <h3 className="text-xl font-semibold text-white">
            {selectedMonth.toLocaleDateString('ms-MY', { month: 'long', year: 'numeric' })}
          </h3>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            →
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Ahd', 'Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab'].map(day => (
            <div key={day} className="text-center text-gray-400 text-sm font-medium py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`aspect-square flex items-center justify-center text-sm rounded-lg transition-colors ${
                !day ? '' :
                day.isFuture ? 'text-gray-600' :
                day.hasActivity ? 'bg-electric-blue/20 text-electric-blue border border-electric-blue/30' :
                day.isToday ? 'bg-gray-700 text-white border border-gray-500' :
                'text-gray-400 hover:bg-gray-800'
              }`}
            >
              {day?.day}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center space-x-6 mt-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-electric-blue/20 border border-electric-blue/30 rounded"></div>
            <span className="text-gray-400">Hari Aktif</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-700 border border-gray-500 rounded"></div>
            <span className="text-gray-400">Hari Ini</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-800 rounded"></div>
            <span className="text-gray-400">Tiada Aktiviti</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Streak Milestones Component
function StreakMilestones({ streakData, onBack }: { streakData: StreakData, onBack: () => void }) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ← Kembali
        </button>
        <h2 className="text-2xl font-bold text-white">Pencapaian Milestone</h2>
        <div></div>
      </div>

      <div className="space-y-4">
        {streakData.milestones.map((milestone) => (
          <div
            key={milestone.id}
            className={`glass-dark rounded-xl p-6 ${
              milestone.isUnlocked ? 'border border-green-500/30' : 'opacity-75'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className={`text-4xl ${milestone.isUnlocked ? '' : 'grayscale'}`}>
                {milestone.icon}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-xl font-semibold text-white">{milestone.title}</h3>
                  {milestone.isUnlocked && (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  )}
                </div>
                <p className="text-gray-300 mb-2">{milestone.description}</p>
                <p className="text-electric-blue text-sm">{milestone.reward}</p>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold text-white mb-1">
                  {Math.min(streakData.currentStreak, milestone.requirement)}/{milestone.requirement}
                </div>
                <div className="text-gray-400 text-sm">hari</div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    milestone.isUnlocked ? 'bg-green-500' : 'bg-gradient-to-r from-electric-blue to-neon-cyan'
                  }`}
                  style={{ 
                    width: `${Math.min((streakData.currentStreak / milestone.requirement) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Streak Rewards Component
function StreakRewards({ 
  streakData, 
  onBack, 
  onClaimReward 
}: { 
  streakData: StreakData
  onBack: () => void
  onClaimReward: (rewardId: string) => void 
}) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ← Kembali
        </button>
        <h2 className="text-2xl font-bold text-white">Ganjaran Streak</h2>
        <div></div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {streakData.rewards.map((reward) => {
          const canClaim = streakData.currentStreak >= reward.streakRequired && !reward.isClaimed
          
          return (
            <div
              key={reward.id}
              className={`glass-dark rounded-xl p-6 ${
                reward.isClaimed ? 'border border-green-500/30' :
                canClaim ? 'border border-electric-blue/50' : ''
              }`}
            >
              <div className="text-center">
                <Gift className={`w-12 h-12 mx-auto mb-4 ${
                  reward.isClaimed ? 'text-green-400' :
                  canClaim ? 'text-electric-blue' : 'text-gray-500'
                }`} />
                
                <h3 className="text-xl font-semibold text-white mb-2">{reward.title}</h3>
                <p className="text-gray-300 mb-4">{reward.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-center space-x-2">
                    <Flame className="w-4 h-4 text-orange-400" />
                    <span className="text-gray-400">{reward.streakRequired} hari berturut-turut</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Zap className="w-4 h-4 text-electric-blue" />
                    <span className="text-electric-blue">+{reward.xpBonus} XP</span>
                  </div>
                  {reward.badge && (
                    <div className="flex items-center justify-center space-x-2">
                      <Award className="w-4 h-4 text-purple-400" />
                      <span className="text-purple-400">{reward.badge}</span>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => onClaimReward(reward.id)}
                  disabled={!canClaim}
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    reward.isClaimed ? 'bg-green-500/20 text-green-400 cursor-default' :
                    canClaim ? 'btn-primary' :
                    'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {reward.isClaimed ? 'Sudah Dituntut' :
                   canClaim ? 'Tuntut Ganjaran' :
                   `Perlukan ${reward.streakRequired - streakData.currentStreak} hari lagi`}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
