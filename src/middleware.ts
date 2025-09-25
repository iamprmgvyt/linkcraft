import { type NextRequest, NextResponse } from 'next/server';
import { getSession } from './lib/auth';

export const config = {
  matcher: ['/dashboard/:path*'],
};

export async function middleware(req: NextRequest) {
  const session = await getSession();
  
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
