'use client'

import { useState, useEffect, useRef } from 'react'
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaExpand, FaCheckCircle, FaClock, FaTrophy } from 'react-icons/fa'

interface Challenge {
  id: string
  title: string
  description: string
  xp_reward: number
  content: {
    video_url: string
  }
  pass_criteria: {
    min_watch_percentage: number
  }
}

interface VideoChallengeProps {
  challenge: Challenge
  onComplete: (watchPercentage: number, passed: boolean) => void
  onBack: () => void
}

export default function VideoChallenge({ challenge, onComplete, onBack }: VideoChallengeProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [watchedSegments, setWatchedSegments] = useState<Array<{start: number, end: number}>>([])
  const [watchPercentage, setWatchPercentage] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [showControls, setShowControls] = useState(true)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
    }

    const handleTimeUpdate = () => {
      const current = video.currentTime
      setCurrentTime(current)
      
      // Track watched segments
      setWatchedSegments(prev => {
        const newSegments = [...prev]
        const existingSegment = newSegments.find(seg => 
          current >= seg.start - 5 && current <= seg.end + 5
        )
        
        if (existingSegment) {
          existingSegment.end = Math.max(existingSegment.end, current)
        } else {
          newSegments.push({ start: current, end: current })
        }
        
        // Calculate total watched time
        const totalWatched = newSegments.reduce((sum, seg) => sum + (seg.end - seg.start), 0)
        const percentage = (totalWatched / video.duration) * 100
        setWatchPercentage(Math.min(percentage, 100))
        
        // Check if completed
        if (percentage >= challenge.pass_criteria.min_watch_percentage && !isCompleted) {
          setIsCompleted(true)
          onComplete(percentage, true)
        }
        
        return newSegments
      })
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('timeupdate', handleTimeUpdate)

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('timeupdate', handleTimeUpdate)
    }
  }, [challenge.pass_criteria.min_watch_percentage, isCompleted, onComplete])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return

    const newTime = (parseFloat(e.target.value) / 100) * duration
    video.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return

    const newVolume = parseFloat(e.target.value) / 100
    video.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    if (isMuted) {
      video.volume = volume
      setIsMuted(false)
    } else {
      video.volume = 0
      setIsMuted(true)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const getVideoEmbedUrl = (url: string) => {
    // Convert YouTube URLs to embed format
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0]
      return `https://www.youtube.com/embed/${videoId}`
    }
    if (url.includes('youtu.be/' )) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0]
      return `https://www.youtube.com/embed/${videoId}`
    }
    return url
  }

  if (isCompleted ) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700 p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCheckCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Video Selesai Ditonton!</h2>
          <p className="text-gray-300 mb-6">
            Anda telah menonton {Math.round(watchPercentage)}% daripada video ini.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400 mb-1">
                {Math.round(watchPercentage)}%
              </div>
              <div className="text-sm text-gray-400">Ditonton</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-400 mb-1">
                {challenge.xp_reward}
              </div>
              <div className="text-sm text-gray-400">XP Diperoleh</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-400 mb-1">
                {formatTime(duration)}
              </div>
              <div className="text-sm text-gray-400">Durasi</div>
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
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white mb-1">{challenge.title}</h1>
              <p className="text-gray-400">{challenge.description}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Kemajuan</div>
              <div className="text-lg font-bold text-blue-400">
                {Math.round(watchPercentage)}% / {challenge.pass_criteria.min_watch_percentage}%
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(watchPercentage / challenge.pass_criteria.min_watch_percentage) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Minimum: {challenge.pass_criteria.min_watch_percentage}%</span>
              <span>Semasa: {Math.round(watchPercentage)}%</span>
            </div>
          </div>
        </div>

        {/* Video Player */}
        <div className="relative bg-black">
          {challenge.content.video_url.includes('youtube') ? (
            <iframe
              src={getVideoEmbedUrl(challenge.content.video_url)}
              className="w-full aspect-video"
              allowFullScreen
              title={challenge.title}
            />
          ) : (
            <div
              className="relative w-full aspect-video group"
              onMouseEnter={() => setShowControls(true)}
              onMouseLeave={() => setShowControls(false)}
            >
              <video
                ref={videoRef}
                src={challenge.content.video_url}
                className="w-full h-full object-contain"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              
              {/* Custom Controls */}
              {showControls && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  {/* Progress Bar */}
                  <div className="mb-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={duration ? (currentTime / duration) * 100 : 0}
                      onChange={handleSeek}
                      className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                  
                  {/* Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={togglePlay}
                        className="p-2 text-white hover:text-blue-400 transition-colors"
                      >
                        {isPlaying ? <FaPause className="w-5 h-5" /> : <FaPlay className="w-5 h-5" />}
                      </button>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={toggleMute}
                          className="text-white hover:text-blue-400 transition-colors"
                        >
                          {isMuted ? <FaVolumeMute className="w-4 h-4" /> : <FaVolumeUp className="w-4 h-4" />}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={isMuted ? 0 : volume * 100}
                          onChange={handleVolumeChange}
                          className="w-16 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      
                      <span className="text-white text-sm">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => videoRef.current?.requestFullscreen()}
                      className="p-2 text-white hover:text-blue-400 transition-colors"
                    >
                      <FaExpand className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-blue-400 mb-2">Keperluan</h3>
              <ul className="text-gray-300 space-y-1 text-sm">
                <li>• Tonton sekurang-kurangnya {challenge.pass_criteria.min_watch_percentage}% daripada video</li>
                <li>• Video akan dijejaki secara automatik</li>
                <li>• Anda boleh pause dan sambung menonton</li>
                <li>• Kemajuan akan disimpan secara real-time</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-blue-400 mb-2">Tips</h3>
              <ul className="text-gray-300 space-y-1 text-sm">
                <li>• Gunakan headphone untuk pengalaman yang lebih baik</li>
                <li>• Ambil nota penting semasa menonton</li>
                <li>• Anda boleh menonton semula jika perlu</li>
                <li>• Pastikan sambungan internet stabil</li>
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
    </div>
  )
}
