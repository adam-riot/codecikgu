// Advanced AI-Powered Assessment System
// src/components/assessment/AIAssessmentSystem.tsx

import React, { useState, useEffect } from 'react'
import { 
  Brain, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Target, 
  TrendingUp,
  BarChart3,
  Award,
  AlertTriangle,
  BookOpen,
  Code,
  PlayCircle,
  Eye,
  MessageSquare,
  Lightbulb,
  RefreshCw,
  Download,
  Share2,
  Filter,
  Search
} from 'lucide-react'

export interface AssessmentQuestion {
  id: string
  type: 'multiple-choice' | 'coding' | 'explanation' | 'project' | 'peer-review'
  title: string
  description: string
  content: string
  options?: string[]
  correctAnswer?: string | string[]
  codeTemplate?: string
  testCases?: TestCase[]
  rubric?: AssessmentRubric
  difficulty: 'easy' | 'medium' | 'hard'
  skills: string[]
  timeLimit?: number
  points: number
}

export interface TestCase {
  input: string
  expectedOutput: string
  isHidden: boolean
  weight: number
}

export interface AssessmentRubric {
  criteria: RubricCriterion[]
  totalPoints: number
}

export interface RubricCriterion {
  name: string
  description: string
  levels: RubricLevel[]
  weight: number
}

export interface RubricLevel {
  score: number
  label: string
  description: string
}

export interface StudentResponse {
  questionId: string
  answer: string
  code?: string
  timeSpent: number
  attempts: number
  submittedAt: Date
  isCorrect?: boolean
  score?: number
  feedback?: AIFeedback
}

export interface AIFeedback {
  overallScore: number
  strengths: string[]
  weaknesses: string[]
  suggestions: string[]
  codeQuality?: CodeQualityAnalysis
  nextSteps: string[]
  confidence: number
}

export interface CodeQualityAnalysis {
  readability: number
  efficiency: number
  correctness: number
  bestPractices: number
  comments: string[]
  suggestions: string[]
}

export interface AssessmentSession {
  id: string
  title: string
  questions: AssessmentQuestion[]
  responses: StudentResponse[]
  startTime: Date
  endTime?: Date
  timeLimit: number
  currentQuestionIndex: number
  isCompleted: boolean
  totalScore: number
  maxScore: number
}

