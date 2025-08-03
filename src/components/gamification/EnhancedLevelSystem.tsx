'use client'

import React, { useState, useEffect } from 'react'
import { 
  Trophy, 
  Star, 
  Lock, 
  Unlock, 
  CheckCircle,
  XCircle,
  Play,
  RotateCcw,
  Brain,
  Code,
  Target,
  Award,
  TrendingUp,
  Zap,
  Shield,
  Database,
  FileText,
  Network,
  Users,
  Crown,
  Calendar,
  Clock,
  ArrowRight,
  ArrowLeft
} from 'lucide-react'
import { supabase } from '@/utils/supabase'

interface Level {
  id: string
  title: string
  description: string
  category: string
  difficulty: 'mudah' | 'sederhana' | 'sukar'
  xpReward: number
  timeLimit: number
  requirements: string[]
  challenges: Challenge[]
  unlocked: boolean
  completed: boolean
  progress: number
  order: number
}

interface Challenge {
  id: string
  title: string
  description: string
  type: 'quiz' | 'coding' | 'theory' | 'practical'
  content: any
  completed: boolean
  score: number
  maxScore: number
}

const levels: Level[] = [
  {
    id: 'level-1',
    title: 'Pengenalan Sistem Komputer',
    description: 'Belajar komponen asas sistem komputer',
    category: 'Sistem Komputer',
    difficulty: 'mudah',
    xpReward: 100,
    timeLimit: 1800,
    requirements: [],
    challenges: [
      {
        id: 'challenge-1-1',
        title: 'Komponen Perkakasan',
        description: 'Kenalpasti komponen utama sistem komputer',
        type: 'quiz',
        content: {
          questions: [
            {
              question: 'Komponen yang bertanggungjawab untuk memproses data ialah:',
              options: ['Monitor', 'CPU', 'Keyboard', 'Mouse'],
              correct: 1,
              explanation: 'CPU (Central Processing Unit) ialah otak komputer yang memproses semua data'
            },
            {
              question: 'Komponen yang menyimpan data secara kekal ialah:',
              options: ['RAM', 'Hard Disk', 'Monitor', 'Power Supply'],
              correct: 1,
              explanation: 'Hard Disk ialah storan kekal yang menyimpan data walaupun komputer dimatikan'
            }
          ]
        },
        completed: false,
        score: 0,
        maxScore: 2
      }
    ],
    unlocked: true,
    completed: false,
    progress: 0,
    order: 1
  },
  {
    id: 'level-2',
    title: 'Python Asas',
    description: 'Belajar pengaturcaraan Python',
    category: 'Python Asas',
    difficulty: 'sederhana',
    xpReward: 150,
    timeLimit: 2400,
    requirements: ['level-1'],
    challenges: [
      {
        id: 'challenge-2-1',
        title: 'Hello World',
        description: 'Tulis program Python pertama',
        type: 'coding',
        content: {
          task: 'Tulis program untuk mencetak "Hello, CodeCikgu!"',
          starterCode: '# Tulis kod anda di sini\n',
          expectedOutput: 'Hello, CodeCikgu!'
        },
        completed: false,
        score: 0,
        maxScore: 1
      }
    ],
    unlocked: false,
    completed: false,
    progress: 0,
    order: 2
  }
]

