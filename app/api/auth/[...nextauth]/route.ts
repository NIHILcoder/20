import { NextAuthOptions } from 'next-auth';
import { NextResponse } from 'next/server';
import NextAuth from 'next-auth/next';
import CredentialsProvider from 'next-auth/providers/credentials';
import db from '@/db';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          // Поиск пользователя по имени пользователя
          const result = await db.query(
            'SELECT * FROM users WHERE username = $1',
            [credentials.username]
          );

          const user = result.rows[0];

          if (!user) {
            return null;
          }

          // Проверка пароля
          const passwordMatch = await bcrypt.compare(
            credentials.password,
            user.password_hash
          );

          if (!passwordMatch) {
            return null;
          }

          return {
            id: user.id.toString(),
            name: user.display_name || user.username,
            email: user.email,
            image: user.avatar_url,
            username: user.username
          };
        } catch (error) {
          console.error('Ошибка авторизации:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key'
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };