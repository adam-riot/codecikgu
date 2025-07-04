'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'
import { useRouter } from 'next/navigation'
import CodeEditor from '@/components/playground/CodeEditor'
import ProjectManager from '@/components/playground/ProjectManager'
import { Code, Save, Download, FolderOpen, Settings, Play, Square } from 'lucide-react'

interface Project {
  id: string
  title: string
  language: string
  code: string
  theme: string
  is_public: boolean
  created_at: string
  updated_at: string
}

export default function PlaygroundPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showProjectManager, setShowProjectManager] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // Editor state
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [theme, setTheme] = useState('vs-dark')
  const [fileName, setFileName] = useState('untitled')

  // Output state
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)
      await fetchProjects(user.id)
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    // Auto-save every 30 seconds
    const interval = setInterval(() => {
      if (currentProject && code !== currentProject.code) {
        handleAutoSave()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [currentProject, code])

  const fetchProjects = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('code_projects')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])

      // Load the most recent project or create a new one
      if (data && data.length > 0) {
        loadProject(data[0])
      } else {
        createNewProject()
      }

    } catch (error) {
      console.error('Error fetching projects:', error)
    }
    setLoading(false)
  }

  const createNewProject = () => {
    const newProject: Project = {
      id: '',
      title: 'Untitled Project',
      language: 'javascript',
      code: getDefaultCode('javascript'),
      theme: 'vs-dark',
      is_public: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    setCurrentProject(newProject)
    setCode(newProject.code)
    setLanguage(newProject.language)
    setTheme(newProject.theme)
    setFileName(newProject.title)
    setOutput('')
    setError('')
  }

  const loadProject = (project: Project) => {
    setCurrentProject(project)
    setCode(project.code)
    setLanguage(project.language)
    setTheme(project.theme)
    setFileName(project.title)
    setOutput('')
    setError('')
  }

  const handleRunCode = async () => {
    setIsRunning(true)
    setError('')
    setOutput('')

    try {
      if (language === 'javascript') {
        await runJavaScript(code)
      } else if (language === 'html') {
        runHTML(code)
      } else if (language === 'css') {
        runCSS(code)
      } else {
        simulateCodeExecution(language, code)
      }
    } catch (err: any) {
      setError(err.message || 'Error menjalankan kod')
    }

    setIsRunning(false)
  }

  const runJavaScript = async (jsCode: string) => {
    return new Promise((resolve, reject) => {
      try {
        // Capture console.log output
        const originalLog = console.log
        const originalError = console.error
        const originalWarn = console.warn
        let output = ''

        console.log = (...args) => {
          output += args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' ') + '\n'
        }

        console.error = (...args) => {
          output += 'ERROR: ' + args.map(arg => String(arg)).join(' ') + '\n'
        }

        console.warn = (...args) => {
          output += 'WARNING: ' + args.map(arg => String(arg)).join(' ') + '\n'
        }

        // Execute the code in a try-catch block
        try {
          // Use Function constructor to execute code in a controlled environment
          const func = new Function(jsCode)
          const result = func()
          
          if (result !== undefined) {
            output += 'Return value: ' + (typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)) + '\n'
          }

          if (output.trim() === '') {
            output = 'Kod berjaya dijalankan. Tiada output untuk dipaparkan.'
          }

          setOutput(output)
        } catch (execError: any) {
          output += 'EXECUTION ERROR: ' + execError.message + '\n'
          setOutput(output)
          setError(execError.message)
        }

        // Restore original console methods
        console.log = originalLog
        console.error = originalError
        console.warn = originalWarn

        resolve(output)
      } catch (err: any) {
        reject(err)
      }
    })
  }

  const runHTML = (htmlCode: string) => {
    // For HTML, we can show a preview
    setOutput('HTML Preview tersedia. Muat turun fail untuk melihat hasil penuh dalam browser.')
  }

  const runCSS = (cssCode: string) => {
    // For CSS, we can show basic validation
    setOutput('CSS kod telah disimpan. Muat turun fail untuk menggunakan dalam projek HTML.')
  }

  const simulateCodeExecution = (lang: string, code: string) => {
    const simulations: Record<string, string> = {
      'python': `Simulasi output Python:
>>> Kod Python anda telah dianalisis
>>> Untuk menjalankan kod Python sebenar, muat turun fail dan gunakan Python interpreter
>>> Contoh: python ${fileName}.py`,
      
      'java': `Simulasi output Java:
Compiling ${fileName}.java...
Compilation successful!
Running ${fileName}...

Untuk menjalankan kod Java sebenar:
1. Muat turun fail ${fileName}.java
2. Compile: javac ${fileName}.java
3. Run: java ${fileName.replace('.java', '')}`,
      
      'cpp': `Simulasi output C++:
Compiling ${fileName}.cpp...
Compilation successful!

Untuk menjalankan kod C++ sebenar:
1. Muat turun fail ${fileName}.cpp
2. Compile: g++ -o ${fileName.replace('.cpp', '')} ${fileName}.cpp
3. Run: ./${fileName.replace('.cpp', '')}`,
      
      'php': `Simulasi output PHP:
PHP kod telah dianalisis.

Untuk menjalankan kod PHP sebenar:
1. Muat turun fail ${fileName}.php
2. Gunakan XAMPP atau server PHP
3. Run: php ${fileName}.php`,
      
      'sql': `Simulasi output SQL:
SQL query telah dianalisis.

Untuk menjalankan SQL sebenar:
1. Muat turun fail ${fileName}.sql
2. Import ke MySQL/PostgreSQL/SQLite
3. Execute dalam database management tool`,
      
      'default': `Kod ${lang} telah disimpan.
Muat turun fail untuk menjalankan dalam environment yang sesuai.`
    }

    setOutput(simulations[lang] || simulations['default'])
  }

  const handleAutoSave = async () => {
    if (!currentProject || !user) return

    try {
      const updatedProject = {
        ...currentProject,
        code,
        language,
        theme,
        title: fileName,
        updated_at: new Date().toISOString()
      }

      if (currentProject.id) {
        // Update existing project
        const { error } = await supabase
          .from('code_projects')
          .update(updatedProject)
          .eq('id', currentProject.id)

        if (error) throw error
      } else {
        // Create new project
        const { data, error } = await supabase
          .from('code_projects')
          .insert({
            ...updatedProject,
            user_id: user.id
          })
          .select()
          .single()

        if (error) throw error
        setCurrentProject(data)
      }

    } catch (error) {
      console.error('Error auto-saving:', error)
    }
  }

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    try {
      const projectData = {
        title: fileName,
        language,
        code,
        theme,
        is_public: false,
        user_id: user.id
      }

      if (currentProject?.id) {
        // Update existing project
        const { data, error } = await supabase
          .from('code_projects')
          .update(projectData)
          .eq('id', currentProject.id)
          .select()
          .single()

        if (error) throw error
        setCurrentProject(data)
      } else {
        // Create new project
        const { data, error } = await supabase
          .from('code_projects')
          .insert(projectData)
          .select()
          .single()

        if (error) throw error
        setCurrentProject(data)
      }

      // Refresh projects list
      await fetchProjects(user.id)

    } catch (error) {
      console.error('Error saving project:', error)
      alert('Ralat menyimpan projek. Sila cuba lagi.')
    }
    setSaving(false)
  }

  const handleDownload = () => {
    const fileExtension = getFileExtension(language)
    const downloadFileName = `${fileName}.${fileExtension}`
    
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = downloadFileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getFileExtension = (lang: string) => {
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
    return extensions[lang] || 'txt'
  }

  const getDefaultCode = (lang: string) => {
    const defaultCodes: Record<string, string> = {
      'javascript': `// Welcome to CodeCikgu Playground!
// Write your JavaScript code here and click "Jalankan" to see the output

console.log("Hello, CodeCikgu!");

function greet(name) {
    return \`Hello, \${name}!\`;
}

console.log(greet("World"));

// Try some calculations
const a = 5;
const b = 3;
console.log(\`\${a} + \${b} = \${a + b}\`);

// Work with arrays
const fruits = ["apple", "banana", "orange"];
console.log("My favorite fruits:");
fruits.forEach(fruit => console.log("- " + fruit));`,
      'html': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeCikgu Project</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
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
        <h1>🚀 Welcome to CodeCikgu!</h1>
        <p>Start building your amazing web project here.</p>
        <button onclick="alert('Hello from CodeCikgu!')">Click Me!</button>
    </div>
</body>
</html>`,
      'css': `/* Welcome to CodeCikgu Playground! */
/* Write your CSS code here */

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    margin: 0;
    padding: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
}

.container {
    max-width: 800px;
    margin: 0 auto;
    background: rgba(255, 255, 255, 0.95);
    padding: 30px;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    backdrop-filter: blur(10px);
}

h1 {
    color: #333;
    text-align: center;
    margin-bottom: 30px;
}

.card {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 10px;
    margin: 20px 0;
    border-left: 4px solid #667eea;
}`,
      'python': `# Welcome to CodeCikgu Playground!
# Write your Python code here

print("Hello, CodeCikgu!")

def greet(name):
    return f"Hello, {name}!"

print(greet("World"))

# Example: Simple calculator
def add(a, b):
    return a + b

def multiply(a, b):
    return a * b

# Test the functions
result1 = add(5, 3)
result2 = multiply(4, 6)

print(f"5 + 3 = {result1}")
print(f"4 × 6 = {result2}")

# Work with lists
fruits = ["apple", "banana", "orange", "grape"]
print("\\nMy favorite fruits:")
for i, fruit in enumerate(fruits, 1):
    print(f"{i}. {fruit}")`,
      'java': `// Welcome to CodeCikgu Playground!
// Write your Java code here

public class HelloMalaysia {
    public static void main(String[] args) {
        System.out.println("Hello, CodeCikgu!");
        System.out.println("Selamat datang ke Malaysia!");
        
        String message = greet("World");
        System.out.println(message);
        
        // Simple calculations
        int a = 10;
        int b = 5;
        System.out.println(a + " + " + b + " = " + (a + b));
        System.out.println(a + " × " + b + " = " + (a * b));
        
        // Array example
        String[] cities = {"Kuala Lumpur", "Penang", "Johor Bahru", "Kota Kinabalu"};
        System.out.println("\\nMajor cities in Malaysia:");
        for (int i = 0; i < cities.length; i++) {
            System.out.println((i + 1) + ". " + cities[i]);
        }
    }
    
    public static String greet(String name) {
        return "Hello, " + name + "!";
    }
}`,
      'cpp': `// Welcome to CodeCikgu Playground!
// Write your C++ code here

#include <iostream>
#include <string>
#include <vector>

using namespace std;

string greet(string name) {
    return "Hello, " + name + "!";
}

int main() {
    cout << "Hello, CodeCikgu!" << endl;
    cout << "Selamat datang ke C++!" << endl;
    cout << greet("World") << endl;
    
    // Simple calculations
    int a = 15;
    int b = 7;
    cout << a << " + " << b << " = " << (a + b) << endl;
    cout << a << " - " << b << " = " << (a - b) << endl;
    
    // Vector example
    vector<string> languages = {"C++", "Java", "Python", "JavaScript"};
    cout << "\\nProgramming languages:" << endl;
    for (int i = 0; i < languages.size(); i++) {
        cout << (i + 1) << ". " << languages[i] << endl;
    }
    
    return 0;
}`,
      'php': `<?php
// Welcome to CodeCikgu Playground!
// Write your PHP code here

echo "Hello, CodeCikgu!\\n";
echo "Selamat datang ke PHP!\\n";

function greet($name) {
    return "Hello, " . $name . "!";
}

echo greet("World") . "\\n";

// Simple calculations
$a = 20;
$b = 8;
echo "$a + $b = " . ($a + $b) . "\\n";
echo "$a ÷ $b = " . ($a / $b) . "\\n";

// Array example
$foods = ["Nasi Lemak", "Rendang", "Satay", "Laksa"];
echo "\\nMalaysian foods:\\n";
foreach ($foods as $index => $food) {
    echo ($index + 1) . ". $food\\n";
}

// Associative array
$student = [
    "name" => "Ahmad",
    "age" => 17,
    "grade" => "Form 5"
];

echo "\\nStudent Info:\\n";
echo "Name: " . $student["name"] . "\\n";
echo "Age: " . $student["age"] . "\\n";
echo "Grade: " . $student["grade"] . "\\n";
?>`
    }
    return defaultCodes[lang] || '// Start coding here...'
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
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Code className="w-8 h-8 text-electric-blue" />
              <h1 className="text-2xl font-bold text-gradient">CodeCikgu Playground</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRunCode}
                disabled={isRunning}
                className="btn-primary flex items-center space-x-2"
              >
                {isRunning ? (
                  <>
                    <Square className="w-4 h-4" />
                    <span>Menjalankan...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Jalankan</span>
                  </>
                )}
              </button>
              
              <button
                onClick={() => setShowProjectManager(true)}
                className="btn-secondary flex items-center space-x-2"
              >
                <FolderOpen className="w-4 h-4" />
                <span>Projek</span>
              </button>
              
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-secondary flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Menyimpan...' : 'Simpan'}</span>
              </button>
              
              <button
                onClick={handleDownload}
                className="btn-secondary flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Muat Turun</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <div className="w-80 bg-gray-900/50 border-r border-gray-700/50 p-4">
          <div className="space-y-6">
            {/* Project Info */}
            <div className="glass-dark rounded-xl p-4">
              <h3 className="text-lg font-bold text-white mb-4">Maklumat Projek</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Nama Fail</label>
                  <input
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:border-electric-blue focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Bahasa</label>
                  <select
                    value={language}
                    onChange={(e) => {
                      setLanguage(e.target.value)
                      if (!currentProject?.id) {
                        setCode(getDefaultCode(e.target.value))
                      }
                      setOutput('')
                      setError('')
                    }}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:border-electric-blue focus:outline-none"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="c">C</option>
                    <option value="php">PHP</option>
                    <option value="sql">SQL</option>
                    <option value="xml">XML</option>
                    <option value="json">JSON</option>
                    <option value="markdown">Markdown</option>
                    <option value="yaml">YAML</option>
                    <option value="shell">Shell</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Tema</label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:border-electric-blue focus:outline-none"
                  >
                    <option value="vs-dark">Dark</option>
                    <option value="vs-light">Light</option>
                    <option value="hc-black">High Contrast</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-dark rounded-xl p-4">
              <h3 className="text-lg font-bold text-white mb-4">Tindakan Pantas</h3>
              <div className="space-y-2">
                <button
                  onClick={handleRunCode}
                  disabled={isRunning}
                  className="w-full btn-primary text-left flex items-center space-x-2"
                >
                  <Play className="w-4 h-4" />
                  <span>{isRunning ? 'Menjalankan...' : 'Jalankan Kod'}</span>
                </button>
                <button
                  onClick={createNewProject}
                  className="w-full btn-secondary text-left"
                >
                  📄 Projek Baru
                </button>
                <button
                  onClick={() => setShowProjectManager(true)}
                  className="w-full btn-secondary text-left"
                >
                  📁 Buka Projek
                </button>
                <button
                  onClick={handleSave}
                  className="w-full btn-secondary text-left"
                >
                  💾 Simpan Projek
                </button>
                <button
                  onClick={handleDownload}
                  className="w-full btn-secondary text-left"
                >
                  📥 Muat Turun Fail
                </button>
              </div>
            </div>

            {/* Tips */}
            <div className="glass-dark rounded-xl p-4">
              <h3 className="text-lg font-bold text-white mb-4">Tips</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <p>• Klik "Jalankan" untuk execute kod</p>
                <p>• JavaScript berjalan dalam browser</p>
                <p>• Bahasa lain menunjukkan simulasi</p>
                <p>• Ctrl+S untuk simpan pantas</p>
                <p>• Muat turun untuk jalankan di komputer</p>
              </div>
            </div>
          </div>
        </div>

        {/* Editor and Output */}
        <div className="flex-1 flex flex-col">
          {/* Editor */}
          <div className="flex-1">
            <CodeEditor
              code={code}
              language={language}
              theme={theme}
              onChange={setCode}
              fileName={fileName}
            />
          </div>

          {/* Output Panel */}
          <div className="h-64 border-t border-gray-700/50 bg-gray-900/50">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700/50">
                <h3 className="text-lg font-bold text-white">Output</h3>
                <button
                  onClick={() => {
                    setOutput('')
                    setError('')
                  }}
                  className="text-sm text-gray-400 hover:text-white"
                >
                  Clear
                </button>
              </div>
              <div className="flex-1 p-4 overflow-y-auto">
                {error && (
                  <div className="mb-4 p-3 bg-red-900/30 border border-red-500/30 rounded text-red-400 text-sm">
                    <strong>Error:</strong> {error}
                  </div>
                )}
                <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                  {output || 'Klik "Jalankan" untuk melihat output kod anda...'}
                </pre>
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
          onSelectProject={loadProject}
          onDeleteProject={(projectId) => {
            setProjects(projects.filter(p => p.id !== projectId))
          }}
        />
      )}
    </div>
  )
}

