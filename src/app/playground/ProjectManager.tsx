'use client'

import { useState } from 'react'
import { supabase } from '@/utils/supabase'
import { X, Search, Trash2, Edit3, Calendar, Code, FileText, Download, Star } from 'lucide-react'

interface Project {
  id: string
  name: string
  language: string
  code: string
  created_at: string
  updated_at: string
  is_favorite?: boolean
}

interface ProjectManagerProps {
  projects: Project[]
  onClose: () => void
  onLoadProject: (project: Project) => void
  onRefresh: () => void
}

export default function ProjectManager({ 
  projects, 
  onClose, 
  onLoadProject, 
  onRefresh 
}: ProjectManagerProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('all')
  const [sortBy, setSortBy] = useState('updated_at')
  const [editingProject, setEditingProject] = useState<string | null>(null)
  const [newProjectName, setNewProjectName] = useState('')

  const languages = [
    { id: 'all', name: 'Semua Bahasa', icon: '📁' },
    { id: 'javascript', name: 'JavaScript', icon: '🟨' },
    { id: 'typescript', name: 'TypeScript', icon: '🔷' },
    { id: 'python', name: 'Python', icon: '🐍' },
    { id: 'html', name: 'HTML', icon: '🌐' },
    { id: 'css', name: 'CSS', icon: '🎨' },
    { id: 'java', name: 'Java', icon: '☕' },
    { id: 'cpp', name: 'C++', icon: '⚡' },
    { id: 'csharp', name: 'C#', icon: '🔵' },
    { id: 'php', name: 'PHP', icon: '🐘' },
    { id: 'sql', name: 'SQL', icon: '🗄️' }
  ]

  const getLanguageInfo = (langId: string) => {
    return languages.find(l => l.id === langId) || { icon: '📄', name: langId }
  }

  const filteredProjects = projects
    .filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.language.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesLanguage = selectedLanguage === 'all' || project.language === selectedLanguage
      return matchesSearch && matchesLanguage
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'language':
          return a.language.localeCompare(b.language)
        case 'created_at':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'updated_at':
        default:
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      }
    })

  const deleteProject = async (projectId: string) => {
    if (!confirm('Adakah anda pasti mahu memadamkan projek ini?')) return

    const { error } = await supabase
      .from('playground_projects')
      .delete()
      .eq('id', projectId)

    if (!error) {
      onRefresh()
    } else {
      alert('Ralat memadamkan projek. Sila cuba lagi.')
    }
  }

  const renameProject = async (projectId: string, newName: string) => {
    if (!newName.trim()) return

    const { error } = await supabase
      .from('playground_projects')
      .update({ name: newName.trim() })
      .eq('id', projectId)

    if (!error) {
      setEditingProject(null)
      setNewProjectName('')
      onRefresh()
    } else {
      alert('Ralat menukar nama projek. Sila cuba lagi.')
    }
  }

  const toggleFavorite = async (projectId: string, currentFavorite: boolean) => {
    const { error } = await supabase
      .from('playground_projects')
      .update({ is_favorite: !currentFavorite })
      .eq('id', projectId)

    if (!error) {
      onRefresh()
    }
  }

  const downloadProject = (project: Project) => {
    const langInfo = getLanguageInfo(project.language)
    const extension = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      html: 'html',
      css: 'css',
      java: 'java',
      cpp: 'cpp',
      csharp: 'cs',
      php: 'php',
      sql: 'sql',
      json: 'json',
      xml: 'xml',
      markdown: 'md',
      yaml: 'yml',
      go: 'go'
    }[project.language] || 'txt'

    const filename = `${project.name}.${extension}`
    const blob = new Blob([project.code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return 'Baru sahaja'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} jam yang lalu`
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)} hari yang lalu`
    } else {
      return date.toLocaleDateString('ms-MY', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  }

  const getCodePreview = (code: string) => {
    const lines = code.split('\n').filter(line => line.trim())
    return lines.slice(0, 3).join('\n') + (lines.length > 3 ? '\n...' : '')
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="glass-dark rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-electric-blue to-neon-cyan bg-clip-text text-transparent">
              Pengurus Projek
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari projek..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-electric-blue focus:outline-none"
              />
            </div>

            {/* Language Filter */}
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-electric-blue focus:outline-none"
            >
              {languages.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.icon} {lang.name}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-electric-blue focus:outline-none"
            >
              <option value="updated_at">Terkini</option>
              <option value="created_at">Dicipta</option>
              <option value="name">Nama</option>
              <option value="language">Bahasa</option>
            </select>
          </div>
        </div>

        {/* Projects List */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📁</div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">
                {searchTerm || selectedLanguage !== 'all' ? 'Tiada projek ditemui' : 'Tiada projek lagi'}
              </h3>
              <p className="text-gray-400">
                {searchTerm || selectedLanguage !== 'all' 
                  ? 'Cuba tukar kriteria carian anda'
                  : 'Mula cipta projek pertama anda di playground!'
                }
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => {
                const langInfo = getLanguageInfo(project.language)
                return (
                  <div
                    key={project.id}
                    className="glass rounded-xl p-4 border border-gray-700/50 hover:border-electric-blue/30 transition-all duration-300 group"
                  >
                    {/* Project Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-xl">{langInfo.icon}</span>
                        {editingProject === project.id ? (
                          <input
                            type="text"
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.target.value)}
                            onBlur={() => renameProject(project.id, newProjectName)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                renameProject(project.id, newProjectName)
                              } else if (e.key === 'Escape') {
                                setEditingProject(null)
                                setNewProjectName('')
                              }
                            }}
                            className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:border-electric-blue focus:outline-none"
                            autoFocus
                          />
                        ) : (
                          <h3 className="font-semibold text-white truncate flex-1">
                            {project.name}
                          </h3>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => toggleFavorite(project.id, project.is_favorite || false)}
                          className={`p-1 rounded transition-colors ${
                            project.is_favorite 
                              ? 'text-yellow-400 hover:text-yellow-300' 
                              : 'text-gray-400 hover:text-yellow-400'
                          }`}
                          title={project.is_favorite ? 'Buang dari kegemaran' : 'Tambah ke kegemaran'}
                        >
                          <Star className={`w-4 h-4 ${project.is_favorite ? 'fill-current' : ''}`} />
                        </button>
                        
                        <button
                          onClick={() => {
                            setEditingProject(project.id)
                            setNewProjectName(project.name)
                          }}
                          className="p-1 text-gray-400 hover:text-electric-blue transition-colors"
                          title="Tukar nama"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => downloadProject(project)}
                          className="p-1 text-gray-400 hover:text-neon-green transition-colors"
                          title="Muat turun"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => deleteProject(project.id)}
                          className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                          title="Padam"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Language Badge */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-electric-blue/20 text-electric-blue border border-electric-blue/30">
                        {langInfo.name}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(project.updated_at)}
                      </span>
                    </div>

                    {/* Code Preview */}
                    <div className="mb-4">
                      <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
                        <pre className="text-xs text-gray-300 font-mono overflow-hidden">
                          {getCodePreview(project.code)}
                        </pre>
                      </div>
                    </div>

                    {/* Project Stats */}
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                      <span className="flex items-center gap-1">
                        <Code className="w-3 h-3" />
                        {project.code.split('\n').length} baris
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {project.code.length} aksara
                      </span>
                    </div>

                    {/* Load Button */}
                    <button
                      onClick={() => onLoadProject(project)}
                      className="w-full px-4 py-2 bg-gradient-to-r from-electric-blue to-neon-cyan text-white rounded-lg font-medium hover:shadow-lg hover:shadow-electric-blue/25 transition-all duration-300"
                    >
                      Buka Projek
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700/50 bg-gray-900/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-400">
              {filteredProjects.length} daripada {projects.length} projek
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={onRefresh}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Refresh
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gradient-to-r from-electric-blue to-neon-cyan text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
