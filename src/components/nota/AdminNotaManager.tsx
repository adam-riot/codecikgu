'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// TypeScript interfaces
interface Note {
  id: string
  title: string
  description: string
  subject: string
  tingkatan: string
  format: string
  file_url: string
  file_size: string
  created_at: string
}

interface FormData {
  title: string
  description: string
  subject: string
  tingkatan: string
  format: string
  file: File | null
}

interface Subject {
  id: string
  name: string
}

interface Option {
  id: string
  name: string
}

const AdminNotaManager = () => {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedSubject, setSelectedSubject] = useState<string>('all')
  const [selectedTingkatan, setSelectedTingkatan] = useState<string>('all')
  const [selectedFormat, setSelectedFormat] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState<boolean>(false)
  const [showEditModal, setShowEditModal] = useState<boolean>(false)
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)
  const [currentNote, setCurrentNote] = useState<Note | null>(null)
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    subject: 'Sains Komputer',
    tingkatan: 'Tingkatan 4',
    format: 'PDF',
    file: null
  })
  
  const router = useRouter()
  const supabase = createClientComponentClient()

  // Hanya subjek Sains Komputer sahaja
  const subjects: Subject[] = [
    { id: 'sains-komputer', name: 'Sains Komputer' }
  ]

  const tingkatanOptions: Option[] = [
    { id: 'tingkatan-4', name: 'Tingkatan 4' },
    { id: 'tingkatan-5', name: 'Tingkatan 5' }
  ]

  const formatOptions: Option[] = [
    { id: 'pdf', name: 'PDF' },
    { id: 'pptx', name: 'PowerPoint' },
    { id: 'docx', name: 'Word' },
    { id: 'xlsx', name: 'Excel' }
  ]

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async (): Promise<void> => {
    try {
      setLoading(true)
      
      // Simulasi data dari Supabase
      const mockNotes: Note[] = [
        {
          id: '1',
          title: 'Asas Pengaturcaraan Python',
          description: 'Pengenalan kepada pengaturcaraan Python, sintaks asas, dan struktur kawalan.',
          subject: 'Sains Komputer',
          tingkatan: 'Tingkatan 4',
          format: 'PDF',
          file_url: '/notes/python-basics.pdf',
          file_size: '2.5 MB',
          created_at: '2023-10-15T00:00:00Z'
        },
        {
          id: '2',
          title: 'Algoritma dan Struktur Data',
          description: 'Pengenalan kepada algoritma, kompleksiti algoritma, dan struktur data asas.',
          subject: 'Sains Komputer',
          tingkatan: 'Tingkatan 4',
          format: 'PDF',
          file_url: '/notes/algorithms.pdf',
          file_size: '3.2 MB',
          created_at: '2023-09-28T00:00:00Z'
        },
        {
          id: '3',
          title: 'Pembangunan Web Asas',
          description: 'Pengenalan kepada HTML, CSS, dan JavaScript untuk pembangunan web.',
          subject: 'Sains Komputer',
          tingkatan: 'Tingkatan 4',
          format: 'PDF',
          file_url: '/notes/web-dev.pdf',
          file_size: '4.1 MB',
          created_at: '2023-11-05T00:00:00Z'
        }
      ]
      
      setNotes(mockNotes)
    } catch (error) {
      console.error('Error fetching notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddNewNote = (): void => {
    setFormData({
      title: '',
      description: '',
      subject: 'Sains Komputer',
      tingkatan: 'Tingkatan 4',
      format: 'PDF',
      file: null
    })
    setShowAddModal(true)
  }

  const handleEditNote = (noteId: string): void => {
    const noteToEdit = notes.find((note: Note) => note.id === noteId)
    if (noteToEdit) {
      setCurrentNote(noteToEdit)
      setFormData({
        title: noteToEdit.title,
        description: noteToEdit.description,
        subject: noteToEdit.subject,
        tingkatan: noteToEdit.tingkatan,
        format: noteToEdit.format,
        file: null
      })
      setShowEditModal(true)
    }
  }

  const handleDeleteNote = (noteId: string): void => {
    const noteToDelete = notes.find((note: Note) => note.id === noteId)
    if (noteToDelete) {
      setCurrentNote(noteToDelete)
      setShowDeleteModal(true)
    }
  }

  const handleSubmitAdd = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    try {
      // Simulasi penambahan nota baru
      const newNote: Note = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        subject: formData.subject,
        tingkatan: formData.tingkatan,
        format: formData.format,
        file_url: '/notes/new-note.pdf',
        file_size: '1.0 MB',
        created_at: new Date().toISOString()
      }
      
      setNotes([...notes, newNote])
      setShowAddModal(false)
      alert('Nota baru berjaya ditambah!')
    } catch (error) {
      console.error('Error adding note:', error)
      alert('Gagal menambah nota baru.')
    }
  }

  const handleSubmitEdit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    if (!currentNote) return
    
    try {
      // Simulasi pengemaskinian nota
      const updatedNotes = notes.map((note: Note) => {
        if (note.id === currentNote.id) {
          return {
            ...note,
            title: formData.title,
            description: formData.description,
            subject: formData.subject,
            tingkatan: formData.tingkatan,
            format: formData.format
          }
        }
        return note
      })
      
      setNotes(updatedNotes)
      setShowEditModal(false)
      alert('Nota berjaya dikemaskini!')
    } catch (error) {
      console.error('Error updating note:', error)
      alert('Gagal mengemaskini nota.')
    }
  }

  const handleConfirmDelete = async (): Promise<void> => {
    if (!currentNote) return
    
    try {
      // Simulasi penghapusan nota
      const updatedNotes = notes.filter((note: Note) => note.id !== currentNote.id)
      setNotes(updatedNotes)
      setShowDeleteModal(false)
      alert('Nota berjaya dipadam!')
    } catch (error) {
      console.error('Error deleting note:', error)
      alert('Gagal memadam nota.')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0] || null
    setFormData({
      ...formData,
      file: file
    })
  }

  const filteredNotes = notes.filter((note: Note) => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          note.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSubject = selectedSubject === 'all' || note.subject === selectedSubject
    const matchesTingkatan = selectedTingkatan === 'all' || note.tingkatan === selectedTingkatan
    const matchesFormat = selectedFormat === 'all' || note.format === selectedFormat
    
    return matchesSearch && matchesSubject && matchesTingkatan && matchesFormat
  })

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
  }

  return (
    <div className="min-h-screen bg-circuit dark:bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gradient">Pengurusan Nota</h1>
            <p className="text-gray-400 mt-2">Tambah, edit, dan padam nota untuk pelajar</p>
          </div>
          <Link 
            href="/dashboard-admin" 
            className="btn-primary flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Kembali ke Dashboard Admin
          </Link>
        </div>

        {/* Action Button */}
        <div className="mb-6 flex justify-end">
          <button 
            onClick={handleAddNewNote}
            className="btn-primary flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Tambah Nota Baru
          </button>
        </div>

        {/* Filters */}
        <div className="glass-dark rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-1">Cari Nota</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari nota..."
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <svg
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Tingkatan</label>
              <select
                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedTingkatan}
                onChange={(e) => setSelectedTingkatan(e.target.value)}
              >
                <option value="all">Semua Tingkatan</option>
                {tingkatanOptions.map((option: Option) => (
                  <option key={option.id} value={option.name}>{option.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Format</label>
              <select
                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
              >
                <option value="all">Semua Format</option>
                {formatOptions.map((option: Option) => (
                  <option key={option.id} value={option.name}>{option.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Notes List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-400 loading-dots">Memuat nota</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-12 glass-dark rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-semibold mb-2">Tiada Nota Ditemui</h3>
            <p className="text-gray-400 mb-6">Tiada nota yang sepadan dengan kriteria carian anda.</p>
            <button 
              onClick={handleAddNewNote}
              className="btn-primary"
            >
              Tambah Nota Baru
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note: Note) => (
              <div key={note.id} className="glass-dark rounded-xl overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-blue-900/50 text-blue-300 mb-2">
                        {note.subject}
                      </span>
                      <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-purple-900/50 text-purple-300 mb-2 ml-2">
                        {note.tingkatan}
                      </span>
                      <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-red-900/50 text-red-300 mb-2 ml-2">
                        {note.format}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditNote(note.id)}
                        className="text-blue-500 hover:text-blue-300 transition"
                        title="Edit Nota"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-red-500 hover:text-red-300 transition"
                        title="Padam Nota"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold mt-2">{note.title}</h3>
                  <p className="text-gray-400 mt-2 line-clamp-2">{note.description}</p>
                  
                  <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                    <span>Saiz: {note.file_size}</span>
                    <span>Tarikh: {formatDate(note.created_at)}</span>
                  </div>
                </div>
                
                <div className="flex border-t border-gray-700">
                  <a 
                    href={note.file_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 text-center py-3 text-blue-400 hover:bg-blue-900/20 transition"
                  >
                    <span className="flex items-center justify-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Muat Turun
                    </span>
                  </a>
                  <a 
                    href={note.file_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 text-center py-3 text-green-400 hover:bg-green-900/20 transition border-l border-gray-700"
                  >
                    <span className="flex items-center justify-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      Lihat
                    </span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Note Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gradient">Tambah Nota Baru</h2>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmitAdd}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-400 mb-1">Tajuk Nota</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-400 mb-1">Deskripsi</label>
                  <textarea
                    className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Subjek</label>
                    <select
                      className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      required
                    >
                      {subjects.map((subject: Subject) => (
                        <option key={subject.id} value={subject.name}>{subject.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Tingkatan</label>
                    <select
                      className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.tingkatan}
                      onChange={(e) => setFormData({...formData, tingkatan: e.target.value})}
                      required
                    >
                      {tingkatanOptions.map((option: Option) => (
                        <option key={option.id} value={option.name}>{option.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Format</label>
                    <select
                      className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.format}
                      onChange={(e) => setFormData({...formData, format: e.target.value})}
                      required
                    >
                      {formatOptions.map((option: Option) => (
                        <option key={option.id} value={option.name}>{option.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-400 mb-1">Fail Nota</label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-700 border-gray-600 hover:bg-gray-600">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        {formData.file ? (
                          <p className="mb-2 text-sm text-gray-300">{formData.file.name}</p>
                        ) : (
                          <>
                            <p className="mb-2 text-sm text-gray-300">Klik untuk muat naik fail</p>
                            <p className="text-xs text-gray-500">PDF, PPTX, DOCX, XLSX (Maks. 10MB)</p>
                          </>
                        )}
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={handleFileChange}
                        accept=".pdf,.pptx,.docx,.xlsx"
                        required
                      />
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition"
                  >
                    Tambah Nota
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Note Modal */}
      {showEditModal && currentNote && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gradient">Edit Nota</h2>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmitEdit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-400 mb-1">Tajuk Nota</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-400 mb-1">Deskripsi</label>
                  <textarea
                    className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Subjek</label>
                    <select
                      className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      required
                    >
                      {subjects.map((subject: Subject) => (
                        <option key={subject.id} value={subject.name}>{subject.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Tingkatan</label>
                    <select
                      className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.tingkatan}
                      onChange={(e) => setFormData({...formData, tingkatan: e.target.value})}
                      required
                    >
                      {tingkatanOptions.map((option: Option) => (
                        <option key={option.id} value={option.name}>{option.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Format</label>
                    <select
                      className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.format}
                      onChange={(e) => setFormData({...formData, format: e.target.value})}
                      required
                    >
                      {formatOptions.map((option: Option) => (
                        <option key={option.id} value={option.name}>{option.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-400 mb-1">Fail Nota</label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-700 border-gray-600 hover:bg-gray-600">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        {formData.file ? (
                          <p className="mb-2 text-sm text-gray-300">{formData.file.name}</p>
                        ) : (
                          <>
                            <p className="mb-2 text-sm text-gray-300">Klik untuk muat naik fail baru</p>
                            <p className="text-xs text-gray-500">Fail sedia ada: {currentNote.file_url.split('/').pop()}</p>
                          </>
                        )}
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={handleFileChange}
                        accept=".pdf,.pptx,.docx,.xlsx"
                      />
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && currentNote && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-red-500">Padam Nota</h2>
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-300 mb-4">Adakah anda pasti mahu memadam nota ini?</p>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-semibold">{currentNote.title}</h3>
                  <p className="text-gray-400 text-sm mt-1">{currentNote.subject} • {currentNote.tingkatan}</p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 transition"
                >
                  Padam
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminNotaManager

