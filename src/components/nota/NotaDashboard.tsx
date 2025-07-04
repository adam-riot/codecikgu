'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

const NotaDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  // Hanya subjek Sains Komputer sahaja
  const subjects = [
    {
      id: 'sains-komputer',
      name: 'Sains Komputer',
      icon: '💻',
      description: 'Nota dan bahan pembelajaran untuk subjek Sains Komputer',
      color: 'blue'
    }
  ]

  const tingkatan = [
    {
      id: 'tingkatan-4',
      name: 'Tingkatan 4',
      icon: '📘',
      color: 'blue',
      description: 'Akses semua nota untuk Tingkatan 4'
    },
    {
      id: 'tingkatan-5',
      name: 'Tingkatan 5',
      icon: '📗',
      color: 'green',
      description: 'Akses semua nota untuk Tingkatan 5'
    }
  ]

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-circuit dark:bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-2 text-gradient">Akses nota dan bahan pembelajaran untuk semua subjek</h1>
        
        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-12 mt-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari subjek..."
              className="w-full px-4 py-3 rounded-lg bg-gray-800/50 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
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

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {tingkatan.map((level) => (
            <Link 
              href={`/nota/${level.id}`} 
              key={level.id}
              className="glass-dark rounded-xl p-8 text-center card-hover neon-glow"
            >
              <div className="flex flex-col items-center justify-center">
                <div className="text-5xl mb-4">{level.icon}</div>
                <h2 className={`text-2xl font-bold mb-2 text-${level.color}-400`}>{level.name}</h2>
                <p className="text-gray-300">{level.description}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Subject List */}
        <h2 className="text-2xl font-bold mb-6 text-center">Senarai Modul Mengikut Subjek</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredSubjects.map((subject) => (
            <Link
              href={`/nota/subjek/${subject.id}`}
              key={subject.id}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 text-center hover:bg-gray-700/50 transition duration-300"
            >
              <div className="text-4xl mb-3">{subject.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{subject.name}</h3>
              <p className="text-sm text-gray-400">Lihat semua nota</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default NotaDashboard

