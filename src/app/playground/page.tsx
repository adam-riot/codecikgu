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
  CheckCircle, 
  XCircle, 
  Info,
  Folder,
  Trash2,
  Upload,
  FolderOpen,
  PlayCircle,
  FileText
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

// Define executable languages
const EXECUTABLE_LANGUAGES = ['javascript', 'python']
const NON_EXECUTABLE_LANGUAGES = ['css', 'html', 'json', 'xml', 'sql', 'php', 'java', 'cpp', 'c', 'typescript']

// Check if language is executable
const isExecutableLanguage = (language: string): boolean => {
  return EXECUTABLE_LANGUAGES.includes(language.toLowerCase())
}

// Get language description for non-executable languages
const getLanguageDescription = (language: string): string => {
  const descriptions: { [key: string]: string } = {
    css: 'CSS files are styling sheets - use with HTML files',
    html: 'HTML files can be opened in browser - download to view',
    json: 'JSON files are data format - use for configuration',
    xml: 'XML files are markup format - use for data structure',
    sql: 'SQL files are database queries - use with database tools',
    php: 'PHP files need server environment - use XAMPP to run',
    java: 'Java files need compilation - use IDE like Eclipse/IntelliJ',
    cpp: 'C++ files need compilation - use compiler like g++',
    c: 'C files need compilation - use compiler like gcc',
    typescript: 'TypeScript files need compilation - use tsc compiler'
  }
  
  return descriptions[language.toLowerCase()] || 'This language requires external tools to run'
}

// Language detection
const detectLanguage = (code: string, fileName?: string): string => {
  if (fileName) {
    const ext = fileName.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'js': return 'javascript'
      case 'php': return 'php'
      case 'py': return 'python'
      case 'html': case 'htm': return 'html'
      case 'css': return 'css'
      case 'java': return 'java'
      case 'cpp': case 'cc': case 'cxx': return 'cpp'
      case 'c': return 'c'
      case 'ts': return 'typescript'
      case 'json': return 'json'
      case 'xml': return 'xml'
      case 'sql': return 'sql'
    }
  }
  
  if (!code.trim()) return 'javascript'
  
  if (code.includes('<?php') || code.includes('$') || /\b(echo|print|var_dump)\b/.test(code)) {
    return 'php'
  }
  
  if (/\b(def|import|print|if __name__|True|False|None)\b/.test(code) || code.includes('print(')) {
    return 'python'
  }
  
  if (/<html|<head|<body|<div|<span|<!DOCTYPE/.test(code)) {
    return 'html'
  }
  
  if (/\{[^}]*\}/.test(code) && /[.#][a-zA-Z]/.test(code)) {
    return 'css'
  }
  
  if (/\b(public class|System\.out\.println|public static void main)\b/.test(code)) {
    return 'java'
  }
  
  if (/#include|using namespace std|cout|cin/.test(code)) {
    return 'cpp'
  }
  
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
    cpp: 'cpp',
    c: 'c',
    typescript: 'ts',
    json: 'json',
    xml: 'xml',
    sql: 'sql'
  }
  
  return `${fileName}.${extensions[language] || 'txt'}`
}

// Get user role function
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

// Local storage functions for persistence
const saveToLocalStorage = (tabs: Tab[], activeTabId: string) => {
  try {
    const playgroundState = {
      tabs,
      activeTabId,
      timestamp: Date.now()
    }
    localStorage.setItem('codecikgu_playground_state', JSON.stringify(playgroundState))
    console.log('Saved to localStorage:', playgroundState)
  } catch (error) {
    console.error('Error saving to localStorage:', error)
  }
}

const loadFromLocalStorage = (): { tabs: Tab[], activeTabId: string } | null => {
  try {
    const saved = localStorage.getItem('codecikgu_playground_state')
    if (saved) {
      const parsed = JSON.parse(saved)
      console.log('Loaded from localStorage:', parsed)
      return parsed
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error)
  }
  return null
}

