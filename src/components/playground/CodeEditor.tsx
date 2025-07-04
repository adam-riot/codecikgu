'use client'

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import * as monaco from 'monaco-editor'

interface CodeEditorProps {
  code: string
  language: string
  theme: string
  onChange: (value: string) => void
  fileName: string
}

interface CodeEditorRef {
  getValue: () => string
  setValue: (value: string) => void
}

const CodeEditor = forwardRef<CodeEditorRef, CodeEditorProps>(
  ({ code, language, theme, onChange, fileName }, ref) => {
    const editorRef = useRef<HTMLDivElement>(null)
    const monacoRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      getValue: () => {
        if (monacoRef.current) {
          return monacoRef.current.getValue()
        }
        return code
      },
      setValue: (value: string) => {
        if (monacoRef.current) {
          monacoRef.current.setValue(value)
        }
      }
    }))

    useEffect(() => {
      if (editorRef.current && !monacoRef.current) {
        // Initialize Monaco Editor
        monacoRef.current = monaco.editor.create(editorRef.current, {
          value: code,
          language: getMonacoLanguage(language),
          theme: theme,
          automaticLayout: true,
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          minimap: { enabled: true },
          wordWrap: 'on',
          folding: true,
          lineDecorationsWidth: 10,
          lineNumbersMinChars: 3,
          glyphMargin: false,
          contextmenu: true,
          mouseWheelZoom: true,
          smoothScrolling: true,
          cursorBlinking: 'blink',
          cursorSmoothCaretAnimation: true,
          renderWhitespace: 'selection',
          renderControlCharacters: false,
          fontLigatures: true,
          suggest: {
            showKeywords: true,
            showSnippets: true,
            showFunctions: true,
            showConstructors: true,
            showFields: true,
            showVariables: true,
            showClasses: true,
            showStructs: true,
            showInterfaces: true,
            showModules: true,
            showProperties: true,
            showEvents: true,
            showOperators: true,
            showUnits: true,
            showValues: true,
            showConstants: true,
            showEnums: true,
            showEnumMembers: true,
            showColors: true,
            showFiles: true,
            showReferences: true,
            showFolders: true,
            showTypeParameters: true,
            showUsers: true,
            showIssues: true
          },
          quickSuggestions: {
            other: true,
            comments: true,
            strings: true
          },
          parameterHints: {
            enabled: true
          },
          acceptSuggestionOnCommitCharacter: true,
          acceptSuggestionOnEnter: 'on',
          accessibilitySupport: 'auto'
        })

        // Listen for content changes
        monacoRef.current.onDidChangeModelContent(() => {
          if (monacoRef.current) {
            const currentValue = monacoRef.current.getValue()
            onChange(currentValue)
          }
        })

        // Add keyboard shortcuts
        monacoRef.current.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
          // Trigger save (handled by parent component)
          const event = new CustomEvent('editor-save')
          window.dispatchEvent(event)
        })
      }

      return () => {
        if (monacoRef.current) {
          monacoRef.current.dispose()
          monacoRef.current = null
        }
      }
    }, [])

    useEffect(() => {
      if (monacoRef.current && monacoRef.current.getValue() !== code) {
        const currentPosition = monacoRef.current.getPosition()
        monacoRef.current.setValue(code)
        if (currentPosition) {
          monacoRef.current.setPosition(currentPosition)
        }
      }
    }, [code])

    useEffect(() => {
      if (monacoRef.current) {
        const model = monacoRef.current.getModel()
        if (model) {
          monaco.editor.setModelLanguage(model, getMonacoLanguage(language))
        }
      }
    }, [language])

    useEffect(() => {
      if (monacoRef.current) {
        monaco.editor.setTheme(theme)
      }
    }, [theme])

    const getMonacoLanguage = (lang: string) => {
      const languageMap: Record<string, string> = {
        'javascript': 'javascript',
        'typescript': 'typescript',
        'html': 'html',
        'css': 'css',
        'python': 'python',
        'java': 'java',
        'cpp': 'cpp',
        'c': 'c',
        'php': 'php',
        'sql': 'sql',
        'xml': 'xml',
        'json': 'json',
        'markdown': 'markdown',
        'yaml': 'yaml',
        'shell': 'shell'
      }
      return languageMap[lang] || 'plaintext'
    }

    return (
      <div className="h-full flex flex-col">
        {/* Editor Header */}
        <div className="bg-gray-800/50 border-b border-gray-700/50 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <span className="text-gray-300 text-sm font-medium">
              {fileName}.{getFileExtension(language)}
            </span>
          </div>
          
          <div className="flex items-center space-x-4 text-xs text-gray-400">
            <span>Bahasa: {getLanguageDisplayName(language)}</span>
            <span>Tema: {getThemeDisplayName(theme)}</span>
          </div>
        </div>

        {/* Monaco Editor Container */}
        <div ref={editorRef} className="flex-1" />
      </div>
    )
  }
)

CodeEditor.displayName = 'CodeEditor'

function getFileExtension(language: string) {
  const extensions: Record<string, string> = {
    'javascript': 'js',
    'typescript': 'ts',
    'html': 'html',
    'css': 'css',
    'python': 'py',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'php': 'php',
    'sql': 'sql',
    'xml': 'xml',
    'json': 'json',
    'markdown': 'md',
    'yaml': 'yml',
    'shell': 'sh'
  }
  return extensions[language] || 'txt'
}

function getLanguageDisplayName(language: string) {
  const names: Record<string, string> = {
    'javascript': 'JavaScript',
    'typescript': 'TypeScript',
    'html': 'HTML',
    'css': 'CSS',
    'python': 'Python',
    'java': 'Java',
    'cpp': 'C++',
    'c': 'C',
    'php': 'PHP',
    'sql': 'SQL',
    'xml': 'XML',
    'json': 'JSON',
    'markdown': 'Markdown',
    'yaml': 'YAML',
    'shell': 'Shell'
  }
  return names[language] || language
}

function getThemeDisplayName(theme: string) {
  const names: Record<string, string> = {
    'vs-dark': 'Dark',
    'vs-light': 'Light',
    'hc-black': 'High Contrast'
  }
  return names[theme] || theme
}

export default CodeEditor

