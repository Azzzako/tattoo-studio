import Link from 'next/link';

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh grid-cols-1 md:grid-cols-[14rem_1fr]">
      <aside className="border-r bg-ink-950 p-4 text-ink-50">
        <h2 className="mb-4 font-display text-lg font-semibold">Plataforma</h2>
        <nav className="flex flex-col gap-2 text-sm">
          <Link href="/platform">Resumen</Link>
          <Link href="/platform/estudios">Estudios</Link>
          <Link href="/platform/admins">Administradores</Link>
          <Link href="/platform/soporte">Soporte</Link>
        </nav>
      </aside>
      <main className="p-6">{children}</main>
    </div>
  );
}