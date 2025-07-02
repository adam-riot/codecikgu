'use client'

// OLD (Lucide)
import { Play, Pause, Volume2 } from 'lucide-react'

// NEW (React Icons)
import { FaPlay, FaPause, FaVolumeUp } from 'react-icons/fa'
import { MdQuiz, MdVideoLibrary, MdUpload } from 'react-icons/md'


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
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100

  // Timer effect
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

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleSubmitQuiz = async () => {
    setIsSubmitting(true)

    // Calculate results
    let score = 0
    let correctAnswers = 0
    const questionResults = questions.map(question => {
      const userAnswer = answers[question.id]
      const isCorrect = userAnswer === question.correct_answer
      if (isCorrect) {
        score += question.points
        correctAnswers++
      }
      return {
        questionId: question.id,
        correct: isCorrect,
        userAnswer: userAnswer || '',
        correctAnswer: question.correct_answer,
        points: isCorrect ? question.points : 0
      }
    })

    const passed = score >= challenge.pass_criteria.min_score

    const quizResults = {
      score,
      totalQuestions,
      correctAnswers,
      passed,
      questionResults
    }

    setResults(quizResults)
    setShowResults(true)
    setIsSubmitting(false)

    // Call parent completion handler
    onComplete(score, passed)
  }

  const handleRetry = () => {
    setCurrentQuestionIndex(0)
    setAnswers({})
    setShowResults(false)
    setTimeLeft(1800)
    setQuizStarted(false)
    setResults(null)
  }

  const getAnsweredCount = () => {
    return Object.keys(answers).length
  }

  const getOptionLetter = (index: number) => {
    return String.fromCharCode(65 + index) // A, B, C, D
  }

  if (!quizStarted) {
    return (
      <div className="max-w-4xl mx-auto">
        {/* Quiz Instructions */}
        <div className="glass-dark rounded-2xl p-8 mb-6">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-electric-blue to-neon-cyan rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📝</span>
            </div>
            <h1 className="text-3xl font-bold text-gradient mb-2">{challenge.title}</h1>
            <p className="text-gray-300 text-lg">{challenge.description}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="glass rounded-xl p-6 text-center">
              <div className="text-2xl font-bold text-gradient mb-2">{totalQuestions}</div>
              <div className="text-gray-400">Soalan</div>
            </div>
            <div className="glass rounded-xl p-6 text-center">
              <div className="text-2xl font-bold text-gradient mb-2">30</div>
              <div className="text-gray-400">Minit</div>
            </div>
            <div className="glass rounded-xl p-6 text-center">
              <div className="text-2xl font-bold text-gradient mb-2">{challenge.xp_reward}</div>
              <div className="text-gray-400">XP Ganjaran</div>
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6 mb-8">
            <h3 className="text-yellow-400 font-semibold mb-3 flex items-center gap-2">
              <span>⚠️</span>
              Arahan Penting
            </h3>
            <ul className="text-yellow-200 space-y-2 text-sm">
              <li>• Anda mempunyai 30 minit untuk menyelesaikan kuiz ini</li>
              <li>• Markah minimum untuk lulus: {challenge.pass_criteria.min_score} markah</li>
              <li>• Anda boleh kembali ke soalan sebelumnya untuk mengubah jawapan</li>
              <li>• Kuiz akan auto-submit apabila masa tamat</li>
              <li>• Pastikan sambungan internet stabil sepanjang kuiz</li>
            </ul>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={onBack}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-500 transition-colors"
            >
              Kembali
            </button>
            <button
              onClick={() => setQuizStarted(true)}
              className="px-8 py-3 bg-gradient-to-r from-electric-blue to-neon-cyan text-white rounded-lg font-medium hover:shadow-lg hover:shadow-electric-blue/25 transition-all duration-300 flex items-center gap-2"
            >
              Mula Kuiz
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (showResults && results) {
    return (
      <div className="max-w-4xl mx-auto">
        {/* Results Header */}
        <div className="glass-dark rounded-2xl p-8 mb-6 text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
            results.passed 
              ? 'bg-gradient-to-br from-neon-green to-electric-blue' 
              : 'bg-gradient-to-br from-red-500 to-orange-500'
          }`}>
            {results.passed ? (
              <CheckCircle className="w-10 h-10 text-white" />
            ) : (
              <XCircle className="w-10 h-10 text-white" />
            )}
          </div>
          
          <h1 className="text-3xl font-bold mb-2">
            {results.passed ? (
              <span className="text-gradient-green">Tahniah! Anda Lulus!</span>
            ) : (
              <span className="text-red-400">Kuiz Tidak Lulus</span>
            )}
          </h1>
          
          <p className="text-gray-300 text-lg mb-6">
            {results.passed 
              ? `Anda telah berjaya menyelesaikan kuiz dengan jayanya!`
              : `Jangan putus asa. Cuba lagi untuk meningkatkan markah anda.`
            }
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass rounded-xl p-4">
              <div className="text-2xl font-bold text-gradient mb-1">{results.score}</div>
              <div className="text-gray-400 text-sm">Markah</div>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="text-2xl font-bold text-gradient mb-1">{results.correctAnswers}/{results.totalQuestions}</div>
              <div className="text-gray-400 text-sm">Betul</div>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="text-2xl font-bold text-gradient mb-1">{Math.round((results.correctAnswers / results.totalQuestions) * 100)}%</div>
              <div className="text-gray-400 text-sm">Peratusan</div>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="text-2xl font-bold text-gradient mb-1">{results.passed ? challenge.xp_reward : 0}</div>
              <div className="text-gray-400 text-sm">XP Diperoleh</div>
            </div>
          </div>
        </div>

        {/* Question Review */}
        <div className="glass-dark rounded-2xl p-8 mb-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span>📋</span>
            Semakan Jawapan
          </h2>
          
          <div className="space-y-6">
            {questions.map((question, index) => {
              const result = results.questionResults.find(r => r.questionId === question.id)
              if (!result) return null

              return (
                <div key={question.id} className={`glass rounded-xl p-6 border-2 ${
                  result.correct ? 'border-neon-green/30' : 'border-red-500/30'
                }`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      result.correct ? 'bg-neon-green/20 text-neon-green' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {result.correct ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <XCircle className="w-5 h-5" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-3">
                        {index + 1}. {question.question_text}
                      </h3>
                      
                      <div className="grid md:grid-cols-2 gap-3 mb-3">
                        {question.options.map((option, optionIndex) => {
                          const optionLetter = getOptionLetter(optionIndex)
                          const isUserAnswer = result.userAnswer === optionLetter
                          const isCorrectAnswer = question.correct_answer === optionLetter
                          
                          return (
                            <div
                              key={optionIndex}
                              className={`p-3 rounded-lg border-2 ${
                                isCorrectAnswer
                                  ? 'border-neon-green/50 bg-neon-green/10'
                                  : isUserAnswer && !isCorrectAnswer
                                  ? 'border-red-500/50 bg-red-500/10'
                                  : 'border-gray-600/50'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                                  isCorrectAnswer
                                    ? 'bg-neon-green text-black'
                                    : isUserAnswer && !isCorrectAnswer
                                    ? 'bg-red-500 text-white'
                                    : 'bg-gray-600 text-white'
                                }`}>
                                  {optionLetter}
                                </span>
                                <span className={`${
                                  isCorrectAnswer
                                    ? 'text-neon-green font-semibold'
                                    : isUserAnswer && !isCorrectAnswer
                                    ? 'text-red-400'
                                    : 'text-gray-300'
                                }`}>
                                  {option}
                                </span>
                                {isCorrectAnswer && (
                                  <CheckCircle className="w-4 h-4 text-neon-green ml-auto" />
                                )}
                                {isUserAnswer && !isCorrectAnswer && (
                                  <XCircle className="w-4 h-4 text-red-400 ml-auto" />
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">
                          Markah: {result.points}/{question.points}
                        </span>
                        {!result.userAnswer && (
                          <span className="text-yellow-400">Tidak dijawab</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-500 transition-colors"
          >
            Kembali ke Senarai
          </button>
          {!results.passed && (
            <button
              onClick={handleRetry}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300 flex items-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Cuba Lagi
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Quiz Header */}
      <div className="glass-dark rounded-2xl p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gradient">{challenge.title}</h1>
            <p className="text-gray-400">
              Soalan {currentQuestionIndex + 1} daripada {totalQuestions}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-yellow-400">
              <Clock className="w-5 h-5" />
              <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
            </div>
            <div className="text-gray-400">
              {getAnsweredCount()}/{totalQuestions} dijawab
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-electric-blue to-neon-cyan h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Question */}
      <div className="glass-dark rounded-2xl p-8 mb-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-electric-blue to-neon-cyan rounded-full flex items-center justify-center">
              <span className="text-white font-bold">{currentQuestionIndex + 1}</span>
            </div>
            <div className="text-sm text-gray-400">
              {currentQuestion.points} markah
            </div>
          </div>
          
          <h2 className="text-xl font-semibold text-white leading-relaxed">
            {currentQuestion.question_text}
          </h2>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-8">
          {currentQuestion.options.map((option, index) => {
            const optionLetter = getOptionLetter(index)
            const isSelected = answers[currentQuestion.id] === optionLetter
            
            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(optionLetter)}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                  isSelected
                    ? 'border-electric-blue bg-electric-blue/10 shadow-lg shadow-electric-blue/25'
                    : 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    isSelected
                      ? 'bg-electric-blue text-white'
                      : 'bg-gray-600 text-gray-300'
                  }`}>
                    {optionLetter}
                  </div>
                  <span className={`${isSelected ? 'text-white font-medium' : 'text-gray-300'}`}>
                    {option}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Sebelumnya
        </button>

        <div className="flex gap-2">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`w-10 h-10 rounded-lg font-medium transition-all duration-300 ${
                index === currentQuestionIndex
                  ? 'bg-electric-blue text-white'
                  : answers[questions[index].id]
                  ? 'bg-neon-green/20 text-neon-green border border-neon-green/30'
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
            disabled={isSubmitting}
            className="px-8 py-3 bg-gradient-to-r from-neon-green to-electric-blue text-white rounded-lg font-medium hover:shadow-lg hover:shadow-neon-green/25 transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Menghantar...
              </>
            ) : (
              <>
                <Award className="w-5 h-5" />
                Hantar Kuiz
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleNextQuestion}
            className="px-6 py-3 bg-gradient-to-r from-electric-blue to-neon-cyan text-white rounded-lg font-medium hover:shadow-lg hover:shadow-electric-blue/25 transition-all duration-300 flex items-center gap-2"
          >
            Seterusnya
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
}
