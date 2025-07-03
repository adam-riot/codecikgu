'use client'

import { useState, useEffect, useRef } from 'react'
import { FaCheckCircle } from 'react-icons/fa'
import { Challenge } from '@/types'

interface VideoChallengeProps {
  challenge: Challenge
  onComplete: (watchPercentage: number, passed: boolean) => void
  onBack: () => void
}

export default function VideoChallenge({ challenge, onComplete, onBack }: VideoChallengeProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      const percentage = (video.currentTime / video.duration) * 100
      if (percentage >= (challenge.pass_criteria.min_watch_percentage ?? 90) && !isCompleted) {
        setIsCompleted(true)
        onComplete(percentage, true)
      }
    }
    video.addEventListener('timeupdate', handleTimeUpdate)
    return () => video.removeEventListener('timeupdate', handleTimeUpdate)
  }, [challenge.pass_criteria.min_watch_percentage, isCompleted, onComplete])

  const getVideoEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch')) return `https://www.youtube.com/embed/${url.split('v=' )[1]?.split('&')[0]}`
    if (url.includes('youtu.be/')) return `https://www.youtube.com/embed/${url.split('youtu.be/' )[1]?.split('?')[0]}`
    return url
  }

  if (isCompleted) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <FaCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white">Video Selesai Ditonton!</h2>
        <button onClick={onBack} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded">Kembali</button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-xl font-bold text-white mb-2">{challenge.title}</h1>
      <div className="relative bg-black">
        {challenge.content.video_url?.includes('youtube') ? (
          <iframe src={getVideoEmbedUrl(challenge.content.video_url)} className="w-full aspect-video" allowFullScreen title={challenge.title} />
        ) : (
          <video ref={videoRef} src={challenge.content.video_url} className="w-full h-full" controls />
        )}
      </div>
      <button onClick={onBack} className="mt-4 px-6 py-2 bg-gray-600 text-white rounded">Kembali</button>
    </div>
  )
}
