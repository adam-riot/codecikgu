'use client'

import React, { useState, useEffect } from 'react'
import { 
  BookOpen, 
  Video, 
  Code, 
  Target, 
  Zap, 
  Clock, 
  Star, 
  Filter,
  Search,
  PlayCircle,
  CheckCircle,
  Trophy,
  Award,
  Flame,
  TrendingUp
} from 'lucide-react'
import { useNotifications } from '../NotificationProvider'

interface ExerciseCategory {
  id: string
  name: string
  description: string
  icon: string
  color: string
  order_index: number
  exercise_count: number
}

interface Exercise {
  id: string
  category_id: string
  title: string
  description: string
  type: 'note' | 'video' | 'quiz' | 'code_drill' | 'skill_practice'
  difficulty: 'beginner' | 'intermediate' | 'hard'
  xp_reward: number
  estimated_duration: number
  content: any
  video_url?: string
  thumbnail_url?: string
  tags: string[]
  is_featured: boolean
  views_count: number
  completion_count: number
  average_rating: number
  is_completed?: boolean
}

interface StudentExerciseStats {
  total_completed: number
  total_xp_earned: number
  categories_explored: number
  current_streak: number
  favorite_type: string
  completion_rate: number
}

// Sample data
const sampleCategories: ExerciseCategory[] = [
  {
    id: 'programming-basics',
    name: 'Programming Basics',
    description: 'Fundamental programming concepts and syntax',
    icon: '🔤',
    color: 'green',
    order_index: 1,
    exercise_count: 25
  },
  {
    id: 'algorithm-practice',
    name: 'Algorithm Practice',
    description: 'Data structures and algorithm challenges',
    icon: '🧮',
    color: 'blue',
    order_index: 2,
    exercise_count: 18
  },
  {
    id: 'web-development',
    name: 'Web Development',
    description: 'HTML, CSS, JavaScript, and web frameworks',
    icon: '🌐',
    color: 'purple',
    order_index: 3,
    exercise_count: 32
  },
  {
    id: 'database-sql',
    name: 'Database & SQL',
    description: 'Database design and SQL query practice',
    icon: '🗃️',
    color: 'orange',
    order_index: 4,
    exercise_count: 15
  },
  {
    id: 'problem-solving',
    name: 'Problem Solving',
    description: 'Logic puzzles and computational thinking',
    icon: '🧩',
    color: 'red',
    order_index: 5,
    exercise_count: 22
  },
  {
    id: 'best-practices',
    name: 'Best Practices',
    description: 'Code quality, testing, and industry standards',
    icon: '✅',
    color: 'gray',
    order_index: 6,
    exercise_count: 12
  }
]

const sampleExercises: Exercise[] = [
  {
    id: 'ex-1',
    category_id: 'programming-basics',
    title: 'Understanding Variables in Python',
    description: 'Learn how to declare, initialize, and use variables in Python programming',
    type: 'note',
    difficulty: 'beginner',
    xp_reward: 10,
    estimated_duration: 8,
    content: {
      sections: [
        { title: 'What are Variables?', content: 'Variables are containers for storing data values...' },
        { title: 'Variable Types', content: 'Python supports different data types...' },
        { title: 'Best Practices', content: 'Follow these naming conventions...' }
      ]
    },
    tags: ['python', 'variables', 'basics'],
    is_featured: true,
    views_count: 1250,
    completion_count: 980,
    average_rating: 4.8,
    is_completed: true
  },
  {
    id: 'ex-2',
    category_id: 'programming-basics',
    title: 'Loops Mastery Challenge',
    description: 'Practice different types of loops with hands-on coding exercises',
    type: 'code_drill',
    difficulty: 'intermediate',
    xp_reward: 25,
    estimated_duration: 20,
    content: {
      exercises: [
        {
          title: 'For Loop Practice',
          description: 'Create a program that prints numbers 1 to 10',
          starter_code: '# Write your for loop here\n',
          solution: 'for i in range(1, 11):\n    print(i)',
          test_cases: [
            { input: '', expected_output: '1\n2\n3\n4\n5\n6\n7\n8\n9\n10' }
          ]
        }
      ]
    },
    tags: ['python', 'loops', 'practice'],
    is_featured: false,
    views_count: 856,
    completion_count: 645,
    average_rating: 4.6,
    is_completed: false
  },
  {
    id: 'ex-3',
    category_id: 'web-development',
    title: 'CSS Flexbox Tutorial',
    description: 'Master CSS Flexbox layout with interactive examples',
    type: 'video',
    difficulty: 'intermediate',
    xp_reward: 20,
    estimated_duration: 15,
    video_url: '/videos/css-flexbox-tutorial',
    thumbnail_url: '/thumbnails/css-flexbox.jpg',
    content: {
      video_sections: [
        { title: 'Introduction to Flexbox', timestamp: '00:00' },
        { title: 'Flex Container Properties', timestamp: '03:30' },
        { title: 'Flex Item Properties', timestamp: '08:15' },
        { title: 'Practical Examples', timestamp: '12:00' }
      ]
    },
    tags: ['css', 'flexbox', 'layout', 'web'],
    is_featured: true,
    views_count: 2134,
    completion_count: 1876,
    average_rating: 4.9,
    is_completed: false
  },
  {
    id: 'ex-4',
    category_id: 'algorithm-practice',
    title: 'Array Manipulation Quiz',
    description: 'Test your knowledge of array operations and algorithms',
    type: 'quiz',
    difficulty: 'intermediate',
    xp_reward: 15,
    estimated_duration: 12,
    content: {
      questions: [
        {
          question: 'What is the time complexity of searching in an unsorted array?',
          options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
          correct: 2,
          explanation: 'Linear search requires checking each element in worst case'
        },
        {
          question: 'Which sorting algorithm has the best average case performance?',
          options: ['Bubble Sort', 'Quick Sort', 'Selection Sort', 'Insertion Sort'],
          correct: 1,
          explanation: 'Quick Sort has O(n log n) average case complexity'
        }
      ]
    },
    tags: ['algorithms', 'arrays', 'quiz'],
    is_featured: false,
    views_count: 734,
    completion_count: 612,
    average_rating: 4.3,
    is_completed: false
  }
]

