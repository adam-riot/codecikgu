'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Challenge {
  id: string
  title: string
  description: string
  difficulty: 'Mudah' | 'Sederhana' | 'Sukar'
  language: string
  xp_reward: number
  time_limit: number
  test_cases: TestCase[]
  starter_code: string
  solution_code: string
  created_at: string
  updated_at: string
  is_active: boolean
}

interface TestCase {
  input: string
  expected_output: string
  is_hidden: boolean
}

interface FormData {
  title: string
  description: string
  difficulty: 'Mudah' | 'Sederhana' | 'Sukar'
  language: string
  xp_reward: number
  time_limit: number
  starter_code: string
  solution_code: string
  test_cases: TestCase[]
  is_active: boolean
}

export default function AdminCabaranManager() {
  const router = useRouter()
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'add' | 'edit' | 'delete'>('add')
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all')
  const [filterLanguage, setFilterLanguage] = useState<string>('all')
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    difficulty: 'Mudah',
    language: 'Java',
    xp_reward: 10,
    time_limit: 30,
    starter_code: '',
    solution_code: '',
    test_cases: [{ input: '', expected_output: '', is_hidden: false }],
    is_active: true
  })

  // Mock data untuk demo
  useEffect(() => {
    const mockChallenges: Challenge[] = [
      {
        id: '1',
        title: 'Hello World',
        description: 'Tulis program yang mencetak "Hello, World!" ke output.',
        difficulty: 'Mudah',
        language: 'Java',
        xp_reward: 10,
        time_limit: 15,
        test_cases: [
          { input: '', expected_output: 'Hello, World!', is_hidden: false }
        ],
        starter_code: 'public class Main {\n    public static void main(String[] args) {\n        // Tulis kod anda di sini\n    }\n}',
        solution_code: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
        is_active: true
      },
      {
        id: '2',
        title: 'Jumlah Dua Nombor',
        description: 'Baca dua nombor integer dan cetak jumlahnya.',
        difficulty: 'Mudah',
        language: 'Python',
        xp_reward: 15,
        time_limit: 20,
        test_cases: [
          { input: '5 3', expected_output: '8', is_hidden: false },
          { input: '10 -2', expected_output: '8', is_hidden: true }
        ],
        starter_code: '# Baca input\na, b = map(int, input().split())\n\n# Tulis kod anda di sini',
        solution_code: '# Baca input\na, b = map(int, input().split())\n\n# Cetak jumlah\nprint(a + b)',
        created_at: '2024-01-16T14:30:00Z',
        updated_at: '2024-01-16T14:30:00Z',
        is_active: true
      },
      {
        id: '3',
        title: 'Fibonacci Sequence',
        description: 'Hasilkan n nombor pertama dalam jujukan Fibonacci.',
        difficulty: 'Sederhana',
        language: 'C++',
        xp_reward: 25,
        time_limit: 45,
        test_cases: [
          { input: '5', expected_output: '0 1 1 2 3', is_hidden: false },
          { input: '8', expected_output: '0 1 1 2 3 5 8 13', is_hidden: true }
        ],
        starter_code: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    \n    // Tulis kod anda di sini\n    \n    return 0;\n}',
        solution_code: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    \n    int a = 0, b = 1;\n    for (int i = 0; i < n; i++) {\n        cout << a;\n        if (i < n - 1) cout << " ";\n        int temp = a + b;\n        a = b;\n        b = temp;\n    }\n    \n    return 0;\n}',
        created_at: '2024-01-17T09:15:00Z',
        updated_at: '2024-01-17T09:15:00Z',
        is_active: false
      }
    ]
    
    setChallenges(mockChallenges)
    setLoading(false)
  }, [])

  const handleAddChallenge = () => {
    setModalType('add')
    setCurrentChallenge(null)
    setFormData({
      title: '',
      description: '',
      difficulty: 'Mudah',
      language: 'Java',
      xp_reward: 10,
      time_limit: 30,
      starter_code: '',
      solution_code: '',
      test_cases: [{ input: '', expected_output: '', is_hidden: false }],
      is_active: true
    })
    setShowModal(true)
  }

  const handleEditChallenge = (challenge: Challenge) => {
    setModalType('edit')
    setCurrentChallenge(challenge)
    setFormData({
      title: challenge.title,
      description: challenge.description,
      difficulty: challenge.difficulty,
      language: challenge.language,
      xp_reward: challenge.xp_reward,
      time_limit: challenge.time_limit,
      starter_code: challenge.starter_code,
      solution_code: challenge.solution_code,
      test_cases: challenge.test_cases,
      is_active: challenge.is_active
    })
    setShowModal(true)
  }

  const handleDeleteChallenge = (challenge: Challenge) => {
    setModalType('delete')
    setCurrentChallenge(challenge)
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (modalType === 'add') {
      const newChallenge: Challenge = {
        id: Date.now().toString(),
        ...formData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      setChallenges([...challenges, newChallenge])
      alert('Cabaran berjaya ditambah!')
    } else if (modalType === 'edit' && currentChallenge) {
      const updatedChallenges = challenges.map(challenge =>
        challenge.id === currentChallenge.id
          ? { ...challenge, ...formData, updated_at: new Date().toISOString() }
          : challenge
      )
      setChallenges(updatedChallenges)
      alert('Cabaran berjaya dikemaskini!')
    } else if (modalType === 'delete' && currentChallenge) {
      const filteredChallenges = challenges.filter(challenge => challenge.id !== currentChallenge.id)
      setChallenges(filteredChallenges)
      alert('Cabaran berjaya dipadam!')
    }
    
    setShowModal(false)
  }

  const addTestCase = () => {
    setFormData({
      ...formData,
      test_cases: [...formData.test_cases, { input: '', expected_output: '', is_hidden: false }]
    })
  }

  const removeTestCase = (index: number) => {
    const newTestCases = formData.test_cases.filter((_, i) => i !== index)
    setFormData({ ...formData, test_cases: newTestCases })
  }

  const updateTestCase = (index: number, field: keyof TestCase, value: string | boolean) => {
    const newTestCases = formData.test_cases.map((testCase, i) =>
      i === index ? { ...testCase, [field]: value } : testCase
    )
    setFormData({ ...formData, test_cases: newTestCases })
  }

  const filteredChallenges = challenges.filter(challenge => {
    const matchesSearch = challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         challenge.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDifficulty = filterDifficulty === 'all' || challenge.difficulty === filterDifficulty
    const matchesLanguage = filterLanguage === 'all' || challenge.language === filterLanguage
    
    return matchesSearch && matchesDifficulty && matchesLanguage
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Mudah': return 'text-green-400 bg-green-500/20 border-green-500/30'
      case 'Sederhana': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      case 'Sukar': return 'text-red-400 bg-red-500/20 border-red-500/30'
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30'
    }
  }

  const getLanguageColor = (language: string) => {
    switch (language) {
      case 'Java': return 'text-orange-400 bg-orange-500/20'
      case 'Python': return 'text-green-400 bg-green-500/20'
      case 'C++': return 'text-blue-400 bg-blue-500/20'
      case 'JavaScript': return 'text-yellow-400 bg-yellow-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-circuit dark:bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-electric-blue mb-4"></div>
          <p className="text-gray-400">Memuat cabaran...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-circuit dark:bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gradient">Urus Cabaran</h1>
            <p className="text-gray-400 mt-2">Pengurusan cabaran pengaturcaraan untuk pelajar</p>
          </div>
          <Link 
            href="/dashboard-admin" 
            className="btn-primary flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Kembali ke Dashboard Admin
          </Link>
        </div>

        {/* Controls */}
        <div className="glass-dark rounded-xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Cari cabaran..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-10 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-electric-blue"
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>

              {/* Filters */}
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-electric-blue"
              >
                <option value="all">Semua Kesukaran</option>
                <option value="Mudah">Mudah</option>
                <option value="Sederhana">Sederhana</option>
                <option value="Sukar">Sukar</option>
              </select>

              <select
                value={filterLanguage}
                onChange={(e) => setFilterLanguage(e.target.value)}
                className="px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-electric-blue"
              >
                <option value="all">Semua Bahasa</option>
                <option value="Java">Java</option>
                <option value="Python">Python</option>
                <option value="C++">C++</option>
                <option value="JavaScript">JavaScript</option>
              </select>
            </div>

            <button
              onClick={handleAddChallenge}
              className="btn-primary flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Tambah Cabaran
            </button>
          </div>
        </div>

        {/* Challenges List */}
        <div className="space-y-4">
          {filteredChallenges.length === 0 ? (
            <div className="glass-dark rounded-xl p-8 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">Tiada Cabaran Ditemui</h3>
              <p className="text-gray-400">Cuba ubah kriteria carian atau tambah cabaran baru.</p>
            </div>
          ) : (
            filteredChallenges.map((challenge) => (
              <div key={challenge.id} className="glass-dark rounded-xl p-6 hover:bg-gray-800/50 transition-all duration-300">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gradient">{challenge.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(challenge.difficulty)}`}>
                        {challenge.difficulty}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getLanguageColor(challenge.language)}`}>
                        {challenge.language}
                      </span>
                      {!challenge.is_active && (
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-500/20 text-gray-400 border border-gray-500/30">
                          Tidak Aktif
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 mb-3 line-clamp-2">{challenge.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {challenge.xp_reward} XP
                      </span>
                      <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        {challenge.time_limit} minit
                      </span>
                      <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                        {challenge.test_cases.length} test case
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditChallenge(challenge)}
                      className="px-4 py-2 bg-electric-blue/20 text-electric-blue border border-electric-blue/30 rounded-lg hover:bg-electric-blue/30 transition-all duration-300 flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteChallenge(challenge)}
                      className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all duration-300 flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      Padam
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="glass-dark rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gradient">
                  {modalType === 'add' && 'Tambah Cabaran Baru'}
                  {modalType === 'edit' && 'Edit Cabaran'}
                  {modalType === 'delete' && 'Padam Cabaran'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white transition-colors duration-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {modalType === 'delete' ? (
                <div className="text-center">
                  <div className="text-6xl mb-4">⚠️</div>
                  <h3 className="text-xl font-semibold mb-4">Adakah anda pasti?</h3>
                  <p className="text-gray-400 mb-6">
                    Cabaran "{currentChallenge?.title}" akan dipadam secara kekal. Tindakan ini tidak boleh dibatalkan.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all duration-300"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300"
                    >
                      Ya, Padam
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Tajuk Cabaran</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-electric-blue"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Bahasa Pengaturcaraan</label>
                      <select
                        value={formData.language}
                        onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-electric-blue"
                      >
                        <option value="Java">Java</option>
                        <option value="Python">Python</option>
                        <option value="C++">C++</option>
                        <option value="JavaScript">JavaScript</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Kesukaran</label>
                      <select
                        value={formData.difficulty}
                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as 'Mudah' | 'Sederhana' | 'Sukar' })}
                        className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-electric-blue"
                      >
                        <option value="Mudah">Mudah</option>
                        <option value="Sederhana">Sederhana</option>
                        <option value="Sukar">Sukar</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Ganjaran XP</label>
                      <input
                        type="number"
                        value={formData.xp_reward}
                        onChange={(e) => setFormData({ ...formData, xp_reward: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-electric-blue"
                        min="1"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Had Masa (minit)</label>
                      <input
                        type="number"
                        value={formData.time_limit}
                        onChange={(e) => setFormData({ ...formData, time_limit: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-electric-blue"
                        min="1"
                        required
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.is_active}
                          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                          className="rounded border-gray-700 bg-gray-800 text-electric-blue focus:ring-electric-blue"
                        />
                        <span className="text-sm font-medium text-gray-400">Cabaran Aktif</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Penerangan</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-electric-blue"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Kod Permulaan</label>
                    <textarea
                      value={formData.starter_code}
                      onChange={(e) => setFormData({ ...formData, starter_code: e.target.value })}
                      rows={6}
                      className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-electric-blue font-mono text-sm"
                      placeholder="Kod template untuk pelajar..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Kod Penyelesaian</label>
                    <textarea
                      value={formData.solution_code}
                      onChange={(e) => setFormData({ ...formData, solution_code: e.target.value })}
                      rows={6}
                      className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-electric-blue font-mono text-sm"
                      placeholder="Kod penyelesaian yang betul..."
                      required
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <label className="block text-sm font-medium text-gray-400">Test Cases</label>
                      <button
                        type="button"
                        onClick={addTestCase}
                        className="px-3 py-1 bg-electric-blue/20 text-electric-blue border border-electric-blue/30 rounded-lg hover:bg-electric-blue/30 transition-all duration-300 text-sm"
                      >
                        + Tambah Test Case
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {formData.test_cases.map((testCase, index) => (
                        <div key={index} className="border border-gray-700 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-medium">Test Case {index + 1}</h4>
                            {formData.test_cases.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeTestCase(index)}
                                className="text-red-400 hover:text-red-300 transition-colors duration-300"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </button>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Input</label>
                              <textarea
                                value={testCase.input}
                                onChange={(e) => updateTestCase(index, 'input', e.target.value)}
                                rows={2}
                                className="w-full px-3 py-2 rounded bg-gray-900 text-white border border-gray-600 focus:outline-none focus:ring-1 focus:ring-electric-blue text-sm font-mono"
                                placeholder="Input untuk test case..."
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Expected Output</label>
                              <textarea
                                value={testCase.expected_output}
                                onChange={(e) => updateTestCase(index, 'expected_output', e.target.value)}
                                rows={2}
                                className="w-full px-3 py-2 rounded bg-gray-900 text-white border border-gray-600 focus:outline-none focus:ring-1 focus:ring-electric-blue text-sm font-mono"
                                placeholder="Output yang dijangka..."
                                required
                              />
                            </div>
                          </div>
                          
                          <div className="mt-3">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={testCase.is_hidden}
                                onChange={(e) => updateTestCase(index, 'is_hidden', e.target.checked)}
                                className="rounded border-gray-600 bg-gray-900 text-electric-blue focus:ring-electric-blue"
                              />
                              <span className="text-xs text-gray-500">Test case tersembunyi</span>
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4 justify-end pt-6 border-t border-gray-700">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all duration-300"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-electric-blue text-dark-black font-semibold rounded-lg hover:bg-electric-blue/90 transition-all duration-300"
                    >
                      {modalType === 'add' ? 'Tambah Cabaran' : 'Simpan Perubahan'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

