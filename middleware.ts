import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rotas protegidas por autenticação. O middleware faz uma checagem leve
// via cookie "__session"; a validação real de role=admin acontece dentro
// do componente /admin através do hook useAuth() + profile.role.
const PROTECTED_ROUTES = ['/painel-xk7m2q', '/minha-conta', '/checkout']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route))
  if (!isProtected) return NextResponse.next()

  const session = request.cookies.get('__session')?.value

  if (!session) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/painel-xk7m2q/:path*', '/minha-conta/:path*', '/checkout/:path*'],
}
