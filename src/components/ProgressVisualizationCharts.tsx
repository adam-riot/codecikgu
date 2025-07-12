'use client'

import React, { useState, useEffect } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Calendar, 
  Clock, 
  Trophy,
  Star,
  Users,
  BookOpen,
  Code,
  Zap,
  Award,
  ChevronDown,
  ChevronUp,
  Download,
  RefreshCw,
  Filter,
  Eye,
  PieChart,
  Activity,
  Flame
} from 'lucide-react'
import { useNotifications } from './NotificationProvider'

interface LearningData {
  date: string
  xpGained: number
  timeSpent: number // in minutes
  challengesCompleted: number
  videosWatched: number
  quizzesCompleted: number
  codeLines: number
  concepts: string[]
}

interface SkillProgress {
  skill: string
  level: number
  xp: number
  maxXp: number
  category: 'programming' | 'theory' | 'practice'
  streak: number
  lastActivity: string
}

interface ActivityHeatmap {
  date: string
  intensity: number // 0-4 scale
  activities: number
  totalTime: number
}

interface LeaderboardEntry {
  rank: number
  name: string
  xp: number
  streak: number
  achievements: number
  weeklyXp?: number
}

interface ComparisonData {
  category: string
  userValue: number
  averageValue: number
  topPerformerValue: number
}

// Sample data generation
const generateLearningData = (days: number): LearningData[] => {
  const data: LearningData[] = []
  const today = new Date()
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    const isWeekend = date.getDay() === 0 || date.getDay() === 6
    const baseActivity = isWeekend ? 0.3 : 0.8
    const randomFactor = Math.random() * 0.5 + 0.5
    const activity = baseActivity * randomFactor
    
    data.push({
      date: date.toISOString().split('T')[0],
      xpGained: Math.floor(activity * 150 + Math.random() * 50),
      timeSpent: Math.floor(activity * 120 + Math.random() * 60),
      challengesCompleted: Math.floor(activity * 3 + Math.random() * 2),
      videosWatched: Math.floor(activity * 2 + Math.random() * 2),
      quizzesCompleted: Math.floor(activity * 4 + Math.random() * 3),
      codeLines: Math.floor(activity * 200 + Math.random() * 100),
      concepts: ['PHP Variables', 'JavaScript Functions', 'Loops', 'Arrays'].slice(0, Math.floor(activity * 3) + 1)
    })
  }
  
  return data
}

const generateSkillProgress = (): SkillProgress[] => {
  return [
    { skill: 'PHP Fundamentals', level: 4, xp: 340, maxXp: 400, category: 'programming', streak: 12, lastActivity: '2025-07-12' },
    { skill: 'JavaScript Basics', level: 3, xp: 180, maxXp: 300, category: 'programming', streak: 8, lastActivity: '2025-07-11' },
    { skill: 'HTML/CSS', level: 5, xp: 450, maxXp: 500, category: 'programming', streak: 15, lastActivity: '2025-07-12' },
    { skill: 'Database Design', level: 2, xp: 80, maxXp: 200, category: 'theory', streak: 3, lastActivity: '2025-07-10' },
    { skill: 'Problem Solving', level: 3, xp: 220, maxXp: 300, category: 'practice', streak: 6, lastActivity: '2025-07-12' },
    { skill: 'Code Debugging', level: 4, xp: 320, maxXp: 400, category: 'practice', streak: 9, lastActivity: '2025-07-11' }
  ]
}

const generateActivityHeatmap = (days: number): ActivityHeatmap[] => {
  const data: ActivityHeatmap[] = []
  const today = new Date()
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    const isWeekend = date.getDay() === 0 || date.getDay() === 6
    const baseIntensity = isWeekend ? 1 : 3
    const intensity = Math.min(4, Math.max(0, baseIntensity + Math.floor(Math.random() * 3) - 1))
    
    data.push({
      date: date.toISOString().split('T')[0],
      intensity,
      activities: intensity * 2 + Math.floor(Math.random() * 3),
      totalTime: intensity * 30 + Math.floor(Math.random() * 30)
    })
  }
  
  return data
}

