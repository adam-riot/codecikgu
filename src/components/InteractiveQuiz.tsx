'use client'

import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, Trophy, RotateCcw, ChevronRight } from 'lucide-react'
import { useNotifications } from './NotificationProvider'

interface QuizOption {
  id: string
  text: string
  isCorrect: boolean
  explanation?: string
}

interface QuizQuestion {
  id: string
  question: string
  code?: string
  language?: string
  options: QuizOption[]
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
  timeLimit?: number // in seconds
  hint?: string
}

interface Quiz {
  id: string
  title: string
  description: string
  questions: QuizQuestion[]
  timeLimit?: number
  passingScore: number // percentage
  xpReward: number
}

// Sample quiz data
const sampleQuiz: Quiz = {
  id: 'php-basics',
  title: 'Asas PHP',
  description: 'Kuiz asas tentang sintaks dan konsep PHP',
  timeLimit: 300, // 5 minutes
  passingScore: 70,
  xpReward: 100,
  questions: [
    {
      id: 'q1',
      question: 'Bagaimana cara yang betul untuk memulakan kod PHP?',
      options: [
        { id: 'a', text: '<php>', isCorrect: false, explanation: 'Tag ini tidak wujud dalam PHP' },
        { id: 'b', text: '<?php', isCorrect: true, explanation: 'Betul! Ini adalah tag pembuka PHP yang standard' },
        { id: 'c', text: '<script type="php">', isCorrect: false, explanation: 'Ini untuk JavaScript, bukan PHP' },
        { id: 'd', text: '<?', isCorrect: false, explanation: 'Tag pendek ini tidak disyorkan' }
      ],
      difficulty: 'easy',
      category: 'syntax',
      hint: 'Tag pembuka PHP mesti mengandungi perkataan "php"'
    },
    {
      id: 'q2',
      question: 'Apakah output dari kod PHP berikut?',
      code: `<?php
$x = 10;
$y = 20;
echo $x + $y;
?>`,
      language: 'php',
      options: [
        { id: 'a', text: '10 + 20', isCorrect: false, explanation: 'PHP akan mengira nilai, bukan memaparkan ungkapan' },
        { id: 'b', text: '30', isCorrect: true, explanation: 'Betul! PHP akan mengira 10 + 20 = 30' },
        { id: 'c', text: '$x + $y', isCorrect: false, explanation: 'PHP akan gantikan pembolehubah dengan nilainya' },
        { id: 'd', text: 'Error', isCorrect: false, explanation: 'Kod ini adalah sah dan tidak akan menghasilkan ralat' }
      ],
      difficulty: 'medium',
      category: 'variables',
      timeLimit: 60
    },
    {
      id: 'q3',
      question: 'Pembolehubah PHP mesti bermula dengan simbol apa?',
      options: [
        { id: 'a', text: '&', isCorrect: false, explanation: 'Simbol & digunakan untuk reference, bukan pembolehubah' },
        { id: 'b', text: '#', isCorrect: false, explanation: 'Simbol # digunakan untuk komen, bukan pembolehubah' },
        { id: 'c', text: '$', isCorrect: true, explanation: 'Betul! Semua pembolehubah PHP mesti bermula dengan $' },
        { id: 'd', text: '%', isCorrect: false, explanation: 'Simbol % digunakan untuk modulo operator' }
      ],
      difficulty: 'easy',
      category: 'variables'
    }
  ]
}

interface QuizState {
  currentQuestionIndex: number
  answers: Record<string, string>
  timeRemaining: number
  isCompleted: boolean
  score: number
  showResults: boolean
}

