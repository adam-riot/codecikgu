'use client'

import { useState, useEffect, useRef } from 'react'
import { Editor } from '@monaco-editor/react'
import { supabase } from '@/utils/supabase'

interface CodeEditorProps {
  projectId?: string
  initialCode?: string
  language?: string
  readOnly?: boolean
  onCodeChange?: (code: string) => void
  height?: string
  theme?: 'vs-dark' | 'light'
}

export default function CodeEditor({
  projectId,
  initialCode = '// Tulis kod anda di sini\n\nconsole.log("Hello, world!");',
  language = 'javascript',
  readOnly = false,
  onCodeChange,
  height = '70vh',
  theme = 'vs-dark'
}: CodeEditorProps) {
  const [code, setCode] = useState(initialCode)
  const [isLoading, setIsLoading] = useState(!!projectId)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | null>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (projectId) {
      const fetchCode = async () => {
        try {
          const { data, error } = await supabase
            .from('playground_projects')
            .select('content')
            .eq('id', projectId)
            .single()

          if (error) throw error
          if (data?.content) {
            setCode(data.content)
          }
        } catch (error) {
          console.error('Error fetching code:', error)
        } finally {
          setIsLoading(false)
        }
      }

      fetchCode()
    }
  }, [projectId])

  useEffect(() => {
    // Clean up timeout on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  const handleEditorChange = (value: string | undefined) => {
    const newCode = value || ''
    setCode(newCode)
    
    if (onCodeChange) {
      onCodeChange(newCode)
    }

    if (projectId) {
      // Debounce save operation
      setSaveStatus('saving')
      
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      
      saveTimeoutRef.current = setTimeout(() => {
        saveCode(newCode)
      }, 1000)
    }
  }

  const saveCode = async (codeToSave: string) => {
    if (!projectId || readOnly) return
    
    try {
      const { error } = await supabase
        .from('playground_projects')
        .update({ content: codeToSave, updated_at: new Date().toISOString() })
        .eq('id', projectId)

      if (error) throw error
      setSaveStatus('saved')
    } catch (error) {
      console.error('Error saving code:', error)
      setSaveStatus('error')
    } finally {
      // Clear saved status after 3 seconds
      setTimeout(() => {
        if (saveStatus === 'saved') {
          setSaveStatus(null)
        }
      }, 3000)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="relative h-full">
      <Editor
        height={height}
        defaultLanguage={language}
        defaultValue={code}
        theme={theme}
        onChange={handleEditorChange}
        options={{
          readOnly,
          minimap: { enabled: true },
          scrollBeyondLastLine: false,
          fontSize: 14,
          tabSize: 2,
          automaticLayout: true,
          wordWrap: 'on'
        }}
      />
      
      {projectId && (
        <div className="absolute top-2 right-2 px-2 py-1 rounded text-xs">
          {saveStatus === 'saving' && (
            <span className="text-yellow-400">Menyimpan...</span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-green-400">Disimpan</span>
          )}
          {saveStatus === 'error' && (
            <span className="text-red-400">Ralat menyimpan</span>
          )}
        </div>
      )}
    </div>
  )
}

