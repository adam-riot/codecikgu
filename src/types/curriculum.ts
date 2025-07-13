export interface AssessmentCriteria {
  id: string
  description: string
  points: number
  rubric: string[]
}

export interface Milestone {
  id: string
  title: string
  description: string
  requiredTopics: string[]
  estimatedWeeks: number
  assessments: AssessmentCriteria[]
}

export interface DSKPTopic {
  id: string
  code: string // e.g., "T4.2.1"
  title: string
  description: string
  learningOutcomes: string[]
  prerequisites: string[]
  estimatedHours: number
  assessmentCriteria: AssessmentCriteria[]
  activities: string[]
  resources: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

export interface LearningPath {
  id: string
  tingkatan: 'tingkatan-4' | 'tingkatan-5'
  topics: DSKPTopic[]
  milestones: Milestone[]
  estimatedCompletion: number // weeks
  totalHours: number
  prerequisites: string[]
}

export interface StudentProgress {
  studentId: string
  topicId: string
  status: 'not_started' | 'in_progress' | 'completed' | 'mastered'
  completionDate?: Date
  score?: number
  timeSpent: number // minutes
  attempts: number
}

export interface ClassProgress {
  classId: string
  topicId: string
  studentsCompleted: number
  studentsInProgress: number
  studentsNotStarted: number
  averageScore: number
  averageTimeSpent: number
}

// DSKP Data for Tingkatan 4 & 5
export const DSKP_TINGKATAN_4: DSKPTopic[] = [
  {
    id: 't4-1-1',
    code: 'T4.1.1',
    title: 'Pengenalan Sains Komputer',
    description: 'Memahami konsep asas sains komputer dan aplikasinya dalam kehidupan harian',
    learningOutcomes: [
      'Menjelaskan definisi sains komputer',
      'Mengenal pasti bidang-bidang dalam sains komputer',
      'Mengaitkan sains komputer dengan kehidupan harian',
      'Menghargai kepentingan sains komputer'
    ],
    prerequisites: [],
    estimatedHours: 4,
    assessmentCriteria: [
      {
        id: 'ac-t4-1-1-1',
        description: 'Dapat menjelaskan definisi sains komputer dengan tepat',
        points: 25,
        rubric: ['Sangat Baik (20-25)', 'Baik (15-19)', 'Memuaskan (10-14)', 'Tidak Memuaskan (0-9)']
      }
    ],
    activities: [
      'Perbincangan kelas tentang aplikasi sains komputer',
      'Kajian kes penggunaan teknologi dalam industri',
      'Projek mini: Mencari contoh aplikasi sains komputer'
    ],
    resources: [
      'Buku teks Sains Komputer Tingkatan 4',
      'Video edukasi tentang sejarah komputer',
      'Artikel online tentang AI dan robotik'
    ],
    difficulty: 'beginner'
  },
  {
    id: 't4-2-1',
    code: 'T4.2.1',
    title: 'Sistem Nombor',
    description: 'Memahami dan menggunakan sistem nombor binary, decimal, dan hexadecimal',
    learningOutcomes: [
      'Memahami konsep sistem nombor binary, decimal, dan hexadecimal',
      'Menukar nombor antara sistem yang berbeza',
      'Melakukan operasi aritmetik dalam sistem binary',
      'Mengaplikasikan sistem nombor dalam pengaturcaraan'
    ],
    prerequisites: ['t4-1-1'],
    estimatedHours: 8,
    assessmentCriteria: [
      {
        id: 'ac-t4-2-1-1',
        description: 'Dapat menukar nombor antara sistem dengan betul',
        points: 30,
        rubric: ['Cemerlang (26-30)', 'Baik (21-25)', 'Memuaskan (15-20)', 'Tidak Memuaskan (0-14)']
      }
    ],
    activities: [
      'Latihan penukaran nombor menggunakan kalkulator',
      'Permainan nombor binary',
      'Projek: Membuat kalkulator sistem nombor'
    ],
    resources: [
      'Simulator sistem nombor online',
      'Worksheet latihan penukaran nombor',
      'Video tutorial operasi binary'
    ],
    difficulty: 'intermediate'
  },
  {
    id: 't4-3-1',
    code: 'T4.3.1',
    title: 'Pengenalan Algoritma',
    description: 'Memahami konsep algoritma dan memprogramnya menggunakan pseudocode',
    learningOutcomes: [
      'Memahami definisi dan ciri-ciri algoritma',
      'Menulis algoritma menggunakan pseudocode',
      'Menganalisis kecekapan algoritma',
      'Menyelesaikan masalah menggunakan pendekatan algoritma'
    ],
    prerequisites: ['t4-2-1'],
    estimatedHours: 12,
    assessmentCriteria: [
      {
        id: 'ac-t4-3-1-1',
        description: 'Dapat menulis pseudocode yang betul dan logik',
        points: 35,
        rubric: ['Cemerlang (31-35)', 'Baik (26-30)', 'Memuaskan (20-25)', 'Tidak Memuaskan (0-19)']
      }
    ],
    activities: [
      'Workshop menulis pseudocode',
      'Analisis algoritma sorting dan searching',
      'Projek: Algoritma untuk masalah kehidupan sebenar'
    ],
    resources: [
      'Platform visualisasi algoritma',
      'Koleksi contoh algoritma',
      'Software untuk menulis pseudocode'
    ],
    difficulty: 'intermediate'
  }
]

export const DSKP_TINGKATAN_5: DSKPTopic[] = [
  {
    id: 't5-1-1',
    code: 'T5.1.1',
    title: 'Pengaturcaraan Lanjutan',
    description: 'Menguasai konsep pengaturcaraan berorientasikan objek dan struktur data',
    learningOutcomes: [
      'Memahami konsep OOP (Object-Oriented Programming)',
      'Menggunakan struktur data seperti array, list, dan dictionary',
      'Menulis program yang kompleks dan berstruktur',
      'Melakukan debugging dan testing kod'
    ],
    prerequisites: ['t4-3-1'],
    estimatedHours: 16,
    assessmentCriteria: [
      {
        id: 'ac-t5-1-1-1',
        description: 'Dapat menulis program OOP yang berfungsi dengan betul',
        points: 40,
        rubric: ['Cemerlang (36-40)', 'Baik (31-35)', 'Memuaskan (25-30)', 'Tidak Memuaskan (0-24)']
      }
    ],
    activities: [
      'Projek pengaturcaraan menggunakan Python/Java',
      'Workshop debugging dan testing',
      'Hackathon mini untuk menyelesaikan masalah'
    ],
    resources: [
      'IDE untuk pengaturcaraan',
      'Tutorial OOP online',
      'Dataset untuk latihan struktur data'
    ],
    difficulty: 'advanced'
  },
  {
    id: 't5-2-1',
    code: 'T5.2.1',
    title: 'Pangkalan Data',
    description: 'Memahami konsep pangkalan data dan menggunakan SQL untuk manipulasi data',
    learningOutcomes: [
      'Memahami konsep pangkalan data relational',
      'Mereka bentuk ERD (Entity Relationship Diagram)',
      'Menulis query SQL untuk manipulasi data',
      'Mengoptimumkan prestasi pangkalan data'
    ],
    prerequisites: ['t5-1-1'],
    estimatedHours: 14,
    assessmentCriteria: [
      {
        id: 'ac-t5-2-1-1',
        description: 'Dapat mereka bentuk dan melaksanakan pangkalan data yang betul',
        points: 38,
        rubric: ['Cemerlang (34-38)', 'Baik (29-33)', 'Memuaskan (23-28)', 'Tidak Memuaskan (0-22)']
      }
    ],
    activities: [
      'Projek mereka bentuk pangkalan data sekolah',
      'Latihan menulis query SQL kompleks',
      'Analisis prestasi pangkalan data'
    ],
    resources: [
      'Software pangkalan data (MySQL/SQLite)',
      'Dataset contoh untuk latihan',
      'Tool untuk mereka bentuk ERD'
    ],
    difficulty: 'advanced'
  }
]

export const LEARNING_PATHS: LearningPath[] = [
  {
    id: 'path-t4',
    tingkatan: 'tingkatan-4',
    topics: DSKP_TINGKATAN_4,
    milestones: [
      {
        id: 'milestone-t4-1',
        title: 'Asas Sains Komputer',
        description: 'Menguasai konsep asas dan sistem nombor',
        requiredTopics: ['t4-1-1', 't4-2-1'],
        estimatedWeeks: 4,
        assessments: [
          {
            id: 'assess-t4-1-1',
            description: 'Ujian sistem nombor',
            points: 50,
            rubric: ['A (45-50)', 'B (35-44)', 'C (25-34)', 'D (0-24)']
          }
        ]
      },
      {
        id: 'milestone-t4-2',
        title: 'Algoritma dan Logik',
        description: 'Menguasai algoritma dan pseudocode',
        requiredTopics: ['t4-3-1'],
        estimatedWeeks: 6,
        assessments: [
          {
            id: 'assess-t4-2-1',
            description: 'Projek algoritma',
            points: 75,
            rubric: ['A (68-75)', 'B (53-67)', 'C (38-52)', 'D (0-37)']
          }
        ]
      }
    ],
    estimatedCompletion: 20,
    totalHours: 120,
    prerequisites: []
  },
  {
    id: 'path-t5',
    tingkatan: 'tingkatan-5',
    topics: DSKP_TINGKATAN_5,
    milestones: [
      {
        id: 'milestone-t5-1',
        title: 'Pengaturcaraan Lanjutan',
        description: 'Menguasai OOP dan struktur data',
        requiredTopics: ['t5-1-1'],
        estimatedWeeks: 8,
        assessments: [
          {
            id: 'assess-t5-1-1',
            description: 'Projek OOP',
            points: 100,
            rubric: ['A (90-100)', 'B (70-89)', 'C (50-69)', 'D (0-49)']
          }
        ]
      },
      {
        id: 'milestone-t5-2',
        title: 'Pangkalan Data',
        description: 'Menguasai konsep dan implementasi pangkalan data',
        requiredTopics: ['t5-2-1'],
        estimatedWeeks: 7,
        assessments: [
          {
            id: 'assess-t5-2-1',
            description: 'Projek pangkalan data',
            points: 90,
            rubric: ['A (81-90)', 'B (63-80)', 'C (45-62)', 'D (0-44)']
          }
        ]
      }
    ],
    estimatedCompletion: 25,
    totalHours: 150,
    prerequisites: ['path-t4']
  }
]

export class DSKPService {
  /**
   * Get all topics for a specific tingkatan
   */
  static getTopicsForTingkatan(tingkatan: 'tingkatan-4' | 'tingkatan-5'): DSKPTopic[] {
    return tingkatan === 'tingkatan-4' ? DSKP_TINGKATAN_4 : DSKP_TINGKATAN_5
  }

