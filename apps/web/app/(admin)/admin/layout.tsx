import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh grid-cols-1 md:grid-cols-[14rem_1fr]">
      <aside className="bg-ink-50 dark:bg-ink-900 border-r p-4">
        <h2 className="font-display mb-4 text-lg font-semibold">Admin</h2>
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
