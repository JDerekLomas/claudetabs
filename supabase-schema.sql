-- Claudetabs Database Schema
-- Run this in Supabase SQL Editor: https://yfoukyudrdhuwtlbamox.supabase.co

-- User Profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  profile_data TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chats table
CREATE TABLE IF NOT EXISTS chats (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  chats_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Learning History table
CREATE TABLE IF NOT EXISTS learning_history (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  history_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Settings table (learning mode, active chat, etc.)
CREATE TABLE IF NOT EXISTS user_settings (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  settings_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Policies: Allow all operations for now (since we're using anonymous user IDs)
-- In production, you'd want proper authentication

CREATE POLICY "Allow all for user_profiles" ON user_profiles
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for chats" ON chats
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for learning_history" ON learning_history
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for user_settings" ON user_settings
  FOR ALL USING (true) WITH CHECK (true);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_history_user_id ON learning_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
