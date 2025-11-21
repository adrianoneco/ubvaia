import { NextResponse } from 'next/server';

export async function POST() {
	// Minimal placeholder: clear session/token in real app
	return NextResponse.json({ ok: true });
}

export async function GET() {
	return NextResponse.json({ ok: false, message: 'GET not supported on this route' }, { status: 405 });
}
