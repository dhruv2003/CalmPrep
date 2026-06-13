import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sendGuardianEmail } from '@/lib/guardian-email';

const guardianAlertSchema = z.object({
  userId: z.string().min(1),
  studentName: z.string().optional(),
  guardianName: z.string().optional(),
  guardianRelationship: z.string().optional(),
  guardianEmail: z.string().email(),
  language: z.enum(['en', 'hi', 'mr']),
  riskLevel: z.enum(['high', 'urgent']),
  message: z.string().min(20).max(2000),
  createdAt: z.string().min(1),
  status: z.enum(['prepared', 'sent', 'failed']),
});

const requestSchema = z.object({
  alert: guardianAlertSchema,
  idempotencyKey: z.string().min(8).max(256),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid guardian alert request', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const result = await sendGuardianEmail({
      alert: parsed.data.alert,
      idempotencyKey: parsed.data.idempotencyKey,
      resendApiKey: process.env.RESEND_API_KEY,
      from: process.env.GUARDIAN_EMAIL_FROM,
    });

    return NextResponse.json({ status: 'sent', providerId: result.id });
  } catch (error) {
    console.error('Guardian Alert API Error:', error);
    const detail = error instanceof Error ? error.message : 'Unknown guardian alert error.';
    return NextResponse.json(
      {
        error: 'Failed to send guardian alert email.',
        ...(process.env.NODE_ENV !== 'production' ? { detail } : {}),
      },
      { status: 500 }
    );
  }
}
