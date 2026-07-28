export const tzPresets = {
  'America/Mexico_City': 'es-MX',
  'America/Bogota': 'es-CO',
  'America/Buenos_Aires': 'es-AR',
  'America/Santiago': 'es-CL',
  'Europe/Madrid': 'es-ES',
} as const;

export type TzPresetKey = keyof typeof tzPresets;