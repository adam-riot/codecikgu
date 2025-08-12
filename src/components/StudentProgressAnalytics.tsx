'use client'

import React, { useState, useEffect } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Clock, 
  Award, 
  Users, 
  BookOpen, 
  Code, 
  Calendar, 
  Filter, 
  Download, 
  Share2, 
  Eye, 
  ArrowUp, 
  ArrowDown, 
  Minus,
  RefreshCw,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Star,
  Zap,
  Brain,
  Heart,
  Trophy,
  Medal,
  Flame,
  LineChart,
  PieChart,
  Activity,
  Globe,
  MapPin,
  Smartphone,
  Monitor,
  ChevronLeft,
  ChevronRight,
  Settings,
  Bell
} from 'lucide-react'
import { useNotifications } from './NotificationProvider'

interface StudentData {
  id: string
  name: string
  avatar: string
  email: string
  joinedAt: Date
  lastActive: Date
  totalXP: number
  level: number
  streak: number
  completedChallenges: number
  totalSubmissions: number
  acceptedSubmissions: number
  studyHours: number
  badges: Badge[]
  skills: SkillProgress[]
  weeklyActivity: ActivityData[]
  monthlyProgress: MonthlyData[]
  strongAreas: string[]
  improvementAreas: string[]
  goals: Goal[]
  achievements: Achievement[]
}

interface SkillProgress {
  skill: string
  category: string
  level: number
  progress: number
  xpEarned: number
  timeSpent: number
  lastPracticed: Date
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  trend: 'up' | 'down' | 'stable'
}

interface ActivityData {
  date: string
  xpEarned: number
  timeSpent: number
  challengesCompleted: number
  lessonsWatched: number
  codeSubmissions: number
  socialInteractions: number
}

interface MonthlyData {
  month: string
  xpEarned: number
  challengesCompleted: number
  skillsImproved: number
  studyDays: number
  avgDailyTime: number
  rank: number
  improvement: number
}

interface Goal {
  id: string
  title: string
  description: string
  target: number
  current: number
  unit: string
  deadline: Date
  priority: 'low' | 'medium' | 'high'
  status: 'active' | 'completed' | 'paused'
  category: string
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlockedAt: Date
  xpReward: number
  category: string
}

interface Badge {
  id: string
  name: string
  icon: string
  description: string
  earnedAt: Date
  category: string
}

interface Insight {
  type: 'positive' | 'warning' | 'neutral'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  recommendation: string
}

