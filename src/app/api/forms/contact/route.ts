import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { notifyOps } from '@/lib/ops/notifications';

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  company: z.string().optional(),
  message: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json());
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
