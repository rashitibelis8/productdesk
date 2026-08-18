import type { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import type { Plan } from '@prisma/client';

const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

export const authOptions: AuthOptions = {
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.trim().toLowerCase() },
        });
        if (!user) {
          throw new Error('Invalid email or password');
        }
        if (!user.passwordHash) {
          throw new Error('Please verify your email and set a password before signing in');
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) {
          throw new Error('Invalid email or password');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.businessName,
          plan: user.plan,
        };
      },
    }),
    ...(googleEnabled
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== 'google' || !profile?.email) return true;

      // Google already verifies the owner of the address, so link/auto-provision immediately.
      const existing = await prisma.user.findUnique({ where: { email: profile.email.toLowerCase() } });
      if (!existing) {
        await prisma.user.create({
          data: {
            email: profile.email.toLowerCase(),
            businessName: profile.name ?? profile.email.split('@')[0],
            passwordHash: null,
            emailVerified: new Date(),
          },
        });
      } else if (!existing.emailVerified) {
        await prisma.user.update({ where: { id: existing.id }, data: { emailVerified: new Date() } });
      }

      return true;
    },
    async jwt({ token, user, account }) {
      if (user && account?.provider === 'credentials') {
        token.userId = user.id;
        token.plan = (user as { plan: Plan }).plan;
      } else if (account?.provider === 'google' && token.email) {
        // Credentials-provider `user` isn't populated by our DB for OAuth — look it up ourselves.
        const dbUser = await prisma.user.findUnique({ where: { email: token.email.toLowerCase() } });
        if (dbUser) {
          token.userId = dbUser.id;
          token.plan = dbUser.plan;
          token.name = dbUser.businessName;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.plan = token.plan as Plan;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
