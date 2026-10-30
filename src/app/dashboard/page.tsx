import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboardHomePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl tracking-tight">Welcome back</h1>
        <p className="mt-3 max-w-lg text-muted leading-relaxed">
          Your RAD dashboard is a simple place to revisit designs, track orders,
          and start a new private-label run when you&apos;re ready.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <Link
          href="/dashboard/designs"
          className="border border-border/80 bg-ivory/40 p-8 transition-colors hover:border-foreground/20"
        >
          <h2 className="font-display text-xl">My Designs</h2>
          <p className="mt-2 text-sm text-muted">
            Labels saved from your current browser session.
          </p>
        </Link>
        <Link
          href="/dashboard/orders"
          className="border border-border/80 bg-ivory/40 p-8 transition-colors hover:border-foreground/20"
        >
          <h2 className="font-display text-xl">My Orders</h2>
          <p className="mt-2 text-sm text-muted">
            Status and history for your bottle orders.
          </p>
        </Link>
      </div>
      <Button asChild>
        <Link href="/create/upload">Create a New Label</Link>
      </Button>
    </div>
  );
}
