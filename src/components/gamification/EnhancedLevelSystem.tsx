'use client'

import React, { useState, useEffect } from 'react'
import { 
  Trophy, 
  Star, 
  Lock, 
  CheckCircle, 
  Clock, 
  Zap, 
  Target,
  PlayCircle,
  BookOpen,
  Code,
  Video,
  FileText,
  Award
} from 'lucide-react'
import { useNotifications } from '../NotificationProvider'

// Utility function for difficulty colors
const getDifficultyColor = (difficulty: 'beginner' | 'intermediate' | 'hard') => {
  switch (difficulty) {
    case 'beginner':
      return 'bg-green-500/20 text-green-400 border-green-500/30'
    case 'intermediate':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    case 'hard':
      return 'bg-red-500/20 text-red-400 border-red-500/30'
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }
}

interface Level {
  id: string
  level_number: number
  sublevel_number: number
  title: string
  description: string
  xp_required_min: number
  xp_required_max: number
  unlock_conditions: string[]
  is_active: boolean
}

interface Challenge {
  id: string
  level_id: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'hard'
  xp_reward: number
  time_estimate: number
  theory_content: {
    notes?: string[]
    videos?: { title: string, url: string, duration: number }[]
    examples?: { title: string, code: string, explanation: string }[]
  }
  tasks: ChallengeTask[]
  prerequisites: string[]
  completion_rate: number
  average_score: number
  order_index: number
  is_unlocked: boolean
  student_progress?: {
    status: 'not_started' | 'in_progress' | 'completed' | 'locked'
    score: number
    attempts: number
    time_spent: number
    completed_tasks: string[]
  }
}

interface ChallengeTask {
  id: string
  title: string
  description: string
  type: 'theory' | 'practice' | 'quiz' | 'project'
  xp_reward: number
  content: any
  is_required: boolean
}

interface StudentStats {
  current_xp: number
  current_level: {
    level_number: number
    sublevel_number: number
    title: string
  }
  total_challenges_completed: number
  current_streak: number
  badges_earned: number
}

// Dummy data for development
const sampleLevels: Level[] = [
  {
    id: '1-1',
    level_number: 1,
    sublevel_number: 1,
    title: 'Hello World',
    description: 'Your first steps into programming',
    xp_required_min: 0,
    xp_required_max: 100,
    unlock_conditions: [],
    is_active: true
  },
  {
    id: '1-2',
    level_number: 1,
    sublevel_number: 2,
    title: 'Variables & Data Types',
    description: 'Understanding data storage and manipulation',
    xp_required_min: 100,
    xp_required_max: 200,
    unlock_conditions: ['complete_80_percent_previous'],
    is_active: true
  },
  {
    id: '1-3',
    level_number: 1,
    sublevel_number: 3,
    title: 'Basic Input/Output',
    description: 'Interacting with users through input and output',
    xp_required_min: 200,
    xp_required_max: 300,
    unlock_conditions: ['complete_80_percent_previous'],
    is_active: true
  }
]

const sampleChallenges: Challenge[] = [
  {
    id: 'challenge-1-1-1',
    level_id: '1-1',
    title: 'Your First "Hello World"',
    description: 'Create your very first program that displays a greeting message',
    difficulty: 'beginner',
    xp_reward: 25,
    time_estimate: 15,
    theory_content: {
      notes: [
        'Programming is like giving instructions to a computer',
        'Every program starts with a simple first step',
        'Hello World is a tradition in programming'
      ],
      videos: [
        { title: 'What is Programming?', url: '/videos/programming-intro', duration: 5 },
        { title: 'Writing Your First Code', url: '/videos/first-code', duration: 8 }
      ],
      examples: [
        {
          title: 'Basic Hello World',
          code: 'print("Hello, World!")',
          explanation: 'This line tells the computer to display the text "Hello, World!" on the screen'
        }
      ]
    },
    tasks: [
      {
        id: 'task-1',
        title: 'Read: What is Programming?',
        description: 'Learn the basic concepts of programming',
        type: 'theory',
        xp_reward: 5,
        content: { notes: ['Programming basics...'] },
        is_required: true
      },
      {
        id: 'task-2',
        title: 'Watch: Your First Code',
        description: 'Watch a video tutorial on writing your first program',
        type: 'theory',
        xp_reward: 10,
        content: { video_url: '/videos/first-code' },
        is_required: true
      },
      {
        id: 'task-3',
        title: 'Code: Hello World',
        description: 'Write a program that displays "Hello, World!"',
        type: 'practice',
        xp_reward: 15,
        content: {
          starter_code: '# Write your Hello World program here\n',
          expected_output: 'Hello, World!'
        },
        is_required: true
      },
      {
        id: 'task-4',
        title: 'Quiz: Programming Basics',
        description: 'Test your understanding of basic programming concepts',
        type: 'quiz',
        xp_reward: 10,
        content: {
          questions: [
            {
              question: 'What does "Hello World" demonstrate?',
              options: ['Basic output', 'Complex calculations', 'User input', 'File operations'],
              correct: 0
            }
          ]
        },
        is_required: false
      }
    ],
    prerequisites: [],
    completion_rate: 95.5,
    average_score: 87.3,
    order_index: 1,
    is_unlocked: true,
    student_progress: {
      status: 'not_started',
      score: 0,
      attempts: 0,
      time_spent: 0,
      completed_tasks: []
    }
  }
]

