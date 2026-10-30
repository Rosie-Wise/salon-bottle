import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import type { User } from '@supabase/supabase-js';

export function isDemoMode(): boolean {
  return !isSupabaseConfigured();
}

function parseAdminEmails(): Set<string> {
  const raw = process.env.ADMIN_EMAILS ?? '';
  return new Set(
    raw
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );
}

export async function getCurrentUser(): Promise<User | null> {
  if (isDemoMode()) {
    return null;
  }
  const supabase = await createClient();
  if (!supabase) {
    return null;
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getProfileRole(userId: string): Promise<'customer' | 'admin' | null> {
  const supabase = await createClient();
  if (!supabase) {
    return null;
  }
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();
  if (!data?.role) {
    return null;
  }
  return data.role === 'admin' ? 'admin' : 'customer';
}

export async function isAdminUser(user: User): Promise<boolean> {
  const adminEmails = parseAdminEmails();
  if (user.email && adminEmails.has(user.email.toLowerCase())) {
    return true;
  }
  const role = await getProfileRole(user.id);
  return role === 'admin';
}

export class AuthError extends Error {
  constructor(
    message: string,
    public status: number = 401,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export async function requireAuth(): Promise<User> {
  if (isDemoMode()) {
    throw new AuthError('Authentication required (Supabase not configured)', 401);
  }
  const user = await getCurrentUser();
  if (!user) {
    throw new AuthError('Unauthorized', 401);
  }
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireAuth();
  if (!(await isAdminUser(user))) {
    throw new AuthError('Forbidden', 403);
  }
  return user;
}

/** Auth optional in demo; required when Supabase is configured. */
export async function requireAuthUnlessDemo(): Promise<{
  user: User | null;
  demoMode: boolean;
}> {
  if (isDemoMode()) {
    return { user: null, demoMode: true };
  }
  const user = await requireAuth();
  return { user, demoMode: false };
}
