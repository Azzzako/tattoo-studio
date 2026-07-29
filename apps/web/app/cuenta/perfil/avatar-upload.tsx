'use client';

import { Camera, Loader2 } from 'lucide-react';
import { useActionState, useRef } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { uploadAvatar, type ProfileActionResult } from '@/app/cuenta/perfil/actions';

export function AvatarUpload({ initialUrl }: { initialUrl: string | null }) {
  const [state, formAction, pending] = useActionState<ProfileActionResult | undefined, FormData>(
    uploadAvatar,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  if (state?.ok) {
    return (
      <div className="space-y-2">
        <Avatar className="h-32 w-32">
          {initialUrl ? <AvatarImage src={initialUrl} alt="Tu avatar" /> : null}
          <AvatarFallback>
            <Camera className="text-muted-foreground h-10 w-10" aria-hidden="true" />
          </AvatarFallback>
        </Avatar>
        <p className="text-gold text-sm">Avatar actualizado. Refresca para verlo.</p>
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        name="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={() => formRef.current?.requestSubmit()}
      />
      <div className="flex flex-col items-start gap-3">
        <Avatar className="h-32 w-32">
          {initialUrl ? <AvatarImage src={initialUrl} alt="Tu avatar" /> : null}
          <AvatarFallback>
            <Camera className="text-muted-foreground h-10 w-10" aria-hidden="true" />
          </AvatarFallback>
        </Avatar>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={pending}
          className="flex items-center gap-2"
        >
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Subiendo…
            </>
          ) : (
            <>
              <Camera className="h-4 w-4" /> Cambiar foto
            </>
          )}
        </Button>
        <p className="text-muted-foreground text-xs">JPG/PNG/WebP · máx. 5 MB</p>
        {state?.ok === false && (
          <p role="alert" className="text-destructive text-xs">
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
