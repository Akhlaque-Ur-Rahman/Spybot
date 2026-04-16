import { NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/api/admin';

export async function GET() {
  const auth = await requireApiRole();
  if (auth.error) return auth.error;
  return NextResponse.json({ user: auth.session.user });
}
