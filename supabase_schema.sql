-- Daily XP cap per user (example: 5000 XP)
create table if not exists xp_daily_cap (
  user_id uuid primary key,
  date date not null default current_date,
  total_xp integer not null default 0,
  updated_at timestamptz not null default now()
);

create or replace function public.enforce_daily_xp_cap() returns trigger
language plpgsql as $$
declare
  cap integer := 5000;
  current_total integer := 0;
begin
  select total_xp into current_total from xp_daily_cap where user_id = new.user_id and date = current_date;
  if current_total is null then
    current_total := 0;
  end if;
  if current_total + new.mata > cap then
    raise exception 'Daily XP cap exceeded';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_xp_log_daily_cap on xp_log;
create trigger trg_xp_log_daily_cap
before insert on xp_log
for each row execute function public.enforce_daily_xp_cap();

create or replace function public.update_xp_daily_totals() returns trigger
language plpgsql as $$
begin
  insert into xp_daily_cap(user_id, date, total_xp)
  values (new.user_id, current_date, new.mata)
  on conflict (user_id) do update
  set total_xp = xp_daily_cap.total_xp + new.mata,
      date = current_date,
      updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_xp_log_update_daily on xp_log;
create trigger trg_xp_log_update_daily
after insert on xp_log
for each row execute function public.update_xp_daily_totals();

-- Atomic XP award function (log + increment in one transaction)
create or replace function public.award_xp(
  p_user_id uuid,
  p_activity text,
  p_xp integer
) returns void
language plpgsql
security definer
as $$
begin
  -- Ensure caller is the same as target user
  if auth.uid() is null or auth.uid() <> p_user_id then
    raise exception 'Unauthorized';
  end if;

  insert into xp_log(user_id, aktiviti, mata)
  values (p_user_id, p_activity, p_xp);

  update profiles
  set xp = coalesce(xp, 0) + p_xp
  where id = p_user_id;
end;
$$;

grant execute on function public.award_xp(uuid, text, integer) to anon, authenticated;

-- Events table for telemetry
create table if not exists public.events (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_type text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

alter table public.events enable row level security;

drop policy if exists events_select_own on public.events;
create policy events_select_own on public.events for select using (user_id = auth.uid());

drop policy if exists events_insert_own on public.events;
create policy events_insert_own on public.events for insert with check (user_id = auth.uid());

create index if not exists idx_events_user_created_at on public.events(user_id, created_at desc);

-- Leaderboard RPC (weekly/monthly/all-time)
create or replace function public.get_leaderboard(
  p_period text default 'weekly',
  p_limit int default 20
) returns table (
  user_id uuid,
  name text,
  email text,
  xp bigint
)
language sql
security definer
as $$
  with range as (
    select case lower(p_period)
      when 'weekly' then now() - interval '7 days'
      when 'monthly' then now() - interval '30 days'
      else timestamp '1970-01-01'
    end as start_time
  )
  select p.id as user_id,
         coalesce(p.name, split_part(p.email, '@', 1)) as name,
         p.email,
         case when lower(p_period) in ('weekly','monthly') then coalesce(sum(x.mata), 0)
              else coalesce(p.xp, 0)::bigint
         end as xp
  from public.profiles p
  left join public.xp_log x on x.user_id = p.id
    and lower(p_period) in ('weekly','monthly')
    and x.created_at >= (select start_time from range)
  group by p.id, p.name, p.email, p.xp
  order by xp desc
  limit p_limit;
$$;

grant execute on function public.get_leaderboard(text, int) to anon, authenticated;

-- Quiz questions table (admin/guru manage)
create table if not exists public.quiz_questions (
  id uuid primary key default uuid_generate_v4(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  question_text text not null,
  options jsonb not null, -- ["A", "B", "C", "D"] or array of strings
  correct_answer text not null, -- e.g., "A"
  points integer not null default 1,
  created_at timestamptz not null default now()
);

alter table public.quiz_questions enable row level security;

drop policy if exists quiz_q_select_all on public.quiz_questions;
create policy quiz_q_select_all on public.quiz_questions for select using (true);

drop policy if exists quiz_q_modify_admin_guru on public.quiz_questions;
create policy quiz_q_modify_admin_guru on public.quiz_questions
for all using ((select role from public.profiles where id = auth.uid()) in ('admin','guru'))
with check ((select role from public.profiles where id = auth.uid()) in ('admin','guru'));

create index if not exists idx_quiz_q_challenge on public.quiz_questions(challenge_id);

-- Quiz submissions
create table if not exists public.quiz_submissions (
  id uuid primary key default uuid_generate_v4(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  answers jsonb not null, -- {questionId: "A"}
  score integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.quiz_submissions enable row level security;

drop policy if exists quiz_sub_select_own on public.quiz_submissions;
create policy quiz_sub_select_own on public.quiz_submissions for select using (user_id = auth.uid());

drop policy if exists quiz_sub_insert_own on public.quiz_submissions;
create policy quiz_sub_insert_own on public.quiz_submissions for insert with check (user_id = auth.uid());

create index if not exists idx_quiz_sub_user on public.quiz_submissions(user_id, created_at desc);

-- Activity completions (reading/video) to avoid duplicate XP awards
create table if not exists public.activity_completions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  activity_key text not null, -- unique per user per activity (e.g., note:123, video:abc)
  activity_type text not null check (activity_type in ('reading','video','other')),
  metadata jsonb,
  created_at timestamptz not null default now(),
  unique(user_id, activity_key)
);

alter table public.activity_completions enable row level security;

drop policy if exists activity_comp_select_own on public.activity_completions;
create policy activity_comp_select_own on public.activity_completions for select using (user_id = auth.uid());

drop policy if exists activity_comp_insert_own on public.activity_completions;
create policy activity_comp_insert_own on public.activity_completions for insert with check (user_id = auth.uid());

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



