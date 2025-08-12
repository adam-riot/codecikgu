'use client'

import React, { useState, useEffect } from 'react'
import { 
  BarChart3, 
  Users, 
  Clock, 
  Activity, 
  Target, 
  Book, 
  Download,
  Share2,
  RefreshCw,
  Settings,
  Eye,
  ArrowUp,
  ArrowDown,
  Minus,
  Globe,
  Smartphone,
  Monitor,
  Zap,
  Server,
  Calendar,
  Filter,
  Star
} from 'lucide-react'
import { useNotifications } from './NotificationProvider'

interface UsageMetrics {
  totalUsers: number
  activeUsers: number
  newUsers: number
  retentionRate: number
  avgSessionTime: number
  totalSessions: number
  bounceRate: number
  completionRate: number
}



interface ContentMetrics {
  totalChallenges: number
  completedChallenges: number
  avgAttempts: number
  successRate: number
  popularChallenges: PopularContent[]
  videoMetrics: VideoMetrics
  quizMetrics: QuizMetrics
}

interface PopularContent {
  id: string
  title: string
  type: 'challenge' | 'video' | 'quiz' | 'tutorial'
  views: number
  completions: number
  rating: number
  category: string
}

interface VideoMetrics {
  totalViews: number
  avgWatchTime: number
  completionRate: number
  engagement: number
  dropOffPoints: number[]
}

interface QuizMetrics {
  totalAttempts: number
  avgScore: number
  completionRate: number
  popularQuestions: string[]
  difficultyDistribution: Record<string, number>
}

interface SystemMetrics {
  serverUptime: number
  responseTime: number
  errorRate: number
  bandwidth: number
  storageUsed: number
  apiCalls: number
  cacheHitRate: number
}

interface GeographicData {
  country: string
  users: number
  sessions: number
  bounceRate: number
  avgSessionTime: number
}

interface DeviceData {
  device: string
  users: number
  percentage: number
  avgSessionTime: number
  bounceRate: number
}

interface PerformanceData {
  date: string
  pageLoadTime: number
  apiResponseTime: number
  errorCount: number
  userSatisfaction: number
}