export function ExerciseLibrary() {
  const [categories, setCategories] = useState<ExerciseCategory[]>(sampleCategories)
  const [exercises, setExercises] = useState<Exercise[]>(sampleExercises)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'rating' | 'xp'>('newest')
  const [currentView, setCurrentView] = useState<'library' | 'exercise'>('library')
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [studentStats, setStudentStats] = useState<StudentExerciseStats>({
    total_completed: 12,
    total_xp_earned: 185,
    categories_explored: 4,
    current_streak: 5,
    favorite_type: 'code_drill',
    completion_rate: 68.5
  })
  const { addNotification } = useNotifications()

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'note': return <BookOpen className="w-4 h-4" />
      case 'video': return <Video className="w-4 h-4" />
      case 'quiz': return <Target className="w-4 h-4" />
      case 'code_drill': return <Code className="w-4 h-4" />
      case 'skill_practice': return <Star className="w-4 h-4" />
      default: return <BookOpen className="w-4 h-4" />
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400 bg-green-400/20'
      case 'intermediate': return 'text-yellow-400 bg-yellow-400/20'
      case 'hard': return 'text-red-400 bg-red-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const getCategoryColor = (color: string) => {
    const colors = {
      green: 'from-green-500 to-green-600',
      blue: 'from-blue-500 to-blue-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600',
      red: 'from-red-500 to-red-600',
      gray: 'from-gray-500 to-gray-600'
    }
    return colors[color as keyof typeof colors] || colors.gray
  }

  const filteredExercises = exercises.filter(exercise => {
    const matchesCategory = selectedCategory === 'all' || exercise.category_id === selectedCategory
    const matchesType = selectedType === 'all' || exercise.type === selectedType
    const matchesDifficulty = selectedDifficulty === 'all' || exercise.difficulty === selectedDifficulty
    const matchesSearch = searchQuery === '' || 
      exercise.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    return matchesCategory && matchesType && matchesDifficulty && matchesSearch
  })

  const sortedExercises = [...filteredExercises].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.completion_count - a.completion_count
      case 'rating':
        return b.average_rating - a.average_rating
      case 'xp':
        return b.xp_reward - a.xp_reward
      default:
        return b.is_featured ? 1 : -1
    }
  })

  const startExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise)
    setCurrentView('exercise')
    
    addNotification({
      type: 'success',
      title: '🚀 Exercise Started!',
      message: `Starting "${exercise.title}"`
    })
  }

  const completeExercise = (exerciseId: string, score: number = 100) => {
    const exercise = exercises.find(e => e.id === exerciseId)
    if (!exercise) return

    // Update exercise completion
    setExercises(prev => prev.map(ex => 
      ex.id === exerciseId ? { ...ex, is_completed: true } : ex
    ))

    // Update student stats
    setStudentStats(prev => ({
      ...prev,
      total_completed: prev.total_completed + 1,
      total_xp_earned: prev.total_xp_earned + exercise.xp_reward
    }))

    addNotification({
      type: 'success',
      title: '✅ Exercise Completed!',
      message: `+${exercise.xp_reward} XP earned from "${exercise.title}"`
    })

    setCurrentView('library')
  }

  if (currentView === 'exercise' && selectedExercise) {
    return (
      <ExercisePlayer 
        exercise={selectedExercise}
        onBack={() => setCurrentView('library')}
        onComplete={completeExercise}
      />
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gradient mb-2">📚 Exercise Library</h1>
            <p className="text-gray-400">Additional practice to boost your XP and skills</p>
          </div>
        </div>

        {/* Student Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="glass-dark rounded-xl p-4 text-center">
            <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-lg font-bold text-white">{studentStats.total_completed}</div>
            <div className="text-sm text-gray-400">Completed</div>
          </div>
          <div className="glass-dark rounded-xl p-4 text-center">
            <Zap className="w-8 h-8 text-electric-blue mx-auto mb-2" />
            <div className="text-lg font-bold text-white">{studentStats.total_xp_earned}</div>
            <div className="text-sm text-gray-400">XP Earned</div>
          </div>
          <div className="glass-dark rounded-xl p-4 text-center">
            <Star className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <div className="text-lg font-bold text-white">{studentStats.categories_explored}</div>
            <div className="text-sm text-gray-400">Categories</div>
          </div>
          <div className="glass-dark rounded-xl p-4 text-center">
            <Flame className="w-8 h-8 text-orange-400 mx-auto mb-2" />
            <div className="text-lg font-bold text-white">{studentStats.current_streak}</div>
            <div className="text-sm text-gray-400">Day Streak</div>
          </div>
          <div className="glass-dark rounded-xl p-4 text-center">
            <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-lg font-bold text-white">{studentStats.completion_rate.toFixed(1)}%</div>
            <div className="text-sm text-gray-400">Success Rate</div>
          </div>
        </div>
      </div>

      {/* Categories Overview */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map(category => (
            <div 
              key={category.id}
              className={`p-4 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 ${
                selectedCategory === category.id 
                  ? `bg-gradient-to-br ${getCategoryColor(category.color)} text-white` 
                  : 'glass-dark hover:border-electric-blue/30'
              }`}
              onClick={() => setSelectedCategory(selectedCategory === category.id ? 'all' : category.id)}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">{category.icon}</div>
                <h3 className="font-semibold text-sm mb-1">{category.name}</h3>
                <p className="text-xs text-gray-400">{category.exercise_count} exercises</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="glass-dark rounded-xl p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
              />
            </div>
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
          >
            <option value="all">All Types</option>
            <option value="note">📖 Notes</option>
            <option value="video">🎥 Videos</option>
            <option value="quiz">🎯 Quizzes</option>
            <option value="code_drill">💻 Code Drills</option>
            <option value="skill_practice">⭐ Skill Practice</option>
          </select>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
          >
            <option value="all">All Difficulties</option>
            <option value="beginner">🟢 Beginner</option>
            <option value="intermediate">🟡 Intermediate</option>
            <option value="hard">🔴 Hard</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
          >
            <option value="featured">Featured</option>
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="xp">Most XP</option>
          </select>
        </div>
      </div>

      {/* Exercise Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedExercises.map(exercise => (
          <ExerciseCard 
            key={exercise.id}
            exercise={exercise}
            onStart={() => startExercise(exercise)}
            getTypeIcon={getTypeIcon}
            getDifficultyColor={getDifficultyColor}
          />
        ))}
      </div>

      {/* No Results */}
      {sortedExercises.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No exercises found</h3>
          <p className="text-gray-500">Try adjusting your filters or search terms</p>
        </div>
      )}
    </div>
  )
}

// Exercise Card Component
function ExerciseCard({ 
  exercise, 
  onStart, 
  getTypeIcon, 
  getDifficultyColor 
}: {
  exercise: Exercise
  onStart: () => void
  getTypeIcon: (type: string) => React.ReactElement
  getDifficultyColor: (difficulty: string) => string
}) {
  return (
    <div className={`glass-dark rounded-xl p-6 transition-all duration-300 hover:scale-105 ${
      exercise.is_completed ? 'border border-green-500/30' : 'hover:border-electric-blue/30'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          {getTypeIcon(exercise.type)}
          <span className="text-sm text-gray-400 capitalize">{exercise.type.replace('_', ' ')}</span>
        </div>
        {exercise.is_featured && (
          <Star className="w-5 h-5 text-yellow-400 fill-current" />
        )}
      </div>

      {/* Content */}
      <h3 className="text-lg font-semibold text-white mb-2">{exercise.title}</h3>
      <p className="text-gray-300 text-sm mb-4 line-clamp-2">{exercise.description}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-4">
        {exercise.tags.slice(0, 3).map(tag => (
          <span key={tag} className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded-full">
            {tag}
          </span>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-xs text-gray-400">
        <div className="text-center">
          <Clock className="w-3 h-3 mx-auto mb-1" />
          <span>{exercise.estimated_duration}m</span>
        </div>
        <div className="text-center">
          <Star className="w-3 h-3 mx-auto mb-1" />
          <span>{exercise.average_rating.toFixed(1)}</span>
        </div>
        <div className="text-center">
          <Trophy className="w-3 h-3 mx-auto mb-1" />
          <span>{exercise.completion_count}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(exercise.difficulty)}`}>
            {exercise.difficulty.toUpperCase()}
          </span>
          <span className="text-electric-blue font-medium">+{exercise.xp_reward} XP</span>
        </div>
        
        <button
          onClick={onStart}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            exercise.is_completed
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-electric-blue hover:bg-electric-blue/80 text-white'
          }`}
        >
          {exercise.is_completed ? '✓ Done' : 'Start'}
        </button>
      </div>
    </div>
  )
}

// Exercise Player Component
function ExercisePlayer({ 
  exercise, 
  onBack, 
  onComplete 
}: {
  exercise: Exercise
  onBack: () => void
  onComplete: (exerciseId: string, score?: number) => void
}) {
  const [currentStep, setCurrentStep] = useState(0)
  const [userAnswers, setUserAnswers] = useState<any[]>([])

  const handleComplete = () => {
    // Calculate score based on exercise type and user performance
    const score = 100 // Default score, can be calculated based on answers
    onComplete(exercise.id, score)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ← Back to Library
        </button>
        <div className="text-sm text-gray-400">
          +{exercise.xp_reward} XP • {exercise.estimated_duration} min
        </div>
      </div>

      {/* Exercise Content */}
      <div className="glass-dark rounded-xl p-8">
        <h1 className="text-3xl font-bold text-white mb-4">{exercise.title}</h1>
        <p className="text-gray-300 mb-6">{exercise.description}</p>

        {/* Content based on exercise type */}
        {exercise.type === 'note' && (
          <div className="space-y-6">
            {exercise.content.sections?.map((section: any, index: number) => (
              <div key={index}>
                <h2 className="text-xl font-semibold text-white mb-3">{section.title}</h2>
                <p className="text-gray-300">{section.content}</p>
              </div>
            ))}
          </div>
        )}

        {exercise.type === 'video' && (
          <div>
            <div className="bg-black rounded-lg mb-4 aspect-video flex items-center justify-center">
              <PlayCircle className="w-16 h-16 text-white" />
              <span className="ml-2 text-white">Video Player Placeholder</span>
            </div>
            <div className="space-y-2">
              {exercise.content.video_sections?.map((section: any, index: number) => (
                <div key={index} className="flex items-center space-x-3 p-2 hover:bg-gray-800/50 rounded">
                  <span className="text-sm text-gray-400">{section.timestamp}</span>
                  <span className="text-sm text-white">{section.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {exercise.type === 'quiz' && (
          <div className="space-y-6">
            {exercise.content.questions?.map((question: any, qIndex: number) => (
              <div key={qIndex} className="border border-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">{question.question}</h3>
                <div className="space-y-2">
                  {question.options.map((option: string, oIndex: number) => (
                    <label key={oIndex} className="flex items-center space-x-3 cursor-pointer">
                      <input 
                        type="radio" 
                        name={`question-${qIndex}`}
                        className="w-4 h-4 text-electric-blue"
                      />
                      <span className="text-gray-300">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {exercise.type === 'code_drill' && (
          <div className="space-y-6">
            {exercise.content.exercises?.map((drill: any, index: number) => (
              <div key={index} className="border border-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">{drill.title}</h3>
                <p className="text-gray-300 mb-4">{drill.description}</p>
                <div className="bg-black rounded-lg p-4 mb-4">
                  <pre className="text-green-400 text-sm">
                    <code>{drill.starter_code}</code>
                  </pre>
                </div>
                <button className="btn-primary">
                  <Code className="w-4 h-4 mr-2" />
                  Run Code
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Complete Button */}
        <div className="mt-8 text-center">
          <button
            onClick={handleComplete}
            className="btn-primary"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Complete Exercise
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExerciseLibrary
