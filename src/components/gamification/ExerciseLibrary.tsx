'use client'

import React, { useState, useEffect } from 'react'
import { 
  BookOpen, 
  Code, 
  Brain, 
  Network, 
  Database, 
  FileText, 
  Zap, 
  Shield,
  Trophy,
  Star,
  CheckCircle,
  XCircle,
  Play,
  RotateCcw,
  Download,
  Share,
  Timer,
  Target,
  Award,
  TrendingUp
} from 'lucide-react'
import { supabase } from '@/utils/supabase'

interface Exercise {
  id: string
  title: string
  description: string
  category: string
  difficulty: 'mudah' | 'sederhana' | 'sukar'
  xpReward: number
  timeLimit: number
  instructions: string
  starterCode: string
  testCases: TestCase[]
  solution: string
  hints: string[]
  completed: boolean
  userCode: string
  userOutput: string
  isRunning: boolean
  isCorrect: boolean
}

interface TestCase {
  input: string
  expectedOutput: string
  description: string
}

const exercises: Exercise[] = [
  {
    id: 'python-basic-1',
    title: 'Hello World Pertama',
    description: 'Tulis program Python pertama anda',
    category: 'Python Asas',
    difficulty: 'mudah',
    xpReward: 25,
    timeLimit: 300,
    instructions: 'Tulis program Python untuk mencetak "Hello, CodeCikgu!" ke skrin.',
    starterCode: `# Tulis kod anda di sini
print("Hello, CodeCikgu!")`,
    testCases: [
      {
        input: '',
        expectedOutput: 'Hello, CodeCikgu!',
        description: 'Program mesti mencetak teks yang betul'
      }
    ],
    solution: `print("Hello, CodeCikgu!")`,
    hints: [
      'Gunakan fungsi print()',
      'Pastikan teks dalam tanda petik',
      'Jangan lupa tanda seru di hujung'
    ],
    completed: false,
    userCode: '',
    userOutput: '',
    isRunning: false,
    isCorrect: false
  },
  {
    id: 'python-variables-1',
    title: 'Pembolehubah dan Input',
    description: 'Belajar menggunakan pembolehubah dan input',
    category: 'Python Asas',
    difficulty: 'mudah',
    xpReward: 30,
    timeLimit: 600,
    instructions: 'Tulis program yang meminta nama pengguna dan mencetak "Selamat datang, [nama]!"',
    starterCode: `# Tulis kod anda di sini
nama = input("Masukkan nama anda: ")
print("Selamat datang, " + nama + "!")`,
    testCases: [
      {
        input: 'Ahmad',
        expectedOutput: 'Selamat datang, Ahmad!',
        description: 'Program mesti menerima input dan mencetak salam'
      }
    ],
    solution: `nama = input("Masukkan nama anda: ")
print("Selamat datang, " + nama + "!")`,
    hints: [
      'Gunakan input() untuk menerima input',
      'Simpan input dalam pembolehubah',
      'Gabungkan teks dengan pembolehubah'
    ],
    completed: false,
    userCode: '',
    userOutput: '',
    isRunning: false,
    isCorrect: false
  },
  {
    id: 'python-operators-1',
    title: 'Operator Matematik',
    description: 'Belajar menggunakan operator matematik',
    category: 'Python Asas',
    difficulty: 'sederhana',
    xpReward: 40,
    timeLimit: 900,
    instructions: 'Tulis program yang mengira purata 3 nombor yang dimasukkan pengguna.',
    starterCode: `# Tulis kod anda di sini
nombor1 = float(input("Masukkan nombor pertama: "))
nombor2 = float(input("Masukkan nombor kedua: "))
nombor3 = float(input("Masukkan nombor ketiga: "))

purata = (nombor1 + nombor2 + nombor3) / 3
print("Purata ialah:", purata)`,
    testCases: [
      {
        input: '10\n20\n30',
        expectedOutput: 'Purata ialah: 20.0',
        description: 'Program mesti mengira purata dengan betul'
      }
    ],
    solution: `nombor1 = float(input("Masukkan nombor pertama: "))
nombor2 = float(input("Masukkan nombor kedua: "))
nombor3 = float(input("Masukkan nombor ketiga: "))

purata = (nombor1 + nombor2 + nombor3) / 3
print("Purata ialah:", purata)`,
    hints: [
      'Gunakan float() untuk menukar input kepada nombor',
      'Tambah semua nombor dan bahagikan dengan 3',
      'Pastikan format output betul'
    ],
    completed: false,
    userCode: '',
    userOutput: '',
    isRunning: false,
    isCorrect: false
  },
  {
    id: 'control-structures-1',
    title: 'Pernyataan If-Else',
    description: 'Belajar menggunakan struktur kawalan if-else',
    category: 'Struktur Kawalan',
    difficulty: 'sederhana',
    xpReward: 50,
    timeLimit: 1200,
    instructions: 'Tulis program yang menentukan sama ada nombor yang dimasukkan adalah positif, negatif, atau sifar.',
    starterCode: `# Tulis kod anda di sini
nombor = float(input("Masukkan nombor: "))

if nombor > 0:
    print("Nombor adalah positif")
elif nombor < 0:
    print("Nombor adalah negatif")
else:
    print("Nombor adalah sifar")`,
    testCases: [
      {
        input: '5',
        expectedOutput: 'Nombor adalah positif',
        description: 'Nombor positif'
      },
      {
        input: '-3',
        expectedOutput: 'Nombor adalah negatif',
        description: 'Nombor negatif'
      },
      {
        input: '0',
        expectedOutput: 'Nombor adalah sifar',
        description: 'Nombor sifar'
      }
    ],
    solution: `nombor = float(input("Masukkan nombor: "))

if nombor > 0:
    print("Nombor adalah positif")
elif nombor < 0:
    print("Nombor adalah negatif")
else:
    print("Nombor adalah sifar")`,
    hints: [
      'Gunakan if untuk nombor positif',
      'Gunakan elif untuk nombor negatif',
      'Gunakan else untuk nombor sifar'
    ],
    completed: false,
    userCode: '',
    userOutput: '',
    isRunning: false,
    isCorrect: false
  },
  {
    id: 'loops-1',
    title: 'Gelung For',
    description: 'Belajar menggunakan gelung for',
    category: 'Struktur Kawalan',
    difficulty: 'sederhana',
    xpReward: 45,
    timeLimit: 900,
    instructions: 'Tulis program yang mencetak nombor 1 hingga 10 menggunakan gelung for.',
    starterCode: `# Tulis kod anda di sini
for i in range(1, 11):
    print(i)`,
    testCases: [
      {
        input: '',
        expectedOutput: '1\n2\n3\n4\n5\n6\n7\n8\n9\n10',
        description: 'Program mesti mencetak nombor 1-10'
      }
    ],
    solution: `for i in range(1, 11):
    print(i)`,
    hints: [
      'Gunakan range(1, 11) untuk nombor 1-10',
      'Gunakan gelung for dengan pembolehubah i',
      'Cetak i dalam gelung'
    ],
    completed: false,
    userCode: '',
    userOutput: '',
    isRunning: false,
    isCorrect: false
  },
  {
    id: 'functions-1',
    title: 'Fungsi Asas',
    description: 'Belajar menulis dan menggunakan fungsi',
    category: 'Fungsi',
    difficulty: 'sederhana',
    xpReward: 60,
    timeLimit: 1200,
    instructions: 'Tulis fungsi bernama kuasa_dua yang menerima satu parameter dan mengembalikan kuasa dua nombor tersebut.',
    starterCode: `# Tulis kod anda di sini
def kuasa_dua(nombor):
    return nombor ** 2

# Uji fungsi
nombor = int(input("Masukkan nombor: "))
hasil = kuasa_dua(nombor)
print("Kuasa dua", nombor, "ialah", hasil)`,
    testCases: [
      {
        input: '5',
        expectedOutput: 'Kuasa dua 5 ialah 25',
        description: 'Fungsi mesti mengira kuasa dua dengan betul'
      }
    ],
    solution: `def kuasa_dua(nombor):
    return nombor ** 2

nombor = int(input("Masukkan nombor: "))
hasil = kuasa_dua(nombor)
print("Kuasa dua", nombor, "ialah", hasil)`,
    hints: [
      'Definisikan fungsi dengan def',
      'Gunakan ** untuk kuasa dua',
      'Gunakan return untuk mengembalikan nilai'
    ],
    completed: false,
    userCode: '',
    userOutput: '',
    isRunning: false,
    isCorrect: false
  },
  {
    id: 'lists-1',
    title: 'Operasi Senarai',
    description: 'Belajar menggunakan senarai Python',
    category: 'Senarai dan String',
    difficulty: 'sederhana',
    xpReward: 55,
    timeLimit: 1200,
    instructions: 'Tulis program yang mencipta senarai nombor dan mengira jumlahnya.',
    starterCode: `# Tulis kod anda di sini
nombor = [10, 20, 30, 40, 50]
jumlah = sum(nombor)
print("Jumlah senarai ialah:", jumlah)`,
    testCases: [
      {
        input: '',
        expectedOutput: 'Jumlah senarai ialah: 150',
        description: 'Program mesti mengira jumlah senarai dengan betul'
      }
    ],
    solution: `nombor = [10, 20, 30, 40, 50]
jumlah = sum(nombor)
print("Jumlah senarai ialah:", jumlah)`,
    hints: [
      'Cipta senarai dengan tanda kurung siku',
      'Gunakan fungsi sum() untuk mengira jumlah',
      'Cetak hasil dengan format yang betul'
    ],
    completed: false,
    userCode: '',
    userOutput: '',
    isRunning: false,
    isCorrect: false
  },
  {
    id: 'string-1',
    title: 'Manipulasi String',
    description: 'Belajar memanipulasi string',
    category: 'Senarai dan String',
    difficulty: 'sederhana',
    xpReward: 50,
    timeLimit: 900,
    instructions: 'Tulis program yang menerima nama dan mencetak nama dalam huruf besar dan kecil.',
    starterCode: `# Tulis kod anda di sini
nama = input("Masukkan nama anda: ")
print("Nama dalam huruf besar:", nama.upper())
print("Nama dalam huruf kecil:", nama.lower())`,
    testCases: [
      {
        input: 'Ahmad Ali',
        expectedOutput: 'Nama dalam huruf besar: AHMAD ALI\nNama dalam huruf kecil: ahmad ali',
        description: 'Program mesti menukar kes huruf dengan betul'
      }
    ],
    solution: `nama = input("Masukkan nama anda: ")
print("Nama dalam huruf besar:", nama.upper())
print("Nama dalam huruf kecil:", nama.lower())`,
    hints: [
      'Gunakan .upper() untuk huruf besar',
      'Gunakan .lower() untuk huruf kecil',
      'Cetak kedua-dua format'
    ],
    completed: false,
    userCode: '',
    userOutput: '',
    isRunning: false,
    isCorrect: false
  },
  {
    id: 'file-1',
    title: 'Operasi Fail',
    description: 'Belajar membaca dan menulis fail',
    category: 'Fail dan Pangkalan Data',
    difficulty: 'sukar',
    xpReward: 75,
    timeLimit: 1800,
    instructions: 'Tulis program yang menulis beberapa baris teks ke fail dan kemudian membacanya.',
    starterCode: `# Tulis kod anda di sini
# Menulis ke fail
with open("data.txt", "w") as fail:
    fail.write("Baris pertama\\n")
    fail.write("Baris kedua\\n")
    fail.write("Baris ketiga\\n")

# Membaca dari fail
with open("data.txt", "r") as fail:
    kandungan = fail.read()
    print("Kandungan fail:")
    print(kandungan)`,
    testCases: [
      {
        input: '',
        expectedOutput: 'Kandungan fail:\nBaris pertama\nBaris kedua\nBaris ketiga\n',
        description: 'Program mesti menulis dan membaca fail dengan betul'
      }
    ],
    solution: `with open("data.txt", "w") as fail:
    fail.write("Baris pertama\\n")
    fail.write("Baris kedua\\n")
    fail.write("Baris ketiga\\n")

with open("data.txt", "r") as fail:
    kandungan = fail.read()
    print("Kandungan fail:")
    print(kandungan)`,
    hints: [
      'Gunakan with open() untuk membuka fail',
      'Gunakan "w" untuk menulis, "r" untuk membaca',
      'Gunakan \\n untuk baris baru'
    ],
    completed: false,
    userCode: '',
    userOutput: '',
    isRunning: false,
    isCorrect: false
  }
]

export default function ExerciseLibrary() {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [difficulty, setDifficulty] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showHints, setShowHints] = useState(false)
  const [currentHint, setCurrentHint] = useState(0)
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

  const runCode = async (exercise: Exercise) => {
    if (!exercise.userCode.trim()) {
      alert('Sila tulis kod anda terlebih dahulu!')
      return
    }

    exercise.isRunning = true
    setSelectedExercise({ ...exercise })

    try {
      // Simulate code execution
      const output = await executePythonCode(exercise.userCode, exercise.testCases[0]?.input || '')
      exercise.userOutput = output
      exercise.isCorrect = checkOutput(output, exercise.testCases[0]?.expectedOutput || '')
      exercise.isRunning = false
      setSelectedExercise({ ...exercise })

      if (exercise.isCorrect) {
        exercise.completed = true
        // Award XP
        if (user) {
          await awardXP(exercise.xpReward, `Selesai latihan: ${exercise.title}`)
          // Log event
          try {
            await fetch('/api/events', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                eventType: 'exercise_completed',
                metadata: { exerciseId: exercise.id, title: exercise.title, xp: exercise.xpReward }
              })
            })
          } catch {}
        }
      }
    } catch (error) {
      exercise.userOutput = `Error: ${error}`
      exercise.isRunning = false
      setSelectedExercise({ ...exercise })
    }
  }

  const executePythonCode = async (code: string, input: string): Promise<string> => {
    // Simulate Python execution
    const lines = code.split('\n')
    let output = ''
    
    for (const line of lines) {
      if (line.includes('print(')) {
        const match = line.match(/print\("([^"]+)"\)/)
        if (match) {
          output += match[1] + '\n'
        }
      } else if (line.includes('input(')) {
        output += input + '\n'
      }
    }
    
    return output.trim()
  }

  const checkOutput = (actual: string, expected: string): boolean => {
    return actual.trim() === expected.trim()
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

  const startExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise)
    setTimeLeft(exercise.timeLimit)
    setIsTimerRunning(true)
    setShowHints(false)
    setCurrentHint(0)
  }

  const resetExercise = (exercise: Exercise) => {
    exercise.userCode = exercise.starterCode
    exercise.userOutput = ''
    exercise.isCorrect = false
    setSelectedExercise({ ...exercise })
  }

  const nextHint = () => {
    if (selectedExercise && currentHint < selectedExercise.hints.length - 1) {
      setCurrentHint(currentHint + 1)
    }
  }

  const filteredExercises = exercises.filter(exercise => {
    const matchesFilter = filter === 'all' || exercise.category === filter
    const matchesDifficulty = difficulty === 'all' || exercise.difficulty === difficulty
    const matchesSearch = exercise.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesFilter && matchesDifficulty && matchesSearch
  })

  const categories = ['Python Asas', 'Struktur Kawalan', 'Fungsi', 'Senarai dan String', 'Fail dan Pangkalan Data']
  const difficulties = ['mudah', 'sederhana', 'sukar']

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-electric-blue/30 border-t-electric-blue rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Memuatkan perpustakaan latihan...</p>
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
            <BookOpen className="w-10 h-10 text-electric-blue" />
            <div>
              <h1 className="text-4xl font-bold text-gradient">Perpustakaan Latihan</h1>
              <p className="text-gray-400">Latihan tambahan dan cabaran untuk menguasai Sains Komputer</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-dark rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Kategori</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-electric-blue"
              >
                <option value="all">Semua Kategori</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Kesukaran</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-electric-blue"
              >
                <option value="all">Semua Tahap</option>
                {difficulties.map(diff => (
                  <option key={diff} value={diff}>{diff.charAt(0).toUpperCase() + diff.slice(1)}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Cari</label>
              <input
                type="text"
                placeholder="Cari latihan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-electric-blue"
              />
            </div>
            
            <div className="flex items-end">
              <div className="text-center w-full">
                <div className="text-2xl font-bold text-electric-blue">{filteredExercises.length}</div>
                <div className="text-sm text-gray-400">Latihan Dijumpai</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Exercise List */}
          <div className="lg:col-span-1">
            <div className="glass-dark rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Senarai Latihan</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredExercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    onClick={() => startExercise(exercise)}
                    className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                      selectedExercise?.id === exercise.id
                        ? 'bg-electric-blue/20 border border-electric-blue/50'
                        : 'bg-gray-800/50 border border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-white">{exercise.title}</h4>
                      <div className="flex items-center space-x-2">
                        {exercise.completed && (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        )}
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          exercise.difficulty === 'mudah' ? 'bg-green-500/20 text-green-400' :
                          exercise.difficulty === 'sederhana' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {exercise.difficulty}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{exercise.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{exercise.category}</span>
                      <span>+{exercise.xpReward} XP</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Exercise Editor */}
          <div className="lg:col-span-2">
            {selectedExercise ? (
              <div className="glass-dark rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedExercise.title}</h3>
                    <p className="text-gray-400">{selectedExercise.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-center">
                      <div className="text-lg font-bold text-electric-blue">
                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                      </div>
                      <div className="text-xs text-gray-400">Masa</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-yellow-400">+{selectedExercise.xpReward}</div>
                      <div className="text-xs text-gray-400">XP</div>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="mb-6 p-4 bg-gray-800/50 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">Arahan:</h4>
                  <p className="text-gray-300">{selectedExercise.instructions}</p>
                </div>

                {/* Code Editor */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-white">Editor Kod</h4>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => resetExercise(selectedExercise)}
                        className="flex items-center space-x-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Reset</span>
                      </button>
                      <button
                        onClick={() => setShowHints(!showHints)}
                        className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                      >
                        <Brain className="w-4 h-4" />
                        <span>Petunjuk</span>
                      </button>
                    </div>
                  </div>
                  
                  <textarea
                    value={selectedExercise.userCode || selectedExercise.starterCode}
                    onChange={(e) => {
                      selectedExercise.userCode = e.target.value
                      setSelectedExercise({ ...selectedExercise })
                    }}
                    className="w-full h-64 p-4 bg-gray-900 border border-gray-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-electric-blue resize-none"
                    placeholder="Tulis kod Python anda di sini..."
                  />
                </div>

                {/* Hints */}
                {showHints && selectedExercise.hints.length > 0 && (
                  <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-blue-400">Petunjuk {currentHint + 1}/{selectedExercise.hints.length}</h4>
                      <button
                        onClick={nextHint}
                        disabled={currentHint >= selectedExercise.hints.length - 1}
                        className="px-2 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded text-sm transition-colors"
                      >
                        Seterusnya
                      </button>
                    </div>
                    <p className="text-blue-300">{selectedExercise.hints[currentHint]}</p>
                  </div>
                )}

                {/* Run Button */}
                <div className="mb-6">
                  <button
                    onClick={() => runCode(selectedExercise)}
                    disabled={selectedExercise.isRunning}
                    className="flex items-center space-x-2 px-6 py-3 bg-electric-blue hover:bg-electric-blue/90 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Play className="w-5 h-5" />
                    <span>{selectedExercise.isRunning ? 'Menjalankan...' : 'Jalankan Kod'}</span>
                  </button>
                </div>

                {/* Output */}
                {selectedExercise.userOutput && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-white mb-2">Output:</h4>
                    <div className="p-4 bg-gray-900 border border-gray-700 rounded-lg">
                      <pre className="text-gray-300 font-mono text-sm whitespace-pre-wrap">
                        {selectedExercise.userOutput}
                      </pre>
                    </div>
                    {selectedExercise.isCorrect && (
                      <div className="mt-2 flex items-center space-x-2 text-green-400">
                        <CheckCircle className="w-5 h-5" />
                        <span>Kod anda betul! +{selectedExercise.xpReward} XP</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Test Cases */}
                <div>
                  <h4 className="font-semibold text-white mb-2">Ujian:</h4>
                  <div className="space-y-2">
                    {selectedExercise.testCases.map((testCase, index) => (
                      <div key={index} className="p-3 bg-gray-800/50 rounded-lg">
                        <div className="text-sm text-gray-400 mb-1">
                          <strong>Input:</strong> {testCase.input || '(tiada input)'}
                        </div>
                        <div className="text-sm text-gray-400">
                          <strong>Output Dijangka:</strong> {testCase.expectedOutput}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {testCase.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-dark rounded-xl p-6 flex items-center justify-center h-96">
                <div className="text-center">
                  <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-400 mb-2">Pilih Latihan</h3>
                  <p className="text-gray-500">Pilih latihan dari senarai untuk mula belajar</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