export function UsageStatisticsDashboard() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d')



  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30) // seconds
  const [selectedView, setSelectedView] = useState('overview')

  const [isLoading, setIsLoading] = useState(false)
  const [showRealTime, setShowRealTime] = useState(false)

  const [selectedFilters, setSelectedFilters] = useState({
    userType: 'all',
    platform: 'all',
    region: 'all'
  })
  
  const { addNotification } = useNotifications()

  // Mock data
  const [usageMetrics, setUsageMetrics] = useState<UsageMetrics>({
    totalUsers: 15847,
    activeUsers: 3421,
    newUsers: 287,
    retentionRate: 78.5,
    avgSessionTime: 24.7,
    totalSessions: 8934,
    bounceRate: 23.1,
    completionRate: 67.8
  })

  const [contentMetrics] = useState<ContentMetrics>({
    totalChallenges: 456,
    completedChallenges: 12847,
    avgAttempts: 2.4,
    successRate: 73.2,
    popularChallenges: [
      { id: '1', title: 'JavaScript Basics', type: 'challenge', views: 3245, completions: 2876, rating: 4.8, category: 'Programming' },
      { id: '2', title: 'PHP Arrays', type: 'challenge', views: 2987, completions: 2234, rating: 4.6, category: 'Programming' },
      { id: '3', title: 'HTML Forms', type: 'tutorial', views: 2745, completions: 2456, rating: 4.7, category: 'Web Development' }
    ],
    videoMetrics: {
      totalViews: 23456,
      avgWatchTime: 8.7,
      completionRate: 65.4,
      engagement: 78.9,
      dropOffPoints: [12, 35, 67, 89]
    },
    quizMetrics: {
      totalAttempts: 15678,
      avgScore: 76.3,
      completionRate: 84.2,
      popularQuestions: ['What is a variable?', 'How do loops work?', 'What is an array?'],
      difficultyDistribution: { easy: 45, medium: 35, hard: 20 }
    }
  })

  const [systemMetrics] = useState<SystemMetrics>({
    serverUptime: 99.8,
    responseTime: 125,
    errorRate: 0.2,
    bandwidth: 2847,
    storageUsed: 67.3,
    apiCalls: 89347,
    cacheHitRate: 94.7
  })

  const geographicData: GeographicData[] = [
    { country: 'Malaysia', users: 8934, sessions: 23456, bounceRate: 21.2, avgSessionTime: 26.4 },
    { country: 'Singapore', users: 2345, sessions: 7890, bounceRate: 18.7, avgSessionTime: 28.9 },
    { country: 'Indonesia', users: 1876, sessions: 5432, bounceRate: 25.3, avgSessionTime: 22.1 },
    { country: 'Thailand', users: 1234, sessions: 3210, bounceRate: 24.8, avgSessionTime: 23.5 },
    { country: 'Philippines', users: 987, sessions: 2567, bounceRate: 26.1, avgSessionTime: 21.8 }
  ]

  const deviceData: DeviceData[] = [
    { device: 'Desktop', users: 7234, percentage: 45.6, avgSessionTime: 32.4, bounceRate: 18.2 },
    { device: 'Mobile', users: 6789, percentage: 42.8, avgSessionTime: 18.7, bounceRate: 28.3 },
    { device: 'Tablet', users: 1824, percentage: 11.5, avgSessionTime: 25.6, bounceRate: 22.1 }
  ]

  const performanceData: PerformanceData[] = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    pageLoadTime: 800 + Math.random() * 400,
    apiResponseTime: 100 + Math.random() * 100,
    errorCount: Math.floor(Math.random() * 10),
    userSatisfaction: 75 + Math.random() * 20
  }))

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        refreshData()
      }, refreshInterval * 1000)
      
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval])

  const refreshData = async () => {
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Update metrics with slight variations
    setUsageMetrics(prev => ({
      ...prev,
      activeUsers: prev.activeUsers + Math.floor(Math.random() * 20) - 10,
      totalSessions: prev.totalSessions + Math.floor(Math.random() * 50),
      avgSessionTime: prev.avgSessionTime + (Math.random() * 2) - 1
    }))
    
    setIsLoading(false)
  }

  const exportReport = async () => {
    const reportData = {
      timeRange: selectedTimeRange,
      generatedAt: new Date(),
      usageMetrics,
      contentMetrics,
      systemMetrics,
      geographicData,
      deviceData,
      performanceData: performanceData.slice(-7) // Last 7 days
    }

    const dataStr = JSON.stringify(reportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `usage-statistics-${selectedTimeRange}-${new Date().toISOString().split('T')[0]}.json`
    link.click()

    addNotification({
      type: 'success',
      title: '📊 Report Exported',
      message: 'Usage statistics report has been downloaded'
    })
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

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gradient mb-2">Usage Statistics Dashboard</h2>
        <p className="text-gray-400">Comprehensive analytics and insights for platform performance</p>
      </div>

      {/* Controls */}
      <div className="glass-dark rounded-xl p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Time Range */}
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-electric-blue" />
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
            >
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 3 months</option>
              <option value="1y">Last year</option>
              <option value="custom">Custom range</option>
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
              <option value="users">User Analytics</option>
              <option value="content">Content Performance</option>
              <option value="system">System Health</option>
              <option value="geographic">Geographic Analysis</option>
              <option value="devices">Device Analytics</option>
            </select>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-electric-blue" />
            <select
              value={selectedFilters.userType}
              onChange={(e) => setSelectedFilters({...selectedFilters, userType: e.target.value})}
              className="px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
            >
              <option value="all">All Users</option>
              <option value="students">Students</option>
              <option value="teachers">Teachers</option>
              <option value="admins">Administrators</option>
            </select>
          </div>

          {/* Auto Refresh */}
          <label className="flex items-center space-x-2 text-gray-300 text-sm">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            <span>Auto-refresh</span>
          </label>

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

            <button
              className="p-2 text-gray-400 hover:text-electric-blue transition-colors"
              title="Share Dashboard"
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

      {/* Real-time Status */}
      {showRealTime && (
        <div className="glass-dark rounded-xl p-4 mb-6 border border-green-600/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400 font-medium">Live Data</span>
              <span className="text-gray-400 text-sm">Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm">
              <div className="text-green-400">
                <span className="font-semibold">{usageMetrics.activeUsers}</span> active users
              </div>
              <div className="text-blue-400">
                <span className="font-semibold">{Math.floor(systemMetrics.responseTime)}ms</span> avg response
              </div>
              <div className="text-purple-400">
                <span className="font-semibold">{systemMetrics.serverUptime}%</span> uptime
              </div>
            </div>
          </div>
        </div>
      )}

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
                    <h3 className="text-white font-semibold">Total Users</h3>
                    <p className="text-gray-400 text-sm">Registered accounts</p>
                  </div>
                </div>
                {getTrendIcon(5.2)}
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {formatNumber(usageMetrics.totalUsers)}
              </div>
              <div className="text-green-400 text-sm">+5.2% from last month</div>
            </div>

            <div className="glass-dark rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Activity className="w-8 h-8 text-green-400" />
                  <div>
                    <h3 className="text-white font-semibold">Active Users</h3>
                    <p className="text-gray-400 text-sm">Daily active</p>
                  </div>
                </div>
                {getTrendIcon(3.1)}
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {formatNumber(usageMetrics.activeUsers)}
              </div>
              <div className="text-green-400 text-sm">+3.1% from yesterday</div>
            </div>

            <div className="glass-dark rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Clock className="w-8 h-8 text-yellow-400" />
                  <div>
                    <h3 className="text-white font-semibold">Avg Session</h3>
                    <p className="text-gray-400 text-sm">Minutes per session</p>
                  </div>
                </div>
                {getTrendIcon(1.8)}
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {usageMetrics.avgSessionTime.toFixed(1)}m
              </div>
              <div className="text-green-400 text-sm">+1.8% improvement</div>
            </div>

            <div className="glass-dark rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Target className="w-8 h-8 text-purple-400" />
                  <div>
                    <h3 className="text-white font-semibold">Completion Rate</h3>
                    <p className="text-gray-400 text-sm">Challenge success</p>
                  </div>
                </div>
                {getTrendIcon(-0.5, false)}
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {usageMetrics.completionRate.toFixed(1)}%
              </div>
              <div className="text-red-400 text-sm">-0.5% this week</div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* User Activity Chart */}
            <div className="glass-dark rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-electric-blue" />
                User Activity Trends
              </h3>
              
              <div className="space-y-4">
                {/* Mock chart data */}
                {Array.from({ length: 7 }, (_, i) => {
                  const day = new Date()
                  day.setDate(day.getDate() - (6 - i))
                  const activity = 2000 + Math.floor(Math.random() * 1500)
                  
                  return (
                    <div key={i} className="flex items-center space-x-4">
                      <div className="w-12 text-gray-400 text-sm">
                        {day.toLocaleDateString('en', { weekday: 'short' })}
                      </div>
                      <div className="flex-1">
                        <div className="w-full bg-gray-700 rounded-full h-3">
                          <div 
                            className="bg-electric-blue h-3 rounded-full"
                            style={{ width: `${(activity / 3500) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="w-16 text-right text-white text-sm font-semibold">
                        {formatNumber(activity)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Content Performance */}
            <div className="glass-dark rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Book className="w-5 h-5 mr-2 text-electric-blue" />
                Popular Content
              </h3>
              
              <div className="space-y-4">
                {contentMetrics.popularChallenges.map((content, index) => (
                  <div key={content.id} className="flex items-center space-x-4 p-3 bg-gray-800/50 rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-yellow-500 text-black' :
                      index === 1 ? 'bg-gray-400 text-black' :
                      index === 2 ? 'bg-amber-600 text-black' :
                      'bg-gray-600 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    
                    <div className="flex-1">
                      <div className="font-semibold text-white text-sm">{content.title}</div>
                      <div className="text-gray-400 text-xs">{content.category}</div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-electric-blue font-semibold text-sm">
                        {formatNumber(content.views)}
                      </div>
                      <div className="text-gray-400 text-xs">views</div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="text-yellow-400 text-xs">{content.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* System Health */}
          <div className="glass-dark rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Server className="w-5 h-5 mr-2 text-electric-blue" />
              System Health
            </h3>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">
                  {systemMetrics.serverUptime}%
                </div>
                <div className="text-gray-400 text-sm">Server Uptime</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  {systemMetrics.responseTime}ms
                </div>
                <div className="text-gray-400 text-sm">Avg Response Time</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400 mb-1">
                  {systemMetrics.errorRate}%
                </div>
                <div className="text-gray-400 text-sm">Error Rate</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400 mb-1">
                  {systemMetrics.cacheHitRate}%
                </div>
                <div className="text-gray-400 text-sm">Cache Hit Rate</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Geographic Analysis */}
      {selectedView === 'geographic' && (
        <div className="space-y-6">
          <div className="glass-dark rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <Globe className="w-5 h-5 mr-2 text-electric-blue" />
              Geographic Distribution
            </h3>
            
            <div className="space-y-4">
              {geographicData.map((country) => (
                <div key={country.country} className="p-4 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">🌍</span>
                      <div>
                        <h4 className="font-semibold text-white">{country.country}</h4>
                        <p className="text-gray-400 text-sm">{formatNumber(country.users)} users</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-electric-blue font-semibold">
                        {formatNumber(country.sessions)}
                      </div>
                      <div className="text-gray-400 text-sm">sessions</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Avg Session:</span>
                      <div className="text-white font-semibold">{country.avgSessionTime.toFixed(1)}m</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Bounce Rate:</span>
                      <div className="text-white font-semibold">{country.bounceRate.toFixed(1)}%</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Growth:</span>
                      <div className="text-green-400 font-semibold">+{(Math.random() * 10).toFixed(1)}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Device Analytics */}
      {selectedView === 'devices' && (
        <div className="space-y-6">
          <div className="glass-dark rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <Monitor className="w-5 h-5 mr-2 text-electric-blue" />
              Device Analytics
            </h3>
            
            <div className="grid gap-6 md:grid-cols-3">
              {deviceData.map(device => (
                <div key={device.device} className="p-4 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center space-x-3 mb-4">
                    {device.device === 'Desktop' && <Monitor className="w-8 h-8 text-blue-400" />}
                    {device.device === 'Mobile' && <Smartphone className="w-8 h-8 text-green-400" />}
                    {device.device === 'Tablet' && <Smartphone className="w-8 h-8 text-purple-400" />}
                    <div>
                      <h4 className="font-semibold text-white">{device.device}</h4>
                      <p className="text-gray-400 text-sm">{device.percentage}% of users</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Users:</span>
                      <span className="text-white font-semibold">{formatNumber(device.users)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Avg Session:</span>
                      <span className="text-white font-semibold">{device.avgSessionTime.toFixed(1)}m</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Bounce Rate:</span>
                      <span className="text-white font-semibold">{device.bounceRate.toFixed(1)}%</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-electric-blue h-2 rounded-full"
                      style={{ width: `${device.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Additional views can be implemented similarly */}
      {(selectedView === 'users' || selectedView === 'content' || selectedView === 'system') && (
        <div className="glass-dark rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">
            {selectedView === 'users' && 'User Analytics'}
            {selectedView === 'content' && 'Content Performance'}
            {selectedView === 'system' && 'System Health'}
          </h3>
          <p className="text-gray-400">
            Detailed {selectedView} analytics view coming soon...
          </p>
        </div>
      )}
    </div>
  )
}
