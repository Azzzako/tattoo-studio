import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

import CallbackClient from './client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function Fallback() {
  return (
    <div className="bg-background flex min-h-dvh flex-col items-center justify-center gap-3">
      <Loader2 className="text-gold h-6 w-6 animate-spin" aria-hidden="true" />
      <p className="text-muted-foreground text-sm">Cargando…</p>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<Fallback />}>
      <CallbackClient />
    </Suspense>
  );
}
