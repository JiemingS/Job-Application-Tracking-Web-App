import { createClient } from '@supabase/supabase-js';

const { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('Missing Supabase environment variables. API calls will fail until .env is configured.');
}

export const supabaseAuth = createClient(SUPABASE_URL || 'http://localhost', SUPABASE_ANON_KEY || 'missing');

export const supabaseAdmin = createClient(
  SUPABASE_URL || 'http://localhost',
  SUPABASE_SERVICE_ROLE_KEY || 'missing',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
