'use client'

import React, { useState, useEffect } from 'react'
import { 
  Route, 
  MapPin, 
  Target, 
  Star, 
  Clock, 
  BookOpen, 
  Code, 
  Video, 
  Award, 
  TrendingUp, 
  Brain, 
  Zap, 
  Heart,
  CheckCircle,
  Circle,
  Lock,
  Unlock,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  Play,
  Pause,
  RotateCcw,
  Filter,
  Search,
  Settings,
  Share2,
  Download,
  Bell,
  Info,
  AlertTriangle,
  Lightbulb,
  Globe,
  Users,
  Calendar,
  Trophy,
  Medal,
  Flag,
  Compass,
  Map,
  Navigation,
  Bookmark,
  Eye,
  ThumbsUp,
  MessageSquare,
  ChevronRight,
  ChevronDown,
  Plus,
  Minus,
  RefreshCw
} from 'lucide-react'
import { useNotifications } from './NotificationProvider'

interface LearningPath {
  id: string
  title: string
  description: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  estimatedHours: number
  completionRate: number
  popularity: number
  rating: number
  totalSteps: number
  completedSteps: number
  prerequisites: string[]
  outcomes: string[]
  skills: string[]
  tags: string[]
  instructor: string
  lastUpdated: Date
  isRecommended: boolean
  isEnrolled: boolean
  isFavorited: boolean
  progress: PathProgress
  steps: LearningStep[]
  reviews: Review[]
}

interface LearningStep {
  id: string
  title: string
  description: string
  type: 'video' | 'reading' | 'coding' | 'quiz' | 'project' | 'assessment'
  duration: number
  isCompleted: boolean
  isLocked: boolean
  difficulty: number
  xpReward: number
  resources: Resource[]
  prerequisites: string[]
  content?: string
  videoUrl?: string
  codeTemplate?: string
  quizQuestions?: QuizQuestion[]
}

interface Resource {
  id: string
  title: string
  type: 'pdf' | 'link' | 'code' | 'tool' | 'book'
  url: string
  description: string
  isRequired: boolean
}

interface QuizQuestion {
  id: string
  question: string
  type: 'multiple' | 'true-false' | 'code' | 'fill-blank'
  options?: string[]
  correctAnswer: string | number
  explanation: string
  difficulty: number
}

interface PathProgress {
  currentStep: number
  completedSteps: number[]
  timeSpent: number
  xpEarned: number
  startedAt: Date
  lastAccessed: Date
  estimatedCompletion: Date
  averageSessionTime: number
  streak: number
}

interface Review {
  id: string
  userId: string
  userName: string
  userAvatar: string
  rating: number
  comment: string
  createdAt: Date
  helpful: number
}

interface Recommendation {
  pathId: string
  reason: string
  confidence: number
  type: 'skill-gap' | 'interest-based' | 'career-path' | 'trending' | 'peer-recommended'
  priority: 'high' | 'medium' | 'low'
}

