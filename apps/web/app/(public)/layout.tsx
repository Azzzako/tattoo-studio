import Link from 'next/link';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="border-b">
        <nav className="container flex h-14 items-center justify-between">
          <Link href="/" className="font-display text-lg font-semibold">
            Tattoo Studio
          </Link>
          <ul className="flex items-center gap-4 text-sm">
            <li>
              <Link href="/tatuadores">Tatuadores</Link>
            </li>
            <li>
              <Link href="/eventos">Eventos</Link>
            </li>
            <li>
              <Link href="/login" className="rounded-md border px-3 py-1">
                Acceder
              </Link>
            </li>
          </ul>
        </nav>
      </header>
      {children}
      <footer className="border-t py-8 text-sm text-muted-foreground">
        <div className="container flex justify-between">
          <p>© {new Date().getFullYear()} Tattoo Studio</p>
          <p>México · Reservas sujetas a disponibilidad.</p>
        </div>
      </footer>
    </div>
  );
}