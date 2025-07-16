import React, { useState, useEffect } from 'react'
import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Star,
  Target,
  TrendingUp,
  Award
} from 'lucide-react'

export interface SPMQuestion {
  id: string
  year: number
  paper: 1 | 2 | 3
  section: string
  questionNumber: number
  question: string
  options?: string[] // For multiple choice
  correctAnswer: string | string[] // Can be multiple for essay questions
  markingScheme: string[]
  expectedAnswer: string
  difficulty: 'easy' | 'medium' | 'hard'
  topics: string[]
  marks: number
  timeAllocation: number // minutes
  sampleAnswer?: string
  commonMistakes?: string[]
}

export interface SPMPaper {
  id: string
  year: number
  paper: 1 | 2 | 3
  title: string
  duration: number // minutes
  totalMarks: number
  sections: SPMSection[]
  instructions: string[]
}

export interface SPMSection {
  id: string
  name: string
  description: string
  questions: SPMQuestion[]
  marks: number
  timeAllocation: number
}

export interface StudentAttempt {
  id: string
  studentId: string
  questionId: string
  answer: string | string[]
  submittedAt: Date
  marks: number
  maxMarks: number
  feedback: string[]
  timeSpent: number // seconds
}

// SPM Question Bank Data - Enhanced with Authentic Malaysian Format
export const SPM_QUESTIONS_2023: SPMQuestion[] = [
  {
    id: 'spm-2023-p1-q1',
    year: 2023,
    paper: 1,
    section: 'A',
    questionNumber: 1,
    question: 'Apakah yang dimaksudkan dengan algoritma dalam sains komputer?',
    options: [
      'Satu set arahan yang teratur untuk menyelesaikan masalah',
      'Bahasa pengaturcaraan untuk menulis kod',
      'Perisian komputer untuk analisis data',
      'Sistem operasi untuk komputer'
    ],
    correctAnswer: 'Satu set arahan yang teratur untuk menyelesaikan masalah',
    markingScheme: [
      '1 markah untuk jawapan yang betul',
      '0 markah untuk jawapan yang salah'
    ],
    expectedAnswer: 'Algoritma adalah satu set arahan yang teratur dan logik untuk menyelesaikan masalah atau melaksanakan tugas tertentu.',
    difficulty: 'easy',
    topics: ['t4-3-1'],
    marks: 1,
    timeAllocation: 1,
    commonMistakes: [
      'Menganggap algoritma adalah bahasa pengaturcaraan',
      'Tidak memahami konsep arahan yang teratur'
    ]
  },
  {
    id: 'spm-2023-p1-q2',
    year: 2023,
    paper: 1,
    section: 'A',
    questionNumber: 2,
    question: 'Tukarkan nombor binary 1101 kepada nombor perpuluhan.',
    options: [
      '11',
      '13', 
      '15',
      '17'
    ],
    correctAnswer: '13',
    markingScheme: [
      '1 markah untuk jawapan yang betul'
    ],
    expectedAnswer: '1×2³ + 1×2² + 0×2¹ + 1×2⁰ = 8 + 4 + 0 + 1 = 13',
    difficulty: 'medium',
    topics: ['t4-2-1'],
    marks: 1,
    timeAllocation: 2,
    sampleAnswer: 'Langkah penyelesaian:\n1101₂ = 1×2³ + 1×2² + 0×2¹ + 1×2⁰\n= 1×8 + 1×4 + 0×2 + 1×1\n= 8 + 4 + 0 + 1\n= 13₁₀',
    commonMistakes: [
      'Tidak menggunakan pangkat 2 yang betul',
      'Tersilap mengira nilai tempat'
    ]
  },
  {
    id: 'spm-2023-p1-q3',
    year: 2023,
    paper: 1,
    section: 'A',
    questionNumber: 3,
    question: 'Antara berikut, yang manakah peranti input komputer?',
    options: [
      'Monitor dan printer',
      'Papan kekunci dan tetikus',
      'Speaker dan headphone', 
      'Hard disk dan RAM'
    ],
    correctAnswer: 'Papan kekunci dan tetikus',
    markingScheme: [
      '1 markah untuk jawapan yang betul'
    ],
    expectedAnswer: 'Papan kekunci dan tetikus adalah peranti input yang membolehkan pengguna memasukkan data ke dalam komputer.',
    difficulty: 'easy',
    topics: ['t4-1-1'],
    marks: 1,
    timeAllocation: 1,
    commonMistakes: [
      'Keliru antara peranti input dan output',
      'Tidak faham fungsi setiap peranti'
    ]
  },
  {
    id: 'spm-2023-p1-q4',
    year: 2023,
    paper: 1,
    section: 'A',
    questionNumber: 4,
    question: 'Apakah output bagi kod Python berikut?\n\nfor i in range(2, 6):\n    print(i * 3)',
    options: [
      '6 9 12 15',
      '2 3 4 5',
      '3 6 9 12',
      '6 12 18'
    ],
    correctAnswer: '6 9 12 15',
    markingScheme: [
      '1 markah untuk jawapan yang betul'
    ],
    expectedAnswer: 'Loop akan iterate dari 2 hingga 5, mencetak setiap nilai didarab dengan 3.',
    difficulty: 'medium',
    topics: ['t5-2-1'],
    marks: 1,
    timeAllocation: 2,
    commonMistakes: [
      'Tidak faham range() bermula dari 2',
      'Keliru dengan operasi matematik dalam loop'
    ]
  },
  {
    id: 'spm-2023-p1-q5',
    year: 2023,
    paper: 1,
    section: 'A',
    questionNumber: 5,
    question: 'Dalam pseudokod, simbol yang digunakan untuk assignment adalah:',
    options: [
      '=',
      '←',
      '==',
      ':='
    ],
    correctAnswer: '←',
    markingScheme: [
      '1 markah untuk jawapan yang betul'
    ],
    expectedAnswer: 'Simbol ← digunakan dalam pseudokod untuk menunjukkan assignment nilai kepada pembolehubah.',
    difficulty: 'easy',
    topics: ['t4-3-1'],
    marks: 1,
    timeAllocation: 1,
    commonMistakes: [
      'Keliru dengan operator perbandingan ==',
      'Menggunakan simbol = dari bahasa pengaturcaraan'
    ]
  },
  {
    id: 'spm-2023-p1-q6',
    year: 2023,
    paper: 1,
    section: 'A',
    questionNumber: 6,
    question: 'Tukarkan nombor binary 1101 kepada nombor perpuluhan.',
    correctAnswer: '13',
    markingScheme: [
      '2 markah untuk jawapan yang betul dengan kerja yang ditunjukkan',
      '1 markah untuk kaedah yang betul tetapi jawapan salah',
      '0 markah untuk jawapan yang salah tanpa kerja'
    ],
    expectedAnswer: '1×2³ + 1×2² + 0×2¹ + 1×2⁰ = 8 + 4 + 0 + 1 = 13',
    difficulty: 'medium',
    topics: ['t4-2-1'],
    marks: 2,
    timeAllocation: 2,
    sampleAnswer: 'Langkah penyelesaian:\n1101₂ = 1×2³ + 1×2² + 0×2¹ + 1×2⁰\n= 1×8 + 1×4 + 0×2 + 1×1\n= 8 + 4 + 0 + 1\n= 13₁₀',
    commonMistakes: [
      'Tidak menggunakan pangkat 2 yang betul',
      'Tersilap mengira nilai tempat'
    ]
  },
  {
    id: 'spm-2023-p2-q1',
    year: 2023,
    paper: 2,
    section: 'B',
    questionNumber: 1,
    question: 'Tulis pseudocode untuk mencari nombor terbesar dalam senarai 5 nombor yang dimasukkan oleh pengguna.',
    correctAnswer: [
      'INPUT 5 numbers',
      'SET largest = first number',
      'FOR each remaining number',
      'IF number > largest THEN largest = number',
      'OUTPUT largest'
    ],
    markingScheme: [
      '2 markah untuk struktur pseudocode yang betul',
      '2 markah untuk logik perbandingan yang betul',
      '1 markah untuk input dan output yang betul'
    ],
    expectedAnswer: 'Pseudocode yang menunjukkan input, perbandingan, dan output dengan struktur yang logik.',
    difficulty: 'medium',
    topics: ['t4-3-1'],
    marks: 5,
    timeAllocation: 8,
    sampleAnswer: `BEGIN
  DECLARE num1, num2, num3, num4, num5, largest AS INTEGER
  
  OUTPUT "Masukkan 5 nombor:"
  INPUT num1, num2, num3, num4, num5
  
  largest ← num1
  
  IF num2 > largest THEN
    largest ← num2
  END IF
  
  IF num3 > largest THEN
    largest ← num3
  END IF
  
  IF num4 > largest THEN
    largest ← num4
  END IF
  
  IF num5 > largest THEN
    largest ← num5
  END IF
  
  OUTPUT "Nombor terbesar ialah: ", largest
END`,
    commonMistakes: [
      'Tidak menggunakan struktur IF yang betul',
      'Tidak menginisialisasi nilai awal largest',
      'Sintaks pseudocode yang tidak konsisten'
    ]
  }
]

