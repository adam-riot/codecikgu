'use client'

import { useState } from 'react'
import { 
  Calendar, 
  Trophy, 
  Clock, 
  Users, 
  Star, 
  Target, 
  CheckCircle, 
  Lock,
  Award,
  Flame,
  Zap,
  Code,
  PlayCircle,
  Download,
  Upload
} from 'lucide-react'
import { useNotifications } from './NotificationProvider'

interface Challenge {
  id: string
  title: string
  description: string
  category: 'weekly' | 'monthly' | 'special'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  language: string
  xpReward: number
  badge?: string
  startDate: Date
  endDate: Date
  participants: number
  isCompleted: boolean
  isLocked: boolean
  requirements: string[]
  tasks: ChallengeTask[]
  leaderboard: LeaderboardEntry[]
}

interface ChallengeTask {
  id: string
  title: string
  description: string
  type: 'code' | 'quiz' | 'upload' | 'reading'
  isCompleted: boolean
  points: number
  code?: string
  solution?: string
}

interface LeaderboardEntry {
  id: string
  username: string
  score: number
  completedAt: Date
  rank: number
}

// Sample challenges data
const sampleChallenges: Challenge[] = [
  {
    id: 'weekly-php-basics',
    title: 'Asas PHP - Minggu 1',
    description: 'Master the fundamentals of PHP programming with variables, operators, and basic functions.',
    category: 'weekly',
    difficulty: 'beginner',
    language: 'php',
    xpReward: 250,
    badge: 'PHP Novice',
    startDate: new Date('2024-01-08'),
    endDate: new Date('2024-01-14'),
    participants: 1247,
    isCompleted: false,
    isLocked: false,
    requirements: ['Complete basic PHP tutorial', 'Score 70% on variables quiz'],
    tasks: [
      {
        id: 'task-1',
        title: 'Hello World Enhancement',
        description: 'Create a PHP script that displays a personalized greeting with current date and time',
        type: 'code',
        isCompleted: false,
        points: 50,
        code: `<?php
// TODO: Create a personalized greeting
// Include user name, current date, and time
// Use PHP date functions and variables
?>`
      },
      {
        id: 'task-2',
        title: 'Variable Mastery Quiz',
        description: 'Test your knowledge of PHP variables and data types',
        type: 'quiz',
        isCompleted: false,
        points: 50
      },
      {
        id: 'task-3',
        title: 'Calculator Function',
        description: 'Build a simple calculator with basic arithmetic operations',
        type: 'code',
        isCompleted: false,
        points: 100,
        code: `<?php
// TODO: Create functions for add, subtract, multiply, divide
// Include error handling for division by zero
// Test with sample calculations
?>`
      },
      {
        id: 'task-4',
        title: 'Best Practices Reading',
        description: 'Read about PHP coding standards and best practices',
        type: 'reading',
        isCompleted: false,
        points: 50
      }
    ],
    leaderboard: [
      { id: '1', username: 'Ahmad123', score: 250, completedAt: new Date('2024-01-10'), rank: 1 },
      { id: '2', username: 'SitiDev', score: 200, completedAt: new Date('2024-01-11'), rank: 2 },
      { id: '3', username: 'CodeMaster', score: 180, completedAt: new Date('2024-01-12'), rank: 3 }
    ]
  },
  {
    id: 'monthly-web-project',
    title: 'Projek Web Interaktif',
    description: 'Build a complete interactive web application using HTML, CSS, and JavaScript over the course of a month.',
    category: 'monthly',
    difficulty: 'intermediate',
    language: 'javascript',
    xpReward: 1000,
    badge: 'Web Developer',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-31'),
    participants: 856,
    isCompleted: false,
    isLocked: false,
    requirements: ['Complete HTML/CSS fundamentals', 'Basic JavaScript knowledge'],
    tasks: [
      {
        id: 'web-task-1',
        title: 'Project Planning',
        description: 'Create a project plan and wireframe for your web application',
        type: 'upload',
        isCompleted: false,
        points: 100
      },
      {
        id: 'web-task-2',
        title: 'HTML Structure',
        description: 'Build the HTML structure with semantic elements',
        type: 'code',
        isCompleted: false,
        points: 200
      },
      {
        id: 'web-task-3',
        title: 'CSS Styling',
        description: 'Style your application with modern CSS techniques',
        type: 'code',
        isCompleted: false,
        points: 250
      },
      {
        id: 'web-task-4',
        title: 'JavaScript Functionality',
        description: 'Add interactive features using JavaScript',
        type: 'code',
        isCompleted: false,
        points: 300
      },
      {
        id: 'web-task-5',
        title: 'Final Presentation',
        description: 'Present your completed project with documentation',
        type: 'upload',
        isCompleted: false,
        points: 150
      }
    ],
    leaderboard: [
      { id: '1', username: 'WebMaster2024', score: 950, completedAt: new Date('2024-01-28'), rank: 1 },
      { id: '2', username: 'FullStackDev', score: 900, completedAt: new Date('2024-01-29'), rank: 2 }
    ]
  },
  {
    id: 'special-hackathon',
    title: 'CodeCikgu Hackathon 2024',
    description: 'Special 48-hour coding challenge to build innovative educational tools.',
    category: 'special',
    difficulty: 'advanced',
    language: 'any',
    xpReward: 2000,
    badge: 'Innovation Master',
    startDate: new Date('2024-02-15'),
    endDate: new Date('2024-02-17'),
    participants: 432,
    isCompleted: false,
    isLocked: true,
    requirements: ['Complete at least 5 challenges', 'Portfolio submission'],
    tasks: [
      {
        id: 'hack-task-1',
        title: 'Team Formation',
        description: 'Form a team of 2-4 members and register for the hackathon',
        type: 'upload',
        isCompleted: false,
        points: 100
      },
      {
        id: 'hack-task-2',
        title: 'Problem Identification',
        description: 'Identify an educational problem and propose a solution',
        type: 'upload',
        isCompleted: false,
        points: 200
      },
      {
        id: 'hack-task-3',
        title: 'Prototype Development',
        description: 'Build a working prototype of your solution',
        type: 'code',
        isCompleted: false,
        points: 800
      },
      {
        id: 'hack-task-4',
        title: 'Presentation & Demo',
        description: 'Present your solution to judges and demonstrate functionality',
        type: 'upload',
        isCompleted: false,
        points: 900
      }
    ],
    leaderboard: []
  }
]

