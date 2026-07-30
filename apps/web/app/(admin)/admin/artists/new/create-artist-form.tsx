'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Copy, Loader2 } from 'lucide-react';
import { useActionState, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SuccessBanner } from '@/components/feedback/success-banner';
import { createArtistAsAdmin, type CreateArtistResult } from '@/app/(admin)/admin/artists/actions';

const schema = z.object({
  display_name: z.string().trim().min(2, 'Mínimo 2 caracteres').max(120),
  email: z.string().trim().email('Email inválido'),
  phone_e164: z
    .string()
    .trim()
    .min(8)
    .regex(/^\+?[0-9\s()-]{8,20}$/, 'Solo dígitos, opcional +, espacios y guiones'),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, 'Solo letras minúsculas, números y guiones'),
  city: z.string().trim().max(120).optional().or(z.literal('')),
  specialties: z.string().trim().max(200).optional().or(z.literal('')),
  instagram: z.string().trim().max(60).optional().or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select-and-copy.
      const el = document.getElementById('magic-link-input') as HTMLInputElement | null;
      if (el) {
        el.select();
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };
  return (
    <div className="space-y-2">
      <Label htmlFor="magic-link-input">Magic link (single-use, expira 1h)</Label>
      <div className="flex items-center gap-2">
        <Input
          id="magic-link-input"
          readOnly
          value={url}
          onClick={(e) => (e.target as HTMLInputElement).select()}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCopy}
          className="flex items-center gap-2"
        >
          <Copy className="h-4 w-4" />
          {copied ? 'Copiado' : 'Copiar'}
        </Button>
      </div>
      <p className="text-muted-foreground text-xs">
        Sin SMTP configurado: este link no se envía por email. Compártelo con el artista (ej.
        WhatsApp del estudio) para que entre por primera vez.
      </p>
    </div>
  );
}

export function CreateArtistForm() {
  const [state, formAction, pending] = useActionState<CreateArtistResult | undefined, FormData>(
    createArtistAsAdmin,
    undefined,
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      display_name: '',
      email: '',
      phone_e164: '',
      slug: '',
      city: '',
      specialties: '',
      instagram: '',
    },
    mode: 'onSubmit',
  });

  if (state?.ok) {
    return (
      <div className="space-y-4">
        <SuccessBanner
          title="Tatuador creado"
          description="Comparte el magic link con el artista para que entre por primera vez."
        />
        <CopyLink url={state.magicLink} />
        <Button asChild variant="outline">
          <a href="/admin/artists">Volver al listado</a>
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="display_name">Nombre público *</Label>
          <Input
            id="display_name"
            required
            {...form.register('display_name')}
            placeholder="Lucía Vargas"
            aria-invalid={form.formState.errors.display_name ? 'true' : undefined}
          />
          {form.formState.errors.display_name && (
            <p role="alert" className="text-destructive text-xs">
              {form.formState.errors.display_name.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="slug">Slug (URL pública) *</Label>
          <Input
            id="slug"
            required
            {...form.register('slug')}
            placeholder="lucia"
            aria-invalid={form.formState.errors.slug ? 'true' : undefined}
          />
          {form.formState.errors.slug && (
            <p role="alert" className="text-destructive text-xs">
              {form.formState.errors.slug.message}
            </p>
          )}
          <p className="text-muted-foreground text-xs">
            letras minúsculas, números, guiones. Único en el estudio.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email (magic link) *</Label>
          <Input
            id="email"
            type="email"
            required
            {...form.register('email')}
            placeholder="lucia@estudio.com"
            aria-invalid={form.formState.errors.email ? 'true' : undefined}
          />
          {form.formState.errors.email && (
            <p role="alert" className="text-destructive text-xs">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone_e164">Teléfono (WhatsApp) *</Label>
          <Input
            id="phone_e164"
            type="tel"
            required
            inputMode="tel"
            {...form.register('phone_e164')}
            placeholder="+52 55 1234 5678"
            aria-invalid={form.formState.errors.phone_e164 ? 'true' : undefined}
          />
          {form.formState.errors.phone_e164 && (
            <p role="alert" className="text-destructive text-xs">
              {form.formState.errors.phone_e164.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="city">Ciudad</Label>
          <Input id="city" {...form.register('city')} placeholder="Ciudad de México" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="instagram">Instagram (usuario)</Label>
          <Input id="instagram" {...form.register('instagram')} placeholder="lucia" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="specialties">Especialidades (separadas por coma)</Label>
        <Input
          id="specialties"
          {...form.register('specialties')}
          placeholder="fineline, watercolor"
        />
      </div>

      {state?.ok === false && (
        <p role="alert" className="text-destructive shake text-sm">
          {state.message}
        </p>
      )}

      <div className="flex items-center justify-end gap-3 border-t pt-4">
        <Button type="submit" disabled={pending} className="flex items-center gap-2">
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Creando...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" /> Crear tatuador
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
