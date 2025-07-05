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
  ChevronDown
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
  html: {
    patterns: [
      /<\/?[a-z][\s\S]*>/i,
      /<!DOCTYPE\s+html>/i,
      /<(html|head|body|div|span|p|a|img|script|style|link|meta)\b/i,
      /<!--[\s\S]*?-->/
    ],
    extensions: ['.html', '.htm'],
    name: 'HTML'
  },
  css: {
    patterns: [
      /\{[\s\S]*?\}/,
      /[a-z-]+\s*:\s*[^;]+;/i,
      /\.([\w-]+)\s*\{/,
      /#[\w-]+\s*\{/,
      /@(media|import|keyframes|font-face)\b/,
      /\/\*[\s\S]*?\*\//
    ],
    extensions: ['.css'],
    name: 'CSS'
  },
  php: {
    patterns: [
      /<\?php/,
      /\$[a-zA-Z_][a-zA-Z0-9_]*/,
      /\b(echo|print|var_dump|isset|empty|array|function|class|public|private|protected)\b/,
      /\b(if|else|elseif|while|for|foreach|switch|case|break|continue|return)\b/,
      /->/,
      /\/\*[\s\S]*?\*\/|\/\/.*$|#.*$/m
    ],
    extensions: ['.php', '.phtml'],
    name: 'PHP'
  },
  cpp: {
    patterns: [
      /#include\s*<[^>]+>/,
      /\b(int|float|double|char|string|bool|void|auto)\b/,
      /\b(cout|cin|endl|std::)\b/,
      /\b(if|else|for|while|switch|case|break|continue|return)\b/,
      /\b(class|public|private|protected|virtual|static)\b/,
      /\/\*[\s\S]*?\*\/|\/\/.*$/m,
      /::/
    ],
    extensions: ['.cpp', '.cc', '.cxx', '.c++', '.c', '.h'],
    name: 'C++'
  },
  java: {
    patterns: [
      /\b(public|private|protected|static|final|abstract|class|interface|extends|implements)\b/,
      /\b(int|float|double|char|String|boolean|void)\b/,
      /\b(if|else|for|while|switch|case|break|continue|return)\b/,
      /\b(System\.out\.println|System\.out\.print)\b/,
      /\b(new|this|super|null|true|false)\b/,
      /\/\*[\s\S]*?\*\/|\/\/.*$/m
    ],
    extensions: ['.java'],
    name: 'Java'
  },
  sql: {
    patterns: [
      /\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|TABLE|DATABASE)\b/i,
      /\b(JOIN|INNER|LEFT|RIGHT|OUTER|ON|GROUP BY|ORDER BY|HAVING|LIMIT)\b/i,
      /\b(AND|OR|NOT|IN|LIKE|BETWEEN|IS|NULL)\b/i,
      /--.*$/m,
      /\/\*[\s\S]*?\*\//
    ],
    extensions: ['.sql'],
    name: 'SQL'
  },
  xml: {
    patterns: [
      /<\?xml[\s\S]*?\?>/,
      /<\/?[a-z][\s\S]*>/i,
      /<!--[\s\S]*?-->/,
      /<!\[CDATA\[[\s\S]*?\]\]>/
    ],
    extensions: ['.xml', '.xsl', '.xsd'],
    name: 'XML'
  },
  json: {
    patterns: [
      /^\s*\{[\s\S]*\}\s*$/,
      /^\s*\[[\s\S]*\]\s*$/,
      /"[^"]*"\s*:\s*("[^"]*"|[0-9]+|true|false|null|\{|\[)/,
      /^\s*"[^"]*"\s*$/
    ],
    extensions: ['.json'],
    name: 'JSON'
  }
}

// Auto-detect language function
const detectLanguage = (code: string): string => {
  if (!code.trim()) return 'javascript'

  const scores: { [key: string]: number } = {}
  
  Object.keys(languagePatterns).forEach(lang => {
    scores[lang] = 0
  })

  Object.entries(languagePatterns).forEach(([lang, config]) => {
    config.patterns.forEach(pattern => {
      const matches = code.match(pattern)
      if (matches) {
        scores[lang] += matches.length
      }
    })
  })

  const detectedLang = Object.entries(scores).reduce((a, b) => 
    scores[a[0]] > scores[b[0]] ? a : b
  )[0]

  return scores[detectedLang] > 0 ? detectedLang : 'javascript'
}

// Get file extension for language
const getFileExtension = (language: string): string => {
  const config = languagePatterns[language as keyof typeof languagePatterns]
  return config ? config.extensions[0] : '.txt'
}

// Detect language from file extension
const detectLanguageFromExtension = (filename: string): string => {
  const ext = '.' + filename.split('.').pop()?.toLowerCase()
  
  for (const [lang, config] of Object.entries(languagePatterns)) {
    if (config.extensions.includes(ext)) {
      return lang
    }
  }
  
  return 'javascript'
}

