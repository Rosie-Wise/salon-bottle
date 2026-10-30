'use client';

import { useRef, useEffect, useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface AiChatProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSend: (message: string) => void;
  className?: string;
}

export function AiChat({ messages, isLoading, onSend, className }: AiChatProps) {
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, isLoading]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setDraft('');
  }

  return (
    <div
      className={cn(
        'flex flex-col border border-border/80 bg-ivory/40',
        className,
      )}
    >
      <div className="border-b border-border/70 px-5 py-4">
        <h2 className="font-display text-xl tracking-tight">Make It Yours</h2>
        <p className="mt-1 text-xs text-muted">
          Tell us what to change—your preview updates instantly.
        </p>
      </div>
      <div
        ref={scrollRef}
        className="flex max-h-[320px] min-h-[200px] flex-1 flex-col gap-4 overflow-y-auto p-5"
      >
        {messages.length === 0 && (
          <p className="text-sm leading-relaxed text-muted">
            Describe the mood, colors, or copy you want—e.g. &ldquo;Make the
            background warmer and shorten the tagline.&rdquo;
          </p>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              'max-w-[90%] text-sm leading-relaxed',
              msg.role === 'user' ?
                'ml-auto bg-foreground text-background px-4 py-3'
              : 'mr-auto border border-border/60 bg-cream px-4 py-3 text-foreground',
            )}
          >
            {msg.content}
          </div>
        ))}
        {isLoading && (
          <div className="mr-auto flex items-center gap-2 border border-border/60 bg-cream px-4 py-3 text-sm text-muted">
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
            Refining your label…
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 border-t border-border/70 p-4 sm:flex-row sm:items-end"
      >
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="What would you like to change?"
          rows={2}
          className="min-h-[72px] flex-1 resize-none bg-ivory"
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <Button
          type="submit"
          disabled={!draft.trim() || isLoading}
          className="shrink-0 sm:w-auto w-full"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" strokeWidth={1.5} />
          Send
        </Button>
      </form>
    </div>
  );
}
