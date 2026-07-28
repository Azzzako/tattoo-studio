import { Inter } from 'next/font/google';

/**
 * Tipografías del proyecto.
 *
 * Display: Bickham Script Pro (comercial, pendiente de licenciamiento).
 *   Mientras tanto se usa un stack caligráfico de sistema via CSS (`--font-display`).
 *
 * Sans: Gotham (comercial, pendiente de licenciamiento).
 *   Mientras tanto se usa Inter de Google Fonts, que comparte propósito geométrico.
 *
 * Cuando se depositen los archivos de licencia en `public/fonts/`,
 * reemplazar por `next/font/local` con `src: './fonts/BickhamScriptPro-Regular.woff2'`.
 */

export const gotham = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-gotham',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});

/**
 * Marcador para la display comercial. Usamos un CSS variable vacío y
 * dejamos que el CSS global aplique el stack caligráfico de sistema.
 */
export const bickham: { variable: string; className: string } = {
  variable: '--font-bickham',
  className: 'font-display',
};