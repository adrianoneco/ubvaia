import { NextRequest } from 'next/server';
import { getLastConfig } from '../webhook-config/pg';

export async function POST(req: NextRequest) {
  // Recebe evento e payload do frontend
  const { event, ...payload } = await req.json();
  const config = await getLastConfig();
  const webhook = config?.webhook || config;
  if (!webhook?.enabled || !webhook?.baseUrl) {
    return Response.json({ success: false, error: 'Webhook desabilitado ou URL não configurada' }, { status: 400 });
  }
  if (webhook.webhookByEvents && webhook.events && !webhook.events.includes(event)) {
    return Response.json({ success: false, error: 'Evento não permitido' }, { status: 403 });
  }
  let url = webhook.baseUrl;
  if (webhook.webhookByEvents) url += `/${event}`;
  if (webhook.webhookBase64 && payload.media) {
    payload.media = Buffer.from(payload.media).toString('base64');
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event, ...payload })
  });
  const result = await res.json().catch(() => ({}));
  return Response.json({ success: true, result });
}
