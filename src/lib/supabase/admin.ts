import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
} from '@/lib/supabase/config';

let adminClient: SupabaseClient | null | undefined;

/**
 * Service-role client for trusted server-only operations. Never expose to the browser.
 */
export function createAdminClient(): SupabaseClient | null {
  if (adminClient !== undefined) {
    return adminClient;
  }
  const url = getSupabaseUrl();
  const serviceKey = getSupabaseServiceRoleKey();
  if (!url || !serviceKey) {
    adminClient = null;
    return null;
  }
  adminClient = createSupabaseClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  return adminClient;
}

export function resetAdminSupabaseClient(): void {
  adminClient = undefined;
}
