// Advanced Predictive Analytics System
// src/components/analytics/PredictiveAnalytics.tsx

import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target, 
  Brain,
  Users,
  Clock,
  Award,
  BarChart3,
  PieChart,
  LineChart,
  Activity
} from 'lucide-react'

export interface StudentMetrics {
  id: string
  name: string
  totalXP: number
  completedChallenges: number
  timeSpent: number
  averageScore: number
  streakDays: number
  lastActive: Date
  skillProgress: SkillProgress
  learningPattern: LearningPattern
  riskFactors: RiskFactor[]
}

export interface SkillProgress {
  programming: number
  problemSolving: number
  debugging: number
  codeReading: number
  projectWork: number
}

export interface LearningPattern {
  preferredTime: 'morning' | 'afternoon' | 'evening' | 'night'
  sessionDuration: number
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed'
  difficultyPreference: 'easy' | 'medium' | 'hard' | 'adaptive'
  collaborationTendency: number
}

export interface RiskFactor {
  type: 'engagement' | 'performance' | 'consistency' | 'difficulty'
  severity: 'low' | 'medium' | 'high'
  description: string
  recommendation: string
}

export interface PredictiveModel {
  successProbability: number
  strugglingRisk: number
  optimalPath: string[]
  recommendedInterventions: Intervention[]
  projectedOutcomes: ProjectedOutcome[]
}

export interface Intervention {
  type: 'content' | 'pacing' | 'support' | 'motivation'
  urgency: 'immediate' | 'soon' | 'monitor'
  action: string
  expectedImpact: number
}

export interface ProjectedOutcome {
  timeframe: '1week' | '1month' | '3months' | '6months'
  metric: string
  currentValue: number
  projectedValue: number
  confidence: number
}

