'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Info, Book, Lightbulb, Code2 } from 'lucide-react'

interface CodeExplanation {
  keyword: string
  title: string
  description: string
  example?: string
  category: 'syntax' | 'concept' | 'function' | 'operator'
  language?: string[]
}

// Database of code explanations
const codeExplanations: CodeExplanation[] = [
  // PHP
  {
    keyword: '<?php',
    title: 'PHP Opening Tag',
    description: 'Tag pembuka PHP yang memberitahu pelayan bahawa kod PHP bermula di sini.',
    example: '<?php\necho "Hello World!";',
    category: 'syntax',
    language: ['php']
  },
  {
    keyword: 'echo',
    title: 'Echo Statement',
    description: 'Fungsi PHP untuk memaparkan output ke pelayar web.',
    example: 'echo "Hello World!";\necho $variable;',
    category: 'function',
    language: ['php']
  },
  {
    keyword: '$',
    title: 'PHP Variable',
    description: 'Dalam PHP, semua pembolehubah mesti bermula dengan simbol $.',
    example: '$nama = "Ahmad";\n$umur = 25;',
    category: 'syntax',
    language: ['php']
  },
  // JavaScript
  {
    keyword: 'function',
    title: 'Function Declaration',
    description: 'Mendeklarasikan fungsi yang boleh dipanggil berulang kali.',
    example: 'function greet(name) {\n  return "Hello " + name;\n}',
    category: 'syntax',
    language: ['javascript', 'php']
  },
  {
    keyword: 'console.log',
    title: 'Console Output',
    description: 'Memaparkan output ke console pelayar untuk debugging.',
    example: 'console.log("Hello World!");\nconsole.log(variable);',
    category: 'function',
    language: ['javascript']
  },
  {
    keyword: 'let',
    title: 'Variable Declaration',
    description: 'Mendeklarasikan pembolehubah dengan skop blok dalam JavaScript.',
    example: 'let name = "Ahmad";\nlet age = 25;',
    category: 'syntax',
    language: ['javascript']
  },
  {
    keyword: 'const',
    title: 'Constant Declaration',
    description: 'Mendeklarasikan pemalar yang tidak boleh diubah.',
    example: 'const PI = 3.14159;\nconst API_URL = "https://api.com";',
    category: 'syntax',
    language: ['javascript']
  },
  // Python
  {
    keyword: 'def',
    title: 'Function Definition',
    description: 'Mendeklarasikan fungsi dalam Python.',
    example: 'def greet(name):\n    return f"Hello {name}"',
    category: 'syntax',
    language: ['python']
  },
  {
    keyword: 'print',
    title: 'Print Function',
    description: 'Memaparkan output ke konsol dalam Python.',
    example: 'print("Hello World!")\nprint(variable)',
    category: 'function',
    language: ['python']
  },
  // Common concepts
  {
    keyword: 'if',
    title: 'Conditional Statement',
    description: 'Pernyataan bersyarat untuk membuat keputusan dalam kod.',
    example: 'if (condition) {\n  // kod jika benar\n}',
    category: 'concept',
    language: ['javascript', 'php', 'python']
  },
  {
    keyword: 'for',
    title: 'For Loop',
    description: 'Gelung untuk mengulangi kod sebanyak bilangan tertentu.',
    example: 'for (let i = 0; i < 10; i++) {\n  console.log(i);\n}',
    category: 'concept',
    language: ['javascript', 'php', 'python']
  },
  {
    keyword: 'while',
    title: 'While Loop',
    description: 'Gelung yang berulang selagi syarat adalah benar.',
    example: 'while (condition) {\n  // kod berulang\n}',
    category: 'concept',
    language: ['javascript', 'php', 'python']
  }
]