  /**
   * Get learning path for tingkatan
   */
  static getLearningPath(tingkatan: 'tingkatan-4' | 'tingkatan-5'): LearningPath | undefined {
    return LEARNING_PATHS.find(path => path.tingkatan === tingkatan)
  }

  /**
   * Get topic by ID
   */
  static getTopicById(topicId: string): DSKPTopic | undefined {
    const allTopics = [...DSKP_TINGKATAN_4, ...DSKP_TINGKATAN_5]
    return allTopics.find(topic => topic.id === topicId)
  }

  /**
   * Get prerequisites for a topic
   */
  static getPrerequisites(topicId: string): DSKPTopic[] {
    const topic = this.getTopicById(topicId)
    if (!topic) return []

    const allTopics = [...DSKP_TINGKATAN_4, ...DSKP_TINGKATAN_5]
    return topic.prerequisites.map(prereqId => 
      allTopics.find(t => t.id === prereqId)
    ).filter(Boolean) as DSKPTopic[]
  }

  /**
   * Calculate total estimated hours for tingkatan
   */
  static getTotalHours(tingkatan: 'tingkatan-4' | 'tingkatan-5'): number {
    const topics = this.getTopicsForTingkatan(tingkatan)
    return topics.reduce((total, topic) => total + topic.estimatedHours, 0)
  }

  /**
   * Get recommended next topics based on completion
   */
  static getRecommendedTopics(completedTopics: string[], tingkatan: 'tingkatan-4' | 'tingkatan-5'): DSKPTopic[] {
    const allTopics = this.getTopicsForTingkatan(tingkatan)
    
    return allTopics.filter(topic => {
      // Topic not completed yet
      if (completedTopics.includes(topic.id)) return false
      
      // All prerequisites are completed
      return topic.prerequisites.every(prereq => completedTopics.includes(prereq))
    })
  }

  /**
   * Calculate progress percentage for tingkatan
   */
  static calculateProgress(completedTopics: string[], tingkatan: 'tingkatan-4' | 'tingkatan-5'): number {
    const allTopics = this.getTopicsForTingkatan(tingkatan)
    const completedCount = completedTopics.filter(topicId => 
      allTopics.some(topic => topic.id === topicId)
    ).length
    
    return Math.round((completedCount / allTopics.length) * 100)
  }
}
