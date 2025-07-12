'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  SkipBack, 
  SkipForward,
  Settings,
  Download,
  BookOpen,
  Clock,
  Users,
  Star,
  ChevronDown,
  ChevronUp,
  FileText,
  Code,
  CheckCircle,
  PlayCircle
} from 'lucide-react'
import { useNotifications } from './NotificationProvider'

interface VideoLesson {
  id: string
  title: string
  description: string
  duration: number // in seconds
  thumbnail: string
  videoUrl: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  instructor: string
  views: number
  rating: number
  isCompleted: boolean
  isFavorite: boolean
  chapters: VideoChapter[]
  resources: VideoResource[]
  transcript: string
  tags: string[]
  relatedVideos: string[]
  quizzes?: QuizQuestion[]
  codeExamples?: CodeExample[]
}

interface VideoChapter {
  id: string
  title: string
  startTime: number
  endTime: number
  description?: string
}

interface VideoResource {
  id: string
  title: string
  type: 'pdf' | 'code' | 'link' | 'image'
  url: string
  description: string
}

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  timestamp: number
}

interface CodeExample {
  id: string
  title: string
  language: string
  code: string
  description: string
  timestamp: number
}

// Sample video lessons data
const sampleVideoLessons: VideoLesson[] = [
  {
    id: 'php-basics-intro',
    title: 'Pengenalan kepada PHP - Asas untuk Pemula',
    description: 'Belajar asas-asas PHP dari awal. Video ini merangkumi sintaks asas, pembolehubah, dan operasi mudah dalam PHP.',
    duration: 1800, // 30 minutes
    thumbnail: '/api/placeholder/400/225',
    videoUrl: '/videos/php-basics-intro.mp4',
    category: 'PHP Fundamentals',
    difficulty: 'beginner',
    instructor: 'Cikgu Ahmad',
    views: 15432,
    rating: 4.8,
    isCompleted: false,
    isFavorite: false,
    chapters: [
      { id: 'ch1', title: 'Apa itu PHP?', startTime: 0, endTime: 300, description: 'Pengenalan kepada bahasa PHP' },
      { id: 'ch2', title: 'Sintaks Asas', startTime: 300, endTime: 600, description: 'Tag PHP dan struktur asas' },
      { id: 'ch3', title: 'Pembolehubah', startTime: 600, endTime: 1200, description: 'Cara menggunakan pembolehubah dalam PHP' },
      { id: 'ch4', title: 'Operasi Asas', startTime: 1200, endTime: 1500, description: 'Operasi matematik dan string' },
      { id: 'ch5', title: 'Latihan Praktikal', startTime: 1500, endTime: 1800, description: 'Latihan hands-on' }
    ],
    resources: [
      { id: 'res1', title: 'PHP Cheat Sheet', type: 'pdf', url: '/resources/php-cheat-sheet.pdf', description: 'Rujukan cepat sintaks PHP' },
      { id: 'res2', title: 'Kod Contoh', type: 'code', url: '/code/php-basics.php', description: 'Semua contoh kod dalam video' },
      { id: 'res3', title: 'Dokumentasi PHP Rasmi', type: 'link', url: 'https://php.net/docs', description: 'Rujukan lengkap PHP' }
    ],
    transcript: 'Selamat datang ke kelas PHP asas. Hari ini kita akan belajar tentang...',
    tags: ['php', 'programming', 'web development', 'beginner'],
    relatedVideos: ['php-variables-deep', 'php-functions-intro'],
    quizzes: [
      {
        id: 'quiz1',
        question: 'Bagaimana cara yang betul untuk memulakan tag PHP?',
        options: ['<php>', '<?php', '<script type="php">', '<?'],
        correctAnswer: 1,
        explanation: '<?php adalah tag pembuka PHP yang standard dan disyorkan.',
        timestamp: 350
      }
    ],
    codeExamples: [
      {
        id: 'code1',
        title: 'Hello World PHP',
        language: 'php',
        code: '<?php\necho "Hello, World!";\n?>',
        description: 'Program PHP pertama anda',
        timestamp: 400
      }
    ]
  },
  {
    id: 'js-dom-manipulation',
    title: 'JavaScript DOM Manipulation - Mengawal Elemen HTML',
    description: 'Pelajari cara menggunakan JavaScript untuk memanipulasi elemen HTML secara dinamik.',
    duration: 2400, // 40 minutes
    thumbnail: '/api/placeholder/400/225',
    videoUrl: '/videos/js-dom-manipulation.mp4',
    category: 'JavaScript Fundamentals',
    difficulty: 'intermediate',
    instructor: 'Cikgu Siti',
    views: 12876,
    rating: 4.9,
    isCompleted: true,
    isFavorite: true,
    chapters: [
      { id: 'ch1', title: 'Apa itu DOM?', startTime: 0, endTime: 480 },
      { id: 'ch2', title: 'Selecting Elements', startTime: 480, endTime: 960 },
      { id: 'ch3', title: 'Changing Content', startTime: 960, endTime: 1440 },
      { id: 'ch4', title: 'Event Handling', startTime: 1440, endTime: 1920 },
      { id: 'ch5', title: 'Project: Interactive Form', startTime: 1920, endTime: 2400 }
    ],
    resources: [
      { id: 'res1', title: 'DOM Methods Reference', type: 'pdf', url: '/resources/dom-methods.pdf', description: 'Senarai method DOM yang penting' },
      { id: 'res2', title: 'Interactive Form Project', type: 'code', url: '/projects/interactive-form/', description: 'Projek lengkap dari video' }
    ],
    transcript: 'Dalam video ini, kita akan belajar tentang Document Object Model...',
    tags: ['javascript', 'dom', 'html', 'web development', 'intermediate'],
    relatedVideos: ['js-events-advanced', 'js-ajax-basics']
  }
]

