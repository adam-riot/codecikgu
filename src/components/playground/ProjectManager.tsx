'use client'

import React, { useState, useEffect } from 'react'
import { 
  FolderPlus, 
  FileText, 
  Trash2, 
  Edit3, 
  Download, 
  Upload, 
  Save, 
  Folder,
  Code,
  Settings,
  Star,
  StarOff,
  Clock,
  Copy
} from 'lucide-react'
import { useNotifications } from '../NotificationProvider'

interface ProjectFile {
  id: string
  name: string
  content: string
  language: string
  lastModified: Date
  size: number
}

interface Project {
  id: string
  name: string
  description: string
  files: ProjectFile[]
  language: string
  isStarred: boolean
  createdAt: Date
  lastModified: Date
  tags: string[]
  isTemplate: boolean
}

// Sample projects and templates
const defaultProjects: Project[] = [
  {
    id: 'php-hello-world',
    name: 'Hello World PHP',
    description: 'Projek asas PHP untuk pemula',
    language: 'php',
    isStarred: false,
    createdAt: new Date('2024-01-01'),
    lastModified: new Date('2024-01-01'),
    tags: ['beginner', 'tutorial'],
    isTemplate: true,
    files: [
      {
        id: 'index-php',
        name: 'index.php',
        content: `<?php
// Program Hello World pertama saya
echo "Hello, World!";

// Memaparkan tarikh dan masa
echo "<br>Tarikh: " . date("Y-m-d H:i:s");

// Menggunakan pembolehubah
$nama = "Pelajar";
echo "<br>Selamat datang, " . $nama . "!";
?>`,
        language: 'php',
        lastModified: new Date('2024-01-01'),
        size: 256
      }
    ]
  },
  {
    id: 'js-calculator',
    name: 'Kalkulator JavaScript',
    description: 'Kalkulator mudah menggunakan JavaScript',
    language: 'javascript',
    isStarred: true,
    createdAt: new Date('2024-01-02'),
    lastModified: new Date('2024-01-02'),
    tags: ['intermediate', 'calculator'],
    isTemplate: true,
    files: [
      {
        id: 'index-html',
        name: 'index.html',
        content: `<!DOCTYPE html>
<html lang="ms">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kalkulator</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="calculator">
        <div class="display">
            <input type="text" id="result" readonly>
        </div>
        <div class="buttons">
            <button onclick="clearDisplay()">C</button>
            <button onclick="deleteLast()">⌫</button>
            <button onclick="appendToDisplay('/')">/</button>
            <button onclick="appendToDisplay('*')">×</button>
            
            <button onclick="appendToDisplay('7')">7</button>
            <button onclick="appendToDisplay('8')">8</button>
            <button onclick="appendToDisplay('9')">9</button>
            <button onclick="appendToDisplay('-')">-</button>
            
            <button onclick="appendToDisplay('4')">4</button>
            <button onclick="appendToDisplay('5')">5</button>
            <button onclick="appendToDisplay('6')">6</button>
            <button onclick="appendToDisplay('+')">+</button>
            
            <button onclick="appendToDisplay('1')">1</button>
            <button onclick="appendToDisplay('2')">2</button>
            <button onclick="appendToDisplay('3')">3</button>
            <button onclick="calculate()" rowspan="2">=</button>
            
            <button onclick="appendToDisplay('0')" colspan="2">0</button>
            <button onclick="appendToDisplay('.')">.</button>
        </div>
    </div>
    <script src="script.js"></script>
</body>
</html>`,
        language: 'html',
        lastModified: new Date('2024-01-02'),
        size: 1024
      },
      {
        id: 'script-js',
        name: 'script.js',
        content: `// Kalkulator JavaScript
let display = document.getElementById('result');
let currentInput = '';
let operator = '';
let previousInput = '';

function appendToDisplay(value) {
    if (display.value === '0' && value !== '.') {
        display.value = value;
    } else {
        display.value += value;
    }
}

function clearDisplay() {
    display.value = '';
    currentInput = '';
    operator = '';
    previousInput = '';
}

function deleteLast() {
    display.value = display.value.slice(0, -1);
}

function calculate() {
    try {
        let result = eval(display.value);
        display.value = result;
    } catch (error) {
        display.value = 'Error';
    }
}

// Sokongan papan kekunci
document.addEventListener('keydown', function(event) {
    const key = event.key;
    
    if (key >= '0' && key <= '9' || key === '.') {
        appendToDisplay(key);
    } else if (key === '+' || key === '-' || key === '*' || key === '/') {
        appendToDisplay(key);
    } else if (key === 'Enter' || key === '=') {
        calculate();
    } else if (key === 'Escape' || key === 'c' || key === 'C') {
        clearDisplay();
    } else if (key === 'Backspace') {
        deleteLast();
    }
});`,
        language: 'javascript',
        lastModified: new Date('2024-01-02'),
        size: 1280
      },
      {
        id: 'style-css',
        name: 'style.css',
        content: `/* Gaya untuk kalkulator */
body {
    font-family: Arial, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    margin: 0;
}

.calculator {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    padding: 20px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.display {
    margin-bottom: 15px;
}

.display input {
    width: 100%;
    height: 60px;
    font-size: 24px;
    text-align: right;
    background: rgba(0, 0, 0, 0.3);
    border: none;
    border-radius: 10px;
    color: white;
    padding: 0 15px;
    box-sizing: border-box;
}

.buttons {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
}

button {
    height: 60px;
    font-size: 18px;
    font-weight: bold;
    border: none;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.2);
    color: white;
    cursor: pointer;
    transition: all 0.2s;
}

button:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
}

button:active {
    transform: translateY(0);
}`,
        language: 'css',
        lastModified: new Date('2024-01-02'),
        size: 1536
      }
    ]
  }
]

