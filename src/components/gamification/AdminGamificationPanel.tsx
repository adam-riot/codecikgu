'use client'

import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Eye, 
  BarChart3,
  Users,
  Trophy,
  Target,
  Book,
  Video,
  Code,
  FileText,
  Settings,
  Upload,
  Download,
  RefreshCw
} from 'lucide-react'
import { useNotifications } from '../NotificationProvider'

interface AdminLevel {
  id: string
  level_number: number
  sublevel_number: number
  title: string
  description: string
  xp_required_min: number
  xp_required_max: number
  unlock_conditions: string[]
  is_active: boolean
  challenge_count: number
  student_count: number
  completion_rate: number
}

interface AdminChallenge {
  id: string
  level_id: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'hard'
  xp_reward: number
  time_estimate: number
  tasks: AdminTask[]
  prerequisites: string[]
  order_index: number
  is_active: boolean
  completion_count: number
  average_score: number
  student_feedback_score: number
}

interface AdminTask {
  id: string
  title: string
  description: string
  type: 'theory' | 'practice' | 'quiz' | 'project'
  xp_reward: number
  content: any
  is_required: boolean
}

interface AdminExercise {
  id: string
  category_id: string
  title: string
  description: string
  type: 'note' | 'video' | 'quiz' | 'code_drill' | 'skill_practice'
  difficulty: 'beginner' | 'intermediate' | 'hard'
  xp_reward: number
  estimated_duration: number
  content: any
  tags: string[]
  is_featured: boolean
  is_active: boolean
  views_count: number
  completion_count: number
  average_rating: number
}

interface AdminStats {
  total_students: number
  active_levels: number
  total_challenges: number
  total_exercises: number
  avg_student_progress: number
  total_xp_awarded: number
}

export function AdminGamificationPanel() {
  const [currentTab, setCurrentTab] = useState<'overview' | 'levels' | 'challenges' | 'exercises' | 'analytics'>('overview')
  const [adminStats, setAdminStats] = useState<AdminStats>({
    total_students: 1247,
    active_levels: 18,
    total_challenges: 45,
    total_exercises: 124,
    avg_student_progress: 67.8,
    total_xp_awarded: 284750
  })
  const { addNotification } = useNotifications()

  const tabItems = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'levels', label: 'Levels', icon: <Trophy className="w-5 h-5" /> },
    { id: 'challenges', label: 'Challenges', icon: <Target className="w-5 h-5" /> },
    { id: 'exercises', label: 'Exercises', icon: <Book className="w-5 h-5" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> }
  ]

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gradient mb-2">🎮 Gamification Admin</h1>
        <p className="text-gray-400">Manage levels, challenges, and exercises</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
        <div className="glass-dark rounded-xl p-4 text-center">
          <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <div className="text-lg font-bold text-white">{adminStats.total_students.toLocaleString()}</div>
          <div className="text-sm text-gray-400">Students</div>
        </div>
        <div className="glass-dark rounded-xl p-4 text-center">
          <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
          <div className="text-lg font-bold text-white">{adminStats.active_levels}</div>
          <div className="text-sm text-gray-400">Levels</div>
        </div>
        <div className="glass-dark rounded-xl p-4 text-center">
          <Target className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <div className="text-lg font-bold text-white">{adminStats.total_challenges}</div>
          <div className="text-sm text-gray-400">Challenges</div>
        </div>
        <div className="glass-dark rounded-xl p-4 text-center">
          <Book className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <div className="text-lg font-bold text-white">{adminStats.total_exercises}</div>
          <div className="text-sm text-gray-400">Exercises</div>
        </div>
        <div className="glass-dark rounded-xl p-4 text-center">
          <BarChart3 className="w-8 h-8 text-orange-400 mx-auto mb-2" />
          <div className="text-lg font-bold text-white">{adminStats.avg_student_progress.toFixed(1)}%</div>
          <div className="text-sm text-gray-400">Avg Progress</div>
        </div>
        <div className="glass-dark rounded-xl p-4 text-center">
          <Trophy className="w-8 h-8 text-electric-blue mx-auto mb-2" />
          <div className="text-lg font-bold text-white">{(adminStats.total_xp_awarded / 1000).toFixed(0)}K</div>
          <div className="text-sm text-gray-400">XP Awarded</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="glass-dark rounded-xl p-1 mb-8">
        <div className="flex space-x-1">
          {tabItems.map(tab => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                currentTab === tab.id
                  ? 'bg-electric-blue text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {currentTab === 'overview' && <OverviewTab />}
      {currentTab === 'levels' && <LevelsManagement />}
      {currentTab === 'challenges' && <ChallengesManagement />}
      {currentTab === 'exercises' && <ExercisesManagement />}
      {currentTab === 'analytics' && <AnalyticsTab />}
    </div>
  )
}

