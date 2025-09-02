# Supabase Setup Instructions

## 1. Get Your Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and sign in
2. Create a new project or select existing one
3. Go to Settings → API
4. Copy the following values:
   - Project URL
   - Anon public key

## 2. Update Environment Variables

Replace the values in `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 3. Database Setup

The database schema will be created automatically when you first run the app. If you need to manually create it, run these SQL commands in your Supabase SQL editor:

```sql
-- Enable Row Level Security
CREATE TYPE user_role AS ENUM ('student', 'donor', 'admin');
CREATE TYPE request_status AS ENUM ('pending', 'approved', 'funded', 'completed', 'rejected');

-- Create profiles table
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    school TEXT,
    grade TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
```

## 4. Test the Connection

1. Start the development server: `pnpm run dev`
2. Try to register a new account
3. Check if the profile is created in Supabase dashboard