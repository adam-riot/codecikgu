// Enhanced Mobile-Optimized Playground
// src/components/playground/MobilePlayground.tsx

import React, { useState, useEffect, useRef } from 'react'
import { 
  Play, 
  Pause, 
  Save, 
  Download, 
  Upload,
  Code,
  Terminal,
  File,
  Folder,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Settings,
  Eye,
  EyeOff,
  Copy,
  RotateCcw,
  Search,
  Menu,
  Maximize2,
  Minimize2
} from 'lucide-react'

export interface MobileTab {
  id: string
  name: string
  content: string
  language: string
  saved: boolean
}

export interface TouchGesture {
  type: 'swipe' | 'pinch' | 'tap' | 'long-press'
  direction?: 'left' | 'right' | 'up' | 'down'
  scale?: number
  position: { x: number; y: number }
}

export function MobilePlayground() {
  const [tabs, setTabs] = useState<MobileTab[]>([
    {
      id: '1',
      name: 'main.py',
      content: `# Welcome to CodeCikgu Mobile!
# Tap to edit, swipe to navigate

def hello_world():
    print("Hello from mobile coding!")
    return "Success"

# Try running this code
result = hello_world()
print(f"Result: {result}")`,
      language: 'python',
      saved: false
    }
  ])

  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [output, setOutput] = useState('')
  const [showFiles, setShowFiles] = useState(false)
  const [showKeyboard, setShowKeyboard] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [fontSize, setFontSize] = useState(14)
  const [showLineNumbers, setShowLineNumbers] = useState(true)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  const editorRef = useRef<HTMLTextAreaElement>(null)
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)

  // Touch gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return

    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchStartRef.current.x
    const deltaY = touch.clientY - touchStartRef.current.y
    const deltaTime = Date.now() - touchStartRef.current.time

    // Swipe detection
    const minSwipeDistance = 50
    const maxSwipeTime = 300

    if (deltaTime < maxSwipeTime && Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        // Swipe right - previous tab
        navigateTab('prev')
      } else {
        // Swipe left - next tab
        navigateTab('next')
      }
    }

    touchStartRef.current = null
  }

  const navigateTab = (direction: 'prev' | 'next') => {
    setActiveTabIndex(prev => {
      if (direction === 'prev') {
        return prev > 0 ? prev - 1 : tabs.length - 1
      } else {
        return prev < tabs.length - 1 ? prev + 1 : 0
      }
    })
  }

  const handleCodeChange = (value: string) => {
    setTabs(prev => prev.map((tab, index) => 
      index === activeTabIndex 
        ? { ...tab, content: value, saved: false }
        : tab
    ))
  }

  const runCode = async () => {
    setIsRunning(true)
    setOutput('Running code...\n')

    // Simulate code execution
    setTimeout(() => {
      const code = tabs[activeTabIndex].content
      const mockOutput = `>>> Executing ${tabs[activeTabIndex].name}
Hello from mobile coding!
Result: Success

>>> Execution completed successfully
Runtime: 0.045 seconds
Memory usage: 12.4 MB`

      setOutput(mockOutput)
      setIsRunning(false)
    }, 1500)
  }

  const saveFile = () => {
    setTabs(prev => prev.map((tab, index) => 
      index === activeTabIndex 
        ? { ...tab, saved: true }
        : tab
    ))
    
    // Show success feedback
    setTimeout(() => {
      alert('File saved successfully!')
    }, 100)
  }

  const createNewTab = () => {
    const newTab: MobileTab = {
      id: Date.now().toString(),
      name: `untitled-${tabs.length + 1}.py`,
      content: '# New file\nprint("Hello CodeCikgu!")\n',
      language: 'python',
      saved: false
    }
    setTabs(prev => [...prev, newTab])
    setActiveTabIndex(tabs.length)
  }

  const closeTab = (index: number) => {
    if (tabs.length === 1) return // Don't close last tab
    
    setTabs(prev => prev.filter((_, i) => i !== index))
    setActiveTabIndex(prev => Math.min(prev, tabs.length - 2))
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
  }

  const insertText = (text: string) => {
    if (editorRef.current) {
      const start = editorRef.current.selectionStart
      const end = editorRef.current.selectionEnd
      const currentContent = tabs[activeTabIndex].content
      
      const newContent = currentContent.substring(0, start) + 
                        text + 
                        currentContent.substring(end)
      
      handleCodeChange(newContent)
      
      // Set cursor position after insertion
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.selectionStart = editorRef.current.selectionEnd = start + text.length
          editorRef.current.focus()
        }
      }, 0)
    }
  }

  const QuickActions = () => (
    <div className="grid grid-cols-4 gap-2 p-2 bg-gray-800 border-t border-gray-700">
      <button 
        onClick={() => insertText('    ')} 
        className="p-2 bg-gray-700 rounded text-xs"
      >
        Tab
      </button>
      <button 
        onClick={() => insertText('(')} 
        className="p-2 bg-gray-700 rounded text-xs"
      >
        ( )
      </button>
      <button 
        onClick={() => insertText('[')} 
        className="p-2 bg-gray-700 rounded text-xs"
      >
        [ ]
      </button>
      <button 
        onClick={() => insertText('{')} 
        className="p-2 bg-gray-700 rounded text-xs"
      >
        {/* eslint-disable-next-line react/no-unescaped-entities */}
        { }
      </button>
      <button 
        onClick={() => insertText('"')} 
        className="p-2 bg-gray-700 rounded text-xs"
      >
        &quot; &quot;
      </button>
      <button 
        onClick={() => insertText("'")} 
        className="p-2 bg-gray-700 rounded text-xs"
      >
        &apos; &apos;
      </button>
      <button 
        onClick={() => insertText(':')} 
        className="p-2 bg-gray-700 rounded text-xs"
      >
        :
      </button>
      <button 
        onClick={() => insertText(';')} 
        className="p-2 bg-gray-700 rounded text-xs"
      >
        ;
      </button>
    </div>
  )

  return (
    <div className={`h-screen flex flex-col ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Code className="w-5 h-5 text-purple-400" />
          <span className="font-bold text-sm">CodeCikgu Mobile</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <button 
            onClick={toggleFullscreen}
            className="p-2 bg-gray-700 rounded-lg"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          
          <button 
            onClick={() => setShowFiles(!showFiles)}
            className="p-2 bg-gray-700 rounded-lg"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-gray-800 border-b border-gray-700 p-1">
        <div className="flex items-center space-x-1 overflow-x-auto">
          {tabs.map((tab, index) => (
            <div 
              key={tab.id}
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-xs whitespace-nowrap ${
                index === activeTabIndex 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-700 text-gray-300'
              }`}
              onClick={() => setActiveTabIndex(index)}
            >
              <File className="w-3 h-3" />
              <span>{tab.name}</span>
              {!tab.saved && <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>}
              {tabs.length > 1 && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    closeTab(index)
                  }}
                  className="ml-1 p-0.5 hover:bg-red-500 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
          
          <button 
            onClick={createNewTab}
            className="p-2 bg-gray-700 rounded-lg"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Code Editor */}
        <div 
          className="flex-1 relative"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Line Numbers */}
          {showLineNumbers && (
            <div className="absolute left-0 top-0 w-8 h-full bg-gray-800 border-r border-gray-700 z-10">
              {tabs[activeTabIndex].content.split('\n').map((_, index) => (
                <div 
                  key={index} 
                  className="text-xs text-gray-500 text-right pr-1"
                  style={{ lineHeight: '1.5rem' }}
                >
                  {index + 1}
                </div>
              ))}
            </div>
          )}
          
          {/* Editor */}
          <textarea
            ref={editorRef}
            value={tabs[activeTabIndex].content}
            onChange={(e) => handleCodeChange(e.target.value)}
            className={`w-full h-full p-3 ${showLineNumbers ? 'pl-10' : ''} font-mono resize-none focus:outline-none ${
              theme === 'dark' 
                ? 'bg-gray-900 text-white' 
                : 'bg-white text-gray-900'
            }`}
            style={{ fontSize: `${fontSize}px`, lineHeight: '1.5' }}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
          />
          
          {/* Gesture Indicator */}
          <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-black/50 rounded px-2 py-1">
            Swipe ← → untuk tukar tab
          </div>
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Control Panel */}
        <div className="bg-gray-800 border-t border-gray-700 p-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex space-x-2">
              <button 
                onClick={runCode}
                disabled={isRunning}
                className="flex items-center space-x-1 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg text-sm"
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Running...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Run</span>
                  </>
                )}
              </button>
              
              <button 
                onClick={saveFile}
                className="flex items-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
            </div>

            <div className="flex items-center space-x-1">
              <button 
                onClick={() => setFontSize(prev => Math.max(10, prev - 2))}
                className="p-2 bg-gray-700 rounded text-xs"
              >
                A-
              </button>
              <span className="text-xs px-2">{fontSize}px</span>
              <button 
                onClick={() => setFontSize(prev => Math.min(24, prev + 2))}
                className="p-2 bg-gray-700 rounded text-xs"
              >
                A+
              </button>
            </div>
          </div>

          {/* Output Terminal */}
          {output && (
            <div className="bg-black rounded-lg p-3 max-h-32 overflow-y-auto">
              <div className="flex items-center space-x-2 mb-1">
                <Terminal className="w-4 h-4 text-green-400" />
                <span className="text-xs text-green-400">Output</span>
              </div>
              <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                {output}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Files Sidebar (Overlay) */}
      {showFiles && (
        <div className="absolute inset-0 bg-black/50 z-50 flex">
          <div className="w-64 bg-gray-800 border-r border-gray-700 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">Files</h3>
              <button 
                onClick={() => setShowFiles(false)}
                className="p-1 hover:bg-gray-700 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-2">
              {tabs.map((tab, index) => (
                <div 
                  key={tab.id}
                  onClick={() => {
                    setActiveTabIndex(index)
                    setShowFiles(false)
                  }}
                  className={`flex items-center space-x-2 p-2 rounded cursor-pointer ${
                    index === activeTabIndex ? 'bg-purple-600' : 'hover:bg-gray-700'
                  }`}
                >
                  <File className="w-4 h-4" />
                  <span className="text-sm">{tab.name}</span>
                  {!tab.saved && <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>}
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-2">
              <h4 className="text-sm font-medium text-gray-400">Settings</h4>
              
              <label className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  checked={showLineNumbers}
                  onChange={(e) => setShowLineNumbers(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm">Line Numbers</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  checked={theme === 'dark'}
                  onChange={(e) => setTheme(e.target.checked ? 'dark' : 'light')}
                  className="w-4 h-4"
                />
                <span className="text-sm">Dark Theme</span>
              </label>
            </div>
          </div>
          
          {/* Backdrop */}
          <div 
            className="flex-1"
            onClick={() => setShowFiles(false)}
          ></div>
        </div>
      )}
    </div>
  )
}

export default MobilePlayground
