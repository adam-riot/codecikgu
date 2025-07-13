'use client'

import React, { useState } from 'react'
import { supabase } from '@/utils/supabase'

interface Challenge {
  id?: string
  title: string
  description: string
  type: 'coding' | 'quiz' | 'video' | 'reading' | 'discussion' | 'interactive' | 'project' | 'assessment'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  points: number
  timeLimit?: number
  tingkatan: 'tingkatan-4' | 'tingkatan-5' | 'both'
  
  // Coding challenges
  testCases?: string
  sampleSolution?: string
  startingCode?: string
  
  // Video challenges
  videoUrl?: string
  videoDuration?: number
  videoQuestions?: string
  
  // Reading challenges
  readingMaterial?: string
  readingUrl?: string
  readingQuestions?: string
  
  // Quiz challenges
  quizType?: 'multiple_choice' | 'true_false' | 'fill_blank' | 'drag_drop' | 'interactive'
  quizQuestions?: string
  
  // Interactive challenges
  interactiveType?: 'kahoot' | 'quizizz' | 'padlet' | 'mentimeter' | 'jamboard' | 'flipgrid' | 'custom'
  interactiveUrl?: string
  interactiveInstructions?: string
  
  // Discussion challenges
  discussionTopic?: string
  discussionGuidelines?: string
  
  // Assessment challenges
  assessmentFormat?: 'written' | 'practical' | 'presentation' | 'portfolio'
  assessmentCriteria?: string
  
  tags: string[]
}

interface CreateMultiTypeChallengeProps {
  onClose?: () => void
  onChallengeCreated?: () => void
}

interface QuizQuestion {
  id: string
  question: string
  type: 'multiple_choice' | 'true_false' | 'fill_blank'
  options?: string[]
  correct: number | boolean | string
  explanation?: string
}

export default function CreateMultiTypeChallenge({ onClose, onChallengeCreated }: CreateMultiTypeChallengeProps = {}) {
  const [challenge, setChallenge] = useState<Challenge>({
    title: '',
    description: '',
    type: 'coding',
    difficulty: 'beginner',
    points: 100,
    tingkatan: 'tingkatan-4',
    tags: []
  })

  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  // Debug state changes
  React.useEffect(() => {
    console.log('🔍 Challenge state updated:', challenge)
  }, [challenge])

  React.useEffect(() => {
    console.log('🔍 Quiz questions updated:', quizQuestions)
  }, [quizQuestions])

  // Debug log to see current state
  console.log('Current challenge state:', challenge)
  console.log('Current quiz questions:', quizQuestions)

  const challengeTypes = [
    { 
      value: 'coding', 
      label: '💻 Cabaran Kod', 
      description: 'Program Python, JavaScript, PHP',
      icon: '💻',
      color: 'blue'
    },
    { 
      value: 'quiz', 
      label: '📝 Kuiz Interaktif', 
      description: 'Soalan aneka pilihan, benar/salah',
      icon: '📝',
      color: 'purple'
    },
    { 
      value: 'video', 
      label: '🎥 Tonton Video', 
      description: 'Video pengajaran dengan soalan',
      icon: '🎥',
      color: 'red'
    },
    { 
      value: 'reading', 
      label: '📚 Baca Nota', 
      description: 'Artikel, tutorial, dokumentasi',
      icon: '📚',
      color: 'green'
    },
    { 
      value: 'interactive', 
      label: '🎮 Aktiviti Interaktif', 
      description: 'Kahoot, Quizizz, Padlet',
      icon: '🎮',
      color: 'yellow'
    },
    { 
      value: 'discussion', 
      label: '💬 Perbincangan', 
      description: 'Forum, debate, sharing',
      icon: '💬',
      color: 'indigo'
    },
    { 
      value: 'project', 
      label: '🚀 Projek', 
      description: 'Portfolio, aplikasi, website',
      icon: '🚀',
      color: 'teal'
    },
    { 
      value: 'assessment', 
      label: '📊 Penilaian', 
      description: 'Ujian, pembentangan, portfolio',
      icon: '📊',
      color: 'orange'
    }
  ]

  const interactiveTypes = [
    { value: 'kahoot', label: 'Kahoot', description: 'Game-based learning quiz', url: 'kahoot.com' },
    { value: 'quizizz', label: 'Quizizz', description: 'Self-paced interactive quiz', url: 'quizizz.com' },
    { value: 'padlet', label: 'Padlet', description: 'Collaborative digital wall', url: 'padlet.com' },
    { value: 'mentimeter', label: 'Mentimeter', description: 'Real-time polling & feedback', url: 'mentimeter.com' },
    { value: 'jamboard', label: 'Google Jamboard', description: 'Digital whiteboard', url: 'jamboard.google.com' },
    { value: 'flipgrid', label: 'Flipgrid', description: 'Video discussion platform', url: 'flipgrid.com' },
    { value: 'custom', label: 'Platform Lain', description: 'Platform interaktif lain', url: 'custom' }
  ]

  // Quiz Questions Helper Functions
  const addNewQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      question: '',
      type: challenge.quizType as QuizQuestion['type'] || 'multiple_choice',
      options: challenge.quizType === 'multiple_choice' ? ['', '', '', ''] : undefined,
      correct: challenge.quizType === 'multiple_choice' ? 0 : 
               challenge.quizType === 'true_false' ? true : '',
      explanation: ''
    }
    setQuizQuestions([...quizQuestions, newQuestion])
  }

  const removeQuestion = (questionId: string) => {
    setQuizQuestions(quizQuestions.filter(q => q.id !== questionId))
  }

  const updateQuestion = (questionId: string, field: keyof QuizQuestion, value: any) => {
    console.log('Updating question:', questionId, field, value) // Debug log
    setQuizQuestions(prevQuestions => 
      prevQuestions.map(q => 
        q.id === questionId ? { ...q, [field]: value } : q
      )
    )
  }

  const updateQuestionOption = (questionId: string, optionIndex: number, value: string) => {
    console.log('Updating option:', questionId, optionIndex, value) // Debug log
    setQuizQuestions(prevQuestions => 
      prevQuestions.map(q => 
        q.id === questionId ? {
          ...q,
          options: q.options?.map((opt, idx) => idx === optionIndex ? value : opt)
        } : q
      )
    )
  }

  const addQuestionOption = (questionId: string) => {
    setQuizQuestions(quizQuestions.map(q => 
      q.id === questionId && q.options ? {
        ...q,
        options: [...q.options, '']
      } : q
    ))
  }

  const removeQuestionOption = (questionId: string, optionIndex: number) => {
    setQuizQuestions(quizQuestions.map(q => 
      q.id === questionId && q.options && q.options.length > 2 ? {
        ...q,
        options: q.options.filter((_, idx) => idx !== optionIndex),
        correct: typeof q.correct === 'number' && q.correct > optionIndex ? q.correct - 1 : q.correct
      } : q
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Prepare quiz questions for storage
      let finalQuizQuestions = challenge.quizQuestions
      if (challenge.type === 'quiz' && quizQuestions.length > 0) {
        finalQuizQuestions = JSON.stringify(quizQuestions)
      }

      // Prepare data for database insertion
      const challengeData = {
        ...challenge,
        quizQuestions: finalQuizQuestions,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'active'
      }

      console.log('📤 Submitting challenge data:', challengeData)

      const { data, error } = await supabase
        .from('challenges')
        .insert([challengeData])

      if (error) {
        console.error('❌ Database error:', error)
        throw error
      }

      console.log('✅ Challenge created successfully:', data)
      setMessage('✅ Cabaran berjaya dicipta!')
      
      // Call the callback function if provided
      if (onChallengeCreated) {
        onChallengeCreated()
      }
      
      // Reset form
      setChallenge({
        title: '',
        description: '',
        type: 'coding',
        difficulty: 'beginner',
        points: 100,
        tingkatan: 'tingkatan-4',
        tags: []
      })
      
      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' })
      
    } catch (error) {
      console.error('❌ Error creating challenge:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      if (errorMessage.includes('difficulty')) {
        setMessage('❌ Database belum siap - column "difficulty" tidak wujud dalam table challenges. Sila setup database schema dahulu.')
      } else if (errorMessage.includes('challenges')) {
        setMessage('❌ Table "challenges" tidak wujud dalam database. Sila jalankan setup schema dahulu.')
      } else {
        setMessage('❌ Ralat mencipta cabaran: ' + errorMessage)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderSpecificFields = () => {
    const currentType = challengeTypes.find(t => t.value === challenge.type)
    const colorClasses = {
      blue: 'bg-blue-50 border-blue-200',
      purple: 'bg-purple-50 border-purple-200',
      red: 'bg-red-50 border-red-200',
      green: 'bg-green-50 border-green-200',
      yellow: 'bg-yellow-50 border-yellow-200',
      indigo: 'bg-indigo-50 border-indigo-200',
      teal: 'bg-teal-50 border-teal-200',
      orange: 'bg-orange-50 border-orange-200'
    }

    switch (challenge.type) {
      case 'coding':
        return (
          <div className={`space-y-4 p-6 rounded-lg border-2 ${colorClasses.blue}`}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">💻</span>
              <h3 className="font-semibold text-blue-800">Tetapan Cabaran Kod</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Had Masa (minit)</label>
                <input
                  type="number"
                  value={challenge.timeLimit || ''}
                  onChange={(e) => setChallenge({...challenge, timeLimit: parseInt(e.target.value) || undefined})}
                  className="w-full p-3 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="5"
                  max="180"
                  placeholder="30"
                />
                <p className="text-xs text-gray-500 mt-1">Masa yang dibenarkan untuk siapkan kod</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Kod Permulaan (Template)</label>
              <textarea
                value={challenge.startingCode || ''}
                onChange={(e) => setChallenge({...challenge, startingCode: e.target.value})}
                className="w-full p-3 border rounded-lg text-gray-800 h-24 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="# Tulis fungsi untuk mengira luas segi empat sama&#10;def kira_luas(panjang, lebar):&#10;    # Tulis kod anda di sini&#10;    pass"
              />
              <p className="text-xs text-gray-500 mt-1">Kod awal yang akan diberikan kepada murid</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Kes Ujian</label>
              <textarea
                value={challenge.testCases || ''}
                onChange={(e) => setChallenge({...challenge, testCases: e.target.value})}
                className="w-full p-3 border rounded-lg text-gray-800 h-32 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Input: kira_luas(5, 3)&#10;Expected: 15&#10;&#10;Input: kira_luas(10, 2)&#10;Expected: 20&#10;&#10;Input: kira_luas(0, 5)&#10;Expected: 0"
              />
              <p className="text-xs text-gray-500 mt-1">Ujian untuk menentukan jawapan betul</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Contoh Penyelesaian</label>
              <textarea
                value={challenge.sampleSolution || ''}
                onChange={(e) => setChallenge({...challenge, sampleSolution: e.target.value})}
                className="w-full p-3 border rounded-lg text-gray-800 h-32 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="def kira_luas(panjang, lebar):&#10;    return panjang * lebar"
              />
              <p className="text-xs text-gray-500 mt-1">Jawapan rujukan untuk admin</p>
            </div>
          </div>
        )

      case 'video':
        return (
          <div className={`space-y-4 p-6 rounded-lg border-2 ${colorClasses.red}`}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🎥</span>
              <h3 className="font-semibold text-red-800">Tetapan Cabaran Video</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">URL Video</label>
                <input
                  type="url"
                  value={challenge.videoUrl || ''}
                  onChange={(e) => setChallenge({...challenge, videoUrl: e.target.value})}
                  className="w-full p-3 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="https://youtube.com/watch?v=... atau Vimeo, etc"
                />
                <p className="text-xs text-gray-500 mt-1">Link YouTube, Vimeo, atau platform video lain</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tempoh Video (minit)</label>
                <input
                  type="number"
                  value={challenge.videoDuration || ''}
                  onChange={(e) => setChallenge({...challenge, videoDuration: parseInt(e.target.value) || undefined})}
                  className="w-full p-3 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                  min="1"
                  max="120"
                  placeholder="15"
                />
                <p className="text-xs text-gray-500 mt-1">Berapa minit video tersebut</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Soalan Selepas Menonton</label>
              <textarea
                value={challenge.videoQuestions || ''}
                onChange={(e) => setChallenge({...challenge, videoQuestions: e.target.value})}
                className="w-full p-3 border rounded-lg text-gray-800 h-32 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="1. Apakah konsep utama yang diterangkan dalam video?&#10;2. Berikan 2 contoh yang disebutkan dalam video&#10;3. Bagaimana konsep ini berkaitan dengan apa yang telah kita pelajari?"
              />
              <p className="text-xs text-gray-500 mt-1">Soalan untuk menguji pemahaman murid</p>
            </div>
          </div>
        )

      case 'reading':
        return (
          <div className={`space-y-4 p-6 rounded-lg border-2 ${colorClasses.green}`}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">📚</span>
              <h3 className="font-semibold text-green-800">Tetapan Cabaran Bacaan</h3>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">URL Artikel/Nota</label>
              <input
                type="url"
                value={challenge.readingUrl || ''}
                onChange={(e) => setChallenge({...challenge, readingUrl: e.target.value})}
                className="w-full p-3 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="https://example.com/article atau Google Docs link"
              />
              <p className="text-xs text-gray-500 mt-1">Link ke artikel, blog, atau dokumen</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Bahan Bacaan (atau teks penuh)</label>
              <textarea
                value={challenge.readingMaterial || ''}
                onChange={(e) => setChallenge({...challenge, readingMaterial: e.target.value})}
                className="w-full p-3 border rounded-lg text-gray-800 h-40 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Masukkan teks penuh artikel atau ringkasan kandungan yang perlu dibaca..."
              />
              <p className="text-xs text-gray-500 mt-1">Jika tiada link, masukkan teks penuh di sini</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Soalan Pemahaman</label>
              <textarea
                value={challenge.readingQuestions || ''}
                onChange={(e) => setChallenge({...challenge, readingQuestions: e.target.value})}
                className="w-full p-3 border rounded-lg text-gray-800 h-32 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="1. Nyatakan 3 poin utama dari artikel ini&#10;2. Bagaimana konsep ini berkaitan dengan Sains Komputer?&#10;3. Berikan contoh aplikasi dalam kehidupan seharian"
              />
              <p className="text-xs text-gray-500 mt-1">Soalan untuk menguji pemahaman bacaan</p>
            </div>
          </div>
        )

      case 'quiz':
        return (
          <div className={`space-y-6 p-6 rounded-xl border-2 ${colorClasses.purple} bg-gradient-to-r from-purple-50 to-indigo-50`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">📝</span>
              </div>
              <div>
                <h3 className="font-bold text-lg text-purple-800">Tetapan Kuiz</h3>
                <p className="text-sm text-purple-600">Cipta soalan kuiz dengan mudah</p>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-purple-200">
              <label className="block text-sm font-semibold mb-3 text-gray-700">Jenis Kuiz</label>
              <select
                value={challenge.quizType || 'multiple_choice'}
                onChange={(e) => setChallenge({...challenge, quizType: e.target.value as Challenge['quizType']})}
                className="w-full p-3 border-2 text-gray-800 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              >
                <option value="multiple_choice">📋 Aneka Pilihan (MCQ) - Paling Popular</option>
                <option value="true_false">✅ Benar/Salah - Senang & Pantas</option>
                <option value="fill_blank">✏️ Isi Tempat Kosong - Uji Ingatan</option>
              </select>
            </div>

            {/* Quiz Questions Builder */}
            <div className="bg-white p-5 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-800">Soalan Kuiz ({quizQuestions.length})</h4>
                <button
                  type="button"
                  onClick={() => addNewQuestion()}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all transform hover:scale-105"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Tambah Soalan
                </button>
              </div>

              {quizQuestions.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                  <div className="text-4xl mb-2">📝</div>
                  <p className="font-medium">Belum ada soalan</p>
                  <p className="text-sm">Klik "Tambah Soalan" untuk mula cipta kuiz</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {quizQuestions.map((question, index) => (
                    <div key={question.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start justify-between mb-3">
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm font-medium">
                          Soalan {index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeQuestion(question.id)}
                          className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700">Soalan</label>
                          <textarea
                            value={question.question || ''}
                            onChange={(e) => {
                              e.preventDefault()
                              updateQuestion(question.id, 'question', e.target.value)
                            }}
                            className="w-full p-3 border border-gray-300 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                            placeholder="Tulis soalan anda di sini..."
                            rows={3}
                          />
                        </div>

                        {question.type === 'multiple_choice' && (
                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">Pilihan Jawapan</label>
                            <div className="space-y-2">
                              {question.options?.map((option, optIndex) => (
                                <div key={optIndex} className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name={`correct-${question.id}`}
                                    checked={question.correct === optIndex}
                                    onChange={() => updateQuestion(question.id, 'correct', optIndex)}
                                    className="text-purple-500 focus:ring-purple-500"
                                  />
                                  <input
                                    type="text"
                                    value={option || ''}
                                    onChange={(e) => {
                                      e.preventDefault()
                                      updateQuestionOption(question.id, optIndex, e.target.value)
                                    }}
                                    className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
                                    placeholder={`Pilihan ${String.fromCharCode(65 + optIndex)}`}
                                  />
                                  {question.options && question.options.length > 2 && (
                                    <button
                                      type="button"
                                      onClick={() => removeQuestionOption(question.id, optIndex)}
                                      className="text-red-500 hover:text-red-700 p-1"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  )}
                                </div>
                              ))}
                              {question.options && question.options.length < 6 && (
                                <button
                                  type="button"
                                  onClick={() => addQuestionOption(question.id)}
                                  className="text-purple-500 hover:text-purple-700 text-sm font-medium flex items-center gap-1 mt-2"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                  Tambah Pilihan
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        {question.type === 'true_false' && (
                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">Jawapan Betul</label>
                            <div className="flex gap-4">
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  name={`correct-${question.id}`}
                                  checked={question.correct === true}
                                  onChange={() => updateQuestion(question.id, 'correct', true)}
                                  className="mr-2 text-green-500"
                                />
                                <span className="text-green-600 font-medium">✅ Benar</span>
                              </label>
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  name={`correct-${question.id}`}
                                  checked={question.correct === false}
                                  onChange={() => updateQuestion(question.id, 'correct', false)}
                                  className="mr-2 text-red-500"
                                />
                                <span className="text-red-600 font-medium">❌ Salah</span>
                              </label>
                            </div>
                          </div>
                        )}

                        {question.type === 'fill_blank' && (
                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">Jawapan Betul</label>
                            <input
                              type="text"
                              value={(question.correct as string) || ''}
                              onChange={(e) => {
                                e.preventDefault()
                                updateQuestion(question.id, 'correct', e.target.value)
                              }}
                              className="w-full p-3 border border-gray-300 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                              placeholder="Tulis jawapan yang betul..."
                            />
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700">Penjelasan (Opsional)</label>
                          <textarea
                            value={question.explanation || ''}
                            onChange={(e) => {
                              e.preventDefault()
                              updateQuestion(question.id, 'explanation', e.target.value)
                            }}
                            className="w-full p-2 border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
                            placeholder="Jelaskan jawapan untuk membantu murid faham..."
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )

      case 'interactive':
        return (
          <div className={`space-y-4 p-6 rounded-lg border-2 ${colorClasses.yellow}`}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🎮</span>
              <h3 className="font-semibold text-yellow-800">Tetapan Aktiviti Interaktif</h3>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Platform Interaktif</label>
              <select
                value={challenge.interactiveType || 'kahoot'}
                onChange={(e) => setChallenge({...challenge, interactiveType: e.target.value as Challenge['interactiveType']})}
                className="w-full p-3 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                {interactiveTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label} - {type.description}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">URL Aktiviti</label>
              <input
                type="url"
                value={challenge.interactiveUrl || ''}
                onChange={(e) => setChallenge({...challenge, interactiveUrl: e.target.value})}
                className="w-full p-3 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="https://kahoot.it/challenge/... atau link platform lain"
              />
              <p className="text-xs text-gray-500 mt-1">Link kepada aktiviti interaktif</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Arahan Khusus</label>
              <textarea
                value={challenge.interactiveInstructions || ''}
                onChange={(e) => setChallenge({...challenge, interactiveInstructions: e.target.value})}
                className="w-full p-3 border rounded-lg text-gray-800 h-24 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="1. Klik link di atas&#10;2. Masukkan kod permainan: XXXXX&#10;3. Gunakan nama penuh anda&#10;4. Siapkan dalam masa 15 minit"
              />
              <p className="text-xs text-gray-500 mt-1">Langkah-langkah untuk murid ikuti</p>
            </div>
          </div>
        )

      case 'discussion':
        return (
          <div className={`space-y-4 p-6 rounded-lg border-2 ${colorClasses.indigo}`}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">💬</span>
              <h3 className="font-semibold text-indigo-800">Tetapan Perbincangan</h3>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Topik Perbincangan</label>
              <input
                type="text"
                value={challenge.discussionTopic || ''}
                onChange={(e) => setChallenge({...challenge, discussionTopic: e.target.value})}
                className="w-full p-3 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Adakah AI akan menggantikan programmer pada masa depan?"
              />
              <p className="text-xs text-gray-500 mt-1">Soalan atau topik untuk dibincangkan</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Garis Panduan Perbincangan</label>
              <textarea
                value={challenge.discussionGuidelines || ''}
                onChange={(e) => setChallenge({...challenge, discussionGuidelines: e.target.value})}
                className="w-full p-3 border rounded-lg text-gray-800 h-32 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="1. Berikan pendapat dengan alasan yang kukuh&#10;2. Hormati pandangan rakan lain&#10;3. Sertakan contoh atau bukti untuk menyokong pendapat&#10;4. Respon kepada sekurang-kurangnya 2 komen rakan&#10;5. Perbincangan minimum 100 patah perkataan"
              />
              <p className="text-xs text-gray-500 mt-1">Peraturan dan panduan untuk perbincangan</p>
            </div>
          </div>
        )

      case 'project':
        return (
          <div className={`space-y-4 p-6 rounded-lg border-2 ${colorClasses.teal}`}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🚀</span>
              <h3 className="font-semibold text-teal-800">Tetapan Projek</h3>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Had Masa (hari)</label>
              <input
                type="number"
                value={challenge.timeLimit || ''}
                onChange={(e) => setChallenge({...challenge, timeLimit: parseInt(e.target.value) || undefined})}
                className="w-full p-3 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                min="1"
                max="30"
                placeholder="7"
              />
              <p className="text-xs text-gray-500 mt-1">Berapa hari untuk siapkan projek</p>
            </div>
          </div>
        )

      case 'assessment':
        return (
          <div className={`space-y-4 p-6 rounded-lg border-2 ${colorClasses.orange}`}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">📊</span>
              <h3 className="font-semibold text-orange-800">Tetapan Penilaian</h3>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Format Penilaian</label>
              <select
                value={challenge.assessmentFormat || 'written'}
                onChange={(e) => setChallenge({...challenge, assessmentFormat: e.target.value as Challenge['assessmentFormat']})}
                className="w-full p-3 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="written">📝 Bertulis</option>
                <option value="practical">🔧 Praktikal</option>
                <option value="presentation">🎤 Pembentangan</option>
                <option value="portfolio">📁 Portfolio</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Kriteria Penilaian</label>
              <textarea
                value={challenge.assessmentCriteria || ''}
                onChange={(e) => setChallenge({...challenge, assessmentCriteria: e.target.value})}
                className="w-full p-3 border rounded-lg text-gray-800 h-32 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="1. Ketepatan konsep (30%)&#10;2. Kreativiti penyelesaian (25%)&#10;3. Kualiti output (25%)&#10;4. Pembentangan (20%)"
              />
              <p className="text-xs text-gray-500 mt-1">Bagaimana penilaian akan dinilai</p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🎯 Cipta Cabaran Baru
          </h1>
          <p className="text-gray-600 text-lg">Cipta pelbagai jenis cabaran untuk meningkatkan pembelajaran murid</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Tutup"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg border-l-4 ${
          message.includes('berjaya') || message.includes('✅') 
            ? 'bg-green-50 text-green-700 border-green-400' 
            : 'bg-red-50 text-red-700 border-red-400'
        }`}>
          <div className="flex items-center">
            <span className="mr-2">{message.includes('✅') ? '✅' : '❌'}</span>
            {message}
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8" key="challenge-form">
        {/* Basic Info */}
        <div className="bg-white p-8 rounded-xl border-2 border-gray-100 shadow-lg" key="basic-info">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Maklumat Asas Cabaran</h2>
              <p className="text-gray-600">Isi maklumat utama untuk cabaran anda</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Tajuk Cabaran *</label>
              <input
                type="text"
                value={challenge.title || ''}
                onChange={(e) => {
                  const newValue = e.target.value
                  console.log('📝 Title input changed:', newValue) // Debug log
                  setChallenge(prev => {
                    const updated = {...prev, title: newValue}
                    console.log('📝 Updated challenge state:', updated)
                    return updated
                  })
                }}
                className="w-full p-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800"
                style={{ color: '#1f2937' }}
                placeholder="Cth: Belajar Asas Pengaturcaraan Python"
                required
              />
              <p className="text-xs text-gray-500">Nama cabaran yang menarik dan deskriptif</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Mata XP Ganjaran</label>
              <div className="relative">
                <input
                  type="number"
                  value={challenge.points}
                  onChange={(e) => setChallenge({...challenge, points: parseInt(e.target.value) || 100})}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800"
                  min="10"
                  max="1000"
                  step="10"
                  placeholder="100"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  XP
                </div>
              </div>
              <p className="text-xs text-gray-500">Mata pengalaman yang akan diterima (10-1000 XP)</p>
            </div>
          </div>

          <div className="mb-6 space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Penerangan Cabaran *</label>
            <textarea
              value={challenge.description || ''}
              onChange={(e) => {
                const newValue = e.target.value
                console.log('📝 Description input changed:', newValue) // Debug log
                setChallenge(prev => {
                  const updated = {...prev, description: newValue}
                  console.log('📝 Updated challenge state:', updated)
                  return updated
                })
              }}
              className="w-full p-4 border-2 border-gray-200 rounded-lg h-32 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none text-gray-800"
              style={{ color: '#1f2937' }}
              placeholder="Terangkan dengan jelas apa yang perlu dilakukan oleh murid dalam cabaran ini. Berikan arahan yang mudah difahami dan motivasi yang menarik..."
              required
            />
            <p className="text-xs text-gray-500">Penerangan yang jelas akan membantu murid memahami objektif cabaran</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Tahap Kesukaran</label>
              <select
                value={challenge.difficulty}
                onChange={(e) => setChallenge({...challenge, difficulty: e.target.value as Challenge['difficulty']})}
                className="w-full p-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800"
              >
                <option value="beginner">📗 Pemula - Sesuai untuk yang baru belajar</option>
                <option value="intermediate">📙 Sederhana - Memerlukan asas yang kukuh</option>
                <option value="advanced">📕 Lanjutan - Untuk murid yang mahir</option>
              </select>
              <p className="text-xs text-gray-500">Pilih tahap yang sesuai dengan kemampuan murid</p>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Tingkatan Sasaran</label>
              <select
                value={challenge.tingkatan}
                onChange={(e) => setChallenge({...challenge, tingkatan: e.target.value as Challenge['tingkatan']})}
                className="w-full p-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800"
              >
                <option value="tingkatan-4">📚 Tingkatan 4 - Asas & Pengenalan</option>
                <option value="tingkatan-5">📖 Tingkatan 5 - Lanjutan & Aplikasi</option>
                <option value="both">📗📖 Kedua-dua Tingkatan</option>
              </select>
              <p className="text-xs text-gray-500">Tentukan tahun pembelajaran yang sesuai</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Had Masa (Opsional)</label>
              <div className="relative">
                <input
                  type="number"
                  value={challenge.timeLimit || ''}
                  onChange={(e) => setChallenge({...challenge, timeLimit: parseInt(e.target.value) || undefined})}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800"
                  min="5"
                  max="180"
                  placeholder="30"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  minit
                </div>
              </div>
              <p className="text-xs text-gray-500">Masa yang dibenarkan (kosongkan jika tiada had)</p>
            </div>
          </div>
        </div>

        {/* Challenge Type Selection */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-xl border-2 border-blue-100 shadow-lg">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              🎯 Pilih Jenis Cabaran
            </h2>
            <p className="text-gray-600">Pilih jenis cabaran yang sesuai untuk murid anda</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {challengeTypes.map(type => (
              <div 
                key={type.value}
                className={`group relative p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  challenge.type === type.value 
                    ? `border-${type.color}-500 bg-${type.color}-50 shadow-xl ring-4 ring-${type.color}-100` 
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg'
                }`}
                onClick={() => setChallenge({...challenge, type: type.value as Challenge['type']})}
              >
                {challenge.type === type.value && (
                  <div className={`absolute -top-2 -right-2 w-6 h-6 bg-${type.color}-500 rounded-full flex items-center justify-center`}>
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                
                <div className="text-center">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{type.icon}</div>
                  <div className={`font-bold text-base mb-2 ${challenge.type === type.value ? `text-${type.color}-800` : 'text-gray-800'}`}>
                    {type.label.replace(/^.+ /, '')}
                  </div>
                  <div className={`text-sm leading-relaxed ${challenge.type === type.value ? `text-${type.color}-600` : 'text-gray-600'}`}>
                    {type.description}
                  </div>
                </div>
                
                <div className={`absolute inset-0 border-2 border-dashed rounded-xl opacity-0 transition-opacity duration-300 ${
                  challenge.type === type.value ? `border-${type.color}-300 opacity-100` : 'group-hover:opacity-30 border-gray-300'
                }`}></div>
              </div>
            ))}
          </div>
          
          {challenge.type && (
            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md border">
                <span className="text-2xl">{challengeTypes.find(t => t.value === challenge.type)?.icon}</span>
                <span className="font-medium text-gray-700">
                  Terpilih: {challengeTypes.find(t => t.value === challenge.type)?.label}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Specific Fields Based on Type */}
        {renderSpecificFields()}

        {/* Submit */}
        <div className="bg-gray-50 p-8 rounded-xl border-2 border-gray-100">
          <div className="flex flex-col items-center gap-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Sedia untuk Mencipta Cabaran?</h3>
              <p className="text-gray-600">Semak semula maklumat anda sebelum menyimpan</p>
            </div>
            
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting || !challenge.title || !challenge.description}
                className="group relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-lg transition-all transform hover:scale-105 disabled:hover:scale-100 flex items-center gap-3"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Mencipta Cabaran...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Cipta Cabaran Sekarang
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setChallenge({
                    title: '',
                    description: '',
                    type: 'coding',
                    difficulty: 'beginner',
                    points: 100,
                    tingkatan: 'tingkatan-4',
                    tags: []
                  })
                  setQuizQuestions([])
                  setMessage('')
                }}
                className="bg-white border-2 border-gray-300 text-gray-700 px-6 py-4 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all transform hover:scale-105 font-medium flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset Semula
              </button>
            </div>

            {(!challenge.title || !challenge.description) && (
              <div className="text-center text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg border border-red-200">
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Sila isi tajuk dan penerangan cabaran terlebih dahulu
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
