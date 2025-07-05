'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, getUserRole, type CustomUser } from '@/utils/supabase'
import { 
  Play, 
  Download, 
  Save, 
  FolderOpen, 
  Plus, 
  X, 
  Settings, 
  FileText,
  Code,
  Palette,
  Search,
  RotateCcw,
  Copy,
  Trash2,
  Check,
  AlertCircle,
  Folder,
  File,
  HardDrive,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Terminal,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react'

// Language detection patterns
const languagePatterns = {
  javascript: {
    patterns: [
      /\b(function|var|let|const|=>|console\.log|document\.|window\.)\b/,
      /\b(if|else|for|while|switch|case|break|continue|return)\b/,
      /\b(true|false|null|undefined)\b/,
      /\/\*[\s\S]*?\*\/|\/\/.*$/m,
      /\$\{.*?\}/,
      /\b(async|await|Promise|fetch)\b/
    ],
    extensions: ['.js', '.mjs', '.jsx'],
    name: 'JavaScript'
  },
  python: {
    patterns: [
      /\b(def|class|import|from|if|elif|else|for|while|try|except|finally|with|as)\b/,
      /\b(print|input|len|range|str|int|float|list|dict|tuple)\b/,
      /\b(True|False|None)\b/,
      /#.*$/m,
      /'''[\s\S]*?'''|"""[\s\S]*?"""/,
      /\bself\b/
    ],
    extensions: ['.py', '.pyw'],
    name: 'Python'
  },
  // ... (more language patterns)
}
// Error detection functions
const detectJavaScriptErrors = (code: string): Array<{line: number, message: string, type: 'error' | 'warning'}> => {
  const errors: Array<{line: number, message: string, type: 'error' | 'warning'}> = []
  const lines = code.split('\n')
  
  try {
    // Try to parse as JavaScript
    new Function(code)
  } catch (error) {
    const errorMessage = (error as Error).message
    const lineMatch = errorMessage.match(/line (\d+)/)
    const lineNumber = lineMatch ? parseInt(lineMatch[1]) : 1
    
    errors.push({
      line: lineNumber,
      message: `JavaScript Error: ${errorMessage}`,
      type: 'error'
    })
  }
  
  // Check for common issues
  lines.forEach((line, index) => {
    const lineNum = index + 1
    
    // Missing semicolons (warning)
    if (line.trim() && !line.trim().endsWith(';') && !line.trim().endsWith('{') && !line.trim().endsWith('}') && !line.includes('//')) {
      if (line.includes('=') || line.includes('console.log') || line.includes('return')) {
        errors.push({
          line: lineNum,
          message: 'Warning: Missing semicolon',
          type: 'warning'
        })
      }
    }
    
    // Undefined variables (basic check)
    const undefinedVarMatch = line.match(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?!\s*[=:])/g)
    if (undefinedVarMatch) {
      undefinedVarMatch.forEach(variable => {
        if (!['console', 'document', 'window', 'alert', 'prompt', 'confirm', 'parseInt', 'parseFloat', 'isNaN', 'undefined', 'null', 'true', 'false'].includes(variable)) {
          // Check if variable is declared in previous lines
          const prevLines = lines.slice(0, index).join('\n')
          if (!prevLines.includes(`var ${variable}`) && !prevLines.includes(`let ${variable}`) && !prevLines.includes(`const ${variable}`) && !prevLines.includes(`function ${variable}`)) {
            errors.push({
              line: lineNum,
              message: `Warning: '${variable}' might be undefined`,
              type: 'warning'
            })
          }
        }
      })
    }
  })
  
  return errors
}

const detectPHPErrors = (code: string): Array<{line: number, message: string, type: 'error' | 'warning'}> => {
  const errors: Array<{line: number, message: string, type: 'error' | 'warning'}> = []
  const lines = code.split('\n')
  
  lines.forEach((line, index) => {
    const lineNum = index + 1
    
    // Missing PHP opening tag
    if (index === 0 && !line.includes('<?php') && line.trim() && !line.startsWith('//') && !line.startsWith('/*')) {
      errors.push({
        line: lineNum,
        message: 'Error: Missing PHP opening tag <?php',
        type: 'error'
      })
    }
    
    // Missing semicolons
    if (line.trim() && !line.trim().endsWith(';') && !line.trim().endsWith('{') && !line.trim().endsWith('}') && !line.includes('//') && !line.includes('<?php')) {
      if (line.includes('=') || line.includes('echo') || line.includes('print') || line.includes('return')) {
        errors.push({
          line: lineNum,
          message: 'Error: Missing semicolon',
          type: 'error'
        })
      }
    }
  })
  
  return errors
}

