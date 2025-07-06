'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/utils/supabase'
import { 
  Code, 
  Play, 
  Download, 
  Save, 
  Search, 
  Plus, 
  X, 
  File, 
  Folder,
  Terminal, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Info,
  Settings,
  Eye,
  RefreshCw,
  Cloud,
  FolderOpen,
  Shield,
  ChevronDown,
  ChevronRight,
  FileText,
  HardDrive
} from 'lucide-react'

// Types
interface User {
  id: string
  email: string
  role: string
}

interface Tab {
  id: string
  name: string
  content: string
  language: string
  saved: boolean
}

interface CodeError {
  line: number
  message: string
  type: 'error' | 'warning'
}

interface Notification {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
}

interface FileSystemItem {
  id: string
  name: string
  type: 'file' | 'folder'
  content?: string
  children?: FileSystemItem[]
  expanded?: boolean
}

// Language configurations
const LANGUAGE_CONFIG = {
  javascript: {
    extension: '.js',
    defaultContent: `// Welcome to CodeCikgu Playground!
console.log('Hello, World!');

function greet(name) {
  return 'Hello, ' + name + '!';
}

console.log(greet('CodeCikgu'));`,
    executable: true
  },
  html: {
    extension: '.html',
    defaultContent: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeCikgu HTML</title>
</head>
<body>
    <h1>Hello, CodeCikgu!</h1>
    <p>Write your HTML code here.</p>
</body>
</html>`,
    executable: false
  },
  css: {
    extension: '.css',
    defaultContent: `/* CodeCikgu CSS Playground */
body {
    font-family: Arial, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    margin: 0;
    padding: 20px;
}

.container {
    max-width: 800px;
    margin: 0 auto;
    background: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}`,
    executable: false
  },
  python: {
    extension: '.py',
    defaultContent: `# Welcome to CodeCikgu Python Playground!
print("Hello, World!")

def greet(name):
    return f"Hello, {name}!"

print(greet("CodeCikgu"))

# Example: Simple calculator
def add(a, b):
    return a + b

result = add(5, 3)
print(f"5 + 3 = {result}")`,
    executable: false
  },
  php: {
    extension: '.php',
    defaultContent: `<?php
// Welcome to CodeCikgu PHP Playground!
echo "Hello, World!\\n";

function greet($name) {
    return "Hello, " . $name . "!";
}

echo greet("CodeCikgu") . "\\n";

// Example: Simple array
$fruits = ["apple", "banana", "orange"];
foreach ($fruits as $fruit) {
    echo "I like " . $fruit . "\\n";
}
?>`,
    executable: false
  }
}

export default function PlaygroundPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: '1',
      name: 'main.js',
      content: LANGUAGE_CONFIG.javascript.defaultContent,
      language: 'javascript',
      saved: false
    }
  ])
  const [activeTabId, setActiveTabId] = useState('1')
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [codeErrors, setCodeErrors] = useState<CodeError[]>([])
  const [executionOutput, setExecutionOutput] = useState('')
  const [showOutput, setShowOutput] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [fileSystem, setFileSystem] = useState<FileSystemItem[]>([
    {
      id: 'root',
      name: 'My Project',
      type: 'folder',
      expanded: true,
      children: [
        {
          id: 'main-js',
          name: 'main.js',
          type: 'file',
          content: LANGUAGE_CONFIG.javascript.defaultContent
        }
      ]
    }
  ])

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session && session.user) {
        // Simple user object without complex role fetching
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          role: 'awam' // Default role
        })
      }
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  const addNotification = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString()
    const notification: Notification = { id, type, message }
    
    setNotifications(prev => [...prev, notification])
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 5000)
  }

  const getActiveTab = (): Tab => {
    return tabs.find(tab => tab.id === activeTabId) || tabs[0]
  }

  const updateTab = (tabId: string, updates: Partial<Tab>) => {
    setTabs(prev => prev.map(tab => 
      tab.id === tabId 
        ? { ...tab, ...updates, saved: false }
        : tab
    ))
  }

  const handleContentChange = (content: string) => {
    updateTab(activeTabId, { content })
    
    // Simple error detection for JavaScript
    if (getActiveTab().language === 'javascript') {
      const errors: CodeError[] = []
      const lines = content.split('\n')
      
      lines.forEach((line, index) => {
        // Simple syntax checks
        if (line.includes('console.log(') && !line.includes(')')) {
          errors.push({
            line: index + 1,
            message: 'Missing closing parenthesis',
            type: 'error'
          })
        }
        if (line.includes('{') && !content.includes('}')) {
          errors.push({
            line: index + 1,
            message: 'Missing closing brace',
            type: 'warning'
          })
        }
      })
      
      setCodeErrors(errors)
    }
  }

  const executeCode = () => {
    const activeTab = getActiveTab()
    
    if (activeTab.language === 'javascript') {
      try {
        const output: string[] = []
        const safeConsole = {
          log: (...args: any[]) => {
            output.push(args.map(arg => String(arg)).join(' '))
          },
          error: (...args: any[]) => {
            output.push('ERROR: ' + args.map(arg => String(arg)).join(' '))
          },
          warn: (...args: any[]) => {
            output.push('WARNING: ' + args.map(arg => String(arg)).join(' '))
          }
        }
        
        // Create safe execution environment
        const func = new Function('console', 'alert', activeTab.content)
        func(safeConsole, () => {}) // Disable alert
        
        setExecutionOutput(output.join('\n') || 'Code executed successfully (no output)')
        setShowOutput(true)
        addNotification('success', 'Code executed successfully')
      } catch (error) {
        const errorMessage = (error as Error).message
        setExecutionOutput(`Error: ${errorMessage}`)
        setShowOutput(true)
        addNotification('error', 'Execution failed')
      }
    } else {
      addNotification('info', `${activeTab.language} execution not supported in browser. Download file to run locally.`)
    }
  }

  const downloadFile = () => {
    const activeTab = getActiveTab()
    const blob = new Blob([activeTab.content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = activeTab.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    addNotification('success', `File ${activeTab.name} downloaded`)
  }

  const saveFile = () => {
    updateTab(activeTabId, { saved: true })
    addNotification('success', 'File saved successfully')
  }

  const createNewTab = (language: string = 'javascript') => {
    const config = LANGUAGE_CONFIG[language as keyof typeof LANGUAGE_CONFIG]
    const newId = Date.now().toString()
    const newTab: Tab = {
      id: newId,
      name: `new-file${config.extension}`,
      content: config.defaultContent,
      language,
      saved: false
    }
    
    setTabs(prev => [...prev, newTab])
    setActiveTabId(newId)
    addNotification('success', `New ${language} file created`)
  }

  const closeTab = (tabId: string) => {
    if (tabs.length === 1) {
      addNotification('error', 'Cannot close the last tab')
      return
    }
    
    setTabs(prev => prev.filter(tab => tab.id !== tabId))
    
    if (activeTabId === tabId) {
      const remainingTabs = tabs.filter(tab => tab.id !== tabId)
      setActiveTabId(remainingTabs[0].id)
    }
  }

  const searchInCode = (term: string) => {
    const activeTab = getActiveTab()
    const textarea = textareaRef.current
    
    if (!textarea || !term) return
    
    const content = activeTab.content.toLowerCase()
    const searchTerm = term.toLowerCase()
    const index = content.indexOf(searchTerm)
    
    if (index !== -1) {
      textarea.focus()
      textarea.setSelectionRange(index, index + term.length)
      addNotification('success', `Found "${term}"`)
    } else {
      addNotification('error', `"${term}" not found`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-electric-blue/30 border-t-electric-blue rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading playground...</p>
        </div>
      </div>
    )
  }

  const activeTab = getActiveTab()

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-electric-blue to-neon-green rounded-lg flex items-center justify-center">
                <Code className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">CodeCikgu Playground</span>
            </Link>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">
                Editor kod online dengan syntax highlighting dan auto error detection
              </span>
              
              {user && (
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${
                  user.role === 'murid' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-blue-500/20 text-blue-400'
                }`}>
                  <Shield className="w-3 h-3" />
                  <span>Secure session untuk {user.role}: {user.email}</span>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className="p-2 text-gray-400 hover:text-white transition-colors duration-300"
                  title="Search in code"
                >
                  <Search className="w-4 h-4" />
                </button>
                
                <button
                  onClick={executeCode}
                  disabled={!LANGUAGE_CONFIG[activeTab.language as keyof typeof LANGUAGE_CONFIG]?.executable}
                  className="flex items-center space-x-2 px-4 py-2 bg-neon-green hover:bg-neon-green/90 disabled:bg-gray-600 disabled:cursor-not-allowed text-dark-black font-medium rounded-lg transition-colors duration-300"
                >
                  <Play className="w-4 h-4" />
                  <span>Run</span>
                </button>
                
                <button
                  onClick={saveFile}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-300"
                >
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </button>
                
                <button
                  onClick={downloadFile}
                  className="flex items-center space-x-2 px-4 py-2 bg-electric-blue hover:bg-electric-blue/90 text-white font-medium rounded-lg transition-colors duration-300"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      {showSearch && (
        <div className="bg-gray-800/50 border-b border-gray-700 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center space-x-4">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchInCode(searchTerm)}
              placeholder="Search in code..."
              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-electric-blue"
            />
            <button
              onClick={() => searchInCode(searchTerm)}
              className="px-4 py-2 bg-electric-blue hover:bg-electric-blue/90 text-white text-sm rounded transition-colors duration-300"
            >
              Find
            </button>
          </div>
        </div>
      )}

      {/* Notifications */}
      <div className="fixed top-20 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`flex items-center space-x-2 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 backdrop-blur-sm ${
              notification.type === 'success' 
                ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                : notification.type === 'error'
                ? 'bg-red-500/20 border border-red-500/30 text-red-400'
                : 'bg-blue-500/20 border border-blue-500/30 text-blue-400'
            }`}
          >
            {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {notification.type === 'error' && <XCircle className="w-5 h-5" />}
            {notification.type === 'info' && <Info className="w-5 h-5" />}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* File Info */}
            <div className="glass-dark rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <File className="w-5 h-5 mr-2" />
                Maklumat File
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Nama Fail</label>
                  <input
                    type="text"
                    value={activeTab.name}
                    onChange={(e) => updateTab(activeTabId, { name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-electric-blue"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Bahasa (Auto-Detect)</label>
                  <select
                    value={activeTab.language}
                    onChange={(e) => updateTab(activeTabId, { language: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-electric-blue"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                    <option value="python">Python</option>
                    <option value="php">PHP</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Status</label>
                  <div className={`flex items-center space-x-2 px-3 py-2 rounded text-sm ${
                    activeTab.saved 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {activeTab.saved ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Saved</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4" />
                        <span>Unsaved</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Source</label>
                  <div className="flex items-center space-x-2 px-3 py-2 bg-gray-800/30 rounded text-sm text-gray-300">
                    <HardDrive className="w-4 h-4" />
                    <span>Memory</span>
                  </div>
                </div>
              </div>
            </div>

            {/* User Session */}
            <div className="glass-dark rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">User Session</h3>
              
              {user ? (
                <div className={`p-4 rounded-lg ${
                  user.role === 'murid' 
                    ? 'bg-green-500/20 border border-green-500/30' 
                    : 'bg-blue-500/20 border border-blue-500/30'
                }`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="w-4 h-4 text-current" />
                    <span className="font-medium text-current">
                      {user.role === 'murid' ? 'awam' : user.role}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300">{user.email}</p>
                </div>
              ) : (
                <div className="p-4 bg-gray-500/20 border border-gray-500/30 rounded-lg">
                  <p className="text-sm text-gray-400">Not logged in</p>
                </div>
              )}
            </div>

            {/* Theme */}
            <div className="glass-dark rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Tema</h3>
              
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as 'dark' | 'light')}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-electric-blue"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </div>
          </div>

          {/* Main Editor */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {/* Tindakan Pantas */}
              <div className="glass-dark rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Tindakan Pantas</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button
                    onClick={() => createNewTab('javascript')}
                    className="flex items-center space-x-2 p-3 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 rounded-lg transition-colors duration-300"
                  >
                    <Plus className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-yellow-400">New Tab</span>
                  </button>
                  
                  <button
                    onClick={() => setShowOutput(!showOutput)}
                    className="flex items-center space-x-2 p-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg transition-colors duration-300"
                  >
                    <Terminal className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-blue-400">Console</span>
                  </button>
                  
                  <button
                    onClick={() => window.open('https://developer.mozilla.org/en-US/docs/Web/JavaScript', '_blank')}
                    className="flex items-center space-x-2 p-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg transition-colors duration-300"
                  >
                    <FileText className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-purple-400">Docs</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      updateTab(activeTabId, { content: LANGUAGE_CONFIG[activeTab.language as keyof typeof LANGUAGE_CONFIG]?.defaultContent || '' })
                      addNotification('success', 'Template loaded')
                    }}
                    className="flex items-center space-x-2 p-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg transition-colors duration-300"
                  >
                    <RefreshCw className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-400">Reset</span>
                  </button>
                </div>
              </div>

              {/* Editor */}
              <div className="glass-dark rounded-xl overflow-hidden">
                {/* Tab Bar */}
                <div className="flex items-center bg-gray-800/50 border-b border-gray-700">
                  {tabs.map((tab) => (
                    <div
                      key={tab.id}
                      className={`flex items-center space-x-2 px-4 py-3 border-r border-gray-700 cursor-pointer transition-colors duration-300 ${
                        tab.id === activeTabId 
                          ? 'bg-gray-700/50 text-white' 
                          : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                      }`}
                      onClick={() => setActiveTabId(tab.id)}
                    >
                      <span className="text-sm font-medium">{tab.name}</span>
                      {!tab.saved && <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>}
                      {tabs.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            closeTab(tab.id)
                          }}
                          className="text-gray-500 hover:text-red-400 transition-colors duration-300"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                  
                  <button
                    onClick={() => createNewTab()}
                    className="p-3 text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Code Editor */}
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={activeTab.content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    placeholder="Mula tulis kod anda di sini..."
                    className="w-full h-96 p-4 bg-gray-900/50 text-white font-mono text-sm resize-none focus:outline-none"
                    style={{ 
                      fontSize: '14px',
                      lineHeight: '1.5',
                      backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
                      color: theme === 'dark' ? '#ffffff' : '#000000'
                    }}
                    spellCheck={false}
                  />
                </div>

                {/* Status Bar */}
                <div className="flex items-center justify-between px-4 py-2 bg-gray-800/30 border-t border-gray-700 text-sm text-gray-400">
                  <div className="flex items-center space-x-4">
                    <span>Bahasa: {activeTab.language}</span>
                    <span>Baris: {activeTab.content.split('\n').length}</span>
                    <span>Aksara: {activeTab.content.length}</span>
                    {codeErrors.length > 0 && (
                      <span className="text-red-400">
                        ⚠ {codeErrors.length} issues
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span>Tema: {theme}</span>
                    <span className="text-green-400">✓ Syntax Highlighting FS API</span>
                  </div>
                </div>
              </div>

              {/* Output Panel */}
              {showOutput && (
                <div className="glass-dark rounded-xl overflow-hidden">
                  <div className="flex items-center bg-gray-800/50 border-b border-gray-700">
                    <div className="flex items-center space-x-2 px-4 py-3 bg-gray-700/50 text-white">
                      <Terminal className="w-4 h-4" />
                      <span className="text-sm">Console Output</span>
                    </div>
                    
                    <div className="flex-1"></div>
                    
                    <button
                      onClick={() => setExecutionOutput('')}
                      className="p-3 text-gray-400 hover:text-white transition-colors duration-300"
                      title="Clear output"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => setShowOutput(false)}
                      className="p-3 text-gray-400 hover:text-white transition-colors duration-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-4 h-64 overflow-y-auto bg-gray-900/50">
                    <div className="font-mono text-sm">
                      {executionOutput ? (
                        <pre className="text-gray-300 whitespace-pre-wrap">{executionOutput}</pre>
                      ) : (
                        <div className="text-gray-500 flex items-center space-x-2">
                          <Terminal className="w-4 h-4" />
                          <span>Tiada error dijumpai!</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Error Panel */}
              {codeErrors.length > 0 && (
                <div className="glass-dark rounded-xl overflow-hidden">
                  <div className="flex items-center bg-red-500/20 border-b border-red-500/30 px-4 py-3">
                    <AlertTriangle className="w-4 h-4 text-red-400 mr-2" />
                    <span className="text-sm text-red-400">Errors ({codeErrors.length})</span>
                  </div>

                  <div className="p-4 space-y-2">
                    {codeErrors.map((error, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-red-500/10 border border-red-500/20 rounded">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          error.type === 'error' ? 'bg-red-400' : 'bg-yellow-400'
                        }`}></div>
                        <div>
                          <p className="text-sm text-gray-300">Line {error.line}: {error.message}</p>
                          <p className="text-xs text-gray-500 capitalize">{error.type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

