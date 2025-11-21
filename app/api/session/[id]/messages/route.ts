import { NextResponse } from 'next/server';
import { getMessagesBySession } from '../../../../../lib/session-api';

export async function GET(req: Request, context: any = {}) {
  const params = (context?.params instanceof Promise) ? await context.params : context?.params;
  try {
    // Try params first (framework-provided). If missing, parse from URL as fallback.
    let sessionId = params?.id;
    if (!sessionId) {
      try {
        const url = new URL(req.url);
        const parts = url.pathname.split('/').filter(Boolean);
        // Expecting [..., 'api', 'session', '{id}', 'messages']
        const idx = parts.findIndex(p => p === 'session');
        if (idx >= 0 && parts.length > idx + 1) {
          sessionId = parts[idx + 1];
        }
      } catch (e) {
        // ignore URL parse errors
      }
    }

    if (!sessionId) {
      // Return empty array (200) rather than 400 so UI can show "Nenhuma mensagem" gracefully.
      return NextResponse.json([]);
    }

    const messages = await getMessagesBySession(sessionId);
    return NextResponse.json(messages || []);
  } catch (err: any) {
    console.error('Error in GET /api/session/[id]/messages:', err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
