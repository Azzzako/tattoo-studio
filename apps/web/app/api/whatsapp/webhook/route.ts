import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  if (!payload) return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  return new NextResponse(null, { status: 204 });
}

export async function GET() {
  return new NextResponse(null, { status: 204 });
}