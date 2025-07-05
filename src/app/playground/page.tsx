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
  Trash2
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
    extensions: ['.cpp', '.cc', '.cxx', '.c++'],
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
  if (!code.trim()) return 'javascript' // Default

  const scores: { [key: string]: number } = {}
  
  // Initialize scores
  Object.keys(languagePatterns).forEach(lang => {
    scores[lang] = 0
  })

  // Check patterns for each language
  Object.entries(languagePatterns).forEach(([lang, config]) => {
    config.patterns.forEach(pattern => {
      const matches = code.match(pattern)
      if (matches) {
        scores[lang] += matches.length
      }
    })
  })

  // Find language with highest score
  const detectedLang = Object.entries(scores).reduce((a, b) => 
    scores[a[0]] > scores[b[0]] ? a : b
  )[0]

  // Return detected language or default to javascript
  return scores[detectedLang] > 0 ? detectedLang : 'javascript'
}

// Get file extension for language
const getFileExtension = (language: string): string => {
  const config = languagePatterns[language as keyof typeof languagePatterns]
  return config ? config.extensions[0] : '.txt'
}

// Tab interface
interface Tab {
  id: string
  name: string
  content: string
  language: string
  saved: boolean
}

export default function PlaygroundPage() {
  const router = useRouter()
  const [user, setUser] = useState<CustomUser | null>(null)
  const [userRole, setUserRole] = useState<string>('awam')
  const [loading, setLoading] = useState(true)
  
  // Tab management
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: '1',
      name: 'untitled.js',
      content: '',
      language: 'javascript',
      saved: false
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

  const textareaRef = useRef<HTMLTextAreaElement>(null)

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
    if (activeTab && activeTab.content) {
      const detectedLang = detectLanguage(activeTab.content)
      if (detectedLang !== activeTab.language) {
        updateTab(activeTabId, { 
          language: detectedLang,
          name: activeTab.name.replace(/\.[^.]*$/, getFileExtension(detectedLang))
        })
      }
    }
  }, [tabs, activeTabId])

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && user) {
      const interval = setInterval(() => {
        saveToLocalStorage()
      }, 5000) // Auto-save every 5 seconds

      return () => clearInterval(interval)
    }
  }, [tabs, autoSave, user])

  const getActiveTab = (): Tab => {
    return tabs.find(tab => tab.id === activeTabId) || tabs[0]
  }

  const updateTab = (tabId: string, updates: Partial<Tab>) => {
    setTabs(prev => prev.map(tab => 
      tab.id === tabId ? { ...tab, ...updates, saved: false } : tab
    ))
  }

  const addNewTab = () => {
    const newTab: Tab = {
      id: nextTabId.toString(),
      name: `untitled${nextTabId}.js`,
      content: '',
      language: 'javascript',
      saved: false
    }
    
    setTabs(prev => [...prev, newTab])
    setActiveTabId(newTab.id)
    setNextTabId(prev => prev + 1)
  }

  const closeTab = (tabId: string) => {
    if (tabs.length === 1) return // Don't close last tab
    
    const tabIndex = tabs.findIndex(tab => tab.id === tabId)
    const newTabs = tabs.filter(tab => tab.id !== tabId)
    
    setTabs(newTabs)
    
    // Switch to adjacent tab
    if (activeTabId === tabId) {
      const newActiveIndex = Math.min(tabIndex, newTabs.length - 1)
      setActiveTabId(newTabs[newActiveIndex].id)
    }
  }

  const handleContentChange = (content: string) => {
    updateTab(activeTabId, { content })
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
  }

  const saveToLocalStorage = () => {
    if (user) {
      localStorage.setItem(`codecikgu_playground_${user.id}`, JSON.stringify({
        tabs,
        activeTabId,
        theme,
        fontSize,
        showLineNumbers,
        autoSave
      }))
    }
  }

  const loadFromLocalStorage = () => {
    if (user) {
      const saved = localStorage.getItem(`codecikgu_playground_${user.id}`)
      if (saved) {
        try {
          const data = JSON.parse(saved)
          setTabs(data.tabs || tabs)
          setActiveTabId(data.activeTabId || activeTabId)
          setTheme(data.theme || theme)
          setFontSize(data.fontSize || fontSize)
          setShowLineNumbers(data.showLineNumbers ?? showLineNumbers)
          setAutoSave(data.autoSave ?? autoSave)
        } catch (error) {
          console.error('Error loading saved data:', error)
        }
      }
    }
  }

  const handleSearch = () => {
    if (!searchTerm || !textareaRef.current) return
    
    const textarea = textareaRef.current
    const content = textarea.value
    const index = content.toLowerCase().indexOf(searchTerm.toLowerCase())
    
    if (index !== -1) {
      textarea.focus()
      textarea.setSelectionRange(index, index + searchTerm.length)
    }
  }

  const handleReplace = () => {
    const activeTab = getActiveTab()
    const newContent = activeTab.content.replace(new RegExp(searchTerm, 'gi'), replaceTerm)
    updateTab(activeTabId, { content: newContent })
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
                Editor kod online dengan auto-detect bahasa dan multi-tab support
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
                onClick={downloadFile}
                className="flex items-center space-x-2 px-4 py-2 bg-neon-green/20 border border-neon-green/30 text-neon-green hover:bg-neon-green/30 rounded-lg transition-all duration-300"
              >
                <Download className="w-4 h-4" />
                <span>Muat Turun</span>
              </button>
              
              {user && (
                <button
                  onClick={saveToLocalStorage}
                  className="flex items-center space-x-2 px-4 py-2 bg-electric-blue/20 border border-electric-blue/30 text-electric-blue hover:bg-electric-blue/30 rounded-lg transition-all duration-300"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan</span>
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
              <div className="glass-dark rounded-xl p-6 mb-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Maklumat Projek
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
                    <div className="px-3 py-2 bg-gray-800/30 border border-gray-600 rounded text-electric-blue text-sm">
                      {languagePatterns[activeTab.language as keyof typeof languagePatterns]?.name || activeTab.language}
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
                  
                  <button
                    onClick={downloadFile}
                    className="w-full flex items-center p-3 bg-neon-green/20 hover:bg-neon-green/30 border border-neon-green/30 rounded-lg transition-colors duration-300"
                  >
                    <Download className="w-4 h-4 text-neon-green mr-2" />
                    <span className="text-neon-green text-sm">Muat Turun</span>
                  </button>
                  
                  {user && (
                    <>
                      <button
                        onClick={saveToLocalStorage}
                        className="w-full flex items-center p-3 bg-neon-cyan/20 hover:bg-neon-cyan/30 border border-neon-cyan/30 rounded-lg transition-colors duration-300"
                      >
                        <Save className="w-4 h-4 text-neon-cyan mr-2" />
                        <span className="text-neon-cyan text-sm">Simpan Projek</span>
                      </button>
                      
                      <button
                        onClick={loadFromLocalStorage}
                        className="w-full flex items-center p-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg transition-colors duration-300"
                      >
                        <FolderOpen className="w-4 h-4 text-purple-400 mr-2" />
                        <span className="text-purple-400 text-sm">Buka Projek</span>
                      </button>
                    </>
                  )}
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
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {autoSave && user && <span className="text-green-400">Auto-save: ON</span>}
                    <span>Tema: {theme}</span>
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

