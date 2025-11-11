import { NextRequest } from 'next/server';
import { saveConfig, getLastConfig } from './pg';

export async function GET() {
  const config = await getLastConfig();
  return Response.json(config || {});
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await saveConfig(body);
    return Response.json({ success: true });
  } catch (err) {
    console.error('Erro ao salvar webhook config:', err);
    return Response.json({ success: false, error: String(err) }, { status: 500 });
  }
}
