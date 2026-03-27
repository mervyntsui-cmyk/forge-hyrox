import { auth } from "@/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  const isAuthRoute = pathname === '/login' || pathname === '/register';
  const isPublicRoute = pathname === '/';

  // Allow API routes to be handled by their respective handlers
  if (pathname.startsWith('/api/auth')) {
    return;
  }

  // Auth pages (/login, /register): allow access regardless of session status
  // The landing page and individual pages handle session-aware redirects themselves
  if (isAuthRoute) {
    return;
  }

  // Non-public, non-auth pages require authentication
  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL('/login', req.nextUrl));
  }
})

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.webp$).*)'],
}
