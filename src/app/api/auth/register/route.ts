import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signUpSchema } from '@/lib/validations';
import { sendVerificationEmail } from '@/lib/verification';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = signUpSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 }
    );
  }

  const { businessName, email } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return NextResponse.json({ message: 'An account with this email already exists' }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      businessName,
      email: normalizedEmail,
      passwordHash: null,
      emailVerified: null,
    },
  });

  await sendVerificationEmail(user.id, user.email, user.businessName);

  return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
}
