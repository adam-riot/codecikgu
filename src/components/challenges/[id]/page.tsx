'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase'
import QuizChallenge from '@/components/challenges/QuizChallenge'
import VideoChallenge from '@/components/challenges/VideoChallenge'
import ReadingChallenge from '@/components/challenges/ReadingChallenge'
import UploadChallenge from '@/components/challenges/UploadChallenge'

interface Challenge {
  id: string
  title: string
  description: string
  type: 'quiz' | 'video' | 'reading' | 'upload'
  xp_reward: number
  content: any
  pass_criteria: any
}

interface Question {
  id: string
  question_text: string
  options: string[]
  correct_answer: string
  points: number
  order_index: number
}

export default function ChallengePage() {
  const params = useParams()
  const router = useRouter()
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchChallenge()
    }
  }, [params.id])

  const fetchChallenge = async () => {
    try {
      const { data: challengeData, error: challengeError } = await supabase
        .from('challenges')
        .select('*')
        .eq('id', params.id)
        .single()

      if (challengeError) throw challengeError

      setChallenge(challengeData)

      // If it's a quiz, fetch questions
      if (challengeData.type === 'quiz') {
        const { data: questionsData, error: questionsError } = await supabase
          .from('quiz_questions')
          .select('*')
          .eq('challenge_id', params.id)
          .order('order_index')

        if (questionsError) throw questionsError
        setQuestions(questionsData || [])
      }

    } catch (error) {
      console.error('Error fetching challenge:', error)
      setError('Ralat memuat cabaran. Sila cuba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const handleChallengeComplete = async (score?: number, passed?: boolean, percentage?: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Update user XP if passed
      if (passed && challenge) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('xp')
          .eq('id', user.id)
          .single()

        if (profile) {
          await supabase
            .from('profiles')
            .update({ xp: (profile.xp || 0) + challenge.xp_reward })
            .eq('id', user.id)
        }
      }

      // Redirect back to dashboard
      router.push('/dashboard-murid')
      
    } catch (error) {
      console.error('Error completing challenge:', error)
    }
  }

  const handleBack = () => {
    router.push('/dashboard-murid')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Memuat cabaran...</p>
        </div>
      </div>
    )
  }

  if (error || !challenge) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Cabaran Tidak Dijumpai</h1>
          <p className="text-gray-300 mb-6">{error || 'Cabaran yang diminta tidak wujud.'}</p>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {challenge.type === 'quiz' && (
        <QuizChallenge
          challenge={challenge}
          questions={questions}
          onComplete={handleChallengeComplete}
          onBack={handleBack}
        />
      )}
      
      {challenge.type === 'video' && (
        <VideoChallenge
          challenge={challenge}
          onComplete={(percentage, passed) => handleChallengeComplete(undefined, passed, percentage)}
          onBack={handleBack}
        />
      )}
      
      {challenge.type === 'reading' && (
        <ReadingChallenge
          challenge={challenge}
          onComplete={(percentage, passed) => handleChallengeComplete(undefined, passed, percentage)}
          onBack={handleBack}
        />
      )}
      
      {challenge.type === 'upload' && (
        <UploadChallenge
          challenge={challenge}
          onComplete={(submitted) => handleChallengeComplete(undefined, submitted)}
          onBack={handleBack}
        />
      )}
    </div>
  )
}
