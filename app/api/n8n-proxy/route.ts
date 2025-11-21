import { NextRequest, NextResponse } from 'next/server';
import { pool } from '../../../lib/session-db';

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
    // Enriquecer body com nome/telefone da sessão quando possível
    try {
      const sessionId = body?.session_id || body?.sessionId || body?.sessionId;
      if (sessionId) {
        try {
          const s = await pool.query('SELECT nome_completo, remote_jid FROM sessions WHERE id = $1 LIMIT 1', [sessionId]);
          if (s && (s.rowCount ?? 0) > 0) {
            const row = s.rows[0];
            if (!body.nome_completo && row.nome_completo) body.nome_completo = row.nome_completo;
            if (!body.remote_jid && row.remote_jid) body.remote_jid = row.remote_jid;
          }
        } catch (err) {
          console.error('Erro ao buscar sessão para enriquecer webhook proxy:', err);
        }
      }
    } catch (err) {
      // ignore
    }

    // Prepare outgoing body and ensure remoteId/nome fields are present for consumers
    const remoteId = body.remote_jid || body.whatsappNumber || undefined;
    const nome = body.nome_completo || body.userName || undefined;

    let res;
    try {
      res = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...body, remoteId, nome }),
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
