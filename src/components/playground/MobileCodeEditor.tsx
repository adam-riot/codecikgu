import React, { useState, useRef, useEffect } from 'react'
import { 
  Play, 
  Save, 
  Download, 
  Share2, 
  Settings, 
  Maximize,
  Smartphone,
  Tablet
} from 'lucide-react'

interface MobileCodeEditorProps {
  initialCode?: string
  language: string
  onCodeChange: (code: string) => void
  onExecute: () => void
}

export function MobileCodeEditor({ 
  initialCode = '', 
  language, 
  onCodeChange, 
  onExecute 
}: MobileCodeEditorProps) {
  const [code, setCode] = useState(initialCode)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  // Detect mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  const isTablet = /iPad|Android.*Tablet/i.test(navigator.userAgent)

  // Handle virtual keyboard on mobile
  useEffect(() => {
    if (!isMobile) return

    const handleResize = () => {
      const viewportHeight = window.visualViewport?.height || window.innerHeight
      const windowHeight = window.innerHeight
      const keyboardHeight = windowHeight - viewportHeight
      
      setKeyboardHeight(keyboardHeight)
    }

    window.visualViewport?.addEventListener('resize', handleResize)
    return () => window.visualViewport?.removeEventListener('resize', handleResize)
  }, [isMobile])

  // Auto-insert common code patterns
  const insertSnippet = (snippet: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newCode = code.substring(0, start) + snippet + code.substring(end)
    
    setCode(newCode)
    onCodeChange(newCode)

    // Set cursor position after snippet
    setTimeout(() => {
      textarea.setSelectionRange(start + snippet.length, start + snippet.length)
      textarea.focus()
    }, 0)
  }

  // Common snippets for mobile quick access
  const snippets = {
    python: [
      { label: 'print()', code: 'print()' },
      { label: 'def', code: 'def function_name():\n    pass' },
      { label: 'if', code: 'if condition:\n    pass' },
      { label: 'for', code: 'for i in range():\n    pass' },
      { label: 'while', code: 'while condition:\n    pass' },
    ],
    javascript: [
      { label: 'console.log', code: 'console.log()' },
      { label: 'function', code: 'function functionName() {\n    \n}' },
      { label: 'if', code: 'if (condition) {\n    \n}' },
      { label: 'for', code: 'for (let i = 0; i < length; i++) {\n    \n}' },
      { label: 'array', code: 'const array = []' },
    ],
    html: [
      { label: '<div>', code: '<div></div>' },
      { label: '<p>', code: '<p></p>' },
      { label: '<a>', code: '<a href=""></a>' },
      { label: '<img>', code: '<img src="" alt="">' },
      { label: '<button>', code: '<button></button>' },
    ]
  }

  const currentSnippets = snippets[language as keyof typeof snippets] || []

  return (
    <div className={`mobile-code-editor ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* Mobile Toolbar */}
      <div className="flex items-center justify-between p-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          {isMobile && <Smartphone className="w-4 h-4 text-blue-400" />}
          {isTablet && <Tablet className="w-4 h-4 text-green-400" />}
          <span className="text-xs text-gray-300">{language.toUpperCase()}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            <Maximize className="w-4 h-4 text-gray-300" />
          </button>
          
          <button
            onClick={onExecute}
            className="px-3 py-1.5 bg-green-600 hover:bg-green-500 rounded flex items-center space-x-1 transition-colors"
          >
            <Play className="w-4 h-4" />
            <span className="text-xs font-medium">Run</span>
          </button>
        </div>
      </div>

      {/* Code Input Area */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => {
            setCode(e.target.value)
            onCodeChange(e.target.value)
          }}
          className={`w-full bg-gray-900 text-gray-100 font-mono text-sm p-4 border-none outline-none resize-none ${
            isMobile ? 'min-h-[300px]' : 'min-h-[400px]'
          }`}
          style={{
            paddingBottom: keyboardHeight > 0 ? `${keyboardHeight + 20}px` : '1rem'
          }}
          placeholder={`Write your ${language} code here...`}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />

        {/* Line numbers (simplified for mobile) */}
        <div className="absolute left-2 top-4 text-xs text-gray-500 font-mono pointer-events-none select-none">
          {code.split('\n').map((_, index) => (
            <div key={index} className="leading-5">
              {index + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Quick Actions */}
      {isMobile && (
        <div className="bg-gray-800 border-t border-gray-700 p-2">
          {/* Common Snippets */}
          <div className="flex flex-wrap gap-1 mb-2">
            {currentSnippets.map((snippet, index) => (
              <button
                key={index}
                onClick={() => insertSnippet(snippet.code)}
                className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-300 transition-colors"
              >
                {snippet.label}
              </button>
            ))}
          </div>

          {/* Special Characters for Mobile */}
          <div className="flex flex-wrap gap-1">
            {['()', '[]', '{}', '""', "''", ':', ';', '=', '+', '-'].map((char) => (
              <button
                key={char}
                onClick={() => insertSnippet(char)}
                className="px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded text-xs text-gray-200 transition-colors"
              >
                {char}
              </button>
            ))}
          </div>

          {/* Tab and Indentation */}
          <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-700">
            <button
              onClick={() => insertSnippet('    ')}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-xs text-white transition-colors"
            >
              Tab
            </button>
            
            <div className="flex space-x-2">
              <button className="p-1.5 rounded bg-gray-700 hover:bg-gray-600 transition-colors">
                <Save className="w-4 h-4 text-gray-300" />
              </button>
              <button className="p-1.5 rounded bg-gray-700 hover:bg-gray-600 transition-colors">
                <Share2 className="w-4 h-4 text-gray-300" />
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .mobile-code-editor.fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 50;
          background: #1f2937;
        }
        
        @media (max-width: 768px) {
          .mobile-code-editor textarea {
            font-size: 16px; /* Prevent zoom on iOS */
            line-height: 1.4;
          }
        }
      `}</style>
    </div>
  )
}
