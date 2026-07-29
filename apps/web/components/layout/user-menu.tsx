'use client';

import { LogOut, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { signOut } from '@/lib/supabase/auth-actions';

interface UserMenuProps {
  email: string;
  displayName: string | null;
  role: 'admin' | 'artist' | 'customer';
  avatarUrl: string | null;
}

export function UserMenu({ email, displayName, role, avatarUrl }: UserMenuProps) {
  const [pending, startTransition] = React.useTransition();

  const onSignOut = () => {
    startTransition(async () => {
      await signOut();
    });
  };

  const initials = (displayName ?? email).slice(0, 2).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Cuenta" className="rounded-full">
          <Avatar>
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-xs font-semibold">{initials}</span>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-1">
          <span className="font-medium">{displayName ?? email}</span>
          <span className="text-muted-foreground text-xs">{email}</span>
          <span className="text-gold text-[0.6rem] font-medium uppercase tracking-wider">
            {role}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/cuenta" className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" /> Mi cuenta
          </Link>
        </DropdownMenuItem>
        {role === 'artist' && (
          <DropdownMenuItem asChild>
            <Link href="/cuenta/perfil" className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" /> Editar perfil
            </Link>
          </DropdownMenuItem>
        )}
        {(role === 'admin' || role === 'artist') && (
          <DropdownMenuItem asChild>
            <Link href="/admin" className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" /> Panel
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            onSignOut();
          }}
          disabled={pending}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          {pending ? 'Cerrando…' : 'Cerrar sesión'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
