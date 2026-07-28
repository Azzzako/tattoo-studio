export default function AcceptInvitationPage({ params }: { params: { token: string } }) {
  return (
    <div className="container max-w-md py-16">
      <h1 className="font-display text-3xl font-semibold">Aceptar invitación</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Token: <code>{params.token}</code>
      </p>
    </div>
  );
}