export const SPM_PAPERS: SPMPaper[] = [
  {
    id: 'spm-2023-p1',
    year: 2023,
    paper: 1,
    title: 'Kertas 1: Objektif',
    duration: 75,
    totalMarks: 50,
    sections: [
      {
        id: 'section-a',
        name: 'Bahagian A',
        description: 'Soalan objektif - pilih jawapan yang betul',
        questions: SPM_QUESTIONS_2023.filter(q => q.paper === 1),
        marks: 50,
        timeAllocation: 75
      }
    ],
    instructions: [
      'Jawab SEMUA soalan',
      'Pilih jawapan yang paling sesuai',
      'Hitamkan bulatan pada kertas jawapan',
      'Masa yang diperuntukkan: 1 jam 15 minit'
    ]
  },
  {
    id: 'spm-2023-p2',
    year: 2023,
    paper: 2,
    title: 'Kertas 2: Berstruktur',
    duration: 150,
    totalMarks: 100,
    sections: [
      {
        id: 'section-b',
        name: 'Bahagian B',
        description: 'Soalan berstruktur - jawab dengan lengkap',
        questions: SPM_QUESTIONS_2023.filter(q => q.paper === 2),
        marks: 100,
        timeAllocation: 150
      }
    ],
    instructions: [
      'Jawab SEMUA soalan',
      'Tunjukkan semua kerja pengiraan',
      'Tulis jawapan dengan jelas dan kemas',
      'Masa yang diperuntukkan: 2 jam 30 minit'
    ]
  }
]

