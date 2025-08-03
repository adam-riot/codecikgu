-- Create profiles table (if not exists)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  sekolah VARCHAR(255),
  tingkatan VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'awam',
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  avatar_url TEXT,
  bio TEXT,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create progress table (if not exists)
CREATE TABLE IF NOT EXISTS progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
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
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  aktiviti VARCHAR(255) NOT NULL,
  mata INTEGER NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for xp_log table
ALTER TABLE xp_log ENABLE ROW LEVEL SECURITY;

-- Create posts table (if not exists)
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Enable RLS for posts table
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

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
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Enable RLS for challenges table
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

-- Create playground_files table for saved code files
CREATE TABLE IF NOT EXISTS playground_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  language VARCHAR(50) NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for playground_files table
ALTER TABLE playground_files ENABLE ROW LEVEL SECURITY;

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

-- Create policies for posts table (drop if exists first)
DROP POLICY IF EXISTS "Posts are viewable by everyone." ON posts;
DROP POLICY IF EXISTS "Admins can insert posts." ON posts;
DROP POLICY IF EXISTS "Admins can update posts." ON posts;
DROP POLICY IF EXISTS "Admins can delete posts." ON posts;

CREATE POLICY "Posts are viewable by everyone." ON posts FOR SELECT USING (true);
CREATE POLICY "Admins can insert posts." ON posts FOR INSERT WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins can update posts." ON posts FOR UPDATE USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins can delete posts." ON posts FOR DELETE USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Create policies for challenges table (drop if exists first)
DROP POLICY IF EXISTS "Challenges are viewable by everyone." ON challenges;
DROP POLICY IF EXISTS "Admins can insert challenges." ON challenges;
DROP POLICY IF EXISTS "Admins can update challenges." ON challenges;
DROP POLICY IF EXISTS "Admins can delete challenges." ON challenges;

CREATE POLICY "Challenges are viewable by everyone." ON challenges FOR SELECT USING (true);
CREATE POLICY "Admins can insert challenges." ON challenges FOR INSERT WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins can update challenges." ON challenges FOR UPDATE USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins can delete challenges." ON challenges FOR DELETE USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Create policies for playground_files table (drop if exists first)
DROP POLICY IF EXISTS "Playground files are viewable by owner." ON playground_files;
DROP POLICY IF EXISTS "Users can insert their own playground files." ON playground_files;
DROP POLICY IF EXISTS "Users can update their own playground files." ON playground_files;
DROP POLICY IF EXISTS "Users can delete their own playground files." ON playground_files;

CREATE POLICY "Playground files are viewable by owner." ON playground_files FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own playground files." ON playground_files FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own playground files." ON playground_files FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own playground files." ON playground_files FOR DELETE USING (auth.uid() = user_id);

-- Create comprehensive indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_xp ON profiles(xp DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_email_verified ON profiles(email_verified, role);

CREATE INDEX IF NOT EXISTS idx_progress_user_id ON progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_topik ON progress(topik);
CREATE INDEX IF NOT EXISTS idx_progress_selesai ON progress(selesai);

CREATE INDEX IF NOT EXISTS idx_xp_log_user_id ON xp_log(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_log_timestamp ON xp_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_xp_log_aktiviti ON xp_log(aktiviti);

CREATE INDEX IF NOT EXISTS idx_challenges_type ON challenges(type);
CREATE INDEX IF NOT EXISTS idx_challenges_difficulty ON challenges(difficulty);
CREATE INDEX IF NOT EXISTS idx_challenges_tingkatan ON challenges(tingkatan);
CREATE INDEX IF NOT EXISTS idx_challenges_status ON challenges(status);
CREATE INDEX IF NOT EXISTS idx_challenges_created_at ON challenges(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_challenges_created_by ON challenges(created_by);
CREATE INDEX IF NOT EXISTS idx_challenges_points ON challenges(points DESC);
CREATE INDEX IF NOT EXISTS idx_challenges_search ON challenges USING gin(to_tsvector('english', title || ' ' || description));

CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_playground_files_user_id ON playground_files(user_id);
CREATE INDEX IF NOT EXISTS idx_playground_files_language ON playground_files(language);
CREATE INDEX IF NOT EXISTS idx_playground_files_updated_at ON playground_files(updated_at DESC);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_challenges_updated_at ON challenges;
CREATE TRIGGER update_challenges_updated_at
    BEFORE UPDATE ON challenges
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_playground_files_updated_at ON playground_files;
CREATE TRIGGER update_playground_files_updated_at
    BEFORE UPDATE ON playground_files
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'awam')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();