// Overview Tab Component
function OverviewTab() {
  return (
    <div className="space-y-8">
      {/* Quick Actions */}
      <div className="glass-dark rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-electric-blue/20 border border-electric-blue/30 rounded-lg hover:bg-electric-blue/30 transition-colors">
            <Plus className="w-6 h-6 text-electric-blue" />
            <div className="text-left">
              <div className="font-semibold text-white">Create New Level</div>
              <div className="text-sm text-gray-400">Add a new learning level</div>
            </div>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-purple-500/20 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition-colors">
            <Target className="w-6 h-6 text-purple-400" />
            <div className="text-left">
              <div className="font-semibold text-white">Add Challenge</div>
              <div className="text-sm text-gray-400">Create new challenge</div>
            </div>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-green-500/20 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors">
            <Book className="w-6 h-6 text-green-400" />
            <div className="text-left">
              <div className="font-semibold text-white">Add Exercise</div>
              <div className="text-sm text-gray-400">Create practice exercise</div>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-dark rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-gray-300">Challenge &ldquo;PHP Arrays Mastery&rdquo; completed by 15 students</span>
            <span className="text-sm text-gray-500 ml-auto">2 hours ago</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span className="text-gray-300">New exercise &ldquo;CSS Grid Tutorial&rdquo; added to Web Development</span>
            <span className="text-sm text-gray-500 ml-auto">5 hours ago</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span className="text-gray-300">Level 2.3 &ldquo;Arrays & Lists&rdquo; unlocked for 23 students</span>
            <span className="text-sm text-gray-500 ml-auto">1 day ago</span>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-dark rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Top Performing Challenges</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">PHP Basics - Variables</span>
              <span className="text-green-400">94% completion</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">JavaScript Functions</span>
              <span className="text-green-400">91% completion</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">HTML Structure</span>
              <span className="text-green-400">89% completion</span>
            </div>
          </div>
        </div>

        <div className="glass-dark rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Challenges Needing Attention</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Advanced Algorithms</span>
              <span className="text-red-400">34% completion</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Database Design</span>
              <span className="text-yellow-400">58% completion</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">OOP Concepts</span>
              <span className="text-yellow-400">61% completion</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Levels Management Component
function LevelsManagement() {
  const [levels, setLevels] = useState<AdminLevel[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingLevel, setEditingLevel] = useState<AdminLevel | null>(null)

  // Sample data
  useEffect(() => {
    setLevels([
      {
        id: '1-1',
        level_number: 1,
        sublevel_number: 1,
        title: 'Hello World',
        description: 'Your first steps into programming',
        xp_required_min: 0,
        xp_required_max: 100,
        unlock_conditions: [],
        is_active: true,
        challenge_count: 4,
        student_count: 1247,
        completion_rate: 94.2
      },
      {
        id: '1-2',
        level_number: 1,
        sublevel_number: 2,
        title: 'Variables & Data Types',
        description: 'Understanding data storage and manipulation',
        xp_required_min: 100,
        xp_required_max: 200,
        unlock_conditions: ['complete_80_percent_previous'],
        is_active: true,
        challenge_count: 5,
        student_count: 1156,
        completion_rate: 87.3
      }
    ])
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Level Management</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create New Level
        </button>
      </div>

      {/* Levels Grid */}
      <div className="grid gap-6">
        {levels.map(level => (
          <div key={level.id} className="glass-dark rounded-xl p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-xl font-bold text-white">
                    Level {level.level_number}.{level.sublevel_number}: {level.title}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    level.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {level.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-gray-300 mb-4">{level.description}</p>
                
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">XP Range:</span>
                    <div className="text-white font-medium">{level.xp_required_min} - {level.xp_required_max}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Challenges:</span>
                    <div className="text-white font-medium">{level.challenge_count}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Students:</span>
                    <div className="text-white font-medium">{level.student_count.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Completion:</span>
                    <div className="text-white font-medium">{level.completion_rate.toFixed(1)}%</div>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => setEditingLevel(level)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Level Modal */}
      {(showCreateModal || editingLevel) && (
        <LevelFormModal
          level={editingLevel}
          onClose={() => {
            setShowCreateModal(false)
            setEditingLevel(null)
          }}
          onSave={(levelData) => {
            // Handle save logic
            setShowCreateModal(false)
            setEditingLevel(null)
          }}
        />
      )}
    </div>
  )
}

// Level Form Modal
function LevelFormModal({ 
  level, 
  onClose, 
  onSave 
}: {
  level: AdminLevel | null
  onClose: () => void
  onSave: (levelData: any) => void
}) {
  const [formData, setFormData] = useState({
    level_number: level?.level_number || 1,
    sublevel_number: level?.sublevel_number || 1,
    title: level?.title || '',
    description: level?.description || '',
    xp_required_min: level?.xp_required_min || 0,
    xp_required_max: level?.xp_required_max || 100,
    unlock_conditions: level?.unlock_conditions || [],
    is_active: level?.is_active ?? true
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass-dark rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              {level ? 'Edit Level' : 'Create New Level'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Level Number</label>
                <input
                  type="number"
                  value={formData.level_number}
                  onChange={(e) => setFormData({ ...formData, level_number: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Sub-level Number</label>
                <input
                  type="number"
                  value={formData.sublevel_number}
                  onChange={(e) => setFormData({ ...formData, sublevel_number: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white h-24"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Min XP Required</label>
                <input
                  type="number"
                  value={formData.xp_required_min}
                  onChange={(e) => setFormData({ ...formData, xp_required_min: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Max XP Required</label>
                <input
                  type="number"
                  value={formData.xp_required_max}
                  onChange={(e) => setFormData({ ...formData, xp_required_max: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 text-electric-blue"
              />
              <label htmlFor="is_active" className="text-gray-300">Active Level</label>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                className="btn-primary flex-1"
              >
                <Save className="w-4 h-4 mr-2" />
                {level ? 'Update Level' : 'Create Level'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// Placeholder components for other tabs
function ChallengesManagement() {
  return (
    <div className="glass-dark rounded-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-4">Challenge Management</h2>
      <p className="text-gray-400">Challenge management interface will be implemented here.</p>
    </div>
  )
}

function ExercisesManagement() {
  return (
    <div className="glass-dark rounded-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-4">Exercise Management</h2>
      <p className="text-gray-400">Exercise management interface will be implemented here.</p>
    </div>
  )
}

function AnalyticsTab() {
  return (
    <div className="glass-dark rounded-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-4">Analytics Dashboard</h2>
      <p className="text-gray-400">Detailed analytics and reporting will be implemented here.</p>
    </div>
  )
}

export default AdminGamificationPanel
