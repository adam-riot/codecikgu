'use client'

import { useState } from 'react'
import { supabase } from '@/utils/supabase'
import { FaTimes, FaSearch, FaTrash, FaEdit, FaCalendar, FaCode, FaFileAlt, FaStar } from 'react-icons/fa'

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
    { id: 'cpp', name: 'C++', icon: '⚡' }
  ]

  const filteredProjects = projects
    .filter(project => 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedLanguage === 'all' || project.language === selectedLanguage)
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'language') return a.language.localeCompare(b.language)
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    })

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Adakah anda pasti mahu memadam projek ini?')) return
    
    const { error } = await supabase
      .from('playground_projects')
      .delete()
      .eq('id', projectId)
    
    if (!error) {
      onRefresh()
    }
  }

  const handleRenameProject = async (projectId: string, newName: string) => {
    const { error } = await supabase
      .from('playground_projects')
      .update({ name: newName })
      .eq('id', projectId)
    
    if (!error) {
      setEditingProject(null)
      onRefresh()
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) return 'Baru sahaja'
    if (diffInHours < 24) return `${Math.floor(diffInHours)} jam yang lalu`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} hari yang lalu`
    return date.toLocaleDateString('ms-MY')
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Pengurusan Projek</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-700 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari projek..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              {languages.map(lang => (
                <option key={lang.id} value={lang.id}>
                  {lang.icon} {lang.name}
                </option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="updated_at">Tarikh Dikemas Kini</option>
              <option value="name">Nama</option>
              <option value="language">Bahasa</option>
            </select>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <FaCode className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">Tiada Projek Dijumpai</h3>
              <p className="text-gray-500">
                {searchTerm || selectedLanguage !== 'all' 
                  ? 'Cuba ubah kriteria carian anda'
                  : 'Mula cipta projek pertama anda di playground'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map(project => (
                <div
                  key={project.id}
                  className="bg-gray-800 rounded-lg border border-gray-700 p-4 hover:border-blue-500 transition-colors group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      {editingProject === project.id ? (
                        <input
                          type="text"
                          value={newProjectName}
                          onChange={(e) => setNewProjectName(e.target.value)}
                          onBlur={() => {
                            if (newProjectName.trim()) {
                              handleRenameProject(project.id, newProjectName.trim())
                            } else {
                              setEditingProject(null)
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              if (newProjectName.trim()) {
                                handleRenameProject(project.id, newProjectName.trim())
                              }
                            } else if (e.key === 'Escape') {
                              setEditingProject(null)
                            }
                          }}
                          className="w-full bg-gray-700 text-white px-2 py-1 rounded text-sm focus:outline-none focus:bg-gray-600"
                          autoFocus
                        />
                      ) : (
                        <h3 className="font-medium text-white truncate group-hover:text-blue-400 transition-colors">
                          {project.name}
                        </h3>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-1 bg-blue-600 text-white rounded">
                          {languages.find(l => l.id === project.language)?.icon} {project.language}
                        </span>
                        {project.is_favorite && (
                          <FaStar className="w-3 h-3 text-yellow-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Code Preview */}
                  <div className="bg-gray-900 rounded p-2 mb-3 text-xs text-gray-300 font-mono overflow-hidden">
                    <div className="line-clamp-3">
                      {project.code.split('\n').slice(0, 3).join('\n') || '// Kod kosong'}
                    </div>
                  </div>

                  {/* Project Stats */}
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                    <span className="flex items-center gap-1">
                      <FaFileAlt className="w-3 h-3" />
                      {project.code.split('\n').length} baris
                    </span>
                    <span className="flex items-center gap-1">
                      <FaCalendar className="w-3 h-3" />
                      {formatDate(project.updated_at)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => onLoadProject(project)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      Buka
                    </button>
                    <button
                      onClick={() => {
                        setEditingProject(project.id)
                        setNewProjectName(project.name)
                      }}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                    >
                      <FaEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
