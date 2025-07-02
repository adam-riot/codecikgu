'use client'

import { useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'

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
  const editorRef = useRef<any>(null)

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor
    
    // Configure editor options
    editor.updateOptions({
      fontSize: 14,
      fontFamily: 'JetBrains Mono, Fira Code, Monaco, monospace',
      lineNumbers: 'on',
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      insertSpaces: true,
      wordWrap: 'on',
      bracketPairColorization: { enabled: true },
      guides: {
        bracketPairs: true,
        indentation: true
      }
    })

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      // Save functionality will be handled by parent
      console.log('Save shortcut pressed')
    })
  }

  const handleEditorChange = (newValue: string | undefined) => {
    if (newValue !== undefined) {
      onChange(newValue)
    }
  }

  return (
    <div className="w-full h-full border border-gray-700 rounded-lg overflow-hidden">
      <Editor
        height={height}
        language={language}
        value={value}
        theme={theme === 'dark' ? 'vs-dark' : theme === 'light' ? 'light' : 'hc-black'}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          readOnly,
          selectOnLineNumbers: true,
          automaticLayout: true,
          scrollBeyondLastLine: false,
          fontSize: 14,
          fontFamily: 'JetBrains Mono, Fira Code, Monaco, monospace',
          lineNumbers: 'on',
          minimap: { enabled: true },
          tabSize: 2,
          insertSpaces: true,
          wordWrap: 'on'
        }}
        loading={
          <div className="flex items-center justify-center h-full bg-gray-900 text-white">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p>Loading Editor...</p>
            </div>
          </div>
        }
      />
    </div>
  )
}
