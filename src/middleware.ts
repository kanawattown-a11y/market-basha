import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key');

// Paths that require authentication
const protectedPaths = [
    '/admin',
    '/operations',
    '/driver',
    '/account',
    '/orders',
    '/checkout',
];

// Paths that are only for unauthenticated users
const authPaths = [
    '/login',
    '/register',
];

// Role-based path restrictions
const roleRestrictions: Record<string, string[]> = {
    '/admin': ['ADMIN'],
    '/operations': ['ADMIN', 'OPERATIONS'],
    '/driver': ['DRIVER'],
};

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('auth-token')?.value;

    // Check if path needs protection
    const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
    const isAuthPath = authPaths.some(path => pathname.startsWith(path));

    // Verify token if present
    let user: { userId: string; role: string; status: string } | null = null;

    if (token) {
        try {
            const { payload } = await jwtVerify(token, JWT_SECRET);
            user = payload as { userId: string; role: string; status: string };
        } catch {
            // Invalid token
        }
    }

    // Redirect unauthenticated users from protected paths
    if (isProtectedPath && !user) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Redirect authenticated users from auth paths
    if (isAuthPath && user) {
        // Redirect based on role
        let redirectPath = '/';
        if (user.role === 'ADMIN') redirectPath = '/admin';
        else if (user.role === 'OPERATIONS') redirectPath = '/operations';
        else if (user.role === 'DRIVER') redirectPath = '/driver';

        return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    // Check role-based restrictions
    if (user) {
        for (const [path, allowedRoles] of Object.entries(roleRestrictions)) {
            if (pathname.startsWith(path) && !allowedRoles.includes(user.role)) {
                return NextResponse.redirect(new URL('/', request.url));
            }
        }

        // Check if user is approved for protected paths (except driver which handles its own)
        if (isProtectedPath && user.status !== 'APPROVED' && !pathname.startsWith('/driver')) {
            return NextResponse.redirect(new URL('/pending-approval', request.url));
        }
    }

    // Add security headers for API routes
    if (pathname.startsWith('/api')) {
        const response = NextResponse.next();
        response.headers.set('X-Content-Type-Options', 'nosniff');
        response.headers.set('X-Frame-Options', 'DENY');
        return response;
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|icons|images|.*\\..*|api/auth).*)',
    ],
};
