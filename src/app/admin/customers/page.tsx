import { ensureAdminPageAccess } from '@/lib/auth/ensure-admin';
import { isDemoMode } from '@/lib/auth/session';
import { createAdminClient } from '@/lib/supabase/admin';

export default async function AdminCustomersPage() {
  await ensureAdminPageAccess('/admin/customers');

  if (isDemoMode()) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-3xl tracking-tight">Customers</h1>
        <p className="text-muted max-w-lg leading-relaxed">
          Customer directory appears when Supabase is configured. In demo mode,
          orders are anonymous local records.
        </p>
      </div>
    );
  }

  const admin = createAdminClient();
  const { data: profiles } = await admin!
    .from('profiles')
    .select(
      'id, first_name, last_name, salon_name, email, phone, business_location, created_at',
    )
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl tracking-tight">Customers</h1>
      <div className="overflow-x-auto border border-border/80">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="border-b border-border/80 bg-cream/50 text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3">Salon</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {(profiles ?? []).length === 0 ?
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-muted">
                  No customers yet.
                </td>
              </tr>
            : (profiles ?? []).map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3">
                    {p.salon_name ||
                      [p.first_name, p.last_name].filter(Boolean).join(' ') ||
                      '—'}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {p.email}
                    {p.phone ? ` · ${p.phone}` : ''}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {p.business_location ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {p.created_at ?
                      new Date(p.created_at).toLocaleDateString()
                    : '—'}
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
