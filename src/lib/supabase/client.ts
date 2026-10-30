import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  getSupabaseAnonKey,
  getSupabaseUrl,
} from '@/lib/supabase/config';

let browserClient: SupabaseClient | null | undefined;

/**
 * Browser Supabase client. Returns `null` when public env vars are missing.
 */
export function createClient(): SupabaseClient | null {
  if (browserClient !== undefined) {
    return browserClient;
  }
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();
  if (!url || !anonKey) {
    browserClient = null;
    return null;
  }
  browserClient = createBrowserClient(url, anonKey);
  return browserClient;
}

export function resetBrowserSupabaseClient(): void {
  browserClient = undefined;
}
