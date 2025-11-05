import { NextRequest, NextResponse } from 'next/server';

// Server-side webhook URL: prefer environment variable, fallback to localhost
const N8N_WEBHOOK_URL = 'http://n8n:5678/webhook/ia-agent';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Usa exclusivamente o webhookUrl enviado pelo frontend
    const webhookUrl = body.webhookUrl;

    if (!webhookUrl) {
      return NextResponse.json({
        type: 'text',
        error: 'Webhook não informado pelo frontend. Configure o webhook nas configurações.',
      }, { status: 400 });
    }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000); // 3s
    let res;
    try {
      res = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timeout);
      if (err instanceof Error && err.name === 'AbortError') {
        console.error('Timeout ao comunicar com n8n:', err);
        return NextResponse.json({ type: 'text', error: 'Timeout ao comunicar com n8n.' }, { status: 504 });
      }
      console.error('Erro de rede ao comunicar com n8n:', err);
      return NextResponse.json({ type: 'text', error: 'Erro de rede ao comunicar com n8n.' }, { status: 502 });
    }
    clearTimeout(timeout);
    let data;
    try {
      data = await res.json();
    } catch (err) {
      console.error('Erro ao interpretar resposta do webhook:', err);
      console.error('Resposta recebida:', await res.text());
      return NextResponse.json({ type: 'text', error: 'Resposta inválida do n8n.' }, { status: 502 });
    }
    // Ajuste para apresentar a resposta no chat
    if (data && data.output) {
      return NextResponse.json({
        type: 'text',
        output: data.output,
      }, { status: res.status });
    }

    // Caso não haja saída válida
    return NextResponse.json({
      type: 'text',
      error: 'Resposta do webhook não contém saída válida.',
    }, { status: 502 });
  } catch (error) {
    return NextResponse.json({ type: 'text', error: 'Erro ao comunicar com n8n.' }, { status: 500 });
  }
}
