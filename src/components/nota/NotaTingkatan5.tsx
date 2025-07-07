'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/utils/supabase'
import { FileText, Download, Eye, ChevronLeft, Search } from 'lucide-react'

export default function NotaTingkatan5() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFormat, setSelectedFormat] = useState('semua')
  const [notes, setNotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('tingkatan', 'Tingkatan 5')
        .eq('subject', 'Sains Komputer')
        .order('created_at', { ascending: false })
      if (!error && data) setNotes(data)
      setLoading(false)
    }
    fetchNotes()
  }, [])

  // Filter nota berdasarkan carian dan format
  const filteredNotes = notes.filter(note => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (note.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFormat =
      selectedFormat === 'semua' ||
      (note.format || '').toLowerCase() === selectedFormat.toLowerCase()
    return matchesSearch && matchesFormat
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black">
      {/* Hero Section */}
      <section className="relative py-12 overflow-hidden bg-circuit">
        <div className="absolute inset-0 bg-grid opacity-10"></div>
        <div className="absolute top-10 right-10 w-40 h-40 bg-gradient-to-br from-neon-green/20 to-electric-blue/20 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-gradient-to-br from-electric-blue/20 to-neon-cyan/20 rounded-full blur-xl animate-float" style={{animationDelay: '3s'}}></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <Link href="/nota" className="inline-flex items-center text-electric-blue hover:text-neon-cyan transition-colors mb-4">
              <ChevronLeft className="w-5 h-5 mr-1" />
              <span>Kembali ke Dashboard Nota</span>
            </Link>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient-green">
              📗 Nota Tingkatan 5 - Sains Komputer
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Akses semua nota dan bahan pembelajaran Sains Komputer untuk pelajar Tingkatan 5
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Search and Filter */}
          <div className="glass-dark rounded-xl p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              
              {/* Format Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Format</label>
                <select
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-electric-blue/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric-blue/50 text-gray-100"
                >
                  <option value="semua">Semua Format</option>
                  <option value="pdf">PDF</option>
                  <option value="pptx">PPTX</option>
                  <option value="docx">DOCX</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Notes Grid */}
          {loading ? (
            <div className="text-center text-gray-400 py-12">Memuatkan nota...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNotes.map((note) => (
                <div key={note.id} className="glass-dark rounded-xl overflow-hidden card-hover">
                  <div className="h-40 bg-gray-800 relative">
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-neon-green/20 to-electric-blue/20">
                      <FileText className="w-16 h-16 text-neon-green/70" />
                    </div>
                    <div className="absolute top-3 right-3 bg-gray-900/80 text-white text-xs font-bold px-2 py-1 rounded">
                      {(note.format || '').toUpperCase()}
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="text-xs text-neon-green mb-2">{note.subject}</div>
                    <h3 className="text-lg font-bold text-white mb-2">{note.title}</h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{note.description}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                      <span>Saiz: {note.file_size ? `${note.file_size} B` : '-'}</span>
                      <span>Tarikh: {note.created_at ? new Date(note.created_at).toLocaleDateString('ms-MY') : '-'}</span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <a 
                        href={note.file_url} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center px-4 py-2 bg-electric-blue/20 border border-electric-blue/30 text-electric-blue hover:bg-electric-blue/30 rounded-lg transition-all duration-300"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        <span>Muat Turun</span>
                      </a>
                      <Link 
                        href={`/nota/${note.id}`}
                        className="flex-1 flex items-center justify-center px-4 py-2 bg-neon-green/20 border border-neon-green/30 text-neon-green hover:bg-neon-green/30 rounded-lg transition-all duration-300"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        <span>Lihat</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filteredNotes.length === 0 && (
            <div className="glass-dark rounded-xl p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-300 mb-2">
                Tiada nota dijumpai
              </h3>
              <p className="text-gray-400">
                Cuba carian lain atau tukar filter untuk melihat nota yang tersedia.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}