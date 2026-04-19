import { PrismaAdapter } from '@auth/prisma-adapter';
import { UserRole } from '@prisma/client';
import { compare } from 'bcryptjs';
import { type AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const envAdminEmail = process.env.ADMIN_EMAIL;
const envAdminPassword = process.env.ADMIN_PASSWORD;
const allowEnvFallbackAuth = process.env.NODE_ENV !== 'production';

function authorizeWithEnvFallback(email: string, password: string) {
  if (!allowEnvFallbackAuth || !envAdminEmail || !envAdminPassword) return null;
  if (email !== envAdminEmail || password !== envAdminPassword) return null;

  return {
    id: `env-owner:${envAdminEmail}`,
    email: envAdminEmail,
    name: 'Website Owner',
    role: UserRole.OWNER,
  };
}

const nextAuthUrl = process.env.NEXTAUTH_URL ?? '';
const nextAuthIsExplicitHttp = nextAuthUrl.startsWith('http://');

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  useSecureCookies:
    nextAuthUrl.startsWith('https://') ||
    (process.env.NODE_ENV === 'production' && !nextAuthIsExplicitHttp),
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: { signIn: '/admin/login' },
  providers: [
    CredentialsProvider({
      name: 'Owner Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        try {
          const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
          if (user) {
            const matches = await compare(parsed.data.password, user.passwordHash);
            if (matches) {
              return {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
              };
            }
          }
        } catch {
          // Local development can proceed when DB credentials are not configured.
        }

        return authorizeWithEnvFallback(parsed.data.email, parsed.data.password);
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: UserRole }).role ?? UserRole.REVIEWER;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? '';
        session.user.role = (token.role as UserRole) ?? UserRole.REVIEWER;
      }
      return session;
    },
  },
};
