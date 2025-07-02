'use client'

import { useState, useEffect, useRef } from 'react'
import { FaCheckCircle, FaBook, FaClock, FaTrophy, FaEye, FaScroll } from 'react-icons/fa'

interface Challenge {
  id: string
  title: string
  description: string
  xp_reward: number
  content: {
    content: string
  }
  pass_criteria: {
    completion_required: boolean
  }
}

interface ReadingChallengeProps {
  challenge: Challenge
  onComplete: (readPercentage: number, passed: boolean) => void
  onBack: () => void
}

export default function ReadingChallenge({ challenge, onComplete, onBack }: ReadingChallengeProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [readPercentage, setReadPercentage] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [readingTime, setReadingTime] = useState(0)
  const [hasConfirmed, setHasConfirmed] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setReadingTime(prev => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const element = contentRef.current
      if (!element) return

      const scrollTop = element.scrollTop
      const scrollHeight = element.scrollHeight
      const clientHeight = element.clientHeight
      
      const scrolled = scrollTop / (scrollHeight - clientHeight)
      const percentage = Math.min(Math.max(scrolled * 100, 0), 100)
      
      setReadPercentage(percentage)
      
      if (percentage >= 90 && !showConfirmation && !hasConfirmed) {
        setShowConfirmation(true)
      }
    }

    const element = contentRef.current
    if (element) {
      element.addEventListener('scroll', handleScroll)
      return () => element.removeEventListener('scroll', handleScroll)
    }
  }, [showConfirmation, hasConfirmed])

  const handleConfirmUnderstanding = () => {
    setHasConfirmed(true)
    setShowConfirmation(false)
    setIsCompleted(true)
    onComplete(readPercentage, true)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const wordCount = challenge.content.content.split(/\s+/).length
  const estimatedReadingTime = Math.ceil(wordCount / 200) // 200 words per minute

  if (isCompleted) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700 p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCheckCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Bacaan Selesai!</h2>
          <p className="text-gray-300 mb-6">
            Anda telah membaca {Math.round(readPercentage)}% daripada kandungan ini.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400 mb-1">
                {Math.round(readPercentage)}%
              </div>
              <div className="text-sm text-gray-400">Dibaca</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-400 mb-1">
                {formatTime(readingTime)}
              </div>
              <div className="text-sm text-gray-400">Masa Bacaan</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-400 mb-1">
                {challenge.xp_reward}
              </div>
              <div className="text-sm text-gray-400">XP Diperoleh</div>
            </div>
          </div>

          <button
            onClick={onBack}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300"
          >
            Kembali ke Senarai
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-white mb-1">{challenge.title}</h1>
              <p className="text-gray-400">{challenge.description}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Kemajuan</div>
              <div className="text-lg font-bold text-blue-400">
                {Math.round(readPercentage)}%
              </div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <FaBook className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <div className="text-sm font-medium text-white">{wordCount}</div>
              <div className="text-xs text-gray-400">Perkataan</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <FaClock className="w-5 h-5 text-green-400 mx-auto mb-1" />
              <div className="text-sm font-medium text-white">{estimatedReadingTime} min</div>
              <div className="text-xs text-gray-400">Anggaran</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <FaEye className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <div className="text-sm font-medium text-white">{formatTime(readingTime)}</div>
              <div className="text-xs text-gray-400">Masa Baca</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <FaTrophy className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
              <div className="text-sm font-medium text-white">{challenge.xp_reward}</div>
              <div className="text-xs text-gray-400">XP Reward</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${readPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Mula</span>
              <span>{Math.round(readPercentage)}% dibaca</span>
              <span>Tamat</span>
            </div>
          </div>
        </div>

        {/* Reading Content */}
        <div 
          ref={contentRef}
          className="h-96 overflow-y-auto p-6 prose prose-invert prose-blue max-w-none"
          style={{ scrollBehavior: 'smooth' }}
        >
          <div 
            className="text-gray-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: challenge.content.content.replace(/\n/g, '<br>') }}
          />
        </div>

        {/* Instructions */}
        <div className="p-6 border-t border-gray-700">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
                <FaScroll className="w-4 h-4" />
                Arahan
              </h3>
              <ul className="text-gray-300 space-y-1 text-sm">
                <li>• Baca kandungan dengan teliti</li>
                <li>• Scroll ke bawah untuk meneruskan bacaan</li>
                <li>• Kemajuan akan dijejaki secara automatik</li>
                <li>• Pastikan anda faham kandungan sebelum selesai</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-blue-400 mb-2">Tips Bacaan</h3>
              <ul className="text-gray-300 space-y-1 text-sm">
                <li>• Baca dengan kelajuan yang selesa</li>
                <li>• Ambil nota penting jika perlu</li>
                <li>• Jangan tergesa-gesa untuk selesai</li>
                <li>• Fokus pada pemahaman kandungan</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-700/50">
            <button
              onClick={onBack}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-500 transition-colors"
            >
              Kembali ke Senarai
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Pengesahan Pemahaman</h2>
              <p className="text-gray-300">
                Anda telah membaca {Math.round(readPercentage)}% daripada kandungan ini. 
                Adakah anda faham dengan apa yang telah dibaca?
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-500 transition-colors"
              >
                Baca Semula
              </button>
              <button
                onClick={handleConfirmUnderstanding}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300"
              >
                Ya, Saya Faham
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
