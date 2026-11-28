import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      service: 'parton',
      version: '1.0.0-alpha',
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
