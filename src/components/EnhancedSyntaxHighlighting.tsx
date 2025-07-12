'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  Code, 
  Palette, 
  Eye, 
  Settings, 
  Download, 
  Upload,
  Sun,
  Moon,
  Zap,
  Type,
  Hash,
  Quote,
  Braces,
  ChevronDown,
  ChevronUp,
  Monitor,
  Smartphone,
  Copy,
  Check
} from 'lucide-react'
import { useNotifications } from './NotificationProvider'

interface SyntaxTheme {
  id: string
  name: string
  type: 'light' | 'dark'
  colors: {
    background: string
    foreground: string
    comment: string
    keyword: string
    string: string
    number: string
    operator: string
    function: string
    variable: string
    class: string
    constant: string
    tag: string
    attribute: string
    lineNumber: string
    selection: string
    cursor: string
  }
}

interface HighlightRule {
  pattern: RegExp
  className: string
  description: string
}

interface Language {
  id: string
  name: string
  extensions: string[]
  rules: HighlightRule[]
  keywords: string[]
  operators: string[]
  brackets: { open: string; close: string }[]
}

// Predefined syntax themes
const syntaxThemes: SyntaxTheme[] = [
  {
    id: 'monokai',
    name: 'Monokai Pro',
    type: 'dark',
    colors: {
      background: '#2D2A2E',
      foreground: '#FCFCFA',
      comment: '#727072',
      keyword: '#FF6188',
      string: '#FFD866',
      number: '#AB9DF2',
      operator: '#FF6188',
      function: '#A9DC76',
      variable: '#78DCE8',
      class: '#AB9DF2',
      constant: '#AB9DF2',
      tag: '#FF6188',
      attribute: '#FFD866',
      lineNumber: '#5B595C',
      selection: '#403E41',
      cursor: '#FCFCFA'
    }
  },
  {
    id: 'github-light',
    name: 'GitHub Light',
    type: 'light',
    colors: {
      background: '#FFFFFF',
      foreground: '#24292F',
      comment: '#6A737D',
      keyword: '#D73A49',
      string: '#032F62',
      number: '#005CC5',
      operator: '#D73A49',
      function: '#6F42C1',
      variable: '#E36209',
      class: '#6F42C1',
      constant: '#005CC5',
      tag: '#22863A',
      attribute: '#6F42C1',
      lineNumber: '#1B1F23',
      selection: '#C8E1FF',
      cursor: '#24292F'
    }
  },
  {
    id: 'dracula',
    name: 'Dracula',
    type: 'dark',
    colors: {
      background: '#282A36',
      foreground: '#F8F8F2',
      comment: '#6272A4',
      keyword: '#FF79C6',
      string: '#F1FA8C',
      number: '#BD93F9',
      operator: '#FF79C6',
      function: '#50FA7B',
      variable: '#8BE9FD',
      class: '#BD93F9',
      constant: '#BD93F9',
      tag: '#FF79C6',
      attribute: '#50FA7B',
      lineNumber: '#44475A',
      selection: '#44475A',
      cursor: '#F8F8F2'
    }
  },
  {
    id: 'vs-code-dark',
    name: 'VS Code Dark+',
    type: 'dark',
    colors: {
      background: '#1E1E1E',
      foreground: '#D4D4D4',
      comment: '#6A9955',
      keyword: '#569CD6',
      string: '#CE9178',
      number: '#B5CEA8',
      operator: '#D4D4D4',
      function: '#DCDCAA',
      variable: '#9CDCFE',
      class: '#4EC9B0',
      constant: '#4FC1FF',
      tag: '#569CD6',
      attribute: '#92C5F8',
      lineNumber: '#858585',
      selection: '#264F78',
      cursor: '#AEAFAD'
    }
  },
  {
    id: 'material',
    name: 'Material Theme',
    type: 'dark',
    colors: {
      background: '#263238',
      foreground: '#EEFFFF',
      comment: '#546E7A',
      keyword: '#C792EA',
      string: '#C3E88D',
      number: '#F78C6C',
      operator: '#89DDFF',
      function: '#82AAFF',
      variable: '#EEFFFF',
      class: '#FFCB6B',
      constant: '#82B1FF',
      tag: '#F07178',
      attribute: '#FFCB6B',
      lineNumber: '#37474F',
      selection: '#314549',
      cursor: '#FFCC02'
    }
  }
]

