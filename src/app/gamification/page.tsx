'use client'

import React, { useState } from 'react'
import { 
  Trophy, 
  BookOpen, 
  Target, 
  Star,
  Gamepad2,
  GraduationCap
} from 'lucide-react'
import { EnhancedLevelSystem, ExerciseLibrary } from '@/components/gamification'

export default function GamificationPage() {
  const [currentView, setCurrentView] = useState<'overview' | 'levels' | 'exercises'>('overview')

  const navItems = [
    { 
      id: 'overview', 
      label: 'Overview', 
      icon: <Target className="w-5 h-5" />,
      description: 'Your learning progress and achievements'
    },
    { 
      id: 'levels', 
      label: 'Learning Levels', 
      icon: <Trophy className="w-5 h-5" />,
      description: 'Structured challenges and progression'
    },
    { 
      id: 'exercises', 
      label: 'Practice Library', 
      icon: <BookOpen className="w-5 h-5" />,
      description: 'Additional exercises and bonus XP'
    }
  ]

  if (currentView === 'levels') {
    return <EnhancedLevelSystem />
  }

  if (currentView === 'exercises') {
    return <ExerciseLibrary />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-black via-gray-900 to-dark-black">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Gamepad2 className="w-10 h-10 text-electric-blue" />
            <div>
              <h1 className="text-4xl font-bold text-gradient">CodeCikgu Learning System</h1>
              <p className="text-gray-400">Master programming through structured levels and practice exercises</p>
            </div>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as any)}
              className="glass-dark rounded-2xl p-8 text-left transition-all duration-300 hover:scale-105 hover:border-electric-blue/30 group"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-electric-blue/20 rounded-xl text-electric-blue group-hover:bg-electric-blue/30 transition-colors">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{item.label}</h3>
                  <p className="text-gray-400 text-sm">{item.description}</p>
                </div>
              </div>
              
              <div className="text-electric-blue text-sm font-medium group-hover:text-white transition-colors">
                Click to explore →
              </div>
            </button>
          ))}
        </div>

        {/* Quick Stats Overview */}
        <div className="glass-dark rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Your Learning Journey</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-electric-blue mb-2">1,250</div>
              <div className="text-gray-400">Total XP</div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div className="bg-gradient-to-r from-electric-blue to-neon-cyan h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">Level 2.3</div>
              <div className="text-gray-400">Current Level</div>
              <div className="text-sm text-gray-500 mt-2">Arrays & Lists</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">18</div>
              <div className="text-gray-400">Challenges Done</div>
              <div className="text-sm text-gray-500 mt-2">82% completion rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">45</div>
              <div className="text-gray-400">Extra Exercises</div>
              <div className="text-sm text-gray-500 mt-2">+680 bonus XP</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Achievements */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Recent Achievements</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
                  <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <div className="text-white font-medium">Level Up!</div>
                    <div className="text-sm text-gray-400">Reached Level 2.3: Arrays & Lists</div>
                  </div>
                  <div className="text-xs text-gray-500">2 hours ago</div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                    <Star className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <div className="text-white font-medium">Perfect Score</div>
                    <div className="text-sm text-gray-400">100% on PHP Functions Challenge</div>
                  </div>
                  <div className="text-xs text-gray-500">1 day ago</div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-white font-medium">Knowledge Seeker</div>
                    <div className="text-sm text-gray-400">Completed 50 exercise notes</div>
                  </div>
                  <div className="text-xs text-gray-500">3 days ago</div>
                </div>
              </div>
            </div>

            {/* Quick Access */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Continue Learning</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => setCurrentView('levels')}
                  className="w-full p-4 bg-gradient-to-r from-electric-blue/20 to-neon-cyan/20 border border-electric-blue/30 rounded-lg text-left hover:from-electric-blue/30 hover:to-neon-cyan/30 transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <Trophy className="w-6 h-6 text-electric-blue" />
                    <div>
                      <div className="text-white font-medium">Next Challenge</div>
                      <div className="text-sm text-gray-300">Level 2.4: String Manipulation</div>
                    </div>
                  </div>
                </button>
                <button 
                  onClick={() => setCurrentView('exercises')}
                  className="w-full p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg text-left hover:from-purple-500/30 hover:to-pink-500/30 transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <BookOpen className="w-6 h-6 text-purple-400" />
                    <div>
                      <div className="text-white font-medium">Daily Practice</div>
                      <div className="text-sm text-gray-300">Algorithm challenges for extra XP</div>
                    </div>
                  </div>
                </button>
                <button className="w-full p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg text-left hover:from-yellow-500/30 hover:to-orange-500/30 transition-all">
                  <div className="flex items-center space-x-3">
                    <Star className="w-6 h-6 text-yellow-400" />
                    <div>
                      <div className="text-white font-medium">Streak Challenge</div>
                      <div className="text-sm text-gray-300">Day 7 of daily learning</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Learning Path Preview */}
        <div className="glass-dark rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Learning Path Overview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {[
              { level: 'Level 1', title: 'Newbie Coder', status: 'completed', progress: 100 },
              { level: 'Level 2', title: 'Junior Developer', status: 'current', progress: 60 },
              { level: 'Level 3', title: 'Intermediate Coder', status: 'locked', progress: 0 },
              { level: 'Level 4', title: 'Advanced Programmer', status: 'locked', progress: 0 },
              { level: 'Level 5', title: 'Expert Developer', status: 'locked', progress: 0 },
              { level: 'Level 6', title: 'Coding Master', status: 'locked', progress: 0 }
            ].map((level, index) => (
              <div key={index} className={`p-4 rounded-xl border-2 transition-all ${
                level.status === 'completed' ? 'border-green-500/50 bg-green-500/10' :
                level.status === 'current' ? 'border-electric-blue/50 bg-electric-blue/10' :
                'border-gray-700 bg-gray-800/30'
              }`}>
                <div className="text-center">
                  <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${
                    level.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    level.status === 'current' ? 'bg-electric-blue/20 text-electric-blue' :
                    'bg-gray-700 text-gray-500'
                  }`}>
                    {level.status === 'completed' ? '✓' : 
                     level.status === 'locked' ? '🔒' :
                     <GraduationCap className="w-6 h-6" />}
                  </div>
                  <div className={`font-bold text-sm mb-1 ${
                    level.status === 'locked' ? 'text-gray-500' : 'text-white'
                  }`}>
                    {level.level}
                  </div>
                  <div className={`text-xs mb-2 ${
                    level.status === 'locked' ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {level.title}
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1">
                    <div 
                      className={`h-1 rounded-full transition-all ${
                        level.status === 'completed' ? 'bg-green-500' :
                        level.status === 'current' ? 'bg-electric-blue' :
                        'bg-gray-700'
                      }`}
                      style={{ width: `${level.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <button 
              onClick={() => setCurrentView('levels')}
              className="btn-primary"
            >
              <Trophy className="w-5 h-5 mr-2" />
              Continue Learning Journey
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
