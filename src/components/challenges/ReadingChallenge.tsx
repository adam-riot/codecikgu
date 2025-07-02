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

      // Show confirmation when user reaches 90% or more
      if (percentage >= 90 && !showConfirmation && !isCompleted) {
        setShowConfirmation(true)
      }
    }

    const element = contentRef.current
    if (element) {
      element.addEventListener('scroll', handleScroll)
      return () => element.removeEventListener('scroll', handleScroll)
    }
  }, [showConfirmation, isCompleted])

  const handleConfirmUnderstanding = () => {
    setHasConfirmed(true)
    setIsCompleted(true)
    setShowConfirmation(false)
    onComplete(readPercentage, true)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const estimatedReadingTime = Math.ceil(challenge.content.content.split(' ').length / 200) // 200 words per minute

  if (isCompleted) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="glass-dark rounded-2xl p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-neon-green to-electric-blue rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-gradient-green mb-4">
            Bacaan Selesai!
          </h1>
          
          <p className="text-gray-300 text-lg mb-6">
            Tahniah! Anda telah membaca {Math.round(readPercentage)}% daripada kandungan ini.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="glass rounded-xl p-4">
              <div className="text-2xl font-bold text-gradient mb-1">{Math.round(readPercentage)}%</div>
              <div className="text-gray-400 text-sm">Dibaca</div>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="text-2xl font-bold text-gradient mb-1">{formatTime(readingTime)}</div>
              <div className="text-gray-400 text-sm">Masa Baca</div>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="text-2xl font-bold text-gradient mb-1">{challenge.content.content.split(' ').length}</div>
              <div className="text-gray-400 text-sm">Perkataan</div>
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
              Baca Semula
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Reading Header */}
      <div className="glass-dark rounded-2xl p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gradient mb-2">{challenge.title}</h1>
            <p className="text-gray-300">{challenge.description}</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gradient">{Math.round(readPercentage)}%</div>
              <div className="text-gray-400 text-sm">Kemajuan</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gradient">{formatTime(readingTime)}</div>
              <div className="text-gray-400 text-sm">Masa Baca</div>
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
            <span>Kemajuan Bacaan</span>
            <span>Anggaran masa: {estimatedReadingTime} minit</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-electric-blue to-neon-cyan h-3 rounded-full transition-all duration-300"
              style={{ width: `${readPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Reading Content */}
        <div className="lg:col-span-3">
          <div className="glass-dark rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-700/50">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <BookOpen className="w-6 h-6" />
                Kandungan Bacaan
              </h2>
            </div>
            
            <div 
              ref={contentRef}
              className="p-8 max-h-[600px] overflow-y-auto prose prose-invert prose-lg max-w-none"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#374151 #1f2937'
              }}
            >
              <div 
                className="text-gray-200 leading-relaxed"
                dangerouslySetInnerHTML={{ 
                  __html: challenge.content.content.replace(/\n/g, '<br />') 
                }}
              />
            </div>
          </div>
        </div>

        {/* Reading Stats & Info */}
        <div className="space-y-6">
          {/* Reading Stats */}
          <div className="glass-dark rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Statistik Bacaan
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Perkataan:</span>
                <span className="font-semibold text-white">{challenge.content.content.split(' ').length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Aksara:</span>
                <span className="font-semibold text-white">{challenge.content.content.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Anggaran masa:</span>
                <span className="font-semibold text-white">{estimatedReadingTime} min</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Masa sebenar:</span>
                <span className="font-semibold text-white">{formatTime(readingTime)}</span>
              </div>
            </div>
          </div>

          {/* Reading Tips */}
          <div className="glass-dark rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Scroll className="w-5 h-5" />
              Tips Bacaan
            </h3>
            
            <ul className="text-gray-300 space-y-2 text-sm">
              <li>• Baca dengan perlahan dan fahami setiap ayat</li>
              <li>• Ambil nota penting jika perlu</li>
              <li>• Scroll ke bawah untuk meneruskan bacaan</li>
              <li>• Kemajuan akan dijejaki secara automatik</li>
              <li>• Pastikan anda faham kandungan sebelum selesai</li>
            </ul>
          </div>

          {/* Requirements */}
          <div className="glass-dark rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5" />
              Keperluan
            </h3>
            
            <div className="space-y-3">
              {challenge.pass_criteria.completion_required && (
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-4 h-4 rounded-full ${hasConfirmed ? 'bg-neon-green' : 'bg-gray-600'}`}></div>
                  <span className={hasConfirmed ? 'text-neon-green' : 'text-gray-400'}>
                    Pengesahan "Saya Faham"
                  </span>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-4 h-4 rounded-full ${readPercentage >= 90 ? 'bg-neon-green' : 'bg-gray-600'}`}></div>
                <span className={readPercentage >= 90 ? 'text-neon-green' : 'text-gray-400'}>
                  Baca hingga 90% kandungan
                </span>
              </div>
            </div>
          </div>

          {/* Back Button */}
          <button
            onClick={onBack}
            className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-500 transition-colors"
          >
            Kembali ke Senarai
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && challenge.pass_criteria.completion_required && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="glass-dark rounded-xl w-full max-w-md">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-electric-blue to-neon-cyan rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gradient mb-2">Pengesahan Pemahaman</h2>
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
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-neon-green to-electric-blue text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300"
                >
                  Ya, Saya Faham
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
