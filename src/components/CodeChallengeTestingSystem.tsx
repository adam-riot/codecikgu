'use client'

import React, { useState, useEffect } from 'react'
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Trophy, 
  Code,
  Target,
  AlertCircle,
  Info,
  Flame,
  Users,
  Timer
} from 'lucide-react'
import { useNotifications } from './NotificationProvider'

interface TestCase {
  id: string
  input: string
  expectedOutput: string
  description: string
  isHidden: boolean
}

interface CodeChallenge {
  id: string
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
  language: string
  timeLimit: number // in minutes
  starterCode: string
  solution: string
  testCases: TestCase[]
  hints: string[]
  concepts: string[]
  points: number
  completedBy: number
  successRate: number
  tags: string[]
  examples: Array<{
    input: string
    output: string
    explanation: string
  }>
}

interface TestResult {
  passed: boolean
  testCaseId: string
  input: string
  expectedOutput: string
  actualOutput: string
  executionTime: number
  error?: string
}

interface SubmissionResult {
  totalTests: number
  passedTests: number
  testResults: TestResult[]
  executionTime: number
  memoryUsage?: number
  score: number
  feedback: string
  passed: boolean
}

// Sample challenges data
const sampleChallenges: CodeChallenge[] = [
  {
    id: 'sum-two-numbers',
    title: 'Jumlah Dua Nombor',
    description: 'Tulis fungsi yang menerima dua nombor dan mengembalikan jumlahnya. Ini adalah cabaran asas untuk memulakan.',
    difficulty: 'easy',
    category: 'Mathematics',
    language: 'php',
    timeLimit: 15,
    starterCode: `<?php
function sumTwoNumbers($a, $b) {
    // Tulis kod anda di sini
    
}

// Contoh penggunaan:
// echo sumTwoNumbers(5, 3); // Sepatutnya return 8
?>`,
    solution: `<?php
function sumTwoNumbers($a, $b) {
    return $a + $b;
}
?>`,
    testCases: [
      { id: 'test1', input: '5,3', expectedOutput: '8', description: 'Nombor positif asas', isHidden: false },
      { id: 'test2', input: '-2,7', expectedOutput: '5', description: 'Nombor negatif dan positif', isHidden: false },
      { id: 'test3', input: '0,0', expectedOutput: '0', description: 'Kedua-dua nombor sifar', isHidden: true },
      { id: 'test4', input: '-5,-3', expectedOutput: '-8', description: 'Kedua-dua nombor negatif', isHidden: true },
      { id: 'test5', input: '100,200', expectedOutput: '300', description: 'Nombor besar', isHidden: true }
    ],
    hints: [
      'Gunakan operator + untuk tambah dua nombor',
      'Pastikan fungsi mengembalikan hasil menggunakan return',
      'PHP tidak memerlukan type declaration untuk parameter'
    ],
    concepts: ['Variables', 'Functions', 'Basic Arithmetic', 'Return Statements'],
    points: 10,
    completedBy: 1420,
    successRate: 94.5,
    tags: ['beginner', 'math', 'functions'],
    examples: [
      { input: '5, 3', output: '8', explanation: 'Tambahkan 5 + 3 = 8' },
      { input: '-2, 7', output: '5', explanation: 'Tambahkan -2 + 7 = 5' }
    ]
  },
  {
    id: 'reverse-string',
    title: 'Membalikkan String',
    description: 'Tulis fungsi yang membalikkan string tanpa menggunakan fungsi built-in seperti strrev(). Implementasikan algoritma sendiri.',
    difficulty: 'medium',
    category: 'String Manipulation',
    language: 'php',
    timeLimit: 30,
    starterCode: `<?php
function reverseString($str) {
    // Tulis kod anda di sini
    // Jangan gunakan strrev() atau fungsi built-in lain
    
}

// Contoh penggunaan:
// echo reverseString("hello"); // Sepatutnya return "olleh"
?>`,
    solution: `<?php
function reverseString($str) {
    $length = strlen($str);
    $reversed = '';
    for ($i = $length - 1; $i >= 0; $i--) {
        $reversed .= $str[$i];
    }
    return $reversed;
}
?>`,
    testCases: [
      { id: 'test1', input: 'hello', expectedOutput: 'olleh', description: 'String biasa', isHidden: false },
      { id: 'test2', input: 'PHP', expectedOutput: 'PHP', description: 'String palindrome', isHidden: false },
      { id: 'test3', input: '', expectedOutput: '', description: 'String kosong', isHidden: true },
      { id: 'test4', input: 'a', expectedOutput: 'a', description: 'Satu karakter', isHidden: true },
      { id: 'test5', input: 'Hello World!', expectedOutput: '!dlroW olleH', description: 'String dengan ruang dan tanda', isHidden: true }
    ],
    hints: [
      'Gunakan loop untuk iterasi melalui string',
      'Mulakan dari akhir string (length-1) dan pergi ke mula (0)',
      'Bina string baru dengan menambah karakter satu demi satu'
    ],
    concepts: ['Loops', 'String Manipulation', 'Array Indexing', 'String Concatenation'],
    points: 25,
    completedBy: 856,
    successRate: 73.2,
    tags: ['strings', 'loops', 'algorithms'],
    examples: [
      { input: '"hello"', output: '"olleh"', explanation: 'Balikkan setiap karakter dari belakang ke depan' },
      { input: '"abc"', output: '"cba"', explanation: 'a->c, b->b, c->a' }
    ]
  },
  {
    id: 'fibonacci-sequence',
    title: 'Urutan Fibonacci',
    description: 'Implementasikan fungsi yang mengira nombor Fibonacci ke-n menggunakan pendekatan rekursif ATAU iteratif. Optimasi untuk prestasi yang baik.',
    difficulty: 'hard',
    category: 'Algorithms',
    language: 'php',
    timeLimit: 45,
    starterCode: `<?php
function fibonacci($n) {
    // Implementasikan urutan Fibonacci
    // F(0) = 0, F(1) = 1, F(n) = F(n-1) + F(n-2)
    
}

// Contoh penggunaan:
// echo fibonacci(5); // Sepatutnya return 5
// echo fibonacci(10); // Sepatutnya return 55
?>`,
    solution: `<?php
function fibonacci($n) {
    if ($n <= 1) return $n;
    
    $a = 0;
    $b = 1;
    
    for ($i = 2; $i <= $n; $i++) {
        $temp = $a + $b;
        $a = $b;
        $b = $temp;
    }
    
    return $b;
}
?>`,
    testCases: [
      { id: 'test1', input: '0', expectedOutput: '0', description: 'F(0) = 0', isHidden: false },
      { id: 'test2', input: '1', expectedOutput: '1', description: 'F(1) = 1', isHidden: false },
      { id: 'test3', input: '5', expectedOutput: '5', description: 'F(5) = 5', isHidden: false },
      { id: 'test4', input: '10', expectedOutput: '55', description: 'F(10) = 55', isHidden: true },
      { id: 'test5', input: '15', expectedOutput: '610', description: 'F(15) = 610', isHidden: true },
      { id: 'test6', input: '20', expectedOutput: '6765', description: 'F(20) = 6765 (ujian prestasi)', isHidden: true }
    ],
    hints: [
      'Mulakan dengan kes asas: F(0) = 0, F(1) = 1',
      'Untuk pendekatan iteratif, gunakan dua pembolehubah untuk menjejaki nilai sebelumnya',
      'Elakkan rekursif mudah kerana ia lambat untuk nombor besar',
      'Pertimbangkan menggunakan memoization jika menggunakan rekursif'
    ],
    concepts: ['Recursion', 'Dynamic Programming', 'Mathematical Sequences', 'Optimization'],
    points: 50,
    completedBy: 324,
    successRate: 45.8,
    tags: ['algorithms', 'math', 'recursion', 'optimization'],
    examples: [
      { input: '5', output: '5', explanation: 'F(5) = F(4) + F(3) = 3 + 2 = 5' },
      { input: '6', output: '8', explanation: 'F(6) = F(5) + F(4) = 5 + 3 = 8' }
    ]
  }
]