export function LearningPathRecommendations() {
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([])
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [filter, setFilter] = useState({
    category: 'all',
    difficulty: 'all',
    duration: 'all',
    status: 'all'
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('recommended')
  const [showOnlyRecommended, setShowOnlyRecommended] = useState(true)
  const [currentView, setCurrentView] = useState('paths') // 'paths', 'enrolled', 'favorites'
  const [selectedCategory, setSelectedCategory] = useState('all')
  
  const { addNotification } = useNotifications()

  // Mock learning paths data
  const mockPaths: LearningPath[] = [
    {
      id: 'path-1',
      title: 'Complete JavaScript Mastery',
      description: 'Master JavaScript from basics to advanced concepts including ES6+, async programming, and modern frameworks',
      category: 'Programming Languages',
      difficulty: 'intermediate',
      estimatedHours: 45,
      completionRate: 78,
      popularity: 95,
      rating: 4.8,
      totalSteps: 12,
      completedSteps: 7,
      prerequisites: ['Basic HTML', 'Basic CSS'],
      outcomes: ['Build modern web applications', 'Understand async programming', 'Master DOM manipulation'],
      skills: ['JavaScript', 'ES6+', 'Async/Await', 'DOM', 'APIs'],
      tags: ['popular', 'in-demand', 'web-development'],
      instructor: 'Ahmad JavaScript Expert',
      lastUpdated: new Date('2025-01-10'),
      isRecommended: true,
      isEnrolled: true,
      isFavorited: false,
      progress: {
        currentStep: 7,
        completedSteps: [0, 1, 2, 3, 4, 5, 6],
        timeSpent: 28.5,
        xpEarned: 2450,
        startedAt: new Date('2024-12-01'),
        lastAccessed: new Date('2025-01-11'),
        estimatedCompletion: new Date('2025-02-15'),
        averageSessionTime: 65,
        streak: 12
      },
      steps: generateMockSteps(12, 'JavaScript'),
      reviews: generateMockReviews()
    },
    {
      id: 'path-2',
      title: 'PHP Backend Development',
      description: 'Learn PHP for backend development, including MySQL integration, RESTful APIs, and security best practices',
      category: 'Backend Development',
      difficulty: 'intermediate',
      estimatedHours: 38,
      completionRate: 85,
      popularity: 82,
      rating: 4.6,
      totalSteps: 10,
      completedSteps: 0,
      prerequisites: ['Basic Programming Concepts'],
      outcomes: ['Build secure web APIs', 'Database integration', 'Authentication systems'],
      skills: ['PHP', 'MySQL', 'RESTful APIs', 'Security', 'Authentication'],
      tags: ['backend', 'server-side', 'database'],
      instructor: 'Siti PHP Specialist',
      lastUpdated: new Date('2025-01-08'),
      isRecommended: true,
      isEnrolled: false,
      isFavorited: true,
      progress: {
        currentStep: 0,
        completedSteps: [],
        timeSpent: 0,
        xpEarned: 0,
        startedAt: new Date(),
        lastAccessed: new Date(),
        estimatedCompletion: new Date('2025-03-01'),
        averageSessionTime: 0,
        streak: 0
      },
      steps: generateMockSteps(10, 'PHP'),
      reviews: generateMockReviews()
    },
    {
      id: 'path-3',
      title: 'Data Structures & Algorithms',
      description: 'Master fundamental data structures and algorithms essential for competitive programming and technical interviews',
      category: 'Computer Science',
      difficulty: 'advanced',
      estimatedHours: 60,
      completionRate: 65,
      popularity: 88,
      rating: 4.9,
      totalSteps: 15,
      completedSteps: 3,
      prerequisites: ['Programming Fundamentals', 'Mathematical Thinking'],
      outcomes: ['Solve complex algorithmic problems', 'Optimize code performance', 'Pass technical interviews'],
      skills: ['Algorithms', 'Data Structures', 'Problem Solving', 'Optimization', 'Complexity Analysis'],
      tags: ['algorithms', 'interview-prep', 'competitive-programming'],
      instructor: 'Dr. Rahman Algorithm',
      lastUpdated: new Date('2025-01-05'),
      isRecommended: true,
      isEnrolled: true,
      isFavorited: true,
      progress: {
        currentStep: 3,
        completedSteps: [0, 1, 2],
        timeSpent: 18.2,
        xpEarned: 1200,
        startedAt: new Date('2024-12-15'),
        lastAccessed: new Date('2025-01-09'),
        estimatedCompletion: new Date('2025-04-01'),
        averageSessionTime: 90,
        streak: 5
      },
      steps: generateMockSteps(15, 'Algorithms'),
      reviews: generateMockReviews()
    },
    {
      id: 'path-4',
      title: 'React Frontend Development',
      description: 'Build modern, responsive web applications with React, including hooks, state management, and deployment',
      category: 'Frontend Development',
      difficulty: 'intermediate',
      estimatedHours: 42,
      completionRate: 72,
      popularity: 91,
      rating: 4.7,
      totalSteps: 11,
      completedSteps: 0,
      prerequisites: ['JavaScript Fundamentals', 'HTML/CSS'],
      outcomes: ['Build React applications', 'State management', 'Modern development workflow'],
      skills: ['React', 'JSX', 'Hooks', 'State Management', 'Component Design'],
      tags: ['frontend', 'react', 'modern-web'],
      instructor: 'Farah React Pro',
      lastUpdated: new Date('2025-01-07'),
      isRecommended: false,
      isEnrolled: false,
      isFavorited: false,
      progress: {
        currentStep: 0,
        completedSteps: [],
        timeSpent: 0,
        xpEarned: 0,
        startedAt: new Date(),
        lastAccessed: new Date(),
        estimatedCompletion: new Date('2025-03-15'),
        averageSessionTime: 0,
        streak: 0
      },
      steps: generateMockSteps(11, 'React'),
      reviews: generateMockReviews()
    },
    {
      id: 'path-5',
      title: 'Database Design & SQL Mastery',
      description: 'Learn database design principles, advanced SQL queries, and database optimization techniques',
      category: 'Database',
      difficulty: 'intermediate',
      estimatedHours: 35,
      completionRate: 80,
      popularity: 75,
      rating: 4.5,
      totalSteps: 9,
      completedSteps: 0,
      prerequisites: ['Basic Programming'],
      outcomes: ['Design efficient databases', 'Write complex SQL queries', 'Optimize database performance'],
      skills: ['SQL', 'Database Design', 'Query Optimization', 'Normalization', 'Indexing'],
      tags: ['database', 'sql', 'backend'],
      instructor: 'Prof. Hassan Database',
      lastUpdated: new Date('2025-01-06'),
      isRecommended: true,
      isEnrolled: false,
      isFavorited: false,
      progress: {
        currentStep: 0,
        completedSteps: [],
        timeSpent: 0,
        xpEarned: 0,
        startedAt: new Date(),
        lastAccessed: new Date(),
        estimatedCompletion: new Date('2025-02-28'),
        averageSessionTime: 0,
        streak: 0
      },
      steps: generateMockSteps(9, 'Database'),
      reviews: generateMockReviews()
    }
  ]

  function generateMockSteps(count: number, subject: string): LearningStep[] {
    const stepTypes = ['video', 'reading', 'coding', 'quiz', 'project'] as const
    const steps: LearningStep[] = []
    
    for (let i = 0; i < count; i++) {
      const type = stepTypes[Math.floor(Math.random() * stepTypes.length)]
      steps.push({
        id: `step-${i}`,
        title: `${subject} - ${type === 'video' ? 'Video Lesson' : type === 'reading' ? 'Reading Material' : type === 'coding' ? 'Coding Exercise' : type === 'quiz' ? 'Knowledge Check' : 'Project Work'} ${i + 1}`,
        description: `Learn ${subject} concepts through ${type} activities`,
        type,
        duration: Math.floor(Math.random() * 90) + 30,
        isCompleted: i < Math.floor(count * 0.4),
        isLocked: i > Math.floor(count * 0.4),
        difficulty: Math.floor(Math.random() * 5) + 1,
        xpReward: Math.floor(Math.random() * 200) + 100,
        resources: [],
        prerequisites: i === 0 ? [] : [`step-${i - 1}`]
      })
    }
    
    return steps
  }

  function generateMockReviews(): Review[] {
    return [
      {
        id: 'review-1',
        userId: 'user-1',
        userName: 'Ahmad Learner',
        userAvatar: '👨‍🎓',
        rating: 5,
        comment: 'Excellent path! Very comprehensive and well-structured. The projects really help solidify the concepts.',
        createdAt: new Date('2025-01-10'),
        helpful: 12
      },
      {
        id: 'review-2',
        userId: 'user-2',
        userName: 'Siti Coder',
        userAvatar: '👩‍💻',
        rating: 4,
        comment: 'Great content but could use more practical examples. Overall very helpful for learning.',
        createdAt: new Date('2025-01-08'),
        helpful: 8
      }
    ]
  }

  useEffect(() => {
    setLearningPaths(mockPaths)
    generateRecommendations()
  }, [])

  const generateRecommendations = () => {
    const recs: Recommendation[] = [
      {
        pathId: 'path-1',
        reason: 'Based on your strong progress in JavaScript fundamentals',
        confidence: 95,
        type: 'skill-gap',
        priority: 'high'
      },
      {
        pathId: 'path-3',
        reason: 'Essential for competitive programming and technical interviews',
        confidence: 88,
        type: 'career-path',
        priority: 'high'
      },
      {
        pathId: 'path-2',
        reason: 'Complements your frontend skills with backend knowledge',
        confidence: 82,
        type: 'skill-gap',
        priority: 'medium'
      },
      {
        pathId: 'path-5',
        reason: 'Trending among your peers and highly rated',
        confidence: 75,
        type: 'trending',
        priority: 'medium'
      }
    ]
    setRecommendations(recs)
  }

  const enrollInPath = (pathId: string) => {
    setLearningPaths(prev => prev.map(path => 
      path.id === pathId 
        ? { ...path, isEnrolled: true, progress: { ...path.progress, startedAt: new Date() } }
        : path
    ))
    
    addNotification({
      type: 'success',
      title: '🎓 Enrolled Successfully!',
      message: 'You have been enrolled in the learning path'
    })
  }

  const toggleFavorite = (pathId: string) => {
    setLearningPaths(prev => prev.map(path => 
      path.id === pathId 
        ? { ...path, isFavorited: !path.isFavorited }
        : path
    ))
    
    const path = learningPaths.find(p => p.id === pathId)
    addNotification({
      type: 'info',
      title: path?.isFavorited ? '💔 Removed from Favorites' : '❤️ Added to Favorites',
      message: path?.title || ''
    })
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400'
      case 'intermediate': return 'text-yellow-400'
      case 'advanced': return 'text-red-400'
      case 'expert': return 'text-purple-400'
      default: return 'text-gray-400'
    }
  }

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'skill-gap': return <TrendingUp className="w-4 h-4" />
      case 'career-path': return <Target className="w-4 h-4" />
      case 'trending': return <Zap className="w-4 h-4" />
      case 'peer-recommended': return <Users className="w-4 h-4" />
      default: return <Lightbulb className="w-4 h-4" />
    }
  }

  const filteredPaths = learningPaths.filter(path => {
    const matchesSearch = path.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         path.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || path.category === selectedCategory
    const matchesRecommended = !showOnlyRecommended || path.isRecommended
    const matchesView = currentView === 'paths' || 
                       (currentView === 'enrolled' && path.isEnrolled) ||
                       (currentView === 'favorites' && path.isFavorited)
    
    return matchesSearch && matchesCategory && matchesRecommended && matchesView
  })

  const categories = ['all', ...Array.from(new Set(learningPaths.map(path => path.category)))]

  if (selectedPath) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        {/* Path Header */}
        <div className="mb-6">
          <button
            onClick={() => setSelectedPath(null)}
            className="text-electric-blue hover:text-blue-400 mb-4 flex items-center space-x-2"
          >
            ← Back to Learning Paths
          </button>
          
          <div className="glass-dark rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">{selectedPath.title}</h2>
                <p className="text-gray-400 mb-4">{selectedPath.description}</p>
                
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">{selectedPath.estimatedHours} hours</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-gray-300">{selectedPath.rating}/5</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">{selectedPath.popularity}% popularity</span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(selectedPath.difficulty)} bg-gray-800`}>
                    {selectedPath.difficulty}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => toggleFavorite(selectedPath.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    selectedPath.isFavorited 
                      ? 'text-red-400 bg-red-900/20' 
                      : 'text-gray-400 hover:text-red-400'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${selectedPath.isFavorited ? 'fill-current' : ''}`} />
                </button>
                
                {!selectedPath.isEnrolled ? (
                  <button
                    onClick={() => enrollInPath(selectedPath.id)}
                    className="px-6 py-2 bg-electric-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Enroll Now
                  </button>
                ) : (
                  <button className="px-6 py-2 bg-green-600 text-white rounded-lg">
                    Continue Learning
                  </button>
                )}
              </div>
            </div>
            
            {/* Progress Bar */}
            {selectedPath.isEnrolled && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Progress</span>
                  <span className="text-electric-blue text-sm">
                    {selectedPath.completedSteps}/{selectedPath.totalSteps} steps
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-electric-blue h-2 rounded-full"
                    style={{ width: `${(selectedPath.completedSteps / selectedPath.totalSteps) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Learning Steps */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">Learning Steps</h3>
            
            {selectedPath.steps.map((step, index) => (
              <div
                key={step.id}
                className={`glass-dark rounded-xl p-4 ${
                  step.isCompleted ? 'border border-green-600/30' :
                  step.isLocked ? 'opacity-60' : 'border border-electric-blue/30'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step.isCompleted ? 'bg-green-600' :
                    step.isLocked ? 'bg-gray-600' : 'bg-electric-blue'
                  }`}>
                    {step.isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-white" />
                    ) : step.isLocked ? (
                      <Lock className="w-5 h-5 text-white" />
                    ) : (
                      <span className="text-white font-semibold">{index + 1}</span>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold text-white">{step.title}</h4>
                      <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                        {step.type}
                      </span>
                      <span className="text-gray-400 text-sm">{step.duration}min</span>
                    </div>
                    <p className="text-gray-400 text-sm">{step.description}</p>
                    
                    {step.isCompleted && (
                      <div className="mt-2 text-green-400 text-sm">
                        ✓ Completed • +{step.xpReward} XP
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {!step.isLocked && !step.isCompleted && (
                      <button className="px-4 py-2 bg-electric-blue text-white rounded hover:bg-blue-600 transition-colors">
                        Start
                      </button>
                    )}
                    {step.isCompleted && (
                      <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors">
                        Review
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Path Info */}
            <div className="glass-dark rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4">Path Information</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-gray-400 text-sm mb-2">Prerequisites</h4>
                  <div className="space-y-1">
                    {selectedPath.prerequisites.map((prereq, index) => (
                      <div key={index} className="text-gray-300 text-sm">• {prereq}</div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-gray-400 text-sm mb-2">Learning Outcomes</h4>
                  <div className="space-y-1">
                    {selectedPath.outcomes.map((outcome, index) => (
                      <div key={index} className="text-gray-300 text-sm">• {outcome}</div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-gray-400 text-sm mb-2">Skills You'll Learn</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPath.skills.map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-electric-blue/20 text-electric-blue text-xs rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Instructor */}
            <div className="glass-dark rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4">Instructor</h3>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-electric-blue to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {selectedPath.instructor.charAt(0)}
                </div>
                <div>
                  <div className="text-white font-medium">{selectedPath.instructor}</div>
                  <div className="text-gray-400 text-sm">Expert Instructor</div>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="glass-dark rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4">Reviews</h3>
              <div className="space-y-4">
                {selectedPath.reviews.slice(0, 2).map(review => (
                  <div key={review.id} className="border-b border-gray-700 pb-4 last:border-b-0">
                    <div className="flex items-start space-x-3">
                      <div className="text-lg">{review.userAvatar}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-white text-sm font-medium">{review.userName}</span>
                          <div className="flex">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-400 text-sm">{review.comment}</p>
                        <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                          <span>{review.createdAt.toLocaleDateString()}</span>
                          <span>• {review.helpful} helpful</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gradient mb-2">Learning Path Recommendations</h2>
        <p className="text-gray-400">Personalized learning paths to accelerate your coding journey</p>
      </div>

      {/* AI Recommendations */}
      <div className="glass-dark rounded-xl p-6 mb-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <Brain className="w-5 h-5 mr-2 text-electric-blue" />
          AI-Powered Recommendations
        </h3>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {recommendations.slice(0, 4).map(rec => {
            const path = learningPaths.find(p => p.id === rec.pathId)
            if (!path) return null
            
            return (
              <div key={rec.pathId} className="p-4 bg-gradient-to-br from-electric-blue/10 to-purple-600/10 border border-electric-blue/30 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2 text-electric-blue">
                    {getRecommendationIcon(rec.type)}
                    <span className="text-xs font-medium capitalize">{rec.type.replace('-', ' ')}</span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    rec.priority === 'high' ? 'bg-red-600' :
                    rec.priority === 'medium' ? 'bg-yellow-600' : 'bg-gray-600'
                  }`}>
                    {rec.priority}
                  </span>
                </div>
                
                <h4 className="font-semibold text-white text-sm mb-2">{path.title}</h4>
                <p className="text-gray-400 text-xs mb-3">{rec.reason}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-green-400 text-xs">{rec.confidence}% match</span>
                  <button
                    onClick={() => setSelectedPath(path)}
                    className="text-electric-blue hover:text-blue-400 text-xs font-medium"
                  >
                    View Path →
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="glass-dark rounded-xl p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search learning paths..."
              className="px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm outline-none focus:border-electric-blue"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>

          {/* View Selector */}
          <div className="flex space-x-2">
            {['paths', 'enrolled', 'favorites'].map(view => (
              <button
                key={view}
                onClick={() => setCurrentView(view)}
                className={`px-3 py-2 rounded text-sm transition-colors ${
                  currentView === view
                    ? 'bg-electric-blue text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {view === 'paths' ? 'All Paths' : 
                 view === 'enrolled' ? 'Enrolled' : 'Favorites'}
              </button>
            ))}
          </div>

          {/* Toggles */}
          <label className="flex items-center space-x-2 text-gray-300 text-sm">
            <input
              type="checkbox"
              checked={showOnlyRecommended}
              onChange={(e) => setShowOnlyRecommended(e.target.checked)}
              className="rounded"
            />
            <span>Show only recommended</span>
          </label>
        </div>
      </div>

      {/* Learning Paths Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPaths.map(path => (
          <div key={path.id} className="glass-dark rounded-xl p-6 hover:bg-gray-800/80 transition-colors">
            {/* Path Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  {path.isRecommended && (
                    <span className="px-2 py-1 bg-electric-blue/20 text-electric-blue text-xs rounded">
                      Recommended
                    </span>
                  )}
                  <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(path.difficulty)} bg-gray-800`}>
                    {path.difficulty}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{path.title}</h3>
                <p className="text-gray-400 text-sm line-clamp-3">{path.description}</p>
              </div>
            </div>

            {/* Path Stats */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Duration:</span>
                <span className="text-white">{path.estimatedHours} hours</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Rating:</span>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-white">{path.rating}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Popularity:</span>
                <span className="text-green-400">{path.popularity}%</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Steps:</span>
                <span className="text-white">{path.totalSteps} lessons</span>
              </div>
            </div>

            {/* Progress (if enrolled) */}
            {path.isEnrolled && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Progress</span>
                  <span className="text-electric-blue text-sm">
                    {path.completedSteps}/{path.totalSteps}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-electric-blue h-2 rounded-full"
                    style={{ width: `${(path.completedSteps / path.totalSteps) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Skills */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {path.skills.slice(0, 3).map((skill, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded">
                    {skill}
                  </span>
                ))}
                {path.skills.length > 3 && (
                  <span className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded">
                    +{path.skills.length - 3} more
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSelectedPath(path)}
                className="flex-1 py-2 bg-electric-blue text-white rounded hover:bg-blue-600 transition-colors text-center"
              >
                {path.isEnrolled ? 'Continue' : 'View Details'}
              </button>
              
              <button
                onClick={() => toggleFavorite(path.id)}
                className={`p-2 rounded transition-colors ${
                  path.isFavorited 
                    ? 'text-red-400 bg-red-900/20' 
                    : 'text-gray-400 hover:text-red-400'
                }`}
              >
                <Heart className={`w-5 h-5 ${path.isFavorited ? 'fill-current' : ''}`} />
              </button>
              
              {!path.isEnrolled && (
                <button
                  onClick={() => enrollInPath(path.id)}
                  className="p-2 text-gray-400 hover:text-electric-blue transition-colors"
                  title="Quick Enroll"
                >
                  <Plus className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredPaths.length === 0 && (
        <div className="text-center text-gray-400 py-12">
          <Route className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No learning paths found</h3>
          <p>Try adjusting your search criteria or explore our recommended paths.</p>
        </div>
      )}
    </div>
  )
}
