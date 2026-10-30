'use client';

import { cn } from '@/lib/utils';

const STEPS = [
  'Upload',
  'Designs',
  'Customize',
  'Approve',
  'Order',
] as const;

export interface ProgressBarProps {
  currentStep: number;
  className?: string;
}

export function ProgressBar({ currentStep, className }: ProgressBarProps) {
  const step = Math.min(5, Math.max(1, currentStep));

  return (
    <div className={cn('w-full', className)}>
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-4">
        {STEPS.map((label, index) => {
          const n = index + 1;
          const active = n === step;
          const complete = n < step;

          return (
            <div
              key={label}
              className="flex flex-1 flex-col items-center gap-2 text-center"
            >
              <div className="flex w-full items-center">
                {index > 0 && (
                  <div
                    className={cn(
                      'h-px flex-1',
                      complete || active ? 'bg-foreground/30' : 'bg-border',
                    )}
                  />
                )}
                <div
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center border text-[10px] font-medium tracking-wider',
                    active && 'border-foreground bg-foreground text-background',
                    complete && !active && 'border-foreground/40 bg-transparent text-foreground',
                    !active && !complete && 'border-border text-muted',
                  )}
                  aria-current={active ? 'step' : undefined}
                >
                  {n}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'h-px flex-1',
                      complete ? 'bg-foreground/30' : 'bg-border',
                    )}
                  />
                )}
              </div>
              <span
                className={cn(
                  'hidden text-[10px] uppercase tracking-[0.12em] sm:block',
                  active ? 'text-foreground' : 'text-muted',
                )}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
