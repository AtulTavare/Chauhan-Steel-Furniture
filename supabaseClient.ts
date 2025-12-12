import { createClient } from '@supabase/supabase-js';

// Use Environment Variables from Netlify if available, otherwise fallback to hardcoded values
const supabaseUrl = process.env.SUPABASE_URL || 'https://rjkynyygtcylsdsnqing.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqa3lueXlndGN5bHNkc25xaW5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0Mzc5NDYsImV4cCI6MjA4MTAxMzk0Nn0._5EcGN28uvV54-hmqxwD5-iunqyR11-mWoHp-L22BKQ';

export const supabase = createClient(supabaseUrl, supabaseKey);