'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useActionState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateArtistAsAdmin, type AdminArtistResult } from '@/app/(admin)/admin/artists/actions';

const SCHEDULE_KINDS: Array<{ value: string; label: string }> = [
  { value: '', label: 'Sin definir' },
  { value: 'open_now', label: 'Agenda abierta' },
  { value: 'closes_in_weeks', label: 'Cierra pronto' },
  { value: 'waitlist_only', label: 'Solo lista de espera' },
  { value: 'by_request', label: 'Por solicitud' },
];

const schema = z.object({
  display_name: z.string().trim().min(2),
  headline: z.string().trim().max(160).optional().or(z.literal('')),
  bio: z.string().trim().max(2000).optional().or(z.literal('')),
  long_bio: z.string().trim().max(4000).optional().or(z.literal('')),
  specialties: z.string().trim().max(200).optional().or(z.literal('')),
  city: z.string().trim().max(120).optional().or(z.literal('')),
  years_active: z.string().optional().or(z.literal('')),
  schedule_kind: z.string().optional().or(z.literal('')),
  schedule_weeks: z.string().optional().or(z.literal('')),
  instagram: z
    .string()
    .trim()
    .max(60)
    .regex(/^[a-zA-Z0-9._-]*$/, 'Solo letras, números, "." "_" "-"')
    .optional()
    .or(z.literal('')),
  twitter: z
    .string()
    .trim()
    .max(60)
    .regex(/^[a-zA-Z0-9._-]*$/, 'Solo letras, números, "." "_" "-"')
    .optional()
    .or(z.literal('')),
  youtube: z
    .string()
    .trim()
    .max(60)
    .regex(/^[a-zA-Z0-9._-]*$/, 'Solo letras, números, "." "_" "-"')
    .optional()
    .or(z.literal('')),
  website: z
    .string()
    .trim()
    .max(200)
    .optional()
    .or(z.literal(''))
    .refine((v) => !v || /^https?:\/\//i.test(v), 'Debe iniciar con http:// o https://'),
});

type FormValues = z.infer<typeof schema>;

export interface AdminArtistFormInitial {
  artist_id: string;
  display_name: string;
  headline: string;
  bio: string;
  long_bio: string;
  specialties: string;
  city: string;
  years_active: string;
  schedule_kind: string;
  schedule_weeks: string;
  instagram: string;
  twitter: string;
  youtube: string;
  website: string;
  is_active: boolean;
  featured: boolean;
}

async function submitAction(
  _prev: AdminArtistResult | undefined,
  formData: FormData,
): Promise<AdminArtistResult | undefined> {
  const r = await updateArtistAsAdmin(formData);
  return r;
}

export function AdminArtistForm({ initial }: { initial: AdminArtistFormInitial }) {
  const [state, formAction, pending] = useActionState<AdminArtistResult | undefined, FormData>(
    submitAction,
    undefined,
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial,
    mode: 'onSubmit',
  });

  const scheduleKind = form.watch('schedule_kind');

  return (
    <form action={formAction} className="space-y-8" noValidate>
      <input type="hidden" name="artist_id" value={initial.artist_id} />

      <Card>
        <CardHeader>
          <CardTitle>Datos públicos</CardTitle>
          <CardDescription>Cambios se aplican inmediatamente. Sin aprobación.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="display_name">Nombre público</Label>
              <Input
                id="display_name"
                required
                {...form.register('display_name')}
                aria-invalid={form.formState.errors.display_name ? 'true' : undefined}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city">Ciudad</Label>
              <Input id="city" {...form.register('city')} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="headline">Headline</Label>
            <Input id="headline" {...form.register('headline')} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bio">Bio corta</Label>
            <textarea
              id="bio"
              rows={3}
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              {...form.register('bio')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="long_bio">Bio larga</Label>
            <textarea
              id="long_bio"
              rows={6}
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[140px] w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              {...form.register('long_bio')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="specialties">Especialidades (separadas por coma)</Label>
            <Input id="specialties" {...form.register('specialties')} />
          </div>

          <fieldset className="grid gap-4 border-t pt-6 sm:grid-cols-3">
            <legend className="text-sm font-medium sm:col-span-3">Experiencia y agenda</legend>

            <div className="space-y-1.5">
              <Label htmlFor="years_active">Años tatuando</Label>
              <Input
                id="years_active"
                type="number"
                inputMode="numeric"
                {...form.register('years_active')}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="schedule_kind">Tipo de agenda</Label>
              <select
                id="schedule_kind"
                className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                {...form.register('schedule_kind')}
              >
                {SCHEDULE_KINDS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {scheduleKind === 'closes_in_weeks' && (
              <div className="space-y-1.5">
                <Label htmlFor="schedule_weeks">Semanas restantes</Label>
                <Input
                  id="schedule_weeks"
                  type="number"
                  min={1}
                  max={52}
                  {...form.register('schedule_weeks')}
                />
              </div>
            )}
          </fieldset>

          <fieldset className="space-y-4 border-t pt-6">
            <legend className="text-sm font-medium">Redes sociales</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="instagram">Instagram (usuario)</Label>
                <Input id="instagram" {...form.register('instagram')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="twitter">Twitter / X (usuario)</Label>
                <Input id="twitter" {...form.register('twitter')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="youtube">YouTube (handle o canal)</Label>
                <Input id="youtube" {...form.register('youtube')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="website">Sitio web (URL completa)</Label>
                <Input id="website" {...form.register('website')} />
              </div>
            </div>
          </fieldset>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estado y visibilidad</CardTitle>
          <CardDescription>Cambios administrativos. Solo admin.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="is_active"
              defaultChecked={initial.is_active}
              className="h-4 w-4"
            />
            <span>Activo (visible en /tatuadores)</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={initial.featured}
              className="h-4 w-4"
            />
            <span>Destacado (badge "Destacado" en home y listado)</span>
          </label>
        </CardContent>
      </Card>

      {state?.ok === false && (
        <p role="alert" className="text-destructive text-sm">
          {state.message}
        </p>
      )}

      <div className="flex items-center justify-end gap-3 border-t pt-4">
        <Button asChild variant="ghost">
          <Link href="/admin/artists" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Cancelar
          </Link>
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  );
}
