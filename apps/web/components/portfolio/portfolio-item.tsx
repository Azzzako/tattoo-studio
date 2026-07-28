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
 * Pieza individual del portafolio. Muestra una imagen con metadata
 * (título, estilos) y un overlay oscuro al hover.
 */
export function PortfolioItem({ seed, title, styles, alt, ratio = '3/4' }: PortfolioItemProps) {
  return (
    <figure className="group relative overflow-hidden border border-border bg-ink-900">
      <ImagePlaceholder seed={seed} ratio={ratio} alt={alt ?? title} overlay="fade" />
      <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-5 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div>
          <p className="font-display text-xl leading-tight text-foreground">{title}</p>
          {styles && styles.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {styles.map((style) => (
                <Badge key={style} variant="default" className="text-[0.55rem]">
                  {style}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </figcaption>
    </figure>
  );
}