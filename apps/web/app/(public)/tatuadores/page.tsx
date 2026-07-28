import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ArtistsPage() {
  const artists = [
    { slug: 'inka', name: 'Inka', styles: 'Blackwork · Dotwork' },
    { slug: 'mara', name: 'Mara', styles: 'Color · Fine-line' },
  ];
  return (
    <div className="container py-12">
      <h1 className="mb-8 font-display text-4xl font-semibold">Tatuadores</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {artists.map((artist) => (
          <Link key={artist.slug} href={`/tatuadores/${artist.slug}`}>
            <Card>
              <CardHeader>
                <CardTitle>{artist.name}</CardTitle>
                <CardDescription>{artist.styles}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}