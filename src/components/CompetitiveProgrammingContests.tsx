'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  Trophy, 
  Medal, 
  Clock, 
  Users, 
  Code, 
  Play, 
  Pause,
  Square,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Zap,
  Target,
  Award,
  Crown,
  Flag,
  Timer,
  Calendar,
  MapPin,
  TrendingUp,
  BarChart3,
  Filter,
  Search,
  Download,
  Share2,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus,
  Eye,
  Lock,
  Unlock,
  Flame,
  Globe,
  Heart,
  ThumbsUp,
  MessageSquare,
  Send,
  Settings,
  RefreshCw,
  Info
} from 'lucide-react'
import { useNotifications } from './NotificationProvider'

interface Contest {
  id: string
  title: string
  description: string
  type: 'individual' | 'team' | 'open'
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  status: 'upcoming' | 'live' | 'ended' | 'archived'
  startTime: Date
  endTime: Date
  duration: number // in minutes
  maxParticipants: number
  currentParticipants: number
  problems: Problem[]
  prizes: Prize[]
  organizer: string
  tags: string[]
  isPrivate: boolean
  registrationDeadline: Date
  languages: string[]
}

interface Problem {
  id: string
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  points: number
  timeLimit: number // in seconds
  memoryLimit: number // in MB
  testCases: TestCase[]
  submissions: number
  solvedBy: number
  acceptanceRate: number
  constraints: string
  inputFormat: string
  outputFormat: string
  sampleInput: string
  sampleOutput: string
  explanation: string
  tags: string[]
}

interface TestCase {
  input: string
  expectedOutput: string
  isPublic: boolean
}

interface Participant {
  id: string
  name: string
  avatar: string
  country: string
  rating: number
  rank: number
  score: number
  penalty: number // time penalty in minutes
  submissions: Submission[]
  solved: string[] // problem IDs
  isTeam: boolean
  teamMembers?: string[]
}

interface Submission {
  id: string
  problemId: string
  participantId: string
  code: string
  language: string
  status: 'pending' | 'accepted' | 'wrong_answer' | 'time_limit' | 'memory_limit' | 'runtime_error' | 'compile_error'
  score: number
  time: number
  memory: number
  submittedAt: Date
  judgedAt?: Date
  testResults: TestResult[]
}

interface TestResult {
  testCase: number
  status: 'passed' | 'failed' | 'error'
  time: number
  memory: number
  output?: string
  error?: string
}

interface Prize {
  rank: number
  title: string
  description: string
  value?: string
  icon: string
}

