import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { readJsonBody } from '@/lib/api/json-request';
import { prisma } from '@/lib/db/prisma';
import { notifyOps } from '@/lib/ops/notifications';
import { applyRateLimit } from '@/lib/security/request-guards';

const schema = z.object({
  name: z.string().min(1).max(200).trim(),
  email: z.string().email().max(320),
  company: z.string().max(200).optional(),
  message: z.string().min(1).max(8000).trim(),
});

export async function POST(request: NextRequest) {
  const rateLimitError = await applyRateLimit(request, 15);
  if (rateLimitError) return rateLimitError;

  const raw = await readJsonBody(request);
  if (!raw.ok) return raw.response;

  const parsed = schema.safeParse(raw.data);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const submission = await prisma.formSubmission.create({
    data: {
      formType: 'contact',
      payload: parsed.data,
      status: 'NEW',
    },
  });
  await notifyOps('lead.new', { submissionId: submission.id, email: parsed.data.email });

  return NextResponse.json({ id: submission.id }, { status: 201 });
}
