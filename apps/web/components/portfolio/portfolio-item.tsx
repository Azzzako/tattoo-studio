import { Badge } from '@/components/ui/badge';
import { ImagePlaceholder } from '@/components/ui/image-placeholder';
import type { ImagePlaceholderProps } from '@/components/ui/image-placeholder';
import { cn } from '@/lib/cn';

interface PortfolioItemProps {
  seed: string;
  title: string;
  styles?: string[];
  alt?: string;
  ratio?: ImagePlaceholderProps['ratio'];
  storagePath?: string | null;
}

const RATIO_TO_CLASS: Record<NonNullable<PortfolioItemProps['ratio']>, string> = {
  '1/1': 'aspect-square',
  '4/5': 'aspect-[4/5]',
  '3/4': 'aspect-[3/4]',
  '4/3': 'aspect-[4/3]',
  '16/9': 'aspect-video',
  '2/3': 'aspect-[2/3]',
  '3/2': 'aspect-[3/2]',
};

/**
 * Pieza del portafolio. Si recibe storagePath renderiza esa imagen real;
 * si no, cae al ImagePlaceholder con el seed (modo demo).
 * El figure mantiene la proporción, la imagen hace zoom al hover y la
 * metadata es visible en hover, focus y siempre en touch.
 */
export function PortfolioItem({
  seed,
  title,
  styles,
  alt,
  ratio = '3/4',
  storagePath,
}: PortfolioItemProps) {
  return (
    <figure
      className={cn(
        'border-border bg-ink-900 group relative overflow-hidden border',
        RATIO_TO_CLASS[ratio],
      )}
    >
      <div className="absolute inset-0 transition-transform duration-700 ease-out group-focus-within:scale-105 group-hover:scale-105">
        {storagePath ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={storagePath}
            alt={alt ?? title}
            className="contrast-110 h-full w-full object-cover"
          />
        ) : (
          <ImagePlaceholder seed={seed} ratio={ratio} alt={alt ?? title} overlay="fade" />
        )}
      </div>
      <figcaption
        className={cn(
          'pointer-events-none absolute inset-x-0 bottom-0 translate-y-0 p-5 opacity-100 transition-all duration-500 ease-out',
          'md:translate-y-4 md:opacity-0 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100 md:group-hover:translate-y-0 md:group-hover:opacity-100',
        )}
      >
        <p className="font-display text-foreground text-xl leading-tight">{title}</p>
        {styles && styles.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {styles.map((style) => (
              <Badge key={style} variant="default" className="text-[0.55rem]">
                {style}
              </Badge>
            ))}
          </div>
        )}
      </figcaption>
    </figure>
  );
}
