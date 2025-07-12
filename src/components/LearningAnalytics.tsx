'use client'

import React, { useState, useEffect } from 'react'
import { 
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  Clock,
  Target,
  Award,
  Star,
  Activity,
  Brain,
  Zap,
  Eye,
  Calendar,
  Filter,
  Download,
  Share2,
  Settings,
  RefreshCw,
  Search,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus,
  CheckCircle,
  AlertTriangle,
  Info,
  HelpCircle,
  Lightbulb,
  Map,
  Globe,
  Monitor,
  Smartphone,
  Code,
  Video,
  FileText
} from 'lucide-react'
import { useNotifications } from './NotificationProvider'

interface LearningMetrics {
  totalLearners: number
  activeLearners: number
  completionRate: number
  averageScore: number
  totalTimeSpent: number
  skillsAcquired: number
  certificatesEarned: number
  retentionRate: number
}

interface SkillAnalytics {
  skillName: string
  totalLearners: number
  masteryRate: number
  averageTime: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  prerequisites: string[]
  proficiencyDistribution: {
    novice: number
    intermediate: number
    advanced: number
    expert: number
  }
}

interface LearningPath {
  id: string
  title: string
  description: string
  totalSteps: number
  completionRate: number
  averageRating: number
  enrollments: number
  timeToComplete: number
  successRate: number
  dropOffPoints: number[]
}

interface ContentAnalytics {
  id: string
  title: string
  type: 'video' | 'article' | 'quiz' | 'challenge' | 'tutorial'
  views: number
  completions: number
  averageRating: number
  engagement: number
  dropOffRate: number
  difficulty: string
  timeSpent: number
}

interface LearnerBehavior {
  sessionDuration: number[]
  preferredLearningTime: string[]
  deviceUsage: {
    desktop: number
    mobile: number
    tablet: number
  }
  learningPace: 'slow' | 'normal' | 'fast'
  engagementPattern: string
  strugglingTopics: string[]
}

interface PerformanceTrend {
  date: string
  completions: number
  newLearners: number
  activeLearners: number
  averageScore: number
  engagementRate: number
  retentionRate: number
}

interface AssessmentAnalytics {
  assessmentId: string
  title: string
  totalAttempts: number
  passRate: number
  averageScore: number
  averageTime: number
  difficultyRating: number
  commonMistakes: string[]
  improvementAreas: string[]
}

interface LearningObjective {
  id: string
  title: string
  description: string
  achievementRate: number
  averageAttempts: number
  timeToAchieve: number
  prerequisites: string[]
  nextSteps: string[]
}

interface PredictiveInsights {
  riskFactors: string[]
  successPredictors: string[]
  recommendedInterventions: string[]
  projectedOutcomes: {
    completionRate: number
    timeToCompletion: number
    skillMastery: number
  }
}