export function CodeChallengeTestingSystem() {
  const [challenges] = useState<CodeChallenge[]>(sampleChallenges)
  const [selectedChallenge, setSelectedChallenge] = useState<CodeChallenge | null>(null)
  const [currentView, setCurrentView] = useState<'list' | 'challenge'>('list')
  const [userCode, setUserCode] = useState('')
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [showHints, setShowHints] = useState(false)
  const [usedHints, setUsedHints] = useState<number>(0)
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'difficulty' | 'points' | 'completion'>('difficulty')
  const { addNotification } = useNotifications()

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (timeRemaining !== null && timeRemaining > 0 && currentView === 'challenge') {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev !== null && prev > 0) {
            return prev - 1
          }
          return 0
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timeRemaining, currentView])

  // Auto-save user code
  useEffect(() => {
    if (selectedChallenge && userCode) {
      const timeout = setTimeout(() => {
        localStorage.setItem(`challenge_${selectedChallenge.id}_code`, userCode)
      }, 1000)
      return () => clearTimeout(timeout)
    }
  }, [userCode, selectedChallenge])

  const startChallenge = (challenge: CodeChallenge) => {
    setSelectedChallenge(challenge)
    setCurrentView('challenge')
    setTimeRemaining(challenge.timeLimit * 60) // Convert to seconds
    setUsedHints(0)
    setShowHints(false)
    setSubmissionResult(null)
    
    // Load saved code or use starter code
    const savedCode = localStorage.getItem(`challenge_${challenge.id}_code`)
    setUserCode(savedCode || challenge.starterCode)
    
    addNotification({
      type: 'info',
      title: '🚀 Cabaran Dimulakan',
      message: `Masa had: ${challenge.timeLimit} minit`
    })
  }

  const runTests = async () => {
    if (!selectedChallenge) return

    setIsRunning(true)
    
    try {
      // Simulate code execution and testing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock test execution results
      const testResults: TestResult[] = selectedChallenge.testCases.map(testCase => {
        // Simulate test execution logic
        const passed = Math.random() > 0.3 // 70% pass rate for demo
        return {
          passed,
          testCaseId: testCase.id,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: passed ? testCase.expectedOutput : 'Wrong output',
          executionTime: Math.random() * 100,
          error: passed ? undefined : 'Logic error in implementation'
        }
      })

      const passedTests = testResults.filter(r => r.passed).length
      const totalTests = testResults.length
      const score = Math.round((passedTests / totalTests) * selectedChallenge.points)
      const passed = passedTests === totalTests

      const result: SubmissionResult = {
        totalTests,
        passedTests,
        testResults,
        executionTime: Math.random() * 1000,
        score,
        feedback: generateFeedback(passedTests, totalTests),
        passed
      }

      setSubmissionResult(result)

      if (passed) {
        addNotification({
          type: 'success',
          title: '🎉 Cabaran Berjaya!',
          message: `+${score} mata! Semua test case passed.`
        })
      } else {
        addNotification({
          type: 'error',
          title: '❌ Masih Ada Ralat',
          message: `${passedTests}/${totalTests} test case passed. Cuba lagi!`
        })
      }

    } catch {
      addNotification({
        type: 'error',
        title: '🐛 Ralat Pelaksanaan',
        message: 'Terdapat masalah semasa menjalankan kod anda'
      })
    } finally {
      setIsRunning(false)
    }
  }

  const generateFeedback = (passed: number, total: number): string => {
    const percentage = (passed / total) * 100
    
    if (percentage === 100) {
      return '🎉 Sempurna! Kod anda lulus semua test case dengan jayanya. Anda telah menguasai konsep ini dengan baik.'
    } else if (percentage >= 80) {
      return '👍 Hampir sempurna! Majoriti test case lulus. Cuba semak kes edge cases yang mungkin terlepas.'
    } else if (percentage >= 60) {
      return '📚 Pada landasan yang betul! Beberapa test case lulus. Semak semula logik dan cuba debug step by step.'
    } else if (percentage >= 40) {
      return '🔍 Perlu lebih usaha. Semak balik konsep asas dan cuba fahami requirement dengan lebih mendalam.'
    } else {
      return '💡 Jangan putus asa! Gunakan hints yang disediakan dan cuba fahami contoh yang diberikan terlebih dahulu.'
    }
  }

  const useHint = () => {
    if (!selectedChallenge || usedHints >= selectedChallenge.hints.length) return
    
    setUsedHints(prev => prev + 1)
    setShowHints(true)
    
    addNotification({
      type: 'info',
      title: '💡 Hint Digunakan',
      message: `Hint ${usedHints + 1}/${selectedChallenge.hints.length} telah dibuka`
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-400/20'
      case 'medium': return 'text-yellow-400 bg-yellow-400/20'
      case 'hard': return 'text-red-400 bg-red-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const filteredChallenges = challenges
    .filter(challenge => {
      const matchesDifficulty = filterDifficulty === 'all' || challenge.difficulty === filterDifficulty
      const matchesCategory = filterCategory === 'all' || challenge.category === filterCategory
      return matchesDifficulty && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'points':
          return b.points - a.points
        case 'completion':
          return b.completedBy - a.completedBy
        case 'difficulty':
        default:
          const difficultyOrder = { easy: 1, medium: 2, hard: 3 }
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
      }
    })

  const categories = [...new Set(challenges.map(c => c.category))]

  if (currentView === 'challenge' && selectedChallenge) {
    return (
      <ChallengeView
        challenge={selectedChallenge}
        userCode={userCode}
        setUserCode={setUserCode}
        submissionResult={submissionResult}
        isRunning={isRunning}
        timeRemaining={timeRemaining}
        showHints={showHints}
        usedHints={usedHints}
        onBack={() => setCurrentView('list')}
        onRunTests={runTests}
        onUseHint={useHint}
        formatTime={formatTime}
      />
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gradient mb-2">Cabaran Kod</h2>
        <p className="text-gray-400">Uji kemahiran programming anda dengan cabaran yang mencabar</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass-dark rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <Code className="w-8 h-8 text-electric-blue" />
            <div>
              <h3 className="text-2xl font-bold text-white">{challenges.length}</h3>
              <p className="text-gray-400 text-sm">Cabaran Tersedia</p>
            </div>
          </div>
        </div>
        
        <div className="glass-dark rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-8 h-8 text-green-400" />
            <div>
              <h3 className="text-2xl font-bold text-white">
                {challenges.filter(c => localStorage.getItem(`challenge_${c.id}_completed`)).length}
              </h3>
              <p className="text-gray-400 text-sm">Selesai</p>
            </div>
          </div>
        </div>
        
        <div className="glass-dark rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <div>
              <h3 className="text-2xl font-bold text-white">
                {challenges.reduce((total, c) => {
                  return total + (localStorage.getItem(`challenge_${c.id}_completed`) ? c.points : 0)
                }, 0)}
              </h3>
              <p className="text-gray-400 text-sm">Mata Dikumpul</p>
            </div>
          </div>
        </div>
        
        <div className="glass-dark rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <Flame className="w-8 h-8 text-orange-400" />
            <div>
              <h3 className="text-2xl font-bold text-white">
                {Math.round(challenges.reduce((total, c) => total + c.successRate, 0) / challenges.length)}%
              </h3>
              <p className="text-gray-400 text-sm">Kadar Kejayaan</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-dark rounded-xl p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
          >
            <option value="all">Semua Tahap</option>
            <option value="easy">Mudah</option>
            <option value="medium">Sederhana</option>
            <option value="hard">Sukar</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
          >
            <option value="all">Semua Kategori</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
          >
            <option value="difficulty">Tahap Kesukaran</option>
            <option value="points">Mata Tertinggi</option>
            <option value="completion">Paling Popular</option>
          </select>
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
          />
        ))}
      </div>
    </div>
  )
}

