'use client'

import Link from 'next/link'
import { BookOpen, FileText, Download, Search, Filter } from 'lucide-react'
import { useState } from 'react'

export default function NotaDashboard() {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gradient">
              📚 Nota Pembelajaran
            </h1>
            <p className="text-xl text-gray-300">
              Akses nota dan bahan pembelajaran untuk semua subjek
            </p>
          </div>

          {/* Search Bar */}
          <div className="glass-dark rounded-xl p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari nota atau topik..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue"
                />
              </div>
              <button className="px-6 py-3 bg-electric-blue/20 border border-electric-blue/30 text-electric-blue hover:bg-electric-blue/30 rounded-lg transition-all duration-300 flex items-center space-x-2">
                <Filter className="w-5 h-5" />
                <span>Filter</span>
              </button>
            </div>
          </div>

          {/* Tingkatan Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Link href="/nota/tingkatan-4" className="glass-dark rounded-xl p-8 card-hover neon-glow group">
              <div className="text-center">
                <div className="text-6xl mb-4">📘</div>
                <h2 className="text-3xl font-bold text-white mb-4">Tingkatan 4</h2>
                <p className="text-gray-400 mb-6">
                  Akses semua nota untuk Tingkatan 4 - Sains Komputer
                </p>
                <div className="flex items-center justify-center space-x-2 text-electric-blue group-hover:underline">
                  <BookOpen className="w-5 h-5" />
                  <span>Lihat Nota</span>
                </div>
              </div>
            </Link>

            <Link href="/nota/tingkatan-5" className="glass-dark rounded-xl p-8 card-hover neon-glow-green group">
              <div className="text-center">
                <div className="text-6xl mb-4">📗</div>
                <h2 className="text-3xl font-bold text-white mb-4">Tingkatan 5</h2>
                <p className="text-gray-400 mb-6">
                  Akses semua nota untuk Tingkatan 5 - Sains Komputer
                </p>
                <div className="flex items-center justify-center space-x-2 text-neon-green group-hover:underline">
                  <BookOpen className="w-5 h-5" />
                  <span>Lihat Nota</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Subject Cards - Only Sains Komputer */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              📖 Subjek Tersedia
            </h2>
            
            <div className="max-w-md mx-auto">
              <div className="glass-dark rounded-xl p-8 card-hover neon-glow-cyan">
                <div className="text-center">
                  <div className="text-5xl mb-4">💻</div>
                  <h3 className="text-2xl font-bold text-white mb-4">Sains Komputer</h3>
                  <p className="text-gray-400 mb-6">
                    Nota lengkap untuk subjek Sains Komputer SPM mengikut sukatan pelajaran terkini
                  </p>
                  
                  <div className="space-y-3">
                    <Link href="/nota/tingkatan-4" className="block w-full btn-primary">
                      📘 Tingkatan 4
                    </Link>
                    <Link href="/nota/tingkatan-5" className="block w-full btn-secondary">
                      📗 Tingkatan 5
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Access */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-dark rounded-xl p-6 text-center">
              <FileText className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Format PDF</h3>
              <p className="text-gray-400 text-sm">Nota dalam format PDF untuk bacaan mudah</p>
            </div>

            <div className="glass-dark rounded-xl p-6 text-center">
              <Download className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Muat Turun</h3>
              <p className="text-gray-400 text-sm">Muat turun nota untuk akses offline</p>
            </div>

            <div className="glass-dark rounded-xl p-6 text-center">
              <BookOpen className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Sukatan SPM</h3>
              <p className="text-gray-400 text-sm">Mengikut sukatan pelajaran SPM terkini</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
