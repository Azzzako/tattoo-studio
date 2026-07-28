import './globals.css';
import type { Metadata, Viewport } from 'next';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? 'http://localhost:3000'),
  title: {
    default: 'Tattoo Studio',
    template: '%s · Tattoo Studio',
  },
  description:
    'Estudio de tatuajes con reserva online, portafolio de artistas, eventos y sincronización con tu calendario.',
  applicationName: 'Tattoo Studio',
  authors: [{ name: 'Tattoo Studio' }],
  keywords: ['tatuajes', 'estudio', 'reservas', 'tatuadores'],
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    siteName: 'Tattoo Studio',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0b0d12' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX" suppressHydrationWarning>
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}