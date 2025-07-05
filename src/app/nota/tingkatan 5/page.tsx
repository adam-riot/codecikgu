'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search, Download, Eye, FileText, BookOpen, Clock, Star } from 'lucide-react'

export default function NotaTingkatan5() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFormat, setSelectedFormat] = useState('semua')

  // Sample notes data for Tingkatan 5
  const notesData = [
    {
      id: 1,
      title: 'Bab 1: Sistem Komputer',
      description: 'Pengenalan kepada sistem komputer, komponen utama dan fungsinya',
      chapters: [
        'Pengenalan Sistem Komputer',
        'Unit Pemprosesan Pusat (CPU)',
        'Memori dan Storan',
        'Peranti Input dan Output',
        'Sistem Operasi'
      ],
      format: 'PDF',
      size: '2.5 MB',
      pages: 45,
      lastUpdated: '15 Nov 2024',
      difficulty: 'Mudah',
      downloadUrl: '#'
    },
    {
      id: 2,
      title: 'Bab 2: Rangkaian Komputer',
      description: 'Konsep rangkaian komputer, jenis-jenis rangkaian dan protokol komunikasi',
      chapters: [
        'Pengenalan Rangkaian',
        'Jenis-jenis Rangkaian',
        'Topologi Rangkaian',
        'Protokol Komunikasi',
        'Internet dan World Wide Web'
      ],
      format: 'PDF',
      size: '3.2 MB',
      pages: 52,
      lastUpdated: '12 Nov 2024',
      difficulty: 'Sederhana',
      downloadUrl: '#'
    },
    {
      id: 3,
      title: 'Bab 3: Multimedia',
      description: 'Elemen multimedia, pemprosesan dan aplikasi multimedia',
      chapters: [
        'Pengenalan Multimedia',
        'Elemen Multimedia',
        'Pemprosesan Imej Digital',
        'Pemprosesan Audio dan Video',
        'Aplikasi Multimedia'
      ],
      format: 'PDF',
      size: '4.1 MB',
      pages: 38,
      lastUpdated: '10 Nov 2024',
      difficulty: 'Sederhana',
      downloadUrl: '#'
    },
    {
      id: 4,
      title: 'Bab 4: Pangkalan Data',
      description: 'Konsep pangkalan data, sistem pengurusan pangkalan data dan SQL',
      chapters: [
        'Pengenalan Pangkalan Data',
        'Model Data',
        'Sistem Pengurusan Pangkalan Data',
        'Structured Query Language (SQL)',
        'Reka Bentuk Pangkalan Data'
      ],
      format: 'PDF',
      size: '3.8 MB',
      pages: 48,
      lastUpdated: '8 Nov 2024',
      difficulty: 'Sukar',
      downloadUrl: '#'
    },
    {
      id: 5,
      title: 'Bab 5: Pemrograman Web',
      description: 'Pembangunan laman web menggunakan HTML, CSS dan JavaScript',
      chapters: [
        'Pengenalan Pemrograman Web',
        'HTML (HyperText Markup Language)',
        'CSS (Cascading Style Sheets)',
        'JavaScript',
        'Pembangunan Laman Web Responsif'
      ],
      format: 'PDF',
      size: '5.2 MB',
      pages: 65,
      lastUpdated: '5 Nov 2024',
      difficulty: 'Sukar',
      downloadUrl: '#'
    },
    {
      id: 6,
      title: 'Bab 6: Keselamatan Maklumat',
      description: 'Ancaman keselamatan, kaedah perlindungan dan etika komputer',
      chapters: [
        'Ancaman Keselamatan',
        'Kaedah Perlindungan',
        'Kriptografi',
        'Etika Komputer',
        'Undang-undang Siber'
      ],
      format: 'PDF',
      size: '2.8 MB',
      pages: 35,
      lastUpdated: '3 Nov 2024',
      difficulty: 'Sederhana',
      downloadUrl: '#'
    }
  ]

  // Filter notes based on search term and format
  const filteredNotes = notesData.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFormat = selectedFormat === 'semua' || note.format.toLowerCase() === selectedFormat.toLowerCase()
    return matchesSearch && matchesFormat
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Mudah': return 'text-green-400 bg-green-500/20'
      case 'Sederhana': return 'text-yellow-400 bg-yellow-500/20'
      case 'Sukar': return 'text-red-400 bg-red-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Link 
              href="/nota" 
              className="flex items-center text-gray-400 hover:text-electric-blue transition-colors duration-300 mr-6"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Kembali ke Nota
            </Link>
          </div>

          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gradient">
              📚 Nota Tingkatan 5
            </h1>
            <p className="text-xl text-gray-300">
              Sains Komputer Tingkatan 5 - Sukatan Pelajaran SPM
            </p>
          </div>

          {/* Search and Filter */}
          <div className="glass-dark rounded-xl p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari nota atau topik..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue transition-colors duration-300"
                />
              </div>
              
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-electric-blue transition-colors duration-300"
              >
                <option value="semua">Semua Format</option>
                <option value="pdf">PDF</option>
                <option value="pptx">PowerPoint</option>
                <option value="docx">Word</option>
              </select>
            </div>
          </div>

          {/* Notes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {filteredNotes.map((note) => (
              <div key={note.id} className="glass-dark rounded-xl p-6 card-hover group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-6 h-6 text-electric-blue" />
                    <span className="text-sm text-gray-400">{note.format}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(note.difficulty)}`}>
                    {note.difficulty}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-electric-blue transition-colors duration-300">
                  {note.title}
                </h3>
                
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {note.description}
                </p>

                {/* Chapters Preview */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-300 mb-2">Kandungan:</h4>
                  <ul className="text-xs text-gray-400 space-y-1">
                    {note.chapters.slice(0, 3).map((chapter, index) => (
                      <li key={index} className="flex items-center">
                        <div className="w-1 h-1 bg-electric-blue rounded-full mr-2"></div>
                        {chapter}
                      </li>
                    ))}
                    {note.chapters.length > 3 && (
                      <li className="text-electric-blue">+{note.chapters.length - 3} lagi...</li>
                    )}
                  </ul>
                </div>

                {/* File Info */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span className="flex items-center">
                    <BookOpen className="w-3 h-3 mr-1" />
                    {note.pages} halaman
                  </span>
                  <span>{note.size}</span>
                  <span className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {note.lastUpdated}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-electric-blue/20 border border-electric-blue/30 text-electric-blue hover:bg-electric-blue/30 rounded-lg transition-all duration-300">
                    <Eye className="w-4 h-4" />
                    <span>Lihat</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-neon-green/20 border border-neon-green/30 text-neon-green hover:bg-neon-green/30 rounded-lg transition-all duration-300">
                    <Download className="w-4 h-4" />
                    <span>Muat Turun</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* No Results */}
          {filteredNotes.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-bold text-white mb-2">Tiada nota dijumpai</h3>
              <p className="text-gray-400">Cuba ubah kata kunci carian atau filter anda</p>
            </div>
          )}

          {/* Study Tips */}
          <div className="glass-dark rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Star className="w-6 h-6 text-yellow-400 mr-3" />
              Tips Pembelajaran Tingkatan 5
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-electric-blue rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-semibold text-white">Fokus pada Projek</h3>
                    <p className="text-gray-400 text-sm">Tingkatan 5 lebih fokus pada aplikasi praktik. Pastikan anda faham konsep untuk projek akhir.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-neon-green rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-semibold text-white">Latihan Coding</h3>
                    <p className="text-gray-400 text-sm">Gunakan playground untuk berlatih HTML, CSS, dan JavaScript secara hands-on.</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-neon-cyan rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-semibold text-white">Kerja Berkumpulan</h3>
                    <p className="text-gray-400 text-sm">Banyak topik melibatkan kerja berkumpulan. Manfaatkan platform untuk berkongsi idea.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-semibold text-white">Projek Portfolio</h3>
                    <p className="text-gray-400 text-sm">Bina portfolio projek web untuk menunjukkan kemahiran anda kepada universiti atau majikan.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/nota/tingkatan-4" className="glass-dark rounded-xl p-6 text-center card-hover group">
              <div className="text-4xl mb-3">📘</div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-electric-blue transition-colors duration-300">
                Nota Tingkatan 4
              </h3>
              <p className="text-gray-400 text-sm">Kembali ke nota Tingkatan 4</p>
            </Link>

            <Link href="/playground" className="glass-dark rounded-xl p-6 text-center card-hover group">
              <div className="text-4xl mb-3">💻</div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-neon-green transition-colors duration-300">
                Playground
              </h3>
              <p className="text-gray-400 text-sm">Latihan coding interaktif</p>
            </Link>

            <Link href="/leaderboard" className="glass-dark rounded-xl p-6 text-center card-hover group">
              <div className="text-4xl mb-3">🏆</div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-neon-cyan transition-colors duration-300">
                Leaderboard
              </h3>
              <p className="text-gray-400 text-sm">Lihat ranking pelajar</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
