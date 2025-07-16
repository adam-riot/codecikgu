-- CodeCikgu Gamification System Database Schema
-- Updated: July 2025

-- =====================================================
-- LEVEL SYSTEM TABLES
-- =====================================================

-- Main levels (1-6 with sub-levels)
CREATE TABLE IF NOT EXISTS levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level_number INTEGER NOT NULL, -- 1, 2, 3, 4, 5, 6
  sublevel_number INTEGER NOT NULL, -- 1, 2, 3, 4, 5
  title VARCHAR(255) NOT NULL,
  description TEXT,
  xp_required_min INTEGER NOT NULL, -- minimum XP to unlock
  xp_required_max INTEGER NOT NULL, -- maximum XP in this level
  unlock_conditions JSONB DEFAULT '[]', -- ["complete_80_percent_previous", "pass_skill_assessment"]
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Level challenges (the main learning content)
CREATE TABLE IF NOT EXISTS level_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level_id UUID REFERENCES levels(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'hard')),
  xp_reward INTEGER NOT NULL,
  time_estimate INTEGER DEFAULT 30, -- estimated time in minutes
  
  -- Learning content
  theory_content JSONB DEFAULT '{}', -- notes, videos, examples
  tasks JSONB NOT NULL DEFAULT '[]', -- array of tasks
  
  -- Unlock requirements
  prerequisites JSONB DEFAULT '[]', -- other challenge IDs required
  unlock_conditions JSONB DEFAULT '[]',
  
  -- Progress tracking
  completion_rate DECIMAL(5,2) DEFAULT 0.00,
  average_score DECIMAL(5,2) DEFAULT 0.00,
  
  -- Meta
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student progress for level challenges
CREATE TABLE IF NOT EXISTS student_level_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  level_id UUID REFERENCES levels(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES level_challenges(id) ON DELETE CASCADE,
  
  -- Progress data
  status VARCHAR(20) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'locked')),
  score INTEGER DEFAULT 0,
  max_score INTEGER DEFAULT 100,
  attempts INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0, -- in seconds
  
  -- Task completion tracking
  completed_tasks JSONB DEFAULT '[]', -- array of completed task IDs
  task_scores JSONB DEFAULT '{}', -- task_id: score mapping
  
  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(student_id, challenge_id)
);

-- =====================================================
-- EXERCISE SYSTEM TABLES (Open/Unlocked content)
-- =====================================================

-- Categories for exercises
CREATE TABLE IF NOT EXISTS exercise_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(100),
  color VARCHAR(20),
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Open exercises (not level-locked)
CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES exercise_categories(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL CHECK (type IN ('note', 'video', 'quiz', 'code_drill', 'skill_practice')),
  difficulty VARCHAR(20) CHECK (difficulty IN ('beginner', 'intermediate', 'hard')),
  xp_reward INTEGER NOT NULL,
  estimated_duration INTEGER DEFAULT 15, -- in minutes
  
  -- Content
  content JSONB NOT NULL DEFAULT '{}',
  
  -- Media
  video_url VARCHAR(500),
  thumbnail_url VARCHAR(500),
  
  -- Meta
  tags JSONB DEFAULT '[]',
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  views_count INTEGER DEFAULT 0,
  completion_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student exercise completions
CREATE TABLE IF NOT EXISTS student_exercise_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  
  -- Completion data
  score INTEGER DEFAULT 0,
  xp_earned INTEGER NOT NULL,
  time_spent INTEGER DEFAULT 0, -- in seconds
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  
  -- Timestamps
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(student_id, exercise_id)
);

-- =====================================================
-- BADGE & ACHIEVEMENT SYSTEM
-- =====================================================