export function VideoIntegrationSystem() {
  const [videos, setVideos] = useState<VideoLesson[]>(sampleVideoLessons)
  const [selectedVideo, setSelectedVideo] = useState<VideoLesson | null>(null)
  const [currentView, setCurrentView] = useState<'library' | 'player'>('library')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'rating'>('newest')
  const { addNotification } = useNotifications()

  const playVideo = (video: VideoLesson) => {
    setSelectedVideo(video)
    setCurrentView('player')
    
    addNotification({
      type: 'success',
      title: '▶️ Video Dimulakan',
      message: `Menonton: "${video.title}"`
    })
  }

  const toggleFavorite = (videoId: string) => {
    setVideos(prev => prev.map(video => 
      video.id === videoId 
        ? { ...video, isFavorite: !video.isFavorite }
        : video
    ))
    
    const video = videos.find(v => v.id === videoId)
    if (video) {
      addNotification({
        type: 'info',
        title: video.isFavorite ? '💔 Dikeluarkan dari Kegemaran' : '❤️ Ditambah ke Kegemaran',
        message: `"${video.title}"`
      })
    }
  }

  const markAsCompleted = (videoId: string) => {
    setVideos(prev => prev.map(video => 
      video.id === videoId 
        ? { ...video, isCompleted: true }
        : video
    ))
    
    const video = videos.find(v => v.id === videoId)
    if (video) {
      addNotification({
        type: 'success',
        title: '✅ Video Selesai!',
        message: `+50 XP untuk menonton "${video.title}"`
      })
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400 bg-green-400/20'
      case 'intermediate': return 'text-yellow-400 bg-yellow-400/20'
      case 'advanced': return 'text-red-400 bg-red-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}j ${minutes}m`
    }
    return `${minutes}m`
  }

  const filteredVideos = videos
    .filter(video => {
      const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           video.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesCategory = filterCategory === 'all' || video.category === filterCategory
      const matchesDifficulty = filterDifficulty === 'all' || video.difficulty === filterDifficulty
      return matchesSearch && matchesCategory && matchesDifficulty
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.views - a.views
        case 'rating':
          return b.rating - a.rating
        case 'newest':
        default:
          return 0 // Would sort by upload date in real app
      }
    })

  const categories = [...new Set(videos.map(v => v.category))]

  if (currentView === 'player' && selectedVideo) {
    return (
      <VideoPlayer 
        video={selectedVideo}
        onBack={() => setCurrentView('library')}
        onMarkCompleted={() => markAsCompleted(selectedVideo.id)}
        onToggleFavorite={() => toggleFavorite(selectedVideo.id)}
      />
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gradient mb-2">Perpustakaan Video</h2>
        <p className="text-gray-400">Tonton video pembelajaran interaktif dengan guru berpengalaman</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass-dark rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <PlayCircle className="w-8 h-8 text-electric-blue" />
            <div>
              <h3 className="text-2xl font-bold text-white">{videos.length}</h3>
              <p className="text-gray-400 text-sm">Video Tersedia</p>
            </div>
          </div>
        </div>
        
        <div className="glass-dark rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-8 h-8 text-green-400" />
            <div>
              <h3 className="text-2xl font-bold text-white">{videos.filter(v => v.isCompleted).length}</h3>
              <p className="text-gray-400 text-sm">Video Selesai</p>
            </div>
          </div>
        </div>
        
        <div className="glass-dark rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <Star className="w-8 h-8 text-yellow-400" />
            <div>
              <h3 className="text-2xl font-bold text-white">{videos.filter(v => v.isFavorite).length}</h3>
              <p className="text-gray-400 text-sm">Kegemaran</p>
            </div>
          </div>
        </div>
        
        <div className="glass-dark rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <Clock className="w-8 h-8 text-purple-400" />
            <div>
              <h3 className="text-2xl font-bold text-white">
                {Math.floor(videos.reduce((total, v) => total + v.duration, 0) / 3600)}j
              </h3>
              <p className="text-gray-400 text-sm">Jumlah Kandungan</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-dark rounded-xl p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Cari video..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue"
            />
          </div>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
          >
            <option value="all">Semua Kategori</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
          >
            <option value="all">Semua Tahap</option>
            <option value="beginner">Pemula</option>
            <option value="intermediate">Pertengahan</option>
            <option value="advanced">Mahir</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
          >
            <option value="newest">Terbaru</option>
            <option value="popular">Paling Popular</option>
            <option value="rating">Rating Tertinggi</option>
          </select>
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredVideos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            onPlay={() => playVideo(video)}
            onToggleFavorite={() => toggleFavorite(video.id)}
            getDifficultyColor={getDifficultyColor}
            formatDuration={formatDuration}
          />
        ))}
      </div>

      {filteredVideos.length === 0 && (
        <div className="text-center py-12">
          <PlayCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">Tiada Video Dijumpai</h3>
          <p className="text-gray-500">Cuba laraskan carian atau penapis anda</p>
        </div>
      )}
    </div>
  )
}

