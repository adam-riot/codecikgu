'use client'

import { useState, useEffect } from 'react'
import { supabase, type CustomUser } from '@/utils/supabase'
import { useRouter } from 'next/navigation'
import CreateChallenge from '@/components/CreateChallenge'
import CreateMultiTypeChallenge from '@/components/CreateMultiTypeChallenge'
import SimpleCreateChallenge from '@/components/SimpleCreateChallenge'

interface ChallengeQuestion {
  id: string
  question: string
  answer: string
}

interface Challenge {
  id: string
  title: string
  description: string
  difficulty: string
  type?: string
  subject?: string
  tingkatan?: string
  xp_reward: number
  created_at: string
  is_active: boolean
  cabaran_soalan?: ChallengeQuestion[]
}

export default function AdminCabaranPage() {
  const [user, setUser] = useState<CustomUser | null>(null)
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateChallenge, setShowCreateChallenge] = useState(false)
  const [showCreateMultiChallenge, setShowCreateMultiChallenge] = useState(false)
  const [showSimpleTest, setShowSimpleTest] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterSubject, setFilterSubject] = useState('all')
  const router = useRouter()

  useEffect(() => {
    const checkUserAndFetch = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        const userData = user as CustomUser
        setUser(userData)
        await fetchChallenges()
      } catch (error) {
        console.error('Error checking user:', error)
        router.push('/login')
      }
    }
    checkUserAndFetch()
  }, [router])

  const fetchChallenges = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('cabaran')
        .select(`
          *,
          cabaran_soalan (
            id,
            question_text
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setChallenges(data || [])
    } catch (error) {
      console.error('Error fetching challenges:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteChallenge = async (challengeId: string) => {
    if (!confirm('Adakah anda pasti mahu memadam cabaran ini?')) return

    try {
      // Delete related quiz questions first
      await supabase
        .from('cabaran_soalan')
        .delete()
        .eq('cabaran_id', challengeId)

      // Delete the challenge
      const { error } = await supabase
        .from('cabaran')
        .delete()
        .eq('id', challengeId)

      if (error) throw error

      // Refresh the list
      fetchChallenges()
      alert('Cabaran berjaya dipadam!')
    } catch (error) {
      console.error('Error deleting challenge:', error)
      alert('Ralat semasa memadam cabaran')
    }
  }

  const filteredChallenges = challenges.filter(challenge => {
    const matchesSearch = challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         challenge.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || challenge.type === filterType
    const matchesSubject = filterSubject === 'all' || challenge.subject === filterSubject
    
    return matchesSearch && matchesType && matchesSubject
  })

  const getChallengeTypeColor = (type: string) => {
    const colors = {
      quiz: 'bg-blue-500',
      video: 'bg-purple-500',
      coding: 'bg-green-500',
      interactive: 'bg-yellow-500',
      reading: 'bg-red-500',
      discussion: 'bg-indigo-500',
      project: 'bg-pink-500',
      assessment: 'bg-gray-500'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-500'
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Memeriksa akses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Pengurusan Cabaran
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Cipta dan urus cabaran untuk platform CodeCikgu
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex flex-wrap gap-4">
          <button
            onClick={() => setShowCreateChallenge(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Cipta Cabaran Asas
          </button>
          
          <button
            onClick={() => setShowCreateMultiChallenge(true)}
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Cipta Cabaran Multi-Jenis
          </button>

          <button
            onClick={() => setShowSimpleTest(true)}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            🧪 Test Input Form
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cari Cabaran
              </label>
              <input
                type="text"
                placeholder="Cari mengikut tajuk atau deskripsi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Jenis Cabaran
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">Semua Jenis</option>
                <option value="quiz">Kuiz</option>
                <option value="video">Video</option>
                <option value="coding">Pengaturcaraan</option>
                <option value="interactive">Interaktif</option>
                <option value="reading">Pembacaan</option>
                <option value="discussion">Perbincangan</option>
                <option value="project">Projek</option>
                <option value="assessment">Penilaian</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subjek
              </label>
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">Semua Subjek</option>
                <option value="sains-komputer">Sains Komputer</option>
                <option value="matematik">Matematik</option>
                <option value="fizik">Fizik</option>
                <option value="kimia">Kimia</option>
              </select>
            </div>
          </div>
        </div>

        {/* Challenges List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Senarai Cabaran ({filteredChallenges.length})
            </h2>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Memuatkan cabaran...</p>
              </div>
            ) : filteredChallenges.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-gray-600 dark:text-gray-400 text-lg">Tiada cabaran dijumpai</p>
                <p className="text-gray-500 dark:text-gray-500 mt-2">Cipta cabaran pertama anda sekarang!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredChallenges.map((challenge) => (
                  <div key={challenge.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getChallengeTypeColor(challenge.type || 'quiz')}`}>
                            {challenge.type || 'quiz'}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {challenge.subject} • Tingkatan {challenge.tingkatan}
                          </span>
                          <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                            {challenge.xp_reward} XP
                          </span>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {challenge.title}
                        </h3>
                        
                        <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                          {challenge.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <span>
                            Dicipta: {new Date(challenge.created_at).toLocaleDateString('ms-MY')}
                          </span>
                          {challenge.cabaran_soalan && challenge.cabaran_soalan.length > 0 && (
                            <span>
                              {challenge.cabaran_soalan.length} soalan
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => router.push(`/challenges/${challenge.id}`)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          title="Lihat cabaran"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        
                        <button
                          onClick={() => handleDeleteChallenge(challenge.id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Padam cabaran"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Challenge Modals */}
      {showCreateChallenge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CreateChallenge
              onClose={() => setShowCreateChallenge(false)}
              onChallengeCreated={() => {
                setShowCreateChallenge(false)
                fetchChallenges()
              }}
            />
          </div>
        </div>
      )}

      {showCreateMultiChallenge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <CreateMultiTypeChallenge
              onClose={() => setShowCreateMultiChallenge(false)}
              onChallengeCreated={() => {
                setShowCreateMultiChallenge(false)
                fetchChallenges()
              }}
            />
          </div>
        </div>
      )}

      {showSimpleTest && (
        <SimpleCreateChallenge
          onClose={() => setShowSimpleTest(false)}
          onChallengeCreated={() => {
            setShowSimpleTest(false)
            fetchChallenges()
          }}
        />
      )}
    </div>
  )
}