interface TooltipProps {
  children: React.ReactNode
  explanation: CodeExplanation
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export function CodeTooltip({ children, explanation, position = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [actualPosition, setActualPosition] = useState(position)
  const triggerRef = useRef<HTMLSpanElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect()
      const tooltipRect = tooltipRef.current.getBoundingClientRect()
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      }

      // Determine best position based on available space
      let bestPosition = position
      
      if (position === 'top' && triggerRect.top < tooltipRect.height + 10) {
        bestPosition = 'bottom'
      } else if (position === 'bottom' && triggerRect.bottom + tooltipRect.height + 10 > viewport.height) {
        bestPosition = 'top'
      } else if (position === 'left' && triggerRect.left < tooltipRect.width + 10) {
        bestPosition = 'right'
      } else if (position === 'right' && triggerRect.right + tooltipRect.width + 10 > viewport.width) {
        bestPosition = 'left'
      }

      setActualPosition(bestPosition)
    }
  }, [isVisible, position])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'syntax': return <Code2 className="w-4 h-4" />
      case 'concept': return <Lightbulb className="w-4 h-4" />
      case 'function': return <Book className="w-4 h-4" />
      case 'operator': return <Info className="w-4 h-4" />
      default: return <Info className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'syntax': return 'text-blue-400 bg-blue-400/20'
      case 'concept': return 'text-yellow-400 bg-yellow-400/20'
      case 'function': return 'text-green-400 bg-green-400/20'
      case 'operator': return 'text-purple-400 bg-purple-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const getPositionClasses = () => {
    const base = 'absolute z-50'
    switch (actualPosition) {
      case 'top': return `${base} bottom-full left-1/2 transform -translate-x-1/2 mb-2`
      case 'bottom': return `${base} top-full left-1/2 transform -translate-x-1/2 mt-2`
      case 'left': return `${base} right-full top-1/2 transform -translate-y-1/2 mr-2`
      case 'right': return `${base} left-full top-1/2 transform -translate-y-1/2 ml-2`
      default: return `${base} bottom-full left-1/2 transform -translate-x-1/2 mb-2`
    }
  }

  return (
    <span 
      ref={triggerRef}
      className="relative inline-block cursor-help"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      
      {isVisible && (
        <div 
          ref={tooltipRef}
          className={getPositionClasses()}
        >
          <div className="bg-gray-900 border border-gray-600 rounded-lg p-4 shadow-xl max-w-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-white text-sm">{explanation.title}</h4>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getCategoryColor(explanation.category)}`}>
                {getCategoryIcon(explanation.category)}
                <span className="ml-1 capitalize">{explanation.category}</span>
              </span>
            </div>

            {/* Description */}
            <p className="text-gray-300 text-sm mb-3 leading-relaxed">
              {explanation.description}
            </p>

            {/* Example */}
            {explanation.example && (
              <div className="bg-black/50 rounded-md p-3 border border-gray-700">
                <div className="text-xs text-gray-400 mb-2">Contoh:</div>
                <pre className="text-xs text-green-400 overflow-x-auto">
                  <code>{explanation.example}</code>
                </pre>
              </div>
            )}

            {/* Languages */}
            {explanation.language && (
              <div className="mt-3 flex flex-wrap gap-1">
                {explanation.language.map(lang => (
                  <span 
                    key={lang}
                    className="inline-block px-2 py-1 bg-electric-blue/20 text-electric-blue text-xs rounded-full"
                  >
                    {lang.toUpperCase()}
                  </span>
                ))}
              </div>
            )}

            {/* Arrow */}
            <div className={`absolute w-3 h-3 bg-gray-900 border-gray-600 transform rotate-45 ${
              actualPosition === 'top' ? 'top-full left-1/2 -translate-x-1/2 -mt-1.5 border-b border-r' :
              actualPosition === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 -mb-1.5 border-t border-l' :
              actualPosition === 'left' ? 'left-full top-1/2 -translate-y-1/2 -ml-1.5 border-t border-r' :
              'right-full top-1/2 -translate-y-1/2 -mr-1.5 border-b border-l'
            }`} />
          </div>
        </div>
      )}
    </span>
  )
}

// Enhanced code processor that adds tooltips
export function ProcessCodeWithTooltips({ 
  code, 
  language = 'javascript' 
}: { 
  code: string
  language?: string 
}) {
  const [processedCode, setProcessedCode] = useState<React.ReactNode[]>([])

  useEffect(() => {
    const lines = code.split('\n')
    const processed: React.ReactNode[] = []

    lines.forEach((line, lineIndex) => {
      const lineElements: React.ReactNode[] = []
      let currentIndex = 0

      // Find matches for explanations
      const matches: Array<{ start: number; end: number; explanation: CodeExplanation }> = []
      
      codeExplanations.forEach(explanation => {
        if (!explanation.language || explanation.language.includes(language)) {
          const regex = new RegExp(explanation.keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
          let match
          
          while ((match = regex.exec(line)) !== null) {
            matches.push({
              start: match.index,
              end: match.index + match[0].length,
              explanation
            })
          }
        }
      })

      // Sort matches by position
      matches.sort((a, b) => a.start - b.start)

      // Remove overlapping matches
      const filteredMatches = matches.filter((match, index) => {
        if (index === 0) return true
        const prevMatch = matches[index - 1]
        return match.start >= prevMatch.end
      })

      // Process line with tooltips
      filteredMatches.forEach((match, matchIndex) => {
        // Add text before match
        if (match.start > currentIndex) {
          lineElements.push(
            <span key={`${lineIndex}-${matchIndex}-before`}>
              {line.slice(currentIndex, match.start)}
            </span>
          )
        }

        // Add tooltip for match
        lineElements.push(
          <CodeTooltip 
            key={`${lineIndex}-${matchIndex}-tooltip`}
            explanation={match.explanation}
          >
            <span className="bg-electric-blue/20 rounded px-1 border-b border-electric-blue/50">
              {line.slice(match.start, match.end)}
            </span>
          </CodeTooltip>
        )

        currentIndex = match.end
      })

      // Add remaining text
      if (currentIndex < line.length) {
        lineElements.push(
          <span key={`${lineIndex}-end`}>
            {line.slice(currentIndex)}
          </span>
        )
      }

      // Add line break except for last line
      processed.push(
        <div key={lineIndex} className="leading-relaxed">
          {lineElements.length > 0 ? lineElements : line}
        </div>
      )
    })

    setProcessedCode(processed)
  }, [code, language])

  return (
    <div className="font-mono text-sm">
      {processedCode}
    </div>
  )
}

// Toggle for enabling/disabling tooltips
export function TooltipToggle({ 
  enabled, 
  onToggle 
}: { 
  enabled: boolean
  onToggle: (enabled: boolean) => void 
}) {
  return (
    <button
      onClick={() => onToggle(!enabled)}
      className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all ${
        enabled 
          ? 'bg-electric-blue/20 border-electric-blue/50 text-electric-blue' 
          : 'bg-gray-700/50 border-gray-600 text-gray-400 hover:text-white'
      }`}
      title={enabled ? 'Matikan tooltip kod' : 'Hidupkan tooltip kod'}
    >
      <Info className="w-4 h-4" />
      <span className="text-sm">{enabled ? 'Tooltip ON' : 'Tooltip OFF'}</span>
    </button>
  )
}