interface SPMQuestionBankProps {
  tingkatan: 'tingkatan-4' | 'tingkatan-5'
  selectedTopics?: string[]
  onQuestionSelect: (question: SPMQuestion) => void
}

export function SPMQuestionBank({ tingkatan, selectedTopics = [], onQuestionSelect }: SPMQuestionBankProps) {
  const [filteredQuestions, setFilteredQuestions] = useState<SPMQuestion[]>([])
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [selectedYear, setSelectedYear] = useState<number>(2023)
  const [selectedPaper, setSelectedPaper] = useState<number>(0) // 0 = all

  useEffect(() => {
    filterQuestions()
  }, [selectedTopics, selectedDifficulty, selectedYear, selectedPaper])

  const filterQuestions = () => {
    let questions = SPM_QUESTIONS_2023

    // Filter by topics if specified
    if (selectedTopics.length > 0) {
      questions = questions.filter(q => 
        q.topics.some(topic => selectedTopics.includes(topic))
      )
    }

    // Filter by difficulty
    if (selectedDifficulty !== 'all') {
      questions = questions.filter(q => q.difficulty === selectedDifficulty)
    }

    // Filter by year
    questions = questions.filter(q => q.year === selectedYear)

    // Filter by paper
    if (selectedPaper !== 0) {
      questions = questions.filter(q => q.paper === selectedPaper)
    }

    setFilteredQuestions(questions)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-400/10'
      case 'medium': return 'text-yellow-400 bg-yellow-400/10'
      case 'hard': return 'text-red-400 bg-red-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return <CheckCircle className="w-4 h-4" />
      case 'medium': return <Clock className="w-4 h-4" />
      case 'hard': return <Target className="w-4 h-4" />
      default: return <Star className="w-4 h-4" />
    }
  }

  return (
    <div className="spm-question-bank bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <BookOpen className="w-6 h-6 mr-2 text-blue-600" />
              Bank Soalan SPM
            </h2>
            <p className="text-gray-600 mt-1">
              Koleksi soalan SPM Sains Komputer untuk latihan dan ujian
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Award className="w-8 h-8 text-yellow-500" />
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">{filteredQuestions.length}</div>
              <div className="text-xs text-gray-500">Soalan tersedia</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tahun
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={2023}>2023</option>
              <option value={2022}>2022</option>
              <option value={2021}>2021</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kertas
            </label>
            <select
              value={selectedPaper}
              onChange={(e) => setSelectedPaper(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={0}>Semua Kertas</option>
              <option value={1}>Kertas 1 (Objektif)</option>
              <option value={2}>Kertas 2 (Berstruktur)</option>
              <option value={3}>Kertas 3 (Projek)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tahap Kesukaran
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Semua Tahap</option>
              <option value="easy">Mudah</option>
              <option value="medium">Sederhana</option>
              <option value="hard">Sukar</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statistik
            </label>
            <div className="p-2 bg-white rounded border border-gray-300">
              <div className="text-sm text-center">
                <div className="font-medium text-blue-600">{filteredQuestions.length}</div>
                <div className="text-gray-500">soalan</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Question List */}
      <div className="p-6">
        <div className="space-y-4">
          {filteredQuestions.map((question) => (
            <div
              key={question.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onQuestionSelect(question)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {question.year} - Kertas {question.paper}
                    </span>
                    <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      Soalan {question.questionNumber}
                    </span>
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                      {getDifficultyIcon(question.difficulty)}
                      <span className="capitalize">{question.difficulty}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {question.question}
                  </h3>
                  
                  {question.options && (
                    <div className="space-y-1 mb-3">
                      {question.options.map((option, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4" />
                      <span>{question.marks} markah</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{question.timeAllocation} minit</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>{question.topics.length} topik</span>
                    </div>
                  </div>
                </div>
                
                <div className="ml-4">
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      onQuestionSelect(question)
                    }}
                  >
                    Cuba Sekarang
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredQuestions.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Tiada soalan dijumpai
            </h3>
            <p className="text-gray-600">
              Cuba ubah kriteria penapisan untuk melihat lebih banyak soalan.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export class SPMAssessmentService {
  /**
   * Get questions by difficulty
   */
  static getQuestionsByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): SPMQuestion[] {
    return SPM_QUESTIONS_2023.filter(q => q.difficulty === difficulty)
  }

  /**
   * Get questions by topic
   */
  static getQuestionsByTopic(topicId: string): SPMQuestion[] {
    return SPM_QUESTIONS_2023.filter(q => q.topics.includes(topicId))
  }

  /**
   * Generate practice test
   */
  static generatePracticeTest(
    topicIds: string[], 
    difficulty: 'easy' | 'medium' | 'hard' | 'mixed' = 'mixed',
    questionCount: number = 10
  ): SPMQuestion[] {
    let availableQuestions = SPM_QUESTIONS_2023.filter(q => 
      q.topics.some(topic => topicIds.includes(topic))
    )

    if (difficulty !== 'mixed') {
      availableQuestions = availableQuestions.filter(q => q.difficulty === difficulty)
    }

    // Shuffle and take requested number
    const shuffled = availableQuestions.sort(() => 0.5 - Math.random())
    return shuffled.slice(0, questionCount)
  }

  /**
   * Calculate score for attempt
   */
  static calculateScore(question: SPMQuestion, studentAnswer: string | string[]): number {
    if (Array.isArray(question.correctAnswer)) {
      // Multiple correct answers (essay type)
      if (Array.isArray(studentAnswer)) {
        const correctCount = studentAnswer.filter(ans => 
          question.correctAnswer.includes(ans)
        ).length
        return Math.round((correctCount / question.correctAnswer.length) * question.marks)
      }
      return 0
    } else {
      // Single correct answer
      const isCorrect = Array.isArray(studentAnswer) 
        ? studentAnswer[0] === question.correctAnswer
        : studentAnswer === question.correctAnswer
      return isCorrect ? question.marks : 0
    }
  }

  /**
   * Get performance analytics
   */
  static getPerformanceAnalytics(attempts: StudentAttempt[]): {
    averageScore: number
    totalQuestions: number
    correctAnswers: number
    timeSpent: number
    strongTopics: string[]
    weakTopics: string[]
  } {
    const totalQuestions = attempts.length
    const correctAnswers = attempts.filter(a => a.marks === a.maxMarks).length
    const totalMarks = attempts.reduce((sum, a) => sum + a.marks, 0)
    const maxMarks = attempts.reduce((sum, a) => sum + a.maxMarks, 0)
    const averageScore = maxMarks > 0 ? Math.round((totalMarks / maxMarks) * 100) : 0
    const timeSpent = attempts.reduce((sum, a) => sum + a.timeSpent, 0)

    // Analyze topic performance
    const topicPerformance = new Map<string, { correct: number, total: number }>()
    
    attempts.forEach(attempt => {
      const question = SPM_QUESTIONS_2023.find(q => q.id === attempt.questionId)
      if (question) {
        question.topics.forEach(topic => {
          const current = topicPerformance.get(topic) || { correct: 0, total: 0 }
          current.total++
          if (attempt.marks === attempt.maxMarks) current.correct++
          topicPerformance.set(topic, current)
        })
      }
    })

    const strongTopics = Array.from(topicPerformance.entries())
      .filter(([_, perf]) => perf.correct / perf.total >= 0.8)
      .map(([topic]) => topic)

    const weakTopics = Array.from(topicPerformance.entries())
      .filter(([_, perf]) => perf.correct / perf.total < 0.5)
      .map(([topic]) => topic)

    return {
      averageScore,
      totalQuestions,
      correctAnswers,
      timeSpent,
      strongTopics,
      weakTopics
    }
  }
}
