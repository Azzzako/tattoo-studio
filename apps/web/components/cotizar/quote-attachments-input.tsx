'use client';

import { Camera, X } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/cn';

interface QuoteAttachmentsInputProps {
  name: string;
  max?: number;
  onCountChange?: (count: number) => void;
}

const ACCEPT = 'image/jpeg,image/png,image/webp';

export function QuoteAttachmentsInput({
  name,
  max = 5,
  onCountChange,
}: QuoteAttachmentsInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = React.useState<string[]>([]);
  const [files, setFiles] = React.useState<File[]>([]);

  React.useEffect(() => {
    onCountChange?.(files.length);
  }, [files.length, onCountChange]);

  React.useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const list = event.currentTarget.files;
    if (!list) return;
    const next = Array.from(list).slice(0, max);
    previews.forEach((url) => URL.revokeObjectURL(url));
    setPreviews(next.map((file) => URL.createObjectURL(file)));
    setFiles(next);
  };

  const removeAt = (idx: number) => {
    previews.forEach((url) => URL.revokeObjectURL(url));
    const next = files.filter((_, i) => i !== idx);
    const nextPreviews = next.map((file) => URL.createObjectURL(file));
    setFiles(next);
    setPreviews(nextPreviews);
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept={ACCEPT}
        multiple
        className="hidden"
        onChange={onChange}
      />
      <div className="flex flex-wrap gap-3">
        {previews.map((url, idx) => (
          <div
            key={url}
            className="border-border bg-ink-900 relative h-20 w-20 overflow-hidden rounded-md border"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`Adjunto ${idx + 1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeAt(idx)}
              aria-label="Quitar imagen"
              className={cn(
                'bg-background/80 absolute right-1 top-1 rounded-full p-0.5',
                'hover:bg-background',
              )}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {files.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="border-border bg-ink-900 hover:border-gold/50 flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-md border border-dashed text-xs"
          >
            <Camera className="h-5 w-5" />
            Anadir
          </button>
        )}
      </div>
      <p className="text-muted-foreground text-xs">
        {files.length}/{max} imagenes (jpeg/png/webp, 8 MB c/u)
      </p>
    </div>
  );
}
