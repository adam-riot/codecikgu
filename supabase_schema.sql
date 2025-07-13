-- Create profiles table (if not exists)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  sekolah VARCHAR(255),
  tingkatan VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'awam',
  xp INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create progress table (if not exists)
CREATE TABLE IF NOT EXISTS progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  topik VARCHAR(255) NOT NULL,
  selesai BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for progress table
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

-- Create ganjaran table (if not exists)
CREATE TABLE IF NOT EXISTS ganjaran (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama VARCHAR(255) NOT NULL,
  deskripsi TEXT,
  syarat_xp INTEGER NOT NULL,
  imej_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for ganjaran table
ALTER TABLE ganjaran ENABLE ROW LEVEL SECURITY;

-- Create xp_log table (if not exists)
CREATE TABLE IF NOT EXISTS xp_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  aktiviti VARCHAR(255) NOT NULL,
  mata INTEGER NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for xp_log table
ALTER TABLE xp_log ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table (drop if exists first)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON profiles;

CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- Create policies for progress table (drop if exists first)
DROP POLICY IF EXISTS "Progress is viewable by owner." ON progress;
DROP POLICY IF EXISTS "Users can insert their own progress." ON progress;
DROP POLICY IF EXISTS "Users can update their own progress." ON progress;

CREATE POLICY "Progress is viewable by owner." ON progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own progress." ON progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress." ON progress FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for ganjaran table (drop if exists first)
DROP POLICY IF EXISTS "Ganjaran is viewable by everyone." ON ganjaran;
DROP POLICY IF EXISTS "Admins can insert ganjaran." ON ganjaran;
DROP POLICY IF EXISTS "Admins can update ganjaran." ON ganjaran;
DROP POLICY IF EXISTS "Admins can delete ganjaran." ON ganjaran;

CREATE POLICY "Ganjaran is viewable by everyone." ON ganjaran FOR SELECT USING (true);
CREATE POLICY "Admins can insert ganjaran." ON ganjaran FOR INSERT WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins can update ganjaran." ON ganjaran FOR UPDATE USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins can delete ganjaran." ON ganjaran FOR DELETE USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Create policies for xp_log table (drop if exists first)
DROP POLICY IF EXISTS "XP logs are viewable by owner." ON xp_log;
DROP POLICY IF EXISTS "Users can insert their own XP log." ON xp_log;

CREATE POLICY "XP logs are viewable by owner." ON xp_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own XP log." ON xp_log FOR INSERT WITH CHECK (auth.uid() = user_id);




-- Create posts table (if not exists)
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  author_id UUID REFERENCES profiles(id)
);

-- Enable RLS for posts table
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policies for posts table (drop if exists first)
DROP POLICY IF EXISTS "Posts are viewable by everyone." ON posts;
DROP POLICY IF EXISTS "Admins can insert posts." ON posts;
DROP POLICY IF EXISTS "Admins can update posts." ON posts;
DROP POLICY IF EXISTS "Admins can delete posts." ON posts;

CREATE POLICY "Posts are viewable by everyone." ON posts FOR SELECT USING (true);
CREATE POLICY "Admins can insert posts." ON posts FOR INSERT WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins can update posts." ON posts FOR UPDATE USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins can delete posts." ON posts FOR DELETE USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Create challenges table (if not exists)
CREATE TABLE IF NOT EXISTS challenges (
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

-- Create policies for challenges table (drop if exists first)
DROP POLICY IF EXISTS "Challenges are viewable by everyone." ON challenges;
DROP POLICY IF EXISTS "Admins can insert challenges." ON challenges;
DROP POLICY IF EXISTS "Admins can update challenges." ON challenges;
DROP POLICY IF EXISTS "Admins can delete challenges." ON challenges;

CREATE POLICY "Challenges are viewable by everyone." ON challenges FOR SELECT USING (true);
CREATE POLICY "Admins can insert challenges." ON challenges FOR INSERT WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins can update challenges." ON challenges FOR UPDATE USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins can delete challenges." ON challenges FOR DELETE USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Create indexes for better performance (if not exists)
CREATE INDEX IF NOT EXISTS idx_challenges_type ON challenges(type);
CREATE INDEX IF NOT EXISTS idx_challenges_difficulty ON challenges(difficulty);
CREATE INDEX IF NOT EXISTS idx_challenges_tingkatan ON challenges(tingkatan);
CREATE INDEX IF NOT EXISTS idx_challenges_status ON challenges(status);
CREATE INDEX IF NOT EXISTS idx_challenges_created_at ON challenges(created_at);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at (drop if exists first)
DROP TRIGGER IF EXISTS update_challenges_updated_at ON challenges;

CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE
ON challenges FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


