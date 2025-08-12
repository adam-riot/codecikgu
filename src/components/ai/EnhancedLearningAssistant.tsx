// Enhanced AI Learning System
// src/components/ai/EnhancedLearningAssistant.tsx

import React, { useState, useEffect, useRef } from 'react'
import { 
  Brain, 
  MessageCircle, 
  Code, 
  TrendingUp, 
  Target, 
  BookOpen,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  Zap,
  Send,
  Loader2,
  Star,
  Award,
  Flame
} from 'lucide-react'
import { supabase } from '@/utils/supabase'

export interface LearningStyle {
  visual: number
  auditory: number
  kinesthetic: number
  readingWriting: number
}

export interface SkillLevel {
  programming: number
  problemSolving: number
  debugging: number
  codeReading: number
  conceptUnderstanding: number
}

export interface LearningPath {
  id: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: number
  prerequisites: string[]
  topics: LearningTopic[]
  adaptiveLevel: number
}

export interface LearningTopic {
  id: string
  title: string
  type: 'concept' | 'practice' | 'project' | 'assessment'
  content: string
  examples: CodeExample[]
  exercises: Exercise[]
}

export interface CodeExample {
  language: string
  code: string
  explanation: string
  difficulty: number
}

export interface Exercise {
  id: string
  title: string
  description: string
  starterCode: string
  solution: string
  hints: string[]
  testCases: TestCase[]
}

export interface TestCase {
  input: any
  expectedOutput: any
  description: string
}

export interface AIAnalysis {
  codeQuality: number
  performanceScore: number
  securityRating: number
  suggestions: Suggestion[]
  errors: CodeError[]
  optimizations: Optimization[]
}

export interface Suggestion {
  type: 'improvement' | 'alternative' | 'best-practice'
  message: string
  example?: string
  priority: 'low' | 'medium' | 'high'
}

export interface CodeError {
  line: number
  column: number
  type: 'syntax' | 'logic' | 'runtime'
  message: string
  suggestion: string
}

export interface Optimization {
  type: 'performance' | 'memory' | 'readability' | 'security'
  description: string
  impact: 'low' | 'medium' | 'high'
  example: string
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  metadata?: {
    codeAnalysis?: AIAnalysis
    learningPath?: LearningPath
    suggestions?: Suggestion[]
  }
}

