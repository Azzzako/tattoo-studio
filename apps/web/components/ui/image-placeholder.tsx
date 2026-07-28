import { cn } from '@/lib/cn';

export interface ImagePlaceholderProps extends React.HTMLAttributes<HTMLDivElement> {
  seed?: string;
  alt?: string;
  ratio?: '1/1' | '4/5' | '3/4' | '4/3' | '16/9' | '2/3' | '3/2';
  overlay?: 'gold' | 'fade' | 'none';
}

/**
 * Placeholder de imagen con estética monocromática y grano.
 * Usa el servicio Lorem Picsum en desarrollo para no depender
 * de assets reales del estudio.
 */
export function ImagePlaceholder({
  seed = 'insigne',
  alt = '',
  ratio = '3/4',
  overlay = 'fade',
  className,
  ...props
}: ImagePlaceholderProps) {
  const sizes: Record<NonNullable<ImagePlaceholderProps['ratio']>, string> = {
    '1/1': 'aspect-square',
    '4/5': 'aspect-[4/5]',
    '3/4': 'aspect-[3/4]',
    '4/3': 'aspect-[4/3]',
    '16/9': 'aspect-video',
    '2/3': 'aspect-[2/3]',
    '3/2': 'aspect-[3/2]',
  };

  const overlayClass =
    overlay === 'gold'
      ? 'after:bg-gradient-to-tr after:from-gold/10 after:via-transparent after:to-gold/20'
      : overlay === 'fade'
        ? 'after:bg-gradient-to-b after:from-transparent after:via-transparent after:to-black/70'
        : '';

  const aspectMap: Record<NonNullable<ImagePlaceholderProps['ratio']>, number> = {
    '1/1': 1,
    '4/5': 1.25,
    '3/4': 1.333,
    '4/3': 0.75,
    '16/9': 1.778,
    '2/3': 1.5,
    '3/2': 0.667,
  };
  const aspect = aspectMap[ratio] ?? 1.333;
  const src = `https://picsum.photos/seed/${encodeURIComponent(seed)}/1200/${Math.round(1200 / aspect)}`;

  return (
    <div
      role={alt ? 'img' : 'presentation'}
      aria-label={alt || undefined}
      className={cn(
        'relative overflow-hidden bg-ink-900 after:absolute after:inset-0 after:content-[""]',
        sizes[ratio],
        overlayClass,
        className,
      )}
      {...props}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="h-full w-full object-cover grayscale contrast-110"
      />
    </div>
  );
}