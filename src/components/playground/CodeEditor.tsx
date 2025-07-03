'use client'

import { useRef, useEffect } from 'react'
import { editor } from 'monaco-editor' // Import type 'editor'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language: string
  theme: string
}

export default function CodeEditor({ value, onChange, language, theme }: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const monacoInstanceRef = useRef<editor.IStandaloneCodeEditor | null>(null)

  useEffect(() => {
    if (editorRef.current) {
      // Pastikan tiada editor sedia ada sebelum mencipta yang baru
      if (!monacoInstanceRef.current) {
        monacoInstanceRef.current = editor.create(editorRef.current, {
          value: value,
          language: language,
          theme: theme,
          automaticLayout: true,
          fontSize: 14,
          minimap: { enabled: false },
        })

        monacoInstanceRef.current.onDidChangeModelContent(() => {
          const currentValue = monacoInstanceRef.current?.getValue()
          if (currentValue !== undefined) {
            onChange(currentValue)
          }
        })
      } else {
        // Jika editor sudah ada, hanya update options
        monacoInstanceRef.current.setValue(value)
        editor.setModelLanguage(monacoInstanceRef.current.getModel()!, language)
        editor.setTheme(theme)
      }
    }

    // Cleanup function untuk memusnahkan instance editor apabila komponen unmount
    return () => {
      if (monacoInstanceRef.current) {
        monacoInstanceRef.current.dispose()
        monacoInstanceRef.current = null
      }
    }
  }, [value, language, theme, onChange])

  return <div className="w-full h-full" ref={editorRef} />
}
