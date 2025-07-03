'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { supabase } from '@/utils/supabase'
import { FaPlay, FaSave, FaCode, FaFolder, FaSun, FaMoon } from 'react-icons/fa'

// Import other components
import ProjectManager from '@/components/playground/ProjectManager'

// Dynamically import DynamicCodeEditor
const DynamicCodeEditor = dynamic(() => import('@/components/playground/DynamicCodeEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  )
})

interface Project {
  id: string
  name: string
  user_id: string
  created_at: string
  updated_at: string
  language: string
  content: string
}

export default function PlaygroundPage() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [code, setCode] = useState('')
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  // Define theme with the correct type
  const [theme, setTheme] = useState<'vs-dark' | 'light'>('vs-dark')
  const [language, setLanguage] = useState('javascript')
  
  // Define current language icon and name
  const [currentLanguageIcon, setCurrentLanguageIcon] = useState('📝')
  const [currentLanguageName, setCurrentLanguageName] = useState('JavaScript')
  const [autoSave, setAutoSave] = useState(true)
  const [currentProject, setCurrentProject] = useState<Project | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
      setIsLoading(false)
    }
    
    checkAuth()
  }, [])

  useEffect(() => {
    if (selectedProject) {
      setCode(selectedProject.content)
      setCurrentProject(selectedProject)
      
      // Update language based on project
      if (selectedProject.language) {
        setLanguage(selectedProject.language)
        
        // Update language icon and name
        if (selectedProject.language === 'javascript') {
          setCurrentLanguageIcon('📝')
          setCurrentLanguageName('JavaScript')
        } else if (selectedProject.language === 'python') {
          setCurrentLanguageIcon('🐍')
          setCurrentLanguageName('Python')
        } else if (selectedProject.language === 'html') {
          setCurrentLanguageIcon('🌐')
          setCurrentLanguageName('HTML')
        } else {
          setCurrentLanguageIcon('📝')
          setCurrentLanguageName(selectedProject.language.charAt(0).toUpperCase() + selectedProject.language.slice(1))
        }
      }
    }
  }, [selectedProject])

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project)
  }

  // Toggle theme function to use setTheme
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'vs-dark' ? 'light' : 'vs-dark')
  }

  // Toggle auto-save function to use setAutoSave
  const toggleAutoSave = () => {
    setAutoSave(prevAutoSave => !prevAutoSave)
  }

  const runCode = () => {
    setIsRunning(true)
    setOutput('')
    
    try {
      // Create a safe environment for code execution
      const originalConsoleLog = console.log
      const logs: string[] = []
      
      // Override console.log to capture output
      console.log = (...args) => {
        logs.push(args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '))
      }
      
      // Execute the code
      try {
        // Execute the code using Function constructor
        const result = new Function(code)()
        if (result !== undefined) {
          logs.push(`Return value: ${result}`)
        }
        setOutput(logs.join('\n'))
      } catch (error) {
        if (error instanceof Error) {
          setOutput(`Error: ${error.message}`)
        } else {
          setOutput('An unknown error occurred')
        }
      }
      
      // Restore original console.log
      console.log = originalConsoleLog
    } catch (error) {
      if (error instanceof Error) {
        setOutput(`Error: ${error.message}`)
      } else {
        setOutput('An unknown error occurred')
      }
    } finally {
      setIsRunning(false)
    }
  }

  const saveProject = async () => {
    if (!selectedProject) return
    
    try {
      const { error } = await supabase
        .from('playground_projects')
        .update({ content: code, updated_at: new Date().toISOString() })
        .eq('id', selectedProject.id)
      
      if (error) throw error
      
      // Update local state
      setSelectedProject({
        ...selectedProject,
        content: code,
        updated_at: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error saving project:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black flex items-center justify-center">
        <div className="glass-dark rounded-2xl p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-gradient mb-4">Playground Kod</h1>
          <p className="text-gray-300 mb-6">Sila log masuk untuk menggunakan playground kod.</p>
          <a 
            href="/login" 
            className="px-6 py-3 bg-gradient-to-r from-electric-blue to-neon-cyan text-white rounded-lg font-medium"
          >
            Log Masuk
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black flex flex-col">
      <div className="flex-1 flex">
        {/* Sidebar */}
        {showSidebar && (
          <div className="w-64 border-r border-gray-800">
            <ProjectManager 
              onSelectProject={handleProjectSelect}
              selectedProjectId={selectedProject?.id}
            />
          </div>
        )}
        
        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="bg-gray-900 border-b border-gray-800 p-2 flex items-center">
            <button 
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 text-gray-400 hover:text-white mr-2"
              title={showSidebar ? "Sembunyikan senarai projek" : "Tunjukkan senarai projek"}
            >
              {showSidebar ? <FaFolder /> : <FaCode />}
            </button>
            
            <div className="flex-1 px-2">
              {selectedProject ? (
                <span className="text-white font-medium">{selectedProject.name}</span>
              ) : (
                <span className="text-gray-500">Tiada projek dipilih</span>
              )}
            </div>
            
            {/* Theme toggle button */}
            <button 
              onClick={toggleTheme}
              className="p-2 text-gray-400 hover:text-white mr-2"
              title={theme === 'vs-dark' ? "Tukar ke tema terang" : "Tukar ke tema gelap"}
            >
              {theme === 'vs-dark' ? <FaSun /> : <FaMoon />}
            </button>
            
            {/* Auto-save toggle button */}
            <button 
              onClick={toggleAutoSave}
              className={`p-2 rounded mr-2 ${
                autoSave 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-400'
              }`}
              title={autoSave ? "Matikan auto-save" : "Hidupkan auto-save"}
            >
              Auto
            </button>
            
            <button 
              onClick={saveProject}
              disabled={!selectedProject}
              className={`p-2 rounded mr-2 ${
                !selectedProject 
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              title="Simpan projek"
            >
              <FaSave />
            </button>
            
            <button 
              onClick={runCode}
              disabled={!code.trim()}
              className={`p-2 rounded ${
                !code.trim() 
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
              title="Jalankan kod"
            >
              <FaPlay />
            </button>
          </div>
          
          {/* Editor and output */}
          <div className="flex-1 flex flex-col md:flex-row">
            <div className="flex-1 h-1/2 md:h-auto">
              <div className="lg:col-span-2">
                <div className="glass-dark rounded-xl overflow-hidden h-full">
                  <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{currentLanguageIcon}</span>
                      <span className="font-semibold text-white">{currentLanguageName} Editor</span>
                    </div>
                    {autoSave && currentProject && (
                      <span className="flex items-center gap-1 text-sm text-gray-400">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        Auto-save
                      </span>
                    )}
                  </div>
                  <div className="h-[calc(100%-60px)]">
                    {/* Use DynamicCodeEditor with proper theme type */}
                    <DynamicCodeEditor 
                      value={code} 
                      onChange={setCode} 
                      language={language} 
                      theme={theme} 
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-1/2 h-1/2 md:h-auto border-t md:border-t-0 md:border-l border-gray-800 flex flex-col">
              <div className="bg-gray-900 border-b border-gray-800 p-2">
                <h3 className="text-white font-medium">Output</h3>
              </div>
              <div className="flex-1 bg-black p-4 font-mono text-sm overflow-auto">
                {isRunning ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500 mr-2"></div>
                    <span className="text-gray-400">Menjalankan kod...</span>
                  </div>
                ) : output ? (
                  <pre className="text-white whitespace-pre-wrap">{output}</pre>
                ) : (
                  <span className="text-gray-500">Output akan dipaparkan di sini selepas kod dijalankan.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