// Ensure filename has correct extension
const ensureCorrectExtension = (filename: string, language: string): string => {
  const correctExtension = getFileExtension(language)
  const currentExtension = '.' + filename.split('.').pop()?.toLowerCase()
  
  // If filename already has the correct extension, return as is
  if (filename.includes('.') && languagePatterns[language as keyof typeof languagePatterns]?.extensions.includes(currentExtension)) {
    return filename
  }
  
  // If filename has no extension or wrong extension, add/replace with correct one
  const nameWithoutExt = filename.includes('.') ? filename.substring(0, filename.lastIndexOf('.')) : filename
  return nameWithoutExt + correctExtension
}

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
  
  // Tab management
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: '1',
      name: 'untitled.js',
      content: '',
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

  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([])

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Check File System API support
  useEffect(() => {
    setSupportsFileSystemAPI('showDirectoryPicker' in window)
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

  // Auto-save functionality for file system files
  useEffect(() => {
    if (autoSave) {
      const interval = setInterval(async () => {
        const activeTab = getActiveTab()
        if (activeTab.isFromFileSystem && activeTab.fileHandle && !activeTab.saved) {
          await saveFileToSystem(activeTab, true) // true = silent save
        }
      }, 3000) // Auto-save every 3 seconds for file system files

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

  // Open directory picker
  const openDirectory = async () => {
    if (!supportsFileSystemAPI) {
      addNotification('error', 'Browser anda tidak support File System API. Sila guna Chrome 86+ atau Edge 86+')
      return
    }

    try {
      const dirHandle = await (window as any).showDirectoryPicker()
      setCurrentDirectory(dirHandle)
      setDirectoryName(dirHandle.name)
      
      // Load file tree
      const tree = await buildFileTree(dirHandle)
      setFileTree(tree)
      
      addNotification('success', `Folder "${dirHandle.name}" telah dibuka`)
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Error opening directory:', error)
        addNotification('error', 'Gagal membuka folder')
      }
    }
  }

  // Build file tree from directory
  const buildFileTree = async (dirHandle: FileSystemDirectoryHandle): Promise<FileTreeItem[]> => {
    const items: FileTreeItem[] = []
    
    for await (const [name, handle] of dirHandle.entries()) {
      if (handle.kind === 'file') {
        // Only include text files
        const file = await handle.getFile()
        if (isTextFile(file.name)) {
          items.push({
            name,
            type: 'file',
            handle
          })
        }
      } else if (handle.kind === 'directory') {
        const children = await buildFileTree(handle)
        if (children.length > 0) { // Only include directories with text files
          items.push({
            name,
            type: 'directory',
            handle,
            children,
            expanded: false
          })
        }
      }
    }
    
    return items.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'directory' ? -1 : 1
      }
      return a.name.localeCompare(b.name)
    })
  }

  // Check if file is a text file
  const isTextFile = (filename: string): boolean => {
    const textExtensions = ['.js', '.jsx', '.ts', '.tsx', '.html', '.htm', '.css', '.scss', '.sass', '.less', '.php', '.py', '.java', '.cpp', '.c', '.h', '.cs', '.rb', '.go', '.rs', '.swift', '.kt', '.sql', '.xml', '.json', '.yaml', '.yml', '.md', '.txt', '.log', '.ini', '.cfg', '.conf']
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
      console.error('Error opening file:', error)
      addNotification('error', `Gagal membuka file`)
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
      
      // Mark tab as saved
      setTabs(prev => prev.map(t => 
        t.id === tab.id ? { ...t, saved: true } : t
      ))
      
      if (!silent) {
        addNotification('success', `File "${tab.name}" telah disimpan`)
      }
    } catch (error) {
      console.error('Error saving file:', error)
      addNotification('error', `Gagal menyimpan file "${tab.name}"`)
    }
  }

  // Save current tab
  const saveCurrentTab = async () => {
    const activeTab = getActiveTab()
    
    if (activeTab.isFromFileSystem && activeTab.fileHandle) {
      await saveFileToSystem(activeTab)
    } else {
      // For non-file system tabs, use download with correct extension
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
    
    addNotification('success', 'Tab baru telah ditambah')
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
    
    // Ensure filename has correct extension based on detected language
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

  const handleSearch = () => {
    if (!searchTerm || !textareaRef.current) {
      addNotification('error', 'Sila masukkan kata carian')
      return
    }
    
    const textarea = textareaRef.current
    const content = textarea.value
    const index = content.toLowerCase().indexOf(searchTerm.toLowerCase())
    
    if (index !== -1) {
      textarea.focus()
      textarea.setSelectionRange(index, index + searchTerm.length)
      addNotification('success', `Dijumpai: "${searchTerm}"`)
    } else {
      addNotification('info', `Tidak dijumpai: "${searchTerm}"`)
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

  // Render file tree with proper click handlers
  const renderFileTree = (items: FileTreeItem[], depth: number = 0) => {
    return items.map((item) => (
      <div key={item.name} style={{ marginLeft: `${depth * 16}px` }}>
        {item.type === 'directory' ? (
          <button
            onClick={() => toggleDirectory(item)}
            className="flex items-center py-1 text-gray-400 hover:text-white transition-colors duration-300 w-full text-left"
          >
            {item.expanded ? (
              <ChevronDown className="w-4 h-4 mr-1" />
            ) : (
              <ChevronRight className="w-4 h-4 mr-1" />
            )}
            <Folder className="w-4 h-4 mr-2" />
            <span className="text-sm">{item.name}</span>
          </button>
        ) : (
          <button
            onClick={() => openFileFromSystem(item.handle as FileSystemFileHandle)}
            className="flex items-center py-1 text-gray-300 hover:text-electric-blue transition-colors duration-300 w-full text-left cursor-pointer"
          >
            <File className="w-4 h-4 mr-2 ml-5" />
            <span className="text-sm hover:underline">{item.name}</span>
          </button>
        )}
        {item.type === 'directory' && item.expanded && item.children && renderFileTree(item.children, depth + 1)}
      </div>
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black flex items-center justify-center">
        <div className="glass-dark rounded-2xl p-8 text-center">
          <div className="text-2xl text-gradient loading-dots">Memuat playground</div>
        </div>
      </div>
    )
  }

  const activeTab = getActiveTab()

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
            {notification.type === 'info' && <AlertCircle className="w-5 h-5" />}
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
                Editor kod online dengan direct file system access (macam Notepad++)
              </p>
              {!supportsFileSystemAPI && (
                <p className="text-red-400 text-sm mt-1">
                  ⚠️ Browser anda tidak support File System API. Sila guna Chrome 86+ atau Edge 86+
                </p>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors duration-300"
                title="Search & Replace"
              >
                <Search className="w-5 h-5 text-gray-400" />
              </button>
              
              {supportsFileSystemAPI && (
                <button
                  onClick={openDirectory}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:bg-purple-500/30 rounded-lg transition-all duration-300"
                >
                  <HardDrive className="w-4 h-4" />
                  <span>Open Folder</span>
                </button>
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
                  className="px-4 py-2 bg-electric-blue/20 border border-electric-blue/30 text-electric-blue hover:bg-electric-blue/30 rounded transition-all duration-300"
                >
                  Cari
                </button>
                <button
                  onClick={handleReplace}
                  className="px-4 py-2 bg-neon-green/20 border border-neon-green/30 text-neon-green hover:bg-neon-green/30 rounded transition-all duration-300"
                >
                  Ganti Semua
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* File Explorer */}
              {currentDirectory && (
                <div className="glass-dark rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                    <HardDrive className="w-5 h-5 mr-2" />
                    File Explorer
                  </h3>
                  
                  <div className="mb-4 p-3 bg-gray-800/30 rounded-lg">
                    <div className="flex items-center text-electric-blue">
                      <Folder className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">{directoryName}</span>
                    </div>
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto">
                    {fileTree.length > 0 ? (
                      renderFileTree(fileTree)
                    ) : (
                      <div className="text-gray-500 text-sm text-center py-4">
                        Tiada fail text dijumpai dalam folder
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Project Info */}
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
                    {!activeTab.isFromFileSystem && (
                      <div className="text-xs text-gray-500 mt-1">
                        Extension akan auto-adjust berdasarkan bahasa yang didetect
                      </div>
                    )}
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
                    <span className="text-electric-blue text-sm">Tab Baru</span>
                  </button>
                  
                  {supportsFileSystemAPI && (
                    <button
                      onClick={openDirectory}
                      className="w-full flex items-center p-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg transition-colors duration-300"
                    >
                      <HardDrive className="w-4 h-4 text-purple-400 mr-2" />
                      <span className="text-purple-400 text-sm">Open Folder</span>
                    </button>
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
                    title="Tab Baru"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Editor */}
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={activeTab.content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    placeholder={`Mula tulis kod ${languagePatterns[activeTab.language as keyof typeof languagePatterns]?.name || activeTab.language} anda di sini...`}
                    className={`w-full h-96 p-4 resize-none focus:outline-none font-mono ${getThemeClasses()}`}
                    style={{ fontSize: `${fontSize}px` }}
                  />
                  
                  {showLineNumbers && (
                    <div className="absolute left-0 top-0 p-4 text-gray-500 text-sm font-mono pointer-events-none">
                      {activeTab.content.split('\n').map((_, index) => (
                        <div key={index} style={{ fontSize: `${fontSize}px` }}>
                          {index + 1}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Status Bar */}
                <div className="flex items-center justify-between px-4 py-2 bg-gray-800/30 border-t border-gray-700 text-sm text-gray-400">
                  <div className="flex items-center space-x-4">
                    <span>Bahasa: {languagePatterns[activeTab.language as keyof typeof languagePatterns]?.name || activeTab.language}</span>
                    <span>Baris: {activeTab.content.split('\n').length}</span>
                    <span>Aksara: {activeTab.content.length}</span>
                    {activeTab.isFromFileSystem && <span className="text-green-400">📁 File System</span>}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {autoSave && activeTab.isFromFileSystem && <span className="text-green-400">Auto-save: ON</span>}
                    <span>Tema: {theme}</span>
                    {supportsFileSystemAPI && <span className="text-blue-400">FS API: ✓</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

