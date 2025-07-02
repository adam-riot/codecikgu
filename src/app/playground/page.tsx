'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'
import { useRouter } from 'next/navigation'
import CodeEditor from '@/components/playground/CodeEditor'
import ProjectManager from '@/components/playground/ProjectManager'
import { Play, Save, Download, Settings, FolderOpen, Plus, Code, Palette } from 'lucide-react'

interface Project {
  id: string
  name: string
  language: string
  code: string
  created_at: string
  updated_at: string
}

interface Profile {
  id: string
  name: string
  email: string
}

export default function Playground() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [theme, setTheme] = useState('vs-dark')
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [showProjectManager, setShowProjectManager] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [autoSave, setAutoSave] = useState(true)
  const [loading, setLoading] = useState(true)

  const languages = [
    { id: 'javascript', name: 'JavaScript', icon: '🟨', extension: 'js' },
    { id: 'typescript', name: 'TypeScript', icon: '🔷', extension: 'ts' },
    { id: 'python', name: 'Python', icon: '🐍', extension: 'py' },
    { id: 'html', name: 'HTML', icon: '🌐', extension: 'html' },
    { id: 'css', name: 'CSS', icon: '🎨', extension: 'css' },
    { id: 'java', name: 'Java', icon: '☕', extension: 'java' },
    { id: 'cpp', name: 'C++', icon: '⚡', extension: 'cpp' },
    { id: 'csharp', name: 'C#', icon: '🔵', extension: 'cs' },
    { id: 'php', name: 'PHP', icon: '🐘', extension: 'php' },
    { id: 'sql', name: 'SQL', icon: '🗄️', extension: 'sql' },
    { id: 'json', name: 'JSON', icon: '📋', extension: 'json' },
    { id: 'xml', name: 'XML', icon: '📄', extension: 'xml' },
    { id: 'markdown', name: 'Markdown', icon: '📝', extension: 'md' },
    { id: 'yaml', name: 'YAML', icon: '⚙️', extension: 'yml' },
    { id: 'go', name: 'Go', icon: '🐹', extension: 'go' }
  ]

  const themes = [
    { id: 'vs-dark', name: 'Dark (VS Code)', icon: '🌙' },
    { id: 'vs', name: 'Light', icon: '☀️' },
    { id: 'hc-black', name: 'High Contrast Dark', icon: '⚫' },
    { id: 'hc-light', name: 'High Contrast Light', icon: '⚪' }
  ]

  const codeTemplates = {
    javascript: `// JavaScript Playground
console.log("Hello, CodeCikgu!");

// Try some JavaScript code here
function greet(name) {
    return \`Hello, \${name}!\`;
}

console.log(greet("Murid"));`,

    python: `# Python Playground
print("Hello, CodeCikgu!")

# Try some Python code here
def greet(name):
    return f"Hello, {name}!"

print(greet("Murid"))`,

    html: `<!DOCTYPE html>
<html lang="ms">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeCikgu Playground</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            padding: 50px;
        }
        .container {
            background: rgba(255,255,255,0.1);
            padding: 30px;
            border-radius: 15px;
            backdrop-filter: blur(10px);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎉 Selamat Datang ke CodeCikgu Playground!</h1>
        <p>Edit HTML ini dan lihat hasilnya!</p>
        <button onclick="alert('Hello dari CodeCikgu!')">Klik Saya!</button>
    </div>
</body>
</html>`,

    css: `/* CSS Playground */
body {
    font-family: 'Arial', sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    margin: 0;
    padding: 20px;
    color: white;
}

.card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 15px;
    padding: 30px;
    margin: 20px auto;
    max-width: 500px;
    text-align: center;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.button {
    background: linear-gradient(45deg, #00d4ff, #00ff88);
    border: none;
    padding: 12px 24px;
    border-radius: 25px;
    color: white;
    font-weight: bold;
    cursor: pointer;
    transition: transform 0.3s ease;
}

.button:hover {
    transform: translateY(-2px);
}`,

    java: `// Java Playground
public class CodeCikguPlayground {
    public static void main(String[] args) {
        System.out.println("Hello, CodeCikgu!");
        
        // Try some Java code here
        String message = greet("Murid");
        System.out.println(message);
    }
    
    public static String greet(String name) {
        return "Hello, " + name + "!";
    }
}`,

    php: `<?php
// PHP Playground
echo "Hello, CodeCikgu!\\n";

// Try some PHP code here
function greet($name) {
    return "Hello, " . $name . "!";
}

echo greet("Murid");
?>`,

    sql: `-- SQL Playground
-- Create a sample table
CREATE TABLE students (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    tingkatan INT,
    xp INT
);

-- Insert sample data
INSERT INTO students VALUES 
(1, 'Ahmad', 4, 250),
(2, 'Siti', 5, 380),
(3, 'Rahman', 4, 150);

-- Query the data
SELECT name, tingkatan, xp 
FROM students 
WHERE xp > 200 
ORDER BY xp DESC;`
  }

  useEffect(() => {
    const initializePlayground = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
      }

      // Fetch projects
      await fetchProjects(user.id)

      // Set default code
      setCode(codeTemplates.javascript)
      setLoading(false)
    }

    initializePlayground()
  }, [router])

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !currentProject || !profile) return

    const saveTimer = setTimeout(() => {
      saveProject()
    }, 30000) // Auto-save every 30 seconds

    return () => clearTimeout(saveTimer)
  }, [code, autoSave, currentProject])

  const fetchProjects = async (userId: string) => {
    const { data, error } = await supabase
      .from('playground_projects')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (data && !error) {
      setProjects(data)
    }
  }

  const createNewProject = async () => {
    if (!profile) return

    const projectName = prompt('Nama projek baru:')
    if (!projectName) return

    const newProject = {
      name: projectName,
      language: language,
      code: codeTemplates[language] || '',
      user_id: profile.id
    }

    const { data, error } = await supabase
      .from('playground_projects')
      .insert(newProject)
      .select()
      .single()

    if (data && !error) {
      setCurrentProject(data)
      setCode(data.code)
      setLanguage(data.language)
      await fetchProjects(profile.id)
    }
  }

  const saveProject = async () => {
    if (!currentProject || !profile) return

    const { error } = await supabase
      .from('playground_projects')
      .update({
        code: code,
        language: language,
        updated_at: new Date().toISOString()
      })
      .eq('id', currentProject.id)

    if (!error) {
      setCurrentProject(prev => prev ? { ...prev, code, language } : null)
      await fetchProjects(profile.id)
    }
  }

  const loadProject = (project: Project) => {
    setCurrentProject(project)
    setCode(project.code)
    setLanguage(project.language)
    setShowProjectManager(false)
  }

  const downloadCode = () => {
    const selectedLang = languages.find(l => l.id === language)
    const extension = selectedLang?.extension || 'txt'
    const filename = currentProject ? 
      `${currentProject.name}.${extension}` : 
      `codecikgu-playground.${extension}`

    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const runCode = () => {
    setIsRunning(true)
    setOutput('🚀 Menjalankan kod...')

    // Simulate code execution
    setTimeout(() => {
      if (language === 'javascript') {
        try {
          // Capture console.log output
          const logs = []
          const originalLog = console.log
          console.log = (...args) => {
            logs.push(args.join(' '))
          }

          // Execute the code
          eval(code)

          // Restore console.log
          console.log = originalLog

          setOutput(logs.length > 0 ? logs.join('\\n') : 'Kod berjaya dijalankan! (Tiada output)')
        } catch (error) {
          setOutput(`❌ Ralat: ${error.message}`)
        }
      } else if (language === 'html') {
        setOutput('✅ HTML siap untuk preview! Gunakan browser untuk melihat hasil.')
      } else if (language === 'css') {
        setOutput('✅ CSS siap! Gunakan bersama HTML untuk melihat styling.')
      } else {
        setOutput(`✅ Kod ${language.toUpperCase()} siap! 
        
💡 Tip: Untuk menjalankan kod sebenar, gunakan:
• Python: python filename.py
• Java: javac filename.java && java ClassName
• C++: g++ filename.cpp -o program && ./program
• PHP: php filename.php`)
      }
      setIsRunning(false)
    }, 1000)
  }

  const changeLanguage = (newLanguage: string) => {
    setLanguage(newLanguage)
    if (!currentProject) {
      setCode(codeTemplates[newLanguage] || '')
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black">
      {/* Header */}
      <div className="border-b border-gray-700/50 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-electric-blue to-neon-cyan rounded-lg flex items-center justify-center">
                  <Code className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gradient">CodeCikgu Playground</h1>
                  <p className="text-sm text-gray-400">
                    {currentProject ? currentProject.name : 'Projek Baru'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Language Selector */}
              <select
                value={language}
                onChange={(e) => changeLanguage(e.target.value)}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:border-electric-blue focus:outline-none"
              >
                {languages.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.icon} {lang.name}
                  </option>
                ))}
              </select>

              {/* Action Buttons */}
              <button
                onClick={() => setShowProjectManager(true)}
                className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                title="Projek"
              >
                <FolderOpen className="w-4 h-4" />
              </button>

              <button
                onClick={createNewProject}
                className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                title="Projek Baru"
              >
                <Plus className="w-4 h-4" />
              </button>

              <button
                onClick={saveProject}
                disabled={!currentProject}
                className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
                title="Simpan"
              >
                <Save className="w-4 h-4" />
              </button>

              <button
                onClick={downloadCode}
                className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                title="Muat Turun"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowSettings(true)}
                className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                title="Tetapan"
              >
                <Settings className="w-4 h-4" />
              </button>

              <button
                onClick={runCode}
                disabled={isRunning}
                className="px-4 py-2 bg-gradient-to-r from-electric-blue to-neon-cyan text-white rounded-lg font-medium hover:shadow-lg hover:shadow-electric-blue/25 transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                {isRunning ? 'Menjalankan...' : 'Jalankan'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Code Editor */}
          <div className="lg:col-span-2">
            <div className="glass-dark rounded-xl overflow-hidden h-full">
              <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {languages.find(l => l.id === language)?.icon}
                  </span>
                  <span className="font-semibold text-white">
                    {languages.find(l => l.id === language)?.name} Editor
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  {autoSave && currentProject && (
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
                      Auto-save
                    </span>
                  )}
                </div>
              </div>
              <div className="h-[calc(100%-60px)]">
                <CodeEditor
                  value={code}
                  onChange={setCode}
                  language={language}
                  theme={theme}
                />
              </div>
            </div>
          </div>

          {/* Output Panel */}
          <div className="space-y-6">
            {/* Output */}
            <div className="glass-dark rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-700/50">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <span>📤</span>
                  Output
                </h3>
              </div>
              <div className="p-4 h-64 overflow-y-auto">
                <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                  {output || 'Klik "Jalankan" untuk melihat output kod anda...'}
                </pre>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="glass-dark rounded-xl p-4">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <span>💡</span>
                Tips Pantas
              </h3>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <span className="text-electric-blue">Ctrl+S:</span>
                  <span>Simpan projek</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-electric-blue">Ctrl+Enter:</span>
                  <span>Jalankan kod</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-electric-blue">Ctrl+/:</span>
                  <span>Toggle comment</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-electric-blue">Ctrl+F:</span>
                  <span>Cari dalam kod</span>
                </div>
              </div>
            </div>

            {/* Language Info */}
            <div className="glass-dark rounded-xl p-4">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <span>{languages.find(l => l.id === language)?.icon}</span>
                {languages.find(l => l.id === language)?.name}
              </h3>
              <div className="text-sm text-gray-300">
                {language === 'javascript' && (
                  <p>JavaScript adalah bahasa pemrograman yang popular untuk web development. Gunakan console.log() untuk output.</p>
                )}
                {language === 'python' && (
                  <p>Python adalah bahasa yang mudah dipelajari dengan syntax yang bersih. Gunakan print() untuk output.</p>
                )}
                {language === 'html' && (
                  <p>HTML adalah markup language untuk membina struktur web pages. Kombinasikan dengan CSS untuk styling.</p>
                )}
                {language === 'css' && (
                  <p>CSS digunakan untuk styling HTML elements. Cuba tukar warna, font, dan layout!</p>
                )}
                {language === 'java' && (
                  <p>Java adalah bahasa OOP yang kuat. Semua kod mesti dalam class dan gunakan System.out.println() untuk output.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Project Manager Modal */}
      {showProjectManager && (
        <ProjectManager
          projects={projects}
          onClose={() => setShowProjectManager(false)}
          onLoadProject={loadProject}
          onRefresh={() => profile && fetchProjects(profile.id)}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="glass-dark rounded-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gradient">Tetapan Playground</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Theme Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    <Palette className="w-4 h-4 inline mr-2" />
                    Tema Editor
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {themes.map((themeOption) => (
                      <button
                        key={themeOption.id}
                        onClick={() => setTheme(themeOption.id)}
                        className={`p-3 rounded-lg border-2 transition-all duration-300 text-left ${
                          theme === themeOption.id
                            ? 'border-electric-blue bg-electric-blue/10'
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{themeOption.icon}</span>
                          <span className="text-sm font-medium text-white">{themeOption.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Auto-save Toggle */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-300">
                    Auto-save (30 saat)
                  </label>
                  <button
                    onClick={() => setAutoSave(!autoSave)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      autoSave ? 'bg-electric-blue' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        autoSave ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-700/50">
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-full btn-primary"
                >
                  Simpan Tetapan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
