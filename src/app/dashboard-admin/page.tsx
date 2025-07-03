'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { FaPlus, FaChalkboardTeacher, FaUsers, FaTrophy, FaCode } from 'react-icons/fa'
import CreateChallenge from '@/components/CreateChallenge'

interface Challenge {
  id: string
  title: string
  description: string
  type: 'quiz' | 'video' | 'reading' | 'upload'
  subject: string
  tingkatan: string
  xp_reward: number
  created_at: string
  challenge_submissions?: { count: number }[]
}

interface User {
  id: string
  name: string
  email: string
  tingkatan: string
  total_xp: number
}

export default function DashboardAdmin() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [activeTab, setActiveTab] = useState('challenges')

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch challenges with submission count
        const { data: challengesData, error: challengesError } = await supabase
          .from('challenges')
          .select(`
            *,
            challenge_submissions:challenge_submissions(count)
          `)
          .order('created_at', { ascending: false })
        
        if (challengesError) throw challengesError
        setChallenges(challengesData || [])
        
        // Fetch users
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('*')
          .order('total_xp', { ascending: false })
          .limit(10)
        
        if (usersError) throw usersError
        setUsers(usersData || [])
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [])

  const handleChallengeCreated = async () => {
    setShowCreateModal(false)
    
    // Refresh challenges
    const { data, error } = await supabase
      .from('challenges')
      .select(`
        *,
        challenge_submissions:challenge_submissions(count)
      `)
      .order('created_at', { ascending: false })
    
    if (!error && data) {
      setChallenges(data)
    }
  }

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'quiz':
        return '📝'
      case 'video':
        return '🎬'
      case 'reading':
        return '📚'
      case 'upload':
        return '📤'
      default:
        return '📋'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black">
        <Navbar userRole="admin" />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black">
      <Navbar userRole="admin" />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Dashboard Admin</h1>
          <div className="flex space-x-4">
            <Link 
              href="/playground"
              className="bg-gradient-to-r from-neon-green to-electric-blue hover:from-neon-green/80 hover:to-electric-blue/80 text-white px-4 py-2 rounded-lg flex items-center transition-all duration-300"
            >
              <FaCode className="mr-2" /> Playground
            </Link>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <FaPlus className="mr-2" /> Cipta Cabaran
            </button>
          </div>
        </div>
        
        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link href="/playground" className="glass-dark rounded-xl p-6 hover:bg-gray-800 transition group">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-r from-neon-green/20 to-electric-blue/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <FaCode className="h-8 w-8 text-neon-green" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">🚀 CodeCikgu Playground</h3>
                <p className="text-gray-400">Akses editor kod untuk menguji dan menulis kod dalam pelbagai bahasa</p>
                <p className="text-sm text-electric-blue mt-2">Klik untuk membuka playground →</p>
              </div>
            </div>
          </Link>
          
          <Link href="/leaderboard" className="glass-dark rounded-xl p-6 hover:bg-gray-800 transition group">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-r from-electric-blue/20 to-neon-cyan/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <FaTrophy className="h-8 w-8 text-electric-blue" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">🏆 Leaderboard</h3>
                <p className="text-gray-400">Pantau prestasi pelajar dan ranking XP</p>
                <p className="text-sm text-electric-blue mt-2">Lihat ranking →</p>
              </div>
            </div>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass-dark rounded-xl p-6">
            <div className="flex items-center mb-2">
              <div className="bg-blue-900/30 p-3 rounded-lg mr-4">
                <FaChalkboardTeacher className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-white font-medium">Cabaran</h3>
            </div>
            <p className="text-3xl font-bold text-white">{challenges.length}</p>
          </div>
          
          <div className="glass-dark rounded-xl p-6">
            <div className="flex items-center mb-2">
              <div className="bg-green-900/30 p-3 rounded-lg mr-4">
                <FaUsers className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="text-white font-medium">Pelajar</h3>
            </div>
            <p className="text-3xl font-bold text-white">{users.length}</p>
          </div>
          
          <div className="glass-dark rounded-xl p-6">
            <div className="flex items-center mb-2">
              <div className="bg-purple-900/30 p-3 rounded-lg mr-4">
                <FaCode className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-white font-medium">Playground</h3>
            </div>
            <Link href="/playground" className="text-blue-400 hover:underline text-sm">
              Lihat Playground
            </Link>
          </div>
          
          <div className="glass-dark rounded-xl p-6">
            <div className="flex items-center mb-2">
              <div className="bg-yellow-900/30 p-3 rounded-lg mr-4">
                <FaTrophy className="h-6 w-6 text-yellow-400" />
              </div>
              <h3 className="text-white font-medium">Leaderboard</h3>
            </div>
            <Link href="/leaderboard" className="text-blue-400 hover:underline text-sm">
              Lihat Leaderboard
            </Link>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-800">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('challenges')}
                className={`${
                  activeTab === 'challenges'
                    ? 'border-electric-blue text-electric-blue'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium`}
              >
                Cabaran
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`${
                  activeTab === 'users'
                    ? 'border-electric-blue text-electric-blue'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium`}
              >
                Pelajar
              </button>
              <button
                onClick={() => setActiveTab('submissions')}
                className={`${
                  activeTab === 'submissions'
                    ? 'border-electric-blue text-electric-blue'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium`}
              >
                Penyerahan
              </button>
            </nav>
          </div>
        </div>
        
        {/* Tab content */}
        {activeTab === 'challenges' && (
          <div className="glass-dark rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-800">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Cabaran
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Subjek
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Tingkatan
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      XP
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Penyerahan
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Tindakan
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {challenges.map((challenge) => (
                    <tr key={challenge.id} className="hover:bg-gray-800/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 text-2xl mr-3">{getChallengeIcon(challenge.type)}</div>
                          <div>
                            <div className="text-sm font-medium text-white">{challenge.title}</div>
                            <div className="text-sm text-gray-400">{challenge.type}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {challenge.subject}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {challenge.tingkatan}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {challenge.xp_reward}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {challenge.challenge_submissions?.[0]?.count || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link href={`/challenges/${challenge.id}`} className="text-blue-400 hover:text-blue-300 mr-3">
                          Lihat
                        </Link>
                        <button className="text-red-400 hover:text-red-300">
                          Padam
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === 'users' && (
          <div className="glass-dark rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-800">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Pelajar
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Tingkatan
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      XP
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Tindakan
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-800/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{user.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {user.tingkatan}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {user.total_xp || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button className="text-blue-400 hover:text-blue-300 mr-3">
                          Lihat
                        </button>
                        <button className="text-red-400 hover:text-red-300">
                          Padam
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === 'submissions' && (
          <div className="glass-dark rounded-xl p-6 text-center">
            <p className="text-gray-400">Tiada penyerahan untuk disemak.</p>
          </div>
        )}
      </main>
      
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Wizard Cipta Cabaran</h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <CreateChallenge 
                onClose={() => setShowCreateModal(false)} 
                onChallengeCreated={handleChallengeCreated} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

