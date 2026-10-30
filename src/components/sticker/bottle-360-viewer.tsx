'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { RotateCcw, Pause, Play } from 'lucide-react';
import type { DesignConfig } from '@/lib/types';
import { useWrapTexture } from '@/hooks/use-wrap-texture';
import { BOTTLE_SURFACE } from '@/lib/sticker/bottle-surface';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useDesignSessionStore } from '@/store/design-session';

export interface Bottle360ViewerProps {
  config: DesignConfig;
  logoUrl: string | null;
  /** Optional full wrap-around label image (front | ingredients | claims). */
  wrapImageUrl?: string | null;
  className?: string;
  compact?: boolean;
  autoSpin?: boolean;
}

function normalizeAngle(deg: number) {
  let a = deg % 360;
  if (a < 0) a += 360;
  return a;
}

/**
 * Smooth matte-white 200 mL bottle with a continuous wrap-around label.
 * The whole bottle rotates — label is projected onto the cylinder (no strip seams).
 */
export function Bottle360Viewer({
  config,
  logoUrl,
  wrapImageUrl = null,
  className,
  compact = false,
  autoSpin = false,
}: Bottle360ViewerProps) {
  const salonName = useDesignSessionStore((s) => s.salonName);
  const resolvedLogo = logoUrl ?? '/sample-logo.png';
  const generatedTexture = useWrapTexture(
    config,
    resolvedLogo,
    salonName || 'Beauty Salon',
  );
  const textureUrl = wrapImageUrl || generatedTexture;

  const [rotation, setRotation] = useState(8);
  const [spinning, setSpinning] = useState(autoSpin);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ x: number; rot: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textureRef = useRef<HTMLImageElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const rotRef = useRef(rotation);
  rotRef.current = rotation;

  // Load wrap texture image (reference flat label or generated)
  useEffect(() => {
    if (!textureUrl) {
      textureRef.current = null;
      return;
    }
    const img = new Image();
    img.onload = () => {
      textureRef.current = img;
      paint(rotRef.current);
    };
    img.onerror = () => {
      textureRef.current = null;
    };
    img.src = textureUrl;
  }, [textureUrl]);

  const paint = useCallback(
    (rot: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssW = canvas.clientWidth;
      const cssH = canvas.clientHeight;
      if (cssW === 0 || cssH === 0) return;

      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssW, cssH);

      drawSmoothBottle(ctx, cssW, cssH, rot, textureRef.current);
    },
    [],
  );

  // Spin loop
  useEffect(() => {
    if (!spinning || dragging) return;
    const tick = () => {
      setRotation((r) => {
        const next = normalizeAngle(r + 0.35);
        paint(next);
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [spinning, dragging, paint]);

  // Repaint on rotation / resize
  useEffect(() => {
    paint(rotation);
  }, [rotation, paint, textureUrl, compact]);

  useEffect(() => {
    const onResize = () => paint(rotRef.current);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [paint]);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent) => {
      setSpinning(false);
      setDragging(true);
      dragRef.current = { x: e.clientX, rot: rotation };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [rotation],
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent) => {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.x;
      const next = normalizeAngle(dragRef.current.rot - dx * 0.5);
      setRotation(next);
      paint(next);
    },
    [paint],
  );

  const onPointerUp = useCallback(() => {
    dragRef.current = null;
    setDragging(false);
  }, []);

  const facing = (() => {
    const a = normalizeAngle(rotation);
    if (a < 55 || a > 305) return 'Front';
    if (a >= 55 && a < 160) return 'Ingredients';
    if (a >= 160 && a < 250) return 'Claims & barcode';
    return 'Front';
  })();

  return (
    <div className={cn('flex w-full flex-col items-center', className)}>
      <div
        className={cn(
          'relative w-full touch-none select-none',
          compact ? 'max-w-[210px]' : 'max-w-[280px]',
          dragging ? 'cursor-grabbing' : 'cursor-grab',
        )}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <canvas
          ref={canvasRef}
          className="block h-auto w-full"
          style={{ aspectRatio: '3 / 5' }}
          aria-label={`Smooth white 200 mL bottle. Showing ${facing}. Drag to turn.`}
        />
        {!textureUrl && (
          <p className="absolute inset-0 flex items-center justify-center text-[10px] tracking-wide text-muted">
            Preparing label…
          </p>
        )}
      </div>

      <p
        className={cn(
          'mt-3 text-center tracking-wide text-muted',
          compact ? 'text-[10px]' : 'text-xs',
        )}
      >
        {facing}
        <span className="mx-2 opacity-40">·</span>
        Drag to turn the bottle
      </p>

      {!compact && (
        <div className="mt-5 flex w-full max-w-sm flex-col gap-3">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => {
                setSpinning(false);
                setRotation(8);
              }}
            >
              Front
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => {
                setSpinning(false);
                setRotation(120);
              }}
            >
              Ingredients
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => {
                setSpinning(false);
                setRotation(210);
              }}
            >
              Claims
            </Button>
            <Button
              type="button"
              size="sm"
              variant={spinning ? 'primary' : 'secondary'}
              onClick={() => setSpinning((s) => !s)}
            >
              {spinning ?
                <>
                  <Pause className="h-3.5 w-3.5" strokeWidth={1.5} />
                  Pause
                </>
              : <>
                  <Play className="h-3.5 w-3.5" strokeWidth={1.5} />
                  Spin
                </>
              }
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setSpinning(false);
                setRotation(8);
              }}
              aria-label="Reset"
            >
              <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Button>
          </div>

          <label className="flex items-center gap-3 px-1">
            <span className="shrink-0 text-[10px] uppercase tracking-[0.14em] text-muted">
              Turn
            </span>
            <input
              type="range"
              min={0}
              max={360}
              value={Math.round(rotation)}
              onChange={(e) => {
                setSpinning(false);
                const v = Number(e.target.value);
                setRotation(v);
                paint(v);
              }}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border accent-foreground"
            />
            <span className="w-10 shrink-0 text-right text-[10px] tabular-nums text-muted">
              {Math.round(rotation)}°
            </span>
          </label>
        </div>
      )}
    </div>
  );
}