// Video Card Component
function VideoCard({ 
  video, 
  onPlay, 
  onToggleFavorite, 
  getDifficultyColor, 
  formatDuration 
}: {
  video: VideoLesson
  onPlay: () => void
  onToggleFavorite: () => void
  getDifficultyColor: (difficulty: string) => string
  formatDuration: (seconds: number) => string
}) {
  return (
    <div className="glass-dark rounded-xl overflow-hidden card-hover group">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-800">
        <img 
          src={video.thumbnail} 
          alt={video.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={onPlay}
            className="w-16 h-16 bg-electric-blue/90 rounded-full flex items-center justify-center hover:bg-electric-blue transition-colors"
          >
            <Play className="w-8 h-8 text-black ml-1" />
          </button>
        </div>
        
        {/* Duration */}
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
          {formatDuration(video.duration)}
        </div>
        
        {/* Completion Badge */}
        {video.isCompleted && (
          <div className="absolute top-2 left-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white line-clamp-2 mb-2">{video.title}</h3>
            <p className="text-gray-400 text-sm line-clamp-2">{video.description}</p>
          </div>
          
          <button
            onClick={onToggleFavorite}
            className="text-gray-400 hover:text-yellow-400 transition-colors ml-2"
          >
            <Star className={`w-5 h-5 ${video.isFavorite ? 'fill-current text-yellow-400' : ''}`} />
          </button>
        </div>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-sm mb-4">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getDifficultyColor(video.difficulty)}`}>
            {video.difficulty.toUpperCase()}
          </span>
          
          <div className="flex items-center space-x-3 text-gray-400">
            <span className="flex items-center space-x-1">
              <Users className="w-3 h-3" />
              <span>{video.views.toLocaleString()}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Star className="w-3 h-3" />
              <span>{video.rating.toFixed(1)}</span>
            </span>
          </div>
        </div>

        {/* Instructor */}
        <div className="flex items-center space-x-2 text-gray-400 text-sm mb-4">
          <div className="w-6 h-6 bg-electric-blue/20 rounded-full flex items-center justify-center">
            <span className="text-electric-blue text-xs font-bold">
              {video.instructor.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <span>{video.instructor}</span>
        </div>

        {/* Category */}
        <div className="text-xs text-gray-500 mb-4">{video.category}</div>

        {/* Action Button */}
        <button
          onClick={onPlay}
          className="w-full btn-primary"
        >
          <Play className="w-4 h-4 mr-2" />
          {video.isCompleted ? 'Tonton Semula' : 'Tonton Video'}
        </button>
      </div>
    </div>
  )
}

// Video Player Component  
function VideoPlayer({ 
  video, 
  onBack, 
  onMarkCompleted, 
  onToggleFavorite 
}: {
  video: VideoLesson
  onBack: () => void
  onMarkCompleted: () => void
  onToggleFavorite: () => void
}) {
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(video.duration)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [activeTab, setActiveTab] = useState<'chapters' | 'resources' | 'transcript' | 'quiz'>('chapters')
  const [showSidebar, setShowSidebar] = useState(true)
  const { addNotification } = useNotifications()

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const jumpToTime = (time: number) => {
    setCurrentTime(time)
    // In real implementation, would control video element
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ← Kembali ke Perpustakaan
        </button>
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleFavorite}
            className="p-2 text-gray-400 hover:text-yellow-400 transition-colors"
          >
            <Star className={`w-5 h-5 ${video.isFavorite ? 'fill-current text-yellow-400' : ''}`} />
          </button>
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            {showSidebar ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className={`grid gap-6 ${showSidebar ? 'lg:grid-cols-3' : 'lg:grid-cols-1'}`}>
        {/* Video Player */}
        <div className={showSidebar ? 'lg:col-span-2' : 'lg:col-span-1'}>
          <div className="glass-dark rounded-xl overflow-hidden">
            {/* Video Area */}
            <div className="relative aspect-video bg-black">
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <div className="text-center">
                  <Play className="w-16 h-16 mx-auto mb-4 text-electric-blue" />
                  <p className="text-gray-300">Video Player Placeholder</p>
                  <p className="text-gray-400 text-sm">({video.videoUrl})</p>
                </div>
              </div>
              
              {/* Controls Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center space-x-2 text-white text-sm mb-2">
                    <span>{formatTime(currentTime)}</span>
                    <div className="flex-1 bg-gray-700 h-1 rounded-full cursor-pointer">
                      <div 
                        className="bg-electric-blue h-1 rounded-full transition-all"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
                
                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="text-white hover:text-electric-blue transition-colors"
                    >
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    </button>
                    
                    <button className="text-white hover:text-electric-blue transition-colors">
                      <SkipBack className="w-5 h-5" />
                    </button>
                    
                    <button className="text-white hover:text-electric-blue transition-colors">
                      <SkipForward className="w-5 h-5" />
                    </button>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="text-white hover:text-electric-blue transition-colors"
                      >
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      </button>
                      <div className="w-20 bg-gray-700 h-1 rounded-full">
                        <div 
                          className="bg-white h-1 rounded-full"
                          style={{ width: `${volume * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="text-white hover:text-electric-blue transition-colors">
                      <Settings className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      className="text-white hover:text-electric-blue transition-colors"
                    >
                      {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Info */}
            <div className="p-6">
              <h1 className="text-2xl font-bold text-white mb-3">{video.title}</h1>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4 text-gray-400 text-sm">
                  <span>{video.views.toLocaleString()} tontonan</span>
                  <span>{video.rating.toFixed(1)} ⭐</span>
                  <span>{video.instructor}</span>
                </div>
                
                <button
                  onClick={onMarkCompleted}
                  disabled={video.isCompleted}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    video.isCompleted 
                      ? 'bg-green-500/20 text-green-400 cursor-default'
                      : 'bg-electric-blue text-black hover:bg-electric-blue/80'
                  }`}
                >
                  {video.isCompleted ? 'Selesai ✓' : 'Tandakan Selesai'}
                </button>
              </div>
              <p className="text-gray-300">{video.description}</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        {showSidebar && (
          <div className="glass-dark rounded-xl">
            {/* Tabs */}
            <div className="flex border-b border-gray-700">
              {[
                { id: 'chapters', label: 'Bab', icon: BookOpen },
                { id: 'resources', label: 'Sumber', icon: Download },
                { id: 'transcript', label: 'Transkrip', icon: FileText },
                { id: 'quiz', label: 'Kuiz', icon: CheckCircle }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 text-sm transition-colors ${
                    activeTab === tab.id 
                      ? 'text-electric-blue border-b-2 border-electric-blue' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-4 max-h-96 overflow-y-auto">
              {activeTab === 'chapters' && (
                <div className="space-y-3">
                  {video.chapters.map((chapter, index) => (
                    <div
                      key={chapter.id}
                      className="p-3 bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors"
                      onClick={() => jumpToTime(chapter.startTime)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-white">{index + 1}. {chapter.title}</span>
                        <span className="text-xs text-gray-400">{formatTime(chapter.startTime)}</span>
                      </div>
                      {chapter.description && (
                        <p className="text-gray-400 text-sm">{chapter.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'resources' && (
                <div className="space-y-3">
                  {video.resources.map(resource => (
                    <div key={resource.id} className="p-3 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center space-x-3 mb-2">
                        <FileText className="w-4 h-4 text-electric-blue" />
                        <span className="font-medium text-white">{resource.title}</span>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">{resource.description}</p>
                      <button className="text-electric-blue hover:text-electric-blue/80 text-sm">
                        Muat Turun →
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'transcript' && (
                <div className="text-gray-300 text-sm leading-relaxed">
                  {video.transcript}
                </div>
              )}

              {activeTab === 'quiz' && (
                <div className="space-y-4">
                  {video.quizzes?.map(quiz => (
                    <div key={quiz.id} className="p-3 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-white">{quiz.question}</span>
                        <span className="text-xs text-gray-400">{formatTime(quiz.timestamp)}</span>
                      </div>
                      <div className="space-y-2">
                        {quiz.options.map((option, index) => (
                          <div
                            key={index}
                            className={`p-2 rounded text-sm ${
                              index === quiz.correctAnswer 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-gray-700 text-gray-300'
                            }`}
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                      <p className="text-gray-400 text-xs mt-2">{quiz.explanation}</p>
                    </div>
                  )) || (
                    <p className="text-gray-400 text-center">Tiada kuiz untuk video ini</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
