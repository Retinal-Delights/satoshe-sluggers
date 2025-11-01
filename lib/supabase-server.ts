// lib/supabase-server.ts
// Server-side Supabase client (uses service role key - NEVER expose to client!)

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseServerInstance: SupabaseClient | null = null;

/**
 * Get or create the Supabase server client
 * Lazy-loaded to avoid build-time errors when env vars aren't set
 */
export function getSupabaseServer(): SupabaseClient {
  if (supabaseServerInstance) {
    return supabaseServerInstance;
  }

  // SECURITY: These env vars should NEVER be exposed to the client
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      'SECURITY ERROR: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables. ' +
      'These are required for server-side database operations. ' +
      'Please ensure these are set in your Vercel environment variables.'
    );
  }

  // Server-side client with service role key (bypasses RLS)
  supabaseServerInstance = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  return supabaseServerInstance;
}

// Export for convenience (uses lazy getter)
export const supabaseServer = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return getSupabaseServer()[prop as keyof SupabaseClient];
  }
});

