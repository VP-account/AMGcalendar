import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const userCookie = request.cookies.get('pilates_user');

    if (!userCookie) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
        const user = JSON.parse(userCookie.value);

        // Захищаємо адмін-роути
        if (request.nextUrl.pathname.startsWith('/admin')) {
            if (user.role !== 'admin') {
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }
        }
    } catch (error) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/dashboard'],
};