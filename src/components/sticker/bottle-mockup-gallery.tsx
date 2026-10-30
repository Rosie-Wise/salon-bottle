'use client';

import Image from 'next/image';
import { useCallback, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { cn } from '@/lib/utils';

const VIEWS = [
  {
    id: 'front' as const,
    src: '/labels/bottle-front.png',
    label: 'Front view',
    angle: 0,
    width: 1413,
    height: 1600,
  },
  {
    id: 'back' as const,
    src: '/labels/bottle-back.png',
    label: 'Back view (middle panel)',
    angle: 120,
    width: 1428,
    height: 1600,
  },
  {
    id: 'side' as const,
    src: '/labels/bottle-side.png',
    label: 'Side view (right panel)',
    angle: 240,
    width: 1435,
    height: 1600,
  },
] as const;

type ViewId = (typeof VIEWS)[number]['id'];

function nearestView(angle: number): ViewId {
  const a = ((angle % 360) + 360) % 360;
  if (a < 60 || a >= 300) return 'front';
  if (a < 180) return 'back';
  return 'side';
}

function snapAngle(angle: number): number {
  return VIEWS.find((v) => v.id === nearestView(angle))!.angle;
}

export function BottleHeroSpin({ className }: { className?: string }) {
  const [angle, setAngle] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ x: number; angle: number } | null>(null);
  const active = nearestView(angle);
  const activeView = VIEWS.find((v) => v.id === active)!;

  const onPointerDown = useCallback(
    (e: ReactPointerEvent) => {
      setDragging(true);
      dragRef.current = { x: e.clientX, angle };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [angle],
  );

  const onPointerMove = useCallback((e: ReactPointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    setAngle((((dragRef.current.angle - dx * 0.55) % 360) + 360) % 360);
  }, []);

  const onPointerUp = useCallback(() => {
    dragRef.current = null;
    setDragging(false);
    setAngle((a) => snapAngle(a));
  }, []);

  return (
    <div
      className={cn(
        'relative mx-auto flex w-full touch-none select-none flex-col items-center',
        'max-w-[min(94vw,440px)] sm:max-w-[min(72vw,540px)] md:max-w-[580px]',
        dragging ? 'cursor-grabbing' : 'cursor-grab',
        className,
      )}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      role="img"
      aria-label="Drag to rotate the Beauty Salon shampoo bottle mockup"
    >
      <div className="relative w-full">
        {VIEWS.map((view) => (
          <Image
            key={view.id}
            src={view.src}
            alt={`Beauty Salon hydrating shampoo bottle — ${view.label}`}
            width={view.width}
            height={view.height}
            priority={view.id === 'front'}
            sizes="(max-width: 640px) 94vw, (max-width: 1024px) 72vw, 580px"
            className={cn(
              'h-auto w-full transition-opacity duration-150 ease-out',
              view.id === active
                ? 'relative opacity-100'
                : 'pointer-events-none absolute inset-x-0 top-0 opacity-0',
            )}
            draggable={false}
          />
        ))}
      </div>
      <p className="mt-5 text-center text-xs tracking-wide text-muted">
        Drag to turn · {activeView.label}
      </p>
    </div>
  );
}

export function BottleViewStrip({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'mx-auto grid max-w-5xl grid-cols-1 items-end gap-12 sm:grid-cols-3 sm:gap-8',
        className,
      )}
    >
      {VIEWS.map((view) => (
        <div key={view.id} className="flex flex-col items-center">
          <Image
            src={view.src}
            alt={view.label}
            width={view.width}
            height={view.height}
            sizes="(max-width: 640px) 240px, 28vw"
            className="h-auto w-full max-w-[240px] object-contain sm:max-w-none"
            draggable={false}
          />
          <span className="mt-5 text-center text-[10px] uppercase tracking-[0.2em] text-muted">
            {view.label}
          </span>
        </div>
      ))}
    </div>
  );
}

/** @deprecated Prefer BottleHeroSpin + BottleViewStrip */
export function BottleMockupGallery({ className }: { className?: string }) {
  return (
    <div className={cn('w-full', className)}>
      <BottleHeroSpin />
      <BottleViewStrip className="mt-20" />
    </div>
  );
}
