'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'
import { FaPlus, FaTrash, FaEdit, FaSave, FaTimes } from 'react-icons/fa'

interface Project {
  id: string
  name: string
  user_id: string
  created_at: string
  updated_at: string
  language: string
  content: string
}

interface ProjectManagerProps {
  onSelectProject: (project: Project) => void
  selectedProjectId?: string
}

export default function ProjectManager({ onSelectProject, selectedProjectId }: ProjectManagerProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [newProjectName, setNewProjectName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserAndProjects = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        
        setUserId(user.id)
        
        // Fetch user's projects
        const { data, error } = await supabase
          .from('playground_projects')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
        
        if (error) throw error
        
        setProjects(data || [])
        
        // If there are projects and none is selected, select the first one
        if (data && data.length > 0 && !selectedProjectId) {
          onSelectProject(data[0])
        }
      } catch (error) {
        console.error('Error fetching projects:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchUserAndProjects()
  }, [onSelectProject, selectedProjectId])

  const createNewProject = async () => {
    if (!newProjectName.trim() || !userId) return
    
    try {
      const newProject = {
        name: newProjectName.trim(),
        user_id: userId,
        language: 'javascript',
        content: '// Projek baru\n\nconsole.log("Hello, world!");'
      }
      
      const { data, error } = await supabase
        .from('playground_projects')
        .insert(newProject)
        .select()
        .single()
      
      if (error) throw error
      
      setProjects([data, ...projects])
      setNewProjectName('')
      setIsCreating(false)
      
      // Select the newly created project
      onSelectProject(data)
    } catch (error) {
      console.error('Error creating project:', error)
    }
  }

  const updateProjectName = async (id: string) => {
    if (!editName.trim()) return
    
    try {
      const { error } = await supabase
        .from('playground_projects')
        .update({ name: editName.trim() })
        .eq('id', id)
      
      if (error) throw error
      
      setProjects(projects.map(p => 
        p.id === id ? { ...p, name: editName.trim() } : p
      ))
      
      setEditingId(null)
    } catch (error) {
      console.error('Error updating project name:', error)
    }
  }

  const deleteProject = async (id: string) => {
    if (!confirm('Adakah anda pasti mahu padam projek ini?')) return
    
    try {
      const { error } = await supabase
        .from('playground_projects')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      const updatedProjects = projects.filter(p => p.id !== id)
      setProjects(updatedProjects)
      
      // If the deleted project was selected, select another one
      if (id === selectedProjectId && updatedProjects.length > 0) {
        onSelectProject(updatedProjects[0])
      }
    } catch (error) {
      console.error('Error deleting project:', error)
    }
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
        <div className="animate-pulse h-6 bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="animate-pulse h-6 bg-gray-700 rounded w-2/3 mb-4"></div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-900 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Projek Saya</h2>
        {!isCreating && (
          <button 
            onClick={() => setIsCreating(true)}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
          >
            <FaPlus />
          </button>
        )}
      </div>
      
      {isCreating && (
        <div className="mb-4 p-3 bg-gray-800 rounded-lg">
          <div className="flex items-center mb-2">
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Nama projek baru"
              className="flex-1 p-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button 
              onClick={() => setIsCreating(false)}
              className="p-2 bg-gray-700 text-white rounded hover:bg-gray-600"
            >
              Batal
            </button>
            <button 
              onClick={createNewProject}
              className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={!newProjectName.trim()}
            >
              Cipta
            </button>
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        {projects.length === 0 ? (
          <div className="text-center p-4 text-gray-400">
            Tiada projek. Cipta projek baru untuk mula.
          </div>
        ) : (
          projects.map(project => (
            <div 
              key={project.id}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                project.id === selectedProjectId 
                  ? 'bg-blue-700 hover:bg-blue-600' 
                  : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              {editingId === project.id ? (
                <div className="flex items-center">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 p-1 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                    autoFocus
                  />
                  <button 
                    onClick={() => updateProjectName(project.id)}
                    className="ml-2 p-1 text-green-400 hover:text-green-300"
                  >
                    <FaSave />
                  </button>
                  <button 
                    onClick={() => setEditingId(null)}
                    className="ml-1 p-1 text-gray-400 hover:text-gray-300"
                  >
                    <FaTimes />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div 
                    className="flex-1 truncate"
                    onClick={() => onSelectProject(project)}
                  >
                    {project.name}
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(project.id);
                        setEditName(project.name);
                      }}
                      className="p-1 text-gray-400 hover:text-white"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteProject(project.id);
                      }}
                      className="p-1 text-gray-400 hover:text-red-400"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

