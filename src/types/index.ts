// src/types/index.ts

export interface Profile {
  id: string;
  name: string;
  email: string;
  sekolah: string;
  tingkatan: string;
  role: string;
  xp: number;
  created_at: string;
}

export interface XPLog {
  id: string;
  user_id: string;
  aktiviti: string;
  mata: number;
  created_at: string;
  profiles: {
    name: string;
    email: string;
  } | null;
}

export interface Ganjaran {
  id: string;
  nama: string;
  deskripsi: string;
  syarat_xp: number;
  imej_url: string;
}

export interface Question {
  id: string;
  question_text: string;
  options: string[];
  correct_answer: string;
}

export interface ChallengeContent {
  video_url?: string;
  text_content?: string;
  questions?: Question[];
  allowed_file_types?: string[];
  max_file_size?: number;
  [key: string]: unknown; // Allow other properties
}

export interface ChallengePassCriteria {
  min_score?: number;
  min_percentage?: number;
  [key: string]: unknown; // Allow other properties
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'upload' | 'quiz' | 'video' | 'reading' | 'coding';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  xp_reward: number;
  content: ChallengeContent;
  pass_criteria: ChallengePassCriteria;
  created_by: string;
  created_at: string;
  updated_at: string;
  status: 'draft' | 'published' | 'archived';
  tags?: string[];
  category?: string;
  subject?: string;
  tingkatan?: string;
}

export interface UserChallenge {
  id: string;
  user_id: string;
  challenge_id: string;
  status: 'pending' | 'completed' | 'failed';
  xp_earned: number;
  completed_at: string;
  submission_data?: unknown; // Use unknown instead of any
  challenges?: Challenge; // Relational data
}

export interface ProjectFile {
  id: string;
  name: string;
  language: string;
  content: string;
  lastModified?: Date;
  size?: number;
}

export interface Project {
  id: string;
  name: string;
  files: ProjectFile[];
  created_at: string;
  user_id?: string;
  updated_at?: string;
  language?: string;
  content?: string;
  description?: string;
  isStarred?: boolean;
  createdAt?: Date;
  lastModified?: Date;
  tags?: string[];
  isTemplate?: boolean;
}

// Explicitly re-export main types for better compatibility
export type { Challenge as ChallengeType, Question as QuestionType, Project as ProjectType };