-- Badge definitions
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(255),
  rarity VARCHAR(20) DEFAULT 'bronze' CHECK (rarity IN ('bronze', 'silver', 'gold', 'diamond')),
  xp_bonus INTEGER DEFAULT 0,
  
  -- Unlock conditions
  unlock_type VARCHAR(50) NOT NULL CHECK (unlock_type IN ('level_completion', 'challenge_count', 'exercise_count', 'streak', 'special')),
  unlock_conditions JSONB NOT NULL DEFAULT '{}',
  
  -- Meta
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student badge earnings
CREATE TABLE IF NOT EXISTS student_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(student_id, badge_id)
);

-- =====================================================
-- XP & PROGRESS TRACKING
-- =====================================================

-- XP transaction log
CREATE TABLE IF NOT EXISTS xp_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- can be negative for penalties
  type VARCHAR(50) NOT NULL CHECK (type IN ('challenge_completion', 'exercise_completion', 'badge_bonus', 'streak_bonus', 'penalty', 'manual_adjustment')),
  source_id UUID, -- ID of challenge, exercise, badge, etc.
  source_type VARCHAR(50), -- 'challenge', 'exercise', 'badge', etc.
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily activity tracking
CREATE TABLE IF NOT EXISTS daily_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL,
  
  -- Activity counters
  challenges_completed INTEGER DEFAULT 0,
  exercises_completed INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0, -- in seconds
  
  -- Streak tracking
  is_learning_day BOOLEAN DEFAULT false,
  streak_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(student_id, activity_date)
);

-- =====================================================
-- ADMIN CONTENT MANAGEMENT
-- =====================================================

-- Content approval workflow
CREATE TABLE IF NOT EXISTS content_approvals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('level', 'challenge', 'exercise')),
  content_id UUID NOT NULL,
  admin_id UUID REFERENCES profiles(id),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'revision_needed')),
  comments TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Level system indexes
CREATE INDEX IF NOT EXISTS idx_levels_number ON levels(level_number, sublevel_number);
CREATE INDEX IF NOT EXISTS idx_level_challenges_level_order ON level_challenges(level_id, order_index);
CREATE INDEX IF NOT EXISTS idx_student_level_progress_student ON student_level_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_student_level_progress_status ON student_level_progress(status);

-- Exercise system indexes
CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises(category_id);
CREATE INDEX IF NOT EXISTS idx_exercises_type ON exercises(type);
CREATE INDEX IF NOT EXISTS idx_exercises_featured ON exercises(is_featured, is_active);
CREATE INDEX IF NOT EXISTS idx_student_exercise_completions_student ON student_exercise_completions(student_id);

-- XP and progress indexes
CREATE INDEX IF NOT EXISTS idx_xp_transactions_student_date ON xp_transactions(student_id, created_at);
CREATE INDEX IF NOT EXISTS idx_daily_activities_student_date ON daily_activities(student_id, activity_date);
CREATE INDEX IF NOT EXISTS idx_student_badges_student ON student_badges(student_id);

-- =====================================================
-- INITIAL DATA SEEDING
-- =====================================================

-- Insert exercise categories
INSERT INTO exercise_categories (name, description, icon, color, order_index) VALUES
('Programming Basics', 'Fundamental programming concepts and syntax', '🔤', 'green', 1),
('Algorithm Practice', 'Data structures and algorithm challenges', '🧮', 'blue', 2),
('Web Development', 'HTML, CSS, JavaScript, and web frameworks', '🌐', 'purple', 3),
('Database & SQL', 'Database design and SQL query practice', '🗃️', 'orange', 4),
('Problem Solving', 'Logic puzzles and computational thinking', '🧩', 'red', 5),
('Best Practices', 'Code quality, testing, and industry standards', '✅', 'gray', 6),
('Career Skills', 'Professional development and soft skills', '💼', 'indigo', 7);

-- Insert basic levels (Level 1 - Newbie Coder)
INSERT INTO levels (level_number, sublevel_number, title, description, xp_required_min, xp_required_max) VALUES
(1, 1, 'Hello World', 'Your first steps into programming', 0, 100),
(1, 2, 'Variables & Data Types', 'Understanding data storage and manipulation', 100, 200),
(1, 3, 'Basic Input/Output', 'Interacting with users through input and output', 200, 300),
(1, 4, 'Simple Calculations', 'Mathematical operations and expressions', 300, 400),
(1, 5, 'First Functions', 'Creating reusable code blocks', 400, 500);