export function CompetitiveProgrammingContests() {
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null)
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null)
  const [currentCode, setCurrentCode] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('javascript')
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [leaderboard, setLeaderboard] = useState<Participant[]>([])
  const [filter, setFilter] = useState({
    status: 'all',
    difficulty: 'all',
    type: 'all'
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [showSubmissions, setShowSubmissions] = useState(false)
  const [currentUser] = useState({
    id: 'user-1',
    name: 'Ahmad Competitive',
    avatar: '👨‍💻',
    country: 'Malaysia',
    rating: 1847
  })
  
  const { addNotification } = useNotifications()
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Mock contests data
  const contests: Contest[] = [
    {
      id: 'contest-1',
      title: 'CodeCikgu Weekly Challenge #47',
      description: 'Test your algorithmic skills with problems ranging from basic to advanced',
      type: 'individual',
      difficulty: 'intermediate',
      status: 'live',
      startTime: new Date(Date.now() - 30 * 60 * 1000), // Started 30 minutes ago
      endTime: new Date(Date.now() + 90 * 60 * 1000), // Ends in 90 minutes
      duration: 120,
      maxParticipants: 1000,
      currentParticipants: 847,
      problems: [],
      prizes: [
        { rank: 1, title: 'Gold Medal', description: 'Champion', value: 'RM500', icon: '🥇' },
        { rank: 2, title: 'Silver Medal', description: 'Runner-up', value: 'RM300', icon: '🥈' },
        { rank: 3, title: 'Bronze Medal', description: 'Third Place', value: 'RM200', icon: '🥉' }
      ],
      organizer: 'CodeCikgu Team',
      tags: ['algorithms', 'data-structures', 'problem-solving'],
      isPrivate: false,
      registrationDeadline: new Date(),
      languages: ['javascript', 'python', 'php', 'java', 'cpp']
    },
    {
      id: 'contest-2',
      title: 'Malaysia University Programming Contest',
      description: 'Inter-university programming competition for Malaysian students',
      type: 'team',
      difficulty: 'advanced',
      status: 'upcoming',
      startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // In 2 days
      endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hours duration
      duration: 180,
      maxParticipants: 300,
      currentParticipants: 156,
      problems: [],
      prizes: [
        { rank: 1, title: 'Champion University', description: 'Best Team', value: 'RM2000', icon: '🏆' },
        { rank: 2, title: 'First Runner-up', description: 'Second Best', value: 'RM1500', icon: '🥈' },
        { rank: 3, title: 'Second Runner-up', description: 'Third Best', value: 'RM1000', icon: '🥉' }
      ],
      organizer: 'Malaysian Computer Society',
      tags: ['university', 'team-contest', 'acm-icpc'],
      isPrivate: false,
      registrationDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
      languages: ['cpp', 'java', 'python']
    },
    {
      id: 'contest-3',
      title: 'Beginner Friendly Contest #12',
      description: 'Perfect for newcomers to competitive programming',
      type: 'individual',
      difficulty: 'beginner',
      status: 'ended',
      startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      duration: 120,
      maxParticipants: 500,
      currentParticipants: 423,
      problems: [],
      prizes: [
        { rank: 1, title: 'Rising Star', description: 'Best Beginner', icon: '⭐' },
        { rank: 2, title: 'Quick Learner', description: 'Fast Progress', icon: '🚀' },
        { rank: 3, title: 'Persistent Coder', description: 'Never Give Up', icon: '💪' }
      ],
      organizer: 'CodeCikgu Team',
      tags: ['beginner', 'learning', 'basics'],
      isPrivate: false,
      registrationDeadline: new Date(),
      languages: ['javascript', 'python', 'php']
    }
  ]

  // Mock problems for live contest
  const mockProblems: Problem[] = [
    {
      id: 'prob-1',
      title: 'Sum of Two Numbers',
      description: 'Given two integers A and B, calculate their sum.',
      difficulty: 'easy',
      points: 100,
      timeLimit: 1,
      memoryLimit: 256,
      testCases: [],
      submissions: 567,
      solvedBy: 489,
      acceptanceRate: 86.2,
      constraints: '1 ≤ A, B ≤ 10^9',
      inputFormat: 'Two integers A and B',
      outputFormat: 'Single integer representing A + B',
      sampleInput: '5 3',
      sampleOutput: '8',
      explanation: 'Simply add the two numbers: 5 + 3 = 8',
      tags: ['math', 'implementation']
    },
    {
      id: 'prob-2',
      title: 'Array Maximum',
      description: 'Find the maximum element in an array of integers.',
      difficulty: 'easy',
      points: 150,
      timeLimit: 2,
      memoryLimit: 256,
      testCases: [],
      submissions: 423,
      solvedBy: 356,
      acceptanceRate: 84.1,
      constraints: '1 ≤ N ≤ 10^5, 1 ≤ A[i] ≤ 10^9',
      inputFormat: 'First line: N (array size)\nSecond line: N integers',
      outputFormat: 'Maximum element in the array',
      sampleInput: '5\n3 7 2 9 4',
      sampleOutput: '9',
      explanation: 'The maximum element in [3, 7, 2, 9, 4] is 9',
      tags: ['arrays', 'implementation']
    },
    {
      id: 'prob-3',
      title: 'Palindrome Check',
      description: 'Check if a given string is a palindrome.',
      difficulty: 'medium',
      points: 250,
      timeLimit: 1,
      memoryLimit: 256,
      testCases: [],
      submissions: 298,
      solvedBy: 187,
      acceptanceRate: 62.7,
      constraints: '1 ≤ |S| ≤ 10^5',
      inputFormat: 'Single string S',
      outputFormat: '"YES" if palindrome, "NO" otherwise',
      sampleInput: 'racecar',
      sampleOutput: 'YES',
      explanation: '"racecar" reads the same forwards and backwards',
      tags: ['strings', 'two-pointers']
    },
    {
      id: 'prob-4',
      title: 'Binary Tree Traversal',
      description: 'Implement in-order traversal of a binary tree.',
      difficulty: 'hard',
      points: 400,
      timeLimit: 3,
      memoryLimit: 512,
      testCases: [],
      submissions: 156,
      solvedBy: 67,
      acceptanceRate: 42.9,
      constraints: '1 ≤ N ≤ 10^4 (number of nodes)',
      inputFormat: 'Tree structure representation',
      outputFormat: 'In-order traversal sequence',
      sampleInput: 'Tree: [1,null,2,3]',
      sampleOutput: '1 3 2',
      explanation: 'In-order traversal visits left subtree, root, then right subtree',
      tags: ['trees', 'recursion', 'data-structures']
    }
  ]

  // Mock leaderboard
  const mockLeaderboard: Participant[] = [
    {
      id: 'p1',
      name: 'CodingNinja',
      avatar: '🥷',
      country: 'Malaysia',
      rating: 2341,
      rank: 1,
      score: 750,
      penalty: 45,
      submissions: [],
      solved: ['prob-1', 'prob-2', 'prob-3'],
      isTeam: false
    },
    {
      id: 'p2',
      name: 'AlgoMaster',
      avatar: '🧠',
      country: 'Singapore',
      rating: 2198,
      rank: 2,
      score: 700,
      penalty: 52,
      submissions: [],
      solved: ['prob-1', 'prob-2', 'prob-3'],
      isTeam: false
    },
    {
      id: 'p3',
      name: 'CodeWarrior',
      avatar: '⚔️',
      country: 'Thailand',
      rating: 2067,
      rank: 3,
      score: 650,
      penalty: 38,
      submissions: [],
      solved: ['prob-1', 'prob-2'],
      isTeam: false
    },
    {
      id: 'p4',
      name: currentUser.name,
      avatar: currentUser.avatar,
      country: currentUser.country,
      rating: currentUser.rating,
      rank: 47,
      score: 250,
      penalty: 23,
      submissions: [],
      solved: ['prob-1'],
      isTeam: false
    }
  ]

  useEffect(() => {
    if (selectedContest && selectedContest.status === 'live') {
      selectedContest.problems = mockProblems
      setLeaderboard(mockLeaderboard)
      
      const endTime = selectedContest.endTime.getTime()
      const updateTimer = () => {
        const now = Date.now()
        const remaining = Math.max(0, endTime - now)
        setTimeRemaining(remaining)
        
        if (remaining === 0) {
          addNotification({
            type: 'info',
            title: '⏰ Contest Ended',
            message: 'The contest has ended. Final rankings are being calculated.'
          })
        }
      }
      
      updateTimer()
      timerRef.current = setInterval(updateTimer, 1000)
      
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }
      }
    }
  }, [selectedContest])

  const formatTime = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60))
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000)
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': case 'beginner': return 'text-green-400'
      case 'medium': case 'intermediate': return 'text-yellow-400'
      case 'hard': case 'advanced': return 'text-red-400'
      case 'expert': return 'text-purple-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'text-green-400'
      case 'upcoming': return 'text-blue-400'
      case 'ended': return 'text-gray-400'
      default: return 'text-gray-400'
    }
  }

  const submitSolution = async () => {
    if (!selectedProblem || !currentCode.trim()) {
      addNotification({
        type: 'error',
        title: '❌ Invalid Submission',
        message: 'Please write code before submitting'
      })
      return
    }

    setIsSubmitting(true)

    // Simulate submission process
    await new Promise(resolve => setTimeout(resolve, 2000))

    const isAccepted = Math.random() > 0.3 // 70% chance of acceptance
    const newSubmission: Submission = {
      id: 'sub-' + Date.now(),
      problemId: selectedProblem.id,
      participantId: currentUser.id,
      code: currentCode,
      language: selectedLanguage,
      status: isAccepted ? 'accepted' : 'wrong_answer',
      score: isAccepted ? selectedProblem.points : 0,
      time: Math.random() * selectedProblem.timeLimit * 1000,
      memory: Math.random() * 100,
      submittedAt: new Date(),
      judgedAt: new Date(),
      testResults: []
    }

    setSubmissions(prev => [newSubmission, ...prev])
    setIsSubmitting(false)

    addNotification({
      type: isAccepted ? 'success' : 'error',
      title: isAccepted ? '✅ Accepted!' : '❌ Wrong Answer',
      message: isAccepted 
        ? `Solution accepted! +${selectedProblem.points} points`
        : 'Your solution failed some test cases. Try again!'
    })

    if (isAccepted) {
      // Update leaderboard
      setLeaderboard(prev => prev.map(p => 
        p.id === currentUser.id 
          ? { ...p, score: p.score + selectedProblem.points, solved: [...p.solved, selectedProblem.id] }
          : p
      ))
    }
  }

  const joinContest = (contest: Contest) => {
    if (contest.status === 'upcoming') {
      addNotification({
        type: 'success',
        title: '✅ Registered!',
        message: `You've been registered for "${contest.title}"`
      })
    } else if (contest.status === 'live') {
      setSelectedContest(contest)
      addNotification({
        type: 'success',
        title: '🚀 Joined Contest!',
        message: `Welcome to "${contest.title}". Good luck!`
      })
    }
  }

  const filteredContests = contests.filter(contest => {
    const matchesSearch = contest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contest.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filter.status === 'all' || contest.status === filter.status
    const matchesDifficulty = filter.difficulty === 'all' || contest.difficulty === filter.difficulty
    const matchesType = filter.type === 'all' || contest.type === filter.type
    
    return matchesSearch && matchesStatus && matchesDifficulty && matchesType
  })

  if (selectedContest) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        {/* Contest Header */}
        <div className="glass-dark rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <button
                onClick={() => setSelectedContest(null)}
                className="text-electric-blue hover:text-blue-400 mb-2 flex items-center space-x-2"
              >
                ← Back to Contests
              </button>
              <h2 className="text-2xl font-bold text-white">{selectedContest.title}</h2>
              <p className="text-gray-400">{selectedContest.description}</p>
            </div>
            
            <div className="text-right">
              <div className={`text-2xl font-mono ${selectedContest.status === 'live' ? 'text-red-400' : 'text-gray-400'}`}>
                {selectedContest.status === 'live' ? formatTime(timeRemaining) : 'Contest Ended'}
              </div>
              <div className="text-gray-400 text-sm">Time Remaining</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>{selectedContest.currentParticipants}/{selectedContest.maxParticipants} participants</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>{selectedContest.duration} minutes</span>
            </div>
            <div className="flex items-center space-x-2">
              <Trophy className="w-4 h-4" />
              <span className={getDifficultyColor(selectedContest.difficulty)}>{selectedContest.difficulty}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-6" style={{ gridTemplateColumns: selectedProblem ? '1fr 1fr' : '1fr' }}>
          {/* Problems List */}
          <div className="space-y-6">
            {/* Problems */}
            <div className="glass-dark rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Problems</h3>
              
              <div className="space-y-3">
                {selectedContest.problems.map(problem => {
                  const isSolved = leaderboard.find(p => p.id === currentUser.id)?.solved.includes(problem.id)
                  
                  return (
                    <div
                      key={problem.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedProblem?.id === problem.id
                          ? 'border-electric-blue bg-blue-900/20'
                          : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
                      }`}
                      onClick={() => setSelectedProblem(problem)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                            isSolved ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
                          }`}>
                            {isSolved ? <CheckCircle className="w-4 h-4" /> : problem.id.split('-')[1]}
                          </div>
                          <h4 className="font-semibold text-white">{problem.title}</h4>
                        </div>
                        
                        <div className="flex items-center space-x-3 text-sm">
                          <span className={getDifficultyColor(problem.difficulty)}>{problem.difficulty}</span>
                          <span className="text-yellow-400">{problem.points} pts</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-400 text-sm mb-2">{problem.description}</p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{problem.submissions} submissions</span>
                        <span>{problem.solvedBy} solved</span>
                        <span>{problem.acceptanceRate.toFixed(1)}% acceptance</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Leaderboard Toggle */}
            <div className="flex space-x-4">
              <button
                onClick={() => setShowLeaderboard(!showLeaderboard)}
                className="flex-1 px-4 py-2 bg-electric-blue text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
              >
                <Trophy className="w-4 h-4" />
                <span>{showLeaderboard ? 'Hide' : 'Show'} Leaderboard</span>
              </button>
              
              <button
                onClick={() => setShowSubmissions(!showSubmissions)}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
              >
                <Code className="w-4 h-4" />
                <span>{showSubmissions ? 'Hide' : 'Show'} My Submissions</span>
              </button>
            </div>

            {/* Leaderboard */}
            {showLeaderboard && (
              <div className="glass-dark rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                  Leaderboard
                </h3>
                
                <div className="space-y-2">
                  {leaderboard.slice(0, 10).map((participant, index) => (
                    <div
                      key={participant.id}
                      className={`flex items-center space-x-4 p-3 rounded-lg ${
                        participant.id === currentUser.id ? 'bg-blue-900/20 border border-blue-600' : 'bg-gray-800/50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-yellow-500 text-black' :
                        index === 1 ? 'bg-gray-400 text-black' :
                        index === 2 ? 'bg-amber-600 text-black' :
                        'bg-gray-600 text-white'
                      }`}>
                        {index + 1}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{participant.avatar}</span>
                          <span className="font-semibold text-white">{participant.name}</span>
                          <span className="text-xs text-gray-400">({participant.country})</span>
                        </div>
                        <div className="text-xs text-gray-400">Rating: {participant.rating}</div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-bold text-white">{participant.score}</div>
                        <div className="text-xs text-gray-400">Penalty: {participant.penalty}m</div>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        {selectedContest.problems.map(problem => {
                          const solved = participant.solved.includes(problem.id)
                          return (
                            <div
                              key={problem.id}
                              className={`w-6 h-6 rounded text-xs flex items-center justify-center ${
                                solved ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-400'
                              }`}
                            >
                              {solved ? '✓' : ''}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* My Submissions */}
            {showSubmissions && (
              <div className="glass-dark rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">My Submissions</h3>
                
                {submissions.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    <Code className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No submissions yet. Start solving problems!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {submissions.map(submission => (
                      <div key={submission.id} className="p-4 bg-gray-800/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              submission.status === 'accepted' ? 'bg-green-500' :
                              submission.status === 'wrong_answer' ? 'bg-red-500' :
                              'bg-yellow-500'
                            }`}></div>
                            <span className="font-semibold text-white">
                              {selectedContest.problems.find(p => p.id === submission.problemId)?.title}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm">
                            <span className={`${
                              submission.status === 'accepted' ? 'text-green-400' :
                              submission.status === 'wrong_answer' ? 'text-red-400' :
                              'text-yellow-400'
                            }`}>
                              {submission.status.replace('_', ' ').toUpperCase()}
                            </span>
                            <span className="text-gray-400">{submission.language}</span>
                            <span className="text-gray-400">
                              {submission.submittedAt.toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-xs text-gray-400">
                          Score: {submission.score} • Time: {submission.time.toFixed(0)}ms • Memory: {submission.memory.toFixed(1)}MB
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Problem Viewer & Code Editor */}
          {selectedProblem && (
            <div className="space-y-6">
              {/* Problem Statement */}
              <div className="glass-dark rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">{selectedProblem.title}</h3>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(selectedProblem.difficulty)} bg-gray-800`}>
                      {selectedProblem.difficulty}
                    </span>
                    <span className="text-yellow-400 font-bold">{selectedProblem.points} points</span>
                  </div>
                </div>
                
                <div className="space-y-4 text-gray-300 text-sm">
                  <p>{selectedProblem.description}</p>
                  
                  <div>
                    <h4 className="font-semibold text-white mb-2">Constraints:</h4>
                    <p className="font-mono text-xs bg-gray-800 p-2 rounded">{selectedProblem.constraints}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-white mb-2">Input Format:</h4>
                      <p className="text-xs">{selectedProblem.inputFormat}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-2">Output Format:</h4>
                      <p className="text-xs">{selectedProblem.outputFormat}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-white mb-2">Sample Input:</h4>
                      <pre className="font-mono text-xs bg-gray-800 p-2 rounded">{selectedProblem.sampleInput}</pre>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-2">Sample Output:</h4>
                      <pre className="font-mono text-xs bg-gray-800 p-2 rounded">{selectedProblem.sampleOutput}</pre>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-white mb-2">Explanation:</h4>
                    <p className="text-xs">{selectedProblem.explanation}</p>
                  </div>
                </div>
              </div>

              {/* Code Editor */}
              <div className="glass-dark rounded-xl overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                  <h3 className="text-white font-semibold">Solution</h3>
                  
                  <div className="flex items-center space-x-4">
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="px-3 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="php">PHP</option>
                      <option value="java">Java</option>
                      <option value="cpp">C++</option>
                    </select>
                    
                    <div className="text-xs text-gray-400">
                      Time: {selectedProblem.timeLimit}s • Memory: {selectedProblem.memoryLimit}MB
                    </div>
                  </div>
                </div>
                
                <textarea
                  value={currentCode}
                  onChange={(e) => setCurrentCode(e.target.value)}
                  className="w-full h-64 p-4 bg-gray-900 text-gray-300 font-mono text-sm resize-none outline-none"
                  style={{ fontFamily: 'Fira Code, Monaco, Consolas, monospace' }}
                  placeholder="Write your solution here..."
                />
                
                <div className="p-4 border-t border-gray-700 flex items-center justify-between">
                  <div className="text-xs text-gray-400">
                    Lines: {currentCode.split('\n').length} • Characters: {currentCode.length}
                  </div>
                  
                  <button
                    onClick={submitSolution}
                    disabled={isSubmitting || !currentCode.trim()}
                    className="px-6 py-2 bg-electric-blue text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Solution</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gradient mb-2">Competitive Programming Contests</h2>
        <p className="text-gray-400">Test your skills against the best programmers</p>
      </div>

      {/* Filters */}
      <div className="glass-dark rounded-xl p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contests..."
              className="px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm outline-none focus:border-electric-blue"
            />
          </div>

          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
          >
            <option value="all">All Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="live">Live</option>
            <option value="ended">Ended</option>
          </select>

          <select
            value={filter.difficulty}
            onChange={(e) => setFilter({ ...filter, difficulty: e.target.value })}
            className="px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
          >
            <option value="all">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
          </select>

          <select
            value={filter.type}
            onChange={(e) => setFilter({ ...filter, type: e.target.value })}
            className="px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
          >
            <option value="all">All Types</option>
            <option value="individual">Individual</option>
            <option value="team">Team</option>
            <option value="open">Open</option>
          </select>
        </div>
      </div>

      {/* Contests Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredContests.map(contest => (
          <div key={contest.id} className="glass-dark rounded-xl p-6 hover:bg-gray-800/80 transition-colors">
            {/* Contest Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(contest.status)} bg-gray-800`}>
                    {contest.status.toUpperCase()}
                  </span>
                  {contest.status === 'live' && (
                    <div className="flex items-center space-x-1 text-red-400 text-xs">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span>LIVE</span>
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{contest.title}</h3>
                <p className="text-gray-400 text-sm">{contest.description}</p>
              </div>
            </div>

            {/* Contest Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Type:</span>
                <span className="text-white capitalize">{contest.type}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Difficulty:</span>
                <span className={getDifficultyColor(contest.difficulty)}>{contest.difficulty}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Duration:</span>
                <span className="text-white">{contest.duration} minutes</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Participants:</span>
                <span className="text-white">{contest.currentParticipants}/{contest.maxParticipants}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Start Time:</span>
                <span className="text-white">{contest.startTime.toLocaleDateString()}</span>
              </div>
            </div>

            {/* Prizes */}
            {contest.prizes.length > 0 && (
              <div className="mb-6">
                <h4 className="text-white font-semibold mb-2 flex items-center">
                  <Trophy className="w-4 h-4 mr-2 text-yellow-400" />
                  Prizes
                </h4>
                <div className="space-y-1">
                  {contest.prizes.slice(0, 3).map(prize => (
                    <div key={prize.rank} className="flex items-center justify-between text-xs">
                      <span className="text-gray-400 flex items-center">
                        <span className="mr-2">{prize.icon}</span>
                        {prize.title}
                      </span>
                      {prize.value && <span className="text-green-400">{prize.value}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {contest.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => joinContest(contest)}
              className={`w-full py-2 rounded-lg font-semibold transition-colors ${
                contest.status === 'live'
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : contest.status === 'upcoming'
                  ? 'bg-electric-blue text-white hover:bg-blue-600'
                  : 'bg-gray-600 text-gray-300 cursor-not-allowed'
              }`}
              disabled={contest.status === 'ended'}
            >
              {contest.status === 'live' && 'Join Contest'}
              {contest.status === 'upcoming' && 'Register'}
              {contest.status === 'ended' && 'View Results'}
            </button>
          </div>
        ))}
      </div>

      {filteredContests.length === 0 && (
        <div className="text-center text-gray-400 py-12">
          <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No contests found</h3>
          <p>Try adjusting your search criteria or check back later for new contests.</p>
        </div>
      )}
    </div>
  )
}
