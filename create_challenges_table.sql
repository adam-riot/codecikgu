-- Simple script to create challenges table only
-- Run this first to fix the immediate error

-- Drop table if exists to start fresh
DROP TABLE IF EXISTS challenges CASCADE;

-- Create challenges table with all required columns
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('coding', 'quiz', 'video', 'reading', 'discussion', 'interactive', 'project', 'assessment')),
  difficulty VARCHAR(50) NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  points INTEGER NOT NULL DEFAULT 100,
  timeLimit INTEGER, -- in minutes
  tingkatan VARCHAR(50) NOT NULL CHECK (tingkatan IN ('tingkatan-4', 'tingkatan-5', 'both')),
  
  -- Coding challenge fields
  testCases TEXT,
  sampleSolution TEXT,
  startingCode TEXT,
  
  -- Video challenge fields
  videoUrl TEXT,
  videoDuration INTEGER, -- in minutes
  videoQuestions TEXT,
  
  -- Reading challenge fields
  readingMaterial TEXT,
  readingUrl TEXT,
  readingQuestions TEXT,
  
  -- Quiz challenge fields
  quizType VARCHAR(50) CHECK (quizType IN ('multiple_choice', 'true_false', 'fill_blank', 'drag_drop', 'interactive')),
  quizQuestions TEXT, -- JSON string
  
  -- Interactive challenge fields
  interactiveType VARCHAR(50) CHECK (interactiveType IN ('kahoot', 'quizizz', 'padlet', 'mentimeter', 'jamboard', 'flipgrid', 'custom')),
  interactiveUrl TEXT,
  interactiveInstructions TEXT,
  
  -- Discussion challenge fields
  discussionTopic TEXT,
  discussionGuidelines TEXT,
  
  -- Assessment challenge fields
  assessmentFormat VARCHAR(50) CHECK (assessmentFormat IN ('written', 'practical', 'presentation', 'portfolio')),
  assessmentCriteria TEXT,
  
  -- Common fields
  tags TEXT[], -- Array of strings
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- Enable RLS for challenges table
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

-- Create policies for challenges table
CREATE POLICY "Challenges are viewable by everyone." ON challenges FOR SELECT USING (true);
CREATE POLICY "Admins can insert challenges." ON challenges FOR INSERT WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins can update challenges." ON challenges FOR UPDATE USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins can delete challenges." ON challenges FOR DELETE USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Create indexes for better performance
CREATE INDEX idx_challenges_type ON challenges(type);
CREATE INDEX idx_challenges_difficulty ON challenges(difficulty);
CREATE INDEX idx_challenges_tingkatan ON challenges(tingkatan);
CREATE INDEX idx_challenges_status ON challenges(status);
CREATE INDEX idx_challenges_created_at ON challenges(created_at);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE
ON challenges FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