export function ChallengeSystem() {
  const [challenges, setChallenges] = useState<Challenge[]>(sampleChallenges)
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)
  const [currentView, setCurrentView] = useState<'list' | 'challenge' | 'leaderboard'>('list')
  const [filterCategory, setFilterCategory] = useState<'all' | 'weekly' | 'monthly' | 'special'>('all')
  const [filterDifficulty, setFilterDifficulty] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all')
  const { addNotification } = useNotifications()

  const startChallenge = (challenge: Challenge) => {
    if (challenge.isLocked) {
      addNotification({
        type: 'error',
        title: '🔒 Cabaran Terkunci',
        message: 'Lengkapkan syarat-syarat untuk membuka cabaran ini'
      })
      return
    }

    setSelectedChallenge(challenge)
    setCurrentView('challenge')
    
    addNotification({
      type: 'success',
      title: '🚀 Cabaran Dimulakan!',
      message: `Selamat datang ke "${challenge.title}"`
    })
  }

  const completeTask = (challengeId: string, taskId: string) => {
    setChallenges(prev => prev.map(challenge => 
      challenge.id === challengeId 
        ? {
            ...challenge,
            tasks: challenge.tasks.map(task =>
              task.id === taskId ? { ...task, isCompleted: true } : task
            )
          }
        : challenge
    ))

    const challenge = challenges.find(c => c.id === challengeId)
    const task = challenge?.tasks.find(t => t.id === taskId)
    
    if (task) {
      addNotification({
        type: 'success',
        title: '✅ Tugasan Selesai!',
        message: `+${task.points} mata untuk "${task.title}"`
      })
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400 bg-green-400/20'
      case 'intermediate': return 'text-yellow-400 bg-yellow-400/20'
      case 'advanced': return 'text-red-400 bg-red-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'weekly': return <Calendar className="w-4 h-4" />
      case 'monthly': return <Target className="w-4 h-4" />
      case 'special': return <Star className="w-4 h-4" />
      default: return <Trophy className="w-4 h-4" />
    }
  }

  const getTimeRemaining = (endDate: Date) => {
    const now = new Date()
    const diff = endDate.getTime() - now.getTime()
    
    if (diff <= 0) return 'Tamat'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days} hari lagi`
    return `${hours} jam lagi`
  }

  const filteredChallenges = challenges.filter(challenge => {
    const categoryMatch = filterCategory === 'all' || challenge.category === filterCategory
    const difficultyMatch = filterDifficulty === 'all' || challenge.difficulty === filterDifficulty
    return categoryMatch && difficultyMatch
  })

  if (currentView === 'challenge' && selectedChallenge) {
    return (
      <ChallengeDetails 
        challenge={selectedChallenge}
        onBack={() => setCurrentView('list')}
        onCompleteTask={completeTask}
        onViewLeaderboard={() => setCurrentView('leaderboard')}
      />
    )
  }

  if (currentView === 'leaderboard' && selectedChallenge) {
    return (
      <ChallengeLeaderboard 
        challenge={selectedChallenge}
        onBack={() => setCurrentView('challenge')}
      />
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gradient mb-2">Sistem Cabaran</h2>
        <p className="text-gray-400">Sertai cabaran mingguan dan bulanan untuk meningkatkan kemahiran anda</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass-dark rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <Flame className="w-8 h-8 text-orange-400" />
            <div>
              <h3 className="text-2xl font-bold text-white">7</h3>
              <p className="text-gray-400 text-sm">Hari Berturut</p>
            </div>
          </div>
        </div>
        
        <div className="glass-dark rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <div>
              <h3 className="text-2xl font-bold text-white">12</h3>
              <p className="text-gray-400 text-sm">Cabaran Selesai</p>
            </div>
          </div>
        </div>
        
        <div className="glass-dark rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <Award className="w-8 h-8 text-purple-400" />
            <div>
              <h3 className="text-2xl font-bold text-white">3,450</h3>
              <p className="text-gray-400 text-sm">Total XP</p>
            </div>
          </div>
        </div>
        
        <div className="glass-dark rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-blue-400" />
            <div>
              <h3 className="text-2xl font-bold text-white">#24</h3>
              <p className="text-gray-400 text-sm">Kedudukan Global</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-dark rounded-xl p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-gray-300 text-sm">Kategori:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as 'weekly' | 'monthly' | 'special' | 'all')}
              className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm"
            >
              <option value="all">Semua</option>
              <option value="weekly">Mingguan</option>
              <option value="monthly">Bulanan</option>
              <option value="special">Khas</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-gray-300 text-sm">Tahap:</span>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value as 'beginner' | 'intermediate' | 'advanced' | 'all')}
              className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm"
            >
              <option value="all">Semua</option>
              <option value="beginner">Pemula</option>
              <option value="intermediate">Pertengahan</option>
              <option value="advanced">Mahir</option>
            </select>
          </div>
        </div>
      </div>

      {/* Challenge Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredChallenges.map((challenge) => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            onStart={() => startChallenge(challenge)}
            getDifficultyColor={getDifficultyColor}
            getCategoryIcon={getCategoryIcon}
            getTimeRemaining={getTimeRemaining}
          />
        ))}
      </div>

      {filteredChallenges.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">Tiada Cabaran Dijumpai</h3>
          <p className="text-gray-500">Cuba laraskan penapis untuk melihat cabaran yang berbeza</p>
        </div>
      )}
    </div>
  )
}

// Challenge Card Component
function ChallengeCard({ 
  challenge, 
  onStart, 
  getDifficultyColor, 
  getCategoryIcon, 
  getTimeRemaining 
}: {
  challenge: Challenge
  onStart: () => void
  getDifficultyColor: (difficulty: string) => string
  getCategoryIcon: (category: string) => React.ReactElement
  getTimeRemaining: (endDate: Date) => string
}) {
  const completedTasks = challenge.tasks.filter(task => task.isCompleted).length
  const totalTasks = challenge.tasks.length
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  return (
    <div className={`glass-dark rounded-xl p-6 card-hover group ${challenge.isLocked ? 'opacity-60' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          {getCategoryIcon(challenge.category)}
          <span className="text-sm text-gray-400 capitalize">{challenge.category}</span>
        </div>
        
        {challenge.isLocked && <Lock className="w-5 h-5 text-gray-500" />}
        {challenge.isCompleted && <CheckCircle className="w-5 h-5 text-green-400" />}
      </div>

      {/* Title and Description */}
      <h3 className="text-xl font-semibold text-white mb-2">{challenge.title}</h3>
      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{challenge.description}</p>

      {/* Info Row */}
      <div className="flex items-center justify-between text-sm mb-4">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getDifficultyColor(challenge.difficulty)}`}>
          {challenge.difficulty.toUpperCase()}
        </span>
        
        <div className="flex items-center space-x-3 text-gray-400">
          <span className="flex items-center">
            <Code className="w-3 h-3 mr-1" />
            {challenge.language.toUpperCase()}
          </span>
          <span className="flex items-center">
            <Users className="w-3 h-3 mr-1" />
            {challenge.participants}
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
          <span>Progress</span>
          <span>{completedTasks}/{totalTasks} tugasan</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-electric-blue to-neon-cyan h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Time and Reward */}
      <div className="flex items-center justify-between text-sm mb-4">
        <div className="flex items-center space-x-1 text-yellow-400">
          <Clock className="w-3 h-3" />
          <span>{getTimeRemaining(challenge.endDate)}</span>
        </div>
        <div className="flex items-center space-x-1 text-electric-blue">
          <Zap className="w-3 h-3" />
          <span>+{challenge.xpReward} XP</span>
        </div>
      </div>

      {/* Badge */}
      {challenge.badge && (
        <div className="mb-4 p-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30">
          <div className="flex items-center space-x-2">
            <Award className="w-4 h-4 text-purple-400" />
            <span className="text-purple-300 text-sm font-medium">{challenge.badge}</span>
          </div>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={onStart}
        disabled={challenge.isLocked}
        className={`w-full btn-primary ${challenge.isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <PlayCircle className="w-4 h-4 mr-2" />
        {challenge.isCompleted ? 'Lihat Semula' : challenge.isLocked ? 'Terkunci' : 'Mula Cabaran'}
      </button>
    </div>
  )
}

