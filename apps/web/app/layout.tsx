import './globals.css';
import type { Metadata, Viewport } from 'next';
import { gotham, bickham } from '@/app/fonts';
import { ThemeProvider } from '@/components/theme-provider';
import { GsapProvider } from '@/components/animations/gsap-provider';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? 'http://localhost:3000'),
  title: {
    default: 'Insigne Tattoo · Estudio de tatuajes en CDMX',
    template: '%s · Insigne Tattoo',
  },
  description:
    'Estudio de tatuajes en Ciudad de México. Reserva con tu tatuador favorito, conoce su portafolio y sincroniza tu cita con Google Calendar.',
  applicationName: 'Insigne Tattoo',
  authors: [{ name: 'Insigne Tattoo' }],
  keywords: ['tatuajes', 'estudio', 'CDMX', 'reservas', 'tatuadores', 'Insigne'],
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    siteName: 'Insigne Tattoo',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Insigne Tattoo',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX" data-theme="dark" className={`${gotham.variable} ${bickham.variable}`} suppressHydrationWarning>
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased grain">
        <ThemeProvider>
          <GsapProvider />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}