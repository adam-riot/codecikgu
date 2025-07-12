'use client'

import React, { useState, useEffect } from 'react'
import { 
  Users, 
  MessageCircle, 
  UserPlus, 
  Crown, 
  Star,
  Clock,
  BookOpen,
  Code,
  Trophy,
  Heart,
  Share2,
  Search,
  Filter,
  Settings,
  MoreVertical,
  Send,
  Plus,
  Target,
  Calendar,
  Award,
  Flame,
  Eye,
  ThumbsUp,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Bell,
  CheckCircle
} from 'lucide-react'
import { useNotifications } from './NotificationProvider'

interface StudyGroup {
  id: string
  name: string
  description: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  members: GroupMember[]
  maxMembers: number
  isPrivate: boolean
  tags: string[]
  createdAt: string
  lastActivity: string
  weeklyGoal: number
  currentWeekProgress: number
  achievements: string[]
  rules: string[]
  meetingSchedule?: {
    day: string
    time: string
    duration: number
  }
  stats: {
    totalXp: number
    challengesCompleted: number
    studySessions: number
    averageScore: number
  }
}

interface GroupMember {
  id: string
  name: string
  avatar: string
  role: 'admin' | 'moderator' | 'member'
  joinedAt: string
  xp: number
  streak: number
  contributions: number
  isOnline: boolean
  lastSeen: string
  specializations: string[]
}

interface Message {
  id: string
  authorId: string
  authorName: string
  authorAvatar: string
  content: string
  type: 'text' | 'code' | 'file' | 'achievement' | 'system'
  timestamp: string
  reactions: { emoji: string; users: string[]; count: number }[]
  replies?: Message[]
  attachments?: { name: string; url: string; type: string }[]
  codeLanguage?: string
}

interface StudySession {
  id: string
  title: string
  groupId: string
  hostId: string
  hostName: string
  scheduledAt: string
  duration: number
  description: string
  topics: string[]
  attendees: string[]
  maxAttendees: number
  isRecurring: boolean
  status: 'upcoming' | 'live' | 'completed'
  materials: { name: string; url: string }[]
}

interface CommunityChallenge {
  id: string
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
  timeLimit: string
  participants: number
  completions: number
  rewards: {
    xp: number
    badges: string[]
    titles: string[]
  }
  startDate: string
  endDate: string
  leaderboard: {
    rank: number
    userId: string
    userName: string
    score: number
    completionTime: string
  }[]
}

