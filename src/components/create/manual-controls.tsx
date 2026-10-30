'use client';

import type { DesignConfig, FontFamily } from '@/lib/types';
import { useDesignSessionStore } from '@/store/design-session';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface ManualControlsProps {
  config?: DesignConfig | null;
  onUpdate?: (partial: Partial<DesignConfig>) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onReset?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  className?: string;
}

const FONT_OPTIONS: { value: FontFamily; label: string }[] = [
  { value: 'serif', label: 'Serif' },
  { value: 'sans', label: 'Sans' },
  { value: 'elegant', label: 'Elegant' },
];

export function ManualControls(props: ManualControlsProps) {
  const store = useDesignSessionStore();
  const config = props.config ?? store.currentConfig;
  const onUpdate = props.onUpdate ?? store.updateConfig;
  const onUndo = props.onUndo ?? store.undo;
  const onRedo = props.onRedo ?? store.redo;
  const onReset = props.onReset ?? store.resetConfig;

  const historyIndex = props.canUndo !== undefined ? undefined : store.historyIndex;
  const historyLen = store.configHistory.length;
  const canUndo =
    props.canUndo ??
    (historyIndex !== undefined && historyIndex > 0);
  const canRedo =
    props.canRedo ??
    (historyIndex !== undefined && historyIndex < historyLen - 1);

  if (!config) {
    return (
      <p className={cn('text-sm text-muted', props.className)}>
        Select a design to adjust colors and typography.
      </p>
    );
  }

  return (
    <div className={cn('space-y-8', props.className)}>
      <div className="grid gap-6 sm:grid-cols-2">
        <ColorField
          label="Background"
          value={config.backgroundColor}
          onChange={(v) => onUpdate({ backgroundColor: v })}
        />
        <ColorField
          label="Text"
          value={config.textColor}
          onChange={(v) => onUpdate({ textColor: v })}
        />
      </div>

      <div className="space-y-4">
        <SliderField
          label="Logo size"
          min={0.4}
          max={1.2}
          step={0.05}
          value={config.logoScale}
          display={`${Math.round(config.logoScale * 100)}%`}
          onChange={(v) => onUpdate({ logoScale: v })}
        />
        <SliderField
          label="Logo vertical position"
          min={-24}
          max={24}
          step={1}
          value={config.logoOffsetY}
          display={`${config.logoOffsetY}px`}
          onChange={(v) => onUpdate({ logoOffsetY: v })}
        />
        <SliderField
          label="Logo horizontal position"
          min={-20}
          max={20}
          step={1}
          value={config.logoOffsetX}
          display={`${config.logoOffsetX}px`}
          onChange={(v) => onUpdate({ logoOffsetX: v })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="font-family">Typeface</Label>
        <select
          id="font-family"
          value={config.fontFamily}
          onChange={(e) =>
            onUpdate({ fontFamily: e.target.value as FontFamily })
          }
          className="flex h-11 w-full border border-border bg-ivory px-4 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground/25"
        >
          {FONT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={!canUndo}
          onClick={onUndo}
        >
          Undo
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={!canRedo}
          onClick={onRedo}
        >
          Redo
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onReset}>
          Reset design
        </Button>
      </div>
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={normalizeHex(value)}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-12 cursor-pointer border border-border bg-transparent p-1"
          aria-label={`${label} color`}
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="font-mono text-xs uppercase"
        />
      </div>
    </div>
  );
}

function SliderField({
  label,
  min,
  max,
  step,
  value,
  display,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  display: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="text-xs text-muted tabular-nums">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="h-1 w-full cursor-pointer appearance-none bg-border accent-foreground"
      />
    </div>
  );
}

function normalizeHex(hex: string): string {
  if (/^#[0-9A-Fa-f]{6}$/.test(hex)) return hex;
  return '#F7F4EF';
}
