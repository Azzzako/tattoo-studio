import Link from 'next/link';

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh grid-cols-1 md:grid-cols-[14rem_1fr]">
      <aside className="bg-ink-950 text-ink-50 border-r p-4">
        <h2 className="font-display mb-4 text-lg font-semibold">Plataforma</h2>
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