// FIXED: Auto-indentation functions
const getIndentLevel = (line: string): number => {
  const match = line.match(/^(\s*)/)
  return match ? match[1].length : 0
}

const shouldIncreaseIndent = (line: string, language: string): boolean => {
  const trimmed = line.trim()
  
  if (language === 'javascript' || language === 'typescript') {
    return /[{(\[]$/.test(trimmed) || 
           /\b(if|else|for|while|function|class|try|catch|finally)\s*\([^)]*\)\s*$/.test(trimmed) ||
           /\b(if|else|for|while)\s*\([^)]*\)\s*$/.test(trimmed)
  }
  
  if (language === 'python') {
    return /:$/.test(trimmed) || 
           /\b(if|elif|else|for|while|def|class|try|except|finally|with)\b.*:$/.test(trimmed)
  }
  
  if (language === 'css') {
    return /{$/.test(trimmed)
  }
  
  if (language === 'html') {
    return /<[^/][^>]*[^/]>$/.test(trimmed) && !/<(br|hr|img|input|meta|link)\b[^>]*>$/i.test(trimmed)
  }
  
  return /[{(\[]$/.test(trimmed)
}

const getAutoIndent = (content: string, cursorPosition: number, language: string): string => {
  const beforeCursor = content.substring(0, cursorPosition)
  const lines = beforeCursor.split('\n')
  const currentLine = lines[lines.length - 1] || ''
  const previousLine = lines[lines.length - 2] || ''
  
  let indent = getIndentLevel(previousLine)
  
  if (shouldIncreaseIndent(previousLine, language)) {
    indent += 2 // 2 spaces for indentation
  }
  
  return ' '.repeat(indent)
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
console.log('Doubled:', doubled);

// Object example
const student = {
  name: 'Ahmad',
  age: 16,
  grade: 'A'
};

console.log('Student info:', student);

// More lines to test scrolling
for (let i = 1; i <= 10; i++) {
  console.log('Line', i);
}`,
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
  const lineNumbersRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    checkUser()
    loadSavedState()
  }, [])

  useEffect(() => {
    if (user) {
      loadSavedFiles()
    }
  }, [user])

  useEffect(() => {
    if (tabs.length > 0) {
      saveToLocalStorage(tabs, activeTabId)
    }
  }, [tabs, activeTabId])

  useEffect(() => {
    const textarea = textareaRef.current
    const lineNumbers = lineNumbersRef.current
    
    if (textarea && lineNumbers) {
      const syncScroll = () => {
        lineNumbers.scrollTop = textarea.scrollTop
        lineNumbers.scrollLeft = textarea.scrollLeft
      }
      
      textarea.addEventListener('scroll', syncScroll, { passive: true })
      textarea.addEventListener('input', syncScroll, { passive: true })
      textarea.addEventListener('keyup', syncScroll, { passive: true })
      textarea.addEventListener('mouseup', syncScroll, { passive: true })
      
      syncScroll()
      
      return () => {
        textarea.removeEventListener('scroll', syncScroll)
        textarea.removeEventListener('input', syncScroll)
        textarea.removeEventListener('keyup', syncScroll)
        textarea.removeEventListener('mouseup', syncScroll)
      }
    }
  }, [activeTabId, tabs])

  const loadSavedState = () => {
    const saved = loadFromLocalStorage()
    if (saved && saved.tabs && saved.tabs.length > 0) {
      setTabs(saved.tabs)
      setActiveTabId(saved.activeTabId)
      addNotification('info', 'Previous session restored')
    }
  }

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

  // FIXED: Update tab function with proper save status
  const updateTab = (tabId: string, updates: Partial<Tab>) => {
    setTabs(prev => prev.map(tab => 
      tab.id === tabId 
        ? { ...tab, ...updates, saved: updates.saved !== undefined ? updates.saved : false }
        : tab
    ))
  }

  // FIXED: Handle content change with auto-indentation
  const handleContentChange = (content: string) => {
    updateTab(activeTabId, { content, saved: false })
    
    const activeTab = getActiveTab()
    const detectedLang = detectLanguage(content, activeTab.name)
    if (detectedLang !== activeTab.language) {
      updateTab(activeTabId, { language: detectedLang })
    }
  }

  // FIXED: Handle key press for auto-indentation
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget
    const { selectionStart, selectionEnd, value } = textarea
    
    if (e.key === 'Enter') {
      e.preventDefault()
      
      const activeTab = getActiveTab()
      const autoIndent = getAutoIndent(value, selectionStart, activeTab.language)
      const newContent = value.substring(0, selectionStart) + '\n' + autoIndent + value.substring(selectionEnd)
      
      handleContentChange(newContent)
      
      // Set cursor position after the auto-indent
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = selectionStart + 1 + autoIndent.length
      }, 0)
    } else if (e.key === 'Tab') {
      e.preventDefault()
      
      if (e.shiftKey) {
        // Unindent
        const lines = value.split('\n')
        const startLine = value.substring(0, selectionStart).split('\n').length - 1
        const endLine = value.substring(0, selectionEnd).split('\n').length - 1
        
        for (let i = startLine; i <= endLine; i++) {
          if (lines[i].startsWith('  ')) {
            lines[i] = lines[i].substring(2)
          }
        }
        
        const newContent = lines.join('\n')
        handleContentChange(newContent)
      } else {
        // Indent
        const beforeSelection = value.substring(0, selectionStart)
        const selectedText = value.substring(selectionStart, selectionEnd)
        const afterSelection = value.substring(selectionEnd)
        
        if (selectedText.includes('\n')) {
          // Multi-line selection - indent each line
          const lines = selectedText.split('\n')
          const indentedLines = lines.map(line => '  ' + line)
          const newContent = beforeSelection + indentedLines.join('\n') + afterSelection
          handleContentChange(newContent)
        } else {
          // Single line or no selection - insert tab
          const newContent = beforeSelection + '  ' + selectedText + afterSelection
          handleContentChange(newContent)
          
          setTimeout(() => {
            textarea.selectionStart = selectionStart + 2
            textarea.selectionEnd = selectionEnd + 2
          }, 0)
        }
      }
    }
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      const language = detectLanguage(content, file.name)
      
      const newTab: Tab = {
        id: Date.now().toString(),
        name: file.name.replace(/\.[^/.]+$/, ""),
        content,
        language,
        saved: false
      }
      
      setTabs(prev => [...prev, newTab])
      setActiveTabId(newTab.id)
      addNotification('success', `File ${file.name} uploaded successfully`)
    }
    
    reader.readAsText(file)
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const executeCode = async () => {
    const activeTab = getActiveTab()
    
    if (!isExecutableLanguage(activeTab.language)) {
      const description = getLanguageDescription(activeTab.language)
      setExecutionOutput(`${activeTab.language.toUpperCase()} files cannot be executed in browser.\n\n${description}`)
      setShowOutput(true)
      addNotification('info', `${activeTab.language.toUpperCase()} files need external tools to run`)
      return
    }
    
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
    } else if (activeTab.language === 'python') {
      setExecutionOutput('Python execution coming soon!')
      setShowOutput(true)
      addNotification('info', 'Python execution will be available in future updates')
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

  // FIXED: Save file function with proper status update
  const saveFile = async () => {
    if (!user) {
      addNotification('error', 'Please login to save files')
      return
    }

    const activeTab = getActiveTab()
    
    try {
      if (activeTab.file_id) {
        const { error } = await supabase
          .from('playground_files')
          .update({
            name: activeTab.name,
            content: activeTab.content,
            language: activeTab.language,
            updated_at: new Date().toISOString()
          })
          .eq('id', activeTab.file_id)
          .eq('user_id', user.id)
        
        if (error) throw error
        
        // FIXED: Update save status properly
        updateTab(activeTabId, { saved: true })
        addNotification('success', 'File updated successfully')
      } else {
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
        
        // FIXED: Update save status and file_id properly
        updateTab(activeTabId, { file_id: data.id, saved: true })
        addNotification('success', 'File saved successfully')
      }
      
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
        .eq('user_id', user.id)
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
      saved: true, // FIXED: Set saved to true when loading from database
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
        .eq('user_id', user.id)
      
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

  const generateLineNumbers = (content: string): string => {
    const lines = content.split('\n')
    return lines.map((_, index) => (index + 1).toString()).join('\n')
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
  const isCurrentLanguageExecutable = isExecutableLanguage(activeTab.language)

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black">
      <input
        ref={fileInputRef}
        type="file"
        accept=".js,.php,.py,.html,.css,.java,.cpp,.c,.ts,.json,.xml,.sql,.txt"
        onChange={handleFileSelect}
        className="hidden"
      />

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
                Editor kod dengan auto-indentation dan smart save
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
                  onClick={handleFileUpload}
                  className="flex items-center space-x-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors duration-300"
                  title="Open File from Computer"
                >
                  <FolderOpen className="w-4 h-4" />
                  <span>Open</span>
                </button>

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
                
                {isCurrentLanguageExecutable ? (
                  <button
                    onClick={executeCode}
                    disabled={isExecuting}
                    className="flex items-center space-x-2 px-4 py-2 bg-neon-green hover:bg-neon-green/90 text-dark-black font-medium rounded-lg transition-colors duration-300 disabled:opacity-50"
                  >
                    <Play className="w-4 h-4" />
                    <span>{isExecuting ? 'Running...' : 'Run'}</span>
                  </button>
                ) : (
                  <div className="relative group">
                    <button
                      disabled
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-gray-400 font-medium rounded-lg cursor-not-allowed opacity-50"
                    >
                      <FileText className="w-4 h-4" />
                      <span>View Only</span>
                    </button>
                    
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50">
                      {getLanguageDescription(activeTab.language)}
                    </div>
                  </div>
                )}
                
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
                      <div className="text-xs text-gray-400">
                        {file.language} • {new Date(file.updated_at).toLocaleDateString()}
                        {isExecutableLanguage(file.language) && <span className="text-green-400 ml-2">• Executable</span>}
                      </div>
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
                      {/* FIXED: Show proper save status indicator */}
                      {!tab.saved && <div className="w-2 h-2 bg-yellow-400 rounded-full" title="Unsaved changes"></div>}
                      {tab.saved && <div className="w-2 h-2 bg-green-400 rounded-full" title="Saved"></div>}
                      {isExecutableLanguage(tab.language) && <PlayCircle className="w-3 h-3 text-green-400" />}
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
                    onChange={(e) => updateTab(activeTabId, { name: e.target.value, saved: false })}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-electric-blue"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Language (Auto-detected)</label>
                  <select
                    value={activeTab.language}
                    onChange={(e) => updateTab(activeTabId, { language: e.target.value, saved: false })}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-electric-blue"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="php">PHP</option>
                    <option value="python">Python</option>
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="c">C</option>
                    <option value="typescript">TypeScript</option>
                    <option value="json">JSON</option>
                    <option value="xml">XML</option>
                    <option value="sql">SQL</option>
                  </select>
                </div>
                
                <div className="text-sm text-gray-400 space-y-1">
                  <div>Lines: {activeTab.content.split('\n').length}</div>
                  <div>Characters: {activeTab.content.length}</div>
                  <div>Download as: <span className="text-electric-blue">{getFileExtension(activeTab.name, activeTab.language)}</span></div>
                  {/* FIXED: Show correct save status */}
                  <div>Status: <span className={activeTab.saved ? 'text-green-400' : 'text-yellow-400'}>
                    {activeTab.saved ? 'Saved' : 'Unsaved'}
                  </span></div>
                  <div>Execution: <span className={isCurrentLanguageExecutable ? 'text-green-400' : 'text-gray-400'}>
                    {isCurrentLanguageExecutable ? 'Supported' : 'View Only'}
                  </span></div>
                </div>
                
                {!isCurrentLanguageExecutable && (
                  <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <div className="text-xs text-blue-400 font-medium mb-1">How to use {activeTab.language.toUpperCase()}:</div>
                    <div className="text-xs text-gray-300">{getLanguageDescription(activeTab.language)}</div>
                  </div>
                )}
                
                {/* FIXED: Auto-indentation help */}
                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="text-xs text-green-400 font-medium mb-1">Auto-Indentation:</div>
                  <div className="text-xs text-gray-300">
                    • Press <kbd className="bg-gray-700 px-1 rounded">Enter</kbd> for auto-indent<br/>
                    • Press <kbd className="bg-gray-700 px-1 rounded">Tab</kbd> to indent<br/>
                    • Press <kbd className="bg-gray-700 px-1 rounded">Shift+Tab</kbd> to unindent
                  </div>
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
                    {/* FIXED: Show proper save status in tab */}
                    {!activeTab.saved && <div className="w-2 h-2 bg-yellow-400 rounded-full" title="Unsaved changes"></div>}
                    {activeTab.saved && <div className="w-2 h-2 bg-green-400 rounded-full" title="Saved"></div>}
                    {isCurrentLanguageExecutable && <PlayCircle className="w-4 h-4 text-green-400" />}
                  </div>
                </div>

                {/* Code Editor with Auto-Indentation */}
                <div className="relative">
                  <div className="flex bg-gray-900">
                    {/* Line Numbers */}
                    <div 
                      ref={lineNumbersRef}
                      className="flex-shrink-0 w-16 bg-gray-800/50 border-r border-gray-700 py-4 px-2 font-mono text-sm text-gray-500 overflow-hidden select-none user-select-none"
                      style={{ 
                        fontSize: '14px', 
                        lineHeight: '1.5',
                        height: '400px',
                        overflowY: 'hidden',
                        overflowX: 'hidden'
                      }}
                    >
                      <pre 
                        className="whitespace-pre text-right m-0 p-0"
                        style={{ 
                          fontSize: '14px', 
                          lineHeight: '1.5',
                          margin: 0,
                          padding: 0
                        }}
                      >
                        {generateLineNumbers(activeTab.content)}
                      </pre>
                    </div>
                    
                    {/* FIXED: Code Textarea with Auto-Indentation */}
                    <div className="flex-1 relative">
                      <textarea
                        ref={textareaRef}
                        value={activeTab.content}
                        onChange={(e) => handleContentChange(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Write your code here... (Press Enter for auto-indent, Tab to indent)"
                        className="w-full h-96 p-4 resize-none focus:outline-none font-mono bg-gray-900 text-white border-none"
                        style={{ 
                          fontSize: '14px',
                          lineHeight: '1.5',
                          height: '400px',
                          margin: 0,
                          padding: '16px',
                          tabSize: 2
                        }}
                        spellCheck={false}
                      />
                    </div>
                  </div>
                </div>

                {/* Status Bar */}
                <div className="flex items-center justify-between px-4 py-2 bg-gray-800/30 border-t border-gray-700 text-sm text-gray-400">
                  <div className="flex items-center space-x-4">
                    <span>Language: {activeTab.language}</span>
                    <span>Lines: {activeTab.content.split('\n').length}</span>
                    <span>Characters: {activeTab.content.length}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-green-400">✓ Line Numbers Sync</span>
                    <span className="text-blue-400">💾 Auto-Save</span>
                    <span className="text-purple-400">📁 File Upload</span>
                    <span className="text-orange-400">⚡ Auto-Indent</span>
                    <span className={isCurrentLanguageExecutable ? 'text-green-400' : 'text-gray-400'}>
                      {isCurrentLanguageExecutable ? '▶️ Executable' : '👁️ View Only'}
                    </span>
                    {user && <span className="text-yellow-400">🔒 User: {user.role}</span>}
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
                          {isCurrentLanguageExecutable 
                            ? 'Click "Run" to execute your code and see the output here...'
                            : `${activeTab.language.toUpperCase()} files cannot be executed in browser. Download the file to use with appropriate tools.`
                          }
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

