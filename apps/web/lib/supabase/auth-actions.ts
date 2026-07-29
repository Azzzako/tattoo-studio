'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { createSupabaseServerClient } from './server';

const emailSchema = z.string().trim().email('Correo inválido');

const siteUrl = () =>
  process.env.NEXT_PUBLIC_SITE_URL ?? process.env.APP_URL ?? 'http://localhost:3000';

function redirectTo(after: string | undefined): string {
  const base = siteUrl();
  const target = after && after.startsWith('/') ? after : '/cuenta';
  return `${base}${target}`;
}

export type ActionResult = { ok: true } | { ok: false; message: string };

export async function signInWithMagicLink(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = emailSchema.safeParse(formData.get('email'));
  if (!parsed.success) {
    return { ok: false, message: 'Ingresa un correo válido.' };
  }

  const after = formData.get('after');
  const callback = `${siteUrl()}/auth/callback`;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data,
    options: {
      emailRedirectTo: callback,
      shouldCreateUser: false,
    },
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  void after;
  return { ok: true };
}

export async function signUpWithMagicLink(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = emailSchema.safeParse(formData.get('email'));
  if (!parsed.success) {
    return { ok: false, message: 'Ingresa un correo válido.' };
  }

  const callback = `${siteUrl()}/auth/callback`;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data,
    options: {
      emailRedirectTo: callback,
      shouldCreateUser: true,
    },
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true };
}

export async function signInWithPassword(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = z
    .object({
      email: emailSchema,
      password: z.string().min(8, 'Mínimo 8 caracteres'),
    })
    .safeParse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, message: first?.message ?? 'Datos inválidos' };
  }

  const after = formData.get('after');
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { ok: false, message: 'Credenciales inválidas.' };
  }

  revalidatePath('/', 'layout');
  redirect(redirectTo(typeof after === 'string' ? after : undefined));
}

export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}