export function ProgressVisualizationCharts() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [selectedMetric, setSelectedMetric] = useState<'xp' | 'time' | 'challenges' | 'all'>('xp')
  const [viewType, setViewType] = useState<'overview' | 'detailed' | 'comparison' | 'heatmap'>('overview')
  const [learningData, setLearningData] = useState<LearningData[]>([])
  const [skillProgress, setSkillProgress] = useState<SkillProgress[]>(generateSkillProgress())
  const [activityHeatmap, setActivityHeatmap] = useState<ActivityHeatmap[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const { addNotification } = useNotifications()

  useEffect(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365
    setLearningData(generateLearningData(days))
    setActivityHeatmap(generateActivityHeatmap(days))
  }, [timeRange])

  const refreshData = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365
    setLearningData(generateLearningData(days))
    setActivityHeatmap(generateActivityHeatmap(days))
    setSkillProgress(generateSkillProgress())
    
    setIsLoading(false)
    addNotification({
      type: 'success',
      title: '📊 Data Dikemaskini',
      message: 'Statistik pembelajaran terkini telah dimuatkan'
    })
  }

  const exportData = () => {
    const exportData = {
      learningData,
      skillProgress,
      activityHeatmap,
      exportDate: new Date().toISOString(),
      timeRange
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `codecikgu-progress-${timeRange}-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    
    addNotification({
      type: 'success',
      title: '📁 Data Dieksport',
      message: 'Fail statistik telah dimuat turun'
    })
  }

  const calculateTotals = () => {
    return {
      totalXp: learningData.reduce((sum, day) => sum + day.xpGained, 0),
      totalTime: learningData.reduce((sum, day) => sum + day.timeSpent, 0),
      totalChallenges: learningData.reduce((sum, day) => sum + day.challengesCompleted, 0),
      totalVideos: learningData.reduce((sum, day) => sum + day.videosWatched, 0),
      totalQuizzes: learningData.reduce((sum, day) => sum + day.quizzesCompleted, 0),
      avgDaily: learningData.length > 0 ? Math.round(learningData.reduce((sum, day) => sum + day.xpGained, 0) / learningData.length) : 0,
      activeDays: learningData.filter(day => day.xpGained > 0).length,
      currentStreak: calculateCurrentStreak()
    }
  }

  const calculateCurrentStreak = () => {
    let streak = 0
    const sortedData = [...learningData].reverse()
    
    for (const day of sortedData) {
      if (day.xpGained > 0) {
        streak++
      } else {
        break
      }
    }
    
    return streak
  }

  const getIntensityColor = (intensity: number) => {
    switch (intensity) {
      case 0: return 'bg-gray-800'
      case 1: return 'bg-green-900'
      case 2: return 'bg-green-700'
      case 3: return 'bg-green-500'
      case 4: return 'bg-green-300'
      default: return 'bg-gray-800'
    }
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}j ${mins}m`
    }
    return `${mins}m`
  }

  const totals = calculateTotals()

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gradient mb-2">Analisis Kemajuan</h2>
          <p className="text-gray-400">Pantau prestasi pembelajaran anda dengan visualisasi data yang mendalam</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={refreshData}
            disabled={isLoading}
            className="p-2 text-gray-400 hover:text-electric-blue transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={exportData}
            className="p-2 text-gray-400 hover:text-electric-blue transition-colors"
          >
            <Download className="w-5 h-5" />
          </button>
          
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
          >
            <option value="7d">7 Hari</option>
            <option value="30d">30 Hari</option>
            <option value="90d">90 Hari</option>
            <option value="1y">1 Tahun</option>
          </select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <StatCard
          icon={<Trophy className="w-6 h-6 text-yellow-400" />}
          label="Jumlah XP"
          value={totals.totalXp.toLocaleString()}
          change="+12%"
          positive={true}
        />
        
        <StatCard
          icon={<Clock className="w-6 h-6 text-blue-400" />}
          label="Masa Belajar"
          value={formatTime(totals.totalTime)}
          change="+8%"
          positive={true}
        />
        
        <StatCard
          icon={<Target className="w-6 h-6 text-green-400" />}
          label="Cabaran"
          value={totals.totalChallenges.toString()}
          change="+25%"
          positive={true}
        />
        
        <StatCard
          icon={<BookOpen className="w-6 h-6 text-purple-400" />}
          label="Video"
          value={totals.totalVideos.toString()}
          change="+15%"
          positive={true}
        />
        
        <StatCard
          icon={<Flame className="w-6 h-6 text-orange-400" />}
          label="Streak"
          value={`${totals.currentStreak} hari`}
          change="Aktif"
          positive={true}
        />
        
        <StatCard
          icon={<TrendingUp className="w-6 h-6 text-electric-blue" />}
          label="Purata Harian"
          value={`${totals.avgDaily} XP`}
          change="+5%"
          positive={true}
        />
      </div>

      {/* View Toggle */}
      <div className="glass-dark rounded-xl p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-gray-400 text-sm">Paparan:</span>
            <div className="flex bg-gray-800 rounded-lg p-1">
              {[
                { id: 'overview', label: 'Ringkasan', icon: BarChart3 },
                { id: 'detailed', label: 'Terperinci', icon: Activity },
                { id: 'comparison', label: 'Perbandingan', icon: Users },
                { id: 'heatmap', label: 'Heatmap', icon: Calendar }
              ].map(view => (
                <button
                  key={view.id}
                  onClick={() => setViewType(view.id as any)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded text-sm transition-colors ${
                    viewType === view.id 
                      ? 'bg-electric-blue text-black' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <view.icon className="w-4 h-4" />
                  <span>{view.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          {viewType === 'detailed' && (
            <div className="flex items-center space-x-2">
              <span className="text-gray-400 text-sm">Metrik:</span>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value as any)}
                className="px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
              >
                <option value="all">Semua Metrik</option>
                <option value="xp">XP Gained</option>
                <option value="time">Masa Belajar</option>
                <option value="challenges">Cabaran</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Main Charts Area */}
      <div className="space-y-6">
        {viewType === 'overview' && (
          <OverviewCharts 
            learningData={learningData} 
            skillProgress={skillProgress}
            formatTime={formatTime}
          />
        )}
        
        {viewType === 'detailed' && (
          <DetailedCharts 
            learningData={learningData}
            selectedMetric={selectedMetric}
            formatTime={formatTime}
          />
        )}
        
        {viewType === 'comparison' && (
          <ComparisonCharts 
            learningData={learningData}
            skillProgress={skillProgress}
          />
        )}
        
        {viewType === 'heatmap' && (
          <HeatmapView 
            activityHeatmap={activityHeatmap}
            getIntensityColor={getIntensityColor}
            formatTime={formatTime}
          />
        )}
      </div>

      {/* Skills Progress Section */}
      <div className="mt-8">
        <SkillsProgressSection skillProgress={skillProgress} />
      </div>

      {/* Insights and Recommendations */}
      <div className="mt-8">
        <InsightsSection 
          learningData={learningData} 
          skillProgress={skillProgress}
          totals={totals}
        />
      </div>
    </div>
  )
}

function StatCard({ 
  icon, 
  label, 
  value, 
  change, 
  positive 
}: {
  icon: React.ReactNode
  label: string
  value: string
  change: string
  positive: boolean
}) {
  return (
    <div className="glass-dark rounded-xl p-4">
      <div className="flex items-center space-x-3 mb-2">
        {icon}
        <span className="text-gray-400 text-sm">{label}</span>
      </div>
      <div className="text-xl font-bold text-white mb-1">{value}</div>
      <div className={`text-xs ${positive ? 'text-green-400' : 'text-red-400'}`}>
        {change}
      </div>
    </div>
  )
}

function OverviewCharts({ 
  learningData, 
  skillProgress, 
  formatTime 
}: {
  learningData: LearningData[]
  skillProgress: SkillProgress[]
  formatTime: (minutes: number) => string
}) {
  const maxXp = Math.max(...learningData.map(d => d.xpGained))
  const maxTime = Math.max(...learningData.map(d => d.timeSpent))

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* XP Progress Chart */}
      <div className="glass-dark rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-electric-blue" />
          XP Harian (30 hari terakhir)
        </h3>
        
        <div className="h-64 flex items-end space-x-1">
          {learningData.slice(-30).map((day, index) => (
            <div key={index} className="flex-1 flex flex-col items-center group">
              <div className="relative">
                <div
                  className="bg-gradient-to-t from-electric-blue to-electric-blue/50 rounded-t transition-all hover:from-electric-blue/80 hover:to-electric-blue/30"
                  style={{ 
                    height: `${(day.xpGained / maxXp) * 200}px`,
                    minHeight: day.xpGained > 0 ? '4px' : '0px',
                    width: '100%'
                  }}
                />
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  <div>{new Date(day.date).toLocaleDateString('ms-MY')}</div>
                  <div>{day.xpGained} XP</div>
                  <div>{formatTime(day.timeSpent)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>{learningData.slice(-30)[0]?.date && new Date(learningData.slice(-30)[0].date).toLocaleDateString('ms-MY')}</span>
          <span>{learningData.slice(-1)[0]?.date && new Date(learningData.slice(-1)[0].date).toLocaleDateString('ms-MY')}</span>
        </div>
      </div>

      {/* Skills Radar */}
      <div className="glass-dark rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2 text-electric-blue" />
          Kemajuan Kemahiran
        </h3>
        
        <div className="space-y-4">
          {skillProgress.map((skill, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white text-sm font-medium">{skill.skill}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-electric-blue text-sm">Level {skill.level}</span>
                  <span className="text-gray-400 text-xs">({skill.xp}/{skill.maxXp} XP)</span>
                </div>
              </div>
              
              <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-electric-blue to-electric-blue/70 h-2 rounded-full transition-all"
                  style={{ width: `${(skill.xp / skill.maxXp) * 100}%` }}
                />
              </div>
              
              <div className="flex justify-between text-xs text-gray-400">
                <span className={`px-2 py-1 rounded ${
                  skill.category === 'programming' ? 'bg-blue-500/20 text-blue-400' :
                  skill.category === 'theory' ? 'bg-purple-500/20 text-purple-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {skill.category}
                </span>
                <span>🔥 {skill.streak} hari</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Distribution */}
      <div className="glass-dark rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <PieChart className="w-5 h-5 mr-2 text-electric-blue" />
          Taburan Aktiviti
        </h3>
        
        <div className="space-y-4">
          {[
            { label: 'Cabaran Kod', value: learningData.reduce((sum, d) => sum + d.challengesCompleted, 0), color: 'bg-green-400', icon: Code },
            { label: 'Video Pembelajaran', value: learningData.reduce((sum, d) => sum + d.videosWatched, 0), color: 'bg-blue-400', icon: BookOpen },
            { label: 'Kuiz Interaktif', value: learningData.reduce((sum, d) => sum + d.quizzesCompleted, 0), color: 'bg-yellow-400', icon: Trophy },
            { label: 'Projek Praktikal', value: Math.floor(Math.random() * 10) + 5, color: 'bg-purple-400', icon: Award }
          ].map((activity, index) => {
            const total = learningData.reduce((sum, d) => sum + d.challengesCompleted + d.videosWatched + d.quizzesCompleted, 0) + 15
            const percentage = (activity.value / total) * 100
            
            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <activity.icon className="w-4 h-4 text-gray-400" />
                  <span className="text-white text-sm">{activity.label}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-20 bg-gray-700 h-2 rounded-full">
                    <div 
                      className={`${activity.color} h-2 rounded-full`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-gray-400 text-sm w-8">{activity.value}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Weekly Summary */}
      <div className="glass-dark rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-electric-blue" />
          Ringkasan Mingguan
        </h3>
        
        <div className="space-y-4">
          {['Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu', 'Ahad'].map((day, index) => {
            const dayData = learningData.filter(d => new Date(d.date).getDay() === (index + 1) % 7)
            const avgXp = dayData.length > 0 ? Math.round(dayData.reduce((sum, d) => sum + d.xpGained, 0) / dayData.length) : 0
            const maxDayXp = 200
            
            return (
              <div key={index} className="flex items-center justify-between">
                <span className="text-white text-sm w-16">{day}</span>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-700 h-2 rounded-full">
                    <div 
                      className="bg-gradient-to-r from-electric-blue to-electric-blue/70 h-2 rounded-full"
                      style={{ width: `${(avgXp / maxDayXp) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-gray-400 text-sm w-12 text-right">{avgXp} XP</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function DetailedCharts({ 
  learningData, 
  selectedMetric, 
  formatTime 
}: {
  learningData: LearningData[]
  selectedMetric: string
  formatTime: (minutes: number) => string
}) {
  const getMetricData = (data: LearningData[]) => {
    switch (selectedMetric) {
      case 'xp':
        return { values: data.map(d => d.xpGained), label: 'XP Gained', color: 'electric-blue' }
      case 'time':
        return { values: data.map(d => d.timeSpent), label: 'Masa (minit)', color: 'blue-400' }
      case 'challenges':
        return { values: data.map(d => d.challengesCompleted), label: 'Cabaran', color: 'green-400' }
      default:
        return { values: data.map(d => d.xpGained), label: 'XP Gained', color: 'electric-blue' }
    }
  }

  const metricData = getMetricData(learningData)
  const maxValue = Math.max(...metricData.values)

  return (
    <div className="space-y-6">
      {/* Detailed Line Chart */}
      <div className="glass-dark rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Trend Terperinci - {metricData.label}
        </h3>
        
        <div className="h-80 relative">
          <svg className="w-full h-full" viewBox="0 0 800 300">
            {/* Grid Lines */}
            {[0, 1, 2, 3, 4].map(i => (
              <line
                key={i}
                x1="0"
                y1={60 + i * 60}
                x2="800"
                y2={60 + i * 60}
                stroke="#374151"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
            ))}
            
            {/* Data Line */}
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`text-${metricData.color}`}
              points={metricData.values.map((value, index) => {
                const x = (index / (metricData.values.length - 1)) * 800
                const y = 300 - (value / maxValue) * 240
                return `${x},${y}`
              }).join(' ')}
            />
            
            {/* Data Points */}
            {metricData.values.map((value, index) => {
              const x = (index / (metricData.values.length - 1)) * 800
              const y = 300 - (value / maxValue) * 240
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="4"
                  className={`fill-${metricData.color}`}
                />
              )
            })}
          </svg>
        </div>
      </div>

      {/* All Metrics Combined */}
      {selectedMetric === 'all' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { key: 'xpGained', label: 'XP Gained', color: 'yellow-400', icon: Trophy },
            { key: 'timeSpent', label: 'Masa Belajar', color: 'blue-400', icon: Clock },
            { key: 'challengesCompleted', label: 'Cabaran', color: 'green-400', icon: Target },
            { key: 'videosWatched', label: 'Video', color: 'purple-400', icon: BookOpen },
            { key: 'quizzesCompleted', label: 'Kuiz', color: 'orange-400', icon: Star },
            { key: 'codeLines', label: 'Baris Kod', color: 'electric-blue', icon: Code }
          ].map(metric => {
            const values = learningData.map(d => d[metric.key as keyof LearningData] as number)
            const maxVal = Math.max(...values)
            const total = values.reduce((sum, val) => sum + val, 0)
            const avg = values.length > 0 ? Math.round(total / values.length) : 0
            
            return (
              <div key={metric.key} className="glass-dark rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <metric.icon className={`w-5 h-5 text-${metric.color}`} />
                    <span className="text-white font-medium">{metric.label}</span>
                  </div>
                  <span className="text-gray-400 text-sm">Avg: {metric.key === 'timeSpent' ? formatTime(avg) : avg}</span>
                </div>
                
                <div className="h-20 flex items-end space-x-1">
                  {values.slice(-14).map((value, index) => (
                    <div
                      key={index}
                      className={`flex-1 bg-${metric.color} rounded-t opacity-80 hover:opacity-100 transition-opacity`}
                      style={{ 
                        height: `${maxVal > 0 ? (value / maxVal) * 80 : 0}px`,
                        minHeight: value > 0 ? '2px' : '0px'
                      }}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ComparisonCharts({ 
  learningData, 
  skillProgress 
}: {
  learningData: LearningData[]
  skillProgress: SkillProgress[]
}) {
  const comparisonData: ComparisonData[] = [
    {
      category: 'XP Mingguan',
      userValue: learningData.slice(-7).reduce((sum, d) => sum + d.xpGained, 0),
      averageValue: 850,
      topPerformerValue: 1250
    },
    {
      category: 'Masa Belajar (jam)',
      userValue: Math.round(learningData.slice(-7).reduce((sum, d) => sum + d.timeSpent, 0) / 60),
      averageValue: 8,
      topPerformerValue: 15
    },
    {
      category: 'Cabaran Selesai',
      userValue: learningData.slice(-7).reduce((sum, d) => sum + d.challengesCompleted, 0),
      averageValue: 12,
      topPerformerValue: 25
    },
    {
      category: 'Level Kemahiran',
      userValue: Math.round(skillProgress.reduce((sum, s) => sum + s.level, 0) / skillProgress.length),
      averageValue: 3,
      topPerformerValue: 5
    }
  ]

  const leaderboard: LeaderboardEntry[] = [
    { rank: 1, name: 'Ahmad Zainuddin', xp: 2850, streak: 45, achievements: 28, weeklyXp: 1250 },
    { rank: 2, name: 'Siti Nurhaliza', xp: 2630, streak: 32, achievements: 24, weeklyXp: 1180 },
    { rank: 3, name: 'Muhammad Ali', xp: 2420, streak: 28, achievements: 22, weeklyXp: 1050 },
    { rank: 4, name: 'Anda', xp: 2180, streak: 15, achievements: 18, weeklyXp: learningData.slice(-7).reduce((sum, d) => sum + d.xpGained, 0) },
    { rank: 5, name: 'Fatimah Ibrahim', xp: 2050, streak: 22, achievements: 19, weeklyXp: 920 }
  ]

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Performance Comparison */}
      <div className="glass-dark rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-electric-blue" />
          Perbandingan Prestasi
        </h3>
        
        <div className="space-y-6">
          {comparisonData.map((data, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">{data.category}</span>
                <span className="text-electric-blue font-bold">{data.userValue}</span>
              </div>
              
              <div className="relative">
                <div className="w-full bg-gray-700 h-3 rounded-full">
                  {/* Top Performer Bar */}
                  <div 
                    className="absolute top-0 left-0 bg-yellow-400/30 h-3 rounded-full"
                    style={{ width: '100%' }}
                  />
                  
                  {/* Average Bar */}
                  <div 
                    className="absolute top-0 left-0 bg-gray-400/50 h-3 rounded-full"
                    style={{ width: `${(data.averageValue / data.topPerformerValue) * 100}%` }}
                  />
                  
                  {/* User Bar */}
                  <div 
                    className="absolute top-0 left-0 bg-electric-blue h-3 rounded-full transition-all"
                    style={{ width: `${(data.userValue / data.topPerformerValue) * 100}%` }}
                  />
                </div>
                
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Anda: {data.userValue}</span>
                  <span>Purata: {data.averageValue}</span>
                  <span>Terbaik: {data.topPerformerValue}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="glass-dark rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Trophy className="w-5 h-5 mr-2 text-electric-blue" />
          Papan Pendahulu (Mingguan)
        </h3>
        
        <div className="space-y-3">
          {leaderboard.map((entry, index) => (
            <div 
              key={index} 
              className={`p-3 rounded-lg flex items-center justify-between ${
                entry.name === 'Anda' 
                  ? 'bg-electric-blue/20 border border-electric-blue/50' 
                  : 'bg-gray-800/50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  entry.rank === 1 ? 'bg-yellow-400 text-black' :
                  entry.rank === 2 ? 'bg-gray-300 text-black' :
                  entry.rank === 3 ? 'bg-yellow-600 text-white' :
                  'bg-gray-600 text-white'
                }`}>
                  {entry.rank}
                </div>
                
                <div>
                  <div className={`font-medium ${entry.name === 'Anda' ? 'text-electric-blue' : 'text-white'}`}>
                    {entry.name}
                  </div>
                  <div className="text-gray-400 text-xs">
                    🔥 {entry.streak} hari • 🏆 {entry.achievements} pencapaian
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-white font-bold">{entry.xp.toLocaleString()} XP</div>
                <div className="text-gray-400 text-xs">+{entry.weeklyXp} minggu ini</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function HeatmapView({ 
  activityHeatmap, 
  getIntensityColor, 
  formatTime 
}: {
  activityHeatmap: ActivityHeatmap[]
  getIntensityColor: (intensity: number) => string
  formatTime: (minutes: number) => string
}) {
  const weeks = []
  const today = new Date()
  
  // Generate 12 weeks of data (84 days)
  for (let week = 0; week < 12; week++) {
    const weekData = []
    for (let day = 0; day < 7; day++) {
      const date = new Date(today)
      date.setDate(date.getDate() - (11 - week) * 7 - (6 - day))
      const dateStr = date.toISOString().split('T')[0]
      const dayData = activityHeatmap.find(d => d.date === dateStr)
      
      weekData.push({
        date: dateStr,
        intensity: dayData?.intensity || 0,
        activities: dayData?.activities || 0,
        totalTime: dayData?.totalTime || 0
      })
    }
    weeks.push(weekData)
  }

  return (
    <div className="space-y-6">
      {/* Activity Heatmap */}
      <div className="glass-dark rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-electric-blue" />
          Peta Haba Aktiviti (12 minggu terakhir)
        </h3>
        
        <div className="space-y-4">
          {/* Day Labels */}
          <div className="flex">
            <div className="w-8"></div>
            <div className="flex-1 grid grid-cols-7 gap-1 text-xs text-gray-400">
              {['S', 'I', 'S', 'R', 'K', 'J', 'S'].map((day, index) => (
                <div key={index} className="text-center">{day}</div>
              ))}
            </div>
          </div>
          
          {/* Heatmap Grid */}
          <div className="space-y-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex items-center">
                <div className="w-8 text-xs text-gray-400">
                  {weekIndex % 4 === 0 && new Date(week[0].date).toLocaleDateString('ms-MY', { month: 'short' })}
                </div>
                <div className="flex-1 grid grid-cols-7 gap-1">
                  {week.map((day, dayIndex) => (
                    <div
                      key={dayIndex}
                      className={`w-3 h-3 rounded-sm cursor-pointer transition-all hover:ring-2 hover:ring-electric-blue/50 group relative ${
                        getIntensityColor(day.intensity)
                      }`}
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        <div>{new Date(day.date).toLocaleDateString('ms-MY')}</div>
                        <div>{day.activities} aktiviti</div>
                        <div>{formatTime(day.totalTime)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Kurang</span>
            <div className="flex items-center space-x-1">
              {[0, 1, 2, 3, 4].map(intensity => (
                <div key={intensity} className={`w-3 h-3 rounded-sm ${getIntensityColor(intensity)}`} />
              ))}
            </div>
            <span>Lebih</span>
          </div>
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="grid md:grid-cols-3 gap-6">
        {['Bulan Ini', 'Bulan Lalu', '3 Bulan Lalu'].map((period, index) => {
          const startDate = new Date()
          startDate.setMonth(startDate.getMonth() - index)
          startDate.setDate(1)
          
          const endDate = new Date(startDate)
          endDate.setMonth(endDate.getMonth() + 1)
          endDate.setDate(0)
          
          const monthData = activityHeatmap.filter(day => {
            const date = new Date(day.date)
            return date >= startDate && date <= endDate
          })
          
          const totalActivities = monthData.reduce((sum, day) => sum + day.activities, 0)
          const totalTime = monthData.reduce((sum, day) => sum + day.totalTime, 0)
          const activeDays = monthData.filter(day => day.intensity > 0).length
          
          return (
            <div key={index} className="glass-dark rounded-xl p-4">
              <h4 className="text-white font-semibold mb-3">{period}</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Hari Aktif</span>
                  <span className="text-white">{activeDays}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Jumlah Aktiviti</span>
                  <span className="text-white">{totalActivities}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Masa Belajar</span>
                  <span className="text-white">{formatTime(totalTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Konsistensi</span>
                  <span className="text-white">{Math.round((activeDays / monthData.length) * 100)}%</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SkillsProgressSection({ skillProgress }: { skillProgress: SkillProgress[] }) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'programming' | 'theory' | 'practice'>('all')
  
  const filteredSkills = selectedCategory === 'all' 
    ? skillProgress 
    : skillProgress.filter(skill => skill.category === selectedCategory)

  return (
    <div className="glass-dark rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Star className="w-5 h-5 mr-2 text-electric-blue" />
          Kemajuan Kemahiran Terperinci
        </h3>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as any)}
          className="px-3 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm"
        >
          <option value="all">Semua Kategori</option>
          <option value="programming">Programming</option>
          <option value="theory">Theory</option>
          <option value="practice">Practice</option>
        </select>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {filteredSkills.map((skill, index) => (
          <div key={index} className="p-4 bg-gray-800/30 rounded-lg">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="text-white font-medium">{skill.skill}</h4>
                <span className={`text-xs px-2 py-1 rounded mt-1 inline-block ${
                  skill.category === 'programming' ? 'bg-blue-500/20 text-blue-400' :
                  skill.category === 'theory' ? 'bg-purple-500/20 text-purple-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {skill.category}
                </span>
              </div>
              
              <div className="text-right">
                <div className="text-electric-blue font-bold">Level {skill.level}</div>
                <div className="text-gray-400 text-sm">{skill.xp}/{skill.maxXp} XP</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-electric-blue to-electric-blue/70 h-2 rounded-full transition-all"
                  style={{ width: `${(skill.xp / skill.maxXp) * 100}%` }}
                />
              </div>
              
              <div className="flex justify-between text-xs text-gray-400">
                <span>🔥 {skill.streak} hari streak</span>
                <span>Terakhir: {new Date(skill.lastActivity).toLocaleDateString('ms-MY')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function InsightsSection({ 
  learningData, 
  skillProgress, 
  totals 
}: {
  learningData: LearningData[]
  skillProgress: SkillProgress[]
  totals: any
}) {
  const insights = [
    {
      type: 'positive',
      icon: TrendingUp,
      title: 'Prestasi Meningkat!',
      description: `XP harian anda meningkat 23% berbanding minggu lepas. Teruskan momentum yang baik ini!`,
      action: 'Lihat trend terperinci'
    },
    {
      type: 'suggestion',
      icon: Target,
      title: 'Fokus pada Kemahiran Lemah',
      description: `Kemahiran "Database Design" perlu perhatian lebih. Cuba tumpukan 30 minit sehari untuk topik ini.`,
      action: 'Buat jadual belajar'
    },
    {
      type: 'achievement',
      icon: Award,
      title: 'Hampir Mencapai Matlamat!',
      description: `Anda tinggal 3 hari lagi untuk mencapai streak 20 hari. Jangan putus sekarang!`,
      action: 'Lihat progress streak'
    },
    {
      type: 'recommendation',
      icon: BookOpen,
      title: 'Cadangan Pembelajaran',
      description: `Berdasarkan kemajuan anda, topik "Advanced PHP" sesuai untuk dipelajari seterusnya.`,
      action: 'Jelajah topik'
    }
  ]

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white flex items-center">
        <Zap className="w-5 h-5 mr-2 text-electric-blue" />
        Insight & Cadangan
      </h3>
      
      <div className="grid md:grid-cols-2 gap-4">
        {insights.map((insight, index) => (
          <div key={index} className={`glass-dark rounded-xl p-4 border-l-4 ${
            insight.type === 'positive' ? 'border-green-400' :
            insight.type === 'suggestion' ? 'border-yellow-400' :
            insight.type === 'achievement' ? 'border-purple-400' :
            'border-blue-400'
          }`}>
            <div className="flex items-start space-x-3">
              <insight.icon className={`w-5 h-5 mt-0.5 ${
                insight.type === 'positive' ? 'text-green-400' :
                insight.type === 'suggestion' ? 'text-yellow-400' :
                insight.type === 'achievement' ? 'text-purple-400' :
                'text-blue-400'
              }`} />
              
              <div className="flex-1">
                <h4 className="text-white font-medium mb-1">{insight.title}</h4>
                <p className="text-gray-300 text-sm mb-3">{insight.description}</p>
                <button className="text-electric-blue hover:text-electric-blue/80 text-sm transition-colors">
                  {insight.action} →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Learning Recommendations */}
      <div className="glass-dark rounded-xl p-6">
        <h4 className="text-white font-semibold mb-4">Cadangan Pembelajaran Peribadi</h4>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-500/30">
            <h5 className="text-white font-medium mb-2">Topik Seterusnya</h5>
            <p className="text-gray-300 text-sm mb-3">Advanced PHP OOP</p>
            <div className="text-blue-400 text-xs">Berdasarkan kemajuan PHP anda</div>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-lg border border-green-500/30">
            <h5 className="text-white font-medium mb-2">Projek Praktikal</h5>
            <p className="text-gray-300 text-sm mb-3">Sistem Pengurusan Perpustakaan</p>
            <div className="text-green-400 text-xs">Sesuai dengan tahap kemahiran</div>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/30">
            <h5 className="text-white font-medium mb-2">Cabaran Mingguan</h5>
            <p className="text-gray-300 text-sm mb-3">Algorithm Sorting Challenge</p>
            <div className="text-yellow-400 text-xs">Tingkatkan skill problem solving</div>
          </div>
        </div>
      </div>
    </div>
  )
}