function ChallengeCard({ 
  challenge, 
  onStart, 
  getDifficultyColor 
}: {
  challenge: CodeChallenge
  onStart: () => void
  getDifficultyColor: (difficulty: string) => string
}) {
  const isCompleted = localStorage.getItem(`challenge_${challenge.id}_completed`) === 'true'
  
  return (
    <div className="glass-dark rounded-xl p-6 card-hover group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2">{challenge.title}</h3>
          <p className="text-gray-400 text-sm line-clamp-2">{challenge.description}</p>
        </div>
        
        {isCompleted && (
          <CheckCircle className="w-6 h-6 text-green-400 ml-2" />
        )}
      </div>

      {/* Meta Info */}
      <div className="flex items-center justify-between mb-4">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getDifficultyColor(challenge.difficulty)}`}>
          {challenge.difficulty.toUpperCase()}
        </span>
        
        <div className="flex items-center space-x-3 text-gray-400 text-sm">
          <span className="flex items-center space-x-1">
            <Trophy className="w-3 h-3" />
            <span>{challenge.points}</span>
          </span>
          <span className="flex items-center space-x-1">
            <Users className="w-3 h-3" />
            <span>{challenge.completedBy}</span>
          </span>
          <span className="flex items-center space-x-1">
            <Timer className="w-3 h-3" />
            <span>{challenge.timeLimit}m</span>
          </span>
        </div>
      </div>

      {/* Success Rate */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-400">Kadar Kejayaan</span>
          <span className="text-white">{challenge.successRate.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-700 h-2 rounded-full">
          <div 
            className="bg-gradient-to-r from-green-400 to-electric-blue h-2 rounded-full transition-all"
            style={{ width: `${challenge.successRate}%` }}
          />
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {challenge.tags.slice(0, 3).map(tag => (
          <span key={tag} className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded">
            {tag}
          </span>
        ))}
      </div>

      {/* Action Button */}
      <button
        onClick={onStart}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
          isCompleted 
            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
            : 'bg-electric-blue text-black hover:bg-electric-blue/80'
        }`}
      >
        {isCompleted ? 'Cuba Lagi' : 'Mula Cabaran'}
      </button>
    </div>
  )
}

