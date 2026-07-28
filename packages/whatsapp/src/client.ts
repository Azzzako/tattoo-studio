export interface WhatsAppConfig {
  phoneId: string;
  accessToken: string;
  apiBase?: string;
  locale?: string;
}

export interface TemplateMessage {
  to: string;
  template: string;
  languageCode?: string;
  variables: string[];
}

const ENDPOINT = (cfg: WhatsAppConfig, phoneNumber: string) =>
  `${cfg.apiBase ?? 'https://graph.facebook.com/v22.0'}/${phoneNumber}/messages`;

export class WhatsAppClient {
  constructor(private readonly config: WhatsAppConfig) {}

  async sendTemplate(message: TemplateMessage) {
    const url = ENDPOINT(this.config, this.config.phoneId);
    const body = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: message.to,
      type: 'template',
      template: {
        name: message.template,
        language: { code: message.languageCode ?? this.config.locale ?? 'es_MX' },
        components: message.variables.length
          ? [
              {
                type: 'body',
                parameters: message.variables.map((text) => ({ type: 'text', text })),
              },
            ]
          : [],
      },
    };
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`whatsapp_send_failed: ${res.status} ${err}`);
    }
    return (await res.json()) as { messages: Array<{ id: string }> };
  }
}