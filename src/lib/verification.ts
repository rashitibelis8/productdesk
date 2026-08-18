import { randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendEmail, renderVerifyEmail } from '@/lib/email';

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function sendVerificationEmail(userId: string, email: string, businessName: string): Promise<void> {
  const token = randomBytes(32).toString('hex');
  await prisma.emailVerificationToken.create({
    data: {
      token,
      userId,
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });

  const verifyUrl = `${process.env.APP_URL ?? 'http://localhost:3000'}/verify-email?token=${token}`;
  await sendEmail({
    to: email,
    subject: 'Verify your email — ProductDesk',
    html: renderVerifyEmail(verifyUrl, businessName),
  });
}
