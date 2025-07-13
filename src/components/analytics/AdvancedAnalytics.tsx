import React, { useState, useEffect } from 'react'
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Area,
  AreaChart
} from 'recharts'
import { 
  TrendingUp, 
  Users, 
  BookOpen, 
  Clock, 
  Trophy, 
  Target, 
  Download, 
  Filter,
  Calendar,
  School,
  Award,
  Activity,
  Brain,
  Code,
  CheckCircle
} from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export interface StudentPerformanceData {
  studentId: string
  studentName: string
  class: string
  school: string
  totalChallenges: number
  completedChallenges: number
  averageScore: number
  timeSpent: number // in minutes
  lastActive: Date
  skillsProgress: SkillProgress[]
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
}

export interface SkillProgress {
  skill: string
  level: number
  maxLevel: number
  progress: number // 0-100
  masteryDate?: Date
}

export interface ClassAnalytics {
  classId: string
  className: string
  school: string
  teacher: string
  studentCount: number
  averageProgress: number
  averageScore: number
  totalTimeSpent: number
  challengesCompleted: number
  topPerformers: StudentPerformanceData[]
  strugglingStudents: StudentPerformanceData[]
  skillsDistribution: SkillDistribution[]
}

export interface SkillDistribution {
  skill: string
  mastered: number
  learning: number
  struggling: number
}

export interface SchoolReport {
  schoolId: string
  schoolName: string
  district: string
  state: string
  totalStudents: number
  activeStudents: number
  totalTeachers: number
  activeTeachers: number
  classesCount: number
  averageEngagement: number
  platformUsage: UsageMetric[]
  topSkills: string[]
  challenges: string[]
  recommendations: string[]
}

export interface UsageMetric {
  date: string
  activeUsers: number
  challengesCompleted: number
  timeSpent: number
}

export interface DSKPAlignment {
  subject: string
  topic: string
  subtopic: string
  learningObjective: string
  coverage: number // 0-100
  studentsMastered: number
  averageScore: number
  timeToMaster: number // average days
}

interface AdvancedAnalyticsProps {
  userRole: 'teacher' | 'admin' | 'ministry'
  schoolId?: string
  classId?: string
  studentId?: string
}

