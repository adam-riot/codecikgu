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

// Enhanced SPM Question Bank Data - Authentic Malaysian Format
export const SPM_QUESTIONS_2023: SPMQuestion[] = [
  // Paper 1 - Objektif (MCQ Questions)
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
      '1 markah untuk jawapan yang betul'
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
  
  // Paper 2 - Structured Questions (Soalan Berstruktur)
  {
    id: 'spm-2023-p2-q1',
    year: 2023,
    paper: 2,
    section: 'B',
    questionNumber: 1,
    question: 'Rajah di bawah menunjukkan komponen sistem komputer.\n\n[CPU] ↔ [RAM] ↔ [Storage] ↔ [I/O Devices]\n\na) Namakan DUA jenis peranti input yang biasa digunakan. [2 markah]\nb) Terangkan fungsi RAM dalam sistem komputer. [3 markah]\nc) Bezakan antara primary storage dan secondary storage dengan memberikan contoh. [5 markah]',
    correctAnswer: [
      'a) Papan kekunci, tetikus, mikrofon, kamera, scanner (mana-mana 2)',
      'b) RAM menyimpan data dan arahan sementara untuk pemprosesan pantas, akses rawak, volatile memory',
      'c) Primary: pantas, mahal, volatile (RAM); Secondary: lambat, murah, non-volatile (hard disk, SSD)'
    ],
    markingScheme: [
      'a) 1 markah untuk setiap peranti input yang betul (maksimum 2 markah)',
      'b) 1 markah untuk setiap fungsi yang betul (maksimum 3 markah)',
      'c) 2 markah untuk primary storage, 2 markah untuk secondary storage, 1 markah untuk contoh'
    ],
    expectedAnswer: 'Jawapan berstruktur yang menunjukkan pemahaman komponen sistem komputer dan fungsinya.',
    difficulty: 'medium',
    topics: ['t4-1-1', 't4-1-2'],
    marks: 10,
    timeAllocation: 15,
    sampleAnswer: `a) Papan kekunci - untuk input teks
   Tetikus - untuk navigasi dan pemilihan

b) RAM berfungsi sebagai:
   - Storan sementara untuk data dan program
   - Membolehkan akses pantas kepada CPU
   - Volatile memory - data hilang apabila kuasa dimatikan

c) Primary Storage:
   - Akses sangat pantas
   - Kos tinggi per unit
   - Volatile (RAM) atau non-volatile (ROM)
   - Contoh: RAM, ROM, Cache
   
   Secondary Storage:
   - Akses lebih lambat
   - Kos rendah per unit  
   - Non-volatile - data kekal
   - Contoh: Hard disk, SSD, CD/DVD`,
    commonMistakes: [
      'Keliru antara peranti input dan output',
      'Tidak memahami konsep volatile vs non-volatile',
      'Tidak memberikan contoh yang tepat'
    ]
  },
  {
    id: 'spm-2023-p2-q2',
    year: 2023,
    paper: 2,
    section: 'B', 
    questionNumber: 2,
    question: 'Tulis program Python untuk menguruskan data murid.\n\na) Cipta dictionary untuk menyimpan nama dan gred 5 murid. [3 markah]\nb) Tulis fungsi untuk mengira purata gred. [4 markah]\nc) Tulis kod untuk mencari murid dengan gred tertinggi. [5 markah]\nd) Tambah pengendalian ralat untuk input gred yang tidak sah. [3 markah]',
    correctAnswer: [
      'a) Dictionary dengan 5 pasangan nama:gred',
      'b) Fungsi yang menggunakan sum() dan len() untuk mengira purata',
      'c) Fungsi yang menggunakan max() dengan key parameter',
      'd) Try-except block dengan validasi range 0-100'
    ],
    markingScheme: [
      'a) 1 markah untuk syntax dictionary, 2 markah untuk 5 data yang betul',
      'b) 2 markah untuk syntax fungsi, 2 markah untuk formula purata yang betul',
      'c) 2 markah untuk syntax, 3 markah untuk logik mencari maksimum',
      'd) 2 markah untuk try-except, 1 markah untuk validasi range'
    ],
    expectedAnswer: 'Program Python lengkap dengan dictionary, fungsi, dan pengendalian ralat.',
    difficulty: 'medium',
    topics: ['t5-3-1', 't5-4-1'],
    marks: 15,
    timeAllocation: 25,
    sampleAnswer: `# a) Dictionary murid
murid_data = {
    "Ahmad": 85,
    "Siti": 92,
    "Kumar": 78, 
    "Fatimah": 90,
    "Wei Ming": 88
}

# b) Fungsi purata
def kira_purata(data):
    if len(data) == 0:
        return 0
    return sum(data.values()) / len(data)

# c) Murid tertinggi
def murid_tertinggi(data):
    if len(data) == 0:
        return None
    return max(data, key=data.get)

# d) Pengendalian ralat
def tambah_murid(nama):
    try:
        gred = int(input(f"Masukkan gred untuk {nama}: "))
        if 0 <= gred <= 100:
            murid_data[nama] = gred
            print(f"Gred {gred} berjaya ditambah untuk {nama}")
        else:
            print("Ralat: Gred mesti antara 0-100")
    except ValueError:
        print("Ralat: Sila masukkan nombor sahaja")

# Contoh penggunaan
print(f"Purata gred: {kira_purata(murid_data):.2f}")
print(f"Murid terbaik: {murid_tertinggi(murid_data)}")`,
    commonMistakes: [
      'Syntax dictionary yang salah',
      'Tidak mengendalikan pembahagian dengan sifar',
      'Tidak menggunakan try-except dengan betul',
      'Tidak memvalidasi range input'
    ]
  },
  {
    id: 'spm-2023-p2-q3',
    year: 2023,
    paper: 2,
    section: 'B',
    questionNumber: 3,
    question: 'Tulis pseudokod untuk mengurutkan senarai 10 nombor secara menaik menggunakan bubble sort.\n\na) Tulis pseudokod lengkap untuk bubble sort. [8 markah]\nb) Terangkan bagaimana algoritma ini berfungsi. [4 markah]\nc) Nyatakan kelebihan dan kelemahan bubble sort. [3 markah]',
    correctAnswer: [
      'a) Pseudokod dengan nested loop dan proses pertukaran',
      'b) Penerangan tentang perbandingan berpasangan dan bubble up',
      'c) Kelebihan: mudah faham; Kelemahan: tidak cekap untuk data besar'
    ],
    markingScheme: [
      'a) 3 markah untuk struktur, 3 markah untuk logik perbandingan, 2 markah untuk pertukaran',
      'b) 2 markah untuk penerangan proses, 2 markah untuk contoh',
      'c) 1.5 markah untuk kelebihan, 1.5 markah untuk kelemahan'
    ],
    expectedAnswer: 'Pseudokod bubble sort yang lengkap dengan penerangan algoritma.',
    difficulty: 'hard',
    topics: ['t4-3-1', 't5-2-1'],
    marks: 15,
    timeAllocation: 20,
    sampleAnswer: `a) PSEUDOKOD BUBBLE SORT:
BEGIN
  DECLARE senarai[10] AS INTEGER
  DECLARE i, j, temp AS INTEGER
  DECLARE n AS INTEGER = 10
  
  OUTPUT "Masukkan 10 nombor:"
  FOR i = 0 TO n-1
    INPUT senarai[i]
  END FOR
  
  FOR i = 0 TO n-2
    FOR j = 0 TO n-2-i  
      IF senarai[j] > senarai[j+1] THEN
        temp ← senarai[j]
        senarai[j] ← senarai[j+1] 
        senarai[j+1] ← temp
      END IF
    END FOR
  END FOR
  
  OUTPUT "Senarai tersusun:"
  FOR i = 0 TO n-1
    OUTPUT senarai[i]
  END FOR
END

b) Bubble sort berfungsi dengan:
   - Membandingkan pasangan elemen bersebelahan
   - Menukar kedudukan jika elemen pertama > elemen kedua
   - Proses berulang sehingga tiada pertukaran diperlukan
   - Elemen terbesar akan "bubble up" ke posisi yang betul

c) KELEBIHAN:
   - Mudah difahami dan dilaksanakan
   - Tidak memerlukan ruang tambahan (in-place sorting)
   
   KELEMAHAN:
   - Tidak cekap untuk data yang besar (O(n²))
   - Prestasi yang sama untuk best case dan worst case`,
    commonMistakes: [
      'Tidak menggunakan nested loop yang betul',
      'Salah dalam proses pertukaran nilai',
      'Tidak memahami mengapa disebut bubble sort'
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

    // Filter by paper
    if (selectedPaper !== 0) {
      questions = questions.filter(q => q.paper === selectedPaper)
    }

    setFilteredQuestions(questions)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'hard': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPaperColor = (paper: number) => {
    switch (paper) {
      case 1: return 'text-blue-600 bg-blue-100'
      case 2: return 'text-purple-600 bg-purple-100'
      case 3: return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Bank Soalan SPM Sains Komputer
        </h2>
        <p className="text-gray-600 mt-2">
          Koleksi soalan SPM untuk persediaan peperiksaan
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tahun
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value={2023}>2023</option>
              <option value={2022}>2022</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kertas
            </label>
            <select
              value={selectedPaper}
              onChange={(e) => setSelectedPaper(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value={0}>Semua Kertas</option>
              <option value={1}>Kertas 1 (Objektif)</option>
              <option value={2}>Kertas 2 (Berstruktur)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kesukaran
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">Semua Tahap</option>
              <option value="easy">Mudah</option>
              <option value="medium">Sederhana</option>
              <option value="hard">Sukar</option>
            </select>
          </div>

          <div className="flex items-end">
            <div className="w-full">
              <div className="text-sm text-gray-600">
                {filteredQuestions.length} soalan dijumpai
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.map((question) => (
          <div
            key={question.id}
            className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onQuestionSelect(question)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaperColor(question.paper)}`}>
                    Kertas {question.paper}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(question.difficulty)}`}>
                    {question.difficulty === 'easy' ? 'Mudah' : 
                     question.difficulty === 'medium' ? 'Sederhana' : 'Sukar'}
                  </span>
                  <span className="text-xs text-gray-500">
                    Soalan {question.questionNumber}
                  </span>
                </div>
                
                <h3 className="font-medium text-gray-900 mb-3 line-clamp-3">
                  {question.question}
                </h3>
                
                {question.options && (
                  <div className="space-y-1 mb-3">
                    {question.options.slice(0, 2).map((option, index) => (
                      <div key={index} className="text-sm text-gray-600">
                        <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option}
                      </div>
                    ))}
                    {question.options.length > 2 && (
                      <div className="text-xs text-gray-400">
                        ... dan {question.options.length - 2} pilihan lagi
                      </div>
                    )}
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
                    <Target className="w-4 h-4" />
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
   * Get performance analytics for SPM readiness
   */
  static getSPMReadinessAnalytics(attempts: StudentAttempt[]): {
    overallReadiness: number
    gradeProjection: 'A' | 'B' | 'C' | 'D' | 'E'
    strongTopics: string[]
    weakTopics: string[]
    recommendedStudyTime: number
    nextMockExamDate: Date
  } {
    const totalQuestions = attempts.length
    const correctAnswers = attempts.filter(a => a.marks === a.maxMarks).length
    const averageScore = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0

    // SPM Grade Projection based on Malaysian grading system
    let gradeProjection: 'A' | 'B' | 'C' | 'D' | 'E'
    if (averageScore >= 80) gradeProjection = 'A'
    else if (averageScore >= 65) gradeProjection = 'B'  
    else if (averageScore >= 50) gradeProjection = 'C'
    else if (averageScore >= 40) gradeProjection = 'D'
    else gradeProjection = 'E'

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
      .filter(([_, perf]) => perf.total >= 3 && perf.correct / perf.total >= 0.8)
      .map(([topic]) => topic)

    const weakTopics = Array.from(topicPerformance.entries())
      .filter(([_, perf]) => perf.total >= 3 && perf.correct / perf.total < 0.5)
      .map(([topic]) => topic)

    // Calculate recommended study time (hours per week)
    const readinessGap = Math.max(0, 80 - averageScore) // Target 80% for grade A
    const recommendedStudyTime = Math.ceil(readinessGap / 10) * 3 // 3 hours per 10% gap

    // Next mock exam (every 2 weeks)
    const nextMockExamDate = new Date()
    nextMockExamDate.setDate(nextMockExamDate.getDate() + 14)

    return {
      overallReadiness: Math.round(averageScore),
      gradeProjection,
      strongTopics,
      weakTopics,
      recommendedStudyTime,
      nextMockExamDate
    }
  }
}