export function PredictiveAnalytics() {
  const [students, setStudents] = useState<StudentMetrics[]>([])
  const [selectedStudent, setSelectedStudent] = useState<StudentMetrics | null>(null)
  const [predictions, setPredictions] = useState<PredictiveModel | null>(null)
  const [classOverview, setClassOverview] = useState({
    totalStudents: 0,
    atRiskStudents: 0,
    highPerformers: 0,
    averageEngagement: 0
  })

  useEffect(() => {
    // Load sample data
    const sampleStudents = generateSampleStudents()
    setStudents(sampleStudents)
    
    if (sampleStudents.length > 0) {
      setSelectedStudent(sampleStudents[0])
      setPredictions(generatePredictions(sampleStudents[0]))
    }

    setClassOverview({
      totalStudents: sampleStudents.length,
      atRiskStudents: sampleStudents.filter(s => s.riskFactors.some(r => r.severity === 'high')).length,
      highPerformers: sampleStudents.filter(s => s.averageScore > 85).length,
      averageEngagement: sampleStudents.reduce((acc, s) => acc + s.timeSpent, 0) / sampleStudents.length / 60
    })
  }, [])

  const handleStudentSelect = (student: StudentMetrics) => {
    setSelectedStudent(student)
    setPredictions(generatePredictions(student))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-black/20 backdrop-blur-md rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Brain className="w-8 h-8 text-purple-400" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Predictive Learning Analytics
                </h1>
                <p className="text-gray-300">AI-powered insights untuk student success</p>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{classOverview.totalStudents}</div>
                <div className="text-xs text-gray-300">Total Students</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{classOverview.atRiskStudents}</div>
                <div className="text-xs text-gray-300">At Risk</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{classOverview.highPerformers}</div>
                <div className="text-xs text-gray-300">High Performers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{classOverview.averageEngagement.toFixed(1)}h</div>
                <div className="text-xs text-gray-300">Avg Engagement</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student List */}
          <div className="bg-black/20 backdrop-blur-md rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Students Overview
            </h3>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {students.map((student) => (
                <div
                  key={student.id}
                  onClick={() => handleStudentSelect(student)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedStudent?.id === student.id 
                      ? 'bg-purple-600/30 border border-purple-500' 
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{student.name}</span>
                    <div className="flex items-center space-x-1">
                      {student.riskFactors.some(r => r.severity === 'high') && (
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                      )}
                      {student.averageScore > 85 && (
                        <Award className="w-4 h-4 text-yellow-400" />
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-gray-400">XP</div>
                      <div className="font-medium">{student.totalXP}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Score</div>
                      <div className={`font-medium ${
                        student.averageScore > 85 ? 'text-green-400' : 
                        student.averageScore > 70 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {student.averageScore.toFixed(0)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400">Streak</div>
                      <div className="font-medium">{student.streakDays}d</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Analytics */}
          <div className="lg:col-span-2 space-y-6">
            {selectedStudent && predictions && (
              <>
                {/* Student Overview */}
                <div className="bg-black/20 backdrop-blur-md rounded-xl p-6">
                  <h3 className="text-lg font-bold mb-4">{selectedStudent.name} - Detailed Analysis</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-3 bg-white/5 rounded-lg">
                      <div className="text-xl font-bold text-purple-400">{selectedStudent.totalXP}</div>
                      <div className="text-xs text-gray-300">Total XP</div>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-lg">
                      <div className="text-xl font-bold text-blue-400">{selectedStudent.completedChallenges}</div>
                      <div className="text-xs text-gray-300">Completed</div>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-lg">
                      <div className="text-xl font-bold text-green-400">{(selectedStudent.timeSpent / 60).toFixed(1)}h</div>
                      <div className="text-xs text-gray-300">Time Spent</div>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-lg">
                      <div className="text-xl font-bold text-yellow-400">{selectedStudent.averageScore.toFixed(0)}%</div>
                      <div className="text-xs text-gray-300">Avg Score</div>
                    </div>
                  </div>

                  {/* Skill Progress */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-3">Skill Progress</h4>
                    <div className="space-y-3">
                      {Object.entries(selectedStudent.skillProgress).map(([skill, progress]) => (
                        <div key={skill} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="capitalize">{skill.replace(/([A-Z])/g, ' $1')}</span>
                            <span>{(progress * 100).toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progress * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Predictive Insights */}
                <div className="bg-black/20 backdrop-blur-md rounded-xl p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center">
                    <Brain className="w-5 h-5 mr-2" />
                    AI Predictions & Insights
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Success Prediction */}
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg border border-green-500/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Success Probability</span>
                          <TrendingUp className="w-5 h-5 text-green-400" />
                        </div>
                        <div className="text-2xl font-bold text-green-400">
                          {(predictions.successProbability * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-300 mt-1">
                          Based on current trajectory
                        </div>
                      </div>

                      <div className="p-4 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-lg border border-red-500/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Struggling Risk</span>
                          <AlertTriangle className="w-5 h-5 text-red-400" />
                        </div>
                        <div className="text-2xl font-bold text-red-400">
                          {(predictions.strugglingRisk * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-300 mt-1">
                          Requires attention if above 30%
                        </div>
                      </div>
                    </div>

                    {/* Recommended Actions */}
                    <div>
                      <h4 className="font-medium mb-3">Recommended Interventions</h4>
                      <div className="space-y-2">
                        {predictions.recommendedInterventions.map((intervention, index) => (
                          <div key={index} className={`p-3 rounded-lg border text-sm ${
                            intervention.urgency === 'immediate' ? 'bg-red-500/20 border-red-500/30' :
                            intervention.urgency === 'soon' ? 'bg-yellow-500/20 border-yellow-500/30' :
                            'bg-blue-500/20 border-blue-500/30'
                          }`}>
                            <div className="font-medium flex items-center justify-between">
                              <span>{intervention.type}</span>
                              <span className="text-xs opacity-70">{intervention.urgency}</span>
                            </div>
                            <p className="text-gray-300 mt-1">{intervention.action}</p>
                            <div className="text-xs mt-2 opacity-70">
                              Expected Impact: {(intervention.expectedImpact * 100).toFixed(0)}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Projected Outcomes */}
                <div className="bg-black/20 backdrop-blur-md rounded-xl p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    Projected Outcomes
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {predictions.projectedOutcomes.map((outcome, index) => (
                      <div key={index} className="p-4 bg-white/5 rounded-lg">
                        <div className="text-sm text-gray-300 mb-1">{outcome.timeframe}</div>
                        <div className="font-medium mb-2">{outcome.metric}</div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">{outcome.currentValue}</span>
                          <div className="flex-1 bg-gray-700 rounded-full h-1">
                            <div 
                              className="bg-gradient-to-r from-purple-500 to-blue-500 h-1 rounded-full"
                              style={{ width: `${(outcome.projectedValue / (outcome.currentValue * 2)) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-bold text-green-400">{outcome.projectedValue}</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Confidence: {(outcome.confidence * 100).toFixed(0)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risk Factors */}
                {selectedStudent.riskFactors.length > 0 && (
                  <div className="bg-black/20 backdrop-blur-md rounded-xl p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      Risk Factors
                    </h3>
                    
                    <div className="space-y-3">
                      {selectedStudent.riskFactors.map((risk, index) => (
                        <div key={index} className={`p-4 rounded-lg border ${
                          risk.severity === 'high' ? 'bg-red-500/20 border-red-500/30' :
                          risk.severity === 'medium' ? 'bg-yellow-500/20 border-yellow-500/30' :
                          'bg-blue-500/20 border-blue-500/30'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium capitalize">{risk.type}</span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              risk.severity === 'high' ? 'bg-red-500 text-white' :
                              risk.severity === 'medium' ? 'bg-yellow-500 text-black' :
                              'bg-blue-500 text-white'
                            }`}>
                              {risk.severity}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300 mb-2">{risk.description}</p>
                          <p className="text-sm text-gray-200 font-medium">
                            Recommendation: {risk.recommendation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper functions for generating sample data and predictions
function generateSampleStudents(): StudentMetrics[] {
  const names = ['Ahmad Rahman', 'Siti Nurhaliza', 'Muhammad Ali', 'Fatimah Zahra', 'Hassan Ibrahim']
  
  return names.map((name, index) => ({
    id: `student_${index}`,
    name,
    totalXP: Math.floor(Math.random() * 5000) + 500,
    completedChallenges: Math.floor(Math.random() * 50) + 5,
    timeSpent: Math.floor(Math.random() * 10000) + 1000, // minutes
    averageScore: Math.floor(Math.random() * 40) + 60,
    streakDays: Math.floor(Math.random() * 30),
    lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    skillProgress: {
      programming: Math.random() * 0.8 + 0.2,
      problemSolving: Math.random() * 0.8 + 0.2,
      debugging: Math.random() * 0.8 + 0.2,
      codeReading: Math.random() * 0.8 + 0.2,
      projectWork: Math.random() * 0.8 + 0.2
    },
    learningPattern: {
      preferredTime: ['morning', 'afternoon', 'evening', 'night'][Math.floor(Math.random() * 4)] as any,
      sessionDuration: Math.floor(Math.random() * 60) + 30,
      learningStyle: ['visual', 'auditory', 'kinesthetic', 'mixed'][Math.floor(Math.random() * 4)] as any,
      difficultyPreference: ['easy', 'medium', 'hard', 'adaptive'][Math.floor(Math.random() * 4)] as any,
      collaborationTendency: Math.random()
    },
    riskFactors: generateRiskFactors()
  }))
}

function generateRiskFactors(): RiskFactor[] {
  const allRisks = [
    {
      type: 'engagement' as const,
      severity: 'medium' as const,
      description: 'Declining session frequency over past 2 weeks',
      recommendation: 'Send motivational content and check-in message'
    },
    {
      type: 'performance' as const,
      severity: 'high' as const,
      description: 'Consistently scoring below 70% on recent challenges',
      recommendation: 'Provide additional practice materials and tutoring'
    },
    {
      type: 'consistency' as const,
      severity: 'low' as const,
      description: 'Irregular learning schedule',
      recommendation: 'Suggest structured study plan'
    }
  ]
  
  return allRisks.filter(() => Math.random() > 0.6)
}

function generatePredictions(student: StudentMetrics): PredictiveModel {
  const avgSkill = Object.values(student.skillProgress).reduce((a, b) => a + b, 0) / 5
  const engagementScore = Math.min(student.timeSpent / 5000, 1)
  const performanceScore = student.averageScore / 100
  
  const successProbability = (avgSkill * 0.4 + engagementScore * 0.3 + performanceScore * 0.3)
  const strugglingRisk = 1 - successProbability
  
  return {
    successProbability,
    strugglingRisk,
    optimalPath: ['Review fundamentals', 'Practice coding challenges', 'Work on projects'],
    recommendedInterventions: [
      {
        type: 'content',
        urgency: 'soon',
        action: 'Provide additional practice exercises for weak areas',
        expectedImpact: 0.25
      },
      {
        type: 'motivation',
        urgency: 'immediate',
        action: 'Send encouraging message and progress update',
        expectedImpact: 0.15
      }
    ],
    projectedOutcomes: [
      {
        timeframe: '1week',
        metric: 'XP',
        currentValue: student.totalXP,
        projectedValue: Math.floor(student.totalXP * 1.1),
        confidence: 0.85
      },
      {
        timeframe: '1month',
        metric: 'Average Score',
        currentValue: student.averageScore,
        projectedValue: Math.floor(student.averageScore * 1.15),
        confidence: 0.75
      },
      {
        timeframe: '3months',
        metric: 'Skill Level',
        currentValue: Math.floor(avgSkill * 100),
        projectedValue: Math.floor(avgSkill * 100 * 1.3),
        confidence: 0.65
      },
      {
        timeframe: '6months',
        metric: 'Completion Rate',
        currentValue: 75,
        projectedValue: 90,
        confidence: 0.55
      }
    ]
  }
}
