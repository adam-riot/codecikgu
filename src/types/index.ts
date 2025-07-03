// src/types/index.ts

// Interface untuk semua jenis cabaran
export interface Challenge {
    id: string;
    title: string;
    description: string;
    type: 'quiz' | 'video' | 'reading' | 'upload';
    xp_reward: number;
    content: {
      // Optional properties for different challenge types
      video_url?: string;
      content?: string; // For Reading
      instructions?: string;
      allowed_file_types?: string[];
      max_file_size?: number;
      questions?: Question[];
    };
    pass_criteria: {
      // Optional properties for different pass criteria
      min_score?: number;
      total_questions?: number; // Ditambah untuk QuizChallenge
      min_watch_percentage?: number;
      completion_required?: boolean;
      manual_review?: boolean;
    };
  }
  
  // Interface untuk soalan kuiz
  export interface Question {
    id: string;
    question_text: string;
    options: string[];
    correct_answer: string;
    points: number;
    order_index: number;
  }
  