-- Insert badge definitions
INSERT INTO badges (name, description, icon, rarity, xp_bonus, unlock_type, unlock_conditions) VALUES
('First Steps', 'Complete your first challenge', '👶', 'bronze', 50, 'challenge_count', '{"count": 1}'),
('Level Up!', 'Complete your first level', '📈', 'silver', 100, 'level_completion', '{"level": 1}'),
('Speed Demon', 'Complete a challenge in record time', '⚡', 'gold', 200, 'special', '{"type": "fast_completion"}'),
('Perfectionist', 'Achieve 100% score on 5 challenges', '💯', 'gold', 300, 'special', '{"type": "perfect_scores", "count": 5}'),
('Dedicated Learner', 'Maintain a 7-day learning streak', '🔥', 'silver', 150, 'streak', '{"days": 7}'),
('Knowledge Seeker', 'Complete 50 exercises', '🔍', 'gold', 250, 'exercise_count', '{"count": 50}'),
('Coding Legend', 'Reach Level 6', '👑', 'diamond', 1000, 'level_completion', '{"level": 6}');

-- =====================================================
-- USEFUL FUNCTIONS
-- =====================================================

-- Function to calculate student's current level
CREATE OR REPLACE FUNCTION get_student_current_level(student_uuid UUID)
RETURNS TABLE(level_number INTEGER, sublevel_number INTEGER, title VARCHAR(255), current_xp INTEGER) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.level_number,
    l.sublevel_number,
    l.title,
    COALESCE(p.xp, 0) as current_xp
  FROM profiles p
  CROSS JOIN levels l
  WHERE p.id = student_uuid
    AND COALESCE(p.xp, 0) >= l.xp_required_min 
    AND COALESCE(p.xp, 0) < l.xp_required_max
  ORDER BY l.level_number DESC, l.sublevel_number DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to get student's unlocked challenges
CREATE OR REPLACE FUNCTION get_unlocked_challenges(student_uuid UUID)
RETURNS TABLE(challenge_id UUID, title VARCHAR(255), xp_reward INTEGER) AS $$
BEGIN
  RETURN QUERY
  WITH student_level AS (
    SELECT * FROM get_student_current_level(student_uuid)
  ),
  student_xp AS (
    SELECT COALESCE(xp, 0) as total_xp FROM profiles WHERE id = student_uuid
  )
  SELECT 
    lc.id as challenge_id,
    lc.title,
    lc.xp_reward
  FROM level_challenges lc
  JOIN levels l ON lc.level_id = l.id
  CROSS JOIN student_xp sx
  WHERE sx.total_xp >= l.xp_required_min
    AND lc.is_active = true
  ORDER BY l.level_number, l.sublevel_number, lc.order_index;
END;
$$ LANGUAGE plpgsql;

-- Function to award XP
CREATE OR REPLACE FUNCTION award_xp(
  student_uuid UUID,
  xp_amount INTEGER,
  xp_type VARCHAR(50),
  source_uuid UUID DEFAULT NULL,
  source_type_param VARCHAR(50) DEFAULT NULL,
  description_param TEXT DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
  new_total_xp INTEGER;
BEGIN
  -- Insert XP transaction
  INSERT INTO xp_transactions (student_id, amount, type, source_id, source_type, description)
  VALUES (student_uuid, xp_amount, xp_type, source_uuid, source_type_param, description_param);
  
  -- Update student's total XP
  UPDATE profiles 
  SET xp = COALESCE(xp, 0) + xp_amount
  WHERE id = student_uuid
  RETURNING xp INTO new_total_xp;
  
  RETURN new_total_xp;
END;
$$ LANGUAGE plpgsql;
