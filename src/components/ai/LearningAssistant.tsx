import React, { useState, useRef, useEffect } from 'react'
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Lightbulb, 
  Code, 
  BookOpen, 
  HelpCircle,
  Zap,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

export interface CodeAnalysis {
  score: number
  issues: CodeIssue[]
  suggestions: string[]
  complexity: 'low' | 'medium' | 'high'
  style: 'good' | 'fair' | 'poor'
  performance: 'excellent' | 'good' | 'fair' | 'poor'
}

export interface CodeIssue {
  line: number
  type: 'error' | 'warning' | 'info'
  message: string
  suggestion: string
}

export interface Suggestion {
  id: string
  title: string
  description: string
  code?: string
  priority: 'high' | 'medium' | 'low'
  category: 'performance' | 'style' | 'logic' | 'best-practice'
}

export interface Explanation {
  concept: string
  definition: string
  examples: string[]
  relatedTopics: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

export interface Question {
  id: string
  question: string
  type: 'multiple-choice' | 'coding' | 'short-answer'
  options?: string[]
  correctAnswer: string
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  metadata?: {
    codeAnalysis?: CodeAnalysis
    suggestions?: Suggestion[]
    explanation?: Explanation
    questions?: Question[]
  }
}

interface LearningAssistantProps {
  currentCode?: string
  currentTopic?: string
  userLevel: 'beginner' | 'intermediate' | 'advanced'
  onCodeSuggestion: (code: string) => void
}

export function LearningAssistant({ 
  currentCode, 
  currentTopic, 
  userLevel, 
  onCodeSuggestion 
}: LearningAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [activeTab, setActiveTab] = useState<'chat' | 'analysis' | 'help'>('chat')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Welcome message
    if (messages.length === 0) {
      addAssistantMessage(
        `🤖 Hai! Saya adalah AI Learning Assistant untuk Sains Komputer. Saya boleh membantu anda dengan:\n\n✨ Analisis kod\n💡 Penerangan konsep\n🎯 Latihan soalan\n🚀 Tips pengaturcaraan\n\nApa yang boleh saya bantu hari ini?`
      )
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Auto-analyze code when it changes
    if (currentCode && currentCode.trim().length > 50) {
      analyzeCurrentCode()
    }
  }, [currentCode])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const addAssistantMessage = (content: string, metadata?: any) => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      type: 'assistant',
      content,
      timestamp: new Date(),
      metadata
    }
    setMessages(prev => [...prev, message])
  }

  const addUserMessage = (content: string) => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, message])
  }

  const analyzeCurrentCode = async () => {
    if (!currentCode) return

    const analysis = AIService.analyzeCode(currentCode)
    addAssistantMessage(
      `🔍 Saya telah menganalisis kod anda. Berikut adalah analisis terperinci:`,
      { codeAnalysis: analysis }
    )
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage = input.trim()
    addUserMessage(userMessage)
    setInput('')
    setIsTyping(true)

    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const response = await AIService.processQuery(userMessage, currentCode, currentTopic, userLevel)
      addAssistantMessage(response.content, response.metadata)
    } catch (error) {
      addAssistantMessage('Maaf, saya menghadapi masalah teknikal. Sila cuba lagi.')
    } finally {
      setIsTyping(false)
    }
  }

  const handleQuickAction = async (action: string) => {
    setIsTyping(true)
    
    try {
      let response
      switch (action) {
        case 'analyze':
          if (currentCode) {
            response = {
              content: '🔍 Analisis kod telah selesai!',
              metadata: { codeAnalysis: AIService.analyzeCode(currentCode) }
            }
          } else {
            response = { content: 'Sila masukkan kod terlebih dahulu untuk dianalisis.' }
          }
          break
        case 'explain':
          response = {
            content: '📚 Berikut adalah penerangan konsep:',
            metadata: { explanation: AIService.explainConcept(currentTopic || 'algoritma') }
          }
          break
        case 'practice':
          response = {
            content: '🎯 Berikut adalah soalan latihan untuk anda:',
            metadata: { questions: AIService.generatePracticeQuestions(currentTopic || 'algoritma') }
          }
          break
        case 'improve':
          if (currentCode) {
            response = {
              content: '💡 Berikut adalah cadangan penambahbaikan:',
              metadata: { suggestions: AIService.suggestImprovements(currentCode) }
            }
          } else {
            response = { content: 'Sila masukkan kod terlebih dahulu untuk mendapat cadangan.' }
          }
          break
        default:
          response = { content: 'Maaf, saya tidak faham arahan tersebut.' }
      }
      
      addAssistantMessage(response.content, response.metadata)
    } finally {
      setIsTyping(false)
    }
  }

  const renderCodeAnalysis = (analysis: CodeAnalysis) => (
    <div className="bg-gray-50 rounded-lg p-4 mt-3">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900">Analisis Kod</h4>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            analysis.score >= 80 ? 'bg-green-100 text-green-800' :
            analysis.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            Skor: {analysis.score}/100
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-sm text-gray-600">Kerumitan</div>
          <div className={`font-medium ${
            analysis.complexity === 'low' ? 'text-green-600' :
            analysis.complexity === 'medium' ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {analysis.complexity === 'low' ? 'Rendah' : 
             analysis.complexity === 'medium' ? 'Sederhana' : 'Tinggi'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600">Gaya</div>
          <div className={`font-medium ${
            analysis.style === 'good' ? 'text-green-600' :
            analysis.style === 'fair' ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {analysis.style === 'good' ? 'Baik' : 
             analysis.style === 'fair' ? 'Sederhana' : 'Lemah'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600">Prestasi</div>
          <div className={`font-medium ${
            analysis.performance === 'excellent' ? 'text-green-600' :
            analysis.performance === 'good' ? 'text-green-600' :
            analysis.performance === 'fair' ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {analysis.performance === 'excellent' ? 'Cemerlang' :
             analysis.performance === 'good' ? 'Baik' :
             analysis.performance === 'fair' ? 'Sederhana' : 'Lemah'}
          </div>
        </div>
      </div>

      {analysis.issues.length > 0 && (
        <div className="mb-4">
          <h5 className="font-medium text-gray-900 mb-2">Isu Ditemui:</h5>
          <div className="space-y-2">
            {analysis.issues.map((issue, index) => (
              <div key={index} className="flex items-start space-x-2">
                {issue.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                ) : issue.type === 'warning' ? (
                  <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    Baris {issue.line}: {issue.message}
                  </div>
                  <div className="text-sm text-gray-600">{issue.suggestion}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {analysis.suggestions.length > 0 && (
        <div>
          <h5 className="font-medium text-gray-900 mb-2">Cadangan:</h5>
          <ul className="list-disc list-inside space-y-1">
            {analysis.suggestions.map((suggestion, index) => (
              <li key={index} className="text-sm text-gray-600">{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )

  const renderSuggestions = (suggestions: Suggestion[]) => (
    <div className="bg-blue-50 rounded-lg p-4 mt-3">
      <h4 className="font-medium text-gray-900 mb-3">💡 Cadangan Penambahbaikan</h4>
      <div className="space-y-3">
        {suggestions.map((suggestion) => (
          <div key={suggestion.id} className="border border-blue-200 rounded-lg p-3 bg-white">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h5 className="font-medium text-gray-900">{suggestion.title}</h5>
                <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
                {suggestion.code && (
                  <div className="mt-2">
                    <button
                      onClick={() => onCodeSuggestion(suggestion.code!)}
                      className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                    >
                      Gunakan Kod Ini
                    </button>
                  </div>
                )}
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                suggestion.priority === 'high' ? 'bg-red-100 text-red-800' :
                suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {suggestion.priority === 'high' ? 'Tinggi' :
                 suggestion.priority === 'medium' ? 'Sederhana' : 'Rendah'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderQuestions = (questions: Question[]) => (
    <div className="bg-green-50 rounded-lg p-4 mt-3">
      <h4 className="font-medium text-gray-900 mb-3">🎯 Soalan Latihan</h4>
      <div className="space-y-4">
        {questions.map((question, index) => (
          <div key={question.id} className="border border-green-200 rounded-lg p-3 bg-white">
            <div className="font-medium text-gray-900 mb-2">
              {index + 1}. {question.question}
            </div>
            {question.options && (
              <div className="space-y-1 mb-2">
                {question.options.map((option, optIndex) => (
                  <div key={optIndex} className="text-sm text-gray-600">
                    {String.fromCharCode(65 + optIndex)}. {option}
                  </div>
                ))}
              </div>
            )}
            <div className="text-xs text-gray-500">
              Kesukaran: {question.difficulty === 'easy' ? 'Mudah' : 
                         question.difficulty === 'medium' ? 'Sederhana' : 'Sukar'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="ai-learning-assistant bg-white rounded-lg shadow-lg h-96 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-blue-600" />
            <h3 className="font-medium text-gray-900">AI Learning Assistant</h3>
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1 rounded text-sm ${activeTab === 'chat' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
            >
              Chat
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              className={`px-3 py-1 rounded text-sm ${activeTab === 'analysis' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
            >
              Analisis
            </button>
            <button
              onClick={() => setActiveTab('help')}
              className={`px-3 py-1 rounded text-sm ${activeTab === 'help' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
            >
              Bantuan
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-3 border-b border-gray-100 bg-gray-50">
        <div className="flex space-x-2">
          <button
            onClick={() => handleQuickAction('analyze')}
            className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
          >
            <Code className="w-3 h-3" />
            <span>Analisis Kod</span>
          </button>
          <button
            onClick={() => handleQuickAction('explain')}
            className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200"
          >
            <BookOpen className="w-3 h-3" />
            <span>Terangkan</span>
          </button>
          <button
            onClick={() => handleQuickAction('practice')}
            className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs hover:bg-yellow-200"
          >
            <HelpCircle className="w-3 h-3" />
            <span>Latihan</span>
          </button>
          <button
            onClick={() => handleQuickAction('improve')}
            className="flex items-center space-x-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs hover:bg-purple-200"
          >
            <Lightbulb className="w-3 h-3" />
            <span>Improve</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              message.type === 'user' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-900'
            }`}>
              <div className="flex items-start space-x-2">
                {message.type === 'assistant' && <Bot className="w-4 h-4 mt-0.5 text-blue-600" />}
                {message.type === 'user' && <User className="w-4 h-4 mt-0.5" />}
                <div className="flex-1">
                  <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                  
                  {/* Render metadata */}
                  {message.metadata?.codeAnalysis && renderCodeAnalysis(message.metadata.codeAnalysis)}
                  {message.metadata?.suggestions && renderSuggestions(message.metadata.suggestions)}
                  {message.metadata?.questions && renderQuestions(message.metadata.questions)}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4 text-blue-600" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Tanya apa-apa soalan..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isTyping}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export class AIService {
  /**
   * Analyze code and provide feedback
   */
  static analyzeCode(code: string): CodeAnalysis {
    const issues: CodeIssue[] = []
    const suggestions: string[] = []
    let score = 100

    // Basic analysis patterns
    const lines = code.split('\n')
    
    // Check for common issues
    lines.forEach((line, index) => {
      const lineNum = index + 1
      
      // Check for undefined variables (simple pattern)
      if (line.includes('undefined') || line.includes('null')) {
        issues.push({
          line: lineNum,
          type: 'warning',
          message: 'Kemungkinan nilai undefined/null',
          suggestion: 'Periksa nilai sebelum menggunakan'
        })
        score -= 5
      }
      
      // Check for missing semicolons in JS
      if (line.trim().length > 0 && !line.trim().endsWith(';') && !line.trim().endsWith('{') && !line.trim().endsWith('}')) {
        if (code.includes('console.log') || code.includes('return')) {
          issues.push({
            line: lineNum,
            type: 'info',
            message: 'Pertimbang untuk menambah semicolon',
            suggestion: 'Tambah ; di hujung statement'
          })
          score -= 2
        }
      }
      
      // Check for long lines
      if (line.length > 100) {
        issues.push({
          line: lineNum,
          type: 'info',
          message: 'Baris terlalu panjang',
          suggestion: 'Pecahkan kepada beberapa baris untuk kebolehbacaan'
        })
        score -= 1
      }
    })

    // Generate suggestions
    if (code.includes('for')) {
      suggestions.push('Pertimbang untuk menggunakan forEach() atau map() untuk array')
    }
    
    if (!code.includes('//') && !code.includes('/*')) {
      suggestions.push('Tambah komen untuk meningkatkan kebolehbacaan kod')
      score -= 10
    }
    
    if (code.length < 50) {
      suggestions.push('Kod terlalu pendek untuk analisis lengkap')
    }

    // Determine complexity
    const complexity = code.includes('for') && code.includes('if') ? 'high' : 
                      code.includes('for') || code.includes('if') ? 'medium' : 'low'
    
    // Determine style
    const hasComments = code.includes('//') || code.includes('/*')
    const hasGoodNaming = !/\b[a-z]\b/.test(code) // Not just single letters
    const style = hasComments && hasGoodNaming ? 'good' : 
                  hasComments || hasGoodNaming ? 'fair' : 'poor'
    
    // Determine performance
    const performance = issues.filter(i => i.type === 'error').length === 0 ? 'good' : 'fair'

    return {
      score: Math.max(0, score),
      issues,
      suggestions,
      complexity,
      style,
      performance
    }
  }

  /**
   * Suggest code improvements
   */
  static suggestImprovements(code: string): Suggestion[] {
    const suggestions: Suggestion[] = []

    if (code.includes('var ')) {
      suggestions.push({
        id: 'var-to-let',
        title: 'Gunakan let/const daripada var',
        description: 'var mempunyai function scope, let/const mempunyai block scope yang lebih selamat',
        code: code.replace(/var /g, 'let '),
        priority: 'medium',
        category: 'best-practice'
      })
    }

    if (code.includes('console.log')) {
      suggestions.push({
        id: 'remove-console',
        title: 'Buang console.log untuk production',
        description: 'Console.log boleh memperlahankan aplikasi dan mendedahkan maklumat sensitif',
        priority: 'low',
        category: 'performance'
      })
    }

    if (!code.includes('//') && !code.includes('/*')) {
      suggestions.push({
        id: 'add-comments',
        title: 'Tambah komen untuk dokumentasi',
        description: 'Komen membantu memahami kod dan memudahkan maintenance',
        priority: 'medium',
        category: 'style'
      })
    }

    return suggestions
  }

  /**
   * Explain programming concepts
   */
  static explainConcept(concept: string): Explanation {
    const explanations: Record<string, Explanation> = {
      'algoritma': {
        concept: 'Algoritma',
        definition: 'Algoritma adalah satu set arahan yang teratur dan logik untuk menyelesaikan masalah atau melaksanakan tugas tertentu.',
        examples: [
          'Resipi masakan (langkah demi langkah)',
          'Cara menggunakan ATM',
          'Algoritma pencarian dalam Google'
        ],
        relatedTopics: ['pseudocode', 'flowchart', 'kompleksiti'],
        difficulty: 'beginner'
      },
      'loop': {
        concept: 'Gelung (Loop)',
        definition: 'Gelung adalah struktur kawalan yang membolehkan kod dijalankan berulang kali selagi syarat tertentu dipenuhi.',
        examples: [
          'for loop untuk mengulang 10 kali',
          'while loop untuk input pengguna',
          'forEach untuk array'
        ],
        relatedTopics: ['for', 'while', 'array', 'iteration'],
        difficulty: 'beginner'
      },
      'function': {
        concept: 'Fungsi (Function)',
        definition: 'Fungsi adalah blok kod yang boleh dipanggil dan digunakan semula untuk melaksanakan tugas tertentu.',
        examples: [
          'function calculateArea(width, height)',
          'Fungsi matematik seperti Math.sqrt()',
          'Event handlers dalam JavaScript'
        ],
        relatedTopics: ['parameter', 'return', 'scope'],
        difficulty: 'intermediate'
      }
    }

    return explanations[concept.toLowerCase()] || {
      concept: concept,
      definition: 'Konsep ini belum ada dalam pangkalan data. Sila rujuk buku teks atau sumber lain.',
      examples: [],
      relatedTopics: [],
      difficulty: 'beginner'
    }
  }

  /**
   * Generate practice questions
   */
  static generatePracticeQuestions(topic: string): Question[] {
    const questionSets: Record<string, Question[]> = {
      'algoritma': [
        {
          id: 'q1',
          question: 'Apakah ciri-ciri utama algoritma yang baik?',
          type: 'multiple-choice',
          options: [
            'Jelas, terhingga, dan berkesan',
            'Panjang dan kompleks',
            'Hanya untuk komputer',
            'Tidak perlu input'
          ],
          correctAnswer: 'Jelas, terhingga, dan berkesan',
          explanation: 'Algoritma yang baik mestilah jelas (unambiguous), terhingga (finite), dan berkesan (effective).',
          difficulty: 'easy'
        },
        {
          id: 'q2',
          question: 'Tulis pseudocode untuk mencari nombor terbesar dalam array [5, 2, 8, 1, 9]',
          type: 'coding',
          correctAnswer: 'largest = array[0]; for i = 1 to length-1; if array[i] > largest then largest = array[i]; return largest',
          explanation: 'Kita perlu bandingkan setiap elemen dengan nilai terbesar semasa.',
          difficulty: 'medium'
        }
      ],
      'loop': [
        {
          id: 'q3',
          question: 'Berapakah output bagi kod: for(i=0; i<3; i++) { console.log(i); }',
          type: 'short-answer',
          correctAnswer: '0, 1, 2',
          explanation: 'Loop bermula dari 0, dan berhenti sebelum 3, jadi output adalah 0, 1, 2.',
          difficulty: 'easy'
        }
      ]
    }

    return questionSets[topic.toLowerCase()] || []
  }

  /**
   * Process natural language queries
   */
  static async processQuery(
    query: string, 
    currentCode?: string, 
    currentTopic?: string, 
    userLevel?: string
  ): Promise<{ content: string; metadata?: any }> {
    const lowercaseQuery = query.toLowerCase()

    // Code analysis queries
    if (lowercaseQuery.includes('analisis') || lowercaseQuery.includes('semak kod')) {
      if (currentCode) {
        return {
          content: '🔍 Berikut adalah analisis kod anda:',
          metadata: { codeAnalysis: this.analyzeCode(currentCode) }
        }
      } else {
        return { content: 'Sila masukkan kod terlebih dahulu untuk dianalisis.' }
      }
    }

    // Concept explanation queries
    if (lowercaseQuery.includes('apa itu') || lowercaseQuery.includes('terangkan')) {
      const concepts = ['algoritma', 'loop', 'function', 'array', 'variable']
      const foundConcept = concepts.find(concept => lowercaseQuery.includes(concept))
      
      if (foundConcept) {
        return {
          content: `📚 Mari saya terangkan konsep "${foundConcept}":`,
          metadata: { explanation: this.explainConcept(foundConcept) }
        }
      }
    }

    // Practice questions
    if (lowercaseQuery.includes('latihan') || lowercaseQuery.includes('soalan')) {
      return {
        content: '🎯 Berikut adalah soalan latihan untuk anda:',
        metadata: { questions: this.generatePracticeQuestions(currentTopic || 'algoritma') }
      }
    }

    // Code improvement
    if (lowercaseQuery.includes('baik') || lowercaseQuery.includes('improve')) {
      if (currentCode) {
        return {
          content: '💡 Berikut adalah cadangan untuk memperbaiki kod anda:',
          metadata: { suggestions: this.suggestImprovements(currentCode) }
        }
      }
    }

    // Default responses
    const responses = [
      'Saya faham soalan anda. Bolehkah anda berikan lebih detail?',
      'Itu soalan yang bagus! Mari kita pecahkan masalah ini langkah demi langkah.',
      'Saya boleh membantu dengan itu. Adakah anda mahu saya terangkan konsep asas terlebih dahulu?',
      'Bagus! Saya cadangkan kita mulakan dengan contoh mudah.'
    ]

    return { 
      content: responses[Math.floor(Math.random() * responses.length)] 
    }
  }
}
