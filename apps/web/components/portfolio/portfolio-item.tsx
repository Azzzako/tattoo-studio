import { Badge } from '@/components/ui/badge';
import { ImagePlaceholder } from '@/components/ui/image-placeholder';
import type { ImagePlaceholderProps } from '@/components/ui/image-placeholder';

interface PortfolioItemProps {
  seed: string;
  title: string;
  styles?: string[];
  alt?: string;
  ratio?: ImagePlaceholderProps['ratio'];
}

/**
 * Pieza individual del portafolio. La imagen hace zoom al hover
 * y la metadata sube desde abajo con fade.
 */
export function PortfolioItem({ seed, title, styles, alt, ratio = '3/4' }: PortfolioItemProps) {
  return (
    <figure className="border-border bg-ink-900 group relative overflow-hidden border">
      <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105">
        <ImagePlaceholder seed={seed} ratio={ratio} alt={alt ?? title} overlay="fade" />
      </div>
      <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-4 p-5 opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100">
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
