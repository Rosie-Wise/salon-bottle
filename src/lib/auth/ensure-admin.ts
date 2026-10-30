import { redirect } from 'next/navigation';
import { getCurrentUser, isAdminUser, isDemoMode } from '@/lib/auth/session';

export async function ensureAdminPageAccess(nextPath: string): Promise<void> {
  if (isDemoMode()) {
    return;
  }
  const user = await getCurrentUser();
  if (!user || !(await isAdminUser(user))) {
    redirect(`/auth/login?next=${encodeURIComponent(nextPath)}`);
  }
}