export function InteractiveQuiz({ quiz }: { quiz: Quiz }) {
  const [state, setState] = useState<QuizState>({
    currentQuestionIndex: 0,
    answers: {},
    timeRemaining: quiz.timeLimit || 0,
    isCompleted: false,
    score: 0,
    showResults: false
  })
  const [selectedOption, setSelectedOption] = useState<string>('')
  const [showExplanation, setShowExplanation] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const { addNotification } = useNotifications()

  const currentQuestion = quiz.questions[state.currentQuestionIndex]

  // Timer effect
  useEffect(() => {
    if (state.timeRemaining > 0 && !state.isCompleted) {
      const timer = setTimeout(() => {
        setState(prev => ({ ...prev, timeRemaining: prev.timeRemaining - 1 }))
      }, 1000)
      return () => clearTimeout(timer)
    } else if (state.timeRemaining === 0 && !state.isCompleted) {
      handleQuizComplete()
    }
  }, [state.timeRemaining, state.isCompleted])

  const handleAnswerSelect = (optionId: string) => {
    setSelectedOption(optionId)
    setShowExplanation(false)
    setShowHint(false)
  }

  const handleAnswerSubmit = () => {
    if (!selectedOption) return

    const newAnswers = { ...state.answers, [currentQuestion.id]: selectedOption }
    setState(prev => ({ ...prev, answers: newAnswers }))
    setShowExplanation(true)

    // Auto advance after showing explanation
    setTimeout(() => {
      if (state.currentQuestionIndex < quiz.questions.length - 1) {
        handleNextQuestion()
      } else {
        handleQuizComplete()
      }
    }, 3000)
  }

  const handleNextQuestion = () => {
    setState(prev => ({
      ...prev,
      currentQuestionIndex: prev.currentQuestionIndex + 1
    }))
    setSelectedOption('')
    setShowExplanation(false)
    setShowHint(false)
  }

  const handleQuizComplete = () => {
    const score = calculateScore()
    setState(prev => ({
      ...prev,
      isCompleted: true,
      score,
      showResults: true
    }))

    const passed = score >= quiz.passingScore
    addNotification({
      type: passed ? 'success' : 'error',
      title: passed ? '🎉 Kuiz Berjaya!' : '📚 Cuba Lagi',
      message: `Skor anda: ${score}%. ${passed ? `Anda mendapat ${quiz.xpReward} XP!` : 'Teruskan pembelajaran!'}`
    })
  }

  const calculateScore = () => {
    let correct = 0
    quiz.questions.forEach(question => {
      const userAnswer = state.answers[question.id]
      const correctOption = question.options.find(opt => opt.isCorrect)
      if (userAnswer === correctOption?.id) {
        correct++
      }
    })
    return Math.round((correct / quiz.questions.length) * 100)
  }

  const restartQuiz = () => {
    setState({
      currentQuestionIndex: 0,
      answers: {},
      timeRemaining: quiz.timeLimit || 0,
      isCompleted: false,
      score: 0,
      showResults: false
    })
    setSelectedOption('')
    setShowExplanation(false)
    setShowHint(false)
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

  if (state.showResults) {
    return <QuizResults quiz={quiz} state={state} onRestart={restartQuiz} />
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">{quiz.title}</h2>
          <p className="text-gray-400">{quiz.description}</p>
        </div>
        {quiz.timeLimit && (
          <div className="flex items-center space-x-2 text-electric-blue">
            <Clock className="w-5 h-5" />
            <span className="font-mono text-lg">{formatTime(state.timeRemaining)}</span>
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
          <span>Soalan {state.currentQuestionIndex + 1} dari {quiz.questions.length}</span>
          <span>{Math.round(((state.currentQuestionIndex + 1) / quiz.questions.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-electric-blue to-neon-cyan h-2 rounded-full transition-all duration-300"
            style={{ width: `${((state.currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="glass-dark rounded-xl p-6 mb-6">
        {/* Question Meta */}
        <div className="flex items-center justify-between mb-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getDifficultyColor(currentQuestion.difficulty)}`}>
            {currentQuestion.difficulty.toUpperCase()}
          </span>
          <span className="text-sm text-gray-400">{currentQuestion.category}</span>
        </div>

        {/* Question */}
        <h3 className="text-xl font-semibold text-white mb-4">{currentQuestion.question}</h3>

        {/* Code Block */}
        {currentQuestion.code && (
          <div className="bg-black/50 rounded-lg p-4 mb-4 border border-gray-700">
            <pre className="text-sm text-green-400 overflow-x-auto">
              <code>{currentQuestion.code}</code>
            </pre>
          </div>
        )}

        {/* Hint */}
        {currentQuestion.hint && (
          <div className="mb-4">
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-yellow-400 hover:text-yellow-300 text-sm underline"
            >
              {showHint ? 'Sembunyikan Hint' : 'Tunjukkan Hint'}
            </button>
            {showHint && (
              <div className="mt-2 p-3 bg-yellow-400/10 border border-yellow-400/30 rounded-lg">
                <p className="text-yellow-300 text-sm">{currentQuestion.hint}</p>
              </div>
            )}
          </div>
        )}

        {/* Options */}
        <div className="space-y-3 mb-6">
          {currentQuestion.options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleAnswerSelect(option.id)}
              disabled={showExplanation}
              className={`w-full text-left p-4 rounded-lg border transition-all ${
                selectedOption === option.id
                  ? showExplanation
                    ? option.isCorrect
                      ? 'bg-green-500/20 border-green-500 text-green-300'
                      : 'bg-red-500/20 border-red-500 text-red-300'
                    : 'bg-electric-blue/20 border-electric-blue text-white'
                  : showExplanation && option.isCorrect
                    ? 'bg-green-500/20 border-green-500 text-green-300'
                    : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-medium">
                  {option.id.toUpperCase()}
                </span>
                <span>{option.text}</span>
                {showExplanation && selectedOption === option.id && (
                  option.isCorrect ? <CheckCircle className="w-5 h-5 ml-auto" /> : <XCircle className="w-5 h-5 ml-auto" />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Explanation */}
        {showExplanation && (
          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-600 mb-4">
            <h4 className="font-semibold text-white mb-2">Penjelasan:</h4>
            <p className="text-gray-300 text-sm">
              {currentQuestion.options.find(opt => opt.id === selectedOption)?.explanation}
            </p>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end">
          {!showExplanation ? (
            <button
              onClick={handleAnswerSubmit}
              disabled={!selectedOption}
              className="px-6 py-3 bg-gradient-to-r from-electric-blue to-neon-cyan text-black font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
            >
              Hantar Jawapan
            </button>
          ) : (
            <div className="flex items-center text-gray-400 text-sm">
              <span>Soalan seterusnya dalam 3 saat...</span>
              <ChevronRight className="w-4 h-4 ml-2" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Quiz Results Component
function QuizResults({ quiz, state, onRestart }: { 
  quiz: Quiz
  state: QuizState
  onRestart: () => void 
}) {
  const passed = state.score >= quiz.passingScore

  return (
    <div className="max-w-2xl mx-auto p-6 text-center">
      <div className="glass-dark rounded-xl p-8">
        {/* Result Icon */}
        <div className="mb-6">
          {passed ? (
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto" />
          ) : (
            <RotateCcw className="w-16 h-16 text-gray-400 mx-auto" />
          )}
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-white mb-2">
          {passed ? 'Tahniah!' : 'Cuba Lagi!'}
        </h2>
        
        <p className="text-gray-400 mb-6">
          {passed 
            ? `Anda telah lulus kuiz "${quiz.title}"` 
            : `Anda memerlukan ${quiz.passingScore}% untuk lulus`
          }
        </p>

        {/* Score */}
        <div className="mb-6">
          <div className={`text-6xl font-bold mb-2 ${passed ? 'text-green-400' : 'text-red-400'}`}>
            {state.score}%
          </div>
          <div className="text-gray-400">
            {Object.keys(state.answers).length} dari {quiz.questions.length} soalan dijawab
          </div>
        </div>

        {/* XP Reward */}
        {passed && (
          <div className="mb-6 p-4 bg-gradient-to-r from-electric-blue/20 to-neon-cyan/20 rounded-lg border border-electric-blue/30">
            <div className="text-electric-blue font-semibold">+{quiz.xpReward} XP</div>
            <div className="text-sm text-gray-400">Ganjaran XP diperoleh!</div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={onRestart}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Cuba Lagi
          </button>
          <button className="px-6 py-3 bg-gradient-to-r from-electric-blue to-neon-cyan text-black font-semibold rounded-lg hover:shadow-lg transition-all">
            Kuiz Seterusnya
          </button>
        </div>
      </div>
    </div>
  )
}

// Quiz Selector Component
export function QuizSelector({ onSelectQuizAction }: { onSelectQuizAction: (quiz: Quiz) => void }) {
  const quizzes = [sampleQuiz] // Add more quizzes here

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gradient mb-2">Kuiz Interaktif</h2>
        <p className="text-gray-400">Uji pengetahuan anda dan dapatkan XP!</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="glass-dark rounded-xl p-6 card-hover">
            <h3 className="text-xl font-semibold text-white mb-2">{quiz.title}</h3>
            <p className="text-gray-400 mb-4">{quiz.description}</p>
            
            <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
              <span>{quiz.questions.length} soalan</span>
              <span>+{quiz.xpReward} XP</span>
            </div>

            <button
              onClick={() => onSelectQuizAction(quiz)}
              className="w-full btn-primary"
            >
              Mula Kuiz
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