// Challenge Details Component
function ChallengeDetails({ 
  challenge, 
  onBack, 
  onCompleteTask, 
  onViewLeaderboard 
}: {
  challenge: Challenge
  onBack: () => void
  onCompleteTask: (challengeId: string, taskId: string) => void
  onViewLeaderboard: () => void
}) {
  const completedTasks = challenge.tasks.filter(task => task.isCompleted).length
  const totalTasks = challenge.tasks.length
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'code': return <Code className="w-5 h-5" />
      case 'quiz': return <Target className="w-5 h-5" />
      case 'upload': return <Upload className="w-5 h-5" />
      case 'reading': return <Download className="w-5 h-5" />
      default: return <CheckCircle className="w-5 h-5" />
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ← Kembali ke Senarai
        </button>
        <button
          onClick={onViewLeaderboard}
          className="btn-secondary"
        >
          <Trophy className="w-4 h-4 mr-2" />
          Papan Pendahulu
        </button>
      </div>

      {/* Challenge Info */}
      <div className="glass-dark rounded-xl p-8 mb-6">
        <h1 className="text-3xl font-bold text-white mb-4">{challenge.title}</h1>
        <p className="text-gray-300 mb-6">{challenge.description}</p>
        
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
            <span>Progress Keseluruhan</span>
            <span>{completedTasks}/{totalTasks} tugasan selesai</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-electric-blue to-neon-cyan h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Requirements */}
        {challenge.requirements.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Syarat-syarat</h3>
            <ul className="space-y-2">
              {challenge.requirements.map((req, index) => (
                <li key={index} className="flex items-center space-x-2 text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Tasks */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white mb-4">Tugasan</h2>
        {challenge.tasks.map((task) => (
          <div key={task.id} className={`glass-dark rounded-xl p-6 ${task.isCompleted ? 'border border-green-500/30' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${task.isCompleted ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                    {task.isCompleted ? <CheckCircle className="w-4 h-4" /> : getTaskIcon(task.type)}
                  </div>
                  <h3 className="text-lg font-semibold text-white">{task.title}</h3>
                  <span className="px-2 py-1 text-xs bg-electric-blue/20 text-electric-blue rounded-full">
                    {task.points} mata
                  </span>
                </div>
                
                <p className="text-gray-300 mb-4">{task.description}</p>
                
                {task.code && (
                  <div className="bg-black/50 rounded-lg p-4 mb-4">
                    <pre className="text-sm text-green-400 overflow-x-auto">
                      <code>{task.code}</code>
                    </pre>
                  </div>
                )}
              </div>
            </div>
            
            {!task.isCompleted && (
              <div className="flex justify-end">
                <button
                  onClick={() => onCompleteTask(challenge.id, task.id)}
                  className="btn-primary"
                >
                  Tandakan Selesai
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// Challenge Leaderboard Component
function ChallengeLeaderboard({ 
  challenge, 
  onBack 
}: {
  challenge: Challenge
  onBack: () => void
}) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ← Kembali ke Cabaran
        </button>
        <h1 className="text-2xl font-bold text-white">Papan Pendahulu</h1>
        <div></div>
      </div>

      {/* Challenge Info */}
      <div className="glass-dark rounded-xl p-6 mb-6">
        <h2 className="text-xl font-bold text-white mb-2">{challenge.title}</h2>
        <div className="flex items-center space-x-6 text-gray-400">
          <span className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{challenge.participants} peserta</span>
          </span>
          <span className="flex items-center space-x-1">
            <Trophy className="w-4 h-4" />
            <span>+{challenge.xpReward} XP</span>
          </span>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="glass-dark rounded-xl overflow-hidden">
        {challenge.leaderboard.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Belum ada penyertaan. Jadilah yang pertama!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {challenge.leaderboard.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-4 hover:bg-gray-800/50">
                <div className="flex items-center space-x-4">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                    entry.rank === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                    entry.rank === 2 ? 'bg-gray-500/20 text-gray-400' :
                    entry.rank === 3 ? 'bg-orange-500/20 text-orange-400' :
                    'bg-gray-700 text-gray-300'
                  }`}>
                    {entry.rank}
                  </div>
                  <span className="text-white font-medium">{entry.username}</span>
                </div>
                <div className="flex items-center space-x-4 text-gray-400">
                  <span className="font-bold text-electric-blue">{entry.score} mata</span>
                  <span className="text-sm">
                    {new Intl.DateTimeFormat('ms-MY', { 
                      day: 'numeric', 
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    }).format(entry.completedAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
