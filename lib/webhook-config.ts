export async function getWebhookConfig() {
  const res = await fetch('/api/webhook-config');
  if (!res.ok) return null;
  return await res.json();
}

export async function sendWebhookEvent(event: string, payload: any) {
  const config = await getWebhookConfig();
  if (!config?.enabled) return;
  if (config.webhookByEvents && config.events && !config.events.includes(event)) return;
  if (!config.baseUrl) return;

  let url = config.baseUrl;
  if (config.webhookByEvents) url += `/${event}`;

  // Se for base64, incluir no payload
  if (config.webhookBase64 && payload.media) {
    payload.media = btoa(payload.media);
  }

  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event, ...payload })
  });
}