export function ProjectManager() {
  const [projects, setProjects] = useState<Project[]>(defaultProjects)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [currentView, setCurrentView] = useState<'list' | 'project' | 'new'>('list')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTag, setFilterTag] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'starred'>('date')
  const { addNotification } = useNotifications()

  // Load projects from localStorage
  useEffect(() => {
    const savedProjects = localStorage.getItem('codecikgu-projects')
    if (savedProjects) {
      try {
        const parsed = JSON.parse(savedProjects)
        setProjects([...defaultProjects, ...parsed])
      } catch (error) {
        console.error('Error loading projects:', error)
      }
    }
  }, [])

  // Save projects to localStorage
  const saveProjects = (newProjects: Project[]) => {
    setProjects(newProjects)
    const userProjects = newProjects.filter(p => !p.isTemplate)
    localStorage.setItem('codecikgu-projects', JSON.stringify(userProjects))
  }

  const createProject = (name: string, description: string, language: string) => {
    const newProject: Project = {
      id: Date.now().toString(),
      name,
      description,
      language,
      isStarred: false,
      createdAt: new Date(),
      lastModified: new Date(),
      tags: [],
      isTemplate: false,
      files: [
        {
          id: 'main-file',
          name: getMainFileName(language),
          content: getBoilerplateCode(language),
          language,
          lastModified: new Date(),
          size: 0
        }
      ]
    }

    saveProjects([...projects, newProject])
    setSelectedProject(newProject)
    setCurrentView('project')
    
    addNotification({
      type: 'success',
      title: '✨ Projek Baru',
      message: `Projek "${name}" telah dicipta`
    })
  }

  const duplicateProject = (project: Project) => {
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
      name: `${project.name} (Salinan)`,
      createdAt: new Date(),
      lastModified: new Date(),
      isTemplate: false,
      isStarred: false,
      files: project.files.map(file => ({
        ...file,
        id: `${file.id}-copy`,
        lastModified: new Date()
      }))
    }

    saveProjects([...projects, newProject])
    
    addNotification({
      type: 'success',
      title: '📄 Projek Disalin',
      message: `Projek "${newProject.name}" telah dicipta`
    })
  }

  const deleteProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    if (!project) return

    if (project.isTemplate) {
      addNotification({
        type: 'error',
        title: '🚫 Tidak Boleh Padam',
        message: 'Template tidak boleh dipadamkan'
      })
      return
    }

    const newProjects = projects.filter(p => p.id !== projectId)
    saveProjects(newProjects)
    
    if (selectedProject?.id === projectId) {
      setSelectedProject(null)
      setCurrentView('list')
    }

    addNotification({
      type: 'success',
      title: '🗑️ Projek Dipadamkan',
      message: `Projek "${project.name}" telah dipadamkan`
    })
  }

  const toggleStar = (projectId: string) => {
    const newProjects = projects.map(p => 
      p.id === projectId ? { ...p, isStarred: !p.isStarred } : p
    )
    saveProjects(newProjects)
  }

  const updateProject = (updatedProject: Project) => {
    const newProjects = projects.map(p => 
      p.id === updatedProject.id ? { ...updatedProject, lastModified: new Date() } : p
    )
    saveProjects(newProjects)
    setSelectedProject(updatedProject)
  }

  const exportProject = (project: Project) => {
    const dataStr = JSON.stringify(project, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${project.name.replace(/\s+/g, '-')}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    addNotification({
      type: 'success',
      title: '📤 Projek Dieksport',
      message: `Projek "${project.name}" telah dieksport`
    })
  }

  const importProject = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string)
        const newProject: Project = {
          ...imported,
          id: Date.now().toString(),
          createdAt: new Date(),
          lastModified: new Date(),
          isTemplate: false
        }
        saveProjects([...projects, newProject])
        
        addNotification({
          type: 'success',
          title: '📥 Projek Diimport',
          message: `Projek "${newProject.name}" telah diimport`
        })
      } catch (error) {
        addNotification({
          type: 'error',
          title: '❌ Import Gagal',
          message: 'Fail projek tidak sah'
        })
      }
    }
    reader.readAsText(file)
  }

  const getMainFileName = (language: string) => {
    switch (language) {
      case 'php': return 'index.php'
      case 'javascript': return 'script.js'
      case 'html': return 'index.html'
      case 'css': return 'style.css'
      case 'python': return 'main.py'
      default: return 'main.txt'
    }
  }

  const getBoilerplateCode = (language: string) => {
    switch (language) {
      case 'php':
        return `<?php
// Projek PHP baru
echo "Hello, World!";
?>`
      case 'javascript':
        return `// Projek JavaScript baru
console.log("Hello, World!");

// Tambah kod anda di sini`
      case 'html':
        return `<!DOCTYPE html>
<html lang="ms">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Projek Baru</title>
</head>
<body>
    <h1>Hello, World!</h1>
</body>
</html>`
      case 'css':
        return `/* Projek CSS baru */
body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background-color: #f5f5f5;
}

h1 {
    color: #333;
    text-align: center;
}`
      case 'python':
        return `# Projek Python baru
print("Hello, World!")

# Tambah kod anda di sini`
      default:
        return 'Projek baru'
    }
  }

  const filteredProjects = projects
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           p.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesTag = !filterTag || p.tags.includes(filterTag)
      return matchesSearch && matchesTag
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'starred':
          return b.isStarred ? 1 : -1
        case 'date':
        default:
          return b.lastModified.getTime() - a.lastModified.getTime()
      }
    })

  const allTags = [...new Set(projects.flatMap(p => p.tags))]

  if (currentView === 'new') {
    return <NewProjectForm onCreateProject={createProject} onCancel={() => setCurrentView('list')} />
  }

  if (currentView === 'project' && selectedProject) {
    return (
      <ProjectEditor 
        project={selectedProject} 
        onUpdateProject={updateProject}
        onBack={() => setCurrentView('list')}
      />
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gradient mb-2">Pengurus Projek</h2>
          <p className="text-gray-400">Urus dan cipta projek kod anda</p>
        </div>
        <div className="flex items-center space-x-3">
          <label className="btn-secondary cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            Import
            <input
              type="file"
              accept=".json"
              onChange={importProject}
              className="hidden"
            />
          </label>
          <button
            onClick={() => setCurrentView('new')}
            className="btn-primary"
          >
            <FolderPlus className="w-4 h-4 mr-2" />
            Projek Baru
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-dark rounded-xl p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Cari projek..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue"
            />
          </div>
          
          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
          >
            <option value="">Semua Tag</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
          >
            <option value="date">Tarikh Terkini</option>
            <option value="name">Nama</option>
            <option value="starred">Berbintang</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onSelect={() => {
              setSelectedProject(project)
              setCurrentView('project')
            }}
            onToggleStar={() => toggleStar(project.id)}
            onDelete={() => deleteProject(project.id)}
            onDuplicate={() => duplicateProject(project)}
            onExport={() => exportProject(project)}
          />
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <Folder className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">Tiada Projek Dijumpai</h3>
          <p className="text-gray-500 mb-6">Cuba cipta projek baru atau laraskan carian anda</p>
          <button
            onClick={() => setCurrentView('new')}
            className="btn-primary"
          >
            Cipta Projek Pertama
          </button>
        </div>
      )}
    </div>
  )
}

