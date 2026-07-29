'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useActionState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SuccessBanner } from '@/components/feedback/success-banner';
import { updateMyArtistProfile, type ProfileActionResult } from '@/app/cuenta/perfil/actions';

const schema = z.object({
  display_name: z.string().trim().min(2, 'Mínimo 2 caracteres').max(120),
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

export interface ProfileFormInitial {
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
}

const SCHEDULE_KINDS: Array<{ value: string; label: string }> = [
  { value: '', label: 'Sin definir' },
  { value: 'open_now', label: 'Agenda abierta' },
  { value: 'closes_in_weeks', label: 'Cierra pronto (en X semanas)' },
  { value: 'waitlist_only', label: 'Solo lista de espera' },
  { value: 'by_request', label: 'Por solicitud' },
];

export function ProfileForm({ initial }: { initial: ProfileFormInitial }) {
  const [state, formAction, pending] = useActionState<ProfileActionResult | undefined, FormData>(
    updateMyArtistProfile,
    undefined,
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial,
    mode: 'onSubmit',
  });

  const scheduleKind = form.watch('schedule_kind');

  if (state?.ok) {
    return (
      <SuccessBanner
        title="Perfil actualizado"
        description="Los cambios se reflejaron en tu perfil público."
      />
    );
  }

  return (
    <form action={formAction} className="space-y-6" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="display_name">Nombre público</Label>
          <Input
            id="display_name"
            required
            {...form.register('display_name')}
            aria-invalid={form.formState.errors.display_name ? 'true' : undefined}
          />
          {form.formState.errors.display_name && (
            <p role="alert" className="text-destructive text-xs">
              {form.formState.errors.display_name.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="city">Ciudad</Label>
          <Input id="city" placeholder="Ciudad de México" {...form.register('city')} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="headline">Headline (frase corta del home)</Label>
        <Input
          id="headline"
          placeholder="Geometría con intención."
          {...form.register('headline')}
        />
        {form.formState.errors.headline && (
          <p role="alert" className="text-destructive text-xs">
            {form.formState.errors.headline.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bio">Bio corta</Label>
        <textarea
          id="bio"
          rows={3}
          className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          {...form.register('bio')}
        />
        <p className="text-muted-foreground text-xs">Máx. 2000 caracteres.</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="long_bio">Bio larga (sección "Bio" del detalle)</Label>
        <textarea
          id="long_bio"
          rows={6}
          className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[140px] w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          {...form.register('long_bio')}
        />
        <p className="text-muted-foreground text-xs">Máx. 4000 caracteres.</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="specialties">Especialidades (separadas por coma)</Label>
        <Input
          id="specialties"
          placeholder="blackwork, fineline, lettering"
          {...form.register('specialties')}
        />
      </div>

      <fieldset className="grid gap-4 border-t pt-6 sm:grid-cols-3">
        <legend className="text-sm font-medium sm:col-span-3">Experiencia y agenda</legend>

        <div className="space-y-1.5">
          <Label htmlFor="years_active">Años tatuando</Label>
          <Input
            id="years_active"
            type="number"
            inputMode="numeric"
            min={0}
            max={80}
            placeholder="7"
            {...form.register('years_active')}
          />
          {form.formState.errors.years_active && (
            <p role="alert" className="text-destructive text-xs">
              {form.formState.errors.years_active.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="schedule_kind">Tipo de agenda</Label>
          <select
            id="schedule_kind"
            className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
              placeholder="3"
              {...form.register('schedule_weeks')}
            />
            {form.formState.errors.schedule_weeks && (
              <p role="alert" className="text-destructive text-xs">
                {form.formState.errors.schedule_weeks.message}
              </p>
            )}
          </div>
        )}
      </fieldset>

      <fieldset className="space-y-4 border-t pt-6">
        <legend className="text-sm font-medium">Redes sociales</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="instagram">Instagram (usuario)</Label>
            <Input id="instagram" placeholder="inka" {...form.register('instagram')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="twitter">Twitter / X (usuario)</Label>
            <Input id="twitter" placeholder="inka" {...form.register('twitter')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="youtube">YouTube (handle o canal)</Label>
            <Input id="youtube" placeholder="@inka" {...form.register('youtube')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="website">Sitio web (URL completa)</Label>
            <Input id="website" placeholder="https://inka.example" {...form.register('website')} />
          </div>
        </div>
      </fieldset>

      {state?.ok === false && (
        <p role="alert" className="text-destructive text-sm">
          {state.message}
        </p>
      )}

      <div className="flex items-center justify-end gap-3 border-t pt-4">
        <Button type="submit" disabled={pending}>
          {pending ? 'Guardando…' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  );
}
