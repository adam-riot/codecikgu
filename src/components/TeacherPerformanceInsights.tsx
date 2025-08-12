'use client'

import React, { useState } from 'react'
import { 
  User,
  Users,
  BookOpen,
  Award,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  Star,
  MessageSquare,
  Heart,
  Zap,
  Trophy,
  Medal,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  CheckCircle,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Plus,
  Minus,
  Filter,
  Search,
  Download,
  Share2,
  Settings,
  Eye,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Edit,
  MoreHorizontal,
  Bookmark,
  Flag,
  FileText,
  Video,
  Headphones,
  Image,
  Code,
  Lightbulb,
  Brain,
  Sparkles,
  Flame,
  Crown,
  Shield,
  RefreshCw
} from 'lucide-react'
import { useNotifications } from './NotificationProvider'

interface TeacherProfile {
  id: string
  name: string
  email: string
  avatar: string
  department: string
  joinDate: string
  status: 'active' | 'inactive' | 'on-leave'
  subjects: string[]
  totalStudents: number
  totalChallenges: number
  totalLessons: number
}

interface TeacherPerformance {
  teacherId: string
  overallRating: number
  totalRatings: number
  studentEngagement: number
  contentQuality: number
  responseTime: number
  completionRate: number
  improvementRate: number
  satisfactionScore: number
}

interface StudentFeedback {
  id: string
  studentId: string
  studentName: string
  teacherId: string
  rating: number
  comment: string
  date: string
  category: string
  isVerified: boolean
}

interface ContentMetrics {
  teacherId: string
  totalContent: number
  publishedContent: number
  draftContent: number
  avgViews: number
  avgRating: number
  totalCompletions: number
  popularContent: PopularContent[]
}

interface PopularContent {
  id: string
  title: string
  type: 'lesson' | 'challenge' | 'quiz' | 'video'
  views: number
  completions: number
  rating: number
  engagementTime: number
  difficulty: 'easy' | 'medium' | 'hard'
}

interface EngagementMetrics {
  teacherId: string
  averageResponseTime: number
  messagesSent: number
  questionsAnswered: number
  helpRequests: number
  forumParticipation: number
  liveSessionsHeld: number
  officeDamousours: number
}

