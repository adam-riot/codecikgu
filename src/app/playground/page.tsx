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
  RefreshCw,
  Cloud,
  FolderOpen,
  Shield
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
  lastSaved?: number
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

interface PlaygroundSession {
  tabs: Tab[]
  activeTabId: string
  nextTabId: number
  lastSaved: number
  userId: string
  userRole: string
}

// Syntax highlighting patterns for different languages
const syntaxPatterns = {
  javascript: {
    keywords: /\b(const|let|var|function|return|if|else|for|while|do|break|continue|switch|case|default|try|catch|finally|throw|new|this|typeof|instanceof|in|of|class|extends|super|static|async|await|import|export|from|as|default)\b/g,
    strings: /(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g,
    comments: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
    numbers: /\b\d+\.?\d*\b/g,
    operators: /[+\-*/%=<>!&|^~?:]/g,
    brackets: /[(){}[\]]/g,
    functions: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g,
    properties: /\.([a-zA-Z_$][a-zA-Z0-9_$]*)/g
  },
  php: {
    keywords: /\b(echo|print|if|else|elseif|endif|for|foreach|endfor|while|endwhile|do|break|continue|switch|case|default|function|return|class|extends|public|private|protected|static|const|var|new|this|parent|self|try|catch|finally|throw|include|require|include_once|require_once|namespace|use|as|global|isset|empty|unset|array|true|false|null)\b/g,
    variables: /\$[a-zA-Z_][a-zA-Z0-9_]*/g,
    strings: /(["'])((?:\\.|(?!\1)[^\\])*?)\1/g,
    comments: /(\/\/.*$|\/\*[\s\S]*?\*\/|#.*$)/gm,
    numbers: /\b\d+\.?\d*\b/g,
    operators: /[+\-*/%=<>!&|^~?:.]/g,
    brackets: /[(){}[\]]/g,
    tags: /(<\?php|\?>)/g,
    functions: /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g
  },
  html: {
    tags: /(<\/?[a-zA-Z][a-zA-Z0-9]*(?:\s[^>]*)?>)/g,
    attributes: /\s([a-zA-Z-]+)(?==)/g,
    strings: /(["'])((?:\\.|(?!\1)[^\\])*?)\1/g,
    comments: /(<!--[\s\S]*?-->)/g,
    doctype: /(<!DOCTYPE[^>]*>)/gi
  },
  css: {
    selectors: /([.#]?[a-zA-Z][a-zA-Z0-9_-]*(?:\s*[>+~]\s*[a-zA-Z][a-zA-Z0-9_-]*)*)\s*(?={)/g,
    properties: /([a-zA-Z-]+)\s*(?=:)/g,
    values: /:\s*([^;{}]+)/g,
    strings: /(["'])((?:\\.|(?!\1)[^\\])*?)\1/g,
    comments: /(\/\*[\s\S]*?\*\/)/g,
    numbers: /\b\d+\.?\d*(px|em|rem|%|vh|vw|pt|pc|in|cm|mm|ex|ch|vmin|vmax)?\b/g,
    colors: /#[0-9a-fA-F]{3,6}\b/g,
    important: /!important/g
  },
  python: {
    keywords: /\b(def|class|if|elif|else|for|while|break|continue|return|import|from|as|try|except|finally|raise|with|pass|lambda|and|or|not|in|is|True|False|None|global|nonlocal|yield|async|await)\b/g,
    strings: /(["'])((?:\\.|(?!\1)[^\\])*?)\1|"""[\s\S]*?"""|'''[\s\S]*?'''/g,
    comments: /(#.*$)/gm,
    numbers: /\b\d+\.?\d*\b/g,
    operators: /[+\-*/%=<>!&|^~]/g,
    brackets: /[(){}[\]]/g,
    functions: /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g,
    decorators: /@[a-zA-Z_][a-zA-Z0-9_]*/g
  },
  java: {
    keywords: /\b(public|private|protected|static|final|abstract|class|interface|extends|implements|import|package|if|else|for|while|do|break|continue|return|try|catch|finally|throw|throws|new|this|super|void|int|double|float|long|short|byte|char|boolean|String|true|false|null)\b/g,
    strings: /(["'])((?:\\.|(?!\1)[^\\])*?)\1/g,
    comments: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
    numbers: /\b\d+\.?\d*[fFdDlL]?\b/g,
    operators: /[+\-*/%=<>!&|^~?:]/g,
    brackets: /[(){}[\]]/g,
    functions: /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g,
    annotations: /@[a-zA-Z_][a-zA-Z0-9_]*/g
  },
  cpp: {
    keywords: /\b(int|double|float|char|bool|void|string|auto|const|static|extern|inline|virtual|public|private|protected|class|struct|enum|union|namespace|using|template|typename|if|else|for|while|do|break|continue|return|switch|case|default|try|catch|throw|new|delete|this|true|false|nullptr|sizeof|typedef|include|define|ifdef|ifndef|endif|pragma)\b/g,
    strings: /(["'])((?:\\.|(?!\1)[^\\])*?)\1/g,
    comments: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
    numbers: /\b\d+\.?\d*[fFlLuU]?\b/g,
    operators: /[+\-*/%=<>!&|^~?:]/g,
    brackets: /[(){}[\]]/g,
    preprocessor: /#[a-zA-Z_][a-zA-Z0-9_]*/g,
    functions: /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g
  },
  sql: {
    keywords: /\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|TABLE|DATABASE|INDEX|VIEW|PROCEDURE|FUNCTION|TRIGGER|IF|ELSE|BEGIN|END|DECLARE|SET|EXEC|EXECUTE|RETURN|PRINT|GO|USE|AS|ON|IN|EXISTS|NOT|NULL|AND|OR|LIKE|BETWEEN|ORDER|BY|GROUP|HAVING|UNION|JOIN|INNER|LEFT|RIGHT|FULL|OUTER|CROSS|DISTINCT|TOP|LIMIT|OFFSET|CASE|WHEN|THEN|ELSE|END|COUNT|SUM|AVG|MIN|MAX|CAST|CONVERT)\b/gi,
    strings: /(["'])((?:\\.|(?!\1)[^\\])*?)\1/g,
    comments: /(--.*$|\/\*[\s\S]*?\*\/)/gm,
    numbers: /\b\d+\.?\d*\b/g,
    operators: /[+\-*/%=<>!]/g,
    brackets: /[()]/g,
    functions: /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g
  }
}

// Theme-based color schemes
const syntaxThemes = {
  dark: {
    keywords: '#569cd6',      // Blue
    strings: '#ce9178',       // Orange
    comments: '#6a9955',      // Green
    numbers: '#b5cea8',       // Light green
    operators: '#d4d4d4',     // Light gray
    brackets: '#ffd700',      // Gold
    functions: '#dcdcaa',     // Yellow
    properties: '#9cdcfe',    // Light blue
    variables: '#4fc1ff',     // Cyan
    tags: '#569cd6',          // Blue
    attributes: '#92c5f8',    // Light blue
    selectors: '#d7ba7d',     // Tan
    values: '#ce9178',        // Orange
    colors: '#4ec9b0',        // Teal
    important: '#ff6b6b',     // Red
    decorators: '#4ec9b0',    // Teal
    annotations: '#4ec9b0',   // Teal
    preprocessor: '#c586c0'   // Purple
  },
  light: {
    keywords: '#0000ff',      // Blue
    strings: '#a31515',       // Red
    comments: '#008000',      // Green
    numbers: '#098658',       // Dark green
    operators: '#000000',     // Black
    brackets: '#000000',      // Black
    functions: '#795e26',     // Brown
    properties: '#001080',    // Dark blue
    variables: '#001080',     // Dark blue
    tags: '#800000',          // Maroon
    attributes: '#ff0000',    // Red
    selectors: '#800000',     // Maroon
    values: '#0451a5',        // Blue
    colors: '#0451a5',        // Blue
    important: '#ff0000',     // Red
    decorators: '#0451a5',    // Blue
    annotations: '#0451a5',   // Blue
    preprocessor: '#800080'   // Purple
  },
  monokai: {
    keywords: '#f92672',      // Pink
    strings: '#e6db74',       // Yellow
    comments: '#75715e',      // Gray
    numbers: '#ae81ff',       // Purple
    operators: '#f8f8f2',     // White
    brackets: '#f8f8f2',      // White
    functions: '#a6e22e',     // Green
    properties: '#66d9ef',    // Cyan
    variables: '#fd971f',     // Orange
    tags: '#f92672',          // Pink
    attributes: '#a6e22e',    // Green
    selectors: '#f92672',     // Pink
    values: '#e6db74',        // Yellow
    colors: '#ae81ff',        // Purple
    important: '#f92672',     // Pink
    decorators: '#66d9ef',    // Cyan
    annotations: '#66d9ef',   // Cyan
    preprocessor: '#66d9ef'   // Cyan
  }
}

// Language patterns for auto-detection (same as before)
const languagePatterns = {
  javascript: {
    name: 'JavaScript',
    extensions: ['.js', '.jsx', '.mjs'],
    patterns: [
      /function\s+\w+\s*\(/,
      /const\s+\w+\s*=/,
      /let\s+\w+\s*=/,
      /var\s+\w+\s*=/,
      /=>\s*{/,
      /console\.log\(/,
      /document\./,
      /window\./,
      /require\(/,
      /import\s+.*from/,
      /export\s+(default\s+)?/
    ]
  },
  typescript: {
    name: 'TypeScript',
    extensions: ['.ts', '.tsx'],
    patterns: [
      /interface\s+\w+/,
      /type\s+\w+\s*=/,
      /:\s*(string|number|boolean|any)\s*[;,=]/,
      /function\s+\w+\s*\([^)]*:\s*\w+/,
      /const\s+\w+:\s*\w+/
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
      /require\s+/,
      /\$_GET/,
      /\$_POST/,
      /\$_SESSION/
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
  },
  c: {
    name: 'C',
    extensions: ['.c', '.h'],
    patterns: [
      /#include\s*<.*>/,
      /int\s+main\s*\(/,
      /printf\s*\(/,
      /scanf\s*\(/,
      /malloc\s*\(/,
      /free\s*\(/
    ]
  },
  sql: {
    name: 'SQL',
    extensions: ['.sql'],
    patterns: [
      /SELECT\s+.*FROM/i,
      /INSERT\s+INTO/i,
      /UPDATE\s+.*SET/i,
      /DELETE\s+FROM/i,
      /CREATE\s+TABLE/i,
      /ALTER\s+TABLE/i
    ]
  },
  xml: {
    name: 'XML',
    extensions: ['.xml'],
    patterns: [
      /<\?xml/,
      /<\/\w+>/,
      /<\w+[^>]*\/>/
    ]
  },
  json: {
    name: 'JSON',
    extensions: ['.json'],
    patterns: [
      /^\s*{/,
      /^\s*\[/,
      /"\w+":\s*"/,
      /"\w+":\s*\d+/,
      /"\w+":\s*(true|false|null)/
    ]
  }
}

// Syntax highlighting function
const applySyntaxHighlighting = (code: string, language: string, theme: string): string => {
  if (!code) return ''
  
  const patterns = syntaxPatterns[language as keyof typeof syntaxPatterns]
  const colors = syntaxThemes[theme as keyof typeof syntaxThemes]
  
  if (!patterns || !colors) return code
  
  let highlightedCode = code
  
  // Apply highlighting in order of precedence
  const replacements: Array<{pattern: RegExp, replacement: (match: string, ...args: any[]) => string}> = []
  
  // Comments first (to avoid highlighting keywords inside comments)
  if (patterns.comments) {
    replacements.push({
      pattern: patterns.comments,
      replacement: (match) => `<span style="color: ${colors.comments}; font-style: italic;">${match}</span>`
    })
  }
  
  // Strings
  if (patterns.strings) {
    replacements.push({
      pattern: patterns.strings,
      replacement: (match) => `<span style="color: ${colors.strings};">${match}</span>`
    })
  }
  
  // Keywords
  if (patterns.keywords) {
    replacements.push({
      pattern: patterns.keywords,
      replacement: (match) => `<span style="color: ${colors.keywords}; font-weight: bold;">${match}</span>`
    })
  }
  
  // Variables (PHP)
  if (patterns.variables) {
    replacements.push({
      pattern: patterns.variables,
      replacement: (match) => `<span style="color: ${colors.variables};">${match}</span>`
    })
  }
  
  // Functions
  if (patterns.functions) {
    replacements.push({
      pattern: patterns.functions,
      replacement: (match) => `<span style="color: ${colors.functions};">${match}</span>`
    })
  }
  
  // Numbers
  if (patterns.numbers) {
    replacements.push({
      pattern: patterns.numbers,
      replacement: (match) => `<span style="color: ${colors.numbers};">${match}</span>`
    })
  }
  
  // HTML Tags
  if (patterns.tags) {
    replacements.push({
      pattern: patterns.tags,
      replacement: (match) => `<span style="color: ${colors.tags};">${match}</span>`
    })
  }
  
  // CSS Selectors
  if (patterns.selectors) {
    replacements.push({
      pattern: patterns.selectors,
      replacement: (match) => `<span style="color: ${colors.selectors};">${match}</span>`
    })
  }
  
  // Properties
  if (patterns.properties) {
    replacements.push({
      pattern: patterns.properties,
      replacement: (match) => `<span style="color: ${colors.properties};">${match}</span>`
    })
  }
  
  // Operators
  if (patterns.operators) {
    replacements.push({
      pattern: patterns.operators,
      replacement: (match) => `<span style="color: ${colors.operators};">${match}</span>`
    })
  }
  
  // Brackets
  if (patterns.brackets) {
    replacements.push({
      pattern: patterns.brackets,
      replacement: (match) => `<span style="color: ${colors.brackets}; font-weight: bold;">${match}</span>`
    })
  }
  
  // Apply all replacements
  replacements.forEach(({pattern, replacement}) => {
    highlightedCode = highlightedCode.replace(pattern, replacement)
  })
  
  return highlightedCode
}

// Storage utilities with user-specific keys (same as before)
const getUserStorageKey = (userId: string, key: string): string => {
  return `codecikgu_${userId}_${key}`
}

const saveSessionToStorage = (session: PlaygroundSession, userId: string) => {
  try {
    const storageKey = getUserStorageKey(userId, 'playground_session')
    localStorage.setItem(storageKey, JSON.stringify(session))
  } catch (error) {
    console.error('Failed to save session to storage:', error)
  }
}

const loadSessionFromStorage = (userId: string): PlaygroundSession | null => {
  try {
    const storageKey = getUserStorageKey(userId, 'playground_session')
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      const session = JSON.parse(stored)
      if (session.userId === userId) {
        return session
      }
    }
  } catch (error) {
    console.error('Failed to load session from storage:', error)
  }
  return null
}

const clearSessionFromStorage = (userId: string) => {
  try {
    const storageKey = getUserStorageKey(userId, 'playground_session')
    localStorage.removeItem(storageKey)
  } catch (error) {
    console.error('Failed to clear session from storage:', error)
  }
}

const clearAllUserSessions = (userId: string) => {
  try {
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(`codecikgu_${userId}_`)) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key))
  } catch (error) {
    console.error('Failed to clear user sessions:', error)
  }
}

// Utility functions (same as before)
const detectLanguage = (content: string): string => {
  if (!content.trim()) return 'javascript'
  
  for (const [lang, config] of Object.entries(languagePatterns)) {
    const matchCount = config.patterns.filter(pattern => pattern.test(content)).length
    if (matchCount >= 2) {
      return lang
    }
  }
  
  for (const [lang, config] of Object.entries(languagePatterns)) {
    if (config.patterns.some(pattern => pattern.test(content))) {
      return lang
    }
  }
  
  return 'javascript'
}

const detectLanguageFromExtension = (filename: string): string => {
  const ext = '.' + filename.split('.').pop()?.toLowerCase()
  
  for (const [lang, config] of Object.entries(languagePatterns)) {
    if (config.extensions.includes(ext)) {
      return lang
    }
  }
  
  return 'javascript'
}

const ensureCorrectExtension = (filename: string, language: string): string => {
  const config = languagePatterns[language as keyof typeof languagePatterns]
  if (!config) return filename
  
  const currentExt = '.' + filename.split('.').pop()?.toLowerCase()
  if (config.extensions.includes(currentExt)) {
    return filename
  }
  
  const nameWithoutExt = filename.split('.').slice(0, -1).join('.') || filename
  return nameWithoutExt + config.extensions[0]
}

// Error detection and execution functions (same as before - keeping them for brevity)
const detectErrors = (content: string, language: string): CodeError[] => {
  const errors: CodeError[] = []
  const lines = content.split('\n')
  
  if (language === 'javascript' || language === 'typescript') {
    lines.forEach((line, index) => {
      if (line.includes('console.log') && !line.includes('(') && !line.includes(')')) {
        errors.push({
          line: index + 1,
          message: 'Missing parentheses in console.log',
          type: 'error'
        })
      }
      
      if (line.trim() && !line.trim().endsWith(';') && !line.trim().endsWith('{') && !line.trim().endsWith('}')) {
        if (line.includes('=') || line.includes('console.log') || line.includes('return')) {
          errors.push({
            line: index + 1,
            message: 'Missing semicolon',
            type: 'warning'
          })
        }
      }
    })
  }
  
  if (language === 'php') {
    lines.forEach((line, index) => {
      const trimmedLine = line.trim()
      
      if (!trimmedLine || trimmedLine.startsWith('//') || trimmedLine.startsWith('/*') || trimmedLine.startsWith('*')) {
        return
      }
      
      if (index === 0 && !line.includes('<?php') && trimmedLine && !trimmedLine.startsWith('//')) {
        errors.push({
          line: index + 1,
          message: 'Missing PHP opening tag <?php',
          type: 'warning'
        })
      }
      
      if (trimmedLine && 
          !trimmedLine.endsWith(';') && 
          !trimmedLine.endsWith('{') && 
          !trimmedLine.endsWith('}') && 
          !trimmedLine.endsWith('?>') &&
          !trimmedLine.startsWith('<?php') &&
          !trimmedLine.includes('//') &&
          !trimmedLine.includes('/*')) {
        
        if (trimmedLine.includes('echo') || 
            trimmedLine.includes('$') || 
            trimmedLine.includes('=') ||
            trimmedLine.includes('date(') ||
            trimmedLine.includes('time(') ||
            trimmedLine.includes('print') ||
            /\w+\s*\([^)]*\)/.test(trimmedLine)) {
          errors.push({
            line: index + 1,
            message: 'Missing semicolon',
            type: 'warning'
          })
        }
      }
    })
  }
  
  return errors
}

const executeJavaScript = (code: string) => {
  const output: string[] = []
  const errors: string[] = []
  
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

const executePHP = (code: string) => {
  const output: string[] = []
  const errors: string[] = []
  
  try {
    const lines = code.split('\n')
    let variables: { [key: string]: any } = {}
    
    const evaluateExpression = (expr: string): string => {
      if (expr.includes('date(')) {
        const dateMatch = expr.match(/date\s*\(\s*["']([^"']+)["']\s*\)/)
        if (dateMatch) {
          const format = dateMatch[1]
          const now = new Date()
          
          let jsFormat = format
            .replace(/d/g, now.getDate().toString().padStart(2, '0'))
            .replace(/m/g, (now.getMonth() + 1).toString().padStart(2, '0'))
            .replace(/Y/g, now.getFullYear().toString())
            .replace(/y/g, now.getFullYear().toString().slice(-2))
            .replace(/H/g, now.getHours().toString().padStart(2, '0'))
            .replace(/h/g, (now.getHours() % 12 || 12).toString().padStart(2, '0'))
            .replace(/i/g, now.getMinutes().toString().padStart(2, '0'))
            .replace(/s/g, now.getSeconds().toString().padStart(2, '0'))
            .replace(/A/g, now.getHours() >= 12 ? 'PM' : 'AM')
            .replace(/a/g, now.getHours() >= 12 ? 'pm' : 'am')
          
          return jsFormat
        }
      }
      
      if (expr.includes('time()')) {
        return Math.floor(Date.now() / 1000).toString()
      }
      
      expr = expr.replace(/\$(\w+)/g, (match, varName) => {
        return variables[varName] !== undefined ? variables[varName] : `[undefined: ${match}]`
      })
      
      if (expr.includes('$_GET')) {
        const getMatch = expr.match(/\$_GET\[['"](\w+)['"]\]/)
        if (getMatch) {
          return `[GET: ${getMatch[1]}]`
        }
      }
      
      if (expr.includes('$_POST')) {
        const postMatch = expr.match(/\$_POST\[['"](\w+)['"]\]/)
        if (postMatch) {
          return `[POST: ${postMatch[1]}]`
        }
      }
      
      expr = expr.replace(/["']/g, '')
      return expr
    }
    
    const handleConcatenation = (expr: string): string => {
      const parts = expr.split(/\s*\.\s*/)
      let result = ''
      
      for (let part of parts) {
        part = part.trim()
        const evaluated = evaluateExpression(part)
        result += evaluated
      }
      
      return result
    }
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim()
      
      if (!trimmedLine || 
          trimmedLine.startsWith('//') || 
          trimmedLine.startsWith('/*') ||
          trimmedLine.startsWith('*') ||
          trimmedLine.startsWith('<?php') || 
          trimmedLine === '?>') {
        return
      }
      
      const echoMatch = trimmedLine.match(/echo\s+(.+);?/)
      if (echoMatch) {
        let echoContent = echoMatch[1].replace(/;$/, '').trim()
        
        if (echoContent.includes('.')) {
          echoContent = handleConcatenation(echoContent)
        } else {
          echoContent = evaluateExpression(echoContent)
        }
        
        output.push(echoContent)
        return
      }
      
      const varMatch = trimmedLine.match(/\$(\w+)\s*=\s*(.+);?/)
      if (varMatch) {
        const varName = varMatch[1]
        let varValue = varMatch[2].replace(/;$/, '').trim()
        
        if (varValue.includes('.')) {
          varValue = handleConcatenation(varValue)
        } else {
          varValue = evaluateExpression(varValue)
        }
        
        variables[varName] = varValue
        return
      }
    })
    
    if (output.length === 0) {
      output.push('PHP code parsed successfully. No output generated.')
      output.push('')
      output.push('💡 Tips:')
      output.push('- Use echo statements to display output')
      output.push('- Try: echo "Hello World!";')
      output.push('- Try: echo date("d/m/Y H:i:s");')
      output.push('')
      output.push('Note: This is a mock PHP execution for learning purposes.')
      output.push('Download the file and use XAMPP for actual PHP execution.')
    }
    
  } catch (error) {
    errors.push(`PHP Parse Error: ${(error as Error).message}`)
  }
  
  return {
    output: output.join('\n'),
    errors
  }
}

export default function PlaygroundPage() {
  const router = useRouter()
  const [user, setUser] = useState<CustomUser | null>(null)
  const [userRole, setUserRole] = useState<string>('awam')
  const [loading, setLoading] = useState(true)

  // Editor state
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: '1',
      name: 'main.js',
      content: '// Selamat datang ke CodeCikgu Playground!\n// Mula tulis kod anda di sini...\n\nconsole.log("Hello, CodeCikgu!");',
      language: 'javascript',
      saved: false,
      isFromFileSystem: false
    }
  ])
  const [activeTabId, setActiveTabId] = useState('1')
  const [nextTabId, setNextTabId] = useState(2)

  // Get active tab safely
  const getActiveTab = (): Tab => {
    return tabs.find(tab => tab.id === activeTabId) || tabs[0] || {
      id: '1',
      name: 'main.js',
      content: '',
      language: 'javascript',
      saved: false,
      isFromFileSystem: false
    }
  }

  const activeTab = getActiveTab()

  // Editor settings
  const [theme, setTheme] = useState<'dark' | 'light' | 'monokai'>('dark')
  const [fontSize, setFontSize] = useState(14)
  const [showLineNumbers, setShowLineNumbers] = useState(true)
  const [autoSave, setAutoSave] = useState(true)

  // Search and replace
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [replaceTerm, setReplaceTerm] = useState('')

  // File system
  const [supportsFileSystemAPI, setSupportsFileSystemAPI] = useState(false)

  // Output panel
  const [showOutput, setShowOutput] = useState(true)
  const [outputTab, setOutputTab] = useState<'errors' | 'console' | 'preview'>('errors')
  const [executionOutput, setExecutionOutput] = useState('')
  const [codeErrors, setCodeErrors] = useState<CodeError[]>([])
  const [isExecuting, setIsExecuting] = useState(false)

  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Session state
  const [sessionSaved, setSessionSaved] = useState(false)
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null)

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lineNumbersRef = useRef<HTMLDivElement>(null)
  const editorContainerRef = useRef<HTMLDivElement>(null)
  const highlightedCodeRef = useRef<HTMLDivElement>(null)

  // Check File System API support
  useEffect(() => {
    setSupportsFileSystemAPI('showDirectoryPicker' in window && 'showOpenFilePicker' in window)
  }, [])

  // Load session from storage on mount (user-specific)
  useEffect(() => {
    if (user?.id) {
      const savedSession = loadSessionFromStorage(user.id)
      if (savedSession) {
        setTabs(savedSession.tabs)
        setActiveTabId(savedSession.activeTabId)
        setNextTabId(savedSession.nextTabId)
        setSessionSaved(true)
        setLastSaveTime(new Date(savedSession.lastSaved))
        addNotification('success', `Session dipulihkan untuk ${userRole}`)
      }
    }
  }, [user?.id, userRole])

  // Clear session when user changes (logout detection)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.includes('supabase.auth.token')) {
        setSessionSaved(false)
        setLastSaveTime(null)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Auto-save session every 30 seconds (user-specific)
  useEffect(() => {
    if (autoSave && user?.id) {
      const interval = setInterval(() => {
        saveSession(true)
      }, 30000)

      return () => clearInterval(interval)
    }
  }, [tabs, activeTabId, nextTabId, autoSave, user?.id])

  // FIXED: Proper line number scrolling synchronization
  useEffect(() => {
    const textarea = textareaRef.current
    const lineNumbers = lineNumbersRef.current
    const highlightedCode = highlightedCodeRef.current
    
    if (textarea && lineNumbers && highlightedCode) {
      const syncScroll = () => {
        lineNumbers.scrollTop = textarea.scrollTop
        lineNumbers.scrollLeft = textarea.scrollLeft
        highlightedCode.scrollTop = textarea.scrollTop
        highlightedCode.scrollLeft = textarea.scrollLeft
      }
      
      const events = ['scroll', 'input', 'keyup', 'mouseup', 'touchend']
      
      events.forEach(event => {
        textarea.addEventListener(event, syncScroll)
      })
      
      const handleResize = () => {
        setTimeout(syncScroll, 0)
      }
      
      window.addEventListener('resize', handleResize)
      
      setTimeout(syncScroll, 0)
      
      return () => {
        events.forEach(event => {
          textarea.removeEventListener(event, syncScroll)
        })
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [activeTabId, activeTab.content])

  // Update syntax highlighting when content or theme changes
  useEffect(() => {
    if (highlightedCodeRef.current) {
      const highlightedHTML = applySyntaxHighlighting(activeTab.content, activeTab.language, theme)
      highlightedCodeRef.current.innerHTML = highlightedHTML
    }
  }, [activeTab.content, activeTab.language, theme])

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
        } else {
          setSessionSaved(false)
          setLastSaveTime(null)
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
    const currentActiveTab = tabs.find(tab => tab.id === activeTabId)
    if (currentActiveTab && currentActiveTab.content && !currentActiveTab.isFromFileSystem) {
      const detectedLang = detectLanguage(currentActiveTab.content)
      if (detectedLang !== currentActiveTab.language) {
        updateTab(activeTabId, { 
          language: detectedLang,
          name: ensureCorrectExtension(currentActiveTab.name, detectedLang)
        })
      }
    }
  }, [tabs, activeTabId])

  // Error detection when content changes
  useEffect(() => {
    const currentActiveTab = getActiveTab()
    const errors = detectErrors(currentActiveTab.content, currentActiveTab.language)
    setCodeErrors(errors)
  }, [tabs, activeTabId])

  const updateTab = (tabId: string, updates: Partial<Tab>) => {
    setTabs(prev => prev.map(tab => 
      tab.id === tabId ? { ...tab, ...updates, saved: false } : tab
    ))
    setSessionSaved(false)
  }

  // Save session to localStorage (user-specific)
  const saveSession = (silent: boolean = false) => {
    if (!user?.id) {
      if (!silent) {
        addNotification('error', 'Sila login untuk menyimpan session')
      }
      return
    }

    const session: PlaygroundSession = {
      tabs: tabs.map(tab => ({
        ...tab,
        fileHandle: undefined,
        lastSaved: Date.now()
      })),
      activeTabId,
      nextTabId,
      lastSaved: Date.now(),
      userId: user.id,
      userRole: userRole
    }
    
    saveSessionToStorage(session, user.id)
    setSessionSaved(true)
    setLastSaveTime(new Date())
    
    if (!silent) {
      addNotification('success', `Session disimpan untuk ${userRole}`)
    }
  }

  // Clear saved session (user-specific)
  const clearSession = () => {
    if (!user?.id) {
      addNotification('error', 'Tiada user untuk clear session')
      return
    }

    clearSessionFromStorage(user.id)
    setSessionSaved(false)
    setLastSaveTime(null)
    addNotification('info', 'Session telah dibersihkan')
  }

  // Download file with directory picker
  const downloadFileWithPicker = async () => {
    const currentActiveTab = getActiveTab()
    
    if (!currentActiveTab.content.trim()) {
      addNotification('error', 'Tiada kandungan untuk dimuat turun')
      return
    }

    const correctFilename = ensureCorrectExtension(currentActiveTab.name, currentActiveTab.language)
    
    if (supportsFileSystemAPI) {
      try {
        const fileHandle = await (window as any).showSaveFilePicker({
          suggestedName: correctFilename,
          types: [{
            description: 'Text files',
            accept: {
              'text/plain': ['.txt'],
              'text/javascript': ['.js', '.jsx', '.mjs'],
              'text/typescript': ['.ts', '.tsx'],
              'text/html': ['.html', '.htm'],
              'text/css': ['.css', '.scss', '.sass'],
              'application/x-httpd-php': ['.php'],
              'text/x-python': ['.py'],
              'text/x-java-source': ['.java'],
              'text/x-c++src': ['.cpp', '.cc', '.cxx'],
              'text/x-csrc': ['.c', '.h'],
              'application/sql': ['.sql'],
              'application/xml': ['.xml'],
              'application/json': ['.json']
            }
          }]
        })

        const writable = await fileHandle.createWritable()
        await writable.write(currentActiveTab.content)
        await writable.close()
        
        addNotification('success', `File ${correctFilename} telah disimpan`)
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          downloadFileRegular(correctFilename, currentActiveTab.content)
        }
      }
    } else {
      downloadFileRegular(correctFilename, currentActiveTab.content)
    }
  }

  // Regular download (fallback)
  const downloadFileRegular = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    addNotification('success', `File ${filename} telah dimuat turun`)
  }

  // Open file picker
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

  // Open file from file system
  const openFileFromSystem = async (fileHandle: FileSystemFileHandle) => {
    try {
      const file = await fileHandle.getFile()
      const content = await file.text()
      const language = detectLanguageFromExtension(file.name)
      
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
      setSessionSaved(false)
      
      addNotification('success', `File "${file.name}" telah dibuka`)
    } catch (error) {
      addNotification('error', `Gagal membuka file: ${(error as Error).message}`)
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
    setSessionSaved(false)
    
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
    
    setSessionSaved(false)
    addNotification('success', 'Tab telah ditutup')
  }

  const handleContentChange = (content: string) => {
    updateTab(activeTabId, { content })
  }

  // Execute code
  const executeCode = () => {
    const currentActiveTab = getActiveTab()
    setIsExecuting(true)
    
    if (currentActiveTab.language === 'javascript') {
      const result = executeJavaScript(currentActiveTab.content)
      setExecutionOutput(result.output)
      if (result.errors.length > 0) {
        setExecutionOutput(prev => prev + '\n\nErrors:\n' + result.errors.join('\n'))
      }
      setOutputTab('console')
      addNotification('success', 'Kod JavaScript telah dijalankan')
    } else if (currentActiveTab.language === 'php') {
      const result = executePHP(currentActiveTab.content)
      setExecutionOutput(result.output)
      if (result.errors.length > 0) {
        setExecutionOutput(prev => prev + '\n\nErrors:\n' + result.errors.join('\n'))
      }
      setOutputTab('console')
      addNotification('success', 'Kod PHP telah dianalisis dan dijalankan (mock execution)')
    } else if (currentActiveTab.language === 'html') {
      setOutputTab('preview')
      addNotification('success', 'HTML preview telah dikemaskini')
    } else {
      addNotification('info', `Mock execution untuk ${currentActiveTab.language}. Download file untuk menjalankan kod sebenar.`)
      setExecutionOutput(`Mock execution untuk ${languagePatterns[currentActiveTab.language as keyof typeof languagePatterns]?.name || currentActiveTab.language}.\n\nUntuk menjalankan kod sebenar:\n1. Download file menggunakan button Download\n2. Guna compiler/interpreter yang sesuai\n3. Contoh: XAMPP untuk PHP, Python interpreter untuk Python, dll.`)
      setOutputTab('console')
    }
    
    setIsExecuting(false)
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
      addNotification('info', `Tiada padanan dijumpai untuk "${searchTerm}"`)
    }
  }

  const handleReplace = () => {
    if (!searchTerm) {
      addNotification('error', 'Sila masukkan kata untuk dicari')
      return
    }
    
    const currentActiveTab = getActiveTab()
    const regex = new RegExp(searchTerm, 'gi')
    const matches = currentActiveTab.content.match(regex)
    
    if (matches) {
      const newContent = currentActiveTab.content.replace(regex, replaceTerm)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black flex items-center justify-center">
        <div className="glass-dark rounded-2xl p-8 text-center">
          <div className="text-2xl text-gradient loading-dots">Memuat playground</div>
        </div>
      </div>
    )
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
                Editor kod online dengan syntax highlighting dan auto error detection
              </p>
              {user && (
                <div className="flex items-center space-x-2 mt-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm">
                    Secure session untuk {userRole}: {user.email}
                  </span>
                </div>
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
              
              <button
                onClick={executeCode}
                disabled={isExecuting}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 rounded-lg transition-all duration-300 disabled:opacity-50"
              >
                <Play className="w-4 h-4" />
                <span>{isExecuting ? 'Running...' : 'Run'}</span>
              </button>
              
              {supportsFileSystemAPI && (
                <button
                  onClick={openFiles}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 rounded-lg transition-all duration-300"
                >
                  <File className="w-4 h-4" />
                  <span>Open File</span>
                </button>
              )}
              
              <button
                onClick={() => saveSession()}
                disabled={!user}
                className="flex items-center space-x-2 px-4 py-2 bg-neon-green/20 border border-neon-green/30 text-neon-green hover:bg-neon-green/30 rounded-lg transition-all duration-300 disabled:opacity-50"
                title={user ? "Save session to browser storage" : "Login required to save"}
              >
                <Cloud className="w-4 h-4" />
                <span>Save</span>
                {sessionSaved && <div className="w-2 h-2 bg-neon-green rounded-full"></div>}
              </button>
              
              <button
                onClick={downloadFileWithPicker}
                className="flex items-center space-x-2 px-4 py-2 bg-electric-blue/20 border border-electric-blue/30 text-electric-blue hover:bg-electric-blue/30 rounded-lg transition-all duration-300"
                title="Download file with directory picker"
              >
                <FolderOpen className="w-4 h-4" />
                <span>Download</span>
              </button>
            </div>
          </div>

          {/* User Session Status */}
          {user && (sessionSaved || lastSaveTime) && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-medium">
                    Session Saved untuk {userRole}
                  </span>
                  {lastSaveTime && (
                    <span className="text-gray-400 text-sm">
                      Last saved: {lastSaveTime.toLocaleTimeString()}
                    </span>
                  )}
                </div>
                <button
                  onClick={clearSession}
                  className="text-gray-400 hover:text-red-400 transition-colors duration-300"
                  title="Clear saved session"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Login Required Notice */}
          {!user && (
            <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 font-medium">
                  Login diperlukan untuk menyimpan session secara selamat
                </span>
              </div>
            </div>
          )}

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

                  {user && (
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">User Session</label>
                      <div className="px-3 py-2 bg-green-500/20 border border-green-500/30 rounded text-green-400 text-sm">
                        🔒 {userRole}
                      </div>
                    </div>
                  )}
                  
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
                    <button
                      onClick={openFiles}
                      className="w-full flex items-center p-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg transition-colors duration-300"
                    >
                      <File className="w-4 h-4 text-blue-400 mr-2" />
                      <span className="text-blue-400 text-sm">Open File</span>
                    </button>
                  )}
                  
                  <button
                    onClick={() => saveSession()}
                    disabled={!user}
                    className="w-full flex items-center p-3 bg-neon-green/20 hover:bg-neon-green/30 border border-neon-green/30 rounded-lg transition-colors duration-300 disabled:opacity-50"
                  >
                    <Cloud className="w-4 h-4 text-neon-green mr-2" />
                    <span className="text-neon-green text-sm">
                      {user ? 'Save Session' : 'Login Required'}
                    </span>
                  </button>
                  
                  <button
                    onClick={downloadFileWithPicker}
                    className="w-full flex items-center p-3 bg-electric-blue/20 hover:bg-electric-blue/30 border border-electric-blue/30 rounded-lg transition-colors duration-300"
                  >
                    <FolderOpen className="w-4 h-4 text-electric-blue mr-2" />
                    <span className="text-electric-blue text-sm">Download File</span>
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

                  {/* Code Editor with Syntax Highlighting */}
                  <div ref={editorContainerRef} className="relative">
                    <div className="flex">
                      {/* Line Numbers */}
                      {showLineNumbers && (
                        <div 
                          ref={lineNumbersRef}
                          className="flex-shrink-0 p-4 pr-2 text-gray-500 text-sm font-mono bg-gray-800/30 border-r border-gray-700 select-none pointer-events-none user-select-none"
                          style={{ 
                            fontSize: `${fontSize}px`, 
                            lineHeight: '1.5',
                            width: '60px',
                            height: '384px',
                            overflow: 'hidden',
                            position: 'relative'
                          }}
                        >
                          <div style={{ position: 'relative' }}>
                            {activeTab.content.split('\n').map((_, index) => (
                              <div 
                                key={index} 
                                className="text-right whitespace-nowrap"
                                style={{ 
                                  height: `${fontSize * 1.5}px`,
                                  lineHeight: '1.5'
                                }}
                              >
                                {index + 1}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Syntax Highlighted Code Background */}
                      <div className="relative flex-1">
                        <div
                          ref={highlightedCodeRef}
                          className="absolute inset-0 p-4 font-mono pointer-events-none select-none whitespace-pre-wrap break-words"
                          style={{ 
                            fontSize: `${fontSize}px`,
                            lineHeight: '1.5',
                            minHeight: '384px',
                            overflow: 'hidden',
                            zIndex: 1
                          }}
                        />
                        
                        {/* Code Textarea (Transparent) */}
                        <textarea
                          ref={textareaRef}
                          value={activeTab.content}
                          onChange={(e) => handleContentChange(e.target.value)}
                          placeholder={`Mula tulis kod ${languagePatterns[activeTab.language as keyof typeof languagePatterns]?.name || activeTab.language} anda di sini...`}
                          className="relative w-full h-96 p-4 resize-none focus:outline-none font-mono bg-transparent text-transparent caret-white"
                          style={{ 
                            fontSize: `${fontSize}px`,
                            lineHeight: '1.5',
                            minHeight: '384px',
                            zIndex: 2
                          }}
                          spellCheck={false}
                        />
                      </div>
                    </div>
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
                      {user && sessionSaved && <span className="text-green-400">🔒 Saved</span>}
                      <span>Tema: {theme}</span>
                      <span className="text-electric-blue">🎨 Syntax Highlighting</span>
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