// Project Card Component
function ProjectCard({ 
  project, 
  onSelect, 
  onToggleStar, 
  onDelete, 
  onDuplicate, 
  onExport 
}: {
  project: Project
  onSelect: () => void
  onToggleStar: () => void
  onDelete: () => void
  onDuplicate: () => void
  onExport: () => void
}) {
  const getLanguageColor = (language: string) => {
    switch (language) {
      case 'php': return 'text-purple-400 bg-purple-400/20'
      case 'javascript': return 'text-yellow-400 bg-yellow-400/20'
      case 'html': return 'text-orange-400 bg-orange-400/20'
      case 'css': return 'text-blue-400 bg-blue-400/20'
      case 'python': return 'text-green-400 bg-green-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.RelativeTimeFormat('ms', { numeric: 'auto' }).format(
      Math.floor((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      'day'
    )
  }

  return (
    <div className="glass-dark rounded-xl p-6 card-hover group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-white truncate">{project.name}</h3>
            {project.isTemplate && (
              <span className="px-2 py-1 text-xs bg-electric-blue/20 text-electric-blue rounded-full">
                Template
              </span>
            )}
          </div>
          <p className="text-gray-400 text-sm line-clamp-2">{project.description}</p>
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleStar()
          }}
          className="text-gray-400 hover:text-yellow-400 transition-colors"
        >
          {project.isStarred ? <Star className="w-5 h-5 fill-current" /> : <StarOff className="w-5 h-5" />}
        </button>
      </div>

      {/* Info */}
      <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getLanguageColor(project.language)}`}>
          <Code className="w-3 h-3 mr-1" />
          {project.language.toUpperCase()}
        </span>
        
        <div className="flex items-center space-x-3">
          <span className="flex items-center">
            <FileText className="w-3 h-3 mr-1" />
            {project.files.length}
          </span>
          <span className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {formatDate(project.lastModified)}
          </span>
        </div>
      </div>

      {/* Tags */}
      {project.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {project.tags.slice(0, 3).map(tag => (
            <span key={tag} className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded">
              {tag}
            </span>
          ))}
          {project.tags.length > 3 && (
            <span className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded">
              +{project.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onSelect}
          className="px-4 py-2 bg-electric-blue text-black rounded-lg hover:bg-electric-blue/80 transition-colors text-sm font-medium"
        >
          Buka Projek
        </button>

        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDuplicate()
            }}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Salin Projek"
          >
            <Copy className="w-4 h-4" />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation()
              onExport()
            }}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Export Projek"
          >
            <Download className="w-4 h-4" />
          </button>

          {!project.isTemplate && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="p-2 text-gray-400 hover:text-red-400 transition-colors"
              title="Padam Projek"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// New Project Form Component
function NewProjectForm({ 
  onCreateProject, 
  onCancel 
}: { 
  onCreateProject: (name: string, description: string, language: string) => void
  onCancel: () => void 
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [language, setLanguage] = useState('php')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onCreateProject(name.trim(), description.trim(), language)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="glass-dark rounded-xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Cipta Projek Baru</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nama Projek
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue"
              placeholder="cth: Sistem Login PHP"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Deskripsi
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue"
              placeholder="Huraikan projek anda..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Bahasa Pengaturcaraan
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-electric-blue"
            >
              <option value="php">PHP</option>
              <option value="javascript">JavaScript</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="python">Python</option>
            </select>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary"
              disabled={!name.trim()}
            >
              Cipta Projek
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Project Editor Component (placeholder)
function ProjectEditor({ 
  project, 
  onUpdateProject, 
  onBack 
}: { 
  project: Project
  onUpdateProject: (project: Project) => void
  onBack: () => void 
}) {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">{project.name}</h2>
          <p className="text-gray-400">{project.description}</p>
        </div>
        <button
          onClick={onBack}
          className="btn-secondary"
        >
          Kembali ke Senarai
        </button>
      </div>

      <div className="glass-dark rounded-xl p-6">
        <p className="text-gray-300">
          Editor projek akan diintegrasikan dengan kod editor utama playground.
        </p>
      </div>
    </div>
  )
}

