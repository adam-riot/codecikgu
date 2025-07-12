'use client'

import dynamic from 'next/dynamic'
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })
import { useEffect, useState, useRef } from 'react'
import { Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/utils/supabase'
import { useAutoSave, useKeyboardShortcuts } from '@/hooks/useAutoSave'
import { 
  Code, Play, Download, Save, Plus, X, File, Terminal, CheckCircle, XCircle, Info,
  Folder, Trash2, FolderOpen, PlayCircle, FileText
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

const isExecutableLanguage = (language: string): boolean => {
  return EXECUTABLE_LANGUAGES.includes(language.toLowerCase())
}

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
  if (code.includes('<?php') || code.includes('$') || /\b(echo|print|var_dump)\b/.test(code)) return 'php'
  if (/\b(def|import|print|if __name__|True|False|None)\b/.test(code) || code.includes('print(')) return 'python'
  if (/<html|<head|<body|<div|<span|<!DOCTYPE/.test(code)) return 'html'
  if (/\{[^}]*\}/.test(code) && /[.#][a-zA-Z]/.test(code)) return 'css'
  if (/\b(public class|System\.out\.println|public static void main)\b/.test(code)) return 'java'
  if (/#include|using namespace std|cout|cin/.test(code)) return 'cpp'
  return 'javascript'
}

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

const getUserRole = async (userId: string): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()
    if (error) return 'awam'
    return data?.role || 'awam'
  } catch {
    return 'awam'
  }
}

const saveToLocalStorage = (tabs: Tab[], activeTabId: string) => {
  try {
    const playgroundState = { tabs, activeTabId, timestamp: Date.now() }
    localStorage.setItem('codecikgu_playground_state', JSON.stringify(playgroundState))
  } catch {}
}

const loadFromLocalStorage = (): { tabs: Tab[]; activeTabId: string } | null => {
  try {
    const saved = localStorage.getItem('codecikgu_playground_state')
    if (saved) return JSON.parse(saved)
  } catch {}
  return null
}

// Preview helper
function getPreviewHtml(tab: Tab) {
  if (tab.language === 'html') return tab.content
  if (tab.language === 'css') return `<style>${tab.content}</style><div class="preview-info">CSS dipratonton di sini.</div>`
  if (tab.language === 'javascript') return `<script>${tab.content}<\/script><div class="preview-info">JS dipratonton di sini.</div>`
  return `<div class="preview-info">Preview hanya untuk HTML, CSS, atau JavaScript.</div>`
}

export default function PlaygroundPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: '1',
      name: 'main',
      content: `<?php
// Sambungan ke pangkalan data
include ('db_conn.php');
?>
<style>
#mainbody {
  background-color: #f0f0f0;
  padding: 20px;
  margin: 10px;
}

.container {
  width: 100%;
  max-width: 1200px;
}

#tajuk {
  font-size: 24px;
  color: #333;
  text-align: center;
}
</style>

<script>
function greet(name) {
  if (name) {
    return 'Hello, ' + name + '!';
  } else {
    return 'Hello, World!';
  }
}

console.log(greet('CodeCikgu'));
</script>`,
      language: 'php',
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
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    checkUser()
    loadSavedState()
  }, [])

  useEffect(() => {
    if (user) loadSavedFiles()
  }, [user])

  useEffect(() => {
    if (tabs.length > 0) saveToLocalStorage(tabs, activeTabId)
  }, [tabs, activeTabId])

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
      const { data: { session } } = await supabase.auth.getSession()
      if (session && session.user) {
        const userRole = await getUserRole(session.user.id)
        setUser({ id: session.user.id, email: session.user.email || '', role: userRole })
      }
    } finally {
      setLoading(false)
    }
  }

  const addNotification = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString()
    setNotifications(prev => [...prev, { id, type, message }])
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 5000)
  }

  const getActiveTab = (): Tab => tabs.find(tab => tab.id === activeTabId) || tabs[0]

  const updateTab = (tabId: string, updates: Partial<Tab>) => {
    setTabs(prev => prev.map(tab => 
      tab.id === tabId 
        ? { ...tab, ...updates, saved: updates.saved !== undefined ? updates.saved : false }
        : tab
    ))
  }

  // Auto-save functionality
  useAutoSave({
    data: { tabs, activeTabId },
    saveAction: async () => {
      const currentTab = getActiveTab()
      if (!user || !currentTab.content.trim()) return
      await saveFile()
    },
    delay: 5000, // Auto-save every 5 seconds
    enabled: !!user && !!getActiveTab()?.content?.trim()
  })

  // Keyboard shortcuts
  useKeyboardShortcuts({
    'ctrl+s': () => saveFile(),
    'ctrl+n': () => createNewTab(),
    'ctrl+w': () => closeTab(activeTabId),
    'ctrl+enter': () => executeCode(),
    'ctrl+shift+f': () => setShowFileManager(true),
    'ctrl+shift+p': () => setShowPreview(!showPreview),
    'f9': () => executeCode(),
    'escape': () => {
      setShowFileManager(false)
      setShowPreview(false)
    }
  })

  const handleContentChange = (content: string) => {
    updateTab(activeTabId, { content, saved: false })
    const activeTab = getActiveTab()
    const detectedLang = detectLanguage(content, activeTab.name)
    if (detectedLang !== activeTab.language) {
      updateTab(activeTabId, { language: detectedLang })
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
    if (fileInputRef.current) fileInputRef.current.value = ''
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
          log: (...args: unknown[]) => {
            output.push(args.map(arg => {
              if (typeof arg === 'object') return JSON.stringify(arg, null, 2)
              return String(arg)
            }).join(' '))
          },
          error: (...args: unknown[]) => {
            output.push('ERROR: ' + args.map(arg => String(arg)).join(' '))
          }
        }
        const func = new Function('console', activeTab.content)
        func(safeConsole)
        setExecutionOutput(output.length > 0 ? output.join('\n') : 'Code executed successfully (no output)')
        addNotification('success', 'Code executed successfully')
      } catch (error) {
        setExecutionOutput(`Error: ${(error as Error).message}`)
        addNotification('error', 'Execution failed')
      } finally {
        setIsExecuting(false)
      }
    }
  }

  const downloadFile = async () => {
    const activeTab = getActiveTab()
    const properFileName = getFileExtension(activeTab.name, activeTab.language)
    const fileContent = activeTab.content

    // Try File System Access API (Chromium browsers)
    // @ts-ignore
    if ('showSaveFilePicker' in window) {
      try {
        // @ts-ignore
        const handle = await window.showSaveFilePicker({
          suggestedName: properFileName,
          types: [
            {
              description: 'Text Files',
              accept: { 'text/plain': ['.js', '.php', '.py', '.html', '.css', '.java', '.cpp', '.c', '.ts', '.json', '.xml', '.sql', '.txt'] }
            }
          ]
        })
        const writable = await handle.createWritable()
        await writable.write(fileContent)
        await writable.close()
        addNotification('success', `File saved as ${properFileName}`)
        return
      } catch (err) {
        addNotification('error', 'Save cancelled or failed')
        return
      }
    }

    // Fallback for other browsers
    const blob = new Blob([fileContent], { type: 'text/plain' })
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
        updateTab(activeTabId, { file_id: data.id, saved: true })
        addNotification('success', 'File saved successfully')
      }
      loadSavedFiles()
    } catch {
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
    } catch {}
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
        .eq('user_id', user.id)
      if (error) throw error
      loadSavedFiles()
      addNotification('success', 'File deleted')
    } catch {
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
  const isPreviewable = ['html', 'css', 'javascript'].includes(activeTab.language.toLowerCase())

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
                {isPreviewable && (
                  <button
                    onClick={() => setShowPreview((v) => !v)}
                    className={`flex items-center space-x-2 px-4 py-2 ${showPreview ? 'bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium rounded-lg transition-colors duration-300`}
                  >
                    <Eye className="w-4 h-4" />
                    <span>{showPreview ? 'Hide Preview' : 'Preview'}</span>
                  </button>
                )}
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
                
                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="text-xs text-green-400 font-medium mb-1">Auto-Indentation:</div>
                  <div className="text-xs text-gray-300">
                    • <kbd className="bg-gray-700 px-1 rounded">Enter</kbd> - Auto-indent after {`{`}, {`:`}, selectors<br/>
                    • <kbd className="bg-gray-700 px-1 rounded">Tab</kbd> - Manual indent<br/>
                    • <kbd className="bg-gray-700 px-1 rounded">Shift+Tab</kbd> - Unindent<br/>
                    • Works for CSS, PHP, JS, HTML
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
                    {!activeTab.saved && <div className="w-2 h-2 bg-yellow-400 rounded-full" title="Unsaved changes"></div>}
                    {activeTab.saved && <div className="w-2 h-2 bg-green-400 rounded-full" title="Saved"></div>}
                    {isCurrentLanguageExecutable && <PlayCircle className="w-4 h-4 text-green-400" />}
                  </div>
                </div>

                {/* Code Editor & Preview */}
                <div className="relative">
                  <div className={`flex bg-gray-900 ${showPreview && isPreviewable ? 'flex-col md:flex-row' : ''}`}>
                    {/* Monaco Editor */}
                    <div className={showPreview && isPreviewable ? 'md:w-1/2 w-full' : 'w-full'}>
                      <MonacoEditor
                        height={showPreview && isPreviewable ? "400px" : "400px"}
                        language={activeTab.language}
                        value={activeTab.content}
                        theme="vs-dark"
                        options={{
                          fontSize: 14,
                          minimap: { enabled: false },
                          wordWrap: 'on',
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                          tabSize: 2,
                        }}
                        onChange={(value) => handleContentChange(value || '')}
                      />
                    </div>
                    {/* Live Preview */}
                    {showPreview && isPreviewable && (
                      <div className="md:w-1/2 w-full border-l border-gray-800 bg-white h-[400px] overflow-auto relative">
                        <iframe
                          title="Live Preview"
                          srcDoc={getPreviewHtml(activeTab)}
                          className="w-full h-full"
                          sandbox="allow-scripts allow-same-origin"
                          style={{ background: "#fff" }}
                        />
                        <div className="absolute top-0 right-0 m-2 px-2 py-1 bg-blue-600 text-white text-xs rounded">Preview</div>
                      </div>
                    )}
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
                    <span className="text-orange-400">⚡ Auto Indent</span>
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