-- Create profiles table
CREATE TABLE profiles (
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

-- Create progress table
CREATE TABLE progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  topik VARCHAR(255) NOT NULL,
  selesai BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for progress table
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

-- Create ganjaran table
CREATE TABLE ganjaran (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama VARCHAR(255) NOT NULL,
  deskripsi TEXT,
  syarat_xp INTEGER NOT NULL,
  imej_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for ganjaran table
ALTER TABLE ganjaran ENABLE ROW LEVEL SECURITY;

-- Create xp_log table
CREATE TABLE xp_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  aktiviti VARCHAR(255) NOT NULL,
  mata INTEGER NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for xp_log table
ALTER TABLE xp_log ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- Create policies for progress table
CREATE POLICY "Progress is viewable by owner." ON progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own progress." ON progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress." ON progress FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for ganjaran table
CREATE POLICY "Ganjaran is viewable by everyone." ON ganjaran FOR SELECT USING (true);
CREATE POLICY "Admins can insert ganjaran." ON ganjaran FOR INSERT WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins can update ganjaran." ON ganjaran FOR UPDATE USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins can delete ganjaran." ON ganjaran FOR DELETE USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Create policies for xp_log table
CREATE POLICY "XP logs are viewable by owner." ON xp_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own XP log." ON xp_log FOR INSERT WITH CHECK (auth.uid() = user_id);




-- Create posts table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  author_id UUID REFERENCES profiles(id)
);

-- Enable RLS for posts table
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policies for posts table
CREATE POLICY "Posts are viewable by everyone." ON posts FOR SELECT USING (true);
CREATE POLICY "Admins can insert posts." ON posts FOR INSERT WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins can update posts." ON posts FOR UPDATE USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins can delete posts." ON posts FOR DELETE USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');