export function LearningAnalytics() {
  const [selectedView, setSelectedView] = useState<'overview' | 'skills' | 'paths' | 'content' | 'behavior' | 'assessment' | 'predictive'>('overview')
  const [timeRange, setTimeRange] = useState('30d')
  const [selectedMetric, setSelectedMetric] = useState('all')
  const [selectedSkill, setSelectedSkill] = useState('')
  const [selectedPath, setSelectedPath] = useState('')
  const [showDetails, setShowDetails] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('engagement')
  const [filterLevel, setFilterLevel] = useState('all')
  const [autoRefresh, setAutoRefresh] = useState(false)
  
  const { addNotification } = useNotifications()

  // Mock data
  const [learningMetrics, setLearningMetrics] = useState<LearningMetrics>({
    totalLearners: 15847,
    activeLearners: 3421,
    completionRate: 78.5,
    averageScore: 84.2,
    totalTimeSpent: 47829,
    skillsAcquired: 2847,
    certificatesEarned: 1256,
    retentionRate: 82.7
  })

  const skillAnalytics: SkillAnalytics[] = [
    {
      skillName: 'JavaScript Fundamentals',
      totalLearners: 2847,
      masteryRate: 74.2,
      averageTime: 24.5,
      difficulty: 'beginner',
      prerequisites: ['HTML Basics', 'CSS Basics'],
      proficiencyDistribution: {
        novice: 15,
        intermediate: 35,
        advanced: 35,
        expert: 15
      }
    },
    {
      skillName: 'React Development',
      totalLearners: 1923,
      masteryRate: 68.8,
      averageTime: 48.2,
      difficulty: 'intermediate',
      prerequisites: ['JavaScript Fundamentals', 'ES6+'],
      proficiencyDistribution: {
        novice: 25,
        intermediate: 40,
        advanced: 25,
        expert: 10
      }
    },
    {
      skillName: 'PHP Backend Development',
      totalLearners: 1654,
      masteryRate: 72.1,
      averageTime: 36.7,
      difficulty: 'intermediate',
      prerequisites: ['Programming Basics', 'Database Concepts'],
      proficiencyDistribution: {
        novice: 20,
        intermediate: 45,
        advanced: 25,
        expert: 10
      }
    },
    {
      skillName: 'Advanced Algorithms',
      totalLearners: 987,
      masteryRate: 56.3,
      averageTime: 72.4,
      difficulty: 'advanced',
      prerequisites: ['Data Structures', 'Math Fundamentals'],
      proficiencyDistribution: {
        novice: 40,
        intermediate: 35,
        advanced: 20,
        expert: 5
      }
    }
  ]

  const learningPaths: LearningPath[] = [
    {
      id: '1',
      title: 'Full Stack Web Development',
      description: 'Complete journey from frontend to backend development',
      totalSteps: 12,
      completionRate: 67.8,
      averageRating: 4.6,
      enrollments: 2847,
      timeToComplete: 120,
      successRate: 73.2,
      dropOffPoints: [3, 7, 10]
    },
    {
      id: '2',
      title: 'Data Science with Python',
      description: 'Learn data analysis, visualization, and machine learning',
      totalSteps: 15,
      completionRate: 59.3,
      averageRating: 4.8,
      enrollments: 1923,
      timeToComplete: 150,
      successRate: 68.9,
      dropOffPoints: [5, 9, 12]
    },
    {
      id: '3',
      title: 'Mobile App Development',
      description: 'Build mobile applications for iOS and Android',
      totalSteps: 10,
      completionRate: 71.2,
      averageRating: 4.4,
      enrollments: 1654,
      timeToComplete: 90,
      successRate: 76.1,
      dropOffPoints: [4, 8]
    }
  ]

  const contentAnalytics: ContentAnalytics[] = [
    {
      id: '1',
      title: 'Introduction to JavaScript',
      type: 'video',
      views: 8934,
      completions: 7245,
      averageRating: 4.7,
      engagement: 89.2,
      dropOffRate: 12.3,
      difficulty: 'Beginner',
      timeSpent: 25.4
    },
    {
      id: '2',
      title: 'React Hooks Deep Dive',
      type: 'tutorial',
      views: 5672,
      completions: 4234,
      averageRating: 4.8,
      engagement: 92.1,
      dropOffRate: 8.9,
      difficulty: 'Intermediate',
      timeSpent: 42.7
    },
    {
      id: '3',
      title: 'PHP Arrays Challenge',
      type: 'challenge',
      views: 4567,
      completions: 3891,
      averageRating: 4.5,
      engagement: 87.3,
      dropOffRate: 15.2,
      difficulty: 'Beginner',
      timeSpent: 18.6
    }
  ]

  const performanceTrends: PerformanceTrend[] = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    completions: 120 + Math.floor(Math.random() * 80),
    newLearners: 25 + Math.floor(Math.random() * 30),
    activeLearners: 450 + Math.floor(Math.random() * 200),
    averageScore: 75 + Math.random() * 20,
    engagementRate: 70 + Math.random() * 25,
    retentionRate: 80 + Math.random() * 15
  }))

  const assessmentAnalytics: AssessmentAnalytics[] = [
    {
      assessmentId: '1',
      title: 'JavaScript Fundamentals Quiz',
      totalAttempts: 2847,
      passRate: 78.3,
      averageScore: 82.7,
      averageTime: 15.4,
      difficultyRating: 3.2,
      commonMistakes: ['Variable scoping', 'Async/await usage', 'Array methods'],
      improvementAreas: ['Practice more array manipulation', 'Study closure concepts']
    },
    {
      assessmentId: '2',
      title: 'React Component Challenge',
      totalAttempts: 1923,
      passRate: 71.2,
      averageScore: 79.4,
      averageTime: 45.6,
      difficultyRating: 4.1,
      commonMistakes: ['State management', 'Props drilling', 'Component lifecycle'],
      improvementAreas: ['Practice state lifting', 'Learn context API']
    }
  ]

  const refreshData = async () => {
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Update metrics with slight variations
    setLearningMetrics(prev => ({
      ...prev,
      activeLearners: prev.activeLearners + Math.floor(Math.random() * 50) - 25,
      completionRate: prev.completionRate + (Math.random() * 2) - 1,
      averageScore: prev.averageScore + (Math.random() * 2) - 1
    }))
    
    setIsLoading(false)
    
    addNotification({
      type: 'success',
      title: '📊 Data Refreshed',
      message: 'Learning analytics have been updated'
    })
  }

  const exportReport = async () => {
    const reportData = {
      timeRange,
      generatedAt: new Date(),
      learningMetrics,
      skillAnalytics,
      learningPaths,
      contentAnalytics,
      performanceTrends: performanceTrends.slice(-7),
      assessmentAnalytics
    }

    const dataStr = JSON.stringify(reportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `learning-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`
    link.click()

    addNotification({
      type: 'success',
      title: '📊 Report Exported',
      message: 'Learning analytics report has been downloaded'
    })
  }

  const getEngagementColor = (engagement: number) => {
    if (engagement >= 90) return 'text-green-400'
    if (engagement >= 80) return 'text-yellow-400'
    if (engagement >= 70) return 'text-orange-400'
    return 'text-red-400'
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'text-green-400'
      case 'intermediate': return 'text-yellow-400'
      case 'advanced': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getTrendIcon = (value: number, isPositive = true) => {
    if (value > 0) {
      return isPositive ? 
        <ArrowUp className="w-4 h-4 text-green-400" /> : 
        <ArrowDown className="w-4 h-4 text-red-400" />
    } else if (value < 0) {
      return isPositive ? 
        <ArrowDown className="w-4 h-4 text-red-400" /> : 
        <ArrowUp className="w-4 h-4 text-green-400" />
    }
    return <Minus className="w-4 h-4 text-gray-400" />
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const formatTime = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)}m`
    if (hours < 24) return `${hours.toFixed(1)}h`
    return `${Math.round(hours / 24)}d`
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gradient mb-2">Learning Analytics</h2>
        <p className="text-gray-400">Comprehensive insights into learning patterns, progress, and outcomes</p>
      </div>

      {/* Controls */}
      <div className="glass-dark rounded-xl p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* View Selector */}
          <div className="flex items-center space-x-2">
            <Eye className="w-4 h-4 text-electric-blue" />
            <select
              value={selectedView}
              onChange={(e) => setSelectedView(e.target.value as any)}
              className="px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
            >
              <option value="overview">Overview</option>
              <option value="skills">Skills Analysis</option>
              <option value="paths">Learning Paths</option>
              <option value="content">Content Performance</option>
              <option value="behavior">Learner Behavior</option>
              <option value="assessment">Assessment Analytics</option>
              <option value="predictive">Predictive Insights</option>
            </select>
          </div>

          {/* Time Range */}
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-electric-blue" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 3 months</option>
              <option value="1y">Last year</option>
            </select>
          </div>

          {/* Metric Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-electric-blue" />
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
            >
              <option value="all">All Metrics</option>
              <option value="engagement">Engagement</option>
              <option value="completion">Completion</option>
              <option value="performance">Performance</option>
              <option value="retention">Retention</option>
            </select>
          </div>

          {/* Search */}
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-electric-blue" />
            <input
              type="text"
              placeholder="Search analytics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm w-48"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 ml-auto">
            <button
              onClick={refreshData}
              disabled={isLoading}
              className="p-2 text-gray-400 hover:text-electric-blue transition-colors disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={exportReport}
              className="p-2 text-gray-400 hover:text-electric-blue transition-colors"
              title="Export Report"
            >
              <Download className="w-4 h-4" />
            </button>

            <button className="p-2 text-gray-400 hover:text-electric-blue transition-colors">
              <Share2 className="w-4 h-4" />
            </button>

            <button className="p-2 text-gray-400 hover:text-electric-blue transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Overview Dashboard */}
      {selectedView === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="glass-dark rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Users className="w-8 h-8 text-electric-blue" />
                  <div>
                    <h3 className="text-white font-semibold">Total Learners</h3>
                    <p className="text-gray-400 text-sm">Registered students</p>
                  </div>
                </div>
                {getTrendIcon(8.2)}
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {formatNumber(learningMetrics.totalLearners)}
              </div>
              <div className="text-green-400 text-sm">+8.2% this month</div>
            </div>

            <div className="glass-dark rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Activity className="w-8 h-8 text-green-400" />
                  <div>
                    <h3 className="text-white font-semibold">Active Learners</h3>
                    <p className="text-gray-400 text-sm">Currently learning</p>
                  </div>
                </div>
                {getTrendIcon(5.7)}
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {formatNumber(learningMetrics.activeLearners)}
              </div>
              <div className="text-green-400 text-sm">+5.7% this week</div>
            </div>

            <div className="glass-dark rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Target className="w-8 h-8 text-yellow-400" />
                  <div>
                    <h3 className="text-white font-semibold">Completion Rate</h3>
                    <p className="text-gray-400 text-sm">Course success</p>
                  </div>
                </div>
                {getTrendIcon(2.1)}
              </div>
              <div className={`text-3xl font-bold mb-2 ${getEngagementColor(learningMetrics.completionRate)}`}>
                {learningMetrics.completionRate.toFixed(1)}%
              </div>
              <div className="text-green-400 text-sm">+2.1% improvement</div>
            </div>

            <div className="glass-dark rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Star className="w-8 h-8 text-purple-400" />
                  <div>
                    <h3 className="text-white font-semibold">Average Score</h3>
                    <p className="text-gray-400 text-sm">Performance rating</p>
                  </div>
                </div>
                {getTrendIcon(1.8)}
              </div>
              <div className={`text-3xl font-bold mb-2 ${getEngagementColor(learningMetrics.averageScore)}`}>
                {learningMetrics.averageScore.toFixed(1)}
              </div>
              <div className="text-green-400 text-sm">+1.8 points</div>
            </div>
          </div>

          {/* Performance Trends Chart */}
          <div className="glass-dark rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <LineChart className="w-5 h-5 mr-2 text-electric-blue" />
              Learning Performance Trends
            </h3>
            
            <div className="space-y-4">
              {/* Mock chart visualization */}
              <div className="grid grid-cols-7 gap-2 text-center text-xs text-gray-400 mb-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <div key={day}>{day}</div>
                ))}
              </div>
              
              {Array.from({ length: 4 }, (_, weekIndex) => (
                <div key={weekIndex} className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 7 }, (_, dayIndex) => {
                    const activity = 0.3 + Math.random() * 0.7
                    return (
                      <div
                        key={dayIndex}
                        className="h-8 rounded border border-gray-700 flex items-center justify-center text-xs"
                        style={{
                          backgroundColor: `rgba(59, 130, 246, ${activity})`,
                          color: activity > 0.5 ? 'white' : 'rgb(156, 163, 175)'
                        }}
                        title={`${Math.round(activity * 100)}% activity`}
                      >
                        {Math.round(activity * 100)}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="glass-dark rounded-xl p-6 text-center">
              <Clock className="w-12 h-12 text-electric-blue mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-1">
                {formatTime(learningMetrics.totalTimeSpent)}
              </div>
              <div className="text-gray-400 text-sm">Total Time Spent</div>
            </div>

            <div className="glass-dark rounded-xl p-6 text-center">
              <Brain className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-1">
                {formatNumber(learningMetrics.skillsAcquired)}
              </div>
              <div className="text-gray-400 text-sm">Skills Acquired</div>
            </div>

            <div className="glass-dark rounded-xl p-6 text-center">
              <Award className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-1">
                {formatNumber(learningMetrics.certificatesEarned)}
              </div>
              <div className="text-gray-400 text-sm">Certificates Earned</div>
            </div>

            <div className="glass-dark rounded-xl p-6 text-center">
              <TrendingUp className="w-12 h-12 text-purple-400 mx-auto mb-3" />
              <div className={`text-2xl font-bold mb-1 ${getEngagementColor(learningMetrics.retentionRate)}`}>
                {learningMetrics.retentionRate.toFixed(1)}%
              </div>
              <div className="text-gray-400 text-sm">Retention Rate</div>
            </div>
          </div>
        </div>
      )}

      {/* Skills Analysis */}
      {selectedView === 'skills' && (
        <div className="space-y-6">
          <div className="glass-dark rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <Brain className="w-5 h-5 mr-2 text-electric-blue" />
              Skills Mastery Analysis
            </h3>
            
            <div className="space-y-6">
              {skillAnalytics.map(skill => (
                <div key={skill.skillName} className="p-4 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-white text-lg">{skill.skillName}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span>{formatNumber(skill.totalLearners)} learners</span>
                        <span>•</span>
                        <span className={getDifficultyColor(skill.difficulty)}>{skill.difficulty}</span>
                        <span>•</span>
                        <span>{formatTime(skill.averageTime)} avg. time</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getEngagementColor(skill.masteryRate)}`}>
                        {skill.masteryRate.toFixed(1)}%
                      </div>
                      <div className="text-gray-400 text-sm">mastery rate</div>
                    </div>
                  </div>
                  
                  {/* Prerequisites */}
                  {skill.prerequisites.length > 0 && (
                    <div className="mb-4">
                      <span className="text-gray-400 text-sm">Prerequisites: </span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {skill.prerequisites.map(prereq => (
                          <span key={prereq} className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">
                            {prereq}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Proficiency Distribution */}
                  <div>
                    <div className="text-gray-400 text-sm mb-2">Proficiency Distribution:</div>
                    <div className="grid grid-cols-4 gap-4">
                      {Object.entries(skill.proficiencyDistribution).map(([level, percentage]) => (
                        <div key={level} className="text-center">
                          <div className="w-full bg-gray-700 rounded-full h-2 mb-1">
                            <div 
                              className={`h-2 rounded-full ${
                                level === 'novice' ? 'bg-red-400' :
                                level === 'intermediate' ? 'bg-yellow-400' :
                                level === 'advanced' ? 'bg-blue-400' :
                                'bg-green-400'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <div className="text-xs text-gray-400 capitalize">{level}</div>
                          <div className="text-xs text-white font-semibold">{percentage}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Learning Paths */}
      {selectedView === 'paths' && (
        <div className="space-y-6">
          <div className="glass-dark rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <Map className="w-5 h-5 mr-2 text-electric-blue" />
              Learning Paths Performance
            </h3>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {learningPaths.map(path => (
                <div key={path.id} className="p-6 bg-gray-800/50 rounded-lg">
                  <div className="mb-4">
                    <h4 className="font-semibold text-white text-lg mb-2">{path.title}</h4>
                    <p className="text-gray-400 text-sm">{path.description}</p>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Completion Rate:</span>
                      <span className={`font-semibold ${getEngagementColor(path.completionRate)}`}>
                        {path.completionRate.toFixed(1)}%
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Average Rating:</span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-white font-semibold">{path.averageRating}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Enrollments:</span>
                      <span className="text-white font-semibold">{formatNumber(path.enrollments)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Time to Complete:</span>
                      <span className="text-white font-semibold">{formatTime(path.timeToComplete)}</span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-700 rounded-full h-3 mb-3">
                    <div 
                      className="bg-electric-blue h-3 rounded-full"
                      style={{ width: `${path.completionRate}%` }}
                    />
                  </div>
                  
                  {/* Drop-off Points */}
                  <div className="text-xs text-gray-400">
                    Common drop-off at steps: {path.dropOffPoints.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content Performance */}
      {selectedView === 'content' && (
        <div className="space-y-6">
          <div className="glass-dark rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-electric-blue" />
              Content Performance Analytics
            </h3>
            
            <div className="space-y-4">
              {contentAnalytics.map(content => (
                <div key={content.id} className="p-4 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {content.type === 'video' && <Video className="w-6 h-6 text-red-400" />}
                      {content.type === 'tutorial' && <BookOpen className="w-6 h-6 text-blue-400" />}
                      {content.type === 'challenge' && <Code className="w-6 h-6 text-green-400" />}
                      {content.type === 'quiz' && <HelpCircle className="w-6 h-6 text-purple-400" />}
                      {content.type === 'article' && <FileText className="w-6 h-6 text-yellow-400" />}
                      
                      <div>
                        <h4 className="font-semibold text-white">{content.title}</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          <span className="capitalize">{content.type}</span>
                          <span>•</span>
                          <span className={getDifficultyColor(content.difficulty)}>{content.difficulty}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-white font-semibold">{content.averageRating}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Views:</span>
                      <div className="text-white font-semibold">{formatNumber(content.views)}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Completions:</span>
                      <div className="text-white font-semibold">{formatNumber(content.completions)}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Engagement:</span>
                      <div className={`font-semibold ${getEngagementColor(content.engagement)}`}>
                        {content.engagement.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">Avg. Time:</span>
                      <div className="text-white font-semibold">{formatTime(content.timeSpent)}</div>
                    </div>
                  </div>
                  
                  {/* Engagement Bar */}
                  <div className="mt-3">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-electric-blue h-2 rounded-full"
                        style={{ width: `${content.engagement}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Assessment Analytics */}
      {selectedView === 'assessment' && (
        <div className="space-y-6">
          <div className="glass-dark rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <Target className="w-5 h-5 mr-2 text-electric-blue" />
              Assessment Performance Analytics
            </h3>
            
            <div className="space-y-6">
              {assessmentAnalytics.map(assessment => (
                <div key={assessment.assessmentId} className="p-6 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-white text-lg">{assessment.title}</h4>
                      <p className="text-gray-400 text-sm">{formatNumber(assessment.totalAttempts)} total attempts</p>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getEngagementColor(assessment.passRate)}`}>
                        {assessment.passRate.toFixed(1)}%
                      </div>
                      <div className="text-gray-400 text-sm">pass rate</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-400">Average Score:</span>
                      <div className="text-white font-semibold">{assessment.averageScore.toFixed(1)}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Average Time:</span>
                      <div className="text-white font-semibold">{formatTime(assessment.averageTime)}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Difficulty:</span>
                      <div className="text-white font-semibold">{assessment.difficultyRating.toFixed(1)}/5</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Attempts:</span>
                      <div className="text-white font-semibold">{formatNumber(assessment.totalAttempts)}</div>
                    </div>
                  </div>
                  
                  {/* Common Mistakes */}
                  <div className="mb-4">
                    <h5 className="text-gray-400 text-sm mb-2">Common Mistakes:</h5>
                    <div className="flex flex-wrap gap-2">
                      {assessment.commonMistakes.map(mistake => (
                        <span key={mistake} className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">
                          {mistake}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Improvement Areas */}
                  <div>
                    <h5 className="text-gray-400 text-sm mb-2">Improvement Recommendations:</h5>
                    <div className="space-y-1">
                      {assessment.improvementAreas.map(area => (
                        <div key={area} className="flex items-center space-x-2 text-sm">
                          <Lightbulb className="w-4 h-4 text-yellow-400" />
                          <span className="text-gray-300">{area}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Other views placeholders */}
      {(selectedView === 'behavior' || selectedView === 'predictive') && (
        <div className="glass-dark rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">
            {selectedView === 'behavior' && 'Learner Behavior Analysis'}
            {selectedView === 'predictive' && 'Predictive Learning Insights'}
          </h3>
          <p className="text-gray-400">
            Advanced {selectedView} analytics coming soon...
          </p>
        </div>
      )}
    </div>
  )
}
