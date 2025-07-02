'use client'

import { useState } from 'react'
import { supabase } from '@/utils/supabase'
import { FaTimes, FaBook, FaVideo, FaFileAlt, FaUpload, FaPlus, FaTrash } from 'react-icons/fa'

interface CreateChallengeProps {
  onClose: () => void
  onSuccess: () => void
}

interface Question {
  question_text: string
  options: string[]
  correct_answer: string
  points: number
}

export default function CreateChallenge({ onClose, onSuccess }: CreateChallengeProps) {
  const [step, setStep] = useState(1)
  const [challengeType, setChallengeType] = useState<'quiz' | 'video' | 'reading' | 'upload'>('quiz')
  const [loading, setLoading] = useState(false)

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

  // Upload specific
  const [uploadData, setUploadData] = useState({
    instructions: '',
    allowed_file_types: ['pdf', 'doc', 'docx'],
    max_file_size: 10485760 // 10MB
  })

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

  const handleSubmit = async () => {
    setLoading(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      let content = {}
      let pass_criteria = {}

      switch (challengeType) {
        case 'quiz':
          content = { questions }
          pass_criteria = { min_score: passCriteria.min_score }
          break
        case 'video':
          content = { video_url: videoData.video_url }
          pass_criteria = { min_watch_percentage: videoData.min_watch_percentage }
          break
        case 'reading':
          content = { content: readingData.content }
          pass_criteria = { completion_required: readingData.completion_required }
          break
        case 'upload':
          content = {
            instructions: uploadData.instructions,
            allowed_file_types: uploadData.allowed_file_types,
            max_file_size: uploadData.max_file_size
          }
          pass_criteria = { manual_review: true }
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
          content,
          pass_criteria,
          deadline: basicInfo.deadline || null,
          created_by: user.id,
          evaluation_type: challengeType === 'upload' ? 'manual' : 'automatic'
        })
        .select()
        .single()

      if (challengeError) throw challengeError

      // For quiz challenges, create questions
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
          .from('quiz_questions')
          .insert(questionsToInsert)

        if (questionsError) throw questionsError
      }

      onSuccess()
      onClose()
      
    } catch (error) {
      console.error('Error creating challenge:', error)
      alert('Ralat mencipta cabaran. Sila cuba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Cipta Cabaran Baru</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Step 1: Choose Challenge Type */}
          {step === 1 && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Pilih Jenis Cabaran</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { type: 'quiz', icon: FaBook, title: 'Kuiz MCQ', desc: 'Soalan aneka pilihan dengan auto-scoring' },
                  { type: 'video', icon: FaVideo, title: 'Video', desc: 'Tonton video dengan progress tracking' },
                  { type: 'reading', icon: FaFileAlt, title: 'Bacaan', desc: 'Baca kandungan dengan comprehension tracking' },
                  { type: 'upload', icon: FaUpload, title: 'Upload', desc: 'Muat naik fail untuk semakan manual' }
                ].map(({ type, icon: Icon, title, desc }) => (
                  <button
                    key={type}
                    onClick={() => setChallengeType(type as any)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      challengeType === type
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <Icon className={`w-8 h-8 mb-3 ${challengeType === type ? 'text-blue-400' : 'text-gray-400'}`} />
                    <h4 className="font-medium text-white mb-1">{title}</h4>
                    <p className="text-sm text-gray-400">{desc}</p>
                  </button>
                ))}
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Seterusnya
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Basic Information */}
          {step === 2 && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Maklumat Asas</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tajuk Cabaran</label>
                  <input
                    type="text"
                    value={basicInfo.title}
                    onChange={(e) => setBasicInfo({...basicInfo, title: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="Masukkan tajuk cabaran"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Penerangan</label>
                  <textarea
                    value={basicInfo.description}
                    onChange={(e) => setBasicInfo({...basicInfo, description: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 h-24 resize-none"
                    placeholder="Terangkan cabaran ini"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Subjek</label>
                    <select
                      value={basicInfo.subject}
                      onChange={(e) => setBasicInfo({...basicInfo, subject: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="Sains Komputer">Sains Komputer</option>
                      <option value="Matematik">Matematik</option>
                      <option value="Sains">Sains</option>
                      <option value="Bahasa Inggeris">Bahasa Inggeris</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Tingkatan</label>
                    <select
                      value={basicInfo.tingkatan}
                      onChange={(e) => setBasicInfo({...basicInfo, tingkatan: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="Tingkatan 1">Tingkatan 1</option>
                      <option value="Tingkatan 2">Tingkatan 2</option>
                      <option value="Tingkatan 3">Tingkatan 3</option>
                      <option value="Tingkatan 4">Tingkatan 4</option>
                      <option value="Tingkatan 5">Tingkatan 5</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">XP Reward</label>
                    <input
                      type="number"
                      value={basicInfo.xp_reward}
                      onChange={(e) => setBasicInfo({...basicInfo, xp_reward: parseInt(e.target.value)})}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      min="1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Deadline (Pilihan)</label>
                    <input
                      type="datetime-local"
                      value={basicInfo.deadline}
                      onChange={(e) => setBasicInfo({...basicInfo, deadline: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                >
                  Kembali
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Seterusnya
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Challenge-specific content */}
          {step === 3 && (
            <div className="p-6">
              {challengeType === 'quiz' && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Setup Soalan Kuiz</h3>
                  
                  {questions.map((question, qIndex) => (
                    <div key={qIndex} className="bg-gray-800/50 rounded-lg p-4 mb-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-white">Soalan {qIndex + 1}</h4>
                        {questions.length > 1 && (
                          <button
                            onClick={() => removeQuestion(qIndex)}
                            className="p-1 text-red-400 hover:text-red-300"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={question.question_text}
                          onChange={(e) => updateQuestion(qIndex, 'question_text', e.target.value)}
                          placeholder="Masukkan soalan"
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        />
                        
                        {question.options.map((option, oIndex) => (
                          <div key={oIndex} className="flex gap-2">
                            <span className="px-3 py-2 bg-gray-700 text-white rounded-lg text-sm font-medium">
                              {String.fromCharCode(65 + oIndex)}
                            </span>
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...question.options]
                                newOptions[oIndex] = e.target.value
                                updateQuestion(qIndex, 'options', newOptions)
                              }}
                              placeholder={`Pilihan ${String.fromCharCode(65 + oIndex)}`}
                              className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        ))}
                        
                        <div className="flex gap-4">
                          <div>
                            <label className="block text-sm text-gray-300 mb-1">Jawapan Betul</label>
                            <select
                              value={question.correct_answer}
                              onChange={(e) => updateQuestion(qIndex, 'correct_answer', e.target.value)}
                              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                            >
                              {['A', 'B', 'C', 'D'].map(letter => (
                                <option key={letter} value={letter}>{letter}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm text-gray-300 mb-1">Markah</label>
                            <input
                              type="number"
                              value={question.points}
                              onChange={(e) => updateQuestion(qIndex, 'points', parseInt(e.target.value))}
                              className="w-20 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                              min="1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    onClick={addQuestion}
                    className="w-full p-3 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-blue-500 hover:text-blue-400 transition-colors flex items-center justify-center gap-2"
                  >
                    <FaPlus className="w-4 h-4" />
                    Tambah Soalan
                  </button>
                  
                  <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
                    <h4 className="font-medium text-white mb-3">Kriteria Lulus</h4>
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Markah Minimum untuk Lulus</label>
                      <input
                        type="number"
                        value={passCriteria.min_score}
                        onChange={(e) => setPassCriteria({...passCriteria, min_score: parseInt(e.target.value)})}
                        className="w-32 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        min="1"
                      />
                    </div>
                  </div>
                </div>
              )}

              {challengeType === 'video' && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Setup Video</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">URL Video</label>
                      <input
                        type="url"
                        value={videoData.video_url}
                        onChange={(e) => setVideoData({...videoData, video_url: e.target.value})}
                        placeholder="https://youtube.com/watch?v=... atau URL video lain"
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Minimum Peratusan Tontonan ({videoData.min_watch_percentage}% )
                      </label>
                      <input
                        type="range"
                        min="50"
                        max="100"
                        value={videoData.min_watch_percentage}
                        onChange={(e) => setVideoData({...videoData, min_watch_percentage: parseInt(e.target.value)})}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              )}

              {challengeType === 'reading' && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Setup Kandungan Bacaan</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Kandungan</label>
                    <textarea
                      value={readingData.content}
                      onChange={(e) => setReadingData({...readingData, content: e.target.value})}
                      placeholder="Masukkan kandungan bacaan di sini..."
                      className="w-full h-64 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
                    />
                  </div>
                </div>
              )}

              {challengeType === 'upload' && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Setup Upload</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Arahan Upload</label>
                      <textarea
                        value={uploadData.instructions}
                        onChange={(e) => setUploadData({...uploadData, instructions: e.target.value})}
                        placeholder="Terangkan apa yang perlu diupload dan kriteria penilaian..."
                        className="w-full h-32 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Jenis Fail Dibenarkan</label>
                      <div className="flex flex-wrap gap-2">
                        {['pdf', 'doc', 'docx', 'txt', 'jpg', 'png', 'zip'].map(type => (
                          <label key={type} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={uploadData.allowed_file_types.includes(type)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setUploadData({
                                    ...uploadData,
                                    allowed_file_types: [...uploadData.allowed_file_types, type]
                                  })
                                } else {
                                  setUploadData({
                                    ...uploadData,
                                    allowed_file_types: uploadData.allowed_file_types.filter(t => t !== type)
                                  })
                                }
                              }}
                              className="rounded"
                            />
                            <span className="text-gray-300 text-sm">.{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                >
                  Kembali
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
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