// Sample data
const sampleStudyGroups: StudyGroup[] = [
  {
    id: 'php-beginners',
    name: 'PHP untuk Pemula',
    description: 'Kumpulan belajar PHP dari asas hingga mahir. Sesuai untuk yang baru bermula dengan programming.',
    category: 'Programming',
    difficulty: 'beginner',
    members: [
      { id: '1', name: 'Ahmad Zain', avatar: '/api/placeholder/40/40', role: 'admin', joinedAt: '2025-06-01', xp: 2500, streak: 15, contributions: 45, isOnline: true, lastSeen: 'now', specializations: ['PHP', 'MySQL'] },
      { id: '2', name: 'Siti Fatimah', avatar: '/api/placeholder/40/40', role: 'moderator', joinedAt: '2025-06-05', xp: 2200, streak: 12, contributions: 38, isOnline: false, lastSeen: '2h ago', specializations: ['PHP', 'HTML'] },
      { id: '3', name: 'Muhammad Ali', avatar: '/api/placeholder/40/40', role: 'member', joinedAt: '2025-06-10', xp: 1800, streak: 8, contributions: 22, isOnline: true, lastSeen: 'now', specializations: ['PHP'] }
    ],
    maxMembers: 25,
    isPrivate: false,
    tags: ['php', 'beginner', 'web development', 'backend'],
    createdAt: '2025-06-01',
    lastActivity: '2025-07-12T10:30:00Z',
    weeklyGoal: 500,
    currentWeekProgress: 340,
    achievements: ['First Week Complete', 'Team Player', 'Helper'],
    rules: [
      'Bersikap hormat kepada semua ahli',
      'Gunakan Bahasa Malaysia atau Bahasa Inggeris',
      'Bantu ahli lain yang memerlukan',
      'Jangan spam atau post kandungan tidak berkaitan'
    ],
    meetingSchedule: {
      day: 'Sabtu',
      time: '14:00',
      duration: 120
    },
    stats: {
      totalXp: 15600,
      challengesCompleted: 48,
      studySessions: 12,
      averageScore: 87.5
    }
  },
  {
    id: 'js-advanced',
    name: 'JavaScript Advanced',
    description: 'Untuk yang ingin mendalami JavaScript - ES6+, Async/Await, Node.js, dan framework moden.',
    category: 'Programming',
    difficulty: 'advanced',
    members: [
      { id: '4', name: 'Sarah Lee', avatar: '/api/placeholder/40/40', role: 'admin', joinedAt: '2025-05-15', xp: 4200, streak: 28, contributions: 85, isOnline: true, lastSeen: 'now', specializations: ['JavaScript', 'React', 'Node.js'] },
      { id: '5', name: 'Daniel Chen', avatar: '/api/placeholder/40/40', role: 'member', joinedAt: '2025-05-20', xp: 3800, streak: 22, contributions: 67, isOnline: false, lastSeen: '1h ago', specializations: ['JavaScript', 'Vue.js'] }
    ],
    maxMembers: 15,
    isPrivate: true,
    tags: ['javascript', 'advanced', 'es6', 'nodejs', 'react'],
    createdAt: '2025-05-15',
    lastActivity: '2025-07-12T09:15:00Z',
    weeklyGoal: 800,
    currentWeekProgress: 720,
    achievements: ['Elite Group', 'Knowledge Sharing', 'Mentor'],
    rules: [
      'Minimum 6 bulan pengalaman JavaScript',
      'Aktif dalam diskusi dan code review',
      'Share knowledge dan resources',
      'Maintain code quality standards'
    ],
    stats: {
      totalXp: 28400,
      challengesCompleted: 95,
      studySessions: 24,
      averageScore: 94.2
    }
  }
]

const sampleMessages: Message[] = [
  {
    id: '1',
    authorId: '1',
    authorName: 'Ahmad Zain',
    authorAvatar: '/api/placeholder/40/40',
    content: 'Selamat pagi semua! Ada yang nak belajar array functions hari ni?',
    type: 'text',
    timestamp: '2025-07-12T08:00:00Z',
    reactions: [
      { emoji: '👍', users: ['2', '3'], count: 2 },
      { emoji: '🔥', users: ['3'], count: 1 }
    ]
  },
  {
    id: '2',
    authorId: '2',
    authorName: 'Siti Fatimah',
    authorAvatar: '/api/placeholder/40/40',
    content: 'Boleh! Saya masih confuse dengan map() dan filter()',
    type: 'text',
    timestamp: '2025-07-12T08:05:00Z',
    reactions: []
  },
  {
    id: '3',
    authorId: '1',
    authorName: 'Ahmad Zain',
    authorAvatar: '/api/placeholder/40/40',
    content: '$numbers = [1, 2, 3, 4, 5];\n$doubled = array_map(function($n) {\n    return $n * 2;\n}, $numbers);\n\nprint_r($doubled); // [2, 4, 6, 8, 10]',
    type: 'code',
    codeLanguage: 'php',
    timestamp: '2025-07-12T08:10:00Z',
    reactions: [
      { emoji: '💯', users: ['2', '3'], count: 2 }
    ]
  }
]