interface TeacherComparison {
  category: string
  teacherScore: number
  departmentAverage: number
  schoolAverage: number
  improvement: number
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  type: 'performance' | 'engagement' | 'innovation' | 'leadership'
  earnedDate: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

interface ActivityLog {
  id: string
  teacherId: string
  action: string
  description: string
  timestamp: string
  category: 'content' | 'student' | 'system' | 'communication'
  metadata?: Record<string, unknown>
}

export function TeacherPerformanceInsights() {
  const [selectedTeacher, setSelectedTeacher] = useState<string>('')
  const [viewMode, setViewMode] = useState<'individual' | 'comparison' | 'department'>('individual')
  const [timeRange, setTimeRange] = useState('30d')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { addNotification } = useNotifications()

  // Mock data
  const teachers: TeacherProfile[] = [
    {
      id: '1',
      name: 'Dr. Sarah Ahmad',
      email: 'sarah.ahmad@school.edu',
      avatar: '👩‍🏫',
      department: 'Computer Science',
      joinDate: '2020-01-15',
      status: 'active',
      subjects: ['JavaScript', 'Python', 'Web Development'],
      totalStudents: 127,
      totalChallenges: 45,
      totalLessons: 89
    },
    {
      id: '2',
      name: 'Prof. Ahmad Rahman',
      email: 'ahmad.rahman@school.edu',
      avatar: '👨‍🏫',
      department: 'Computer Science',
      joinDate: '2019-08-20',
      status: 'active',
      subjects: ['PHP', 'Database', 'Backend Development'],
      totalStudents: 98,
      totalChallenges: 38,
      totalLessons: 67
    },
    {
      id: '3',
      name: 'Ms. Fatimah Ali',
      email: 'fatimah.ali@school.edu',
      avatar: '👩‍💼',
      department: 'Mathematics',
      joinDate: '2021-03-10',
      status: 'active',
      subjects: ['Algorithms', 'Data Structures', 'Logic'],
      totalStudents: 156,
      totalChallenges: 52,
      totalLessons: 94
    }
  ]

  const [teacherPerformance, setTeacherPerformance] = useState<TeacherPerformance[]>([
    {
      teacherId: '1',
      overallRating: 4.8,
      totalRatings: 127,
      studentEngagement: 89.2,
      contentQuality: 92.5,
      responseTime: 2.3,
      completionRate: 84.7,
      improvementRate: 12.3,
      satisfactionScore: 91.8
    },
    {
      teacherId: '2',
      overallRating: 4.6,
      totalRatings: 98,
      studentEngagement: 82.4,
      contentQuality: 88.9,
      responseTime: 3.1,
      completionRate: 79.2,
      improvementRate: 8.7,
      satisfactionScore: 87.3
    },
    {
      teacherId: '3',
      overallRating: 4.9,
      totalRatings: 156,
      studentEngagement: 94.1,
      contentQuality: 96.2,
      responseTime: 1.8,
      completionRate: 88.9,
      improvementRate: 15.6,
      satisfactionScore: 94.7
    }
  ])

  const studentFeedback: StudentFeedback[] = [
    {
      id: '1',
      studentId: 'st001',
      studentName: 'Ali Hassan',
      teacherId: '1',
      rating: 5,
      comment: 'Excellent explanations and very helpful with coding challenges. Always responds quickly to questions.',
      date: '2024-01-15',
      category: 'Teaching Quality',
      isVerified: true
    },
    {
      id: '2',
      studentId: 'st002',
      studentName: 'Siti Nurhaliza',
      teacherId: '1',
      rating: 5,
      comment: 'Dr. Sarah makes complex concepts easy to understand. Her interactive lessons are amazing!',
      date: '2024-01-14',
      category: 'Communication',
      isVerified: true
    },
    {
      id: '3',
      studentId: 'st003',
      studentName: 'Muhammad Irfan',
      teacherId: '2',
      rating: 4,
      comment: 'Good teacher but sometimes takes a bit long to respond to messages.',
      date: '2024-01-13',
      category: 'Responsiveness',
      isVerified: true
    }
  ]

  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'Top Rated Educator',
      description: 'Maintained 4.8+ rating for 3 consecutive months',
      icon: '🌟',
      type: 'performance',
      earnedDate: '2024-01-01',
      rarity: 'epic'
    },
    {
      id: '2',
      title: 'Student Engagement Champion',
      description: 'Achieved 90%+ student engagement rate',
      icon: '🚀',
      type: 'engagement',
      earnedDate: '2023-12-15',
      rarity: 'rare'
    },
    {
      id: '3',
      title: 'Innovation Leader',
      description: 'Created most innovative teaching content',
      icon: '💡',
      type: 'innovation',
      earnedDate: '2023-11-20',
      rarity: 'legendary'
    }
  ]

  const activityLog: ActivityLog[] = [
    {
      id: '1',
      teacherId: '1',
      action: 'Published new challenge',
      description: 'JavaScript Array Methods Challenge',
      timestamp: '2024-01-15T10:30:00Z',
      category: 'content'
    },
    {
      id: '2',
      teacherId: '1',
      action: 'Responded to student query',
      description: 'Helped student with loop implementation',
      timestamp: '2024-01-15T09:15:00Z',
      category: 'communication'
    },
    {
      id: '3',
      teacherId: '1',
      action: 'Updated lesson content',
      description: 'Improved React Hooks explanation',
      timestamp: '2024-01-14T16:45:00Z',
      category: 'content'
    }
  ]

  const getSelectedTeacherData = () => {
    if (!selectedTeacher) return null
    
    const teacher = teachers.find(t => t.id === selectedTeacher)
    const performance = teacherPerformance.find(p => p.teacherId === selectedTeacher)
    const feedback = studentFeedback.filter(f => f.teacherId === selectedTeacher)
    const activity = activityLog.filter(a => a.teacherId === selectedTeacher)
    
    return { teacher, performance, feedback, activity }
  }

  const generateReport = async () => {
    setIsLoading(true)
    
    const teacherData = getSelectedTeacherData()
    if (!teacherData) return
    
    const report = {
      teacher: teacherData.teacher,
      performance: teacherData.performance,
      feedback: teacherData.feedback,
      achievements: achievements,
      generatedAt: new Date(),
      timeRange
    }

    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const dataStr = JSON.stringify(report, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `teacher-performance-${teacherData.teacher?.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`
    link.click()

    addNotification({
      type: 'success',
      title: '📊 Report Generated',
      message: `Performance report for ${teacherData.teacher?.name} has been downloaded`
    })
    
    setIsLoading(false)
  }

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-400'
    if (score >= 80) return 'text-yellow-400'
    if (score >= 70) return 'text-orange-400'
    return 'text-red-400'
  }

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : i < rating 
            ? 'text-yellow-400 fill-current opacity-50'
            : 'text-gray-600'
        }`}
      />
    ))
  }

  const getTrendIcon = (value: number) => {
    if (value > 0) return <ArrowUp className="w-4 h-4 text-green-400" />
    if (value < 0) return <ArrowDown className="w-4 h-4 text-red-400" />
    return <Minus className="w-4 h-4 text-gray-400" />
  }

  const formatTime = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)}m`
    return `${hours.toFixed(1)}h`
  }

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         teacher.subjects.some(subject => subject.toLowerCase().includes(searchQuery.toLowerCase()))
    
    // const matchesDepartment = filterDepartment === 'all' || teacher.department === filterDepartment // This line was removed
    
    return matchesSearch
  })

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gradient mb-2">Teacher Performance Insights</h2>
        <p className="text-gray-400">Comprehensive analytics and feedback for teaching excellence</p>
      </div>

      {/* Controls */}
      <div className="glass-dark rounded-xl p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* View Mode */}
          <div className="flex items-center space-x-2">
            <Eye className="w-4 h-4 text-electric-blue" />
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as any)}
              className="px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
            >
              <option value="individual">Individual Analysis</option>
              <option value="comparison">Teacher Comparison</option>
              <option value="department">Department Overview</option>
            </select>
          </div>

          {/* Teacher Selection */}
          {viewMode === 'individual' && (
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-electric-blue" />
              <select
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                className="px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
              >
                <option value="">Select Teacher</option>
                {teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name} - {teacher.department}
                  </option>
                ))}
              </select>
            </div>
          )}

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

          {/* Search */}
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-electric-blue" />
            <input
              type="text"
              placeholder="Search teachers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm w-48"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 ml-auto">
            <button
              onClick={generateReport}
              disabled={!selectedTeacher || isLoading}
              className="px-4 py-2 bg-electric-blue text-black rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>Generate Report</span>
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

      {/* Individual Teacher Analysis */}
      {viewMode === 'individual' && selectedTeacher && (
        <div className="space-y-6">
          {(() => {
            const data = getSelectedTeacherData()
            if (!data?.teacher || !data?.performance) return null

            return (
              <>
                {/* Teacher Overview */}
                <div className="glass-dark rounded-xl p-6">
                  <div className="flex items-start space-x-6">
                    <div className="text-6xl">{data.teacher.avatar}</div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-1">{data.teacher.name}</h3>
                          <p className="text-gray-400 mb-2">{data.teacher.department}</p>
                          <p className="text-gray-500 text-sm">{data.teacher.email}</p>
                          
                          <div className="flex items-center space-x-4 mt-4">
                            <div className="flex items-center space-x-1">
                              {getRatingStars(data.performance.overallRating)}
                              <span className="text-white font-semibold ml-2">
                                {data.performance.overallRating.toFixed(1)}
                              </span>
                              <span className="text-gray-400 text-sm">
                                ({data.performance.totalRatings} reviews)
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            data.teacher.status === 'active' ? 'bg-green-500/20 text-green-400' :
                            data.teacher.status === 'inactive' ? 'bg-red-500/20 text-red-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {data.teacher.status.charAt(0).toUpperCase() + data.teacher.status.slice(1)}
                          </div>
                          
                          <div className="mt-4 text-sm text-gray-400">
                            Joined: {new Date(data.teacher.joinDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-6 mt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-electric-blue">{data.teacher.totalStudents}</div>
                          <div className="text-gray-400 text-sm">Students</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">{data.teacher.totalChallenges}</div>
                          <div className="text-gray-400 text-sm">Challenges</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-400">{data.teacher.totalLessons}</div>
                          <div className="text-gray-400 text-sm">Lessons</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <div className="glass-dark rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Users className="w-8 h-8 text-electric-blue" />
                        <div>
                          <h4 className="text-white font-semibold">Student Engagement</h4>
                          <p className="text-gray-400 text-sm">Average participation</p>
                        </div>
                      </div>
                      {getTrendIcon(5.2)}
                    </div>
                    <div className={`text-3xl font-bold mb-2 ${getPerformanceColor(data.performance.studentEngagement)}`}>
                      {data.performance.studentEngagement.toFixed(1)}%
                    </div>
                    <div className="text-green-400 text-sm">+5.2% this month</div>
                  </div>

                  <div className="glass-dark rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <BookOpen className="w-8 h-8 text-green-400" />
                        <div>
                          <h4 className="text-white font-semibold">Content Quality</h4>
                          <p className="text-gray-400 text-sm">Average rating</p>
                        </div>
                      </div>
                      {getTrendIcon(2.1)}
                    </div>
                    <div className={`text-3xl font-bold mb-2 ${getPerformanceColor(data.performance.contentQuality)}`}>
                      {data.performance.contentQuality.toFixed(1)}%
                    </div>
                    <div className="text-green-400 text-sm">+2.1% improvement</div>
                  </div>

                  <div className="glass-dark rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Clock className="w-8 h-8 text-yellow-400" />
                        <div>
                          <h4 className="text-white font-semibold">Response Time</h4>
                          <p className="text-gray-400 text-sm">Average hours</p>
                        </div>
                      </div>
                      {getTrendIcon(-0.8)}
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">
                      {formatTime(data.performance.responseTime)}
                    </div>
                    <div className="text-green-400 text-sm">-0.8h faster</div>
                  </div>

                  <div className="glass-dark rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Target className="w-8 h-8 text-purple-400" />
                        <div>
                          <h4 className="text-white font-semibold">Completion Rate</h4>
                          <p className="text-gray-400 text-sm">Student success</p>
                        </div>
                      </div>
                      {getTrendIcon(3.4)}
                    </div>
                    <div className={`text-3xl font-bold mb-2 ${getPerformanceColor(data.performance.completionRate)}`}>
                      {data.performance.completionRate.toFixed(1)}%
                    </div>
                    <div className="text-green-400 text-sm">+3.4% this week</div>
                  </div>
                </div>

                {/* Student Feedback */}
                <div className="glass-dark rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2 text-electric-blue" />
                    Recent Student Feedback
                  </h3>
                  
                  <div className="space-y-4">
                    {data.feedback.map(feedback => (
                      <div key={feedback.id} className="p-4 bg-gray-800/50 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-electric-blue rounded-full flex items-center justify-center text-black font-bold text-sm">
                              {feedback.studentName.charAt(0)}
                            </div>
                            <div>
                              <h5 className="font-semibold text-white">{feedback.studentName}</h5>
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-1">
                                  {getRatingStars(feedback.rating)}
                                </div>
                                <span className="text-gray-400 text-sm">•</span>
                                <span className="text-gray-400 text-sm">{feedback.category}</span>
                                {feedback.isVerified && (
                                  <>
                                    <span className="text-gray-400 text-sm">•</span>
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                    <span className="text-green-400 text-sm">Verified</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-gray-400 text-sm">
                            {new Date(feedback.date).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {feedback.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Achievements */}
                <div className="glass-dark rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                    <Trophy className="w-5 h-5 mr-2 text-electric-blue" />
                    Achievements & Recognition
                  </h3>
                  
                  <div className="grid gap-4 md:grid-cols-3">
                    {achievements.map(achievement => (
                      <div key={achievement.id} className={`p-4 rounded-lg border-2 ${
                        achievement.rarity === 'legendary' ? 'bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-500' :
                        achievement.rarity === 'epic' ? 'bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-500' :
                        achievement.rarity === 'rare' ? 'bg-gradient-to-r from-green-900/50 to-blue-900/50 border-green-500' :
                        'bg-gray-800/50 border-gray-600'
                      }`}>
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="text-3xl">{achievement.icon}</div>
                          <div>
                            <h4 className="font-semibold text-white">{achievement.title}</h4>
                            <p className="text-gray-400 text-sm capitalize">{achievement.type}</p>
                          </div>
                        </div>
                        
                        <p className="text-gray-300 text-sm mb-3">{achievement.description}</p>
                        
                        <div className="flex items-center justify-between text-xs">
                          <span className={`px-2 py-1 rounded-full ${
                            achievement.rarity === 'legendary' ? 'bg-purple-500/20 text-purple-400' :
                            achievement.rarity === 'epic' ? 'bg-blue-500/20 text-blue-400' :
                            achievement.rarity === 'rare' ? 'bg-green-500/20 text-green-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {achievement.rarity}
                          </span>
                          <span className="text-gray-400">
                            {new Date(achievement.earnedDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="glass-dark rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-electric-blue" />
                    Recent Activity
                  </h3>
                  
                  <div className="space-y-3">
                    {data.activity.map(activity => (
                      <div key={activity.id} className="flex items-center space-x-4 p-3 bg-gray-800/30 rounded-lg">
                        <div className={`w-3 h-3 rounded-full ${
                          activity.category === 'content' ? 'bg-blue-400' :
                          activity.category === 'communication' ? 'bg-green-400' :
                          activity.category === 'student' ? 'bg-purple-400' :
                          'bg-yellow-400'
                        }`} />
                        
                        <div className="flex-1">
                          <div className="font-semibold text-white text-sm">{activity.action}</div>
                          <div className="text-gray-400 text-sm">{activity.description}</div>
                        </div>
                        
                        <div className="text-gray-400 text-xs">
                          {new Date(activity.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )
          })()}
        </div>
      )}

      {/* Teacher Comparison View */}
      {viewMode === 'comparison' && (
        <div className="glass-dark rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-electric-blue" />
            Teacher Performance Comparison
          </h3>
          
          <div className="space-y-4">
            {filteredTeachers.map(teacher => {
              const performance = teacherPerformance.find(p => p.teacherId === teacher.id)
              if (!performance) return null
              
              return (
                <div key={teacher.id} className="p-4 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">{teacher.avatar}</div>
                      <div>
                        <h4 className="font-semibold text-white">{teacher.name}</h4>
                        <p className="text-gray-400 text-sm">{teacher.department}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="text-center">
                        <div className="text-yellow-400 font-semibold">{performance.overallRating.toFixed(1)}</div>
                        <div className="text-gray-400">Rating</div>
                      </div>
                      <div className="text-center">
                        <div className={`font-semibold ${getPerformanceColor(performance.studentEngagement)}`}>
                          {performance.studentEngagement.toFixed(1)}%
                        </div>
                        <div className="text-gray-400">Engagement</div>
                      </div>
                      <div className="text-center">
                        <div className={`font-semibold ${getPerformanceColor(performance.completionRate)}`}>
                          {performance.completionRate.toFixed(1)}%
                        </div>
                        <div className="text-gray-400">Completion</div>
                      </div>
                      <div className="text-center">
                        <div className="text-white font-semibold">{formatTime(performance.responseTime)}</div>
                        <div className="text-gray-400">Response</div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Department Overview */}
      {viewMode === 'department' && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="glass-dark rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Users className="w-8 h-8 text-electric-blue" />
                <div>
                  <h4 className="text-white font-semibold">Total Teachers</h4>
                  <p className="text-gray-400 text-sm">Active educators</p>
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-2">{teachers.length}</div>
              <div className="text-green-400 text-sm">All departments</div>
            </div>

            <div className="glass-dark rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Star className="w-8 h-8 text-yellow-400" />
                <div>
                  <h4 className="text-white font-semibold">Avg Rating</h4>
                  <p className="text-gray-400 text-sm">Overall performance</p>
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {(teacherPerformance.reduce((sum, p) => sum + p.overallRating, 0) / teacherPerformance.length).toFixed(1)}
              </div>
              <div className="text-green-400 text-sm">Excellent standard</div>
            </div>

            <div className="glass-dark rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Target className="w-8 h-8 text-green-400" />
                <div>
                  <h4 className="text-white font-semibold">Avg Completion</h4>
                  <p className="text-gray-400 text-sm">Student success rate</p>
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {(teacherPerformance.reduce((sum, p) => sum + p.completionRate, 0) / teacherPerformance.length).toFixed(1)}%
              </div>
              <div className="text-green-400 text-sm">Above target</div>
            </div>

            <div className="glass-dark rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <TrendingUp className="w-8 h-8 text-purple-400" />
                <div>
                  <h4 className="text-white font-semibold">Improvement</h4>
                  <p className="text-gray-400 text-sm">Monthly growth</p>
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {(teacherPerformance.reduce((sum, p) => sum + p.improvementRate, 0) / teacherPerformance.length).toFixed(1)}%
              </div>
              <div className="text-green-400 text-sm">Consistent growth</div>
            </div>
          </div>

          <div className="glass-dark rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Department Performance Overview</h3>
            <p className="text-gray-400">Detailed department analytics coming soon...</p>
          </div>
        </div>
      )}

      {/* No teacher selected */}
      {viewMode === 'individual' && !selectedTeacher && (
        <div className="glass-dark rounded-xl p-6 text-center">
          <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Select a Teacher</h3>
          <p className="text-gray-400">Choose a teacher from the dropdown above to view detailed performance insights</p>
        </div>
      )}
    </div>
  )
}