export function StudentProgressAnalytics() {
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null)
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d')
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [selectedView, setSelectedView] = useState('overview')
  const [insights, setInsights] = useState<Insight[]>([])
  
  const { addNotification } = useNotifications()

  // Mock student data
  const mockStudents: StudentData[] = [
    {
      id: 'student-1',
      name: 'Ahmad Coding Prodigy',
      avatar: '👨‍💻',
      email: 'ahmad@codecikgu.com',
      joinedAt: new Date('2024-09-15'),
      lastActive: new Date(),
      totalXP: 15780,
      level: 23,
      streak: 47,
      completedChallenges: 156,
      totalSubmissions: 289,
      acceptedSubmissions: 245,
      studyHours: 127.5,
      badges: [
        { id: 'b1', name: 'Code Warrior', icon: '⚔️', description: '100 challenges completed', earnedAt: new Date('2024-12-01'), category: 'achievement' },
        { id: 'b2', name: 'Streak Master', icon: '🔥', description: '30-day study streak', earnedAt: new Date('2024-11-15'), category: 'consistency' }
      ],
      skills: [
        { skill: 'JavaScript', category: 'Programming', level: 8, progress: 75, xpEarned: 3250, timeSpent: 45.2, lastPracticed: new Date(), difficulty: 'intermediate', trend: 'up' },
        { skill: 'PHP', category: 'Programming', level: 6, progress: 60, xpEarned: 2100, timeSpent: 32.1, lastPracticed: new Date('2025-01-10'), difficulty: 'intermediate', trend: 'stable' },
        { skill: 'Data Structures', category: 'Computer Science', level: 7, progress: 80, xpEarned: 2800, timeSpent: 38.7, lastPracticed: new Date('2025-01-11'), difficulty: 'advanced', trend: 'up' },
        { skill: 'Algorithms', category: 'Computer Science', level: 5, progress: 45, xpEarned: 1650, timeSpent: 25.3, lastPracticed: new Date('2025-01-09'), difficulty: 'advanced', trend: 'down' }
      ],
      weeklyActivity: generateWeeklyActivity(),
      monthlyProgress: generateMonthlyProgress(),
      strongAreas: ['Problem Solving', 'Code Quality', 'Algorithm Design'],
      improvementAreas: ['Time Management', 'Testing', 'Documentation'],
      goals: [
        { id: 'g1', title: 'Master JavaScript', description: 'Reach level 10 in JavaScript', target: 10, current: 8, unit: 'level', deadline: new Date('2025-03-01'), priority: 'high', status: 'active', category: 'skill' },
        { id: 'g2', title: 'Complete 200 Challenges', description: 'Solve 200 coding challenges', target: 200, current: 156, unit: 'challenges', deadline: new Date('2025-02-15'), priority: 'medium', status: 'active', category: 'practice' }
      ],
      achievements: [
        { id: 'a1', title: 'First Steps', description: 'Complete your first challenge', icon: '👶', rarity: 'common', unlockedAt: new Date('2024-09-16'), xpReward: 100, category: 'milestone' },
        { id: 'a2', title: 'Speed Demon', description: 'Solve 10 challenges in one day', icon: '⚡', rarity: 'rare', unlockedAt: new Date('2024-11-20'), xpReward: 500, category: 'speed' }
      ]
    },
    {
      id: 'student-2',
      name: 'Siti Algorithm Expert',
      avatar: '👩‍💻',
      email: 'siti@codecikgu.com',
      joinedAt: new Date('2024-08-20'),
      lastActive: new Date('2025-01-11'),
      totalXP: 22340,
      level: 31,
      streak: 23,
      completedChallenges: 234,
      totalSubmissions: 387,
      acceptedSubmissions: 312,
      studyHours: 189.3,
      badges: [],
      skills: [],
      weeklyActivity: [],
      monthlyProgress: [],
      strongAreas: ['Algorithm Design', 'Mathematical Problem Solving', 'Optimization'],
      improvementAreas: ['UI/UX Design', 'Frontend Development', 'Communication'],
      goals: [],
      achievements: []
    },
    {
      id: 'student-3',
      name: 'Rahman Full Stack',
      avatar: '🧑‍💻',
      email: 'rahman@codecikgu.com',
      joinedAt: new Date('2024-10-01'),
      lastActive: new Date('2025-01-10'),
      totalXP: 11250,
      level: 18,
      streak: 12,
      completedChallenges: 89,
      totalSubmissions: 156,
      acceptedSubmissions: 134,
      studyHours: 78.2,
      badges: [],
      skills: [],
      weeklyActivity: [],
      monthlyProgress: [],
      strongAreas: ['Web Development', 'Database Design', 'API Development'],
      improvementAreas: ['Algorithms', 'Data Structures', 'Performance Optimization'],
      goals: [],
      achievements: []
    }
  ]

  function generateWeeklyActivity(): ActivityData[] {
    const data: ActivityData[] = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      data.push({
        date: date.toISOString().split('T')[0],
        xpEarned: Math.floor(Math.random() * 500) + 100,
        timeSpent: Math.floor(Math.random() * 180) + 30,
        challengesCompleted: Math.floor(Math.random() * 8),
        lessonsWatched: Math.floor(Math.random() * 5),
        codeSubmissions: Math.floor(Math.random() * 12),
        socialInteractions: Math.floor(Math.random() * 10)
      })
    }
    return data
  }

  function generateMonthlyProgress(): MonthlyData[] {
    const months = ['Sep 2024', 'Oct 2024', 'Nov 2024', 'Dec 2024', 'Jan 2025']
    return months.map((month, index) => ({
      month,
      xpEarned: 2500 + Math.floor(Math.random() * 1500),
      challengesCompleted: 25 + Math.floor(Math.random() * 20),
      skillsImproved: 2 + Math.floor(Math.random() * 4),
      studyDays: 20 + Math.floor(Math.random() * 8),
      avgDailyTime: 45 + Math.floor(Math.random() * 30),
      rank: Math.max(1, 50 - index * 8 + Math.floor(Math.random() * 10)),
      improvement: Math.floor(Math.random() * 30) - 10
    }))
  }

  useEffect(() => {
    setSelectedStudent(mockStudents[0])
    generateInsights()
  }, [])

  const generateInsights = () => {
    const studentInsights: Insight[] = [
      {
        type: 'positive',
        title: 'Consistent Learning Streak',
        description: 'Ahmad has maintained a 47-day learning streak, showing excellent consistency.',
        impact: 'high',
        recommendation: 'Continue current learning schedule to maintain momentum.'
      },
      {
        type: 'neutral',
        title: 'Algorithm Skills Need Attention',
        description: 'Algorithm skill level has decreased recently, indicating need for more practice.',
        impact: 'medium',
        recommendation: 'Allocate 30 minutes daily to algorithm practice and theory review.'
      },
      {
        type: 'positive',
        title: 'High Submission Accuracy',
        description: 'Maintains 84.8% acceptance rate on code submissions.',
        impact: 'high',
        recommendation: 'Challenge yourself with harder problems to continue growth.'
      },
      {
        type: 'warning',
        title: 'Goal Deadline Approaching',
        description: 'JavaScript mastery goal deadline is in 6 weeks with 20% remaining.',
        impact: 'medium',
        recommendation: 'Increase JavaScript practice frequency to meet deadline.'
      }
    ]
    setInsights(studentInsights)
  }

  const generateReport = async () => {
    setIsGeneratingReport(true)
    
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    const reportData = {
      student: selectedStudent,
      timeRange: selectedTimeRange,
      generatedAt: new Date(),
      metrics: {
        totalXP: selectedStudent?.totalXP || 0,
        challengesCompleted: selectedStudent?.completedChallenges || 0,
        studyHours: selectedStudent?.studyHours || 0,
        acceptanceRate: selectedStudent ? (selectedStudent.acceptedSubmissions / selectedStudent.totalSubmissions * 100).toFixed(1) : 0
      },
      insights: insights,
      recommendations: [
        'Focus on algorithm practice to improve problem-solving skills',
        'Maintain current study schedule for consistent progress',
        'Consider joining study groups for collaborative learning',
        'Set weekly goals to track short-term progress'
      ]
    }

    const dataStr = JSON.stringify(reportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `student-progress-report-${selectedStudent?.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`
    link.click()

    setIsGeneratingReport(false)
    
    addNotification({
      type: 'success',
      title: '📊 Report Generated',
      message: `Progress report for ${selectedStudent?.name} has been downloaded`
    })
  }

  const getSkillColor = (level: number) => {
    if (level >= 8) return 'text-purple-400'
    if (level >= 6) return 'text-blue-400'
    if (level >= 4) return 'text-green-400'
    return 'text-yellow-400'
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="w-4 h-4 text-green-400" />
      case 'down': return <ArrowDown className="w-4 h-4 text-red-400" />
      default: return <Minus className="w-4 h-4 text-gray-400" />
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive': return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />
      case 'neutral': return <Info className="w-5 h-5 text-blue-400" />
      default: return <Info className="w-5 h-5 text-gray-400" />
    }
  }

  if (!selectedStudent) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gradient mb-2">Student Progress Analytics</h2>
        <p className="text-gray-400">Comprehensive analytics and insights for student learning progress</p>
      </div>

      {/* Controls */}
      <div className="glass-dark rounded-xl p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Student Selector */}
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-electric-blue" />
            <select
              value={selectedStudent.id}
              onChange={(e) => {
                const student = mockStudents.find(s => s.id === e.target.value)
                setSelectedStudent(student || mockStudents[0])
              }}
              className="px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
            >
              {mockStudents.map(student => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
          </div>

          {/* Time Range */}
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-electric-blue" />
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 3 months</option>
              <option value="1y">Last year</option>
              <option value="all">All time</option>
            </select>
          </div>

          {/* View Selector */}
          <div className="flex items-center space-x-2">
            <Eye className="w-4 h-4 text-electric-blue" />
            <select
              value={selectedView}
              onChange={(e) => setSelectedView(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
            >
              <option value="overview">Overview</option>
              <option value="skills">Skills Analysis</option>
              <option value="activity">Activity Patterns</option>
              <option value="goals">Goals & Achievements</option>
              <option value="comparison">Class Comparison</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 ml-auto">
            <button
              onClick={generateReport}
              disabled={isGeneratingReport}
              className="px-4 py-2 bg-electric-blue text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {isGeneratingReport ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Generate Report</span>
                </>
              )}
            </button>

            <button
              className="p-2 text-gray-400 hover:text-electric-blue transition-colors"
              title="Share Analytics"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              className="p-2 text-gray-400 hover:text-electric-blue transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Student Profile Header */}
      <div className="glass-dark rounded-xl p-6 mb-6">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-electric-blue to-purple-600 flex items-center justify-center text-3xl">
            {selectedStudent.avatar}
          </div>
          
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-white mb-2">{selectedStudent.name}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Level:</span>
                <span className="text-white font-semibold ml-2">{selectedStudent.level}</span>
              </div>
              <div>
                <span className="text-gray-400">Total XP:</span>
                <span className="text-electric-blue font-semibold ml-2">{selectedStudent.totalXP.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-400">Streak:</span>
                <span className="text-orange-400 font-semibold ml-2">{selectedStudent.streak} days</span>
              </div>
              <div>
                <span className="text-gray-400">Study Hours:</span>
                <span className="text-green-400 font-semibold ml-2">{selectedStudent.studyHours}h</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-gray-400 text-sm">Last Active</div>
            <div className="text-white">{selectedStudent.lastActive.toLocaleDateString()}</div>
            <div className="text-gray-400 text-xs">
              {selectedStudent.lastActive.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Based on Selected View */}
      {selectedView === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Key Metrics */}
          <div className="lg:col-span-2 space-y-6">
            {/* Performance Metrics */}
            <div className="glass-dark rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-electric-blue" />
                Performance Metrics
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-electric-blue">
                    {selectedStudent.completedChallenges}
                  </div>
                  <div className="text-gray-400 text-sm">Challenges Completed</div>
                  <div className="text-green-400 text-xs mt-1">+12 this week</div>
                </div>
                
                <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">
                    {((selectedStudent.acceptedSubmissions / selectedStudent.totalSubmissions) * 100).toFixed(1)}%
                  </div>
                  <div className="text-gray-400 text-sm">Acceptance Rate</div>
                  <div className="text-green-400 text-xs mt-1">+2.3% this month</div>
                </div>
                
                <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400">
                    {selectedStudent.skills.length}
                  </div>
                  <div className="text-gray-400 text-sm">Skills Practiced</div>
                  <div className="text-blue-400 text-xs mt-1">JavaScript leading</div>
                </div>
                
                <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-400">
                    {Math.floor(selectedStudent.studyHours / selectedStudent.weeklyActivity.length)}h
                  </div>
                  <div className="text-gray-400 text-sm">Avg Daily Study</div>
                  <div className="text-green-400 text-xs mt-1">Above average</div>
                </div>
              </div>
            </div>

            {/* Weekly Activity Chart */}
            <div className="glass-dark rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-electric-blue" />
                Weekly Activity
              </h3>
              
              <div className="space-y-4">
                {selectedStudent.weeklyActivity.map((day, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-12 text-gray-400 text-sm">
                      {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-white text-sm">XP Earned</span>
                        <span className="text-electric-blue font-semibold">{day.xpEarned}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-electric-blue h-2 rounded-full"
                          style={{ width: `${(day.xpEarned / 500) * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="text-right text-sm">
                      <div className="text-gray-400">{day.timeSpent}m</div>
                      <div className="text-green-400">{day.challengesCompleted} ✓</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Insights & Recommendations */}
          <div className="space-y-6">
            {/* AI Insights */}
            <div className="glass-dark rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Brain className="w-5 h-5 mr-2 text-electric-blue" />
                AI Insights
              </h3>
              
              <div className="space-y-4">
                {insights.map((insight, index) => (
                  <div key={index} className="p-4 bg-gray-800/50 rounded-lg">
                    <div className="flex items-start space-x-3">
                      {getInsightIcon(insight.type)}
                      <div className="flex-1">
                        <h4 className="font-semibold text-white text-sm">{insight.title}</h4>
                        <p className="text-gray-400 text-xs mt-1">{insight.description}</p>
                        <div className="mt-2 text-xs text-electric-blue">{insight.recommendation}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Goals Progress */}
            <div className="glass-dark rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-electric-blue" />
                Active Goals
              </h3>
              
              <div className="space-y-4">
                {selectedStudent.goals.map(goal => (
                  <div key={goal.id} className="p-4 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-white text-sm">{goal.title}</h4>
                      <span className={`px-2 py-1 rounded text-xs ${
                        goal.priority === 'high' ? 'bg-red-600' :
                        goal.priority === 'medium' ? 'bg-yellow-600' :
                        'bg-gray-600'
                      }`}>
                        {goal.priority}
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                      <div 
                        className="bg-electric-blue h-2 rounded-full"
                        style={{ width: `${(goal.current / goal.target) * 100}%` }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">
                        {goal.current}/{goal.target} {goal.unit}
                      </span>
                      <span className="text-gray-400">
                        Due: {goal.deadline.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="glass-dark rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2 text-electric-blue" />
                Recent Achievements
              </h3>
              
              <div className="space-y-3">
                {selectedStudent.achievements.slice(-3).map(achievement => (
                  <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-white text-sm">{achievement.title}</div>
                      <div className="text-gray-400 text-xs">{achievement.description}</div>
                      <div className="text-electric-blue text-xs">+{achievement.xpReward} XP</div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {achievement.unlockedAt.toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedView === 'skills' && (
        <div className="space-y-6">
          {/* Skills Overview */}
          <div className="glass-dark rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <Code className="w-5 h-5 mr-2 text-electric-blue" />
              Skills Analysis
            </h3>
            
            <div className="grid gap-6 md:grid-cols-2">
              {selectedStudent.skills.map(skill => (
                <div key={skill.skill} className="p-4 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className={`font-semibold ${getSkillColor(skill.level)}`}>
                        {skill.skill}
                      </h4>
                      <p className="text-gray-400 text-sm">{skill.category}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-bold">Level {skill.level}</span>
                        {getTrendIcon(skill.trend)}
                      </div>
                      <div className="text-gray-400 text-xs">{skill.difficulty}</div>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                    <div 
                      className="bg-electric-blue h-2 rounded-full"
                      style={{ width: `${skill.progress}%` }}
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-gray-400">XP Earned</span>
                      <div className="text-electric-blue font-semibold">{skill.xpEarned}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Time Spent</span>
                      <div className="text-green-400 font-semibold">{skill.timeSpent}h</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Last Practice</span>
                      <div className="text-white">{skill.lastPracticed.toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Areas for Improvement */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="glass-dark rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-400" />
                Strong Areas
              </h3>
              
              <div className="space-y-3">
                {selectedStudent.strongAreas.map((area, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-green-900/20 border border-green-600/30 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-white">{area}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-dark rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-electric-blue" />
                Areas for Improvement
              </h3>
              
              <div className="space-y-3">
                {selectedStudent.improvementAreas.map((area, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-blue-900/20 border border-blue-600/30 rounded-lg">
                    <ArrowUp className="w-5 h-5 text-blue-400" />
                    <span className="text-white">{area}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Additional views can be implemented similarly */}
      {selectedView === 'activity' && (
        <div className="glass-dark rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Activity Patterns</h3>
          <p className="text-gray-400">Detailed activity pattern analysis coming soon...</p>
        </div>
      )}

      {selectedView === 'goals' && (
        <div className="glass-dark rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Goals & Achievements</h3>
          <p className="text-gray-400">Comprehensive goals and achievements view coming soon...</p>
        </div>
      )}

      {selectedView === 'comparison' && (
        <div className="glass-dark rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Class Comparison</h3>
          <p className="text-gray-400">Class performance comparison coming soon...</p>
        </div>
      )}
    </div>
  )
}