export function AIAssessmentSystem() {
  const [currentSession, setCurrentSession] = useState<AssessmentSession | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<AssessmentQuestion | null>(null)
  const [currentResponse, setCurrentResponse] = useState('')
  const [currentCode, setCurrentCode] = useState('')
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [aiFeedback, setAiFeedback] = useState<AIFeedback | null>(null)
  const [showHints, setShowHints] = useState(false)

  // Initialize assessment
  useEffect(() => {
    const sampleAssessment = createSampleAssessment()
    setCurrentSession(sampleAssessment)
    setCurrentQuestion(sampleAssessment.questions[0])
    setTimeRemaining(sampleAssessment.timeLimit * 60) // Convert to seconds
    
    if (sampleAssessment.questions[0].codeTemplate) {
      setCurrentCode(sampleAssessment.questions[0].codeTemplate)
    }
  }, [])

  // Timer countdown
  useEffect(() => {
    if (timeRemaining > 0 && currentSession && !currentSession.isCompleted) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeRemaining === 0 && currentSession && !currentSession.isCompleted) {
      handleSubmitAssessment()
    }
  }, [timeRemaining, currentSession])

  const handleAnswerChange = (value: string) => {
    setCurrentResponse(value)
  }

  const handleCodeChange = (value: string) => {
    setCurrentCode(value)
  }

  const handleSubmitQuestion = async () => {
    if (!currentSession || !currentQuestion) return

    setIsSubmitting(true)

    const response: StudentResponse = {
      questionId: currentQuestion.id,
      answer: currentResponse,
      code: currentCode,
      timeSpent: (currentQuestion.timeLimit || 600) - (timeRemaining % (currentQuestion.timeLimit || 600)),
      attempts: 1,
      submittedAt: new Date()
    }

    // Simulate AI evaluation
    const feedback = await simulateAIEvaluation(currentQuestion, response)
    response.feedback = feedback
    response.score = feedback.overallScore
    response.isCorrect = feedback.overallScore >= 0.7

    setAiFeedback(feedback)

    // Update session
    const updatedSession = {
      ...currentSession,
      responses: [...currentSession.responses, response],
      totalScore: currentSession.totalScore + (response.score || 0) * currentQuestion.points
    }

    setCurrentSession(updatedSession)
    setIsSubmitting(false)

    // Move to next question or show results
    if (currentSession.currentQuestionIndex < currentSession.questions.length - 1) {
      setTimeout(() => {
        const nextIndex = currentSession.currentQuestionIndex + 1
        const nextQuestion = currentSession.questions[nextIndex]
        
        setCurrentQuestion(nextQuestion)
        setCurrentResponse('')
        setCurrentCode(nextQuestion.codeTemplate || '')
        setAiFeedback(null)
        
        setCurrentSession({
          ...updatedSession,
          currentQuestionIndex: nextIndex
        })
      }, 3000) // Show feedback for 3 seconds
    } else {
      setTimeout(() => {
        setCurrentSession({
          ...updatedSession,
          isCompleted: true,
          endTime: new Date()
        })
        setShowResults(true)
      }, 3000)
    }
  }

  const handleSubmitAssessment = () => {
    if (!currentSession) return
    
    setCurrentSession({
      ...currentSession,
      isCompleted: true,
      endTime: new Date()
    })
    setShowResults(true)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const runCode = async () => {
    if (!currentQuestion || !currentCode) return

    // Simulate code execution
    const output = `Running test cases...
Test 1: PASSED ✓
Test 2: PASSED ✓  
Test 3: FAILED ✗ - Expected 15, got 14
Test 4: PASSED ✓

Score: 75% (3/4 tests passed)
Runtime: 0.04s
Memory: 12MB`

    return output
  }

  if (!currentSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-white text-center">
          <Brain className="w-16 h-16 mx-auto mb-4 animate-pulse" />
          <p>Loading AI Assessment System...</p>
        </div>
      </div>
    )
  }

  if (showResults) {
    return (
      <AssessmentResults 
        session={currentSession} 
        onRestart={() => window.location.reload()} 
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-md border-b border-white/10 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Brain className="w-8 h-8 text-purple-400" />
            <div>
              <h1 className="text-xl font-bold">{currentSession.title}</h1>
              <p className="text-sm text-gray-300">
                Question {currentSession.currentQuestionIndex + 1} of {currentSession.questions.length}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-yellow-400" />
              <span className={`font-mono text-lg ${timeRemaining < 300 ? 'text-red-400' : 'text-yellow-400'}`}>
                {formatTime(timeRemaining)}
              </span>
            </div>
            
            <div className="text-sm text-gray-300">
              Score: {currentSession.totalScore.toFixed(0)}/{currentSession.maxScore}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-300">Progress</span>
            <span className="text-sm text-gray-300">
              {Math.round(((currentSession.currentQuestionIndex) / currentSession.questions.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentSession.currentQuestionIndex) / currentSession.questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Content */}
        {currentQuestion && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Question Panel */}
            <div className="lg:col-span-2">
              <div className="bg-black/20 backdrop-blur-md rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      currentQuestion.difficulty === 'easy' ? 'bg-green-600/30' :
                      currentQuestion.difficulty === 'medium' ? 'bg-yellow-600/30' : 'bg-red-600/30'
                    }`}>
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">{currentQuestion.title}</h2>
                      <div className="flex items-center space-x-2 text-sm text-gray-300">
                        <span className="capitalize">{currentQuestion.difficulty}</span>
                        <span>•</span>
                        <span>{currentQuestion.points} points</span>
                        {currentQuestion.timeLimit && (
                          <>
                            <span>•</span>
                            <span>{currentQuestion.timeLimit / 60} min</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowHints(!showHints)}
                      className="p-2 bg-blue-600/30 hover:bg-blue-600/50 rounded-lg transition-colors"
                    >
                      <Lightbulb className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-gray-200 mb-4">{currentQuestion.description}</p>
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                      {currentQuestion.content}
                    </pre>
                  </div>
                </div>

                {/* Skills Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {currentQuestion.skills.map((skill, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-purple-600/30 rounded-lg text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Answer Input */}
                {currentQuestion.type === 'multiple-choice' && (
                  <div className="space-y-3">
                    {currentQuestion.options?.map((option, index) => (
                      <label key={index} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="answer"
                          value={option}
                          checked={currentResponse === option}
                          onChange={(e) => handleAnswerChange(e.target.value)}
                          className="w-4 h-4 text-purple-600"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {currentQuestion.type === 'explanation' && (
                  <textarea
                    value={currentResponse}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    placeholder="Type your explanation here..."
                    className="w-full h-32 bg-gray-900/50 text-white p-3 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                )}

                {currentQuestion.type === 'coding' && (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Code Editor</span>
                        <button
                          onClick={runCode}
                          className="flex items-center space-x-2 px-3 py-1 bg-green-600 hover:bg-green-700 rounded-lg text-sm transition-colors"
                        >
                          <PlayCircle className="w-4 h-4" />
                          <span>Run Tests</span>
                        </button>
                      </div>
                      <textarea
                        value={currentCode}
                        onChange={(e) => handleCodeChange(e.target.value)}
                        className="w-full h-64 bg-gray-900/70 text-white p-4 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                        spellCheck={false}
                      />
                    </div>

                    {/* Test Cases */}
                    {currentQuestion.testCases && (
                      <div className="bg-gray-900/30 rounded-lg p-4">
                        <h4 className="font-medium mb-3">Test Cases</h4>
                        <div className="space-y-2">
                          {currentQuestion.testCases
                            .filter(tc => !tc.isHidden)
                            .map((testCase, index) => (
                              <div key={index} className="text-sm">
                                <div className="text-gray-300">Input: {testCase.input}</div>
                                <div className="text-gray-300">Expected: {testCase.expectedOutput}</div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmitQuestion}
                disabled={isSubmitting || (!currentResponse && !currentCode)}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition-all"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Evaluating with AI...</span>
                  </div>
                ) : (
                  'Submit Answer'
                )}
              </button>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* AI Feedback */}
              {aiFeedback && (
                <div className="bg-black/20 backdrop-blur-md rounded-xl p-4">
                  <h3 className="font-bold mb-3 flex items-center">
                    <Brain className="w-5 h-5 mr-2 text-purple-400" />
                    AI Feedback
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">
                        {Math.round(aiFeedback.overallScore * 100)}%
                      </div>
                      <div className="text-xs text-gray-300">Overall Score</div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-green-400 mb-1">Strengths</h4>
                      <ul className="text-xs space-y-1">
                        {aiFeedback.strengths.map((strength, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-yellow-400 mb-1">Suggestions</h4>
                      <ul className="text-xs space-y-1">
                        {aiFeedback.suggestions.map((suggestion, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <Lightbulb className="w-3 h-3 text-yellow-400 mt-0.5 flex-shrink-0" />
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Hints */}
              {showHints && (
                <div className="bg-black/20 backdrop-blur-md rounded-xl p-4">
                  <h3 className="font-bold mb-3 flex items-center">
                    <Lightbulb className="w-5 h-5 mr-2 text-yellow-400" />
                    Hints
                  </h3>
                  
                  <div className="space-y-2 text-sm">
                    <p>💡 Consider the time complexity of your solution</p>
                    <p>💡 Think about edge cases</p>
                    <p>💡 Use meaningful variable names</p>
                    <p>💡 Add comments to explain your logic</p>
                  </div>
                </div>
              )}

              {/* Question Navigation */}
              <div className="bg-black/20 backdrop-blur-md rounded-xl p-4">
                <h3 className="font-bold mb-3">Questions</h3>
                
                <div className="grid grid-cols-5 gap-2">
                  {currentSession.questions.map((q, index) => {
                    const isAnswered = currentSession.responses.some(r => r.questionId === q.id)
                    const isCurrent = index === currentSession.currentQuestionIndex
                    
                    return (
                      <div
                        key={q.id}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                          isCurrent ? 'bg-purple-600' :
                          isAnswered ? 'bg-green-600' : 'bg-gray-600'
                        }`}
                      >
                        {index + 1}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Assessment Results Component
function AssessmentResults({ session, onRestart }: { session: AssessmentSession, onRestart: () => void }) {
  const accuracy = (session.totalScore / session.maxScore) * 100
  const timeSpent = session.endTime && session.startTime 
    ? Math.round((session.endTime.getTime() - session.startTime.getTime()) / 1000 / 60)
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Award className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
          <h1 className="text-3xl font-bold mb-2">Assessment Complete!</h1>
          <p className="text-gray-300">Here's your detailed performance analysis</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-black/20 backdrop-blur-md rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {accuracy.toFixed(1)}%
            </div>
            <div className="text-gray-300">Overall Accuracy</div>
          </div>

          <div className="bg-black/20 backdrop-blur-md rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {session.totalScore.toFixed(0)}/{session.maxScore}
            </div>
            <div className="text-gray-300">Points Earned</div>
          </div>

          <div className="bg-black/20 backdrop-blur-md rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              {timeSpent}min
            </div>
            <div className="text-gray-300">Time Spent</div>
          </div>
        </div>

        <div className="bg-black/20 backdrop-blur-md rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Question Breakdown</h2>
          
          <div className="space-y-4">
            {session.questions.map((question, index) => {
              const response = session.responses.find(r => r.questionId === question.id)
              
              return (
                <div key={question.id} className="border border-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{question.title}</span>
                    <div className="flex items-center space-x-2">
                      {response?.isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                      <span className="text-sm">
                        {response?.score ? Math.round(response.score * question.points) : 0}/{question.points}
                      </span>
                    </div>
                  </div>
                  
                  {response?.feedback && (
                    <div className="text-sm text-gray-300">
                      <p>AI Feedback: {response.feedback.suggestions[0] || 'Great work!'}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={onRestart}
            className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg font-medium transition-all"
          >
            Take Another Assessment
          </button>
          
          <button className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors">
            <Download className="w-4 h-4 inline mr-2" />
            Download Report
          </button>
        </div>
      </div>
    </div>
  )
}

// Helper functions
function createSampleAssessment(): AssessmentSession {
  const questions: AssessmentQuestion[] = [
    {
      id: 'q1',
      type: 'multiple-choice',
      title: 'Python Data Types',
      description: 'Which of the following is a mutable data type in Python?',
      content: 'Consider the characteristics of different Python data types and their mutability.',
      options: [
        'String (str)',
        'Tuple',
        'List',
        'Integer (int)'
      ],
      correctAnswer: 'List',
      difficulty: 'easy',
      skills: ['Python Basics', 'Data Types'],
      timeLimit: 120,
      points: 10
    },
    {
      id: 'q2',
      type: 'coding',
      title: 'Fibonacci Optimization',
      description: 'Optimize the fibonacci function to run in O(n) time complexity.',
      content: `Write a function that calculates the nth Fibonacci number efficiently.

Requirements:
- Time complexity: O(n)
- Space complexity: O(1) preferred
- Handle edge cases (n <= 0)`,
      codeTemplate: `def fibonacci(n):
    # Your implementation here
    pass

# Test your function
print(fibonacci(10))  # Should output 55`,
      testCases: [
        { input: '0', expectedOutput: '0', isHidden: false, weight: 1 },
        { input: '1', expectedOutput: '1', isHidden: false, weight: 1 },
        { input: '10', expectedOutput: '55', isHidden: false, weight: 2 },
        { input: '20', expectedOutput: '6765', isHidden: true, weight: 2 }
      ],
      difficulty: 'medium',
      skills: ['Algorithms', 'Dynamic Programming', 'Optimization'],
      timeLimit: 600,
      points: 25
    },
    {
      id: 'q3',
      type: 'explanation',
      title: 'Code Review',
      description: 'Analyze the following code and explain what could be improved.',
      content: `def process_data(data):
    result = []
    for i in range(len(data)):
        if data[i] > 0:
            result.append(data[i] * 2)
    return result

# Usage
numbers = [1, -2, 3, -4, 5]
processed = process_data(numbers)
print(processed)`,
      difficulty: 'medium',
      skills: ['Code Review', 'Best Practices', 'Python'],
      timeLimit: 300,
      points: 15
    }
  ]

  return {
    id: 'assessment_123',
    title: 'Python Programming Assessment',
    questions,
    responses: [],
    startTime: new Date(),
    timeLimit: 30, // 30 minutes
    currentQuestionIndex: 0,
    isCompleted: false,
    totalScore: 0,
    maxScore: questions.reduce((sum, q) => sum + q.points, 0)
  }
}

async function simulateAIEvaluation(question: AssessmentQuestion, response: StudentResponse): Promise<AIFeedback> {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 1500))

  if (question.type === 'multiple-choice') {
    const isCorrect = response.answer === question.correctAnswer
    return {
      overallScore: isCorrect ? 1 : 0,
      strengths: isCorrect ? ['Correct answer selected', 'Good understanding of concept'] : [],
      weaknesses: isCorrect ? [] : ['Incorrect answer', 'Review the concept'],
      suggestions: isCorrect ? ['Continue practicing'] : ['Review Python data types', 'Study mutability concepts'],
      nextSteps: ['Practice more questions on this topic'],
      confidence: 0.95
    }
  }

  if (question.type === 'coding') {
    // Simulate code analysis
    const hasLoop = response.code?.includes('for') || response.code?.includes('while')
    const hasOptimization = response.code?.includes('memo') || response.code?.includes('dp')
    
    return {
      overallScore: hasOptimization ? 0.9 : hasLoop ? 0.7 : 0.4,
      strengths: [
        hasOptimization ? 'Good use of optimization techniques' : 'Basic logic implemented',
        'Code compiles successfully'
      ],
      weaknesses: hasOptimization ? [] : ['Could be more efficient', 'Consider memoization'],
      suggestions: [
        'Add more comments',
        'Consider edge cases',
        hasOptimization ? 'Great optimization!' : 'Try using dynamic programming'
      ],
      codeQuality: {
        readability: 0.8,
        efficiency: hasOptimization ? 0.9 : 0.6,
        correctness: 0.85,
        bestPractices: 0.7,
        comments: ['Good variable naming', 'Could use more comments'],
        suggestions: ['Add docstring', 'Handle edge cases better']
      },
      nextSteps: ['Study dynamic programming', 'Practice optimization techniques'],
      confidence: 0.88
    }
  }

  // Default for explanation type
  return {
    overallScore: 0.75,
    strengths: ['Good analysis', 'Identified key issues'],
    weaknesses: ['Could be more detailed'],
    suggestions: ['Provide specific examples', 'Suggest concrete improvements'],
    nextSteps: ['Practice code review skills'],
    confidence: 0.8
  }
}