function ChallengeView({
  challenge,
  userCode,
  setUserCode,
  submissionResult,
  isRunning,
  timeRemaining,
  showHints,
  usedHints,
  onBack,
  onRunTests,
  onUseHint,
  formatTime
}: {
  challenge: CodeChallenge
  userCode: string
  setUserCode: (code: string) => void
  submissionResult: SubmissionResult | null
  isRunning: boolean
  timeRemaining: number | null
  showHints: boolean
  usedHints: number
  onBack: () => void
  onRunTests: () => void
  onUseHint: () => void
  formatTime: (seconds: number) => string
}) {
  const [activeTab, setActiveTab] = useState<'description' | 'examples' | 'hints' | 'results'>('description')

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ← Kembali ke Senarai
        </button>
        
        <div className="flex items-center space-x-4">
          {timeRemaining !== null && (
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
              timeRemaining < 300 ? 'bg-red-500/20 text-red-400' : 'bg-gray-800 text-gray-300'
            }`}>
              <Clock className="w-4 h-4" />
              <span className="font-mono">{formatTime(timeRemaining)}</span>
            </div>
          )}
          
          <button
            onClick={onUseHint}
            disabled={usedHints >= challenge.hints.length}
            className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            💡 Hint ({usedHints}/{challenge.hints.length})
          </button>
        </div>
      </div>

      {/* Challenge Info */}
      <div className="glass-dark rounded-xl p-6 mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">{challenge.title}</h1>
        <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
          <span className={`px-2 py-1 rounded ${
            challenge.difficulty === 'easy' ? 'bg-green-400/20 text-green-400' :
            challenge.difficulty === 'medium' ? 'bg-yellow-400/20 text-yellow-400' :
            'bg-red-400/20 text-red-400'
          }`}>
            {challenge.difficulty.toUpperCase()}
          </span>
          <span>{challenge.category}</span>
          <span>{challenge.timeLimit} minit</span>
          <span>{challenge.points} mata</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Panel - Challenge Details */}
        <div className="space-y-6">
          {/* Tabs */}
          <div className="glass-dark rounded-xl">
            <div className="flex border-b border-gray-700">
              {[
                { id: 'description', label: 'Penerangan', icon: Info },
                { id: 'examples', label: 'Contoh', icon: Code },
                { id: 'hints', label: 'Hints', icon: AlertCircle },
                { id: 'results', label: 'Keputusan', icon: CheckCircle }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 text-sm transition-colors ${
                    activeTab === tab.id 
                      ? 'text-electric-blue border-b-2 border-electric-blue' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === 'description' && (
                <div className="space-y-4">
                  <p className="text-gray-300">{challenge.description}</p>
                  
                  <div>
                    <h4 className="text-white font-semibold mb-2">Konsep yang Dipelajari:</h4>
                    <div className="flex flex-wrap gap-2">
                      {challenge.concepts.map(concept => (
                        <span key={concept} className="px-2 py-1 bg-electric-blue/20 text-electric-blue text-sm rounded">
                          {concept}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-white font-semibold mb-2">Test Cases:</h4>
                    <div className="space-y-2">
                      {challenge.testCases.filter(tc => !tc.isHidden).map(testCase => (
                        <div key={testCase.id} className="p-3 bg-gray-800/50 rounded">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">{testCase.description}</span>
                          </div>
                          <div className="text-sm text-gray-400 mt-1">
                            Input: <code className="bg-gray-700 px-1 rounded">{testCase.input}</code> → 
                            Output: <code className="bg-gray-700 px-1 rounded ml-1">{testCase.expectedOutput}</code>
                          </div>
                        </div>
                      ))}
                      <div className="text-gray-400 text-sm">
                        + {challenge.testCases.filter(tc => tc.isHidden).length} hidden test cases
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'examples' && (
                <div className="space-y-4">
                  {challenge.examples.map((example, index) => (
                    <div key={index} className="p-4 bg-gray-800/50 rounded">
                      <h4 className="text-white font-semibold mb-2">Contoh {index + 1}</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-400">Input: </span>
                          <code className="bg-gray-700 px-2 py-1 rounded text-white">{example.input}</code>
                        </div>
                        <div>
                          <span className="text-gray-400">Output: </span>
                          <code className="bg-gray-700 px-2 py-1 rounded text-white">{example.output}</code>
                        </div>
                        <div>
                          <span className="text-gray-400">Penjelasan: </span>
                          <span className="text-gray-300">{example.explanation}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'hints' && (
                <div className="space-y-4">
                  {showHints && usedHints > 0 ? (
                    challenge.hints.slice(0, usedHints).map((hint, index) => (
                      <div key={index} className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded">
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-400 text-sm font-bold mt-0.5">
                            {index + 1}
                          </div>
                          <p className="text-gray-300">{hint}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">Tiada hints digunakan lagi</p>
                      <p className="text-gray-500 text-sm">Gunakan butang hint di atas untuk mendapatkan bantuan</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'results' && (
                <div className="space-y-4">
                  {submissionResult ? (
                    <div className="space-y-4">
                      {/* Overall Result */}
                      <div className={`p-4 rounded-lg ${
                        submissionResult.passed ? 'bg-green-500/20 border border-green-500/50' : 'bg-red-500/20 border border-red-500/50'
                      }`}>
                        <div className="flex items-center space-x-3 mb-2">
                          {submissionResult.passed ? (
                            <CheckCircle className="w-6 h-6 text-green-400" />
                          ) : (
                            <XCircle className="w-6 h-6 text-red-400" />
                          )}
                          <div>
                            <h3 className="text-white font-semibold">
                              {submissionResult.passed ? 'Lulus Semua Test!' : 'Ada Test yang Gagal'}
                            </h3>
                            <p className="text-gray-300 text-sm">
                              {submissionResult.passedTests}/{submissionResult.totalTests} test cases passed
                            </p>
                          </div>
                        </div>
                        <p className="text-gray-300 text-sm">{submissionResult.feedback}</p>
                      </div>

                      {/* Test Results */}
                      <div className="space-y-2">
                        {submissionResult.testResults.map((result, index) => (
                          <div key={result.testCaseId} className={`p-3 rounded border ${
                            result.passed ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'
                          }`}>
                            <div className="flex items-center justify-between">
                              <span className="text-white font-medium">Test Case {index + 1}</span>
                              {result.passed ? (
                                <CheckCircle className="w-4 h-4 text-green-400" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-400" />
                              )}
                            </div>
                            <div className="text-sm text-gray-400 mt-1">
                              <div>Input: <code>{result.input}</code></div>
                              <div>Expected: <code>{result.expectedOutput}</code></div>
                              <div>Actual: <code>{result.actualOutput}</code></div>
                              {result.error && (
                                <div className="text-red-400 mt-1">Error: {result.error}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Target className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">Belum ada keputusan</p>
                      <p className="text-gray-500 text-sm">Jalankan kod anda untuk melihat keputusan</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="space-y-6">
          {/* Code Editor */}
          <div className="glass-dark rounded-xl">
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">Code Editor</h3>
                <span className="text-gray-400 text-sm">{challenge.language.toUpperCase()}</span>
              </div>
            </div>
            
            <div className="p-4">
              <textarea
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                className="w-full h-96 bg-gray-900 text-white font-mono text-sm p-4 rounded border border-gray-600 focus:outline-none focus:border-electric-blue resize-none"
                placeholder="Tulis kod anda di sini..."
              />
            </div>

            <div className="p-4 border-t border-gray-700">
              <button
                onClick={onRunTests}
                disabled={isRunning}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRunning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                    Menjalankan Test...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Jalankan Test Cases
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
