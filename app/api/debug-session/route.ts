import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: { cookies: { getAll: () => any; }; }) {
  const session = await getServerSession(authOptions);
  const cookies = request.cookies.getAll();
  
  return NextResponse.json({
    hasSession: !!session,
    sessionData: session ? {
      user: {
        id: session.user?.id,
        name: session.user?.name,
        email: session.user?.email
      },
      expires: session.expires
    } : null,
    cookies: cookies.map((c: { name: any; value: string; }) => ({ name: c.name, value: c.value.substring(0, 10) + '...' }))
  });
}