export function SocialFeaturesSystem() {
  const [currentView, setCurrentView] = useState<'groups' | 'discover' | 'sessions' | 'challenges' | 'community'>('groups')
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>(sampleStudyGroups)
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null)
  const [messages, setMessages] = useState<Message[]>(sampleMessages)
  const [newMessage, setNewMessage] = useState('')
  const [messageType, setMessageType] = useState<'text' | 'code'>('text')
  const [showGroupDetails, setShowGroupDetails] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const { addNotification } = useNotifications()

  const joinGroup = (groupId: string) => {
    const group = studyGroups.find(g => g.id === groupId)
    if (!group) return

    if (group.members.length >= group.maxMembers) {
      addNotification({
        type: 'error',
        title: '👥 Kumpulan Penuh',
        message: 'Kumpulan ini telah mencapai had maksimum ahli'
      })
      return
    }

    const newMember: GroupMember = {
      id: 'current-user',
      name: 'Anda',
      avatar: '/api/placeholder/40/40',
      role: 'member',
      joinedAt: new Date().toISOString(),
      xp: 1200,
      streak: 5,
      contributions: 0,
      isOnline: true,
      lastSeen: 'now',
      specializations: ['PHP']
    }

    setStudyGroups(prev => prev.map(g => 
      g.id === groupId 
        ? { ...g, members: [...g.members, newMember] }
        : g
    ))

    addNotification({
      type: 'success',
      title: '🎉 Menyertai Kumpulan',
      message: `Anda telah menyertai "${group.name}"`
    })
  }

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedGroup) return

    const message: Message = {
      id: Date.now().toString(),
      authorId: 'current-user',
      authorName: 'Anda',
      authorAvatar: '/api/placeholder/40/40',
      content: newMessage,
      type: messageType,
      timestamp: new Date().toISOString(),
      reactions: [],
      codeLanguage: messageType === 'code' ? 'php' : undefined
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')
    
    addNotification({
      type: 'success',
      title: '💬 Mesej Dihantar',
      message: 'Mesej anda telah dihantar ke kumpulan'
    })
  }

  const addReaction = (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const existingReaction = msg.reactions.find(r => r.emoji === emoji)
        if (existingReaction) {
          if (existingReaction.users.includes('current-user')) {
            // Remove reaction
            return {
              ...msg,
              reactions: msg.reactions.map(r => 
                r.emoji === emoji 
                  ? { ...r, users: r.users.filter(u => u !== 'current-user'), count: r.count - 1 }
                  : r
              ).filter(r => r.count > 0)
            }
          } else {
            // Add reaction
            return {
              ...msg,
              reactions: msg.reactions.map(r => 
                r.emoji === emoji 
                  ? { ...r, users: [...r.users, 'current-user'], count: r.count + 1 }
                  : r
              )
            }
          }
        } else {
          // New reaction
          return {
            ...msg,
            reactions: [...msg.reactions, { emoji, users: ['current-user'], count: 1 }]
          }
        }
      }
      return msg
    }))
  }

  const filteredGroups = studyGroups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = filterCategory === 'all' || group.category === filterCategory
    const matchesDifficulty = filterDifficulty === 'all' || group.difficulty === filterDifficulty
    return matchesSearch && matchesCategory && matchesDifficulty
  })

  if (selectedGroup) {
    return (
      <GroupChatView
        group={selectedGroup}
        messages={messages}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        messageType={messageType}
        setMessageType={setMessageType}
        onBack={() => setSelectedGroup(null)}
        onSendMessage={sendMessage}
        onAddReaction={addReaction}
        showGroupDetails={showGroupDetails}
        setShowGroupDetails={setShowGroupDetails}
      />
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gradient mb-2">Komuniti Pembelajaran</h2>
        <p className="text-gray-400">Belajar bersama-sama dalam kumpulan dan berkongsi pengetahuan</p>
      </div>

      {/* Navigation Tabs */}
      <div className="glass-dark rounded-xl p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-gray-800 rounded-lg p-1">
            {[
              { id: 'groups', label: 'Kumpulan Saya', icon: Users },
              { id: 'discover', label: 'Jelajah', icon: Search },
              { id: 'sessions', label: 'Sesi Belajar', icon: Calendar },
              { id: 'challenges', label: 'Cabaran Komuniti', icon: Trophy },
              { id: 'community', label: 'Forum Komuniti', icon: MessageCircle }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setCurrentView(tab.id as any)}
                className={`flex items-center space-x-2 px-3 py-2 rounded text-sm transition-colors ${
                  currentView === tab.id 
                    ? 'bg-electric-blue text-black' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      {currentView === 'groups' && (
        <MyGroupsView 
          studyGroups={studyGroups.filter(g => g.members.some(m => m.id === 'current-user'))}
          onSelectGroup={setSelectedGroup}
        />
      )}

      {currentView === 'discover' && (
        <DiscoverGroupsView
          studyGroups={filteredGroups}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          filterDifficulty={filterDifficulty}
          setFilterDifficulty={setFilterDifficulty}
          onJoinGroup={joinGroup}
          onSelectGroup={setSelectedGroup}
        />
      )}

      {currentView === 'sessions' && <StudySessionsView />}
      {currentView === 'challenges' && <CommunityChallengesView />}
      {currentView === 'community' && <CommunityForumView />}
    </div>
  )
}

function MyGroupsView({ 
  studyGroups, 
  onSelectGroup 
}: {
  studyGroups: StudyGroup[]
  onSelectGroup: (group: StudyGroup) => void
}) {
  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-dark rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-electric-blue" />
            <div>
              <h3 className="text-2xl font-bold text-white">{studyGroups.length}</h3>
              <p className="text-gray-400 text-sm">Kumpulan Aktif</p>
            </div>
          </div>
        </div>
        
        <div className="glass-dark rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <div>
              <h3 className="text-2xl font-bold text-white">
                {studyGroups.reduce((total, g) => total + g.stats.totalXp, 0).toLocaleString()}
              </h3>
              <p className="text-gray-400 text-sm">XP Kumpulan</p>
            </div>
          </div>
        </div>
        
        <div className="glass-dark rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <Flame className="w-8 h-8 text-orange-400" />
            <div>
              <h3 className="text-2xl font-bold text-white">15</h3>
              <p className="text-gray-400 text-sm">Hari Streak</p>
            </div>
          </div>
        </div>
        
        <div className="glass-dark rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <Star className="w-8 h-8 text-purple-400" />
            <div>
              <h3 className="text-2xl font-bold text-white">87%</h3>
              <p className="text-gray-400 text-sm">Skor Purata</p>
            </div>
          </div>
        </div>
      </div>

      {/* My Groups */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {studyGroups.map(group => (
          <GroupCard
            key={group.id}
            group={group}
            isJoined={true}
            onAction={() => onSelectGroup(group)}
            actionLabel="Buka Chat"
          />
        ))}
      </div>

      {studyGroups.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">Belum Menyertai Kumpulan</h3>
          <p className="text-gray-500 mb-4">Jelajahi kumpulan belajar yang tersedia</p>
          <button className="btn-primary">
            Jelajah Kumpulan
          </button>
        </div>
      )}
    </div>
  )
}

function DiscoverGroupsView({
  studyGroups,
  searchTerm,
  setSearchTerm,
  filterCategory,
  setFilterCategory,
  filterDifficulty,
  setFilterDifficulty,
  onJoinGroup,
  onSelectGroup
}: {
  studyGroups: StudyGroup[]
  searchTerm: string
  setSearchTerm: (term: string) => void
  filterCategory: string
  setFilterCategory: (category: string) => void
  filterDifficulty: string
  setFilterDifficulty: (difficulty: string) => void
  onJoinGroup: (groupId: string) => void
  onSelectGroup: (group: StudyGroup) => void
}) {
  const categories = [...new Set(studyGroups.map(g => g.category))]

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="glass-dark rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Cari kumpulan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue"
            />
          </div>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
          >
            <option value="all">Semua Kategori</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
          >
            <option value="all">Semua Tahap</option>
            <option value="beginner">Pemula</option>
            <option value="intermediate">Pertengahan</option>
            <option value="advanced">Mahir</option>
          </select>

          <button className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Cipta Kumpulan
          </button>
        </div>
      </div>

      {/* Featured Groups */}
      <div className="glass-dark rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Star className="w-5 h-5 mr-2 text-electric-blue" />
          Kumpulan Pilihan
        </h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {studyGroups.slice(0, 3).map(group => (
            <GroupCard
              key={group.id}
              group={group}
              isJoined={group.members.some(m => m.id === 'current-user')}
              onAction={() => group.members.some(m => m.id === 'current-user') ? onSelectGroup(group) : onJoinGroup(group.id)}
              actionLabel={group.members.some(m => m.id === 'current-user') ? 'Buka Chat' : 'Sertai'}
              featured={true}
            />
          ))}
        </div>
      </div>

      {/* All Groups */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {studyGroups.map(group => (
          <GroupCard
            key={group.id}
            group={group}
            isJoined={group.members.some(m => m.id === 'current-user')}
            onAction={() => group.members.some(m => m.id === 'current-user') ? onSelectGroup(group) : onJoinGroup(group.id)}
            actionLabel={group.members.some(m => m.id === 'current-user') ? 'Buka Chat' : 'Sertai'}
          />
        ))}
      </div>
    </div>
  )
}

function GroupCard({ 
  group, 
  isJoined, 
  onAction, 
  actionLabel, 
  featured = false 
}: {
  group: StudyGroup
  isJoined: boolean
  onAction: () => void
  actionLabel: string
  featured?: boolean
}) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400 bg-green-400/20'
      case 'intermediate': return 'text-yellow-400 bg-yellow-400/20'
      case 'advanced': return 'text-red-400 bg-red-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const progressPercentage = (group.currentWeekProgress / group.weeklyGoal) * 100

  return (
    <div className={`glass-dark rounded-xl p-6 card-hover group ${featured ? 'border border-electric-blue/30' : ''}`}>
      {featured && (
        <div className="flex items-center space-x-2 mb-3">
          <Star className="w-4 h-4 text-electric-blue" />
          <span className="text-electric-blue text-sm font-medium">Pilihan</span>
        </div>
      )}
      
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2">{group.name}</h3>
          <p className="text-gray-400 text-sm line-clamp-2">{group.description}</p>
        </div>
        
        {group.isPrivate && (
          <div className="ml-2 p-1 bg-yellow-500/20 rounded">
            <Crown className="w-4 h-4 text-yellow-400" />
          </div>
        )}
      </div>

      {/* Meta Info */}
      <div className="flex items-center justify-between mb-4">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getDifficultyColor(group.difficulty)}`}>
          {group.difficulty.toUpperCase()}
        </span>
        
        <div className="flex items-center space-x-3 text-gray-400 text-sm">
          <span className="flex items-center space-x-1">
            <Users className="w-3 h-3" />
            <span>{group.members.length}/{group.maxMembers}</span>
          </span>
          <span className="flex items-center space-x-1">
            <Trophy className="w-3 h-3" />
            <span>{group.stats.totalXp.toLocaleString()}</span>
          </span>
        </div>
      </div>

      {/* Weekly Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-400">Matlamat Mingguan</span>
          <span className="text-white">{group.currentWeekProgress}/{group.weeklyGoal} XP</span>
        </div>
        <div className="w-full bg-gray-700 h-2 rounded-full">
          <div 
            className="bg-gradient-to-r from-electric-blue to-electric-blue/70 h-2 rounded-full transition-all"
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Members Preview */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex -space-x-2">
          {group.members.slice(0, 4).map((member, index) => (
            <div
              key={index}
              className="w-8 h-8 rounded-full border-2 border-gray-800 overflow-hidden"
            >
              <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
            </div>
          ))}
          {group.members.length > 4 && (
            <div className="w-8 h-8 rounded-full border-2 border-gray-800 bg-gray-700 flex items-center justify-center text-xs text-white">
              +{group.members.length - 4}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-1 text-gray-400 text-xs">
          <Clock className="w-3 h-3" />
          <span>{new Date(group.lastActivity).toLocaleDateString('ms-MY')}</span>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {group.tags.slice(0, 3).map(tag => (
          <span key={tag} className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded">
            #{tag}
          </span>
        ))}
      </div>

      {/* Action Button */}
      <button
        onClick={onAction}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
          isJoined 
            ? 'bg-electric-blue text-black hover:bg-electric-blue/80'
            : 'bg-gray-700 text-white hover:bg-gray-600'
        }`}
      >
        {actionLabel}
      </button>
    </div>
  )
}

function GroupChatView({
  group,
  messages,
  newMessage,
  setNewMessage,
  messageType,
  setMessageType,
  onBack,
  onSendMessage,
  onAddReaction,
  showGroupDetails,
  setShowGroupDetails
}: {
  group: StudyGroup
  messages: Message[]
  newMessage: string
  setNewMessage: (message: string) => void
  messageType: 'text' | 'code'
  setMessageType: (type: 'text' | 'code') => void
  onBack: () => void
  onSendMessage: () => void
  onAddReaction: (messageId: string, emoji: string) => void
  showGroupDetails: boolean
  setShowGroupDetails: (show: boolean) => void
}) {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('ms-MY', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="glass-dark rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← Kembali
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-electric-blue/20 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-electric-blue" />
              </div>
              <div>
                <h2 className="text-white font-semibold">{group.name}</h2>
                <p className="text-gray-400 text-sm">{group.members.length} ahli • {group.members.filter(m => m.isOnline).length} online</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowGroupDetails(!showGroupDetails)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className={`grid gap-6 ${showGroupDetails ? 'lg:grid-cols-3' : 'lg:grid-cols-1'}`}>
        {/* Chat Area */}
        <div className={showGroupDetails ? 'lg:col-span-2' : 'lg:col-span-1'}>
          <div className="glass-dark rounded-xl">
            {/* Messages */}
            <div className="h-96 overflow-y-auto p-6 space-y-4">
              {messages.map(message => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  onAddReaction={onAddReaction}
                  formatTime={formatTime}
                />
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-700">
              <div className="flex items-center space-x-2 mb-2">
                <button
                  onClick={() => setMessageType('text')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    messageType === 'text' ? 'bg-electric-blue text-black' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  💬 Teks
                </button>
                <button
                  onClick={() => setMessageType('code')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    messageType === 'code' ? 'bg-electric-blue text-black' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  💻 Kod
                </button>
              </div>
              
              <div className="flex space-x-2">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={messageType === 'code' ? 'Tulis kod anda di sini...' : 'Tulis mesej...'}
                  className={`flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue resize-none ${
                    messageType === 'code' ? 'font-mono text-sm' : ''
                  }`}
                  rows={messageType === 'code' ? 4 : 1}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && messageType === 'text') {
                      e.preventDefault()
                      onSendMessage()
                    }
                  }}
                />
                <button
                  onClick={onSendMessage}
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-electric-blue text-black rounded-lg hover:bg-electric-blue/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Group Details Sidebar */}
        {showGroupDetails && (
          <div className="space-y-6">
            {/* Group Info */}
            <div className="glass-dark rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4">Maklumat Kumpulan</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Kategori</span>
                  <span className="text-white">{group.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tahap</span>
                  <span className="text-white capitalize">{group.difficulty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Ahli</span>
                  <span className="text-white">{group.members.length}/{group.maxMembers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Dibuat</span>
                  <span className="text-white">{new Date(group.createdAt).toLocaleDateString('ms-MY')}</span>
                </div>
              </div>
            </div>

            {/* Members List */}
            <div className="glass-dark rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4">Ahli Kumpulan</h3>
              <div className="space-y-3">
                {group.members.map(member => (
                  <div key={member.id} className="flex items-center space-x-3">
                    <div className="relative">
                      <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full" />
                      {member.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-800" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-white text-sm font-medium">{member.name}</span>
                        {member.role === 'admin' && <Crown className="w-3 h-3 text-yellow-400" />}
                        {member.role === 'moderator' && <Star className="w-3 h-3 text-blue-400" />}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {member.isOnline ? 'Online' : member.lastSeen}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white text-sm">{member.xp} XP</div>
                      <div className="text-gray-400 text-xs">🔥 {member.streak}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Group Rules */}
            <div className="glass-dark rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4">Peraturan Kumpulan</h3>
              <div className="space-y-2">
                {group.rules.map((rule, index) => (
                  <div key={index} className="flex items-start space-x-2 text-sm">
                    <span className="text-electric-blue font-bold">{index + 1}.</span>
                    <span className="text-gray-300">{rule}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function MessageBubble({ 
  message, 
  onAddReaction, 
  formatTime 
}: {
  message: Message
  onAddReaction: (messageId: string, emoji: string) => void
  formatTime: (timestamp: string) => string
}) {
  const [showReactions, setShowReactions] = useState(false)
  const isCurrentUser = message.authorId === 'current-user'

  const reactionEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡']

  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-md ${isCurrentUser ? 'order-2' : 'order-1'}`}>
        {!isCurrentUser && (
          <div className="flex items-center space-x-2 mb-1">
            <img src={message.authorAvatar} alt={message.authorName} className="w-6 h-6 rounded-full" />
            <span className="text-gray-400 text-sm">{message.authorName}</span>
            <span className="text-gray-500 text-xs">{formatTime(message.timestamp)}</span>
          </div>
        )}
        
        <div className={`relative group ${
          isCurrentUser ? 'bg-electric-blue text-black' : 'bg-gray-800 text-white'
        } p-3 rounded-lg`}>
          {message.type === 'code' ? (
            <pre className={`text-sm overflow-x-auto ${isCurrentUser ? 'text-black' : 'text-gray-200'}`}>
              <code>{message.content}</code>
            </pre>
          ) : (
            <p className="text-sm">{message.content}</p>
          )}
          
          {/* Reaction Button */}
          <button
            onClick={() => setShowReactions(!showReactions)}
            className="absolute -top-2 -right-2 w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Heart className="w-3 h-3 text-gray-300" />
          </button>
          
          {/* Reaction Picker */}
          {showReactions && (
            <div className="absolute top-full right-0 mt-1 bg-gray-900 border border-gray-700 rounded-lg p-2 flex space-x-1 z-10">
              {reactionEmojis.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => {
                    onAddReaction(message.id, emoji)
                    setShowReactions(false)
                  }}
                  className="hover:bg-gray-800 p-1 rounded transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Reactions */}
        {message.reactions.length > 0 && (
          <div className="flex space-x-1 mt-1">
            {message.reactions.map((reaction, index) => (
              <button
                key={index}
                onClick={() => onAddReaction(message.id, reaction.emoji)}
                className={`px-2 py-1 rounded-full text-xs flex items-center space-x-1 transition-colors ${
                  reaction.users.includes('current-user')
                    ? 'bg-electric-blue/20 text-electric-blue border border-electric-blue/30'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span>{reaction.emoji}</span>
                <span>{reaction.count}</span>
              </button>
            ))}
          </div>
        )}
        
        {isCurrentUser && (
          <div className="text-right mt-1">
            <span className="text-gray-500 text-xs">{formatTime(message.timestamp)}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function StudySessionsView() {
  return (
    <div className="text-center py-12">
      <Calendar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-400 mb-2">Sesi Belajar</h3>
      <p className="text-gray-500">Fitur ini akan tersedia tidak lama lagi</p>
    </div>
  )
}

function CommunityChallengesView() {
  return (
    <div className="text-center py-12">
      <Trophy className="w-16 h-16 text-gray-500 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-400 mb-2">Cabaran Komuniti</h3>
      <p className="text-gray-500">Fitur ini akan tersedia tidak lama lagi</p>
    </div>
  )
}

function CommunityForumView() {
  return (
    <div className="text-center py-12">
      <MessageCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-400 mb-2">Forum Komuniti</h3>
      <p className="text-gray-500">Fitur ini akan tersedia tidak lama lagi</p>
    </div>
  )
}
