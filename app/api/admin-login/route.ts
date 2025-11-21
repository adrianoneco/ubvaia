import { NextResponse } from 'next/server';

export async function GET() {
	return NextResponse.json({ ok: false, message: 'GET not supported on this route' }, { status: 405 });
}

export async function POST(req: Request) {
	try {
		const body = await req.json();
		// Minimal placeholder: in real app validate credentials
		if (body?.username && body?.password) {
			return NextResponse.json({ ok: true, token: null });
		}
		return NextResponse.json({ ok: false, error: 'Missing credentials' }, { status: 400 });
	} catch (err) {
		console.error('POST /api/admin-login error:', err);
		return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
	}
}
