import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';
import { forgotPasswordSchema } from '@/lib/validations';
import { sendEmail, renderResetPasswordEmail } from '@/lib/email';
import { sendVerificationEmail } from '@/lib/verification';

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = forgotPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 }
    );
  }

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  // Always respond with success to avoid leaking which emails are registered.
  if (user && user.passwordHash) {
    const token = randomBytes(32).toString('hex');
    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
      },
    });

    const resetUrl = `${process.env.APP_URL ?? 'http://localhost:3000'}/reset-password?token=${token}`;
    await sendEmail({
      to: email,
      subject: 'Reset your password — ProductDesk',
      html: renderResetPasswordEmail(resetUrl),
    });
  } else if (user && !user.passwordHash) {
    // Account was created but never verified/set a password — resend the verification
    // link instead, since "forgot password" doesn't apply until one has been set.
    await sendVerificationEmail(user.id, user.email, user.businessName);
  }

  return NextResponse.json({
    message: 'If an account with that email exists, a password reset link has been sent.',
  });
}
