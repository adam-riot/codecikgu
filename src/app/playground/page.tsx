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
  Plus, 
  X, 
  File, 
  Terminal, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Info,
  Settings,
  Folder,
  Trash2
} from 'lucide-react'

// Type Definitions
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
  file_id?: string
}

interface SavedFile {
  id: string
  name: string
  content: string
  language: string
  user_id: string
  created_at: string
  updated_at: string
}

interface Notification {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
}

// Language detection patterns
const detectLanguage = (code: string): string => {
  if (!code.trim()) return 'javascript'
  
  // PHP detection
  if (code.includes('<?php') || code.includes('$') || /\b(echo|print|var_dump)\b/.test(code)) {
    return 'php'
  }
  
  // Python detection
  if (/\b(def|import|print|if __name__|True|False|None)\b/.test(code) || code.includes('print(')) {
    return 'python'
  }
  
  // HTML detection
  if (/<html|<head|<body|<div|<span|<!DOCTYPE/.test(code)) {
    return 'html'
  }
  
  // CSS detection
  if (/\{[^}]*\}/.test(code) && /[.#][a-zA-Z]/.test(code)) {
    return 'css'
  }
  
  // Java detection
  if (/\b(public class|System\.out\.println|public static void main)\b/.test(code)) {
    return 'java'
  }
  
  // C++ detection
  if (/#include|using namespace std|cout|cin/.test(code)) {
    return 'cpp'
  }
  
  // Default to JavaScript
  return 'javascript'
}

// File extension mapping
const getFileExtension = (fileName: string, language: string): string => {
  if (fileName.includes('.')) return fileName
  
  const extensions: { [key: string]: string } = {
    javascript: 'js',
    php: 'php',
    python: 'py',
    html: 'html',
    css: 'css',
    java: 'java',
    cpp: 'cpp'
  }
  
  return `${fileName}.${extensions[language] || 'txt'}`
}

