'use client'

// OLD (Lucide)
import { Play, Pause, Volume2 } from 'lucide-react'

// NEW (React Icons)
import { FaPlay, FaPause, FaVolumeUp } from 'react-icons/fa'
import { MdQuiz, MdVideoLibrary, MdUpload } from 'react-icons/md'


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
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [watchedSegments, setWatchedSegments] = useState<Array<{start: number, end: number}>>([])
  const [watchPercentage, setWatchPercentage] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  const controlsTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
      setIsLoading(false)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      updateWatchedSegments(video.currentTime)
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleVolumeChange = () => {
      setVolume(video.volume)
      setIsMuted(video.muted)
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('volumechange', handleVolumeChange)

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('volumechange', handleVolumeChange)
    }
  }, [])

  const updateWatchedSegments = (currentTime: number) => {
    setWatchedSegments(prev => {
      const newSegments = [...prev]
      const segmentSize = 5 // 5 second segments
      const segmentIndex = Math.floor(currentTime / segmentSize)
      const segmentStart = segmentIndex * segmentSize
      const segmentEnd = Math.min(segmentStart + segmentSize, duration)

      // Check if this segment is already watched
      const existingSegment = newSegments.find(
        seg => seg.start <= segmentStart && seg.end >= segmentEnd
      )

      if (!existingSegment) {
        newSegments.push({ start: segmentStart, end: segmentEnd })
        
        // Merge overlapping segments
        newSegments.sort((a, b) => a.start - b.start)
        const merged = []
        for (const segment of newSegments) {
          if (merged.length === 0 || merged[merged.length - 1].end < segment.start) {
            merged.push(segment)
          } else {
            merged[merged.length - 1].end = Math.max(merged[merged.length - 1].end, segment.end)
          }
        }
        
        // Calculate watch percentage
        const totalWatched = merged.reduce((sum, seg) => sum + (seg.end - seg.start), 0)
        const percentage = Math.min((totalWatched / duration) * 100, 100)
        setWatchPercentage(percentage)

        // Check if completed
        if (percentage >= challenge.pass_criteria.min_watch_percentage && !isCompleted) {
          setIsCompleted(true)
          onComplete(percentage, true)
        }

        return merged
      }

      return prev
    })
  }

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current
    if (!video) return

    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newTime = (clickX / rect.width) * duration
    video.currentTime = newTime
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return

    const newVolume = parseFloat(e.target.value)
    video.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !video.muted
    setIsMuted(!isMuted)
  }

  const toggleFullscreen = () => {
    const video = videoRef.current
    if (!video) return

    if (!isFullscreen) {
      if (video.requestFullscreen) {
        video.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
    setIsFullscreen(!isFullscreen)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleMouseMove = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 3000)
  }

  const getVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    return match ? match[1] : null
  }

  const isYouTubeVideo = challenge.content.video_url.includes('youtube.com') || challenge.content.video_url.includes('youtu.be')

  if (isCompleted) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="glass-dark rounded-2xl p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-neon-green to-electric-blue rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-gradient-green mb-4">
            Video Selesai Ditonton!
          </h1>
          
          <p className="text-gray-300 text-lg mb-6">
            Tahniah! Anda telah menonton {Math.round(watchPercentage)}% daripada video ini.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <div className="glass rounded-xl p-4">
              <div className="text-2xl font-bold text-gradient mb-1">{Math.round(watchPercentage)}%</div>
              <div className="text-gray-400 text-sm">Ditonton</div>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="text-2xl font-bold text-gradient mb-1">{formatTime(duration)}</div>
              <div className="text-gray-400 text-sm">Durasi</div>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="text-2xl font-bold text-gradient mb-1">{challenge.xp_reward}</div>
              <div className="text-gray-400 text-sm">XP Diperoleh</div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={onBack}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-500 transition-colors"
            >
              Kembali ke Senarai
            </button>
            <button
              onClick={() => setIsCompleted(false)}
              className="px-6 py-3 bg-gradient-to-r from-electric-blue to-neon-cyan text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300"
            >
              Tonton Semula
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Video Header */}
      <div className="glass-dark rounded-2xl p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gradient mb-2">{challenge.title}</h1>
            <p className="text-gray-300">{challenge.description}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gradient">{Math.round(watchPercentage)}%</div>
              <div className="text-gray-400 text-sm">Kemajuan</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gradient">{challenge.xp_reward}</div>
              <div className="text-gray-400 text-sm">XP</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Kemajuan Tontonan</span>
            <span>Minimum: {challenge.pass_criteria.min_watch_percentage}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-electric-blue to-neon-cyan h-3 rounded-full transition-all duration-300"
              style={{ width: `${watchPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Video Player */}
      <div className="glass-dark rounded-2xl overflow-hidden mb-6">
        <div 
          className="relative bg-black aspect-video"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => isPlaying && setShowControls(false)}
        >
          {isYouTubeVideo ? (
            <iframe
              src={`https://www.youtube.com/embed/${getVideoId(challenge.content.video_url )}?enablejsapi=1`}
              className="w-full h-full"
              allowFullScreen
              title={challenge.title}
            />
          ) : (
            <>
              <video
                ref={videoRef}
                src={challenge.content.video_url}
                className="w-full h-full"
                onClick={togglePlay}
              />
              
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="text-white text-lg">Memuat video...</div>
                </div>
              )}

              {/* Video Controls */}
              <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
                showControls ? 'opacity-100' : 'opacity-0'
              }`}>
                {/* Progress Bar */}
                <div 
                  className="w-full bg-gray-600 rounded-full h-2 mb-4 cursor-pointer"
                  onClick={handleSeek}
                >
                  <div 
                    className="bg-electric-blue h-2 rounded-full relative"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  >
                    <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg"></div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={togglePlay}
                      className="text-white hover:text-electric-blue transition-colors"
                    >
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    </button>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={toggleMute}
                        className="text-white hover:text-electric-blue transition-colors"
                      >
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-20"
                      />
                    </div>
                    
                    <div className="text-white text-sm">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                  </div>

                  <button
                    onClick={toggleFullscreen}
                    className="text-white hover:text-electric-blue transition-colors"
                  >
                    <Maximize className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Video Info */}
      <div className="glass-dark rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>📹</span>
          Maklumat Video
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-electric-blue mb-2">Keperluan</h3>
            <ul className="text-gray-300 space-y-1 text-sm">
              <li>• Tonton sekurang-kurangnya {challenge.pass_criteria.min_watch_percentage}% daripada video</li>
              <li>• Video akan dijejaki secara automatik</li>
              <li>• Anda boleh pause dan sambung menonton</li>
              <li>• Kemajuan akan disimpan secara real-time</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-electric-blue mb-2">Tips</h3>
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
  )
}