export function EnhancedLevelSystem() {
  const [levels, setLevels] = useState<Level[]>(sampleLevels)
  const [challenges, setChallenges] = useState<Challenge[]>(sampleChallenges)
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null)
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)
  const [currentView, setCurrentView] = useState<'map' | 'challenge' | 'task'>('map')
  const [studentStats, setStudentStats] = useState<StudentStats>({
    current_xp: 50,
    current_level: { level_number: 1, sublevel_number: 1, title: 'Hello World' },
    total_challenges_completed: 0,
    current_streak: 3,
    badges_earned: 2
  })
  const { addNotification } = useNotifications()

  const isLevelUnlocked = (level: Level) => {
    return studentStats.current_xp >= level.xp_required_min
  }

  const getLevelProgress = (level: Level) => {
    if (studentStats.current_xp >= level.xp_required_max) return 100
    if (studentStats.current_xp < level.xp_required_min) return 0
    return ((studentStats.current_xp - level.xp_required_min) / (level.xp_required_max - level.xp_required_min)) * 100
  }

  const startChallenge = (challenge: Challenge) => {
    if (!challenge.is_unlocked) {
      addNotification({
        type: 'error',
        title: '🔒 Challenge Locked',
        message: 'Complete previous challenges to unlock this one'
      })
      return
    }

    setSelectedChallenge(challenge)
    setCurrentView('challenge')
    
    addNotification({
      type: 'success',
      title: '🚀 Challenge Started!',
      message: `Welcome to "${challenge.title}"`
    })
  }

  const completeTask = (challengeId: string, taskId: string) => {
    setChallenges(prev => prev.map(challenge => 
      challenge.id === challengeId 
        ? {
            ...challenge,
            student_progress: {
              ...challenge.student_progress!,
              completed_tasks: [...(challenge.student_progress?.completed_tasks || []), taskId]
            }
          }
        : challenge
    ))

    const challenge = challenges.find(c => c.id === challengeId)
    const task = challenge?.tasks.find(t => t.id === taskId)
    
    if (task) {
      // Award XP
      setStudentStats(prev => ({
        ...prev,
        current_xp: prev.current_xp + task.xp_reward
      }))

      addNotification({
        type: 'success',
        title: '✅ Task Completed!',
        message: `+${task.xp_reward} XP for "${task.title}"`
      })
    }
  }

  if (currentView === 'challenge' && selectedChallenge) {
    return (
      <ChallengeView 
        challenge={selectedChallenge}
        onBack={() => setCurrentView('map')}
        onCompleteTask={completeTask}
        onTaskSelect={(taskId) => {
          // Handle task selection for detailed view
          setCurrentView('task')
        }}
      />
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header with Stats */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gradient mb-2">🎮 Level System</h1>
            <p className="text-gray-400">Structured learning path from beginner to expert</p>
          </div>
          <div className="glass-dark rounded-xl p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-electric-blue">{studentStats.current_xp} XP</div>
              <div className="text-sm text-gray-400">
                Level {studentStats.current_level.level_number}.{studentStats.current_level.sublevel_number}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-dark rounded-xl p-4 text-center">
            <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-lg font-bold text-white">{studentStats.total_challenges_completed}</div>
            <div className="text-sm text-gray-400">Challenges Done</div>
          </div>
          <div className="glass-dark rounded-xl p-4 text-center">
            <Target className="w-8 h-8 text-orange-400 mx-auto mb-2" />
            <div className="text-lg font-bold text-white">{studentStats.current_streak}</div>
            <div className="text-sm text-gray-400">Day Streak</div>
          </div>
          <div className="glass-dark rounded-xl p-4 text-center">
            <Award className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <div className="text-lg font-bold text-white">{studentStats.badges_earned}</div>
            <div className="text-sm text-gray-400">Badges Earned</div>
          </div>
          <div className="glass-dark rounded-xl p-4 text-center">
            <Star className="w-8 h-8 text-electric-blue mx-auto mb-2" />
            <div className="text-lg font-bold text-white">Level {studentStats.current_level.level_number}</div>
            <div className="text-sm text-gray-400">Current Level</div>
          </div>
        </div>
      </div>

      {/* Level Map */}
      <div className="space-y-8">
        {[1, 2, 3, 4, 5, 6].map(levelNumber => {
          const levelGroup = levels.filter(l => l.level_number === levelNumber)
          const isGroupUnlocked = levelGroup.some(level => isLevelUnlocked(level))
          
          return (
            <div key={levelNumber} className={`glass-dark rounded-2xl p-6 ${isGroupUnlocked ? '' : 'opacity-60'}`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${
                    isGroupUnlocked ? 'bg-electric-blue/20 text-electric-blue' : 'bg-gray-700 text-gray-400'
                  }`}>
                    {levelNumber}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {levelNumber === 1 && 'Newbie Coder'}
                      {levelNumber === 2 && 'Junior Developer'}
                      {levelNumber === 3 && 'Intermediate Coder'}
                      {levelNumber === 4 && 'Advanced Programmer'}
                      {levelNumber === 5 && 'Expert Developer'}
                      {levelNumber === 6 && 'Coding Master'}
                    </h2>
                    <p className="text-gray-400">
                      {levelNumber === 1 && 'Learn the basics and get familiar with programming'}
                      {levelNumber === 2 && 'Master control structures and problem solving'}
                      {levelNumber === 3 && 'Explore OOP and data structures'}
                      {levelNumber === 4 && 'Advanced concepts and web development'}
                      {levelNumber === 5 && 'Specialization and advanced projects'}
                      {levelNumber === 6 && 'Mentorship and community contribution'}
                    </p>
                  </div>
                </div>
                {!isGroupUnlocked && (
                  <Lock className="w-8 h-8 text-gray-500" />
                )}
              </div>

              {/* Sub-levels */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {levelGroup.map(level => {
                  const isUnlocked = isLevelUnlocked(level)
                  const progress = getLevelProgress(level)
                  const levelChallenges = challenges.filter(c => c.level_id === level.id)
                  
                  return (
                    <div key={level.id} 
                         className={`relative p-4 rounded-xl border transition-all duration-300 cursor-pointer hover:scale-105 ${
                           isUnlocked 
                             ? 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-electric-blue/30' 
                             : 'bg-gray-900/30 border-gray-700 cursor-not-allowed'
                         }`}
                         onClick={() => isUnlocked && setSelectedLevel(level)}>
                      
                      {/* Lock indicator */}
                      {!isUnlocked && (
                        <div className="absolute top-2 right-2">
                          <Lock className="w-5 h-5 text-gray-500" />
                        </div>
                      )}

                      <div className="mb-3">
                        <h3 className={`font-semibold mb-1 ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                          {level.sublevel_number}.{level.title}
                        </h3>
                        <p className={`text-sm ${isUnlocked ? 'text-gray-300' : 'text-gray-600'}`}>
                          {level.description}
                        </p>
                      </div>

                      {/* XP Range */}
                      <div className={`text-xs mb-3 ${isUnlocked ? 'text-electric-blue' : 'text-gray-500'}`}>
                        {level.xp_required_min} - {level.xp_required_max} XP
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-electric-blue to-neon-cyan h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                          <span>Progress</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                      </div>

                      {/* Challenge Count */}
                      <div className="flex items-center justify-between">
                        <span className={`text-xs ${isUnlocked ? 'text-gray-400' : 'text-gray-600'}`}>
                          {levelChallenges.length} challenges
                        </span>
                        {isUnlocked && (
                          <PlayCircle className="w-5 h-5 text-electric-blue" />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Level Details Modal */}
      {selectedLevel && (
        <LevelDetailsModal 
          level={selectedLevel}
          challenges={challenges.filter(c => c.level_id === selectedLevel.id)}
          onClose={() => setSelectedLevel(null)}
          onStartChallenge={startChallenge}
        />
      )}
    </div>
  )
}

// Level Details Modal Component
function LevelDetailsModal({ 
  level, 
  challenges, 
  onClose, 
  onStartChallenge 
}: {
  level: Level
  challenges: Challenge[]
  onClose: () => void
  onStartChallenge: (challenge: Challenge) => void
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass-dark rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{level.title}</h2>
              <p className="text-gray-400">{level.description}</p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Challenges */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-4">Challenges ({challenges.length})</h3>
          <div className="space-y-4">
            {challenges.map(challenge => (
              <div key={challenge.id} className="glass-dark rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-semibold text-white">{challenge.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs border ${getDifficultyColor(challenge.difficulty)}`}>
                        {challenge.difficulty.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-300 mb-3">{challenge.description}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{challenge.time_estimate} min</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Zap className="w-4 h-4" />
                        <span>+{challenge.xp_reward} XP</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Target className="w-4 h-4" />
                        <span>{challenge.tasks.length} tasks</span>
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => onStartChallenge(challenge)}
                    disabled={!challenge.is_unlocked}
                    className={`ml-4 px-4 py-2 rounded-lg font-medium transition-colors ${
                      challenge.is_unlocked
                        ? 'bg-electric-blue hover:bg-electric-blue/80 text-white'
                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {challenge.is_unlocked ? 'Start Challenge' : 'Locked'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Challenge View Component
function ChallengeView({ 
  challenge, 
  onBack, 
  onCompleteTask,
  onTaskSelect 
}: {
  challenge: Challenge
  onBack: () => void
  onCompleteTask: (challengeId: string, taskId: string) => void
  onTaskSelect: (taskId: string) => void
}) {
  const completedTasks = challenge.student_progress?.completed_tasks || []
  const progress = (completedTasks.length / challenge.tasks.length) * 100

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'theory': return <BookOpen className="w-5 h-5" />
      case 'practice': return <Code className="w-5 h-5" />
      case 'quiz': return <Target className="w-5 h-5" />
      case 'project': return <Star className="w-5 h-5" />
      default: return <FileText className="w-5 h-5" />
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
          ← Back to Level Map
        </button>
      </div>

      {/* Challenge Info */}
      <div className="glass-dark rounded-xl p-8 mb-6">
        <h1 className="text-3xl font-bold text-white mb-4">{challenge.title}</h1>
        <p className="text-gray-300 mb-6">{challenge.description}</p>
        
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
            <span>Overall Progress</span>
            <span>{completedTasks.length}/{challenge.tasks.length} tasks completed</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-electric-blue to-neon-cyan h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-electric-blue">+{challenge.xp_reward}</div>
            <div className="text-sm text-gray-400">Total XP</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{challenge.time_estimate}</div>
            <div className="text-sm text-gray-400">Est. Minutes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{Math.round(challenge.completion_rate)}%</div>
            <div className="text-sm text-gray-400">Success Rate</div>
          </div>
        </div>
      </div>

      {/* Tasks */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white mb-4">Tasks</h2>
        {challenge.tasks.map((task, index) => {
          const isCompleted = completedTasks.includes(task.id)
          const isUnlocked = index === 0 || completedTasks.includes(challenge.tasks[index - 1].id)
          
          return (
            <div key={task.id} className={`glass-dark rounded-xl p-6 transition-all duration-300 ${
              isCompleted ? 'border border-green-500/30' : 
              isUnlocked ? 'border border-electric-blue/30' : 'opacity-60'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      isCompleted ? 'bg-green-500/20 text-green-400' : 
                      isUnlocked ? 'bg-electric-blue/20 text-electric-blue' : 'bg-gray-700 text-gray-400'
                    }`}>
                      {isCompleted ? <CheckCircle className="w-4 h-4" /> : getTaskIcon(task.type)}
                    </div>
                    <h3 className="text-lg font-semibold text-white">{task.title}</h3>
                    <span className="px-2 py-1 text-xs bg-electric-blue/20 text-electric-blue rounded-full">
                      +{task.xp_reward} XP
                    </span>
                    {task.is_required && (
                      <span className="px-2 py-1 text-xs bg-orange-500/20 text-orange-400 rounded-full">
                        Required
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-300 mb-4">{task.description}</p>
                  
                  {/* Task Type Indicator */}
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    {getTaskIcon(task.type)}
                    <span className="capitalize">{task.type}</span>
                  </div>
                </div>
                
                {isUnlocked && !isCompleted && (
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => onTaskSelect(task.id)}
                      className="btn-secondary"
                    >
                      Start Task
                    </button>
                    <button
                      onClick={() => onCompleteTask(challenge.id, task.id)}
                      className="btn-primary"
                    >
                      Complete
                    </button>
                  </div>
                )}
                
                {isCompleted && (
                  <div className="ml-4 text-green-400 font-medium">
                    ✓ Completed
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default EnhancedLevelSystem
