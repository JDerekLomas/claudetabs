import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Only create client if credentials exist
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Generate or retrieve a persistent user ID
export const getUserId = () => {
  let userId = localStorage.getItem('claudetabs_user_id');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('claudetabs_user_id', userId);
  }
  return userId;
};

// --- User Profile ---
export const saveUserProfile = async (userId, profile) => {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({
      user_id: userId,
      profile_data: profile,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })
    .select();

  if (error) console.warn('Failed to save profile:', error);
  return data;
};

export const loadUserProfile = async (userId) => {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('user_profiles')
    .select('profile_data')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.warn('Failed to load profile:', error);
  }
  return data?.profile_data || null;
};

// --- Chats ---
export const saveChats = async (userId, chats) => {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('chats')
    .upsert({
      user_id: userId,
      chats_data: chats,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })
    .select();

  if (error) console.warn('Failed to save chats:', error);
  return data;
};

export const loadChats = async (userId) => {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('chats')
    .select('chats_data')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.warn('Failed to load chats:', error);
  }
  return data?.chats_data || null;
};

// --- Learning History ---
export const saveLearningHistory = async (userId, history) => {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('learning_history')
    .upsert({
      user_id: userId,
      history_data: history,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })
    .select();

  if (error) console.warn('Failed to save learning history:', error);
  return data;
};

export const loadLearningHistory = async (userId) => {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('learning_history')
    .select('history_data')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.warn('Failed to load learning history:', error);
  }
  return data?.history_data || null;
};

// --- User Settings (learning mode, active chat, etc.) ---
export const saveUserSettings = async (userId, settings) => {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('user_settings')
    .upsert({
      user_id: userId,
      settings_data: settings,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })
    .select();

  if (error) console.warn('Failed to save settings:', error);
  return data;
};

export const loadUserSettings = async (userId) => {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('user_settings')
    .select('settings_data')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.warn('Failed to load settings:', error);
  }
  return data?.settings_data || null;
};
