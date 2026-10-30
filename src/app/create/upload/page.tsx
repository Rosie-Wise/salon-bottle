'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { LogoUploader } from '@/components/create/logo-uploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDesignSessionStore } from '@/store/design-session';
import type { BrandAnalysis } from '@/lib/types';

export default function CreateUploadPage() {
  const router = useRouter();
  const setLogo = useDesignSessionStore((s) => s.setLogo);
  const setBrandAnalysis = useDesignSessionStore((s) => s.setBrandAnalysis);
  const setDesigns = useDesignSessionStore((s) => s.setDesigns);
  const setSalonName = useDesignSessionStore((s) => s.setSalonName);
  const setStep = useDesignSessionStore((s) => s.setStep);
  const salonName = useDesignSessionStore((s) => s.salonName);
  const logoDataUrl = useDesignSessionStore((s) => s.logoDataUrl);
  const logoFileName = useDesignSessionStore((s) => s.logoFileName);

  const [localLogo, setLocalLogo] = useState<string | null>(logoDataUrl);
  const [localFileName, setLocalFileName] = useState<string | null>(logoFileName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onLogoSelected = useCallback(
    (dataUrl: string, fileName: string) => {
      setLocalLogo(dataUrl);
      setLocalFileName(fileName);
      setLogo(dataUrl, fileName);
    },
    [setLogo],
  );

  async function handleContinue() {
    if (!localLogo || !localFileName) {
      setError('Please upload your salon logo to continue.');
      return;
    }
    setError(null);
    setLoading(true);
    setStep('logo');

    try {
      const uploadRes = await fetch('/api/logos/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl: localLogo, fileName: localFileName }),
      });
      if (!uploadRes.ok) {
        const body = await uploadRes.json().catch(() => ({}));
        throw new Error(body.error ?? 'Logo upload failed.');
      }
      const uploadJson = (await uploadRes.json()) as {
        publicUrl?: string | null;
        dataUrl?: string;
      };
      const logoUrl = uploadJson.publicUrl ?? uploadJson.dataUrl ?? localLogo;

      const analyzeRes = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageDataUrl: localLogo }),
      });
      if (!analyzeRes.ok) {
        const body = await analyzeRes.json().catch(() => ({}));
        throw new Error(body.error ?? 'Logo analysis failed.');
      }
      const analysis = (await analyzeRes.json()) as BrandAnalysis;
      setBrandAnalysis(analysis);

      const generateRes = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandAnalysis: analysis, logoUrl }),
      });
      if (!generateRes.ok) {
        const body = await generateRes.json().catch(() => ({}));
        throw new Error(body.error ?? 'Design generation failed.');
      }
      const { designs } = (await generateRes.json()) as {
        designs: Parameters<typeof setDesigns>[0];
      };
      setDesigns(designs);
      setStep('designs');
      router.push('/create/designs');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative mx-auto max-w-2xl px-6 py-16 md:px-10 md:py-24">
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-6 px-8 text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 className="h-10 w-10 text-foreground/70" strokeWidth={1} />
            </motion.div>
            <div>
              <p className="font-display text-2xl tracking-tight">
                Creating Your Custom Labels...
              </p>
              <p className="mt-3 max-w-sm text-sm text-muted">
                We&apos;re reading your palette and composing three directions
                tailored to your salon.
              </p>
            </div>
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-1.5 w-8 bg-foreground/20"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      )}

      <header className="mb-12 text-center md:text-left">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">RAD</p>
        <h1 className="mt-3 font-display text-3xl tracking-tight md:text-4xl">
          Let&apos;s Create Your Label
        </h1>
        <p className="mt-4 text-muted leading-relaxed">
          Upload your salon&apos;s logo and we&apos;ll create three personalized
          designs just for you.
        </p>
      </header>

      <LogoUploader
        onLogoSelected={onLogoSelected}
        initialPreview={localLogo}
        initialFileName={localFileName}
      />

      <div className="mt-8 space-y-2">
        <Label htmlFor="salon-name">Salon name (optional)</Label>
        <Input
          id="salon-name"
          value={salonName}
          onChange={(e) => setSalonName(e.target.value)}
          placeholder="Your salon name"
          className="bg-ivory"
        />
      </div>

      {error && (
        <p className="mt-6 text-sm text-red-800/90" role="alert">
          {error}
        </p>
      )}

      <div className="mt-10 flex justify-center md:justify-start">
        <Button
          type="button"
          size="lg"
          disabled={!localLogo || loading}
          onClick={handleContinue}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
