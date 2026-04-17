import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rotas que só admins podem acessar — verificação de sessão firebase via cookie
const PROTECTED_ROUTES = ['/admin']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route))
  if (!isProtected) return NextResponse.next()

  // Firebase auth mantém sessão via cookie "__session" (quando configurado)
  // ou via token armazenado em IndexedDB (client-side only).
  // O middleware faz uma verificação leve: se não há cookie de sessão,
  // redireciona para login. A verificação real de role=admin acontece
  // dentro do componente admin/page.tsx via useAuth() + profile.role.
  const session = request.cookies.get('__session')?.value

  if (!session) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
