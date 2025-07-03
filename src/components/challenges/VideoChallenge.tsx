'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
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

  // Safe access to min_watch_percentage with type checking
  const getMinWatchPercentage = useCallback((): number => {
    if (!challenge.pass_criteria) {
      return 90; // Default to 90%
    }

    const passCriteria = challenge.pass_criteria as { min_watch_percentage?: number; min_percentage?: number };
    
    // Check for min_watch_percentage first
    if (typeof passCriteria.min_watch_percentage === 'number') {
      return passCriteria.min_watch_percentage;
    }

    // Check for min_percentage as fallback
    if (typeof passCriteria.min_percentage === 'number') {
      return passCriteria.min_percentage;
    }

    return 90; // Default fallback
  }, [challenge.pass_criteria]);

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const minWatchPercentage = getMinWatchPercentage();

    const handleTimeUpdate = () => {
      const percentage = (video.currentTime / video.duration) * 100
      if (percentage >= minWatchPercentage && !isCompleted) {
        setIsCompleted(true)
        onComplete(percentage, true)
      }
    }
    video.addEventListener('timeupdate', handleTimeUpdate)
    return () => video.removeEventListener('timeupdate', handleTimeUpdate)
  }, [getMinWatchPercentage, isCompleted, onComplete])

  const getVideoEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch')) return `https://www.youtube.com/embed/${url.split('v=')[1]?.split('&')[0]}`
    if (url.includes('youtu.be/')) return `https://www.youtube.com/embed/${url.split('youtu.be/')[1]?.split('?')[0]}`
    return url
  }

  // Safe access to video_url with type checking
  const getVideoUrl = (): string => {
    if (!challenge.content) {
      return '';
    }

    const content = challenge.content as { video_url?: string };
    return content.video_url || '';
  };

  const videoUrl = getVideoUrl();

  if (isCompleted) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <FaCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white">Video Selesai Ditonton!</h2>
        <button onClick={onBack} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded">Kembali</button>
      </div>
    )
  }

  if (!videoUrl) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-xl font-bold text-white mb-2">{challenge.title}</h1>
        <div className="bg-gray-800 p-8 rounded-lg text-center">
          <p className="text-gray-300">Tiada video tersedia untuk cabaran ini.</p>
        </div>
        <button onClick={onBack} className="mt-4 px-6 py-2 bg-gray-600 text-white rounded">Kembali</button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-xl font-bold text-white mb-2">{challenge.title}</h1>
      <div className="relative bg-black rounded-lg overflow-hidden">
        {videoUrl.includes('youtube') ? (
          <iframe 
            src={getVideoEmbedUrl(videoUrl)} 
            className="w-full aspect-video" 
            allowFullScreen 
            title={challenge.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        ) : (
          <video 
            ref={videoRef} 
            src={videoUrl} 
            className="w-full h-full" 
            controls 
            preload="metadata"
          />
        )}
      </div>
      <div className="mt-2 text-sm text-gray-400">
        Peratus minimum untuk lulus: {getMinWatchPercentage()}%
      </div>
      <button onClick={onBack} className="mt-4 px-6 py-2 bg-gray-600 text-white rounded">Kembali</button>
    </div>
  )
}

