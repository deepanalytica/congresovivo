/**
 * Supabase Client Utilities
 * Provides both client-side and server-side Supabase clients
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

/**
 * Client-side Supabase client
 * Uses anon key - safe for browser usage
 * Respects RLS policies
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Server-side Supabase client
 * Uses service role key - bypasses RLS
 * Only use in API routes and server components
 */
export function getServerSupabase() {
    if (!supabaseServiceRoleKey) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set. Required for server-side operations.');
    }

    return createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
}

/**
 * Helper to check if server Supabase is available
 */
export function hasServerSupabase(): boolean {
    return !!supabaseServiceRoleKey;
}
