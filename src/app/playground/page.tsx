'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, getUserRole, type CustomUser } from '@/utils/supabase'
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
  HardDrive, 
  FileText, 
  Settings, 
  Eye, 
  Terminal, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Info, 
  Check, 
  ChevronDown, 
  ChevronRight, 
  RefreshCw 
} from 'lucide-react'

// Types
interface Tab {
  id: string
  name: string
  content: string
  language: string
  saved: boolean
  fileHandle?: FileSystemFileHandle
  isFromFileSystem?: boolean
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

interface FileTreeItem {
  name: string
  type: 'file' | 'directory'
  handle: FileSystemFileHandle | FileSystemDirectoryHandle
  children?: FileTreeItem[]
  expanded?: boolean
}

// Syntax highlighting patterns and themes
const syntaxPatterns = {
  javascript: {
    keywords: /\b(const|let|var|function|if|else|for|while|return|class|import|export|from|default|async|await|try|catch|finally|throw|new|this|super|extends|static|public|private|protected)\b/g,
    strings: /(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g,
    comments: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
    numbers: /\b\d+(\.\d+)?\b/g,
    operators: /[+\-*/%=<>!&|^~?:]/g,
    brackets: /[(){}[\]]/g,
    functions: /\b(\w+)(?=\s*\()/g
  },
  html: {
    tags: /<\/?[\w\s="/.':;#-\/\?]+>/g,
    attributes: /\s(\w+)(?==)/g,
    strings: /(["'])((?:\\.|(?!\1)[^\\])*?)\1/g,
    comments: /<!--[\s\S]*?-->/g,
    doctype: /<!DOCTYPE[^>]*>/gi
  },
  css: {
    selectors: /^[^{]+(?={)/gm,
    properties: /\b[\w-]+(?=\s*:)/g,
    values: /:\s*([^;]+)/g,
    strings: /(["'])((?:\\.|(?!\1)[^\\])*?)\1/g,
    comments: /(\/\*[\s\S]*?\*\/)/g,
    units: /\b\d+(\.\d+)?(px|em|rem|%|vh|vw|pt|pc|in|cm|mm|ex|ch|vmin|vmax|deg|rad|turn|s|ms|Hz|kHz|dpi|dpcm|dppx)\b/g
  },
  php: {
    tags: /<\?php|\?>/g,
    keywords: /\b(echo|print|if|else|elseif|endif|while|endwhile|for|endfor|foreach|endforeach|function|class|public|private|protected|static|const|var|return|include|require|include_once|require_once|new|this|parent|self|extends|implements|interface|abstract|final|try|catch|throw|namespace|use|as)\b/g,
    variables: /\$\w+/g,
    strings: /(["'])((?:\\.|(?!\1)[^\\])*?)\1/g,
    comments: /(\/\/.*$|\/\*[\s\S]*?\*\/|#.*$)/gm,
    numbers: /\b\d+(\.\d+)?\b/g
  },
  python: {
    keywords: /\b(def|class|if|elif|else|for|while|in|not|and|or|is|import|from|as|return|yield|lambda|try|except|finally|raise|with|pass|break|continue|global|nonlocal|True|False|None)\b/g,
    strings: /(["'])((?:\\.|(?!\1)[^\\])*?)\1|"""[\s\S]*?"""|'''[\s\S]*?'''/g,
    comments: /#.*$/gm,
    numbers: /\b\d+(\.\d+)?\b/g,
    decorators: /@\w+/g,
    functions: /\bdef\s+(\w+)/g
  },
  java: {
    keywords: /\b(public|private|protected|static|final|abstract|class|interface|extends|implements|import|package|if|else|for|while|do|switch|case|default|break|continue|return|try|catch|finally|throw|throws|new|this|super|void|int|double|float|long|short|byte|char|boolean|String)\b/g,
    strings: /(["'])((?:\\.|(?!\1)[^\\])*?)\1/g,
    comments: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
    numbers: /\b\d+(\.\d+)?[fFdDlL]?\b/g,
    annotations: /@\w+/g
  },
  cpp: {
    keywords: /\b(int|double|float|char|bool|void|const|static|public|private|protected|class|struct|namespace|using|include|define|if|else|for|while|do|switch|case|default|break|continue|return|try|catch|throw|new|delete|this|virtual|override|template|typename)\b/g,
    preprocessor: /#\w+/g,
    strings: /(["'])((?:\\.|(?!\1)[^\\])*?)\1/g,
    comments: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
    numbers: /\b\d+(\.\d+)?[fFlL]?\b/g,
    operators: /[+\-*/%=<>!&|^~?:]/g
  }
}

const themes = {
  dark: {
    background: '#1a1a1a',
    text: '#e5e5e5',
    keyword: '#569cd6',
    string: '#ce9178',
    comment: '#6a9955',
    number: '#b5cea8',
    operator: '#d4d4d4',
    bracket: '#ffd700',
    function: '#dcdcaa',
    tag: '#569cd6',
    attribute: '#92c5f8',
    lineNumber: '#858585'
  },
  light: {
    background: '#ffffff',
    text: '#000000',
    keyword: '#0000ff',
    string: '#a31515',
    comment: '#008000',
    number: '#098658',
    operator: '#000000',
    bracket: '#0431fa',
    function: '#795e26',
    tag: '#800000',
    attribute: '#ff0000',
    lineNumber: '#237893'
  },
  monokai: {
    background: '#272822',
    text: '#f8f8f2',
    keyword: '#f92672',
    string: '#e6db74',
    comment: '#75715e',
    number: '#ae81ff',
    operator: '#f8f8f2',
    bracket: '#f8f8f2',
    function: '#a6e22e',
    tag: '#f92672',
    attribute: '#a6e22e',
    lineNumber: '#90908a'
  }
}

// Language detection patterns
const languagePatterns = {
  javascript: {
    name: 'JavaScript',
    extensions: ['.js', '.jsx', '.mjs', '.cjs'],
    patterns: [
      /console\.log\s*\(/,
      /function\s+\w+\s*\(/,
      /const\s+\w+\s*=/,
      /let\s+\w+\s*=/,
      /var\s+\w+\s*=/,
      /=>\s*{/,
      /import\s+.*from/,
      /export\s+(default\s+)?/
    ]
  },
  html: {
    name: 'HTML',
    extensions: ['.html', '.htm'],
    patterns: [
      /<html/i,
      /<head/i,
      /<body/i,
      /<div/i,
      /<p>/i,
      /<h[1-6]/i,
      /<script/i,
      /<style/i,
      /<!DOCTYPE/i
    ]
  },
  css: {
    name: 'CSS',
    extensions: ['.css', '.scss', '.sass'],
    patterns: [
      /\w+\s*{[^}]*}/,
      /@media\s*\(/,
      /@import/,
      /:\s*#[0-9a-fA-F]{3,6}/,
      /font-family:/,
      /background-color:/,
      /margin:/,
      /padding:/
    ]
  },
  php: {
    name: 'PHP',
    extensions: ['.php'],
    patterns: [
      /<\?php/,
      /\$\w+/,
      /echo\s+/,
      /function\s+\w+\s*\(/,
      /class\s+\w+/,
      /include\s+/,
      /require\s+/
    ]
  },
  python: {
    name: 'Python',
    extensions: ['.py'],
    patterns: [
      /def\s+\w+\s*\(/,
      /class\s+\w+/,
      /import\s+\w+/,
      /from\s+\w+\s+import/,
      /print\s*\(/,
      /if\s+__name__\s*==\s*['"']__main__['"']/,
      /:\s*$/m
    ]
  },
  java: {
    name: 'Java',
    extensions: ['.java'],
    patterns: [
      /public\s+class\s+\w+/,
      /public\s+static\s+void\s+main/,
      /System\.out\.print/,
      /import\s+java\./,
      /public\s+\w+\s+\w+\s*\(/
    ]
  },
  cpp: {
    name: 'C++',
    extensions: ['.cpp', '.cc', '.cxx'],
    patterns: [
      /#include\s*<.*>/,
      /using\s+namespace\s+std/,
      /int\s+main\s*\(/,
      /cout\s*<</, 
      /cin\s*>>/,
      /std::/
    ]
  }
}

// Syntax highlighting function
const applySyntaxHighlighting = (code: string, language: string, theme: keyof typeof themes): string => {
  if (!code) return ''
  
  const patterns = syntaxPatterns[language as keyof typeof syntaxPatterns]
  const themeColors = themes[theme]
  
  if (!patterns) return code
  
  let highlightedCode = code
  
  // Apply syntax highlighting based on language
  if (language === 'javascript') {
    highlightedCode = highlightedCode
      .replace(patterns.comments, `<span style="color: ${themeColors.comment};">$&</span>`)
      .replace(patterns.strings, `<span style="color: ${themeColors.string};">$&</span>`)
      .replace(patterns.keywords, `<span style="color: ${themeColors.keyword}; font-weight: bold;">$&</span>`)
      .replace(patterns.numbers, `<span style="color: ${themeColors.number};">$&</span>`)
      .replace(patterns.functions, `<span style="color: ${themeColors.function};">$1</span>`)
      .replace(patterns.operators, `<span style="color: ${themeColors.operator};">$&</span>`)
      .replace(patterns.brackets, `<span style="color: ${themeColors.bracket};">$&</span>`)
  } else if (language === 'html') {
    highlightedCode = highlightedCode
      .replace(patterns.comments, `<span style="color: ${themeColors.comment};">$&</span>`)
      .replace(patterns.doctype, `<span style="color: ${themeColors.keyword}; font-weight: bold;">$&</span>`)
      .replace(patterns.tags, `<span style="color: ${themeColors.tag};">$&</span>`)
      .replace(patterns.strings, `<span style="color: ${themeColors.string};">$&</span>`)
  } else if (language === 'css') {
    highlightedCode = highlightedCode
      .replace(patterns.comments, `<span style="color: ${themeColors.comment};">$&</span>`)
      .replace(patterns.selectors, `<span style="color: ${themeColors.tag};">$&</span>`)
      .replace(patterns.properties, `<span style="color: ${themeColors.keyword};">$&</span>`)
      .replace(patterns.strings, `<span style="color: ${themeColors.string};">$&</span>`)
      .replace(patterns.units, `<span style="color: ${themeColors.number};">$&</span>`)
  } else if (language === 'php') {
    highlightedCode = highlightedCode
      .replace(patterns.comments, `<span style="color: ${themeColors.comment};">$&</span>`)
      .replace(patterns.strings, `<span style="color: ${themeColors.string};">$&</span>`)
      .replace(patterns.tags, `<span style="color: ${themeColors.tag}; font-weight: bold;">$&</span>`)
      .replace(patterns.keywords, `<span style="color: ${themeColors.keyword}; font-weight: bold;">$&</span>`)
      .replace(patterns.variables, `<span style="color: ${themeColors.function};">$&</span>`)
      .replace(patterns.numbers, `<span style="color: ${themeColors.number};">$&</span>`)
  } else if (language === 'python') {
    highlightedCode = highlightedCode
      .replace(patterns.comments, `<span style="color: ${themeColors.comment};">$&</span>`)
      .replace(patterns.strings, `<span style="color: ${themeColors.string};">$&</span>`)
      .replace(patterns.keywords, `<span style="color: ${themeColors.keyword}; font-weight: bold;">$&</span>`)
      .replace(patterns.decorators, `<span style="color: ${themeColors.function};">$&</span>`)
      .replace(patterns.numbers, `<span style="color: ${themeColors.number};">$&</span>`)
  }
  
  return highlightedCode
}

// Auto-detect language from content
const detectLanguage = (content: string, filename: string): string => {
  // First try to detect by file extension
  const extension = '.' + filename.split('.').pop()?.toLowerCase()
  
  for (const [lang, config] of Object.entries(languagePatterns)) {
    if (config.extensions.includes(extension)) {
      return lang
    }
  }
  
  // If no extension match, try pattern matching
  let bestMatch = 'javascript'
  let maxMatches = 0
  
  for (const [lang, config] of Object.entries(languagePatterns)) {
    const matches = config.patterns.filter(pattern => pattern.test(content)).length
    if (matches > maxMatches) {
      maxMatches = matches
      bestMatch = lang
    }
  }
  
  return bestMatch
}

// Get correct file extension for language
const getExtensionForLanguage = (language: string): string => {
  const extensions = {
    javascript: '.js',
    html: '.html',
    css: '.css',
    php: '.php',
    python: '.py',
    java: '.java',
    cpp: '.cpp',
    sql: '.sql',
    xml: '.xml',
    json: '.json'
  }
  
  return extensions[language as keyof typeof extensions] || '.txt'
}

// Ensure filename has correct extension
const ensureCorrectExtension = (filename: string, language: string): string => {
  const correctExtension = getExtensionForLanguage(language)
  const currentExtension = '.' + filename.split('.').pop()?.toLowerCase()
  
  if (currentExtension === correctExtension) {
    return filename
  }
  
  // Remove current extension and add correct one
  const nameWithoutExtension = filename.replace(/\.[^/.]+$/, '')
  return nameWithoutExtension + correctExtension
}

// Code validation
const validateCode = (code: string, language: string): CodeError[] => {
  const errors: CodeError[] = []
  const lines = code.split('\n')
  
  if (language === 'javascript') {
    lines.forEach((line, index) => {
      // Check for common syntax errors
      if (line.includes('console.log') && !line.includes('(') && !line.includes(')')) {
        errors.push({
          line: index + 1,
          message: 'Missing parentheses in console.log',
          type: 'error'
        })
      }
      
      // Check for missing semicolons (warning)
      if (line.trim() && !line.trim().endsWith(';') && !line.trim().endsWith('{') && !line.trim().endsWith('}') && !line.includes('//')) {
        errors.push({
          line: index + 1,
          message: 'Missing semicolon',
          type: 'warning'
        })
      }
    })
  }
  
  if (language === 'html') {
    const openTags: string[] = []
    lines.forEach((line, index) => {
      const tagMatches = line.match(/<(\/?)([\w]+)[^>]*>/g)
      if (tagMatches) {
        tagMatches.forEach(tag => {
          const isClosing = tag.startsWith('</')
          const isSelfClosing = tag.endsWith('/>')
          const tagName = tag.match(/<\/?(\w+)/)?.[1]
          
          if (tagName && !isSelfClosing) {
            if (isClosing) {
              const lastOpenTag = openTags.pop()
              if (lastOpenTag !== tagName) {
                errors.push({
                  line: index + 1,
                  message: `Mismatched closing tag: expected ${lastOpenTag}, found ${tagName}`,
                  type: 'error'
                })
              }
            } else {
              openTags.push(tagName)
            }
          }
        })
      }
    })
    
    // Check for unclosed tags
    openTags.forEach(tagName => {
      if (tagName) {
        errors.push({
          line: lines.length,
          message: `Possible unclosed tag: ${tagName}`,
          type: 'warning'
        })
      }
    })
  }
  
  return errors
}

const executeJavaScript = (code: string) => {
  const output: string[] = []
  const errors: string[] = []
  
  // Create a safe console object
  const safeConsole = {
    log: (...args: any[]) => {
      output.push(args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' '))
    },
    error: (...args: any[]) => {
      errors.push(args.map(arg => String(arg)).join(' '))
    },
    warn: (...args: any[]) => {
      output.push('⚠️ ' + args.map(arg => String(arg)).join(' '))
    }
  }
  
  try {
    // Create a function with the code and safe console
    const func = new Function('console', code)
    func(safeConsole)
  } catch (error) {
    errors.push(`Runtime Error: ${(error as Error).message}`)
  }
  
  return {
    output: output.join('\n'),
    errors
  }
}

// Build file tree from directory handle
const buildFileTree = async (dirHandle: FileSystemDirectoryHandle): Promise<FileTreeItem[]> => {
  const items: FileTreeItem[] = []
  
  try {
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
        if (children.length > 0) {
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
  } catch (error) {
    console.error('Error building file tree:', error)
  }
  
  return items.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'directory' ? -1 : 1
    }
    return a.name.localeCompare(b.name)
  })
}

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

export default function PlaygroundPage() {
  const router = useRouter()
  const [user, setUser] = useState<CustomUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: '1',
      name: 'main.js',
      content: `// Welcome to CodeCikgu Playground!
// Write your JavaScript code here

console.log('Hello, World!');

// Example: Simple function
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet('CodeCikgu'));`,
      language: 'javascript',
      saved: false,
      isFromFileSystem: false
    }
  ])
  const [activeTabId, setActiveTabId] = useState('1')
  const [nextTabId, setNextTabId] = useState(2)
  const [theme, setTheme] = useState<'dark' | 'light' | 'monokai'>('dark')
  const [fontSize, setFontSize] = useState(14)
  const [showLineNumbers, setShowLineNumbers] = useState(true)
  const [autoSave, setAutoSave] = useState(true)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [replaceTerm, setReplaceTerm] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [codeErrors, setCodeErrors] = useState<CodeError[]>([])
  const [executionOutput, setExecutionOutput] = useState('')
  const [showOutput, setShowOutput] = useState(false)
  const [outputTab, setOutputTab] = useState<'errors' | 'console' | 'preview'>('errors')
  const [fileTree, setFileTree] = useState<FileTreeItem[]>([])
  const [loadingFiles, setLoadingFiles] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const highlightRef = useRef<HTMLDivElement>(null)

  // Check if File System Access API is supported
  const supportsFileSystemAPI = typeof window !== 'undefined' && 'showOpenFilePicker' in window

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const userRole = await getUserRole(session.user.id)
        setUser({
          ...session.user,
          role: userRole
        })
      }
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  // Auto-save functionality
  useEffect(() => {
    if (autoSave) {
      const interval = setInterval(() => {
        const activeTab = getActiveTab()
        if (activeTab.isFromFileSystem && activeTab.fileHandle) {
          saveToFileSystem(activeTab.fileHandle, activeTab.content)
        }
      }, 5000) // Auto-save every 5 seconds
      
      return () => clearInterval(interval)
    }
  }, [autoSave, tabs, activeTabId])

  // Validate code when content changes
  useEffect(() => {
    const activeTab = getActiveTab()
    const errors = validateCode(activeTab.content, activeTab.language)
    setCodeErrors(errors)
  }, [tabs, activeTabId])

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

  const getThemeClasses = () => {
    const themeColors = themes[theme]
    return {
      backgroundColor: themeColors.background,
      color: themeColors.text,
      caretColor: themeColors.text
    }
  }

  const saveToFileSystem = async (fileHandle: FileSystemFileHandle, content: string) => {
    try {
      const writable = await fileHandle.createWritable()
      await writable.write(content)
      await writable.close()
      
      // Mark tab as saved
      const tabId = tabs.find(tab => tab.fileHandle === fileHandle)?.id
      if (tabId) {
        setTabs(prev => prev.map(tab => 
          tab.id === tabId ? { ...tab, saved: true } : tab
        ))
      }
    } catch (error) {
      console.error('Error saving file:', error)
      addNotification('error', 'Gagal menyimpan file')
    }
  }

  const openFiles = async () => {
    if (!supportsFileSystemAPI) {
      addNotification('error', 'File System API tidak disokong dalam browser ini')
      return
    }
    
    setLoadingFiles(true)
    
    try {
      const fileHandles = await (window as any).showOpenFilePicker({
        multiple: true,
        types: [{
          description: 'Text files',
          accept: {
            'text/*': ['.js', '.jsx', '.ts', '.tsx', '.html', '.htm', '.css', '.scss', '.sass', '.php', '.py', '.java', '.cpp', '.c', '.h', '.sql', '.xml', '.json', '.md', '.txt']
          }
        }]
      })
      
      for (const fileHandle of fileHandles) {
        const file = await fileHandle.getFile()
        const content = await file.text()
        const language = detectLanguage(content, file.name)
        
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
        setNextTabId(prev => prev + 1)
      }
      
      addNotification('success', `${fileHandles.length} file(s) telah dibuka`)
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Error opening files:', error)
        addNotification('error', 'Gagal membuka file')
      }
    } finally {
      setLoadingFiles(false)
    }
  }

  const openDirectory = async () => {
    if (!supportsFileSystemAPI) {
      addNotification('error', 'File System API tidak disokong dalam browser ini')
      return
    }
    
    setLoadingFiles(true)
    
    try {
      const dirHandle = await (window as any).showDirectoryPicker()
      const tree = await buildFileTree(dirHandle)
      setFileTree(tree)
      addNotification('success', 'Folder telah dibuka')
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Error opening directory:', error)
        addNotification('error', 'Gagal membuka folder')
      }
    } finally {
      setLoadingFiles(false)
    }
  }

  const openFileFromTree = async (item: FileTreeItem) => {
    if (item.type === 'file') {
      try {
        const file = await (item.handle as FileSystemFileHandle).getFile()
        const content = await file.text()
        const language = detectLanguage(content, file.name)
        
        // Check if file is already open
        const existingTab = tabs.find(tab => tab.name === file.name && tab.isFromFileSystem)
        if (existingTab) {
          setActiveTabId(existingTab.id)
          addNotification('info', 'File sudah dibuka')
          return
        }
        
        const newTab: Tab = {
          id: nextTabId.toString(),
          name: file.name,
          content,
          language,
          saved: true,
          fileHandle: item.handle as FileSystemFileHandle,
          isFromFileSystem: true
        }
        
        setTabs(prev => [...prev, newTab])
        setActiveTabId(newTab.id)
        setNextTabId(prev => prev + 1)
        
        addNotification('success', `File ${file.name} telah dibuka`)
      } catch (error) {
        console.error('Error opening file from tree:', error)
        addNotification('error', 'Gagal membuka file')
      }
    }
  }

  const toggleTreeItem = (item: FileTreeItem) => {
    if (item.type === 'directory') {
      setFileTree(prev => updateTreeItemExpansion(prev, item, !item.expanded))
    }
  }

  const updateTreeItemExpansion = (tree: FileTreeItem[], targetItem: FileTreeItem, expanded: boolean): FileTreeItem[] => {
    return tree.map(item => {
      if (item === targetItem) {
        return { ...item, expanded }
      }
      if (item.children) {
        return { ...item, children: updateTreeItemExpansion(item.children, targetItem, expanded) }
      }
      return item
    })
  }

  const saveCurrentTab = async () => {
    const activeTab = getActiveTab()
    
    if (activeTab.isFromFileSystem && activeTab.fileHandle) {
      await saveToFileSystem(activeTab.fileHandle, activeTab.content)
      addNotification('success', 'File telah disimpan')
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
    const currentActiveTab = getActiveTab()
    
    if (!currentActiveTab.content.trim()) {
      addNotification('error', 'Tiada kandungan untuk dimuat turun')
      return
    }
    
    const correctFilename = ensureCorrectExtension(currentActiveTab.name, currentActiveTab.language)
    
    const blob = new Blob([currentActiveTab.content], { type: 'text/plain' })
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
    const currentActiveTab = getActiveTab()
    
    if (currentActiveTab.language === 'javascript') {
      const result = executeJavaScript(currentActiveTab.content)
      setExecutionOutput(result.output)
      if (result.errors.length > 0) {
        setExecutionOutput(prev => prev + '\n\nErrors:\n' + result.errors.join('\n'))
      }
      setOutputTab('console')
      setShowOutput(true)
      addNotification('success', 'Kod JavaScript telah dijalankan')
    } else if (currentActiveTab.language === 'html') {
      // For HTML, we'll show a preview
      setOutputTab('preview')
      setShowOutput(true)
      addNotification('success', 'HTML preview telah dikemaskini')
    } else {
      addNotification('info', `Execution tidak disokong untuk ${currentActiveTab.language}`)
    }
  }

  const handleSearch = () => {
    if (!searchTerm) {
      addNotification('error', 'Sila masukkan kata untuk dicari')
      return
    }
    
    const currentActiveTab = getActiveTab()
    const regex = new RegExp(searchTerm, 'gi')
    const matches = currentActiveTab.content.match(regex)
    
    if (matches) {
      addNotification('success', `${matches.length} padanan dijumpai untuk "${searchTerm}"`)
    } else {
      addNotification('info', 'Tiada padanan dijumpai')
    }
  }

  const handleReplace = () => {
    if (!searchTerm) {
      addNotification('error', 'Sila masukkan kata untuk dicari')
      return
    }
    
    const currentActiveTab = getActiveTab()
    const regex = new RegExp(searchTerm, 'gi')
    const newContent = currentActiveTab.content.replace(regex, replaceTerm)
    
    if (newContent !== currentActiveTab.content) {
      updateTab(activeTabId, { content: newContent })
      addNotification('success', 'Replace telah dilakukan')
    } else {
      addNotification('info', 'Tiada padanan untuk di-replace')
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
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-electric-blue to-neon-green rounded-lg flex items-center justify-center">
                <Code className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">CodeCikgu Playground</span>
            </Link>

            {/* User Info */}
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
                  <div className="w-2 h-2 bg-current rounded-full"></div>
                  <span>Secure session untuk {user.role}: {user.email}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors duration-300"
                  title="Search & Replace"
                >
                  <Search className="w-5 h-5" />
                </button>
                
                <button
                  onClick={executeCode}
                  className="flex items-center space-x-2 px-4 py-2 bg-neon-green hover:bg-neon-green/90 text-dark-black font-medium rounded-lg transition-colors duration-300"
                  title="Run Code"
                >
                  <Play className="w-4 h-4" />
                  <span className="hidden sm:inline">Run</span>
                </button>
                
                <button
                  onClick={() => (window as any).open('/playground', '_blank')}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors duration-300"
                  title="Open File"
                >
                  <File className="w-5 h-5" />
                </button>
                
                <button
                  onClick={saveCurrentTab}
                  className="flex items-center space-x-2 px-4 py-2 bg-electric-blue hover:bg-electric-blue/90 text-white font-medium rounded-lg transition-colors duration-300"
                  title={activeTab.isFromFileSystem ? 'Save File' : 'Download'}
                >
                  {activeTab.isFromFileSystem ? <Save className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                  <span className="hidden sm:inline">{activeTab.isFromFileSystem ? 'Save' : 'Download'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

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

      {/* Search Panel */}
      {showSearch && (
        <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search..."
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-electric-blue"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={replaceTerm}
                    onChange={(e) => setReplaceTerm(e.target.value)}
                    placeholder="Replace with..."
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-electric-blue"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-electric-blue hover:bg-electric-blue/90 text-white text-sm rounded transition-colors duration-300"
                >
                  Find
                </button>
                <button
                  onClick={handleReplace}
                  className="px-4 py-2 bg-neon-green hover:bg-neon-green/90 text-dark-black text-sm rounded transition-colors duration-300"
                >
                  Replace All
                </button>
                <button
                  onClick={() => setShowSearch(false)}
                  className="p-2 text-gray-400 hover:text-white transition-colors duration-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* File Tree */}
            {fileTree.length > 0 && (
              <div className="glass-dark rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <Folder className="w-5 h-5 mr-2" />
                  File Explorer
                </h3>
                
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {fileTree.map((item, index) => (
                    <FileTreeNode 
                      key={index} 
                      item={item} 
                      onSelect={openFileFromTree}
                      onToggle={toggleTreeItem}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* File Info */}
            <div className="glass-dark rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Maklumat File</h3>
              
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
                  <label className="block text-sm text-gray-400 mb-2">Bahasa</label>
                  <select
                    value={activeTab.language}
                    onChange={(e) => updateTab(activeTabId, { language: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-electric-blue"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                    <option value="php">PHP</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="sql">SQL</option>
                    <option value="xml">XML</option>
                    <option value="json">JSON</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Status</span>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    activeTab.saved 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {activeTab.saved ? '✓ Saved' : '● Unsaved'}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Source</span>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
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

                {/* Code Editor with Proper Syntax Highlighting */}
                <div className="relative">
                  {/* Syntax Highlighted Background */}
                  <div 
                    ref={highlightRef}
                    className="absolute inset-0 p-4 font-mono pointer-events-none overflow-auto whitespace-pre-wrap break-words"
                    style={{ 
                      fontSize: `${fontSize}px`,
                      lineHeight: '1.5',
                      paddingLeft: showLineNumbers ? '80px' : '16px',
                      ...getThemeClasses(),
                      zIndex: 1
                    }}
                    dangerouslySetInnerHTML={{
                      __html: applySyntaxHighlighting(activeTab.content, activeTab.language, theme)
                    }}
                  />
                  
                  {/* Line Numbers */}
                  {showLineNumbers && (
                    <div 
                      className="absolute left-0 top-0 p-4 pr-8 font-mono pointer-events-none border-r border-gray-700"
                      style={{ 
                        fontSize: `${fontSize}px`,
                        lineHeight: '1.5',
                        color: themes[theme].lineNumber,
                        backgroundColor: themes[theme].background,
                        zIndex: 2
                      }}
                    >
                      {activeTab.content.split('\n').map((_, index) => (
                        <div key={index}>
                          {index + 1}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Transparent Textarea */}
                  <textarea
                    ref={textareaRef}
                    value={activeTab.content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    placeholder={`Mula tulis kod ${languagePatterns[activeTab.language as keyof typeof languagePatterns]?.name || activeTab.language} anda di sini...`}
                    className="relative w-full h-96 p-4 resize-none focus:outline-none font-mono bg-transparent text-transparent caret-white"
                    style={{ 
                      fontSize: `${fontSize}px`,
                      lineHeight: '1.5',
                      paddingLeft: showLineNumbers ? '80px' : '16px',
                      zIndex: 3
                    }}
                    spellCheck={false}
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
                    {supportsFileSystemAPI && <span className="text-blue-400">🛠️ Syntax Highlighting FS API: ✓</span>}
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
  )
}

// File Tree Node Component
function FileTreeNode({ 
  item, 
  onSelect, 
  onToggle, 
  depth = 0 
}: { 
  item: FileTreeItem
  onSelect: (item: FileTreeItem) => void
  onToggle: (item: FileTreeItem) => void
  depth?: number
}) {
  return (
    <div>
      <div
        className={`flex items-center space-x-2 p-2 rounded cursor-pointer hover:bg-gray-700/30 transition-colors duration-300`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => item.type === 'directory' ? onToggle(item) : onSelect(item)}
      >
        {item.type === 'directory' ? (
          <>
            {item.expanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
            <Folder className="w-4 h-4 text-blue-400" />
          </>
        ) : (
          <>
            <div className="w-4"></div>
            <FileText className="w-4 h-4 text-gray-400" />
          </>
        )}
        <span className="text-sm text-gray-300">{item.name}</span>
      </div>
      
      {item.type === 'directory' && item.expanded && item.children && (
        <div>
          {item.children.map((child, index) => (
            <FileTreeNode
              key={index}
              item={child}
              onSelect={onSelect}
              onToggle={onToggle}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

