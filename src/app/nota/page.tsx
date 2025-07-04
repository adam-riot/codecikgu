'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FileText, Book, Download, ExternalLink } from 'lucide-react'

export default function NotaDashboard() {
  const [searchTerm, setSearchTerm] = useState('')

  // Contoh data subjek
  const subjects = [
    { id: 'sains-komputer', name: 'Sains Komputer', icon: '💻' },
    { id: 'matematik', name: 'Matematik', icon: '📊' },
    { id: 'bahasa-melayu', name: 'Bahasa Melayu', icon: '📝' },
    { id: 'bahasa-inggeris', name: 'Bahasa Inggeris', icon: '🔤' },
    { id: 'sejarah', name: 'Sejarah', icon: '📜' },
    { id: 'reka-bentuk', name: 'Reka Bentuk Teknologi', icon: '🎨' },
    { id: 'sains', name: 'Sains', icon: '🔬' },
    { id: 'pendidikan-islam', name: 'Pendidikan Islam', icon: '☪️' },
    { id: 'prinsip-perakaunan', name: 'Prinsip Perakaunan', icon: '📒' },
    { id: 'ekonomi', name: 'Ekonomi', icon: '📈' },
    { id: 'geografi', name: 'Geografi', icon: '🌍' }
  ]

  // Filter subjek berdasarkan carian
  const filteredSubjects = subjects.filter(subject => 
    subject.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black">
      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden bg-circuit">
        <div className="absolute inset-0 bg-grid opacity-10"></div>
        <div className="absolute top-10 right-10 w-40 h-40 bg-gradient-to-br from-electric-blue/20 to-neon-cyan/20 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-gradient-to-br from-neon-green/20 to-electric-blue/20 rounded-full blur-xl animate-float" style={{animationDelay: '3s'}}></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gradient text-center">
              📚 Nota Pembelajaran
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 text-center mb-8">
              Akses nota dan bahan pembelajaran untuk semua subjek
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-12">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari subjek..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-800/50 border border-electric-blue/30 rounded-full focus:outline-none focus:ring-2 focus:ring-electric-blue/50 text-gray-100 pl-12"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-electric-blue">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Quick Access Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <Link href="/nota/tingkatan-4" className="glass-dark rounded-xl p-8 text-center card-hover neon-glow flex flex-col items-center justify-center">
                <div className="text-5xl mb-4">📘</div>
                <div className="text-2xl font-bold text-gradient mb-2">Tingkatan 4</div>
                <div className="text-gray-400">Akses semua nota untuk Tingkatan 4</div>
              </Link>
              
              <Link href="/nota/tingkatan-5" className="glass-dark rounded-xl p-8 text-center card-hover neon-glow-green flex flex-col items-center justify-center">
                <div className="text-5xl mb-4">📗</div>
                <div className="text-2xl font-bold text-gradient-green mb-2">Tingkatan 5</div>
                <div className="text-gray-400">Akses semua nota untuk Tingkatan 5</div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gradient mb-8">Senarai Modul Mengikut Subjek</h2>
          
          {/* Subjects Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredSubjects.map((subject) => (
              <Link 
                key={subject.id} 
                href={`/nota/${subject.id}`}
                className="glass-dark rounded-xl p-6 text-center card-hover transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-electric-blue/20"
              >
                <div className="text-4xl mb-4">{subject.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{subject.name}</h3>
                <div className="text-sm text-gray-400">Lihat semua nota</div>
              </Link>
            ))}
          </div>

          {filteredSubjects.length === 0 && (
            <div className="glass-dark rounded-xl p-12 text-center">
              <Book className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-300 mb-2">
                Tiada subjek dijumpai
              </h3>
              <p className="text-gray-400">
                Cuba carian lain atau lihat senarai subjek di atas.
              </p>
            </div>
          )}
          
          {/* Info Section */}
          <div className="mt-16 glass-dark rounded-xl p-8">
            <h3 className="text-2xl font-bold text-gradient mb-4">Tentang Nota Pembelajaran</h3>
            <p className="text-gray-300 mb-6">
              Nota pembelajaran di CodeCikgu disediakan dalam pelbagai format untuk memudahkan proses pembelajaran anda. 
              Anda boleh memuat turun nota dalam format PDF, PPTX, atau melihatnya secara dalam talian.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-electric-blue/20 flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-electric-blue" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Format PDF</h4>
                <p className="text-gray-400">Nota dalam format PDF boleh dimuat turun dan dibaca pada bila-bila masa.</p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-neon-green/20 flex items-center justify-center mb-4">
                  <Download className="w-8 h-8 text-neon-green" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Muat Turun</h4>
                <p className="text-gray-400">Muat turun nota untuk rujukan offline dan ulangkaji.</p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-neon-cyan/20 flex items-center justify-center mb-4">
                  <ExternalLink className="w-8 h-8 text-neon-cyan" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Akses Dalam Talian</h4>
                <p className="text-gray-400">Lihat nota secara dalam talian tanpa perlu memuat turun.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

