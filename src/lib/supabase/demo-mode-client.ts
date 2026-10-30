'use client';

import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/supabase/config';

export function isClientDemoMode(): boolean {
  return !getSupabaseUrl() || !getSupabaseAnonKey();
}
