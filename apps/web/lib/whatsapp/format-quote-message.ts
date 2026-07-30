export type QuoteMessageArgs = {
  artistSlug: string | null;
  artistDisplayName: string | null;
  customerName: string;
  phone: string;
  email: string | null;
  idea: string;
  budgetCents: number | null;
  attachmentUrls: string[];
  studioName?: string;
};

const currency = (cents: number): string =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cents / 100);

export function formatQuoteMessage(args: QuoteMessageArgs): string {
  const lines: string[] = [];
  const greeting = args.artistDisplayName
    ? `Hola, soy ${args.customerName}. Quiero cotizar con ${args.artistDisplayName}.`
    : `Hola, soy ${args.customerName}. Quiero cotizar un tatuaje.`;
  lines.push(greeting);

  if (args.studioName) lines.push(`Estudio: ${args.studioName}`);

  lines.push('');
  lines.push('Idea:');
  lines.push(args.idea);

  if (args.budgetCents !== null) {
    lines.push('');
    lines.push(`Presupuesto aproximado: ${currency(args.budgetCents)}`);
  }

  if (args.attachmentUrls.length > 0) {
    lines.push('');
    lines.push('Referencias:');
    for (const url of args.attachmentUrls) lines.push(url);
  }

  lines.push('');
  lines.push(`Tel: ${args.phone}`);
  if (args.email) lines.push(`Email: ${args.email}`);

  return lines.join('\n');
}
