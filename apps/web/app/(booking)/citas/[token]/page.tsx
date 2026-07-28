export default function ManageAppointmentPage({ params }: { params: { token: string } }) {
  return (
    <div className="container py-12">
      <h1 className="font-display text-3xl font-semibold">Tu cita</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        Token:{' '}
        <code className="bg-ink-100 dark:bg-ink-800 rounded px-1 py-0.5">{params.token}</code>
      </p>
    </div>
  );
}
