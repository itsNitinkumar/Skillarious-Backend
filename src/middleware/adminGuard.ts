import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/services/auth.service';

export async function adminGuard(request: NextRequest) {
  try {
    const response = await validateSession();
    if (!response.user?.isAdmin) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}