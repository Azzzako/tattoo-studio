import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { requireAdmin } from '@/lib/supabase/guards';

import { CreateArtistForm } from './create-artist-form';

export const dynamic = 'force-dynamic';

export default async function NewArtistPage() {
  await requireAdmin();

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/artists" className="flex items-center gap-2">
            <ArrowLeft className="h-3.5 w-3.5" /> Volver
          </Link>
        </Button>
        <h1 className="font-display flex items-center gap-2 text-3xl">
          <Plus className="text-gold h-6 w-6" /> Nuevo tatuador
        </h1>
        <p className="text-muted-foreground text-sm">
          Crea el usuario en Supabase Auth, su perfil y su fila de tatuador. Te devolvemos un magic
          link que puedes compartirle por WhatsApp.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Datos del tatuador</CardTitle>
          <CardDescription>
            El slug es la URL pública (ej. <code>/tatuadores/inka</code>). El email recibe el magic
            link de acceso.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateArtistForm />
        </CardContent>
      </Card>
    </div>
  );
}
