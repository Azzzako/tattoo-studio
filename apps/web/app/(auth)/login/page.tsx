'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setStatus('sending');
    setTimeout(() => setStatus('sent'), 600);
  };

  return (
    <div className="container flex max-w-sm flex-col gap-4 py-16">
      <h1 className="font-display text-3xl font-semibold">Acceder</h1>
      <p className="text-muted-foreground text-sm">
        Te enviaremos un enlace seguro por correo para iniciar sesión.
      </p>
      <form className="grid gap-3" onSubmit={onSubmit}>
        <Label htmlFor="email">Correo</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <Button type="submit" disabled={status === 'sending'}>
          {status === 'sent' ? 'Enlace enviado' : 'Enviar enlace'}
        </Button>
      </form>
      <Link href="/tatuadores" className="text-muted-foreground text-xs">
        Volver al sitio
      </Link>
    </div>
  );
}
