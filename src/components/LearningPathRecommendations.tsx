'use client'

import React, { useState, useEffect } from 'react'
import { 
  Star, 
  Heart,
  CheckCircle,
  Search,
  Plus
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
    steps: [],
    reviews: []
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
    steps: [],
    reviews: []
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
      lastAccessed: new Date('2025-01-10'),
      estimatedCompletion: new Date('2025-03-20'),
      averageSessionTime: 45,
      streak: 8
    },
    steps: [],
    reviews: []
  }
]

export function LearningPathRecommendations() {
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([])

  const [searchQuery, setSearchQuery] = useState('')
  const [showOnlyRecommended, setShowOnlyRecommended] = useState(true)
  const [currentView, setCurrentView] = useState('paths') // 'paths', 'enrolled', 'favorites'
  const [selectedCategory, setSelectedCategory] = useState('all')
  
  const { addNotification } = useNotifications()

  // Initialize learning paths
  useEffect(() => {
    setLearningPaths(mockPaths)
  }, [])

  const enrollInPath = (pathId: string) => {
    setLearningPaths(prev => 
      prev.map(path => 
        path.id === pathId 
          ? { ...path, isEnrolled: true, progress: { ...path.progress, startedAt: new Date() } }
          : path
      )
    )
    addNotification({
      type: 'success',
      title: 'Successfully enrolled in learning path!'
    })
  }

  const toggleFavorite = (pathId: string) => {
    setLearningPaths(prev => 
      prev.map(path => 
        path.id === pathId 
          ? { ...path, isFavorited: !path.isFavorited }
          : path
      )
    )
  }



  const filteredPaths = learningPaths.filter(path => {
    const matchesSearch = path.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         path.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || path.category === selectedCategory
    const matchesRecommendation = !showOnlyRecommended || path.isRecommended
    
    return matchesSearch && matchesCategory && matchesRecommendation
  })

  const getCurrentViewPaths = () => {
    switch (currentView) {
      case 'enrolled':
        return filteredPaths.filter(path => path.isEnrolled)
      case 'favorites':
        return filteredPaths.filter(path => path.isFavorited)
      default:
        return filteredPaths
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Learning Path Recommendations
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Discover personalized learning paths tailored to your skills, interests, and career goals
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search learning paths..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="all">All Categories</option>
              <option value="Programming Languages">Programming Languages</option>
              <option value="Backend Development">Backend Development</option>
              <option value="Computer Science">Computer Science</option>
            </select>
            
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showOnlyRecommended}
                onChange={(e) => setShowOnlyRecommended(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-white/20 border-white/30 rounded focus:ring-blue-400"
              />
              <span>Show Recommended Only</span>
            </label>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-1">
            <button
              onClick={() => setCurrentView('paths')}
              className={`px-6 py-2 rounded-lg transition-all ${
                currentView === 'paths' 
                  ? 'bg-blue-500 text-white shadow-lg' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              All Paths
            </button>
            <button
              onClick={() => setCurrentView('enrolled')}
              className={`px-6 py-2 rounded-lg transition-all ${
                currentView === 'enrolled' 
                  ? 'bg-blue-500 text-white shadow-lg' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Enrolled
            </button>
            <button
              onClick={() => setCurrentView('favorites')}
              className={`px-6 py-2 rounded-lg transition-all ${
                currentView === 'favorites' 
                  ? 'bg-blue-500 text-white shadow-lg' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Favorites
            </button>
          </div>
        </div>

        {/* Learning Paths Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {getCurrentViewPaths().map((path) => (
            <div
              key={path.id}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 border border-white/20 hover:border-white/40"
            >
              {/* Path Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2 text-white">{path.title}</h3>
                  <p className="text-gray-300 text-sm mb-3">{path.description}</p>
                </div>
                {path.isRecommended && (
                  <div className="flex items-center space-x-1 bg-blue-500/20 px-2 py-1 rounded-full">
                    <Star className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-400 text-xs">Recommended</span>
                  </div>
                )}
              </div>

              {/* Path Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{path.completionRate}%</div>
                  <div className="text-xs text-gray-400">Completion Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{path.rating}</div>
                  <div className="text-xs text-gray-400">Rating</div>
                </div>
              </div>

              {/* Progress Bar */}
              {path.isEnrolled && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-300 mb-1">
                    <span>Progress</span>
                    <span>{Math.round((path.progress.currentStep / path.totalSteps) * 100)}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(path.progress.currentStep / path.totalSteps) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-2">
                {!path.isEnrolled ? (
                  <button
                    onClick={() => enrollInPath(path.id)}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Enroll</span>
                  </button>
                ) : (
                  <button className="flex-1 bg-green-500/20 text-green-400 px-4 py-2 rounded-lg border border-green-500/30 flex items-center justify-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Enrolled</span>
                  </button>
                )}
                
                <button
                  onClick={() => toggleFavorite(path.id)}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center justify-center ${
                    path.isFavorited
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-white/20 text-gray-300 border border-white/30 hover:bg-white/30'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${path.isFavorited ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {getCurrentViewPaths().length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2">No learning paths found</h3>
            <p className="text-gray-400">Try adjusting your search or filters to discover more content</p>
          </div>
        )}
      </div>
    </div>
  )
}