// Similar functions for HTML, CSS, Python errors...
// Tab interface
interface Tab {
  id: string
  name: string
  content: string
  language: string
  saved: boolean
  fileHandle?: FileSystemFileHandle
  isFromFileSystem: boolean
}

// File tree interface
interface FileTreeItem {
  name: string
  type: 'file' | 'directory'
  handle: FileSystemFileHandle | FileSystemDirectoryHandle
  children?: FileTreeItem[]
  expanded?: boolean
}

// Notification interface
interface Notification {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
}

// Error interface
interface CodeError {
  line: number
  message: string
  type: 'error' | 'warning'
}

export default function PlaygroundPage() {
  const router = useRouter()
  const [user, setUser] = useState<CustomUser | null>(null)
  const [userRole, setUserRole] = useState<string>('awam')
  const [loading, setLoading] = useState(true)
  
  // File System API support check
  const [supportsFileSystemAPI, setSupportsFileSystemAPI] = useState(false)
  
  // Directory and file management
  const [currentDirectory, setCurrentDirectory] = useState<FileSystemDirectoryHandle | null>(null)
  const [fileTree, setFileTree] = useState<FileTreeItem[]>([])
  const [directoryName, setDirectoryName] = useState<string>('')
  const [loadingFiles, setLoadingFiles] = useState(false)
  const [fileCount, setFileCount] = useState(0)
  
  // Tab management
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: '1',
      name: 'untitled.js',
      content: '// Welcome to CodeCikgu Playground!\n// Start typing your code here...\n\nconsole.log("Hello, World!");',
      language: 'javascript',
      saved: false,
      isFromFileSystem: false
    }
  ])
  const [activeTabId, setActiveTabId] = useState('1')
  const [nextTabId, setNextTabId] = useState(2)

  // Editor settings
  const [theme, setTheme] = useState<'dark' | 'light' | 'monokai'>('dark')
  const [fontSize, setFontSize] = useState(14)
  const [showLineNumbers, setShowLineNumbers] = useState(true)
  const [autoSave, setAutoSave] = useState(true)

  // Search & Replace
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [replaceTerm, setReplaceTerm] = useState('')

  // Output panel
  const [showOutput, setShowOutput] = useState(true)
  const [outputContent, setOutputContent] = useState('')
  const [outputErrors, setOutputErrors] = useState<string[]>([])
  const [codeErrors, setCodeErrors] = useState<CodeError[]>([])
  const [isExecuting, setIsExecuting] = useState(false)

  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>()
  const errorCheckTimeoutRef = useRef<NodeJS.Timeout>()
  // Check File System API support
  useEffect(() => {
    setSupportsFileSystemAPI('showDirectoryPicker' in window && 'showOpenFilePicker' in window)
  }, [])

  // Add notification function
  const addNotification = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString()
    const notification: Notification = { id, type, message }
    
    setNotifications(prev => [...prev, notification])
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 3000)
  }

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          const userData = user as CustomUser
          setUser(userData)
          
          const role = await getUserRole(userData)
          setUserRole(role)
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  // Auto-detect language when content changes
  useEffect(() => {
    const activeTab = tabs.find(tab => tab.id === activeTabId)
    if (activeTab && activeTab.content && !activeTab.isFromFileSystem) {
      const detectedLang = detectLanguage(activeTab.content)
      if (detectedLang !== activeTab.language) {
        updateTab(activeTabId, { 
          language: detectedLang,
          name: ensureCorrectExtension(activeTab.name, detectedLang)
        })
      }
    }
  }, [tabs, activeTabId])

  // Error detection when content changes
  useEffect(() => {
    const activeTab = getActiveTab()
    const errors = detectErrors(activeTab.content, activeTab.language)
    setCodeErrors(errors)
  }, [tabs, activeTabId])

  // Auto-save functionality for file system files
  useEffect(() => {
    if (autoSave) {
      const interval = setInterval(async () => {
        const activeTab = getActiveTab()
        if (activeTab.isFromFileSystem && activeTab.fileHandle && !activeTab.saved) {
          await saveFileToSystem(activeTab, true)
        }
      }, 3000)

      return () => clearInterval(interval)
    }
  }, [tabs, activeTabId, autoSave])

  const getActiveTab = (): Tab => {
    return tabs.find(tab => tab.id === activeTabId) || tabs[0]
  }

  const updateTab = (tabId: string, updates: Partial<Tab>) => {
    setTabs(prev => prev.map(tab => 
      tab.id === tabId ? { ...tab, ...updates, saved: false } : tab
    ))
  }

  // Open file picker (individual files)
  const openFiles = async () => {
    if (!supportsFileSystemAPI) {
      addNotification('error', 'Browser anda tidak support File System API. Sila guna Chrome 86+ atau Edge 86+')
      return
    }

    try {
      const fileHandles = await (window as any).showOpenFilePicker({
        multiple: true,
        types: [{
          description: 'Text files',
          accept: {
            'text/*': ['.js', '.jsx', '.ts', '.tsx', '.html', '.htm', '.css', '.scss', '.sass', '.less', '.php', '.py', '.java', '.cpp', '.c', '.h', '.cs', '.rb', '.go', '.rs', '.swift', '.kt', '.sql', '.xml', '.json', '.yaml', '.yml', '.md', '.txt']
          }
        }]
      })

      for (const fileHandle of fileHandles) {
        await openFileFromSystem(fileHandle)
      }
      
      addNotification('success', `${fileHandles.length} file(s) telah dibuka`)
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        addNotification('error', 'Gagal membuka file: ' + (error as Error).message)
      }
    }
  }

  // Open directory picker
  const openDirectory = async () => {
    if (!supportsFileSystemAPI) {
      addNotification('error', 'Browser anda tidak support File System API. Sila guna Chrome 86+ atau Edge 86+')
      return
    }

    try {
      setLoadingFiles(true)
      const dirHandle = await (window as any).showDirectoryPicker()
      setCurrentDirectory(dirHandle)
      setDirectoryName(dirHandle.name)
      
      const tree = await buildFileTree(dirHandle)
      setFileTree(tree)
      
      addNotification('success', `Folder "${dirHandle.name}" telah dibuka (${fileCount} files)`)
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        addNotification('error', 'Gagal membuka folder: ' + (error as Error).message)
      }
    } finally {
      setLoadingFiles(false)
    }
  }
  // Enhanced text file detection
  const isTextFile = (filename: string): boolean => {
    const textExtensions = [
      '.js', '.jsx', '.ts', '.tsx', '.html', '.htm', '.css', '.scss', '.sass', '.less',
      '.php', '.py', '.java', '.cpp', '.c', '.h', '.cs', '.rb', '.go', '.rs', '.swift', '.kt',
      '.sql', '.xml', '.json', '.yaml', '.yml', '.md', '.txt', '.log', '.ini', '.cfg', '.conf',
      '.vue', '.svelte', '.mjs', '.cjs'
    ]
    
    const ext = '.' + filename.split('.').pop()?.toLowerCase()
    return textExtensions.includes(ext)
  }

  // Toggle directory expansion
  const toggleDirectory = (targetItem: FileTreeItem) => {
    const updateTree = (items: FileTreeItem[]): FileTreeItem[] => {
      return items.map(item => {
        if (item === targetItem) {
          return { ...item, expanded: !item.expanded }
        }
        if (item.children) {
          return { ...item, children: updateTree(item.children) }
        }
        return item
      })
    }
    
    setFileTree(updateTree(fileTree))
  }

  // Open file from file system
  const openFileFromSystem = async (fileHandle: FileSystemFileHandle) => {
    try {
      const file = await fileHandle.getFile()
      const content = await file.text()
      const language = detectLanguageFromExtension(file.name)
      
      // Check if file is already open
      const existingTab = tabs.find(tab => tab.fileHandle === fileHandle)
      if (existingTab) {
        setActiveTabId(existingTab.id)
        addNotification('info', `File "${file.name}" sudah dibuka`)
        return
      }
      
      const newTab: Tab = {
        id: nextTabId.toString(),
        name: file.name,
        content,
        language,
        saved: true,
        fileHandle,
        isFromFileSystem: true
      }
      
      setTabs(prev => [...prev, newTab])
      setActiveTabId(newTab.id)
      setNextTabId(prev => prev + 1)
      
      addNotification('success', `File "${file.name}" telah dibuka`)
    } catch (error) {
      addNotification('error', `Gagal membuka file: ${(error as Error).message}`)
    }
  }

  // Save file to file system
  const saveFileToSystem = async (tab: Tab, silent: boolean = false) => {
    if (!tab.fileHandle) {
      addNotification('error', 'Tiada file handle untuk disimpan')
      return
    }

    try {
      const writable = await tab.fileHandle.createWritable()
      await writable.write(tab.content)
      await writable.close()
      
      setTabs(prev => prev.map(t => 
        t.id === tab.id ? { ...t, saved: true } : t
      ))
      
      if (!silent) {
        addNotification('success', `File "${tab.name}" telah disimpan`)
      }
    } catch (error) {
      addNotification('error', `Gagal menyimpan file "${tab.name}"`)
    }
  }

  // Save current tab
  const saveCurrentTab = async () => {
    const activeTab = getActiveTab()
    
    if (activeTab.isFromFileSystem && activeTab.fileHandle) {
      await saveFileToSystem(activeTab)
    } else {
      downloadFile()
    }
  }

  const addNewTab = () => {
    const newTab: Tab = {
      id: nextTabId.toString(),
      name: `untitled${nextTabId}.js`,
      content: '',
      language: 'javascript',
      saved: false,
      isFromFileSystem: false
    }
    
    setTabs(prev => [...prev, newTab])
    setActiveTabId(newTab.id)
    setNextTabId(prev => prev + 1)
    
    addNotification('success', 'New tab telah ditambah')
  }

  const closeTab = (tabId: string) => {
    if (tabs.length === 1) {
      addNotification('info', 'Tidak boleh tutup tab terakhir')
      return
    }
    
    const tabIndex = tabs.findIndex(tab => tab.id === tabId)
    const newTabs = tabs.filter(tab => tab.id !== tabId)
    
    setTabs(newTabs)
    
    if (activeTabId === tabId) {
      const newActiveIndex = Math.min(tabIndex, newTabs.length - 1)
      setActiveTabId(newTabs[newActiveIndex].id)
    }
    
    addNotification('success', 'Tab telah ditutup')
  }

  const handleContentChange = (content: string) => {
    updateTab(activeTabId, { content })
  }

  const downloadFile = () => {
    const activeTab = getActiveTab()
    
    if (!activeTab.content.trim()) {
      addNotification('error', 'Tiada kandungan untuk dimuat turun')
      return
    }
    
    const correctFilename = ensureCorrectExtension(activeTab.name, activeTab.language)
    
    const blob = new Blob([activeTab.content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = correctFilename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    addNotification('success', `File ${correctFilename} telah dimuat turun`)
  }

  // Execute code
  const executeCode = () => {
    const activeTab = getActiveTab()
    
    if (activeTab.language === 'javascript') {
      const result = executeJavaScript(activeTab.content)
      setExecutionOutput(result.output)
      if (result.errors.length > 0) {
        setExecutionOutput(prev => prev + '\n\nErrors:\n' + result.errors.join('\n'))
      }
      setOutputTab('console')
      addNotification('success', 'Kod JavaScript telah dijalankan')
    } else if (activeTab.language === 'html') {
      // For HTML, we'll show a preview
      setOutputTab('preview')
      addNotification('success', 'HTML preview telah dikemaskini')
    } else {
      addNotification('info', `Execution tidak disokong untuk ${activeTab.language}`)
    }
  }
  const handleReplace = () => {
    if (!searchTerm) {
      addNotification('error', 'Sila masukkan kata untuk dicari')
      return
    }
    
    const activeTab = getActiveTab()
    const regex = new RegExp(searchTerm, 'gi')
    const matches = activeTab.content.match(regex)
    
    if (matches) {
      const newContent = activeTab.content.replace(regex, replaceTerm)
      updateTab(activeTabId, { content: newContent })
      addNotification('success', `${matches.length} penggantian dibuat`)
    } else {
      addNotification('info', `Tiada padanan dijumpai untuk "${searchTerm}"`)
    }
  }

  const getThemeClasses = () => {
    switch (theme) {
      case 'light':
        return 'bg-white text-gray-900 border-gray-300'
      case 'monokai':
        return 'bg-gray-900 text-green-400 border-gray-700'
      default:
        return 'bg-gray-800 text-gray-100 border-gray-600'
    }
  }

  // Render file tree
  const renderFileTree = (items: FileTreeItem[], depth: number = 0) => {
    if (!items || items.length === 0) {
      return (
        <div className="text-gray-500 text-sm text-center py-4">
          Tiada fail text dijumpai dalam folder
        </div>
      )
    }

    return items.map((item) => (
      <div key={`${item.name}-${depth}`} style={{ marginLeft: `${depth * 16}px` }}>
        {item.type === 'directory' ? (
          <button
            onClick={() => toggleDirectory(item)}
            className="flex items-center py-2 text-gray-400 hover:text-white transition-colors duration-300 w-full text-left"
          >
            {item.expanded ? (
              <ChevronDown className="w-4 h-4 mr-1" />
            ) : (
              <ChevronRight className="w-4 h-4 mr-1" />
            )}
            <Folder className="w-4 h-4 mr-2" />
            <span className="text-sm">{item.name}</span>
            {item.children && (
              <span className="text-xs text-gray-500 ml-2">({item.children.length})</span>
            )}
          </button>
        ) : (
          <button
            onClick={() => openFileFromSystem(item.handle as FileSystemFileHandle)}
            className="flex items-center py-2 text-gray-300 hover:text-electric-blue transition-colors duration-300 w-full text-left cursor-pointer group"
          >
            <File className="w-4 h-4 mr-2 ml-5" />
            <span className="text-sm group-hover:underline">{item.name}</span>
          </button>
        )}
        {item.type === 'directory' && item.expanded && item.children && renderFileTree(item.children, depth + 1)}
      </div>
    ))
  }

  // Main UI Render
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`flex items-center space-x-2 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${
              notification.type === 'success' 
                ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                : notification.type === 'error'
                ? 'bg-red-500/20 border border-red-500/30 text-red-400'
                : 'bg-blue-500/20 border border-blue-500/30 text-blue-400'
            }`}
          >
            {notification.type === 'success' && <Check className="w-5 h-5" />}
            {notification.type === 'error' && <AlertCircle className="w-5 h-5" />}
            {notification.type === 'info' && <Info className="w-5 h-5" />}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        ))}
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gradient flex items-center">
                <Code className="w-8 h-8 mr-3" />
                CodeCikgu Playground
              </h1>
              <p className="text-gray-400 mt-2">
                Editor kod online dengan auto error detection dan output panel
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors duration-300"
                title="Search & Replace"
              >
                <Search className="w-5 h-5 text-gray-400" />
              </button>
              
              <button
                onClick={executeCode}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 rounded-lg transition-all duration-300"
              >
                <Play className="w-4 h-4" />
                <span>Run</span>
              </button>
              
              {supportsFileSystemAPI && (
                <>
                  <button
                    onClick={openFiles}
                    disabled={loadingFiles}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 rounded-lg transition-all duration-300 disabled:opacity-50"
                  >
                    <File className="w-4 h-4" />
                    <span>Open File</span>
                  </button>
                  
                  <button
                    onClick={openDirectory}
                    disabled={loadingFiles}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:bg-purple-500/30 rounded-lg transition-all duration-300 disabled:opacity-50"
                  >
                    <HardDrive className="w-4 h-4" />
                    <span>{loadingFiles ? 'Loading...' : 'Open Folder'}</span>
                  </button>
                </>
              )}
              
              <button
                onClick={saveCurrentTab}
                className="flex items-center space-x-2 px-4 py-2 bg-neon-green/20 border border-neon-green/30 text-neon-green hover:bg-neon-green/30 rounded-lg transition-all duration-300"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
              
              {!activeTab.isFromFileSystem && (
                <button
                  onClick={downloadFile}
                  className="flex items-center space-x-2 px-4 py-2 bg-electric-blue/20 border border-electric-blue/30 text-electric-blue hover:bg-electric-blue/30 rounded-lg transition-all duration-300"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              )}
            </div>
          </div>

          {/* Search & Replace Panel */}
          {showSearch && (
            <div className="glass-dark rounded-lg p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="text"
                  placeholder="Cari..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-2 bg-gray-800/50 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue"
                />
                <input
                  type="text"
                  placeholder="Ganti dengan..."
                  value={replaceTerm}
                  onChange={(e) => setReplaceTerm(e.target.value)}
                  className="px-3 py-2 bg-gray-800/50 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue"
                />
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 rounded transition-all duration-300"
                >
                  Find
                </button>
                <button
                  onClick={handleReplace}
                  className="px-4 py-2 bg-orange-500/20 border border-orange-500/30 text-orange-400 hover:bg-orange-500/30 rounded transition-all duration-300"
                >
                  Replace All
                </button>
              </div>
            </div>
          )}
          {/* Main Editor Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* File Explorer */}
              {currentDirectory && (
                <div className="glass-dark rounded-xl p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center">
                      <HardDrive className="w-5 h-5 mr-2" />
                      File Explorer
                    </h3>
                    <button
                      onClick={() => {
                        if (currentDirectory) {
                          setLoadingFiles(true)
                          buildFileTree(currentDirectory).then(tree => {
                            setFileTree(tree)
                            setLoadingFiles(false)
                          })
                        }
                      }}
                      disabled={loadingFiles}
                      className="p-1 text-gray-400 hover:text-white transition-colors duration-300 disabled:opacity-50"
                      title="Refresh"
                    >
                      <RefreshCw className={`w-4 h-4 ${loadingFiles ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                  
                  <div className="mb-4 p-3 bg-gray-800/30 rounded-lg">
                    <div className="flex items-center justify-between text-electric-blue">
                      <div className="flex items-center">
                        <Folder className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium">{directoryName}</span>
                      </div>
                      <span className="text-xs text-gray-400">{fileCount} files</span>
                    </div>
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto">
                    {loadingFiles ? (
                      <div className="text-center py-4">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-electric-blue" />
                        <div className="text-sm text-gray-400 mt-2">Loading files...</div>
                      </div>
                    ) : (
                      renderFileTree(fileTree)
                    )}
                  </div>
                </div>
              )}

              {/* Project Info Panel */}
              <div className="glass-dark rounded-xl p-6 mb-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
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
                      disabled={activeTab.isFromFileSystem}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Bahasa (Auto-Detect)</label>
                    <div className="px-3 py-2 bg-gray-800/30 border border-gray-600 rounded text-electric-blue text-sm">
                      {languagePatterns[activeTab.language as keyof typeof languagePatterns]?.name || activeTab.language}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Status</label>
                    <div className={`px-3 py-2 rounded text-sm ${
                      activeTab.isFromFileSystem 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {activeTab.isFromFileSystem ? '🔗 File System' : '📝 Memory'}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Tema</label>
                    <select
                      value={theme}
                      onChange={(e) => setTheme(e.target.value as 'dark' | 'light' | 'monokai')}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-electric-blue"
                    >
                      <option value="dark">Dark</option>
                      <option value="light">Light</option>
                      <option value="monokai">Monokai</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="glass-dark rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Tindakan Pantas</h3>
                
                <div className="space-y-3">
                  <button
                    onClick={addNewTab}
                    className="w-full flex items-center p-3 bg-electric-blue/20 hover:bg-electric-blue/30 border border-electric-blue/30 rounded-lg transition-colors duration-300"
                  >
                    <Plus className="w-4 h-4 text-electric-blue mr-2" />
                    <span className="text-electric-blue text-sm">New Tab</span>
                  </button>
                  
                  {supportsFileSystemAPI && (
                    <>
                      <button
                        onClick={openFiles}
                        disabled={loadingFiles}
                        className="w-full flex items-center p-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg transition-colors duration-300 disabled:opacity-50"
                      >
                        <File className="w-4 h-4 text-blue-400 mr-2" />
                        <span className="text-blue-400 text-sm">Open File</span>
                      </button>
                      
                      <button
                        onClick={openDirectory}
                        disabled={loadingFiles}
                        className="w-full flex items-center p-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg transition-colors duration-300 disabled:opacity-50"
                      >
                        <HardDrive className="w-4 h-4 text-purple-400 mr-2" />
                        <span className="text-purple-400 text-sm">
                          {loadingFiles ? 'Loading...' : 'Open Folder'}
                        </span>
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={saveCurrentTab}
                    className="w-full flex items-center p-3 bg-neon-green/20 hover:bg-neon-green/30 border border-neon-green/30 rounded-lg transition-colors duration-300"
                  >
                    <Save className="w-4 h-4 text-neon-green mr-2" />
                    <span className="text-neon-green text-sm">
                      {activeTab.isFromFileSystem ? 'Save File' : 'Download'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Main Editor */}
            <div className="lg:col-span-3">
              <div className="space-y-6">
                {/* Editor */}
                <div className="glass-dark rounded-xl overflow-hidden">
                  {/* Tab Bar */}
                  <div className="flex items-center bg-gray-800/50 border-b border-gray-700 overflow-x-auto">
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
                        {tab.isFromFileSystem && <HardDrive className="w-3 h-3 text-green-400" />}
                        <span className="text-sm font-medium">{tab.name}</span>
                        {!tab.saved && <div className="w-2 h-2 bg-yellow-400 rounded-full" title="Belum disimpan"></div>}
                        {tabs.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              closeTab(tab.id)
                            }}
                            className="text-gray-500 hover:text-red-400 transition-colors duration-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    
                    <button
                      onClick={addNewTab}
                      className="p-3 text-gray-400 hover:text-white hover:bg-gray-700/30 transition-colors duration-300"
                      title="New Tab"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Code Editor with Line Numbers */}
                  <div className="relative">
                    {showLineNumbers && (
                      <div className="absolute left-0 top-0 p-4 pr-8 text-gray-500 text-sm font-mono pointer-events-none bg-gray-800/30 border-r border-gray-700" style={{ zIndex: 3 }}>
                        {activeTab.content.split('\n').map((_, index) => (
                          <div key={index} style={{ fontSize: `${fontSize}px`, lineHeight: '1.5' }}>
                            {index + 1}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <textarea
                      ref={textareaRef}
                      value={activeTab.content}
                      onChange={(e) => handleContentChange(e.target.value)}
                      placeholder={`Mula tulis kod ${languagePatterns[activeTab.language as keyof typeof languagePatterns]?.name || activeTab.language} anda di sini...`}
                      className={`w-full h-96 p-4 resize-none focus:outline-none font-mono ${getThemeClasses()}`}
                      style={{ 
                        fontSize: `${fontSize}px`,
                        lineHeight: '1.5',
                        paddingLeft: showLineNumbers ? '80px' : '16px'
                      }}
                    />
                  </div>

                  {/* Status Bar */}
                  <div className="flex items-center justify-between px-4 py-2 bg-gray-800/30 border-t border-gray-700 text-sm text-gray-400">
                    <div className="flex items-center space-x-4">
                      <span>Bahasa: {languagePatterns[activeTab.language as keyof typeof languagePatterns]?.name || activeTab.language}</span>
                      <span>Baris: {activeTab.content.split('\n').length}</span>
                      <span>Aksara: {activeTab.content.length}</span>
                      {activeTab.isFromFileSystem && <span className="text-green-400">📁 File System</span>}
                      {codeErrors.length > 0 && (
                        <span className={`${codeErrors.some(e => e.type === 'error') ? 'text-red-400' : 'text-yellow-400'}`}>
                          ⚠️ {codeErrors.length} issues
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {autoSave && activeTab.isFromFileSystem && <span className="text-green-400">Auto-save: ON</span>}
                      <span>Tema: {theme}</span>
                      {supportsFileSystemAPI && <span className="text-blue-400">FS API: ✓</span>}
                    </div>
                  </div>
                </div>

                {/* Output Panel */}
                {showOutput && (
                  <div className="glass-dark rounded-xl overflow-hidden">
                    {/* Output Tab Bar */}
                    <div className="flex items-center bg-gray-800/50 border-b border-gray-700">
                      <button
                        onClick={() => setOutputTab('errors')}
                        className={`flex items-center space-x-2 px-4 py-3 border-r border-gray-700 transition-colors duration-300 ${
                          outputTab === 'errors' 
                            ? 'bg-gray-700/50 text-white' 
                            : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                        }`}
                      >
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-sm">Errors ({codeErrors.length})</span>
                      </button>
                      
                      <button
                        onClick={() => setOutputTab('console')}
                        className={`flex items-center space-x-2 px-4 py-3 border-r border-gray-700 transition-colors duration-300 ${
                          outputTab === 'console' 
                            ? 'bg-gray-700/50 text-white' 
                            : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                        }`}
                      >
                        <Terminal className="w-4 h-4" />
                        <span className="text-sm">Console</span>
                      </button>
                      
                      {activeTab.language === 'html' && (
                        <button
                          onClick={() => setOutputTab('preview')}
                          className={`flex items-center space-x-2 px-4 py-3 border-r border-gray-700 transition-colors duration-300 ${
                            outputTab === 'preview' 
                              ? 'bg-gray-700/50 text-white' 
                              : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                          }`}
                        >
                          <Eye className="w-4 h-4" />
                          <span className="text-sm">Preview</span>
                        </button>
                      )}
                      
                      <div className="flex-1"></div>
                      
                      <button
                        onClick={() => setShowOutput(false)}
                        className="p-3 text-gray-400 hover:text-white transition-colors duration-300"
                        title="Hide Output"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Output Content */}
                    <div className="p-4 h-64 overflow-y-auto bg-gray-900/50">
                      {outputTab === 'errors' && (
                        <div className="space-y-2">
                          {codeErrors.length === 0 ? (
                            <div className="flex items-center text-green-400">
                              <CheckCircle className="w-5 h-5 mr-2" />
                              <span>Tiada error dijumpai!</span>
                            </div>
                          ) : (
                            codeErrors.map((error, index) => (
                              <div
                                key={index}
                                className={`flex items-start space-x-2 p-3 rounded-lg ${
                                  error.type === 'error' 
                                    ? 'bg-red-500/20 border border-red-500/30' 
                                    : 'bg-yellow-500/20 border border-yellow-500/30'
                                }`}
                              >
                                {error.type === 'error' ? (
                                  <XCircle className="w-5 h-5 text-red-400 mt-0.5" />
                                ) : (
                                  <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                                )}
                                <div>
                                  <div className={`font-medium ${error.type === 'error' ? 'text-red-400' : 'text-yellow-400'}`}>
                                    Line {error.line}
                                  </div>
                                  <div className="text-gray-300 text-sm">{error.message}</div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                      
                      {outputTab === 'console' && (
                        <div className="font-mono text-sm">
                          {executionOutput ? (
                            <pre className="text-gray-300 whitespace-pre-wrap">{executionOutput}</pre>
                          ) : (
                            <div className="text-gray-500">
                              Klik "Run" untuk menjalankan kod dan lihat output di sini...
                            </div>
                          )}
                        </div>
                      )}
                      
                      {outputTab === 'preview' && activeTab.language === 'html' && (
                        <div className="w-full h-full">
                          <iframe
                            srcDoc={activeTab.content}
                            className="w-full h-full border border-gray-600 rounded"
                            title="HTML Preview"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Show Output Button */}
                {!showOutput && (
                  <button
                    onClick={() => setShowOutput(true)}
                    className="w-full flex items-center justify-center space-x-2 p-4 bg-gray-800/50 border border-gray-600 rounded-xl hover:bg-gray-800 transition-colors duration-300"
                  >
                    <Terminal className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-400">Show Output Panel</span>
                    {codeErrors.length > 0 && (
                      <span className={`px-2 py-1 rounded text-xs ${
                        codeErrors.some(e => e.type === 'error') 
                          ? 'bg-red-500/20 text-red-400' 
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {codeErrors.length} issues
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
