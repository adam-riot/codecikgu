
"use client"

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'

interface LeaderboardEntry {
  id: string
  name: string
  email: string
  sekolah: string
  tingkatan: string
  xp: number
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [filteredLeaderboard, setFilteredLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    sekolah: '',
    tingkatan: ''
  })

  // Get unique values for filters
  const [uniqueSchools, setUniqueSchools] = useState<string[]>([])
  const [uniqueTingkatan, setUniqueTingkatan] = useState<string[]>([])

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, sekolah, tingkatan, xp')
        .eq('role', 'murid')
        .not('name', 'is', null)
        .not('sekolah', 'is', null)
        .not('tingkatan', 'is', null)
        .order('xp', { ascending: false })

      if (error) {
        console.error('Error fetching leaderboard:', error)
      } else {
        const leaderboardData = data || []
        setLeaderboard(leaderboardData)
        setFilteredLeaderboard(leaderboardData)

        // Extract unique values for filters
        const schools = [...new Set(leaderboardData.map(entry => entry.sekolah).filter(Boolean))]
        const tingkatan = [...new Set(leaderboardData.map(entry => entry.tingkatan).filter(Boolean))]
        
        setUniqueSchools(schools.sort())
        setUniqueTingkatan(tingkatan.sort())
      }
      setLoading(false)
    }

    fetchLeaderboard()
  }, [])

  useEffect(() => {
    let filtered = leaderboard

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.sekolah.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply school filter
    if (filters.sekolah) {
      filtered = filtered.filter(entry => entry.sekolah === filters.sekolah)
    }

    // Apply tingkatan filter
    if (filters.tingkatan) {
      filtered = filtered.filter(entry => entry.tingkatan === filters.tingkatan)
    }

    setFilteredLeaderboard(filtered)
  }, [searchTerm, filters, leaderboard])

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  const clearFilters = () => {
    setSearchTerm('')
    setFilters({
      sekolah: '',
      tingkatan: ''
    })
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇'
      case 2:
        return '🥈'
      case 3:
        return '🥉'
      default:
        return `#${rank}`
    }
  }

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400 to-yellow-600 text-yellow-900'
      case 2:
        return 'from-gray-300 to-gray-500 text-gray-900'
      case 3:
        return 'from-orange-400 to-orange-600 text-orange-900'
      default:
        return 'from-electric-blue/20 to-neon-cyan/20 text-electric-blue'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-circuit">
        <div className="absolute inset-0 bg-grid opacity-10"></div>
        <div className="absolute top-10 right-10 w-40 h-40 bg-gradient-to-br from-electric-blue/20 to-neon-cyan/20 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-gradient-to-br from-neon-green/20 to-electric-blue/20 rounded-full blur-xl animate-float" style={{animationDelay: '3s'}}></div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gradient">
            🏆 Papan Pendahulu Global
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Lihat kedudukan murid terbaik dari seluruh Malaysia berdasarkan XP yang diperoleh
          </p>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-8 bg-gradient-to-r from-dark-black/50 to-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="glass-dark rounded-2xl p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                {/* Search */}
                <div className="w-full lg:w-1/3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="🔍 Cari nama murid atau sekolah..."
                      className="w-full px-4 py-3 bg-gray-800/50 border border-electric-blue/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric-blue/50 focus:border-electric-blue text-gray-100 placeholder-gray-400"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-2/3">
                  <select
                    className="px-4 py-3 bg-gray-800/50 border border-electric-blue/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric-blue/50 text-gray-100"
                    value={filters.sekolah}
                    onChange={(e) => handleFilterChange('sekolah', e.target.value)}
                  >
                    <option value="">🏫 Semua Sekolah</option>
                    {uniqueSchools.map(school => (
                      <option key={school} value={school}>{school}</option>
                    ))}
                  </select>

                  <select
                    className="px-4 py-3 bg-gray-800/50 border border-electric-blue/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric-blue/50 text-gray-100"
                    value={filters.tingkatan}
                    onChange={(e) => handleFilterChange('tingkatan', e.target.value)}
                  >
                    <option value="">📚 Semua Tingkatan</option>
                    {uniqueTingkatan.map(tingkatan => (
                      <option key={tingkatan} value={tingkatan}>Tingkatan {tingkatan}</option>
                    ))}
                  </select>

                  <button
                    onClick={clearFilters}
                    className="px-4 py-3 bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25"
                  >
                    🗑️ Kosongkan
                  </button>
                </div>
              </div>

              {/* Results count */}
              <div className="mt-4 text-gray-400 text-center lg:text-left">
                Menunjukkan <span className="text-electric-blue font-semibold">{filteredLeaderboard.length}</span> daripada <span className="text-electric-blue font-semibold">{leaderboard.length}</span> murid
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {loading ? (
              <div className="text-center py-12">
                <div className="glass-dark rounded-2xl p-8">
                  <div className="text-xl text-gray-400 loading-dots">Memuat papan pendahulu</div>
                </div>
              </div>
            ) : filteredLeaderboard.length > 0 ? (
              <>
                {/* Top 3 Podium */}
                {filteredLeaderboard.length >= 3 && searchTerm === '' && filters.sekolah === '' && filters.tingkatan === '' && (
                  <div className="glass-dark rounded-2xl p-8 mb-8 neon-glow">
                    <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gradient">
                      🏆 Top 3 Murid Terbaik
                    </h2>
                    <div className="flex justify-center items-end space-x-4 md:space-x-8">
                      {/* 2nd Place */}
                      <div className="text-center transform hover:scale-105 transition-all duration-300">
                        <div className="bg-gradient-to-br from-gray-300 to-gray-500 w-16 md:w-20 h-12 md:h-16 rounded-t-lg flex items-center justify-center mb-2 shadow-lg">
                          <span className="text-xl md:text-2xl">🥈</span>
                        </div>
                        <div className="glass-dark p-4 rounded-lg shadow-lg border border-gray-400/30">
                          <div className="font-semibold text-gray-100 text-sm md:text-base">{filteredLeaderboard[1]?.name}</div>
                          <div className="text-xs md:text-sm text-gray-400 truncate max-w-24 md:max-w-32">{filteredLeaderboard[1]?.sekolah}</div>
                          <div className="text-lg md:text-xl font-bold text-gray-300">{filteredLeaderboard[1]?.xp || 0} XP</div>
                        </div>
                      </div>

                      {/* 1st Place */}
                      <div className="text-center transform hover:scale-105 transition-all duration-300">
                        <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 w-20 md:w-24 h-16 md:h-20 rounded-t-lg flex items-center justify-center mb-2 shadow-xl animate-pulse-glow">
                          <span className="text-2xl md:text-3xl">🥇</span>
                        </div>
                        <div className="glass-dark p-4 rounded-lg shadow-xl border-2 border-yellow-400/50 neon-glow">
                          <div className="font-bold text-lg md:text-xl text-yellow-300">{filteredLeaderboard[0]?.name}</div>
                          <div className="text-sm text-gray-400 truncate max-w-28 md:max-w-36">{filteredLeaderboard[0]?.sekolah}</div>
                          <div className="text-xl md:text-2xl font-bold text-yellow-400">{filteredLeaderboard[0]?.xp || 0} XP</div>
                        </div>
                      </div>

                      {/* 3rd Place */}
                      <div className="text-center transform hover:scale-105 transition-all duration-300">
                        <div className="bg-gradient-to-br from-orange-400 to-orange-600 w-16 md:w-20 h-10 md:h-12 rounded-t-lg flex items-center justify-center mb-2 shadow-lg">
                          <span className="text-xl md:text-2xl">🥉</span>
                        </div>
                        <div className="glass-dark p-4 rounded-lg shadow-lg border border-orange-400/30">
                          <div className="font-semibold text-gray-100 text-sm md:text-base">{filteredLeaderboard[2]?.name}</div>
                          <div className="text-xs md:text-sm text-gray-400 truncate max-w-24 md:max-w-32">{filteredLeaderboard[2]?.sekolah}</div>
                          <div className="text-lg md:text-xl font-bold text-orange-400">{filteredLeaderboard[2]?.xp || 0} XP</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Full Leaderboard Table */}
                <div className="glass-dark rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-electric-blue/20 to-neon-cyan/20">
                        <tr>
                          <th className="px-4 md:px-4 py-4 text-left text-xs font-medium text-electric-blue uppercase tracking-wider">Kedudukan</th>
                          <th className="px-4 md:px-4 py-4 text-left text-xs font-medium text-electric-blue uppercase tracking-wider">Nama</th>
                          <th className="px-4 md:px-4 py-4 text-left text-xs font-medium text-electric-blue uppercase tracking-wider hidden md:table-cell">Sekolah</th>
                          <th className="px-4 md:px-4 py-4 text-left text-xs font-medium text-electric-blue uppercase tracking-wider hidden sm:table-cell">Tingkatan</th>
                          <th className="px-4 md:px-4 py-4 text-left text-xs font-medium text-electric-blue uppercase tracking-wider">XP</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700/50">
                        {filteredLeaderboard.map((entry, index) => (
                          <tr key={entry.id} className={`hover:bg-electric-blue/5 transition-all duration-300 ${index < 3 ? 'bg-gradient-to-r from-electric-blue/5 to-neon-cyan/5' : ''}`}>
                            <td className="px-4 md:px-4 py-4 whitespace-nowrap">
                              <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r ${getRankStyle(index + 1)} font-bold text-sm`}>
                                {index < 3 ? getRankIcon(index + 1) : index + 1}
                              </div>
                            </td>
                            <td className="px-4 md:px-4 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-100">{entry.name}</div>
                              <div className="text-sm text-gray-400 md:hidden">{entry.sekolah}</div>
                            </td>
                            <td className="px-4 md:px-4 py-4 whitespace-nowrap hidden md:table-cell">
                              <div className="text-gray-300 max-w-xs truncate">{entry.sekolah}</div>
                            </td>
                            <td className="px-4 md:px-4 py-4 whitespace-nowrap hidden sm:table-cell">
                              <div className="text-gray-300">Tingkatan {entry.tingkatan}</div>
                            </td>
                            <td className="px-4 md:px-4 py-4 whitespace-nowrap">
                              <div className="font-bold text-electric-blue text-lg">{entry.xp || 0} XP</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="glass-dark rounded-2xl p-8">
                  <div className="text-xl text-gray-400 mb-4">🔍 Tiada murid ditemui</div>
                  <div className="text-gray-500">berdasarkan kriteria carian yang ditetapkan.</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-electric-blue/10 via-neon-cyan/10 to-neon-green/10">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gradient">
              Ingin Berada di Papan Pendahulu?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Sertai CodeCikgu dan mula kumpul XP dengan menyelesaikan topik-topik pembelajaran Sains Komputer!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/daftar" className="btn-primary text-lg px-8 py-4">
                🚀 Daftar Sekarang
              </Link>
              <Link href="/login" className="btn-secondary text-lg px-8 py-4">
                Masuk Akaun
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}



