import React, { useState, useEffect } from 'react'
import { 
  File, 
  Folder, 
  Plus, 
  Trash2, 
  Download, 
  Share2, 
  Save,
  FolderPlus,
  FileText,
  Code,
  Image
} from 'lucide-react'

export interface ProjectFile {
  id: string
  name: string
  content: string
  language: string
  size: number
  lastModified: Date
  isShared: boolean
  collaborators: string[]
  parentFolder?: string
}

export interface ProjectFolder {
  id: string
  name: string
  parentFolder?: string
  isExpanded: boolean
}

interface ProjectFileSystemProps {
  onFileSelect: (file: ProjectFile) => void
  onFileCreate: (name: string, content: string, language: string) => void
  onFileUpdate: (id: string, content: string) => void
  onFileDelete: (id: string) => void
  currentUserId: string
}

export function ProjectFileSystem({
  onFileSelect,
  onFileCreate,
  onFileUpdate,
  onFileDelete,
  currentUserId
}: ProjectFileSystemProps) {
  const [files, setFiles] = useState<ProjectFile[]>([])
  const [folders, setFolders] = useState<ProjectFolder[]>([])
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [showNewFileModal, setShowNewFileModal] = useState(false)
  const [showNewFolderModal, setShowNewFolderModal] = useState(false)

  // Load user's files and folders
  useEffect(() => {
    loadUserFiles()
  }, [currentUserId])

  const loadUserFiles = async () => {
    try {
      // In production, load from Supabase
      // For now, use localStorage
      const savedFiles = localStorage.getItem(`user_files_${currentUserId}`)
      const savedFolders = localStorage.getItem(`user_folders_${currentUserId}`)
      
      if (savedFiles) {
        const parsedFiles = JSON.parse(savedFiles).map((file: any) => ({
          ...file,
          lastModified: new Date(file.lastModified)
        }))
        setFiles(parsedFiles)
      }
      
      if (savedFolders) {
        setFolders(JSON.parse(savedFolders))
      }
    } catch (error) {
      console.error('Error loading files:', error)
    }
  }

  const saveFiles = (newFiles: ProjectFile[]) => {
    setFiles(newFiles)
    localStorage.setItem(`user_files_${currentUserId}`, JSON.stringify(newFiles))
  }

  const saveFolders = (newFolders: ProjectFolder[]) => {
    setFolders(newFolders)
    localStorage.setItem(`user_folders_${currentUserId}`, JSON.stringify(newFolders))
  }

  const createFile = (name: string, language: string, folderId?: string) => {
    const newFile: ProjectFile = {
      id: Date.now().toString(),
      name,
      content: getTemplateContent(language),
      language,
      size: 0,
      lastModified: new Date(),
      isShared: false,
      collaborators: [],
      parentFolder: folderId
    }
    
    const newFiles = [...files, newFile]
    saveFiles(newFiles)
    onFileCreate(name, newFile.content, language)
    setShowNewFileModal(false)
  }

  const createFolder = (name: string, parentId?: string) => {
    const newFolder: ProjectFolder = {
      id: Date.now().toString(),
      name,
      parentFolder: parentId,
      isExpanded: true
    }
    
    const newFolders = [...folders, newFolder]
    saveFolders(newFolders)
    setShowNewFolderModal(false)
  }

  const deleteFile = (fileId: string) => {
    const newFiles = files.filter(f => f.id !== fileId)
    saveFiles(newFiles)
    onFileDelete(fileId)
  }

  const updateFile = (fileId: string, content: string) => {
    const newFiles = files.map(f => 
      f.id === fileId 
        ? { ...f, content, lastModified: new Date(), size: content.length }
        : f
    )
    saveFiles(newFiles)
    onFileUpdate(fileId, content)
  }

  const toggleFolder = (folderId: string) => {
    const newFolders = folders.map(f => 
      f.id === folderId ? { ...f, isExpanded: !f.isExpanded } : f
    )
    saveFolders(newFolders)
  }

  const getTemplateContent = (language: string): string => {
    const templates: Record<string, string> = {
      python: '# Python Code\nprint("Hello, World!")\n',
      javascript: '// JavaScript Code\nconsole.log("Hello, World!");\n',
      html: '<!DOCTYPE html>\n<html>\n<head>\n    <title>My Page</title>\n</head>\n<body>\n    <h1>Hello, World!</h1>\n</body>\n</html>\n',
      css: '/* CSS Styles */\nbody {\n    font-family: Arial, sans-serif;\n    margin: 0;\n    padding: 20px;\n}\n',
      java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}\n'
    }
    
    return templates[language] || `// ${language} code\n`
  }

  const getFileIcon = (file: ProjectFile) => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      javascript: Code,
      python: Code,
      html: FileText,
      css: FileText,
      java: Code,
      json: FileText
    }
    
    const IconComponent = iconMap[file.language] || File
    return <IconComponent className="w-4 h-4" />
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const renderFileTree = (parentId?: string, level = 0) => {
    const currentFolders = folders.filter(f => f.parentFolder === parentId)
    const currentFiles = files.filter(f => f.parentFolder === parentId)
    
    return (
      <>
        {currentFolders.map(folder => (
          <div key={folder.id} style={{ marginLeft: `${level * 16}px` }}>
            <div
              className="flex items-center space-x-2 p-2 hover:bg-gray-700 cursor-pointer rounded"
              onClick={() => toggleFolder(folder.id)}
            >
              <Folder className={`w-4 h-4 ${folder.isExpanded ? 'text-blue-400' : 'text-gray-400'}`} />
              <span className="text-sm text-gray-300">{folder.name}</span>
            </div>
            {folder.isExpanded && renderFileTree(folder.id, level + 1)}
          </div>
        ))}
        
        {currentFiles.map(file => (
          <div
            key={file.id}
            style={{ marginLeft: `${level * 16}px` }}
            className={`flex items-center justify-between p-2 hover:bg-gray-700 cursor-pointer rounded ${
              selectedFile === file.id ? 'bg-gray-600' : ''
            }`}
            onClick={() => {
              setSelectedFile(file.id)
              onFileSelect(file)
            }}
          >
            <div className="flex items-center space-x-2 flex-1">
              {getFileIcon(file)}
              <span className="text-sm text-gray-300">{file.name}</span>
              {file.isShared && (
                <Share2 className="w-3 h-3 text-green-400" />
              )}
            </div>
            
            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  deleteFile(file.id)
                }}
                className="p-1 hover:bg-gray-600 rounded"
              >
                <Trash2 className="w-3 h-3 text-red-400" />
              </button>
            </div>
          </div>
        ))}
      </>
    )
  }

  return (
    <div className="project-file-system bg-gray-800 border-r border-gray-700 w-64 flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-200">Project Files</h3>
          <div className="flex space-x-1">
            <button
              onClick={() => setShowNewFolderModal(true)}
              className="p-1 hover:bg-gray-700 rounded"
              title="New Folder"
            >
              <FolderPlus className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={() => setShowNewFileModal(true)}
              className="p-1 hover:bg-gray-700 rounded"
              title="New File"
            >
              <Plus className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        {renderFileTree()}
        
        {files.length === 0 && folders.length === 0 && (
          <div className="text-center text-gray-500 text-sm mt-8">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            No files yet
            <br />
            <button
              onClick={() => setShowNewFileModal(true)}
              className="text-blue-400 hover:text-blue-300 mt-2"
            >
              Create your first file
            </button>
          </div>
        )}
      </div>

      {/* New File Modal */}
      {showNewFileModal && (
        <NewFileModal
          onClose={() => setShowNewFileModal(false)}
          onCreate={createFile}
          folders={folders}
        />
      )}

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <NewFolderModal
          onClose={() => setShowNewFolderModal(false)}
          onCreate={createFolder}
          folders={folders}
        />
      )}
    </div>
  )
}

// Modal components would be defined here...
function NewFileModal({ onClose, onCreate, folders }: any) {
  const [name, setName] = useState('')
  const [language, setLanguage] = useState('python')
  const [parentFolder, setParentFolder] = useState('')

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-96">
        <h3 className="text-lg font-medium text-white mb-4">Create New File</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">File Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
              placeholder="main.py"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-300 mb-1">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="java">Java</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={() => onCreate(name, language, parentFolder || undefined)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
              disabled={!name}
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function NewFolderModal({ onClose, onCreate, folders }: any) {
  const [name, setName] = useState('')
  const [parentFolder, setParentFolder] = useState('')

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-96">
        <h3 className="text-lg font-medium text-white mb-4">Create New Folder</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Folder Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
              placeholder="New Folder"
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={() => onCreate(name, parentFolder || undefined)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
              disabled={!name}
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
