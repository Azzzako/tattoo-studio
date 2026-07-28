export interface ResendConfig {
  apiKey: string;
  from: string;
}

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export class EmailClient {
  constructor(private readonly config: ResendConfig) {}

  async send(message: EmailPayload) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: this.config.from,
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text ?? '',
        reply_to: message.replyTo,
      }),
    });
    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`resend_send_failed: ${res.status} ${detail}`);
    }
    return (await res.json()) as { id: string };
  }
}