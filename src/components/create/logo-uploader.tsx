'use client';

import { useCallback, useState } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { ImagePlus, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const ACCEPT = {
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/svg+xml': ['.svg'],
  'image/webp': ['.webp'],
} as const;

const MAX_BYTES = 5 * 1024 * 1024;

export interface LogoUploaderProps {
  onLogoSelected: (dataUrl: string, fileName: string) => void;
  initialPreview?: string | null;
  initialFileName?: string | null;
  className?: string;
}

export function LogoUploader({
  onLogoSelected,
  initialPreview = null,
  initialFileName = null,
  className,
}: LogoUploaderProps) {
  const [preview, setPreview] = useState<string | null>(initialPreview);
  const [fileName, setFileName] = useState<string | null>(initialFileName);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (accepted: File[], rejected: FileRejection[]) => {
      setError(null);
      if (rejected.length > 0) {
        setError(rejected[0]?.errors[0]?.message ?? 'File could not be accepted.');
        return;
      }
      const file = accepted[0];
      if (!file) return;
      if (file.size > MAX_BYTES) {
        setError('Logo must be 5 MB or smaller.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setPreview(dataUrl);
        setFileName(file.name);
        onLogoSelected(dataUrl, file.name);
      };
      reader.onerror = () => setError('Could not read that file.');
      reader.readAsDataURL(file);
    },
    [onLogoSelected],
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: ACCEPT,
    maxFiles: 1,
    maxSize: MAX_BYTES,
    noClick: !!preview,
  });

  return (
    <div className={cn('space-y-4', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'relative flex min-h-[220px] cursor-pointer flex-col items-center justify-center border border-dashed border-border bg-cream/80 px-6 py-10 text-center transition-colors',
          isDragActive && 'border-foreground/40 bg-ivory',
          preview && 'cursor-default min-h-[280px]',
        )}
      >
        <input {...getInputProps()} aria-label="Upload salon logo" />

        {preview ?
          <div className="flex w-full max-w-xs flex-col items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Logo preview"
              className="max-h-40 max-w-full object-contain"
            />
            {fileName && (
              <p className="text-xs text-muted truncate max-w-full">{fileName}</p>
            )}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                open();
              }}
            >
              Replace logo
            </Button>
          </div>
        : <>
            <Upload className="mb-4 h-8 w-8 text-muted" strokeWidth={1.25} />
            <p className="font-display text-lg text-foreground">
              Drop your logo here
            </p>
            <p className="mt-2 max-w-sm text-sm text-muted">
              PNG, JPG, SVG, or WEBP · max 5 MB · transparent PNG recommended
            </p>
            <Button type="button" variant="secondary" size="sm" className="mt-6">
              Browse files
            </Button>
          </>
        }
      </div>

      {error && (
        <p className="flex items-center gap-2 text-sm text-red-800/90" role="alert">
          <ImagePlus className="h-4 w-4 shrink-0" strokeWidth={1.5} />
          {error}
        </p>
      )}
    </div>
  );
}
