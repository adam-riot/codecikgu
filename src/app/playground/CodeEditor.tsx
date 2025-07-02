'use client'

import { useEffect, useRef } from 'react'
import * as monaco from 'monaco-editor'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language: string
  theme: string
  readOnly?: boolean
  height?: string
}

export default function CodeEditor({
  value,
  onChange,
  language,
  theme,
  readOnly = false,
  height = '100%'
}: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const monacoRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)

  useEffect(() => {
    if (!editorRef.current) return

    // Configure Monaco Editor
    monaco.editor.defineTheme('codecikgu-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
        { token: 'keyword', foreground: '569CD6' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'type', foreground: '4EC9B0' },
        { token: 'function', foreground: 'DCDCAA' },
        { token: 'variable', foreground: '9CDCFE' },
      ],
      colors: {
        'editor.background': '#0D1117',
        'editor.foreground': '#E6EDF3',
        'editorLineNumber.foreground': '#7D8590',
        'editorLineNumber.activeForeground': '#E6EDF3',
        'editor.selectionBackground': '#264F78',
        'editor.selectionHighlightBackground': '#264F7840',
        'editorCursor.foreground': '#E6EDF3',
        'editor.findMatchBackground': '#515C6A',
        'editor.findMatchHighlightBackground': '#515C6A40',
        'editorWidget.background': '#161B22',
        'editorWidget.border': '#30363D',
        'editorSuggestWidget.background': '#161B22',
        'editorSuggestWidget.border': '#30363D',
        'editorSuggestWidget.selectedBackground': '#264F78',
        'editorHoverWidget.background': '#161B22',
        'editorHoverWidget.border': '#30363D',
      }
    })

    // Language configurations
    const languageConfigs = {
      javascript: {
        language: 'javascript',
        suggestions: [
          'console.log', 'function', 'const', 'let', 'var', 'if', 'else', 'for', 'while',
          'return', 'true', 'false', 'null', 'undefined', 'typeof', 'instanceof'
        ]
      },
      typescript: {
        language: 'typescript',
        suggestions: [
          'interface', 'type', 'class', 'extends', 'implements', 'public', 'private',
          'protected', 'readonly', 'static', 'abstract', 'enum'
        ]
      },
      python: {
        language: 'python',
        suggestions: [
          'print', 'def', 'class', 'if', 'elif', 'else', 'for', 'while', 'import',
          'from', 'return', 'True', 'False', 'None', 'and', 'or', 'not', 'in'
        ]
      },
      html: {
        language: 'html',
        suggestions: [
          'div', 'span', 'p', 'h1', 'h2', 'h3', 'a', 'img', 'ul', 'ol', 'li',
          'table', 'tr', 'td', 'th', 'form', 'input', 'button', 'script', 'style'
        ]
      },
      css: {
        language: 'css',
        suggestions: [
          'color', 'background', 'font-size', 'margin', 'padding', 'border',
          'width', 'height', 'display', 'position', 'flex', 'grid', 'transform'
        ]
      },
      java: {
        language: 'java',
        suggestions: [
          'public', 'private', 'protected', 'static', 'final', 'class', 'interface',
          'extends', 'implements', 'import', 'package', 'void', 'int', 'String'
        ]
      },
      cpp: {
        language: 'cpp',
        suggestions: [
          'include', 'using', 'namespace', 'std', 'cout', 'cin', 'endl',
          'int', 'char', 'float', 'double', 'bool', 'void', 'class', 'struct'
        ]
      },
      csharp: {
        language: 'csharp',
        suggestions: [
          'using', 'namespace', 'class', 'interface', 'public', 'private',
          'protected', 'static', 'void', 'int', 'string', 'bool', 'Console'
        ]
      },
      php: {
        language: 'php',
        suggestions: [
          'echo', 'print', 'var_dump', 'function', 'class', 'public', 'private',
          'protected', 'static', 'if', 'else', 'foreach', 'while', 'for'
        ]
      },
      sql: {
        language: 'sql',
        suggestions: [
          'SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'CREATE',
          'ALTER', 'DROP', 'TABLE', 'INDEX', 'JOIN', 'LEFT', 'RIGHT', 'INNER'
        ]
      }
    }

    // Create editor
    const editor = monaco.editor.create(editorRef.current, {
      value: value,
      language: languageConfigs[language]?.language || language,
      theme: theme === 'vs-dark' ? 'codecikgu-dark' : theme,
      readOnly: readOnly,
      automaticLayout: true,
      fontSize: 14,
      lineHeight: 20,
      fontFamily: "'Fira Code', 'JetBrains Mono', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
      fontLigatures: true,
      minimap: {
        enabled: true,
        scale: 1,
        showSlider: 'mouseover'
      },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      lineNumbers: 'on',
      glyphMargin: true,
      folding: true,
      lineDecorationsWidth: 10,
      lineNumbersMinChars: 3,
      renderLineHighlight: 'all',
      selectOnLineNumbers: true,
      roundedSelection: false,
      cursorStyle: 'line',
      cursorBlinking: 'blink',
      cursorSmoothCaretAnimation: true,
      smoothScrolling: true,
      contextmenu: true,
      mouseWheelZoom: true,
      multiCursorModifier: 'ctrlCmd',
      accessibilitySupport: 'auto',
      quickSuggestions: {
        other: true,
        comments: false,
        strings: false
      },
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnEnter: 'on',
      tabCompletion: 'on',
      wordBasedSuggestions: true,
      parameterHints: {
        enabled: true,
        cycle: true
      },
      autoIndent: 'full',
      formatOnPaste: true,
      formatOnType: true,
      dragAndDrop: true,
      links: true,
      colorDecorators: true,
      lightbulb: {
        enabled: true
      },
      find: {
        addExtraSpaceOnTop: false,
        autoFindInSelection: 'never',
        seedSearchStringFromSelection: 'always'
      },
      bracketPairColorization: {
        enabled: true
      },
      guides: {
        bracketPairs: true,
        bracketPairsHorizontal: true,
        highlightActiveBracketPair: true,
        indentation: true
      }
    })

    monacoRef.current = editor

    // Add custom key bindings
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      // Trigger save (handled by parent component)
      const event = new CustomEvent('editor-save')
      window.dispatchEvent(event)
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      // Trigger run (handled by parent component)
      const event = new CustomEvent('editor-run')
      window.dispatchEvent(event)
    })

    // Add custom snippets for different languages
    const addSnippets = (lang: string) => {
      const snippets = {
        javascript: [
          {
            label: 'log',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'console.log(${1:message});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Log to console'
          },
          {
            label: 'func',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'function ${1:name}(${2:params}) {\n\t${3:// code}\n\treturn ${4:value};\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Function declaration'
          },
          {
            label: 'arrow',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'const ${1:name} = (${2:params}) => {\n\t${3:// code}\n\treturn ${4:value};\n};',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Arrow function'
          }
        ],
        python: [
          {
            label: 'def',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'def ${1:function_name}(${2:params}):\n\t${3:pass}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Function definition'
          },
          {
            label: 'class',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'class ${1:ClassName}:\n\tdef __init__(self${2:, params}):\n\t\t${3:pass}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Class definition'
          },
          {
            label: 'if',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'if ${1:condition}:\n\t${2:pass}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'If statement'
          }
        ],
        html: [
          {
            label: 'html5',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '<!DOCTYPE html>\n<html lang="ms">\n<head>\n\t<meta charset="UTF-8">\n\t<meta name="viewport" content="width=device-width, initial-scale=1.0">\n\t<title>${1:Document}</title>\n</head>\n<body>\n\t${2:content}\n</body>\n</html>',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'HTML5 boilerplate'
          },
          {
            label: 'div',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '<div class="${1:class-name}">\n\t${2:content}\n</div>',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Div element with class'
          }
        ]
      }

      if (snippets[lang]) {
        monaco.languages.registerCompletionItemProvider(lang, {
          provideCompletionItems: () => {
            return {
              suggestions: snippets[lang]
            }
          }
        })
      }
    }

    // Add snippets for current language
    addSnippets(language)

    // Listen for content changes
    const disposable = editor.onDidChangeModelContent(() => {
      const newValue = editor.getValue()
      onChange(newValue)
    })

    // Cleanup function
    return () => {
      disposable.dispose()
      editor.dispose()
    }
  }, [])

  // Update editor when props change
  useEffect(() => {
    if (monacoRef.current) {
      const currentValue = monacoRef.current.getValue()
      if (currentValue !== value) {
        monacoRef.current.setValue(value)
      }
    }
  }, [value])

  useEffect(() => {
    if (monacoRef.current) {
      monaco.editor.setModelLanguage(
        monacoRef.current.getModel()!,
        language === 'cpp' ? 'cpp' : 
        language === 'csharp' ? 'csharp' : 
        language
      )
    }
  }, [language])

  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.updateOptions({
        theme: theme === 'vs-dark' ? 'codecikgu-dark' : theme
      })
    }
  }, [theme])

  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.updateOptions({
        readOnly: readOnly
      })
    }
  }, [readOnly])

  return (
    <div 
      ref={editorRef} 
      style={{ 
        height: height,
        width: '100%',
        minHeight: '300px'
      }}
      className="monaco-editor-container"
    />
  )
}
