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
  ArrowLeft,
  Medal,
  Gift,
  Flame
} from 'lucide-react'
import { supabase } from '@/utils/supabase'

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
  challenges: Challenge[]
  unlocked: boolean
  completed: boolean
  progress: number
  order: number
}

interface Challenge {
  id: string
  level_id: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'hard'
  xp_reward: number
  time_estimate: number
  theory_content: any
  tasks: any[]
  prerequisites: string[]
  unlock_conditions: string[]
  completion_rate: number
  average_score: number
  order_index: number
  is_active: boolean
  completed: boolean
  score: number
  maxScore: number
  status: 'not_started' | 'in_progress' | 'completed' | 'locked'
}

interface UserProgress {
  id: string
  student_id: string
  level_id: string
  challenge_id: string
  status: 'not_started' | 'in_progress' | 'completed' | 'locked'
  score: number
  max_score: number
  attempts: number
  time_spent: number
  completed_tasks: string[]
  task_scores: any
  started_at: string
  completed_at: string
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  xp_reward: number
  category: string
  earned: boolean
  progress: number
  max_progress: number
}

export default function EnhancedLevelSystem() {
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null)
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [userAnswers, setUserAnswers] = useState<{[key: string]: any}>({})
  const [showResults, setShowResults] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [levels, setLevels] = useState<Level[]>([])
  const [userProgress, setUserProgress] = useState<UserProgress[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [userXP, setUserXP] = useState(0)
  const [userLevel, setUserLevel] = useState(1)
  const [showAchievements, setShowAchievements] = useState(false)

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
        await loadUserData(session.user.id)
      }
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUserData = async (userId: string) => {
    try {
      // Load user profile and XP
      const { data: profile } = await supabase
        .from('profiles')
        .select('xp, level')
        .eq('id', userId)
        .single()

      if (profile) {
        setUserXP(profile.xp || 0)
        setUserLevel(profile.level || 1)
      }

      // Load levels
      const { data: levelsData } = await supabase
        .from('levels')
        .select('*')
        .order('level_number', { ascending: true })
        .order('sublevel_number', { ascending: true })

      if (levelsData) {
        const levelsWithChallenges = await Promise.all(
          levelsData.map(async (level: any) => {
            const { data: challenges } = await supabase
              .from('level_challenges')
              .select('*')
              .eq('level_id', level.id)
              .order('order_index', { ascending: true })

            return {
              ...level,
              challenges: challenges || [],
              unlocked: (profile?.xp || 0) >= level.xp_required_min,
              completed: false,
              progress: 0,
              order: level.level_number * 10 + level.sublevel_number
            }
          })
        )
        setLevels(levelsWithChallenges)
      }

      // Load user progress
      const { data: progressData } = await supabase
        .from('student_level_progress')
        .select('*')
        .eq('student_id', userId)

      if (progressData) {
        setUserProgress(progressData)
      }

      // Load achievements
      await loadAchievements(userId)

    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  const loadAchievements = async (userId: string) => {
    try {
      const { data: achievementsData } = await supabase
        .from('badges')
        .select('*')
        .order('created_at', { ascending: true })

      if (achievementsData) {
        const { data: userBadges } = await supabase
          .from('student_badges')
          .select('badge_id')
          .eq('student_id', userId)

        const earnedBadgeIds = userBadges?.map((b: any) => b.badge_id) || []

        const achievementsWithProgress = achievementsData.map((achievement: any) => ({
          id: achievement.id,
          title: achievement.title,
          description: achievement.description,
          icon: achievement.icon,
          xp_reward: achievement.xp_reward,
          category: achievement.category,
          earned: earnedBadgeIds.includes(achievement.id),
          progress: earnedBadgeIds.includes(achievement.id) ? 100 : 0,
          max_progress: 100
        }))

        setAchievements(achievementsWithProgress)
      }
    } catch (error) {
      console.error('Error loading achievements:', error)
    }
  }

  const startLevel = (level: Level) => {
    setSelectedLevel(level)
    setTimeLeft(level.challenges.reduce((total, c) => total + (c.time_estimate || 30), 0) * 60)
    setIsTimerRunning(true)
    setUserAnswers({})
    setShowResults(false)
  }

  const startChallenge = (challenge: Challenge) => {
    setCurrentChallenge(challenge)
    setUserAnswers({})
    setShowResults(false)
    
    // Update progress status
    updateChallengeProgress(challenge.id, 'in_progress')
  }

  const submitQuiz = async (challenge: Challenge) => {
    let score = 0
    const questions = challenge.theory_content?.questions || []
    
    questions.forEach((question: any, index: number) => {
      const userAnswer = userAnswers[`question-${index}`]
      if (userAnswer === question.correct) {
        score++
      }
    })

    const maxScore = questions.length
    const isCompleted = score >= maxScore * 0.8

    // Update challenge progress
    await updateChallengeProgress(challenge.id, isCompleted ? 'completed' : 'in_progress', score, maxScore)

    if (isCompleted) {
      // Award XP
      await awardXP(challenge.xp_reward, `Completed challenge: ${challenge.title}`)
      
      // Check for achievements
      await checkAchievements()
    }

    setShowResults(true)
  }

  const submitCodingChallenge = async (challenge: Challenge) => {
    const userCode = userAnswers[`code-${challenge.id}`] || ''
    
    // Simple code validation (can be enhanced with AI analysis)
    let score = 0
    let maxScore = 1
    
    if (challenge.tasks && challenge.tasks.length > 0) {
      maxScore = challenge.tasks.length
      challenge.tasks.forEach((task: any, index: number) => {
        if (task.type === 'code_check' && userCode.includes(task.required_pattern)) {
          score++
        }
      })
    } else {
      // Default validation
      if (userCode.includes('print') && userCode.includes('Hello')) {
        score = 1
      }
    }

    const isCompleted = score >= maxScore * 0.8

    // Update challenge progress
    await updateChallengeProgress(challenge.id, isCompleted ? 'completed' : 'in_progress', score, maxScore)

    if (isCompleted) {
      // Award XP
      await awardXP(challenge.xp_reward, `Completed coding challenge: ${challenge.title}`)
      
      // Check for achievements
      await checkAchievements()
    }

    setShowResults(true)
  }

  const updateChallengeProgress = async (challengeId: string, status: 'not_started' | 'in_progress' | 'completed' | 'locked', score?: number, maxScore?: number) => {
    if (!user) return

    try {
      const { data: existingProgress } = await supabase
        .from('student_level_progress')
        .select('*')
        .eq('student_id', user.id)
        .eq('challenge_id', challengeId)
        .single()

      const progressData: Partial<UserProgress> = {
        student_id: user.id,
        challenge_id: challengeId,
        status,
        score: score || 0,
        max_score: maxScore || 100,
        attempts: (existingProgress?.attempts || 0) + 1,
        time_spent: timeLeft,
        completed_at: status === 'completed' ? new Date().toISOString() : undefined
      }

      if (existingProgress) {
        await supabase
          .from('student_level_progress')
          .update(progressData)
          .eq('id', existingProgress.id)
      } else {
        await supabase
          .from('student_level_progress')
          .insert(progressData)
      }

      // Update local state
      setUserProgress(prev => {
        const existing = prev.find(p => p.challenge_id === challengeId)
        if (existing) {
          return prev.map(p => p.challenge_id === challengeId ? { ...p, ...progressData } : p)
        } else {
          const newProgress: UserProgress = {
            id: '',
            student_id: user.id,
            level_id: '',
            challenge_id: challengeId,
            status: status as 'not_started' | 'in_progress' | 'completed' | 'locked',
            score: score || 0,
            max_score: maxScore || 100,
            attempts: (existingProgress?.attempts || 0) + 1,
            time_spent: timeLeft,
            completed_tasks: [],
            task_scores: {},
            started_at: new Date().toISOString(),
            completed_at: status === 'completed' ? new Date().toISOString() : ''
          }
          return [...prev, newProgress]
        }
      })

    } catch (error) {
      console.error('Error updating challenge progress:', error)
    }
  }

  const awardXP = async (xp: number, activity: string) => {
    if (!user) return

    try {
      // Use the award_xp function
      const { error } = await supabase.rpc('award_xp', {
        p_user_id: user.id,
        p_activity: activity,
        p_xp: xp
      })

      if (!error) {
        setUserXP(prev => prev + xp)
        
        // Check for level up
        const newLevel = Math.floor((userXP + xp) / 1000) + 1
        if (newLevel > userLevel) {
          setUserLevel(newLevel)
          // Show level up notification
          setShowAchievements(true)
        }
      }
    } catch (error) {
      console.error('Error awarding XP:', error)
    }
  }

  const checkAchievements = async () => {
    if (!user) return

    try {
      // Check for various achievements based on user progress
      const achievementsToCheck = [
        {
          id: 'first_challenge',
          condition: () => userProgress.filter(p => p.status === 'completed').length >= 1,
          title: 'First Challenge',
          description: 'Complete your first challenge',
          xp_reward: 50
        },
        {
          id: 'level_1_complete',
          condition: () => userLevel >= 1,
          title: 'Level 1 Complete',
          description: 'Reach level 1',
          xp_reward: 100
        },
        {
          id: 'perfect_score',
          condition: () => userProgress.some(p => p.score === p.max_score),
          title: 'Perfect Score',
          description: 'Get a perfect score on any challenge',
          xp_reward: 200
        }
      ]

      for (const achievement of achievementsToCheck) {
        if (achievement.condition() && !achievements.find(a => a.id === achievement.id)?.earned) {
          // Award achievement
          await supabase
            .from('student_badges')
            .insert({
              student_id: user.id,
              badge_id: achievement.id,
              earned_at: new Date().toISOString()
            })

          // Award XP
          await awardXP(achievement.xp_reward, `Achievement: ${achievement.title}`)
        }
      }

      // Reload achievements
      await loadAchievements(user.id)

    } catch (error) {
      console.error('Error checking achievements:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black flex items-center justify-center">
        <div className="glass-dark rounded-2xl p-8 text-center">
          <div className="text-2xl text-gradient loading-dots">Memuat sistem gamifikasi</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="glass-dark rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gradient mb-2">Sistem Level & Pencapaian</h1>
              <p className="text-gray-300">Jalan pembelajaran berstruktur dengan ganjaran XP</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-4">
                <div className="glass-dark rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-400" />
                    <span className="text-xl font-bold text-white">{userXP}</span>
                    <span className="text-gray-300">XP</span>
                  </div>
                </div>
                <div className="glass-dark rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-400" />
                    <span className="text-xl font-bold text-white">Level {userLevel}</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowAchievements(!showAchievements)}
                  className="glass-dark rounded-lg p-4 hover:bg-white/10 transition-colors"
                >
                  <Award className="w-5 h-5 text-purple-400" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements Modal */}
        {showAchievements && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="glass-dark rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gradient">Pencapaian & Lencana</h2>
                <button
                  onClick={() => setShowAchievements(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`glass-dark rounded-lg p-4 border ${
                      achievement.earned ? 'border-green-500/50' : 'border-gray-600/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        achievement.earned ? 'bg-green-500/20' : 'bg-gray-600/20'
                      }`}>
                        <Award className={`w-6 h-6 ${
                          achievement.earned ? 'text-green-400' : 'text-gray-400'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{achievement.title}</h3>
                        <p className="text-sm text-gray-300">{achievement.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex-1 bg-gray-600 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full transition-all"
                              style={{ width: `${achievement.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400">{achievement.progress}%</span>
                        </div>
                      </div>
                      {achievement.earned && (
                        <div className="text-green-400">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Levels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {levels.map((level) => (
            <div
              key={level.id}
              className={`glass-dark rounded-2xl p-6 border transition-all hover:scale-105 ${
                level.unlocked ? 'border-blue-500/50' : 'border-gray-600/50'
              } ${level.completed ? 'border-green-500/50' : ''}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${
                    level.unlocked ? 'bg-blue-500/20' : 'bg-gray-600/20'
                  }`}>
                    {level.unlocked ? (
                      <Unlock className="w-6 h-6 text-blue-400" />
                    ) : (
                      <Lock className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{level.title}</h3>
                    <p className="text-sm text-gray-300">Level {level.level_number}.{level.sublevel_number}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gradient">{level.xp_required_min}</div>
                  <div className="text-xs text-gray-400">XP Required</div>
                </div>
              </div>

              <p className="text-gray-300 text-sm mb-4">{level.description}</p>

              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-300">Progress</span>
                  <span className="text-white">{level.progress}%</span>
                </div>
                <div className="bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full transition-all"
                    style={{ width: `${level.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-gray-300">{level.challenges.length} Challenges</span>
                </div>
                <button
                  onClick={() => level.unlocked && startLevel(level)}
                  disabled={!level.unlocked}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    level.unlocked
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {level.unlocked ? 'Mulakan' : 'Dikunci'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