export function AdvancedAnalytics({ userRole, schoolId, classId, studentId }: AdvancedAnalyticsProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('month')
  const [selectedView, setSelectedView] = useState('overview')
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalyticsData()
  }, [userRole, schoolId, classId, studentId, selectedTimeRange])

  const loadAnalyticsData = async () => {
    setLoading(true)
    try {
      // Simulate API call
      const data = await AnalyticsService.getAdvancedAnalytics({
        userRole,
        schoolId,
        classId,
        studentId,
        timeRange: selectedTimeRange
      })
      setAnalyticsData(data)
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const generatePDFReport = () => {
    const doc = new jsPDF()
    
    // Title
    doc.setFontSize(20)
    doc.text('Laporan Analisis CodeCikgu', 20, 20)
    
    // Date
    doc.setFontSize(12)
    doc.text(`Tarikh: ${new Date().toLocaleDateString('ms-MY')}`, 20, 35)
    
    // Summary table
    if (analyticsData?.summary) {
      const summaryData = [
        ['Metrik', 'Nilai'],
        ['Jumlah Pelajar Aktif', analyticsData.summary.activeStudents],
        ['Cabaran Diselesaikan', analyticsData.summary.challengesCompleted],
        ['Skor Purata', `${analyticsData.summary.averageScore}%`],
        ['Masa Pembelajaran', `${analyticsData.summary.totalTime} jam`]
      ]
      
      autoTable(doc, {
        head: [summaryData[0]],
        body: summaryData.slice(1),
        startY: 50,
        theme: 'grid'
      })
    }
    
    doc.save('laporan-codecikgu.pdf')
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="advanced-analytics space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analisis Lanjutan</h1>
            <p className="text-gray-600">
              {userRole === 'teacher' ? 'Analisis prestasi kelas' :
               userRole === 'admin' ? 'Analisis prestasi sekolah' :
               'Analisis prestasi negeri/negara'}
            </p>
          </div>
          <div className="flex space-x-4">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">Minggu Lepas</option>
              <option value="month">Bulan Lepas</option>
              <option value="quarter">Suku Tahun</option>
              <option value="year">Tahun Ini</option>
            </select>
            <button
              onClick={generatePDFReport}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Download className="w-4 h-4" />
              <span>Muat Turun Laporan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pelajar Aktif</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData?.summary?.activeStudents || 0}</p>
              <p className="text-xs text-green-600">+12% dari bulan lepas</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Trophy className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Cabaran Diselesaikan</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData?.summary?.challengesCompleted || 0}</p>
              <p className="text-xs text-green-600">+25% dari bulan lepas</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Target className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Skor Purata</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData?.summary?.averageScore || 0}%</p>
              <p className="text-xs text-green-600">+5% dari bulan lepas</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Masa Pembelajaran</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData?.summary?.totalTime || 0}h</p>
              <p className="text-xs text-green-600">+18% dari bulan lepas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Learning Progress Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Kemajuan Pembelajaran</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analyticsData?.progressData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="completed" stackId="1" stroke="#8884d8" fill="#8884d8" />
              <Area type="monotone" dataKey="inProgress" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Skills Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Taburan Kemahiran</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData?.skillsData || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {(analyticsData?.skillsData || []).map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Radar */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Analisis Prestasi</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={analyticsData?.radarData || []}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={45} domain={[0, 100]} />
              <Radar name="Prestasi" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              <Radar name="Purata Negeri" dataKey="B" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Engagement Timeline */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Penglibatan Harian</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData?.engagementData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="activeUsers" stroke="#8884d8" strokeWidth={2} />
              <Line type="monotone" dataKey="timeSpent" stroke="#82ca9d" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* DSKP Alignment */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Penjajaran DSKP</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Topik
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Liputan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pelajar Menguasai
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Skor Purata
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Masa Purata
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(analyticsData?.dskpAlignment || []).map((item: DSKPAlignment, index: number) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.topic}</div>
                    <div className="text-sm text-gray-500">{item.subtopic}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${item.coverage}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm text-gray-900">{item.coverage}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.studentsMastered} pelajar
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      item.averageScore >= 80 ? 'bg-green-100 text-green-800' :
                      item.averageScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {item.averageScore}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.timeToMaster} hari
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          <Brain className="w-5 h-5 inline mr-2" />
          Cadangan AI
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(analyticsData?.recommendations || []).map((rec: any, index: number) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${
                  rec.priority === 'high' ? 'bg-red-100' :
                  rec.priority === 'medium' ? 'bg-yellow-100' :
                  'bg-green-100'
                }`}>
                  {rec.type === 'curriculum' ? <BookOpen className="w-4 h-4" /> :
                   rec.type === 'engagement' ? <Activity className="w-4 h-4" /> :
                   <Award className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{rec.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                  <div className="mt-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                      rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {rec.priority === 'high' ? 'Keutamaan Tinggi' :
                       rec.priority === 'medium' ? 'Keutamaan Sederhana' :
                       'Keutamaan Rendah'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export class AnalyticsService {
  /**
   * Get advanced analytics data
   */
  static async getAdvancedAnalytics(params: {
    userRole: string
    schoolId?: string
    classId?: string
    studentId?: string
    timeRange: string
  }) {
    // Simulate API call - replace with actual implementation
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Mock data generation
    const mockData = {
      summary: {
        activeStudents: 1250,
        challengesCompleted: 3420,
        averageScore: 78,
        totalTime: 890
      },
      progressData: this.generateProgressData(params.timeRange),
      skillsData: this.generateSkillsData(),
      radarData: this.generateRadarData(),
      engagementData: this.generateEngagementData(params.timeRange),
      dskpAlignment: this.generateDSKPData(),
      recommendations: this.generateRecommendations(params.userRole)
    }

    return mockData
  }

  private static generateProgressData(timeRange: string) {
    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : timeRange === 'quarter' ? 90 : 365
    const data = []
    
    for (let i = 0; i < days; i += Math.ceil(days / 10)) {
      const date = new Date()
      date.setDate(date.getDate() - (days - i))
      
      data.push({
        date: date.toLocaleDateString('ms-MY'),
        completed: Math.floor(Math.random() * 50) + 20,
        inProgress: Math.floor(Math.random() * 30) + 10
      })
    }
    
    return data
  }

  private static generateSkillsData() {
    return [
      { name: 'Algoritma', value: 35 },
      { name: 'Struktur Data', value: 25 },
      { name: 'OOP', value: 20 },
      { name: 'Database', value: 15 },
      { name: 'Web Dev', value: 5 }
    ]
  }

  private static generateRadarData() {
    return [
      { subject: 'Algoritma', A: 85, B: 78 },
      { subject: 'Struktur Data', A: 90, B: 82 },
      { subject: 'OOP', A: 75, B: 88 },
      { subject: 'Database', A: 80, B: 75 },
      { subject: 'Web Dev', A: 70, B: 70 }
    ]
  }

  private static generateEngagementData(timeRange: string) {
    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90
    const data = []
    
    for (let i = 0; i < days; i += Math.ceil(days / 15)) {
      const date = new Date()
      date.setDate(date.getDate() - (days - i))
      
      data.push({
        date: date.toLocaleDateString('ms-MY'),
        activeUsers: Math.floor(Math.random() * 200) + 100,
        timeSpent: Math.floor(Math.random() * 120) + 60
      })
    }
    
    return data
  }

  private static generateDSKPData(): DSKPAlignment[] {
    return [
      {
        subject: 'Sains Komputer',
        topic: 'Algoritma dan Pengaturcaraan',
        subtopic: 'Pengaturcaraan Asas',
        learningObjective: 'Memahami konsep algoritma',
        coverage: 85,
        studentsMastered: 45,
        averageScore: 82,
        timeToMaster: 14
      },
      {
        subject: 'Sains Komputer',
        topic: 'Struktur Data',
        subtopic: 'Array dan List',
        learningObjective: 'Menggunakan struktur data asas',
        coverage: 70,
        studentsMastered: 38,
        averageScore: 75,
        timeToMaster: 18
      },
      {
        subject: 'Sains Komputer',
        topic: 'Pangkalan Data',
        subtopic: 'SQL Asas',
        learningObjective: 'Membuat query SQL',
        coverage: 60,
        studentsMastered: 32,
        averageScore: 68,
        timeToMaster: 21
      }
    ]
  }

  private static generateRecommendations(userRole: string) {
    const recommendations = [
      {
        title: 'Tingkatkan Latihan Algoritma',
        description: 'Pelajar menunjukkan kelemahan dalam konsep algoritma rekursif.',
        priority: 'high',
        type: 'curriculum'
      },
      {
        title: 'Galakkan Penglibatan Harian',
        description: 'Penglibatan menurun 15% minggu lepas. Cadang aktiviti gamifikasi.',
        priority: 'medium',
        type: 'engagement'
      },
      {
        title: 'Fokus Struktur Data',
        description: 'Pelajar cemerlang dalam algoritma tetapi lemah dalam struktur data.',
        priority: 'medium',
        type: 'curriculum'
      },
      {
        title: 'Program Pengiktirafan',
        description: 'Lancar program pengiktirafan untuk pelajar berprestasi tinggi.',
        priority: 'low',
        type: 'motivation'
      }
    ]

    return recommendations
  }

  /**
   * Export analytics data to various formats
   */
  static exportData(data: any, format: 'pdf' | 'excel' | 'csv') {
    switch (format) {
      case 'pdf':
        this.exportToPDF(data)
        break
      case 'excel':
        this.exportToExcel(data)
        break
      case 'csv':
        this.exportToCSV(data)
        break
    }
  }

  private static exportToPDF(data: any) {
    // Implementation for PDF export
    console.log('Exporting to PDF...', data)
  }

  private static exportToExcel(data: any) {
    // Implementation for Excel export
    console.log('Exporting to Excel...', data)
  }

  private static exportToCSV(data: any) {
    // Implementation for CSV export
    console.log('Exporting to CSV...', data)
  }
}
