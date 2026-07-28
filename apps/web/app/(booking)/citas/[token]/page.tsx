export default function ManageAppointmentPage({ params }: { params: { token: string } }) {
  return (
    <div className="container py-12">
      <h1 className="font-display text-3xl font-semibold">Tu cita</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Token: <code className="rounded bg-ink-100 px-1 py-0.5 dark:bg-ink-800">{params.token}</code>
      </p>
    </div>
  );
}