/** Smooth matte bottle + cylindrical label projection (no faceted strips). */
function drawSmoothBottle(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  rotationDeg: number,
  texture: HTMLImageElement | null,
) {
  const cx = w / 2;
  // 200 mL proportions matching reference mock (compact cylinder + disc cap)
  const bodyTop = h * 0.145;
  const bodyBottom = h * 0.915;
  const bodyH = bodyBottom - bodyTop;
  const radius = w * 0.34;
  const shoulderY = bodyTop + bodyH * 0.028;
  const baseY = bodyBottom;

  // Soft ground shadow
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.1)';
  ctx.beginPath();
  ctx.ellipse(cx, h * 0.945, radius * 1.02, h * 0.014, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // ——— Cap (matte cream disc-top) ———
  const capH = h * 0.075;
  const capTop = bodyTop - capH * 0.88;
  const capR = radius * 0.97;

  const capGrad = ctx.createLinearGradient(cx - capR, 0, cx + capR, 0);
  capGrad.addColorStop(0, '#E4E1DA');
  capGrad.addColorStop(0.35, '#F4F2ED');
  capGrad.addColorStop(0.55, '#FFFEFB');
  capGrad.addColorStop(1, '#E2DFD8');
  ctx.fillStyle = capGrad;
  roundRect(ctx, cx - capR, capTop + capH * 0.22, capR * 2, capH * 0.88, 5);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(cx, capTop + capH * 0.26, capR, capR * 0.2, 0, 0, Math.PI * 2);
  const topGrad = ctx.createRadialGradient(
    cx - capR * 0.2,
    capTop,
    2,
    cx,
    capTop + capH * 0.26,
    capR,
  );
  topGrad.addColorStop(0, '#FFFFFF');
  topGrad.addColorStop(0.7, '#F1EFEA');
  topGrad.addColorStop(1, '#D9D6CF');
  ctx.fillStyle = topGrad;
  ctx.fill();

  ctx.fillStyle = 'rgba(0,0,0,0.06)';
  roundRect(ctx, cx - 12, capTop + capH * 0.48, 24, 7, 2);
  ctx.fill();

  // ——— Body ———
  ctx.beginPath();
  ctx.moveTo(cx - radius, shoulderY);
  ctx.quadraticCurveTo(cx - radius, bodyTop, cx, bodyTop);
  ctx.quadraticCurveTo(cx + radius, bodyTop, cx + radius, shoulderY);
  ctx.lineTo(cx + radius, baseY - 12);
  ctx.quadraticCurveTo(cx + radius, baseY, cx, baseY);
  ctx.quadraticCurveTo(cx - radius, baseY, cx - radius, baseY - 12);
  ctx.closePath();

  const bodyGrad = ctx.createLinearGradient(cx - radius, 0, cx + radius, 0);
  bodyGrad.addColorStop(0, '#D5D2CB');
  bodyGrad.addColorStop(0.2, BOTTLE_SURFACE);
  bodyGrad.addColorStop(0.48, '#FFFEFB');
  bodyGrad.addColorStop(0.78, BOTTLE_SURFACE);
  bodyGrad.addColorStop(1, '#D0CDC6');
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Soft matte sheen
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx - radius, shoulderY);
  ctx.quadraticCurveTo(cx - radius, bodyTop, cx, bodyTop);
  ctx.quadraticCurveTo(cx + radius, bodyTop, cx + radius, shoulderY);
  ctx.lineTo(cx + radius, baseY - 12);
  ctx.quadraticCurveTo(cx + radius, baseY, cx, baseY);
  ctx.quadraticCurveTo(cx - radius, baseY, cx - radius, baseY - 12);
  ctx.clip();
  const sheen = ctx.createLinearGradient(cx - radius * 0.65, 0, cx - radius * 0.05, 0);
  sheen.addColorStop(0, 'rgba(255,255,255,0)');
  sheen.addColorStop(0.5, 'rgba(255,255,255,0.28)');
  sheen.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = sheen;
  ctx.fillRect(cx - radius, bodyTop, radius * 0.55, bodyH);
  ctx.restore();

  // ——— Full-height wrap label projected on cylinder ———
  if (texture && texture.complete && texture.naturalWidth > 0) {
    const texW = texture.naturalWidth;
    const texH = texture.naturalHeight;
    // Label covers nearly the entire printable body (matches mock)
    const labelTop = bodyTop + bodyH * 0.02;
    const labelBottom = bodyBottom - bodyH * 0.02;
    const labelH = labelBottom - labelTop;
    const rot = (rotationDeg * Math.PI) / 180;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx - radius, shoulderY);
    ctx.quadraticCurveTo(cx - radius, bodyTop, cx, bodyTop);
    ctx.quadraticCurveTo(cx + radius, bodyTop, cx + radius, shoulderY);
    ctx.lineTo(cx + radius, baseY - 12);
    ctx.quadraticCurveTo(cx + radius, baseY, cx, baseY);
    ctx.quadraticCurveTo(cx - radius, baseY, cx - radius, baseY - 12);
    ctx.closePath();
    ctx.clip();

    // Dense columns → continuous wrap without strip seams
    const steps = Math.max(Math.ceil(radius * 3.2), 120);
    const colPitch = (radius * 2) / steps;
    for (let i = 0; i < steps; i++) {
      const x = cx - radius + (i + 0.5) * colPitch;
      const nx = (x - cx) / radius;
      if (nx <= -1 || nx >= 1) continue;

      const theta = Math.asin(Math.max(-1, Math.min(1, nx)));
      // Perspective foreshortening for cylinder
      const cosT = Math.cos(theta);
      let u = (rot + theta) / (Math.PI * 2);
      u = ((u % 1) + 1) % 1;

      const srcX = u * texW;
      const colW = Math.max((texW / steps) * 1.15, 1.2);
      const screenColW = colPitch / Math.max(cosT, 0.35) + 0.9;
      const edge = Math.pow(Math.abs(nx), 2.4);

      ctx.drawImage(
        texture,
        srcX,
        0,
        colW,
        texH,
        x - screenColW / 2,
        labelTop,
        screenColW,
        labelH,
      );

      if (edge > 0.15) {
        ctx.fillStyle = `rgba(35,32,28,${0.04 * edge})`;
        ctx.fillRect(x - screenColW / 2, labelTop, screenColW, labelH);
      }
    }
    ctx.restore();
  }
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}