// FIXED: Proper syntax highlighting function
const applySyntaxHighlighting = (code: string, language: string): string => {
  if (!code) return ''
  
  let highlighted = code
  
  // Escape HTML first
  highlighted = highlighted
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  
  if (language === 'javascript') {
    // Keywords
    highlighted = highlighted.replace(
      /\b(const|let|var|function|if|else|for|while|return|class|import|export|async|await|try|catch|finally|throw|new|this)\b/g,
      '<span style="color: #569cd6; font-weight: bold;">$&</span>'
    )
    
    // Strings
    highlighted = highlighted.replace(
      /(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g,
      '<span style="color: #ce9178;">$&</span>'
    )
    
    // Comments
    highlighted = highlighted.replace(
      /(\/\/.*$)/gm,
      '<span style="color: #6a9955; font-style: italic;">$&</span>'
    )
    
    // Numbers
    highlighted = highlighted.replace(
      /\b(\d+\.?\d*)\b/g,
      '<span style="color: #b5cea8;">$&</span>'
    )
  } else if (language === 'php') {
    // PHP tags
    highlighted = highlighted.replace(
      /(&lt;\?php|\?&gt;)/g,
      '<span style="color: #569cd6; font-weight: bold;">$&</span>'
    )
    
    // Variables
    highlighted = highlighted.replace(
      /\$[a-zA-Z_][a-zA-Z0-9_]*/g,
      '<span style="color: #9cdcfe;">$&</span>'
    )
    
    // Keywords
    highlighted = highlighted.replace(
      /\b(echo|print|var_dump|function|class|public|private|protected|if|else|for|while|return)\b/g,
      '<span style="color: #569cd6; font-weight: bold;">$&</span>'
    )
    
    // Strings
    highlighted = highlighted.replace(
      /(["'])((?:\\.|(?!\1)[^\\])*?)\1/g,
      '<span style="color: #ce9178;">$&</span>'
    )
    
    // Comments
    highlighted = highlighted.replace(
      /(\/\/.*$|#.*$)/gm,
      '<span style="color: #6a9955; font-style: italic;">$&</span>'
    )
  } else if (language === 'python') {
    // Keywords
    highlighted = highlighted.replace(
      /\b(def|class|import|from|if|elif|else|for|while|try|except|finally|return|True|False|None|and|or|not|in|is)\b/g,
      '<span style="color: #569cd6; font-weight: bold;">$&</span>'
    )
    
    // Strings
    highlighted = highlighted.replace(
      /(["'])((?:\\.|(?!\1)[^\\])*?)\1/g,
      '<span style="color: #ce9178;">$&</span>'
    )
    
    // Comments
    highlighted = highlighted.replace(
      /(#.*$)/gm,
      '<span style="color: #6a9955; font-style: italic;">$&</span>'
    )
    
    // Numbers
    highlighted = highlighted.replace(
      /\b(\d+\.?\d*)\b/g,
      '<span style="color: #b5cea8;">$&</span>'
    )
  } else if (language === 'html') {
    // Tags
    highlighted = highlighted.replace(
      /(&lt;\/?[a-zA-Z][^&gt;]*&gt;)/g,
      '<span style="color: #569cd6; font-weight: bold;">$&</span>'
    )
    
    // Attributes
    highlighted = highlighted.replace(
      /\s([a-zA-Z-]+)=/g,
      ' <span style="color: #92c5f7;">$1</span>='
    )
    
    // Strings
    highlighted = highlighted.replace(
      /(["'])((?:\\.|(?!\1)[^\\])*?)\1/g,
      '<span style="color: #ce9178;">$&</span>'
    )
  } else if (language === 'css') {
    // Selectors
    highlighted = highlighted.replace(
      /([.#]?[a-zA-Z][a-zA-Z0-9-]*)\s*\{/g,
      '<span style="color: #d7ba7d;">$1</span> {'
    )
    
    // Properties
    highlighted = highlighted.replace(
      /([a-zA-Z-]+)\s*:/g,
      '<span style="color: #9cdcfe;">$1</span>:'
    )
    
    // Values
    highlighted = highlighted.replace(
      /:\s*([^;]+);/g,
      ': <span style="color: #ce9178;">$1</span>;'
    )
  }
  
  return highlighted
}

// FIXED: Get user role function with better error handling
const getUserRole = async (userId: string): Promise<string> => {
  try {
    console.log('Fetching role for user ID:', userId)
    
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()
    
    console.log('Database response:', { data, error })
    
    if (error) {
      console.error('Error fetching user role:', error)
      return 'awam'
    }
    
    const role = data?.role || 'awam'
    console.log('Final role:', role)
    return role
  } catch (error) {
    console.error('Exception in getUserRole:', error)
    return 'awam'
  }
}

export default function PlaygroundPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: '1',
      name: 'main',
      content: `// Welcome to CodeCikgu Playground!
console.log('Hello, World!');

function greet(name) {
  return 'Hello, ' + name + '!';
}

console.log(greet('CodeCikgu'));

// Try some operations
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log('Doubled:', doubled);`,
      language: 'javascript',
      saved: false
    }
  ])
  const [activeTabId, setActiveTabId] = useState('1')
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [executionOutput, setExecutionOutput] = useState('')
  const [showOutput, setShowOutput] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [savedFiles, setSavedFiles] = useState<SavedFile[]>([])
  const [showFileManager, setShowFileManager] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const highlightRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user) {
      loadSavedFiles()
    }
  }, [user])

  // Sync scroll between textarea and highlight overlay
  useEffect(() => {
    const textarea = textareaRef.current
    const highlight = highlightRef.current
    
    if (textarea && highlight) {
      const syncScroll = () => {
        highlight.scrollTop = textarea.scrollTop
        highlight.scrollLeft = textarea.scrollLeft
      }
      
      textarea.addEventListener('scroll', syncScroll)
      return () => textarea.removeEventListener('scroll', syncScroll)
    }
  }, [])

  const checkUser = async () => {
    try {
      console.log('Checking user session...')
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session && session.user) {
        console.log('Session found:', session.user.id)
        const userRole = await getUserRole(session.user.id)
        
        const userData = {
          id: session.user.id,
          email: session.user.email || '',
          role: userRole
        }
        
        console.log('Setting user data:', userData)
        setUser(userData)
      } else {
        console.log('No session found')
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
    
    // Auto-detect language
    const detectedLang = detectLanguage(content)
    const activeTab = getActiveTab()
    if (detectedLang !== activeTab.language) {
      updateTab(activeTabId, { language: detectedLang })
    }
  }

  const executeCode = async () => {
    const activeTab = getActiveTab()
    
    if (activeTab.language === 'javascript') {
      setIsExecuting(true)
      setShowOutput(true)
      
      try {
        const output: string[] = []
        const safeConsole = {
          log: (...args: any[]) => {
            output.push(args.map(arg => {
              if (typeof arg === 'object') {
                return JSON.stringify(arg, null, 2)
              }
              return String(arg)
            }).join(' '))
          },
          error: (...args: any[]) => {
            output.push('ERROR: ' + args.map(arg => String(arg)).join(' '))
          }
        }
        
        const func = new Function('console', activeTab.content)
        func(safeConsole)
        
        setExecutionOutput(output.length > 0 ? output.join('\n') : 'Code executed successfully (no output)')
        addNotification('success', 'Code executed successfully')
      } catch (error) {
        const errorMessage = (error as Error).message
        setExecutionOutput(`Error: ${errorMessage}`)
        addNotification('error', 'Execution failed')
      } finally {
        setIsExecuting(false)
      }
    } else {
      setExecutionOutput(`Execution not supported for ${activeTab.language}`)
      setShowOutput(true)
      addNotification('info', `Execution not available for ${activeTab.language}`)
    }
  }

  const downloadFile = () => {
    const activeTab = getActiveTab()
    const properFileName = getFileExtension(activeTab.name, activeTab.language)
    
    const blob = new Blob([activeTab.content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = properFileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    addNotification('success', `File downloaded as ${properFileName}`)
  }

  // FIXED: Persistent save functionality
  const saveFile = async () => {
    if (!user) {
      addNotification('error', 'Please login to save files')
      return
    }

    const activeTab = getActiveTab()
    
    try {
      if (activeTab.file_id) {
        // Update existing file
        const { error } = await supabase
          .from('playground_files')
          .update({
            name: activeTab.name,
            content: activeTab.content,
            language: activeTab.language,
            updated_at: new Date().toISOString()
          })
          .eq('id', activeTab.file_id)
          .eq('user_id', user.id) // Security: only update own files
        
        if (error) throw error
        addNotification('success', 'File updated successfully')
      } else {
        // Create new file
        const { data, error } = await supabase
          .from('playground_files')
          .insert({
            name: activeTab.name,
            content: activeTab.content,
            language: activeTab.language,
            user_id: user.id
          })
          .select()
          .single()
        
        if (error) throw error
        
        // Update tab with file_id
        updateTab(activeTabId, { file_id: data.id, saved: true })
        addNotification('success', 'File saved successfully')
      }
      
      // Reload saved files list
      loadSavedFiles()
    } catch (error) {
      console.error('Save error:', error)
      addNotification('error', 'Failed to save file')
    }
  }

  const loadSavedFiles = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('playground_files')
        .select('*')
        .eq('user_id', user.id) // Security: only load own files
        .order('updated_at', { ascending: false })
      
      if (error) throw error
      setSavedFiles(data || [])
    } catch (error) {
      console.error('Load files error:', error)
    }
  }

  const loadFile = (file: SavedFile) => {
    const newTab: Tab = {
      id: Date.now().toString(),
      name: file.name,
      content: file.content,
      language: file.language,
      saved: true,
      file_id: file.id
    }
    
    setTabs(prev => [...prev, newTab])
    setActiveTabId(newTab.id)
    setShowFileManager(false)
    addNotification('success', `Loaded ${file.name}`)
  }

  const deleteFile = async (fileId: string) => {
    if (!user) return
    
    try {
      const { error } = await supabase
        .from('playground_files')
        .delete()
        .eq('id', fileId)
        .eq('user_id', user.id) // Security: only delete own files
      
      if (error) throw error
      
      loadSavedFiles()
      addNotification('success', 'File deleted')
    } catch (error) {
      console.error('Delete error:', error)
      addNotification('error', 'Failed to delete file')
    }
  }

  const createNewTab = () => {
    const newId = (tabs.length + 1).toString()
    const newTab: Tab = {
      id: newId,
      name: `untitled-${newId}`,
      content: '// New file\nconsole.log("Hello from new file!");',
      language: 'javascript',
      saved: false
    }
    
    setTabs(prev => [...prev, newTab])
    setActiveTabId(newId)
    addNotification('info', 'New tab created')
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
    
    addNotification('info', 'Tab closed')
  }

  const getLineNumbers = (content: string): string => {
    const lines = content.split('\n')
    return lines.map((_, index) => index + 1).join('\n')
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
                Editor kod online dengan auto-detect dan persistent save
              </span>
              
              {user && (
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${
                  user.role === 'murid' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-blue-500/20 text-blue-400'
                }`}>
                  <div className="w-2 h-2 bg-current rounded-full"></div>
                  <span>Secure session untuk {user.role}: {user.email}</span>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowFileManager(!showFileManager)}
                  className="p-2 text-gray-400 hover:text-white transition-colors duration-300"
                  title="File Manager"
                >
                  <Folder className="w-4 h-4" />
                </button>
                
                <button
                  onClick={saveFile}
                  className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors duration-300"
                >
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </button>
                
                <button
                  onClick={executeCode}
                  disabled={isExecuting}
                  className="flex items-center space-x-2 px-4 py-2 bg-neon-green hover:bg-neon-green/90 text-dark-black font-medium rounded-lg transition-colors duration-300 disabled:opacity-50"
                >
                  <Play className="w-4 h-4" />
                  <span>{isExecuting ? 'Running...' : 'Run'}</span>
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

      {/* File Manager Modal */}
      {showFileManager && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-gray-900 rounded-xl p-6 w-96 max-w-90vw max-h-80vh overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Saved Files</h3>
              <button
                onClick={() => setShowFileManager(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-2">
              {savedFiles.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No saved files yet</p>
              ) : (
                savedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="text-white font-medium">{getFileExtension(file.name, file.language)}</div>
                      <div className="text-xs text-gray-400">{file.language} • {new Date(file.updated_at).toLocaleDateString()}</div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => loadFile(file)}
                        className="px-3 py-1 bg-electric-blue hover:bg-electric-blue/90 text-white text-sm rounded transition-colors"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => deleteFile(file.id)}
                        className="p-1 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
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
            <div className="glass-dark rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">File Explorer</h3>
              
              <div className="space-y-2">
                {tabs.map((tab) => (
                  <div
                    key={tab.id}
                    className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors duration-300 ${
                      tab.id === activeTabId 
                        ? 'bg-electric-blue/20 text-electric-blue' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                    }`}
                    onClick={() => setActiveTabId(tab.id)}
                  >
                    <div className="flex items-center space-x-2">
                      <File className="w-4 h-4" />
                      <span className="text-sm">{getFileExtension(tab.name, tab.language)}</span>
                      {!tab.saved && <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>}
                    </div>
                    
                    {tabs.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          closeTab(tab.id)
                        }}
                        className="text-gray-500 hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
                
                <button
                  onClick={createNewTab}
                  className="flex items-center space-x-2 w-full p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded transition-colors duration-300"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">New File</span>
                </button>
              </div>
            </div>

            <div className="glass-dark rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">File Info</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">File Name</label>
                  <input
                    type="text"
                    value={activeTab.name}
                    onChange={(e) => updateTab(activeTabId, { name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-electric-blue"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Language (Auto-detected)</label>
                  <select
                    value={activeTab.language}
                    onChange={(e) => updateTab(activeTabId, { language: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-electric-blue"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="php">PHP</option>
                    <option value="python">Python</option>
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                  </select>
                </div>
                
                <div className="text-sm text-gray-400 space-y-1">
                  <div>Lines: {activeTab.content.split('\n').length}</div>
                  <div>Characters: {activeTab.content.length}</div>
                  <div>Download as: <span className="text-electric-blue">{getFileExtension(activeTab.name, activeTab.language)}</span></div>
                  <div>Status: <span className={activeTab.saved ? 'text-green-400' : 'text-yellow-400'}>{activeTab.saved ? 'Saved' : 'Unsaved'}</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Editor */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {/* Editor */}
              <div className="glass-dark rounded-xl overflow-hidden">
                {/* Tab Bar */}
                <div className="flex items-center bg-gray-800/50 border-b border-gray-700">
                  <div className="flex items-center space-x-2 px-4 py-3 bg-gray-700/50 text-white">
                    <span className="text-sm font-medium">{getFileExtension(activeTab.name, activeTab.language)}</span>
                    {!activeTab.saved && <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>}
                  </div>
                </div>

                {/* Code Editor with FIXED Syntax Highlighting */}
                <div className="relative">
                  {/* Line Numbers */}
                  <div 
                    className="absolute left-0 top-0 w-12 h-full bg-gray-800/30 border-r border-gray-700 p-4 font-mono text-sm text-gray-500 pointer-events-none overflow-hidden"
                    style={{ fontSize: '14px', lineHeight: '1.5' }}
                  >
                    <pre className="whitespace-pre">{getLineNumbers(activeTab.content)}</pre>
                  </div>
                  
                  {/* FIXED: Syntax Highlighted Background */}
                  <div 
                    ref={highlightRef}
                    className="absolute inset-0 pl-12 p-4 font-mono pointer-events-none overflow-auto whitespace-pre-wrap break-words text-white"
                    style={{ 
                      fontSize: '14px',
                      lineHeight: '1.5',
                      backgroundColor: '#1a1a1a',
                      zIndex: 1
                    }}
                    dangerouslySetInnerHTML={{
                      __html: applySyntaxHighlighting(activeTab.content, activeTab.language)
                    }}
                  />
                  
                  {/* Transparent Textarea */}
                  <textarea
                    ref={textareaRef}
                    value={activeTab.content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    placeholder="Write your code here..."
                    className="relative w-full h-96 pl-12 p-4 resize-none focus:outline-none font-mono bg-transparent text-transparent caret-white"
                    style={{ 
                      fontSize: '14px',
                      lineHeight: '1.5',
                      zIndex: 2
                    }}
                    spellCheck={false}
                  />
                </div>

                {/* Status Bar */}
                <div className="flex items-center justify-between px-4 py-2 bg-gray-800/30 border-t border-gray-700 text-sm text-gray-400">
                  <div className="flex items-center space-x-4">
                    <span>Language: {activeTab.language}</span>
                    <span>Lines: {activeTab.content.split('\n').length}</span>
                    <span>Characters: {activeTab.content.length}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-green-400">✓ Syntax Highlighting FIXED</span>
                    <span className="text-blue-400">💾 Persistent Save</span>
                    {user && <span className="text-purple-400">🔒 User: {user.role}</span>}
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
                        <div className="text-gray-500">
                          Click "Run" to execute your code and see the output here...
                        </div>
                      )}
                    </div>
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

