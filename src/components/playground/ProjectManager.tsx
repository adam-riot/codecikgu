'use client'

import { useState } from 'react'
import { supabase } from '@/utils/supabase'
import { X, Trash2, FolderOpen } from 'lucide-react'
import { Project } from '@/types' // Import Project type from shared types file

interface ProjectManagerProps {
  projects: Project[]
  onClose: () => void
  onSelectProject: (project: Project) => void
  onDeleteProject: (projectId: string) => void
}

export default function ProjectManager({ projects, onClose, onSelectProject, onDeleteProject }: ProjectManagerProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const filteredProjects = projects.filter(project => 
    project.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDeleteProject = async (projectId: string) => {
    try {
      setIsDeleting(projectId)
      const { error } = await supabase
        .from('code_projects')
        .delete()
        .eq('id', projectId)

      if (error) throw error
      
      onDeleteProject(projectId)
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('Ralat memadam projek. Sila cuba lagi.')
    } finally {
      setIsDeleting(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ms-MY', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Projek Anda</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 border-b border-gray-700">
          <input
            type="text"
            placeholder="Cari projek..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:border-electric-blue focus:outline-none"
          />
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {filteredProjects.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              {searchTerm ? 'Tiada projek ditemui.' : 'Tiada projek. Cipta projek baru untuk bermula.'}
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {filteredProjects.map(project => (
                <div key={project.id} className="p-4 hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-white">{project.title}</h3>
                      <div className="flex items-center text-sm text-gray-400 mt-1">
                        <span className="mr-3">{getLanguageDisplayName(project.language)}</span>
                        <span>{formatDate(project.updated_at)}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onSelectProject(project)}
                        className="p-2 text-gray-400 hover:text-white rounded hover:bg-gray-700"
                      >
                        <FolderOpen className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        disabled={isDeleting === project.id}
                        className="p-2 text-gray-400 hover:text-red-500 rounded hover:bg-gray-700 disabled:opacity-50"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
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

function getLanguageDisplayName(language: string) {
  const names: Record<string, string> = {
    'javascript': 'JavaScript',
    'typescript': 'TypeScript',
    'html': 'HTML',
    'css': 'CSS',
    'python': 'Python',
    'java': 'Java',
    'cpp': 'C++',
    'c': 'C',
    'php': 'PHP',
    'sql': 'SQL',
    'xml': 'XML',
    'json': 'JSON',
    'markdown': 'Markdown',
    'yaml': 'YAML',
    'shell': 'Shell'
  }
  return names[language] || language
}