export default function EnhancedLevelSystem() {
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null)
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [userAnswers, setUserAnswers] = useState<{[key: string]: any}>({})
  const [showResults, setShowResults] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning, timeLeft])

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
      }
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  const startLevel = (level: Level) => {
    setSelectedLevel(level)
    setTimeLeft(level.timeLimit)
    setIsTimerRunning(true)
    setUserAnswers({})
    setShowResults(false)
  }

  const startChallenge = (challenge: Challenge) => {
    setCurrentChallenge(challenge)
    setUserAnswers({})
    setShowResults(false)
  }

  const submitQuiz = (challenge: Challenge) => {
    let score = 0
    const questions = challenge.content.questions
    
    questions.forEach((question: any, index: number) => {
      const userAnswer = userAnswers[`question-${index}`]
      if (userAnswer === question.correct) {
        score++
      }
    })

    challenge.score = score
    challenge.maxScore = questions.length
    challenge.completed = score >= questions.length * 0.8

    setShowResults(true)
    
    if (challenge.completed && selectedLevel) {
      updateLevelProgress(selectedLevel, challenge)
    }
  }

  const submitCodingChallenge = (challenge: Challenge) => {
    const userCode = userAnswers[`code-${challenge.id}`] || ''
    
    if (userCode.includes('print') && userCode.includes('Hello')) {
      challenge.score = 1
      challenge.maxScore = 1
      challenge.completed = true
    } else {
      challenge.score = 0
      challenge.maxScore = 1
      challenge.completed = false
    }

    setShowResults(true)
    
    if (challenge.completed && selectedLevel) {
      updateLevelProgress(selectedLevel, challenge)
    }
  }

  const updateLevelProgress = (level: Level, challenge: Challenge) => {
    const completedChallenges = level.challenges.filter(c => c.completed).length
    level.progress = (completedChallenges / level.challenges.length) * 100
    
    if (level.progress >= 100) {
      level.completed = true
      awardXP(level.xpReward, `Selesai level: ${level.title}`)
    }
  }

  const awardXP = async (xp: number, activity: string) => {
    if (!user) return

    try {
      const response = await fetch('/api/update-xp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          activity,
          xpAmount: xp
        })
      })

      if (response.ok) {
        console.log(`Awarded ${xp} XP for ${activity}`)
      }
    } catch (error) {
      console.error('Error awarding XP:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-electric-blue/30 border-t-electric-blue rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Memuatkan sistem level...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Trophy className="w-10 h-10 text-yellow-400" />
            <div>
              <h1 className="text-4xl font-bold text-gradient">Jejak Pembelajaran DSKP</h1>
              <p className="text-gray-400">Cabaran berstruktur berdasarkan kurikulum Sains Komputer Malaysia</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Level List */}
          <div className="lg:col-span-1">
            <div className="glass-dark rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Senarai Level</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {levels.map((level) => (
                  <div
                    key={level.id}
                    onClick={() => startLevel(level)}
                    className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                      selectedLevel?.id === level.id
                        ? 'bg-electric-blue/20 border border-electric-blue/50'
                        : level.unlocked
                        ? 'bg-gray-800/50 border border-gray-700 hover:border-gray-600'
                        : 'bg-gray-800/30 border border-gray-600 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-white">Level {level.order}</h4>
                      <div className="flex items-center space-x-2">
                        {level.completed && (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        )}
                        {!level.unlocked && (
                          <Lock className="w-4 h-4 text-gray-500" />
                        )}
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          level.difficulty === 'mudah' ? 'bg-green-500/20 text-green-400' :
                          level.difficulty === 'sederhana' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {level.difficulty}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{level.title}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{level.category}</span>
                      <span>+{level.xpReward} XP</span>
                    </div>
                    {level.progress > 0 && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-700 rounded-full h-1">
                          <div 
                            className="bg-electric-blue h-1 rounded-full transition-all"
                            style={{ width: `${level.progress}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {Math.round(level.progress)}% selesai
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Level Content */}
          <div className="lg:col-span-2">
            {selectedLevel ? (
              <div className="glass-dark rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white">Level {selectedLevel.order}: {selectedLevel.title}</h3>
                    <p className="text-gray-400">{selectedLevel.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-center">
                      <div className="text-lg font-bold text-electric-blue">
                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                      </div>
                      <div className="text-xs text-gray-400">Masa</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-yellow-400">+{selectedLevel.xpReward}</div>
                      <div className="text-xs text-gray-400">XP</div>
                    </div>
                  </div>
                </div>

                {/* Level Progress */}
                <div className="mb-6 p-4 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-white">Kemajuan Level</h4>
                    <span className="text-sm text-gray-400">
                      {selectedLevel.challenges.filter(c => c.completed).length}/{selectedLevel.challenges.length} cabaran selesai
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-electric-blue to-neon-cyan h-2 rounded-full transition-all"
                      style={{ width: `${selectedLevel.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Challenges */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-white mb-4">Cabaran</h4>
                  {selectedLevel.challenges.map((challenge, index) => (
                    <div
                      key={challenge.id}
                      className={`p-4 rounded-lg border transition-all ${
                        challenge.completed
                          ? 'border-green-500/50 bg-green-500/10'
                          : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-white">Cabaran {index + 1}: {challenge.title}</h5>
                        <div className="flex items-center space-x-2">
                          {challenge.completed && (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          )}
                          <span className="text-xs text-gray-400">{challenge.type}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400 mb-3">{challenge.description}</p>
                      
                      {challenge.completed && (
                        <div className="text-sm text-green-400 mb-2">
                          Skor: {challenge.score}/{challenge.maxScore}
                        </div>
                      )}
                      
                      <button
                        onClick={() => startChallenge(challenge)}
                        className="px-4 py-2 bg-electric-blue hover:bg-electric-blue/90 text-white rounded-lg text-sm transition-colors"
                      >
                        {challenge.completed ? 'Lihat Semula' : 'Mulakan Cabaran'}
                      </button>
                    </div>
                  ))}
                </div>

                {/* Level Actions */}
                <div className="mt-6 flex items-center justify-between">
                  <button
                    onClick={() => {
                      selectedLevel.challenges.forEach(challenge => {
                        challenge.completed = false
                        challenge.score = 0
                      })
                      selectedLevel.progress = 0
                      selectedLevel.completed = false
                      setSelectedLevel({ ...selectedLevel })
                    }}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
                  >
                    Reset Level
                  </button>
                  
                  {selectedLevel.completed && (
                    <div className="flex items-center space-x-2 text-green-400">
                      <Trophy className="w-5 h-5" />
                      <span>Level Selesai! +{selectedLevel.xpReward} XP</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="glass-dark rounded-xl p-6 flex items-center justify-center h-96">
                <div className="text-center">
                  <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-400 mb-2">Pilih Level</h3>
                  <p className="text-gray-500">Pilih level dari senarai untuk mula cabaran</p>
                </div>
              </div>
            )}

            {/* Challenge Modal */}
            {currentChallenge && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="glass-dark rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">{currentChallenge.title}</h3>
                    <button
                      onClick={() => setCurrentChallenge(null)}
                      className="text-gray-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <p className="text-gray-300 mb-6">{currentChallenge.description}</p>

                  {/* Challenge Content based on type */}
                  {currentChallenge.type === 'quiz' && (
                    <div className="space-y-4">
                      {currentChallenge.content.questions.map((question: any, index: number) => (
                        <div key={index} className="p-4 bg-gray-800/50 rounded-lg">
                          <h4 className="font-medium text-white mb-3">{question.question}</h4>
                          <div className="space-y-2">
                            {question.options.map((option: string, optionIndex: number) => (
                              <label key={optionIndex} className="flex items-center space-x-3 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`question-${index}`}
                                  value={optionIndex}
                                  onChange={(e) => setUserAnswers({
                                    ...userAnswers,
                                    [`question-${index}`]: parseInt(e.target.value)
                                  })}
                                  className="w-4 h-4 text-electric-blue"
                                />
                                <span className="text-gray-300">{option}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                      
                      <button
                        onClick={() => submitQuiz(currentChallenge)}
                        className="w-full px-6 py-3 bg-electric-blue hover:bg-electric-blue/90 text-white font-medium rounded-lg transition-colors"
                      >
                        Hantar Jawapan
                      </button>
                    </div>
                  )}

                  {currentChallenge.type === 'coding' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-800/50 rounded-lg">
                        <h4 className="font-medium text-white mb-2">Tugasan:</h4>
                        <p className="text-gray-300 mb-4">{currentChallenge.content.task}</p>
                        
                        {currentChallenge.content.starterCode && (
                          <div className="mb-4">
                            <h5 className="font-medium text-white mb-2">Kod Permulaan:</h5>
                            <pre className="bg-gray-900 p-3 rounded text-sm text-gray-300 overflow-x-auto">
                              <code>{currentChallenge.content.starterCode}</code>
                            </pre>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-white mb-2">Kod Anda:</h4>
                        <textarea
                          value={userAnswers[`code-${currentChallenge.id}`] || ''}
                          onChange={(e) => setUserAnswers({
                            ...userAnswers,
                            [`code-${currentChallenge.id}`]: e.target.value
                          })}
                          className="w-full h-32 p-4 bg-gray-900 border border-gray-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-electric-blue resize-none"
                          placeholder="Tulis kod Python anda di sini..."
                        />
                      </div>
                      
                      <button
                        onClick={() => submitCodingChallenge(currentChallenge)}
                        className="w-full px-6 py-3 bg-electric-blue hover:bg-electric-blue/90 text-white font-medium rounded-lg transition-colors"
                      >
                        Hantar Kod
                      </button>
                    </div>
                  )}

                  {/* Results */}
                  {showResults && (
                    <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
                      <h4 className="font-medium text-white mb-2">Keputusan:</h4>
                      {currentChallenge.completed ? (
                        <div className="flex items-center space-x-2 text-green-400">
                          <CheckCircle className="w-5 h-5" />
                          <span>Tahniah! Cabaran selesai. Skor: {currentChallenge.score}/{currentChallenge.maxScore}</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 text-red-400">
                          <XCircle className="w-5 h-5" />
                          <span>Cuba lagi. Skor: {currentChallenge.score}/{currentChallenge.maxScore}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
