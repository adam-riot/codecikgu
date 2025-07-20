// Common types used throughout the application

export interface User {
  id: string
  email: string
  name: string | null
  role: string
  sekolah: string | null
  tingkatan: string | null
  xp: number | null
  created_at: string
}

export interface Profile extends User {
  // Additional profile fields
}

export interface Challenge {
  id: string
  title: string
  description: string
  difficulty: string
  type?: string
  subject?: string
  xp_reward: number
  created_at: string
  is_active: boolean
  challenge_submissions?: ChallengeSubmission[]
}

export interface ChallengeSubmission {
  id: string
  user_id: string
  challenge_id: string
  code: string
  status: string
  score: number | null
  created_at: string
}

export interface LeaderboardEntry {
  id: string
  name: string
  sekolah: string
  tingkatan: string
  xp: number
  rank?: number
}

export interface DebugLog {
  timestamp: string
  step: string
  status: 'success' | 'error' | 'info'
  message: string
  data?: any
}

export interface Stats {
  totalStudents: number
  totalSchools: number
  totalRewards: number
  totalXP: number
}

// Form data types
export interface RegistrationFormData {
  email: string
  password: string
  name: string
  sekolah: string
  tingkatan: string
}

export interface EmailValidation {
  type: 'moe_student' | 'moe_staff' | 'public' | 'invalid'
  isValid: boolean
  role: 'murid' | 'guru' | 'awam'
  suggestions?: string[]
  message?: string
}
