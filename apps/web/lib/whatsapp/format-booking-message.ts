export type BookingMessageArgs = {
  artistSlug: string;
  artistDisplayName: string;
  serviceName: string;
  dateIso: string;
  slot: string;
  customerName: string;
  phone: string;
  email: string | null;
  reference?: string | undefined;
};

export function formatBookingMessage(args: BookingMessageArgs): string {
  const lines: string[] = [
    `Hola, soy ${args.customerName}.`,
    `Quiero reservar con ${args.artistDisplayName}.`,
    `Servicio: ${args.serviceName}`,
    `Fecha: ${args.dateIso}`,
    `Hora: ${args.slot}`,
  ];
  if (args.reference) {
    lines.push(`Referencia: ${args.reference}`);
  }
  lines.push(`Tel: ${args.phone}`);
  if (args.email) lines.push(`Email: ${args.email}`);
  return lines.join('\n');
}
