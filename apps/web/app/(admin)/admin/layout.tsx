import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh grid-cols-1 md:grid-cols-[14rem_1fr]">
      <aside className="border-r bg-ink-50 p-4 dark:bg-ink-900">
        <h2 className="mb-4 font-display text-lg font-semibold">Admin</h2>
        <nav className="flex flex-col gap-2 text-sm">
          <Link href="/admin">Resumen</Link>
          <Link href="/admin/agenda">Agenda</Link>
          <Link href="/admin/tatuadores">Tatuadores</Link>
          <Link href="/admin/portafolio">Portafolio</Link>
          <Link href="/admin/eventos">Eventos</Link>
          <Link href="/admin/configuracion">Configuración</Link>
        </nav>
      </aside>
      <main className="p-6">{children}</main>
    </div>
  );
}