'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'
import { FaCheckCircle, FaTimesCircle, FaClock, FaTrophy, FaRedo, FaArrowRight } from 'react-icons/fa'

interface Question {
  id: string
  question_text: string
  options: string[]
  correct_answer: string
  points: number
  order_index: number
}

interface Challenge {
  id: string
  title: string
  description: string
  xp_reward: number
  pass_criteria: {
    min_score: number
    total_questions: number
  }
}

interface QuizChallengeProps {
  challenge: Challenge
  questions: Question[]
  onComplete: (score: number, passed: boolean) => void
  onBack: () => void
}

export default function QuizChallenge({ 
  challenge, 
  questions, 
  onComplete, 
  onBack 
}: QuizChallengeProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [timeLeft, setTimeLeft] = useState(1800) // 30 minutes
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [quizStarted, setQuizStarted] = useState(false)
  const [results, setResults] = useState<{
    score: number
    totalQuestions: number
    correctAnswers: number
    passed: boolean
    questionResults: Array<{
      questionId: string
      correct: boolean
      userAnswer: string
      correctAnswer: string
      points: number
    }>
  } | null>(null)

  const currentQuestion = questions[currentQuestionIndex]
  const totalQuestions = questions.length

  // Timer countdown
  useEffect(() => {
    if (!quizStarted || showResults) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmitQuiz()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [quizStarted, showResults])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleAnswerSelect = (answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }))
  }

  const handleSubmitQuiz = async () => {
    setIsSubmitting(true)
    
    // Calculate results
    let score = 0
    let correctCount = 0
    const questionResults = questions.map(question => {
      const userAnswer = answers[question.id] || ''
      const isCorrect = userAnswer === question.correct_answer
      if (isCorrect) {
        score += question.points
        correctCount++
      }
      
      return {
        questionId: question.id,
        correct: isCorrect,
        userAnswer,
        correctAnswer: question.correct_answer,
        points: question.points
      }
    })

    const passed = score >= challenge.pass_criteria.min_score
    
    setResults({
      score,
      totalQuestions,
      correctAnswers: correctCount,
      passed,
      questionResults
    })

    setShowResults(true)
    setIsSubmitting(false)
    
    // Submit to database
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('challenge_submissions').insert({
          challenge_id: challenge.id,
          user_id: user.id,
          answers: answers,
          score: score,
          max_score: questions.reduce((sum, q) => sum + q.points, 0),
          passed: passed,
          status: passed ? 'completed' : 'failed',
          submission_type: 'quiz'
        })
      }
    } catch (error) {
      console.error('Error submitting quiz:', error)
    }

    onComplete(score, passed)
  }

  if (!quizStarted) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaTrophy className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">{challenge.title}</h1>
            <p className="text-gray-300">{challenge.description}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-400 mb-2">Maklumat Kuiz</h3>
              <ul className="text-gray-300 space-y-1 text-sm">
                <li>• {totalQuestions} soalan</li>
                <li>• Masa: 30 minit</li>
                <li>• Markah lulus: {challenge.pass_criteria.min_score}</li>
                <li>• XP reward: {challenge.xp_reward} XP</li>
              </ul>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-400 mb-2">Arahan</h3>
              <ul className="text-gray-300 space-y-1 text-sm">
                <li>• Pilih jawapan yang paling tepat</li>
                <li>• Anda boleh kembali ke soalan sebelumnya</li>
                <li>• Kuiz akan auto-submit bila masa tamat</li>
                <li>• Pastikan sambungan internet stabil</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={onBack}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-500 transition-colors"
            >
              Kembali
            </button>
            <button
              onClick={() => setQuizStarted(true)}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300"
            >
              Mula Kuiz
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (showResults && results) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700 p-8">
          <div className="text-center mb-8">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              results.passed 
                ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                : 'bg-gradient-to-br from-red-500 to-pink-600'
            }`}>
              {results.passed ? (
                <FaCheckCircle className="w-8 h-8 text-white" />
              ) : (
                <FaTimesCircle className="w-8 h-8 text-white" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {results.passed ? 'Tahniah! Anda Lulus!' : 'Kuiz Tidak Lulus'}
            </h1>
            <p className="text-gray-300">
              {results.passed 
                ? `Anda telah berjaya menyelesaikan kuiz dengan jayanya!`
                : `Jangan putus asa, cuba lagi untuk meningkatkan markah anda.`
              }
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-800/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">{results.score}</div>
              <div className="text-sm text-gray-400">Markah</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">
                {results.correctAnswers}/{results.totalQuestions}
              </div>
              <div className="text-sm text-gray-400">Betul</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-400 mb-1">
                {Math.round((results.correctAnswers / results.totalQuestions) * 100)}%
              </div>
              <div className="text-sm text-gray-400">Peratusan</div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={onBack}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-500 transition-colors"
            >
              Kembali ke Senarai
            </button>
            {!results.passed && (
              <button
                onClick={() => {
                  setQuizStarted(false)
                  setShowResults(false)
                  setAnswers({})
                  setCurrentQuestionIndex(0)
                  setTimeLeft(1800)
                  setResults(null)
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <FaRedo className="w-4 h-4" />
                Cuba Lagi
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">{challenge.title}</h1>
            <p className="text-gray-400">
              Soalan {currentQuestionIndex + 1} daripada {totalQuestions}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-orange-400">
              <FaClock className="w-4 h-4" />
              <span className="font-mono">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-2 mb-8">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>

        {/* Question */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-white mb-6">
            {currentQuestion.question_text}
          </h2>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const optionLetter = String.fromCharCode(65 + index) // A, B, C, D
              const isSelected = answers[currentQuestion.id] === optionLetter
              
              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(optionLetter)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500/20 text-white'
                      : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500 hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                      isSelected ? 'border-blue-400 bg-blue-500 text-white' : 'border-gray-500 text-gray-400'
                    }`}>
                      {optionLetter}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-500 transition-colors"
          >
            Sebelumnya
          </button>

          <div className="flex gap-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  index === currentQuestionIndex
                    ? 'bg-blue-500 text-white'
                    : answers[questions[index].id]
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {currentQuestionIndex === totalQuestions - 1 ? (
            <button
              onClick={handleSubmitQuiz}
              disabled={isSubmitting || Object.keys(answers).length !== totalQuestions}
              className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isSubmitting ? 'Menghantar...' : 'Hantar Kuiz'}
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.min(totalQuestions - 1, prev + 1))}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              Seterusnya
              <FaArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
