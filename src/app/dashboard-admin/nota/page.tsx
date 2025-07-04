'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase'
import { 
  FileText, 
  Plus, 
  Trash2, 
  Edit, 
  Search, 
  Upload, 
  X, 
  Check, 
  AlertTriangle,
  Download,
  Eye
} from 'lucide-react'

// Interface untuk data nota
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
  updated_at: string
}

export default function AdminNotaManager() {
  const router = useRouter()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('semua')
  const [selectedTingkatan, setSelectedTingkatan] = useState('semua')
  
  // State untuk form tambah/edit nota
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentNote, setCurrentNote] = useState<Note | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    tingkatan: '',
    format: 'PDF',
    file: null as File | null
  })
  const [uploadProgress, setUploadProgress] = useState(0)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  
  // State untuk konfirmasi hapus
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null)

  // Contoh data subjek
  const subjects = [
    { id: 'sains-komputer', name: 'Sains Komputer' },
    { id: 'matematik', name: 'Matematik' },
    { id: 'bahasa-melayu', name: 'Bahasa Melayu' },
    { id: 'bahasa-inggeris', name: 'Bahasa Inggeris' },
    { id: 'sejarah', name: 'Sejarah' },
    { id: 'reka-bentuk', name: 'Reka Bentuk Teknologi' },
    { id: 'sains', name: 'Sains' },
    { id: 'pendidikan-islam', name: 'Pendidikan Islam' },
    { id: 'prinsip-perakaunan', name: 'Prinsip Perakaunan' },
    { id: 'ekonomi', name: 'Ekonomi' },
    { id: 'geografi', name: 'Geografi' }
  ]

  // Contoh data tingkatan
  const tingkatan = [
    { id: 'tingkatan-4', name: 'Tingkatan 4' },
    { id: 'tingkatan-5', name: 'Tingkatan 5' }
  ]

  // Contoh data format
  const formats = ['PDF', 'PPTX', 'DOCX', 'XLSX']

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user || user.email !== 'adamsofi@codecikgu.com') {
        router.push('/login')
        return
      }

      await fetchNotes()
    }

    checkAuth()
  }, [router])

  const fetchNotes = async () => {
    try {
      // Dalam implementasi sebenar, ini akan mengambil data dari Supabase
      // Untuk contoh ini, kita gunakan data dummy
      const dummyNotes: Note[] = [
        {
          id: '1',
          title: 'Asas Pengaturcaraan Python',
          description: 'Pengenalan kepada pengaturcaraan Python, sintaks asas, dan struktur kawalan.',
          subject: 'Sains Komputer',
          tingkatan: 'Tingkatan 4',
          format: 'PDF',
          file_url: '#',
          file_size: '2.5 MB',
          created_at: '2023-10-15',
          updated_at: '2023-10-15'
        },
        {
          id: '2',
          title: 'Algoritma dan Struktur Data',
          description: 'Pengenalan kepada algoritma, kompleksiti algoritma, dan struktur data asas.',
          subject: 'Sains Komputer',
          tingkatan: 'Tingkatan 4',
          format: 'PDF',
          file_url: '#',
          file_size: '3.2 MB',
          created_at: '2023-09-28',
          updated_at: '2023-09-28'
        },
        {
          id: '3',
          title: 'Pembangunan Web Asas',
          description: 'Pengenalan kepada HTML, CSS, dan JavaScript untuk pembangunan web.',
          subject: 'Sains Komputer',
          tingkatan: 'Tingkatan 4',
          format: 'PDF',
          file_url: '#',
          file_size: '4.1 MB',
          created_at: '2023-11-05',
          updated_at: '2023-11-05'
        },
        {
          id: '4',
          title: 'Pengaturcaraan Lanjutan Python',
          description: 'Topik lanjutan dalam pengaturcaraan Python termasuk pengecualian, pemprosesan fail, dan pengujian.',
          subject: 'Sains Komputer',
          tingkatan: 'Tingkatan 5',
          format: 'PDF',
          file_url: '#',
          file_size: '3.2 MB',
          created_at: '2023-10-18',
          updated_at: '2023-10-18'
        },
        {
          id: '5',
          title: 'Pembangunan Aplikasi Web',
          description: 'Pembangunan aplikasi web menggunakan framework moden seperti React dan Node.js.',
          subject: 'Sains Komputer',
          tingkatan: 'Tingkatan 5',
          format: 'PDF',
          file_url: '#',
          file_size: '4.5 MB',
          created_at: '2023-09-25',
          updated_at: '2023-09-25'
        }
      ]
      
      setNotes(dummyNotes)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching notes:', error)
      setLoading(false)
    }
  }

  // Filter nota berdasarkan carian, subjek, dan tingkatan
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          note.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubject = selectedSubject === 'semua' || note.subject.toLowerCase().includes(selectedSubject.toLowerCase())
    const matchesTingkatan = selectedTingkatan === 'semua' || note.tingkatan.toLowerCase().includes(selectedTingkatan.toLowerCase())
    
    return matchesSearch && matchesSubject && matchesTingkatan
  })

  const handleOpenForm = (note?: Note) => {
    if (note) {
      setIsEditing(true)
      setCurrentNote(note)
      setFormData({
        title: note.title,
        description: note.description,
        subject: note.subject,
        tingkatan: note.tingkatan,
        format: note.format,
        file: null
      })
    } else {
      setIsEditing(false)
      setCurrentNote(null)
      setFormData({
        title: '',
        description: '',
        subject: '',
        tingkatan: '',
        format: 'PDF',
        file: null
      })
    }
    setFormError('')
    setFormSuccess('')
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setUploadProgress(0)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        file: e.target.files[0]
      })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')

    // Validasi form
    if (!formData.title || !formData.description || !formData.subject || !formData.tingkatan) {
      setFormError('Sila isi semua maklumat yang diperlukan.')
      return
    }

    if (!isEditing && !formData.file) {
      setFormError('Sila pilih fail untuk dimuat naik.')
      return
    }

    try {
      // Simulasi upload progress
      const simulateUpload = () => {
        let progress = 0
        const interval = setInterval(() => {
          progress += 10
          setUploadProgress(progress)
          if (progress >= 100) {
            clearInterval(interval)
            
            // Simulasi penambahan/pengeditan nota
            setTimeout(() => {
              if (isEditing && currentNote) {
                // Update nota sedia ada
                const updatedNotes = notes.map(note => 
                  note.id === currentNote.id 
                    ? {
                        ...note,
                        title: formData.title,
                        description: formData.description,
                        subject: formData.subject,
                        tingkatan: formData.tingkatan,
                        format: formData.format,
                        updated_at: new Date().toISOString().split('T')[0]
                      }
                    : note
                )
                setNotes(updatedNotes)
                setFormSuccess('Nota telah berjaya dikemaskini!')
              } else {
                // Tambah nota baru
                const newNote: Note = {
                  id: (notes.length + 1).toString(),
                  title: formData.title,
                  description: formData.description,
                  subject: formData.subject,
                  tingkatan: formData.tingkatan,
                  format: formData.format,
                  file_url: '#',
                  file_size: formData.file ? `${(formData.file.size / (1024 * 1024)).toFixed(1)} MB` : '0 MB',
                  created_at: new Date().toISOString().split('T')[0],
                  updated_at: new Date().toISOString().split('T')[0]
                }
                setNotes([newNote, ...notes])
                setFormSuccess('Nota telah berjaya ditambah!')
              }
              
              // Reset form selepas 2 saat
              setTimeout(() => {
                handleCloseForm()
              }, 2000)
            }, 500)
          }
        }, 200)
      }

      simulateUpload()
    } catch (error) {
      console.error('Error submitting note:', error)
      setFormError('Ralat semasa memproses nota. Sila cuba lagi.')
      setUploadProgress(0)
    }
  }

  const handleDeleteConfirm = (noteId: string) => {
    setNoteToDelete(noteId)
    setDeleteConfirmOpen(true)
  }

  const handleDelete = async () => {
    if (!noteToDelete) return

    try {
      // Simulasi penghapusan nota
      const updatedNotes = notes.filter(note => note.id !== noteToDelete)
      setNotes(updatedNotes)
      setDeleteConfirmOpen(false)
      setNoteToDelete(null)
    } catch (error) {
      console.error('Error deleting note:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black flex items-center justify-center">
        <div className="glass-dark rounded-2xl p-8 text-center">
          <div className="text-2xl text-gradient loading-dots">Memuat pengurusan nota</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black">
      {/* Hero Section */}
      <section className="relative py-12 overflow-hidden bg-circuit">
        <div className="absolute inset-0 bg-grid opacity-10"></div>
        <div className="absolute top-10 right-10 w-40 h-40 bg-gradient-to-br from-neon-green/20 to-electric-blue/20 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-gradient-to-br from-electric-blue/20 to-neon-cyan/20 rounded-full blur-xl animate-float" style={{animationDelay: '3s'}}></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient">
              🛠️ Pengurusan Nota
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Tambah, edit, dan urus nota pembelajaran untuk pelajar
            </p>
            
            <button
              onClick={() => handleOpenForm()}
              className="btn-primary flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              <span>Tambah Nota Baru</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Search and Filter */}
          <div className="glass-dark rounded-xl p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari nota..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-electric-blue/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric-blue/50 text-gray-100 pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
              
              {/* Subject Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Subjek</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-electric-blue/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric-blue/50 text-gray-100"
                >
                  <option value="semua">Semua Subjek</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>{subject.name}</option>
                  ))}
                </select>
              </div>
              
              {/* Tingkatan Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Tingkatan</label>
                <select
                  value={selectedTingkatan}
                  onChange={(e) => setSelectedTingkatan(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-electric-blue/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric-blue/50 text-gray-100"
                >
                  <option value="semua">Semua Tingkatan</option>
                  {tingkatan.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* Notes Table */}
          <div className="glass-dark rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-electric-blue/20 to-neon-cyan/20">
                  <tr>
                    <th className="px-4 py-4 text-left text-xs font-medium text-electric-blue uppercase tracking-wider">Tajuk</th>
                    <th className="px-4 py-4 text-left text-xs font-medium text-electric-blue uppercase tracking-wider hidden md:table-cell">Subjek</th>
                    <th className="px-4 py-4 text-left text-xs font-medium text-electric-blue uppercase tracking-wider hidden sm:table-cell">Tingkatan</th>
                    <th className="px-4 py-4 text-left text-xs font-medium text-electric-blue uppercase tracking-wider">Format</th>
                    <th className="px-4 py-4 text-left text-xs font-medium text-electric-blue uppercase tracking-wider hidden lg:table-cell">Tarikh</th>
                    <th className="px-4 py-4 text-left text-xs font-medium text-electric-blue uppercase tracking-wider">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {filteredNotes.map((note) => (
                    <tr key={note.id} className="hover:bg-electric-blue/5 transition-all duration-300">
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-100">{note.title}</div>
                        <div className="text-sm text-gray-400 max-w-xs truncate">{note.description}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap hidden md:table-cell">
                        <div className="text-gray-300 text-sm">{note.subject}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap hidden sm:table-cell">
                        <div className="text-gray-300 text-sm">{note.tingkatan}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-electric-blue/20 text-electric-blue border border-electric-blue/30">
                          {note.format}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap hidden lg:table-cell">
                        <div className="text-gray-300 text-sm">
                          {new Date(note.updated_at).toLocaleDateString('ms-MY')}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleOpenForm(note)}
                            className="p-1 text-neon-green hover:bg-neon-green/10 rounded"
                            title="Edit"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteConfirm(note.id)}
                            className="p-1 text-red-400 hover:bg-red-400/10 rounded"
                            title="Padam"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                          <a 
                            href={note.file_url} 
                            className="p-1 text-electric-blue hover:bg-electric-blue/10 rounded"
                            title="Muat Turun"
                          >
                            <Download className="w-5 h-5" />
                          </a>
                          <a 
                            href={note.file_url} 
                            className="p-1 text-neon-cyan hover:bg-neon-cyan/10 rounded"
                            title="Lihat"
                          >
                            <Eye className="w-5 h-5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredNotes.length === 0 && (
              <div className="p-8 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-300 mb-2">
                  Tiada nota dijumpai
                </h3>
                <p className="text-gray-400 mb-6">
                  Cuba carian lain atau tukar filter untuk melihat nota yang tersedia.
                </p>
                <button
                  onClick={() => handleOpenForm()}
                  className="btn-primary inline-flex items-center"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  <span>Tambah Nota Baru</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Note Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="glass-dark rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700/50 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-primary">
                {isEditing ? 'Edit Nota' : 'Tambah Nota Baru'}
              </h2>
              <button
                onClick={handleCloseForm}
                className="p-1 text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              {formError && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 flex items-start">
                  <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                  <p>{formError}</p>
                </div>
              )}
              
              {formSuccess && (
                <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 flex items-start">
                  <Check className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                  <p>{formSuccess}</p>
                </div>
              )}
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tajuk Nota</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-electric-blue/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric-blue/50 text-gray-100"
                    placeholder="Contoh: Asas Pengaturcaraan Python"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Deskripsi</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-electric-blue/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric-blue/50 text-gray-100"
                    placeholder="Deskripsi ringkas tentang nota ini..."
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Subjek</label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-electric-blue/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric-blue/50 text-gray-100"
                    >
                      <option value="">Pilih Subjek</option>
                      {subjects.map(subject => (
                        <option key={subject.id} value={subject.name}>{subject.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Tingkatan</label>
                    <select
                      name="tingkatan"
                      value={formData.tingkatan}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-electric-blue/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric-blue/50 text-gray-100"
                    >
                      <option value="">Pilih Tingkatan</option>
                      {tingkatan.map(t => (
                        <option key={t.id} value={t.name}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Format</label>
                  <select
                    name="format"
                    value={formData.format}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-electric-blue/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric-blue/50 text-gray-100"
                  >
                    {formats.map(format => (
                      <option key={format} value={format}>{format}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {isEditing ? 'Muat Naik Fail Baru (Pilihan)' : 'Muat Naik Fail'}
                  </label>
                  <div className="flex items-center space-x-4">
                    <label className="flex-1 flex items-center justify-center px-4 py-3 bg-gray-800/50 border border-electric-blue/30 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors">
                      <Upload className="w-5 h-5 mr-2 text-electric-blue" />
                      <span className="text-gray-300">
                        {formData.file ? formData.file.name : 'Pilih fail...'}
                      </span>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".pdf,.pptx,.docx,.xlsx"
                      />
                    </label>
                    {formData.file && (
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, file: null})}
                        className="p-2 text-red-400 hover:bg-red-400/10 rounded"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  {formData.file && (
                    <p className="mt-2 text-sm text-gray-400">
                      Saiz: {(formData.file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  )}
                </div>
                
                {uploadProgress > 0 && (
                  <div>
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                      <span>Muat Naik</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-electric-blue to-neon-cyan h-2 rounded-full" 
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-8 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={uploadProgress > 0 && uploadProgress < 100}
                >
                  {isEditing ? 'Kemaskini Nota' : 'Tambah Nota'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="glass-dark rounded-xl w-full max-w-md">
            <div className="p-6 text-center">
              <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Padam Nota</h3>
              <p className="text-gray-300 mb-6">
                Adakah anda pasti ingin memadam nota ini? Tindakan ini tidak boleh dibatalkan.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setDeleteConfirmOpen(false)}
                  className="px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 rounded-lg transition-all duration-300"
                >
                  Ya, Padam
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

