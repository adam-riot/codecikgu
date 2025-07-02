"use client"

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { X, BookOpen, Video, FileText, Upload, Plus, Trash2 } from 'lucide-react'

interface CreateChallengeProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface Question {
  question_text: string
  options: string[]
  correct_answer: string
  points: number
}

export default function CreateChallenge({ isOpen, onClose, onSuccess }: CreateChallengeProps) {
  const [step, setStep] = useState(1)
  const [challengeType, setChallengeType] = useState<'quiz' | 'video' | 'reading' | 'upload'>('quiz')
  const [loading, setLoading] = useState(false)
  const supabase = createClientComponentClient()

  // Basic challenge info
  const [basicInfo, setBasicInfo] = useState({
    title: '',
    description: '',
    subject: 'Sains Komputer',
    tingkatan: 'Tingkatan 4',
    xp_reward: 50,
    deadline: ''
  })

  // Quiz specific
  const [questions, setQuestions] = useState<Question[]>([
    {
      question_text: '',
      options: ['', '', '', ''],
      correct_answer: 'A',
      points: 1
    }
  ])
  const [passCriteria, setPassCriteria] = useState({
    min_score: 5,
    total_questions: 10
  })

  // Video specific
  const [videoData, setVideoData] = useState({
    video_url: '',
    min_watch_percentage: 90
  })

  // Reading specific
  const [readingData, setReadingData] = useState({
    content: '',
    completion_required: true
  })

  const challengeTypes = [
    {
      type: 'quiz' as const,
      icon: BookOpen,
      title: 'Kuiz MCQ',
      description: 'Soalan aneka pilihan dengan markah automatik'
    },
    {
      type: 'video' as const,
      icon: Video,
      title: 'Tontonan Video',
      description: 'Video YouTube/Vimeo dengan penjejakan kemajuan'
    },
    {
      type: 'reading' as const,
      icon: FileText,
      title: 'Bahan Bacaan',
      description: 'Nota atau artikel untuk dibaca'
    },
    {
      type: 'upload' as const,
      icon: Upload,
      title: 'Muat Naik Fail',
      description: 'Murid muat naik tugasan atau projek'
    }
  ]

  const addQuestion = () => {
    setQuestions([...questions, {
      question_text: '',
      options: ['', '', '', ''],
      correct_answer: 'A',
      points: 1
    }])
  }

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index))
    }
  }

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions]
    if (field === 'options') {
      updated[index] = { ...updated[index], options: value }
    } else {
      updated[index] = { ...updated[index], [field]: value }
    }
    setQuestions(updated)
  }

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions]
    updated[questionIndex].options[optionIndex] = value
    setQuestions(updated)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('User not authenticated')

      let content = {}
      let criteria = {}

      switch (challengeType) {
        case 'quiz':
          content = { questions }
          criteria = { min_score: passCriteria.min_score, total_questions: questions.length }
          break
        case 'video':
          content = { video_url: videoData.video_url }
          criteria = { min_watch_percentage: videoData.min_watch_percentage }
          break
        case 'reading':
          content = { content: readingData.content }
          criteria = { completion_required: readingData.completion_required }
          break
        case 'upload':
          content = {}
          criteria = { manual_review: true }
          break
      }

      // Create challenge
      const { data: challenge, error: challengeError } = await supabase
        .from('challenges')
        .insert({
          title: basicInfo.title,
          description: basicInfo.description,
          type: challengeType,
          subject: basicInfo.subject,
          tingkatan: basicInfo.tingkatan,
          xp_reward: basicInfo.xp_reward,
          deadline: basicInfo.deadline || null,
          pass_criteria: criteria,
          content: content,
          created_by: user.user.id
        })
        .select()
        .single()

      if (challengeError) throw challengeError

      // For quiz type, create questions
      if (challengeType === 'quiz' && challenge) {
        const questionsToInsert = questions.map((q, index) => ({
          challenge_id: challenge.id,
          question_text: q.question_text,
          options: q.options,
          correct_answer: q.correct_answer,
          points: q.points,
          order_index: index
        }))

        const { error: questionsError } = await supabase
          .from('challenge_questions')
          .insert(questionsToInsert)

        if (questionsError) throw questionsError
      }

      onSuccess()
      onClose()
      resetForm()
    } catch (error) {
      console.error('Error creating challenge:', error)
      alert('Ralat mencipta cabaran. Sila cuba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setStep(1)
    setChallengeType('quiz')
    setBasicInfo({
      title: '',
      description: '',
      subject: 'Sains Komputer',
      tingkatan: 'Tingkatan 4',
      xp_reward: 50,
      deadline: ''
    })
    setQuestions([{
      question_text: '',
      options: ['', '', '', ''],
      correct_answer: 'A',
      points: 1
    }])
    setPassCriteria({ min_score: 5, total_questions: 10 })
    setVideoData({ video_url: '', min_watch_percentage: 90 })
    setReadingData({ content: '', completion_required: true })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="glass-dark rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-electric-blue to-neon-cyan bg-clip-text text-transparent">
              Cipta Cabaran Baharu
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Step 1: Choose Type */}
          {step === 1 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Pilih Jenis Cabaran</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {challengeTypes.map((type) => {
                  const IconComponent = type.icon
                  return (
                    <button
                      key={type.type}
                      onClick={() => setChallengeType(type.type)}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                        challengeType === type.type
                          ? 'border-electric-blue bg-electric-blue/10'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <IconComponent className={`w-6 h-6 ${
                          challengeType === type.type ? 'text-electric-blue' : 'text-gray-400'
                        }`} />
                        <h4 className="font-semibold text-white">{type.title}</h4>
                      </div>
                      <p className="text-sm text-gray-400">{type.description}</p>
                    </button>
                  )
                })}
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="btn-primary"
                >
                  Seterusnya
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Basic Info */}
          {step === 2 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Maklumat Asas</h3>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tajuk Cabaran
                  </label>
                  <input
                    type="text"
                    value={basicInfo.title}
                    onChange={(e) => setBasicInfo({...basicInfo, title: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-electric-blue focus:outline-none"
                    placeholder="Contoh: Kuiz Asas HTML"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Penerangan
                  </label>
                  <textarea
                    value={basicInfo.description}
                    onChange={(e) => setBasicInfo({...basicInfo, description: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-electric-blue focus:outline-none"
                    rows={3}
                    placeholder="Terangkan cabaran ini..."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Subjek
                    </label>
                    <select
                      value={basicInfo.subject}
                      onChange={(e) => setBasicInfo({...basicInfo, subject: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-electric-blue focus:outline-none"
                    >
                      <option value="Sains Komputer">Sains Komputer</option>
                      <option value="Matematik">Matematik</option>
                      <option value="Fizik">Fizik</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tingkatan
                    </label>
                    <select
                      value={basicInfo.tingkatan}
                      onChange={(e) => setBasicInfo({...basicInfo, tingkatan: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-electric-blue focus:outline-none"
                    >
                      <option value="Tingkatan 4">Tingkatan 4</option>
                      <option value="Tingkatan 5">Tingkatan 5</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      XP Ganjaran
                    </label>
                    <input
                      type="number"
                      value={basicInfo.xp_reward}
                      onChange={(e) => setBasicInfo({...basicInfo, xp_reward: parseInt(e.target.value)})}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-electric-blue focus:outline-none"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tarikh Tamat (Pilihan)
                    </label>
                    <input
                      type="datetime-local"
                      value={basicInfo.deadline}
                      onChange={(e) => setBasicInfo({...basicInfo, deadline: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-electric-blue focus:outline-none"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                >
                  Kembali
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="btn-primary"
                  disabled={!basicInfo.title || !basicInfo.description}
                >
                  Seterusnya
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Type-specific content */}
          {step === 3 && challengeType === 'quiz' && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Soalan Kuiz</h3>
              
              {/* Pass Criteria */}
              <div className="glass-dark rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-white mb-3">Syarat Lulus</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Markah Minimum</label>
                    <input
                      type="number"
                      value={passCriteria.min_score}
                      onChange={(e) => setPassCriteria({...passCriteria, min_score: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Jumlah Soalan</label>
                    <input
                      type="number"
                      value={questions.length}
                      readOnly
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-600 rounded text-gray-300"
                    />
                  </div>
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-6 mb-6">
                {questions.map((question, qIndex) => (
                  <div key={qIndex} className="glass-dark rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold text-white">Soalan {qIndex + 1}</h4>
                      {questions.length > 1 && (
                        <button
                          onClick={() => removeQuestion(qIndex)}
                          className="p-1 text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <textarea
                        value={question.question_text}
                        onChange={(e) => updateQuestion(qIndex, 'question_text', e.target.value)}
                        placeholder="Masukkan soalan..."
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                        rows={2}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {question.options.map((option, oIndex) => (
                          <div key={oIndex} className="flex items-center space-x-2">
                            <span className="text-gray-400 font-mono">
                              {String.fromCharCode(65 + oIndex)}.
                            </span>
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                              placeholder={`Pilihan ${String.fromCharCode(65 + oIndex)}`}
                              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                            />
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div>
                          <label className="block text-sm text-gray-300 mb-1">Jawapan Betul</label>
                          <select
                            value={question.correct_answer}
                            onChange={(e) => updateQuestion(qIndex, 'correct_answer', e.target.value)}
                            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                          >
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-300 mb-1">Markah</label>
                          <input
                            type="number"
                            value={question.points}
                            onChange={(e) => updateQuestion(qIndex, 'points', parseInt(e.target.value))}
                            className="w-20 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                            min="1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={addQuestion}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors mb-6"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Soalan</span>
              </button>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                >
                  Kembali
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || questions.some(q => !q.question_text || q.options.some(o => !o))}
                  className="btn-primary"
                >
                  {loading ? 'Mencipta...' : 'Cipta Cabaran'}
                </button>
              </div>
            </div>
          )}

          {/* Video Challenge Content */}
          {step === 3 && challengeType === 'video' && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Tetapan Video</h3>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    URL Video (YouTube/Vimeo)
                  </label>
                  <input
                    type="url"
                    value={videoData.video_url}
                    onChange={(e) => setVideoData({...videoData, video_url: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-electric-blue focus:outline-none"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Peratus Tontonan Minimum (% )
                  </label>
                  <input
                    type="number"
                    value={videoData.min_watch_percentage}
                    onChange={(e) => setVideoData({...videoData, min_watch_percentage: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-electric-blue focus:outline-none"
                    min="1"
                    max="100"
                  />
                </div>
              </div>
              <div className="flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                >
                  Kembali
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !videoData.video_url}
                  className="btn-primary"
                >
                  {loading ? 'Mencipta...' : 'Cipta Cabaran'}
                </button>
              </div>
            </div>
          )}

          {/* Reading Challenge Content */}
          {step === 3 && challengeType === 'reading' && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Bahan Bacaan</h3>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Kandungan
                  </label>
                  <textarea
                    value={readingData.content}
                    onChange={(e) => setReadingData({...readingData, content: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-electric-blue focus:outline-none"
                    rows={10}
                    placeholder="Masukkan kandungan bacaan di sini..."
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="completion_required"
                    checked={readingData.completion_required}
                    onChange={(e) => setReadingData({...readingData, completion_required: e.target.checked})}
                    className="w-4 h-4 text-electric-blue bg-gray-700 border-gray-600 rounded focus:ring-electric-blue"
                  />
                  <label htmlFor="completion_required" className="text-sm text-gray-300">
                    Memerlukan pengesahan "Saya Faham"
                  </label>
                </div>
              </div>
              <div className="flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                >
                  Kembali
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !readingData.content}
                  className="btn-primary"
                >
                  {loading ? 'Mencipta...' : 'Cipta Cabaran'}
                </button>
              </div>
            </div>
          )}

          {/* Upload Challenge Content */}
          {step === 3 && challengeType === 'upload' && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Tetapan Muat Naik</h3>
              <div className="glass-dark rounded-lg p-6 mb-6">
                <p className="text-gray-300 mb-4">
                  Cabaran jenis muat naik memerlukan penilaian manual oleh admin. 
                  Murid akan muat naik fail dan admin akan menilai secara manual.
                </p>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <p className="text-yellow-400 text-sm">
                    💡 Tip: Pastikan arahan yang jelas dalam penerangan cabaran tentang 
                    jenis fail yang perlu dimuat naik dan kriteria penilaian.
                  </p>
                </div>
              </div>
              <div className="flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                >
                  Kembali
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? 'Mencipta...' : 'Cipta Cabaran'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
