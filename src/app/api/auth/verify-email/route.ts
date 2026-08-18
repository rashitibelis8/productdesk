import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { verifyEmailSchema } from '@/lib/validations';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = verifyEmailSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 }
    );
  }

  const { token, password } = parsed.data;

  const verificationToken = await prisma.emailVerificationToken.findUnique({ where: { token } });
  if (!verificationToken || verificationToken.used || verificationToken.expiresAt < new Date()) {
    return NextResponse.json({ message: 'This verification link is invalid or has expired' }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.$transaction(async (tx) => {
    const updated = await tx.user.update({
      where: { id: verificationToken.userId },
      data: { passwordHash, emailVerified: new Date() },
    });
    await tx.emailVerificationToken.update({
      where: { id: verificationToken.id },
      data: { used: true },
    });
    return updated;
  });

  return NextResponse.json({ email: user.email });
}