// Language definitions
const languages: Language[] = [
  {
    id: 'php',
    name: 'PHP',
    extensions: ['.php'],
    keywords: [
      'abstract', 'and', 'array', 'as', 'break', 'callable', 'case', 'catch', 'class', 'clone',
      'const', 'continue', 'declare', 'default', 'die', 'do', 'echo', 'else', 'elseif', 'empty',
      'enddeclare', 'endfor', 'endforeach', 'endif', 'endswitch', 'endwhile', 'eval', 'exit',
      'extends', 'false', 'final', 'finally', 'for', 'foreach', 'function', 'global', 'goto',
      'if', 'implements', 'include', 'include_once', 'instanceof', 'insteadof', 'interface',
      'isset', 'list', 'namespace', 'new', 'null', 'or', 'parent', 'print', 'private',
      'protected', 'public', 'require', 'require_once', 'return', 'self', 'static', 'switch',
      'throw', 'trait', 'true', 'try', 'unset', 'use', 'var', 'while', 'xor', 'yield'
    ],
    operators: ['+', '-', '*', '/', '%', '=', '==', '===', '!=', '!==', '<', '>', '<=', '>=', '&&', '||', '!', '.', '->', '=>'],
    brackets: [
      { open: '(', close: ')' },
      { open: '[', close: ']' },
      { open: '{', close: '}' }
    ],
    rules: [
      { pattern: /<\?php|\?>/g, className: 'php-tag', description: 'PHP opening/closing tags' },
      { pattern: /\/\*[\s\S]*?\*\/|\/\/.*$/gm, className: 'comment', description: 'Comments' },
      { pattern: /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, className: 'string', description: 'String literals' },
      { pattern: /\b\d+\.?\d*\b/g, className: 'number', description: 'Numbers' },
      { pattern: /\$\w+/g, className: 'variable', description: 'Variables' },
      { pattern: /\bfunction\s+\w+/g, className: 'function', description: 'Function definitions' },
      { pattern: /\bclass\s+\w+/g, className: 'class', description: 'Class definitions' }
    ]
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    keywords: [
      'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default', 'delete',
      'do', 'else', 'export', 'extends', 'false', 'finally', 'for', 'function', 'if', 'import',
      'in', 'instanceof', 'let', 'new', 'null', 'return', 'super', 'switch', 'this', 'throw',
      'true', 'try', 'typeof', 'undefined', 'var', 'void', 'while', 'with', 'yield', 'async',
      'await', 'of'
    ],
    operators: ['+', '-', '*', '/', '%', '=', '==', '===', '!=', '!==', '<', '>', '<=', '>=', '&&', '||', '!', '.', '=>'],
    brackets: [
      { open: '(', close: ')' },
      { open: '[', close: ']' },
      { open: '{', close: '}' }
    ],
    rules: [
      { pattern: /\/\*[\s\S]*?\*\/|\/\/.*$/gm, className: 'comment', description: 'Comments' },
      { pattern: /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*"|`(?:[^`\\]|\\.)*`/g, className: 'string', description: 'String literals' },
      { pattern: /\b\d+\.?\d*\b/g, className: 'number', description: 'Numbers' },
      { pattern: /\bfunction\s+\w+/g, className: 'function', description: 'Function definitions' },
      { pattern: /\bclass\s+\w+/g, className: 'class', description: 'Class definitions' }
    ]
  },
  {
    id: 'html',
    name: 'HTML',
    extensions: ['.html', '.htm'],
    keywords: [],
    operators: [],
    brackets: [
      { open: '<', close: '>' },
      { open: '<!--', close: '-->' }
    ],
    rules: [
      { pattern: /<!--[\s\S]*?-->/g, className: 'comment', description: 'HTML comments' },
      { pattern: /<\/?[\w\s="/.':;#-\/\?]+>/g, className: 'tag', description: 'HTML tags' },
      { pattern: /\s\w+(?==)/g, className: 'attribute', description: 'HTML attributes' },
      { pattern: /"[^"]*"/g, className: 'string', description: 'Attribute values' }
    ]
  },
  {
    id: 'css',
    name: 'CSS',
    extensions: ['.css', '.scss', '.sass'],
    keywords: [
      'color', 'background', 'font', 'margin', 'padding', 'border', 'width', 'height',
      'display', 'position', 'top', 'right', 'bottom', 'left', 'float', 'clear'
    ],
    operators: [':', ';', '{', '}'],
    brackets: [
      { open: '{', close: '}' },
      { open: '(', close: ')' }
    ],
    rules: [
      { pattern: /\/\*[\s\S]*?\*\//g, className: 'comment', description: 'CSS comments' },
      { pattern: /"[^"]*"|'[^']*'/g, className: 'string', description: 'String values' },
      { pattern: /#[0-9a-fA-F]{3,6}\b/g, className: 'string', description: 'Hex colors' },
      { pattern: /\d+(?:px|em|rem|%|vh|vw|pt|pc|in|cm|mm)\b/g, className: 'number', description: 'CSS units' },
      { pattern: /[.#]?[a-zA-Z][\w-]*(?=\s*{)/g, className: 'class', description: 'CSS selectors' },
      { pattern: /[a-zA-Z-]+(?=\s*:)/g, className: 'attribute', description: 'CSS properties' }
    ]
  }
]

export function EnhancedSyntaxHighlighting() {
  const [selectedTheme, setSelectedTheme] = useState<SyntaxTheme>(syntaxThemes[0])
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(languages[0])
  const [code, setCode] = useState(`<?php
// Welcome to CodeCikgu Enhanced Syntax Highlighting!
class HelloWorld {
    private $message = "Hello, World!";
    
    public function __construct($name = "CodeCikgu") {
        $this->message = "Hello, " . $name . "!";
    }
    
    public function display() {
        echo $this->message;
        return true;
    }
    
    public static function getVersion() {
        return "2.0.0";
    }
}

$hello = new HelloWorld("Malaysia");
$hello->display();

// Array operations
$numbers = [1, 2, 3, 4, 5];
$doubled = array_map(function($n) {
    return $n * 2;
}, $numbers);

foreach($doubled as $num) {
    echo "Number: $num\\n";
}
?>`)
  const [fontSize, setFontSize] = useState(14)
  const [showLineNumbers, setShowLineNumbers] = useState(true)
  const [showMinimap, setShowMinimap] = useState(true)
  const [wordWrap, setWordWrap] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [customTheme, setCustomTheme] = useState<SyntaxTheme | null>(null)
  const [copied, setCopied] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)
  const { addNotification } = useNotifications()

  const highlightCode = (text: string, language: Language, theme: SyntaxTheme) => {
    let highlighted = text

    // Apply syntax highlighting rules
    language.rules.forEach(rule => {
      highlighted = highlighted.replace(rule.pattern, (match) => {
        return `<span class="syntax-${rule.className}">${match}</span>`
      })
    })

    // Highlight keywords
    language.keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g')
      highlighted = highlighted.replace(regex, `<span class="syntax-keyword">${keyword}</span>`)
    })

    // Highlight operators
    language.operators.forEach(operator => {
      const escapedOp = operator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(`\\${escapedOp}`, 'g')
      highlighted = highlighted.replace(regex, `<span class="syntax-operator">${operator}</span>`)
    })

    return highlighted
  }

  const applyTheme = (theme: SyntaxTheme) => {
    const root = document.documentElement
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--syntax-${key}`, value)
    })
  }

  useEffect(() => {
    applyTheme(selectedTheme)
  }, [selectedTheme])

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      
      addNotification({
        type: 'success',
        title: '📋 Kod Disalin',
        message: 'Kod telah disalin ke clipboard'
      })
    } catch (error) {
      addNotification({
        type: 'error',
        title: '❌ Ralat',
        message: 'Gagal menyalin kod'
      })
    }
  }

  const exportTheme = () => {
    const dataStr = JSON.stringify(selectedTheme, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${selectedTheme.name.toLowerCase().replace(/\s+/g, '-')}-theme.json`
    link.click()

    addNotification({
      type: 'success',
      title: '💾 Tema Dieksport',
      message: `Tema "${selectedTheme.name}" telah dimuat turun`
    })
  }

  const loadSampleCode = (langId: string) => {
    const samples: Record<string, string> = {
      php: `<?php
class Calculator {
    private $history = [];
    
    public function add($a, $b) {
        $result = $a + $b;
        $this->history[] = "$a + $b = $result";
        return $result;
    }
    
    public function multiply($a, $b) {
        $result = $a * $b;
        $this->history[] = "$a * $b = $result";
        return $result;
    }
    
    public function getHistory() {
        return $this->history;
    }
}

$calc = new Calculator();
echo $calc->add(5, 3);
echo $calc->multiply(4, 2);
?>`,
      javascript: `class TodoApp {
    constructor() {
        this.todos = [];
        this.nextId = 1;
    }
    
    addTodo(text) {
        const todo = {
            id: this.nextId++,
            text: text,
            completed: false,
            createdAt: new Date()
        };
        
        this.todos.push(todo);
        return todo;
    }
    
    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
        }
        return todo;
    }
    
    getActiveTodos() {
        return this.todos.filter(todo => !todo.completed);
    }
}

const app = new TodoApp();
app.addTodo("Learn JavaScript");
app.addTodo("Build awesome apps");
console.log(app.getActiveTodos());`,
      html: `<!DOCTYPE html>
<html lang="ms">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeCikgu - Belajar Coding</title>
    <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: #1e40af; color: white; padding: 1rem; }
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1>Selamat Datang ke CodeCikgu</h1>
            <p>Platform pembelajaran programming terbaik</p>
        </header>
        
        <main>
            <section id="features">
                <h2>Ciri-ciri Utama</h2>
                <ul>
                    <li>Interactive coding playground</li>
                    <li>Step-by-step tutorials</li>
                    <li>Real-time collaboration</li>
                </ul>
            </section>
        </main>
    </div>
</body>
</html>`,
      css: `/* CodeCikgu Modern Styles */
:root {
    --primary-color: #1e40af;
    --secondary-color: #3b82f6;
    --accent-color: #06b6d4;
    --text-color: #1f2937;
    --bg-color: #f8fafc;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', sans-serif;
    color: var(--text-color);
    background: var(--bg-color);
    line-height: 1.6;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
}

.btn {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    background: var(--primary-color);
    color: white;
    text-decoration: none;
    border-radius: 0.5rem;
    transition: all 0.3s ease;
}

.btn:hover {
    background: var(--secondary-color);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

@media (max-width: 768px) {
    .container {
        padding: 0 0.5rem;
    }
}`
    }
    
    return samples[langId] || samples.php
  }

  const codeLines = code.split('\n')
  const highlightedCode = highlightCode(code, selectedLanguage, selectedTheme)

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gradient mb-2">Enhanced Syntax Highlighting</h2>
        <p className="text-gray-400">Advanced code editor with customizable themes and intelligent highlighting</p>
      </div>

      {/* Controls */}
      <div className="glass-dark rounded-xl p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Theme Selector */}
          <div className="flex items-center space-x-2">
            <Palette className="w-4 h-4 text-electric-blue" />
            <select
              value={selectedTheme.id}
              onChange={(e) => {
                const theme = syntaxThemes.find(t => t.id === e.target.value)
                if (theme) setSelectedTheme(theme)
              }}
              className="px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
            >
              {syntaxThemes.map(theme => (
                <option key={theme.id} value={theme.id}>
                  {theme.name} ({theme.type})
                </option>
              ))}
            </select>
          </div>

          {/* Language Selector */}
          <div className="flex items-center space-x-2">
            <Code className="w-4 h-4 text-electric-blue" />
            <select
              value={selectedLanguage.id}
              onChange={(e) => {
                const lang = languages.find(l => l.id === e.target.value)
                if (lang) {
                  setSelectedLanguage(lang)
                  setCode(loadSampleCode(lang.id))
                }
              }}
              className="px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
            >
              {languages.map(lang => (
                <option key={lang.id} value={lang.id}>{lang.name}</option>
              ))}
            </select>
          </div>

          {/* Font Size */}
          <div className="flex items-center space-x-2">
            <Type className="w-4 h-4 text-electric-blue" />
            <select
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
            >
              <option value={12}>12px</option>
              <option value={14}>14px</option>
              <option value={16}>16px</option>
              <option value={18}>18px</option>
              <option value={20}>20px</option>
            </select>
          </div>

          {/* Toggle Controls */}
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 text-gray-300 text-sm">
              <input
                type="checkbox"
                checked={showLineNumbers}
                onChange={(e) => setShowLineNumbers(e.target.checked)}
                className="rounded"
              />
              <Hash className="w-4 h-4" />
              <span>Line Numbers</span>
            </label>

            <label className="flex items-center space-x-2 text-gray-300 text-sm">
              <input
                type="checkbox"
                checked={wordWrap}
                onChange={(e) => setWordWrap(e.target.checked)}
                className="rounded"
              />
              <Quote className="w-4 h-4" />
              <span>Word Wrap</span>
            </label>

            <label className="flex items-center space-x-2 text-gray-300 text-sm">
              <input
                type="checkbox"
                checked={showMinimap}
                onChange={(e) => setShowMinimap(e.target.checked)}
                className="rounded"
              />
              <Monitor className="w-4 h-4" />
              <span>Minimap</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 ml-auto">
            <button
              onClick={copyCode}
              className="p-2 text-gray-400 hover:text-electric-blue transition-colors"
              title="Copy Code"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={exportTheme}
              className="p-2 text-gray-400 hover:text-electric-blue transition-colors"
              title="Export Theme"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-400 hover:text-electric-blue transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: showSettings ? '1fr 300px' : '1fr' }}>
        {/* Code Editor */}
        <div className="glass-dark rounded-xl overflow-hidden">
          {/* Editor Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <span className="text-gray-400 text-sm">
                {selectedLanguage.name} • {selectedTheme.name}
              </span>
            </div>
            
            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <span>{codeLines.length} lines</span>
              <span>•</span>
              <span>{code.length} characters</span>
            </div>
          </div>

          {/* Editor Content */}
          <div className="relative">
            <div 
              className="flex"
              style={{ 
                fontFamily: 'Fira Code, Monaco, Consolas, monospace',
                fontSize: `${fontSize}px`,
                lineHeight: '1.5'
              }}
            >
              {/* Line Numbers */}
              {showLineNumbers && (
                <div 
                  className="px-4 py-4 text-right select-none border-r border-gray-700"
                  style={{ 
                    backgroundColor: 'var(--syntax-background)',
                    color: 'var(--syntax-lineNumber)',
                    minWidth: '60px'
                  }}
                >
                  {codeLines.map((_, index) => (
                    <div key={index} style={{ height: `${fontSize * 1.5}px` }}>
                      {index + 1}
                    </div>
                  ))}
                </div>
              )}

              {/* Code Content */}
              <div className="flex-1 relative">
                {/* Background textarea for input */}
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="absolute inset-0 w-full h-full p-4 bg-transparent text-transparent resize-none outline-none font-mono caret-white z-10"
                  style={{ 
                    fontSize: `${fontSize}px`,
                    lineHeight: '1.5',
                    caretColor: 'var(--syntax-cursor)'
                  }}
                  spellCheck={false}
                  wrap={wordWrap ? 'soft' : 'off'}
                />

                {/* Highlighted code overlay */}
                <div 
                  className="p-4 pointer-events-none overflow-auto"
                  style={{ 
                    backgroundColor: 'var(--syntax-background)',
                    color: 'var(--syntax-foreground)',
                    whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
                    minHeight: '400px'
                  }}
                  dangerouslySetInnerHTML={{ __html: highlightedCode }}
                />
              </div>

              {/* Minimap */}
              {showMinimap && (
                <div 
                  className="w-20 border-l border-gray-700 overflow-hidden"
                  style={{ backgroundColor: 'var(--syntax-background)' }}
                >
                  <div 
                    className="p-2 text-xs leading-tight opacity-60"
                    style={{ 
                      fontSize: '6px',
                      lineHeight: '1.2',
                      color: 'var(--syntax-foreground)'
                    }}
                    dangerouslySetInnerHTML={{ __html: highlightedCode }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="space-y-6">
            {/* Theme Customization */}
            <div className="glass-dark rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center">
                <Palette className="w-5 h-5 mr-2 text-electric-blue" />
                Theme Customization
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Background</label>
                  <input
                    type="color"
                    value={selectedTheme.colors.background}
                    onChange={(e) => {
                      const newTheme = {
                        ...selectedTheme,
                        colors: { ...selectedTheme.colors, background: e.target.value }
                      }
                      setSelectedTheme(newTheme)
                    }}
                    className="w-full h-8 rounded border border-gray-600"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Keywords</label>
                  <input
                    type="color"
                    value={selectedTheme.colors.keyword}
                    onChange={(e) => {
                      const newTheme = {
                        ...selectedTheme,
                        colors: { ...selectedTheme.colors, keyword: e.target.value }
                      }
                      setSelectedTheme(newTheme)
                    }}
                    className="w-full h-8 rounded border border-gray-600"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Strings</label>
                  <input
                    type="color"
                    value={selectedTheme.colors.string}
                    onChange={(e) => {
                      const newTheme = {
                        ...selectedTheme,
                        colors: { ...selectedTheme.colors, string: e.target.value }
                      }
                      setSelectedTheme(newTheme)
                    }}
                    className="w-full h-8 rounded border border-gray-600"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Comments</label>
                  <input
                    type="color"
                    value={selectedTheme.colors.comment}
                    onChange={(e) => {
                      const newTheme = {
                        ...selectedTheme,
                        colors: { ...selectedTheme.colors, comment: e.target.value }
                      }
                      setSelectedTheme(newTheme)
                    }}
                    className="w-full h-8 rounded border border-gray-600"
                  />
                </div>
              </div>
            </div>

            {/* Editor Preferences */}
            <div className="glass-dark rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2 text-electric-blue" />
                Editor Preferences
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Tab Size</label>
                  <select className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm">
                    <option value={2}>2 spaces</option>
                    <option value={4}>4 spaces</option>
                    <option value={8}>8 spaces</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-gray-300 text-sm">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span>Auto-indent</span>
                  </label>
                  
                  <label className="flex items-center space-x-2 text-gray-300 text-sm">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span>Bracket matching</span>
                  </label>
                  
                  <label className="flex items-center space-x-2 text-gray-300 text-sm">
                    <input type="checkbox" className="rounded" />
                    <span>Auto-complete</span>
                  </label>
                  
                  <label className="flex items-center space-x-2 text-gray-300 text-sm">
                    <input type="checkbox" className="rounded" />
                    <span>Vim mode</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Language Features */}
            <div className="glass-dark rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center">
                <Code className="w-5 h-5 mr-2 text-electric-blue" />
                {selectedLanguage.name} Features
              </h3>
              
              <div className="space-y-3">
                <div className="text-gray-400 text-sm">
                  <strong>Keywords:</strong> {selectedLanguage.keywords.length}
                </div>
                <div className="text-gray-400 text-sm">
                  <strong>Operators:</strong> {selectedLanguage.operators.length}
                </div>
                <div className="text-gray-400 text-sm">
                  <strong>Extensions:</strong> {selectedLanguage.extensions.join(', ')}
                </div>
                
                <div className="pt-2">
                  <div className="text-gray-400 text-sm mb-2">Highlighting Rules:</div>
                  <div className="space-y-1">
                    {selectedLanguage.rules.map((rule, index) => (
                      <div key={index} className="text-xs text-gray-500">
                        • {rule.description}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom CSS for syntax highlighting */}
      <style jsx global>{`
        .syntax-comment { color: var(--syntax-comment); font-style: italic; }
        .syntax-keyword { color: var(--syntax-keyword); font-weight: bold; }
        .syntax-string { color: var(--syntax-string); }
        .syntax-number { color: var(--syntax-number); }
        .syntax-operator { color: var(--syntax-operator); }
        .syntax-function { color: var(--syntax-function); }
        .syntax-variable { color: var(--syntax-variable); }
        .syntax-class { color: var(--syntax-class); font-weight: bold; }
        .syntax-constant { color: var(--syntax-constant); }
        .syntax-tag { color: var(--syntax-tag); }
        .syntax-attribute { color: var(--syntax-attribute); }
        .syntax-php-tag { color: var(--syntax-keyword); background: rgba(255, 255, 255, 0.1); }
      `}</style>
    </div>
  )
}