export function EnhancedLearningAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [userSkills, setUserSkills] = useState<SkillLevel>({
    programming: 50,
    problemSolving: 50,
    debugging: 50,
    codeReading: 50,
    conceptUnderstanding: 50
  })
  const [learningStyle, setLearningStyle] = useState<LearningStyle>({
    visual: 25,
    auditory: 25,
    kinesthetic: 25,
    readingWriting: 25
  })
  const [currentLearningPath, setCurrentLearningPath] = useState<LearningPath | null>(null)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [codeAnalysis, setCodeAnalysis] = useState<AIAnalysis | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        await loadUserData(session.user.id)
      }
    } catch (error) {
      console.error('Error checking user:', error)
    }
  }

  const loadUserData = async (userId: string) => {
    try {
      // Load user skills and learning style from database
      const { data: userData } = await supabase
        .from('user_learning_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (userData) {
        setUserSkills(userData.skills || {
          programming: 50,
          problemSolving: 50,
          debugging: 50,
          codeReading: 50,
          conceptUnderstanding: 50
        })
        setLearningStyle(userData.learning_style || {
          visual: 25,
          auditory: 25,
          kinesthetic: 25,
          readingWriting: 25
        })
      }

      // Load chat history
      const { data: chatHistory } = await supabase
        .from('ai_chat_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(50)

      if (chatHistory) {
        const formattedMessages: ChatMessage[] = chatHistory.map((msg: any) => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          timestamp: new Date(msg.created_at),
          metadata: msg.metadata
        }))
        setMessages(formattedMessages)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      // Save user message to database
      if (user) {
        await supabase
          .from('ai_chat_history')
          .insert({
            user_id: user.id,
            role: 'user',
            content: message,
            metadata: null
          })
      }

      // Generate AI response
      const aiResponse = await generateAIResponse(message, userSkills, learningStyle)
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        metadata: {
          suggestions: generateSuggestions(message),
          learningPath: currentLearningPath || undefined
        }
      }

      setMessages(prev => [...prev, assistantMessage])

      // Save AI response to database
      if (user) {
        await supabase
          .from('ai_chat_history')
          .insert({
            user_id: user.id,
            role: 'assistant',
            content: aiResponse,
            metadata: assistantMessage.metadata
          })
      }

      // Update user skills based on interaction
      await updateUserSkills(message, aiResponse)

    } catch (error) {
      console.error('Error generating AI response:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Maaf, terdapat ralat dalam sistem AI. Sila cuba lagi.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const analyzeCode = async (code: string) => {
    if (!code.trim()) return

    setIsLoading(true)
    try {
      const analysis: AIAnalysis = {
        codeQuality: calculateCodeQuality(code),
        performanceScore: calculatePerformance(code),
        securityRating: calculateSecurity(code),
        suggestions: generateSuggestions(code),
        errors: detectErrors(code),
        optimizations: findOptimizations(code)
      }

      setCodeAnalysis(analysis)
      setShowAnalysis(true)

      // Save analysis to database
      if (user) {
        await supabase
          .from('code_analyses')
          .insert({
            user_id: user.id,
            code: code,
            analysis: analysis,
            created_at: new Date().toISOString()
          })
      }

    } catch (error) {
      console.error('Error analyzing code:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateLearningPath = (skills: SkillLevel, style: LearningStyle) => {
    const adaptiveLevel = calculateAdaptiveLevel(skills)
    const prerequisites = getPrerequisites(skills)
    const topics = generateTopics(skills, style)
    const estimatedTime = calculateEstimatedTime(skills)

    const learningPath: LearningPath = {
      id: Date.now().toString(),
      title: 'Jalan Pembelajaran Peribadi',
      description: 'Jalan pembelajaran yang disesuaikan dengan kemahiran dan gaya pembelajaran anda',
      difficulty: adaptiveLevel < 30 ? 'beginner' : adaptiveLevel < 70 ? 'intermediate' : 'advanced',
      estimatedTime,
      prerequisites,
      topics,
      adaptiveLevel
    }

    setCurrentLearningPath(learningPath)
    return learningPath
  }

  const updateUserSkills = async (message: string, response: string) => {
    if (!user) return

    try {
      // Analyze message content to determine skill improvements
      const skillUpdates: Partial<SkillLevel> = {}
      
      if (message.toLowerCase().includes('code') || message.toLowerCase().includes('programming')) {
        skillUpdates.programming = Math.min(100, userSkills.programming + 2)
      }
      if (message.toLowerCase().includes('problem') || message.toLowerCase().includes('solve')) {
        skillUpdates.problemSolving = Math.min(100, userSkills.problemSolving + 2)
      }
      if (message.toLowerCase().includes('debug') || message.toLowerCase().includes('error')) {
        skillUpdates.debugging = Math.min(100, userSkills.debugging + 2)
      }

      if (Object.keys(skillUpdates).length > 0) {
        const updatedSkills = { ...userSkills, ...skillUpdates }
        setUserSkills(updatedSkills)

        // Save to database
        await supabase
          .from('user_learning_profiles')
          .upsert({
            user_id: user.id,
            skills: updatedSkills,
            learning_style: learningStyle,
            updated_at: new Date().toISOString()
          })
      }
    } catch (error) {
      console.error('Error updating user skills:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="glass-dark rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gradient mb-2">AI Pembantu Pembelajaran</h1>
              <p className="text-gray-300">Pembantu AI peribadi untuk pembelajaran pengaturcaraan</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="glass-dark rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  <span className="text-xl font-bold text-white">{Math.round(userSkills.programming)}</span>
                  <span className="text-gray-300">Skill</span>
                </div>
              </div>
              <div className="glass-dark rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-400" />
                  <span className="text-xl font-bold text-white">{messages.length}</span>
                  <span className="text-gray-300">Interaksi</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <div className="glass-dark rounded-2xl p-6 h-[600px] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Sembang dengan AI</h2>
                <div className="flex items-center gap-2">
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin text-blue-400" />}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-800 text-white'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-2">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-800 text-white p-4 rounded-2xl">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>AI sedang menulis...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputMessage)}
                  placeholder="Tanya soalan tentang pengaturcaraan..."
                  className="flex-1 bg-gray-800 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <button
                  onClick={() => handleSendMessage(inputMessage)}
                  disabled={isLoading || !inputMessage.trim()}
                  className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Skills */}
            <div className="glass-dark rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Kemahiran Anda</h3>
              <div className="space-y-3">
                {Object.entries(userSkills).map(([skill, level]) => (
                  <div key={skill}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300 capitalize">{skill.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="text-white">{level}%</span>
                    </div>
                    <div className="bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full transition-all"
                        style={{ width: `${level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Learning Style */}
            <div className="glass-dark rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Gaya Pembelajaran</h3>
              <div className="space-y-3">
                {Object.entries(learningStyle).map(([style, percentage]) => (
                  <div key={style}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300 capitalize">{style.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="text-white">{percentage}%</span>
                    </div>
                    <div className="bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-dark rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Tindakan Pantas</h3>
              <div className="space-y-2">
                <button
                  onClick={() => generateLearningPath(userSkills, learningStyle)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg transition-colors text-left"
                >
                  <Target className="w-4 h-4 inline mr-2" />
                  Jana Jalan Pembelajaran
                </button>
                <button
                  onClick={() => setShowAnalysis(true)}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white p-3 rounded-lg transition-colors text-left"
                >
                  <Code className="w-4 h-4 inline mr-2" />
                  Analisis Kod
                </button>
                <button
                  onClick={() => handleSendMessage('Beri saya latihan pengaturcaraan')}
                  className="w-full bg-green-500 hover:bg-green-600 text-white p-3 rounded-lg transition-colors text-left"
                >
                  <BookOpen className="w-4 h-4 inline mr-2" />
                  Minta Latihan
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Code Analysis Modal */}
        {showAnalysis && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="glass-dark rounded-2xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gradient">Analisis Kod</h2>
                <button
                  onClick={() => setShowAnalysis(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <AlertTriangle className="w-6 h-6" />
                </button>
              </div>
              
              {codeAnalysis && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400">{codeAnalysis.codeQuality}%</div>
                    <div className="text-sm text-gray-300">Kualiti Kod</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">{codeAnalysis.performanceScore}%</div>
                    <div className="text-sm text-gray-300">Prestasi</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400">{codeAnalysis.securityRating}%</div>
                    <div className="text-sm text-gray-300">Keselamatan</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper functions
async function generateAIResponse(message: string, skills: SkillLevel, style: LearningStyle): Promise<string> {
  // This would integrate with a real AI service like OpenAI
  // For now, return a mock response
  const responses = [
    "Saya boleh membantu anda dengan soalan pengaturcaraan. Apakah yang anda ingin tahu?",
    "Berdasarkan kemahiran anda, saya cadangkan untuk fokus pada konsep asas terlebih dahulu.",
    "Untuk soalan ini, saya boleh memberikan contoh kod dan penjelasan terperinci.",
    "Latihan yang sesuai untuk tahap anda adalah untuk mengamalkan konsep yang telah dipelajari."
  ]
  
  return responses[Math.floor(Math.random() * responses.length)]
}

function calculateCodeQuality(code: string): number {
  // Mock implementation - would use real code analysis
  return Math.floor(Math.random() * 40) + 60
}

function calculatePerformance(code: string): number {
  // Mock implementation - would use real performance analysis
  return Math.floor(Math.random() * 30) + 70
}

function calculateSecurity(code: string): number {
  // Mock implementation - would use real security analysis
  return Math.floor(Math.random() * 25) + 75
}

function generateSuggestions(code: string): Suggestion[] {
  return [
    {
      type: 'improvement',
      message: 'Gunakan nama pembolehubah yang lebih deskriptif',
      priority: 'medium'
    },
    {
      type: 'best-practice',
      message: 'Tambah komen untuk kod yang kompleks',
      priority: 'high'
    }
  ]
}

function detectErrors(code: string): CodeError[] {
  return []
}

function findOptimizations(code: string): Optimization[] {
  return []
}

function calculateEstimatedTime(skills: SkillLevel): number {
  return Math.max(30, 120 - skills.programming)
}

function getPrerequisites(skills: SkillLevel): string[] {
  return ['Konsep asas pengaturcaraan', 'Logik asas']
}

function generateTopics(skills: SkillLevel, style: LearningStyle): LearningTopic[] {
  return []
}

function calculateAdaptiveLevel(skills: SkillLevel): number {
  return Math.round((skills.programming + skills.problemSolving + skills.debugging) / 3)
}
