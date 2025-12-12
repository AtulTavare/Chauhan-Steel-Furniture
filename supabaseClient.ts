import { createClient } from '@supabase/supabase-js';

// Helper to safely get env vars in Vite (import.meta.env) or standard environments
const getEnv = (key: string) => {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[`VITE_${key}`]) {
    return (import.meta as any).env[`VITE_${key}`];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return null;
};

// Fallback to hardcoded values if env vars are missing
const supabaseUrl = getEnv('SUPABASE_URL') || 'https://rjkynyygtcylsdsnqing.supabase.co';
const supabaseKey = getEnv('SUPABASE_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqa3lueXlndGN5bHNkc25xaW5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0Mzc5NDYsImV4cCI6MjA4MTAxMzk0Nn0._5EcGN28uvV54-hmqxwD5-iunqyR11-mWoHp-L22BKQ';

export const supabase = createClient(supabaseUrl, supabaseKey);