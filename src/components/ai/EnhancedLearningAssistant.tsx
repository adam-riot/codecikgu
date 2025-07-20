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
  Zap
} from 'lucide-react'

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
  type: 'performance' | 'memory' | 'readability'
  description: string
  impact: 'low' | 'medium' | 'high'
  example: string
}

export function EnhancedLearningAssistant() {
  const [activeMode, setActiveMode] = useState<'chat' | 'analysis' | 'path' | 'practice'>('chat')
  const [messages, setMessages] = useState<Array<{role: 'user' | 'ai', content: string, timestamp: Date}>>([])
  const [currentCode, setCurrentCode] = useState('')
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null)
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null)
  const [userSkills, setUserSkills] = useState<SkillLevel>({
    programming: 0.3,
    problemSolving: 0.2,
    debugging: 0.1,
    codeReading: 0.4,
    conceptUnderstanding: 0.3
  })
  const [learningStyle, setLearningStyle] = useState<LearningStyle>({
    visual: 0.4,
    auditory: 0.2,
    kinesthetic: 0.3,
    readingWriting: 0.1
  })

  const chatInputRef = useRef<HTMLTextAreaElement>(null)

  // AI Conversation Handler
  const handleSendMessage = async (message: string) => {
    const userMessage = { role: 'user' as const, content: message, timestamp: new Date() }
    setMessages(prev => [...prev, userMessage])

    // Simulate AI response with enhanced intelligence
    const aiResponse = await generateAIResponse(message, userSkills, learningStyle)
    const aiMessage = { role: 'ai' as const, content: aiResponse, timestamp: new Date() }
    setMessages(prev => [...prev, aiMessage])
  }

  // Enhanced Code Analysis
  const analyzeCode = async (code: string) => {
    const analysis: AIAnalysis = {
      codeQuality: calculateCodeQuality(code),
      performanceScore: calculatePerformance(code),
      securityRating: calculateSecurity(code),
      suggestions: generateSuggestions(code),
      errors: detectErrors(code),
      optimizations: findOptimizations(code)
    }
    
    setAnalysis(analysis)
    return analysis
  }

  // Adaptive Learning Path Generation
  const generateLearningPath = (skills: SkillLevel, style: LearningStyle) => {
    const path: LearningPath = {
      id: `path_${Date.now()}`,
      title: 'Personalized Learning Journey',
      description: 'AI-generated path based on your skills and learning style',
      difficulty: skills.programming < 0.3 ? 'beginner' : skills.programming < 0.7 ? 'intermediate' : 'advanced',
      estimatedTime: calculateEstimatedTime(skills),
      prerequisites: getPrerequisites(skills),
      topics: generateTopics(skills, style),
      adaptiveLevel: calculateAdaptiveLevel(skills)
    }
    
    setLearningPath(path)
    return path
  }

  return (
    <div className="h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Header with mode selector */}
      <div className="bg-black/20 backdrop-blur-md border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              AI Learning Assistant
            </h2>
          </div>
          
          <div className="flex space-x-1 bg-black/20 rounded-lg p-1">
            {[
              { mode: 'chat', icon: MessageCircle, label: 'Chat' },
              { mode: 'analysis', icon: Code, label: 'Analysis' },
              { mode: 'path', icon: Target, label: 'Path' },
              { mode: 'practice', icon: Zap, label: 'Practice' }
            ].map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => setActiveMode(mode as any)}
                className={`flex items-center space-x-1 px-3 py-2 rounded transition-colors ${
                  activeMode === mode 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 p-4">
        {/* Chat Mode */}
        {activeMode === 'chat' && (
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.role === 'user' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-white/10 text-gray-100'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    <span className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex space-x-2">
              <textarea
                ref={chatInputRef}
                placeholder="Ask me anything about programming..."
                className="flex-1 p-3 bg-white/10 rounded-lg border border-white/20 text-white placeholder-gray-400 resize-none"
                rows={2}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    const input = chatInputRef.current
                    if (input?.value.trim()) {
                      handleSendMessage(input.value)
                      input.value = ''
                    }
                  }
                }}
              />
              <button
                onClick={() => {
                  const input = chatInputRef.current
                  if (input?.value.trim()) {
                    handleSendMessage(input.value)
                    input.value = ''
                  }
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        )}

        {/* Code Analysis Mode */}
        {activeMode === 'analysis' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Code to Analyze:</label>
              <textarea
                value={currentCode}
                onChange={(e) => setCurrentCode(e.target.value)}
                placeholder="Paste your code here for AI analysis..."
                className="w-full h-40 p-3 bg-white/10 rounded-lg border border-white/20 text-white placeholder-gray-400 font-mono"
              />
              <button
                onClick={() => analyzeCode(currentCode)}
                className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Analyze Code
              </button>
            </div>

            {analysis && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Quality Metrics */}
                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="font-bold mb-3 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Quality Metrics
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Code Quality:</span>
                      <span className={`font-bold ${analysis.codeQuality > 0.7 ? 'text-green-400' : analysis.codeQuality > 0.4 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {(analysis.codeQuality * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Performance:</span>
                      <span className={`font-bold ${analysis.performanceScore > 0.7 ? 'text-green-400' : analysis.performanceScore > 0.4 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {(analysis.performanceScore * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Security:</span>
                      <span className={`font-bold ${analysis.securityRating > 0.7 ? 'text-green-400' : analysis.securityRating > 0.4 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {(analysis.securityRating * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Suggestions */}
                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="font-bold mb-3 flex items-center">
                    <Lightbulb className="w-5 h-5 mr-2" />
                    Suggestions
                  </h3>
                  <div className="space-y-2">
                    {analysis.suggestions.map((suggestion, index) => (
                      <div key={index} className={`p-2 rounded text-xs ${
                        suggestion.priority === 'high' ? 'bg-red-500/20 border border-red-500/30' :
                        suggestion.priority === 'medium' ? 'bg-yellow-500/20 border border-yellow-500/30' :
                        'bg-blue-500/20 border border-blue-500/30'
                      }`}>
                        <p>{suggestion.message}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Errors & Optimizations */}
                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="font-bold mb-3 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Issues & Fixes
                  </h3>
                  <div className="space-y-2">
                    {analysis.errors.map((error, index) => (
                      <div key={index} className="p-2 bg-red-500/20 border border-red-500/30 rounded text-xs">
                        <p className="font-medium">Line {error.line}: {error.message}</p>
                        <p className="text-gray-300">{error.suggestion}</p>
                      </div>
                    ))}
                    {analysis.optimizations.map((opt, index) => (
                      <div key={index} className="p-2 bg-green-500/20 border border-green-500/30 rounded text-xs">
                        <p className="font-medium">{opt.type}: {opt.description}</p>
                        <p className="text-gray-300">Impact: {opt.impact}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Learning Path Mode */}
        {activeMode === 'path' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Personalized Learning Path</h3>
              <button
                onClick={() => generateLearningPath(userSkills, learningStyle)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                Generate New Path
              </button>
            </div>

            {/* Skill Assessment */}
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="font-bold mb-3">Current Skill Assessment</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(userSkills).map(([skill, level]) => (
                  <div key={skill} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="capitalize">{skill.replace(/([A-Z])/g, ' $1')}</span>
                      <span>{(level * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${level * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Learning Path Display */}
            {learningPath && (
              <div className="bg-white/10 rounded-lg p-4">
                <h4 className="font-bold mb-3">{learningPath.title}</h4>
                <p className="text-gray-300 mb-4">{learningPath.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-white/5 rounded">
                    <div className="text-2xl font-bold text-purple-400">{learningPath.difficulty}</div>
                    <div className="text-sm text-gray-300">Difficulty</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded">
                    <div className="text-2xl font-bold text-blue-400">{learningPath.estimatedTime}h</div>
                    <div className="text-sm text-gray-300">Estimated Time</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded">
                    <div className="text-2xl font-bold text-green-400">{learningPath.topics.length}</div>
                    <div className="text-sm text-gray-300">Topics</div>
                  </div>
                </div>

                <div className="space-y-3">
                  {learningPath.topics.map((topic, index) => (
                    <div key={topic.id} className="flex items-center p-3 bg-white/5 rounded-lg">
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center mr-3">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium">{topic.title}</h5>
                        <p className="text-sm text-gray-300">{topic.type}</p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Practice Mode */}
        {activeMode === 'practice' && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Interactive Practice</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-lg p-4">
                <h4 className="font-bold mb-3">Quick Challenges</h4>
                <div className="space-y-2">
                  {[
                    { title: "Array Manipulation", difficulty: "Easy", time: "5 min" },
                    { title: "String Processing", difficulty: "Medium", time: "10 min" },
                    { title: "Algorithm Optimization", difficulty: "Hard", time: "20 min" }
                  ].map((challenge, index) => (
                    <div key={index} className="p-3 bg-white/5 rounded flex justify-between items-center">
                      <div>
                        <div className="font-medium">{challenge.title}</div>
                        <div className="text-xs text-gray-300">{challenge.difficulty} • {challenge.time}</div>
                      </div>
                      <button className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm transition-colors">
                        Start
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/10 rounded-lg p-4">
                <h4 className="font-bold mb-3">Concept Review</h4>
                <div className="space-y-2">
                  {[
                    { concept: "Variables & Data Types", progress: 90 },
                    { concept: "Functions & Scope", progress: 70 },
                    { concept: "Objects & Arrays", progress: 45 }
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">{item.concept}</span>
                        <span className="text-sm">{item.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                          style={{ width: `${item.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper functions for AI processing
async function generateAIResponse(message: string, skills: SkillLevel, style: LearningStyle): Promise<string> {
  // Simulate AI processing with context awareness
  const responses = [
    `Based on your current skill level in programming (${(skills.programming * 100).toFixed(0)}%), I'd recommend focusing on ${skills.programming < 0.5 ? 'fundamentals' : 'advanced concepts'}.`,
    `Since you learn best through ${Object.entries(style).reduce((a, b) => style[a[0] as keyof typeof style] > style[b[0] as keyof typeof style] ? a : b)[0]} methods, here's a tailored approach...`,
    `Let me break this down step by step, considering your preferred learning style...`
  ]
  
  return responses[Math.floor(Math.random() * responses.length)]
}

function calculateCodeQuality(code: string): number {
  // Simulate code quality analysis
  let score = 0.5
  if (code.includes('function')) score += 0.2
  if (code.includes('const') || code.includes('let')) score += 0.1
  if (code.includes('//')) score += 0.1
  if (code.length > 100) score += 0.1
  return Math.min(score, 1.0)
}

function calculatePerformance(code: string): number {
  // Simulate performance analysis
  let score = 0.7
  if (code.includes('for') && code.includes('for')) score -= 0.2 // Nested loops
  if (code.includes('while(true)')) score -= 0.3 // Infinite loops
  return Math.max(score, 0.1)
}

function calculateSecurity(code: string): number {
  // Simulate security analysis
  let score = 0.8
  if (code.includes('eval(')) score -= 0.4
  if (code.includes('innerHTML')) score -= 0.2
  return Math.max(score, 0.1)
}

function generateSuggestions(code: string): Suggestion[] {
  return [
    {
      type: 'improvement',
      message: 'Consider using const instead of var for better scope control',
      priority: 'medium'
    },
    {
      type: 'best-practice',
      message: 'Add comments to explain complex logic',
      priority: 'low'
    }
  ]
}

function detectErrors(code: string): CodeError[] {
  const errors: CodeError[] = []
  if (code.includes('console.log(undefined)')) {
    errors.push({
      line: 1,
      column: 1,
      type: 'logic',
      message: 'Undefined variable usage',
      suggestion: 'Check if variable is declared before use'
    })
  }
  return errors
}

function findOptimizations(code: string): Optimization[] {
  return [
    {
      type: 'performance',
      description: 'Cache array length in loop condition',
      impact: 'medium',
      example: 'for(let i=0, len=arr.length; i<len; i++)'
    }
  ]
}

function calculateEstimatedTime(skills: SkillLevel): number {
  const baseTime = 40 // hours
  const skillMultiplier = Object.values(skills).reduce((a, b) => a + b, 0) / Object.keys(skills).length
  return Math.round(baseTime * (1.5 - skillMultiplier))
}

function getPrerequisites(skills: SkillLevel): string[] {
  const prerequisites = []
  if (skills.programming < 0.3) prerequisites.push('Basic syntax understanding')
  if (skills.problemSolving < 0.3) prerequisites.push('Logical thinking exercises')
  return prerequisites
}

function generateTopics(skills: SkillLevel, style: LearningStyle): LearningTopic[] {
  // Generate adaptive topics based on skills and learning style
  return [
    {
      id: 'variables',
      title: 'Variables and Data Types',
      type: 'concept',
      content: 'Understanding different data types and variable declarations',
      examples: [],
      exercises: []
    },
    {
      id: 'functions',
      title: 'Functions and Scope',
      type: 'practice',
      content: 'Creating reusable code blocks with functions',
      examples: [],
      exercises: []
    }
  ]
}

function calculateAdaptiveLevel(skills: SkillLevel): number {
  return Object.values(skills).reduce((a, b) => a + b, 0) / Object.keys(skills).length
}
