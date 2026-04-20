'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Icon } from '@iconify/react'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { logout } from '@/lib/auth'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, profile, loading } = useAuth()
  const { count } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/')

  async function handleLogout() {
    await logout()
    setUserMenuOpen(false)
    router.push('/')
  }

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group transition-all">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#00f3ff] to-[#ff00ff] rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://vgbujcuwptvheqijyjbe.supabase.co/storage/v1/object/public/hmac-uploads/uploads/34fbd5be-6d3a-4f38-8d0d-b848d84fc2b5/1775746832304-2b665314/logo_balu_3d.jpg"
              alt="Balu 3D"
              className="relative w-12 h-12 object-cover rounded-full border-2 border-white/20"
            />
          </div>
          <span className="font-display text-xl uppercase tracking-tighter relative text-white">Balu 3D</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-8">
          <Link href="/produtos" className={`text-sm font-bold transition-colors uppercase flex items-center gap-1.5 hover:text-[#00f3ff] ${isActive('/produtos') ? 'text-[#00f3ff]' : 'text-white'}`}>
            <Icon icon="lucide:box" className="text-base" /> Produtos
          </Link>
          <Link href="/agenda" className={`text-sm font-bold transition-colors uppercase flex items-center gap-1.5 hover:text-[#ff00ff] ${isActive('/agenda') ? 'text-[#ff00ff]' : 'text-white'}`}>
            <Icon icon="lucide:calendar" className="text-base" /> Agenda
          </Link>
          <Link href="/ajuda" className={`text-sm font-bold transition-colors uppercase flex items-center gap-1.5 hover:text-[#ff00ff] ${isActive('/ajuda') ? 'text-[#ff00ff]' : 'text-white'}`}>
            <Icon icon="lucide:help-circle" className="text-base" /> Ajuda
          </Link>
          <Link href="/rastreamento" className={`text-sm font-bold transition-colors uppercase flex items-center gap-1.5 hover:text-[#00ff00] ${isActive('/rastreamento') ? 'text-[#00ff00]' : 'text-white'}`}>
            <Icon icon="lucide:package-search" className="text-base" /> Rastreamento
          </Link>
          {profile?.role === 'admin' && (
            <Link href="/painel-xk7m2q" className={`text-sm font-bold transition-colors uppercase flex items-center gap-1.5 hover:text-[#ff00ff] ${isActive('/painel-xk7m2q') ? 'text-[#ff00ff]' : 'text-zinc-400'}`}>
              <Icon icon="lucide:layout-dashboard" className="text-base" /> Admin
            </Link>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {!loading && (
            <>
              {user ? (
                /* Usuário logado */
                <div className="hidden sm:block relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-white/10 rounded-full hover:border-[#00f3ff] transition-all cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#00f3ff] flex items-center justify-center text-black text-xs font-black">
                      {(user.displayName ?? user.email ?? 'U')[0].toUpperCase()}
                    </div>
                    <span className="text-xs font-bold text-white max-w-[100px] truncate">
                      {user.displayName ?? user.email}
                    </span>
                    <Icon icon="lucide:chevron-down" className="text-zinc-500 text-xs" />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50">
                      <Link href="/rastreamento" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors">
                        <Icon icon="lucide:package" className="text-[#00f3ff]" /> Meus Pedidos
                      </Link>
                      <Link href="/minha-conta" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors">
                        <Icon icon="lucide:user-circle" className="text-[#00f3ff]" /> Minha Conta
                      </Link>
                      {profile?.role === 'admin' && (
                        <Link href="/painel-xk7m2q" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors">
                          <Icon icon="lucide:layout-dashboard" className="text-[#ff00ff]" /> Admin
                        </Link>
                      )}
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer">
                        <Icon icon="lucide:log-out" /> Sair
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Não logado */
                <div className="hidden sm:flex items-center gap-2">
                  <Link href="/login" className="px-5 py-2 text-xs font-bold text-white border-2 border-white/20 hover:border-[#00f3ff] hover:text-[#00f3ff] transition-all rounded-full uppercase">
                    Entrar
                  </Link>
                  <Link href="/login?tab=register" className="px-5 py-2 text-xs font-bold bg-[#00f3ff] text-black rounded-full border-2 border-[#00f3ff] hover:bg-black hover:text-[#00f3ff] transition-all uppercase">
                    Registrar
                  </Link>
                </div>
              )}
            </>
          )}

          <button className="lg:hidden p-2 text-white cursor-pointer" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            <Icon icon={menuOpen ? 'lucide:x' : 'lucide:menu'} className="text-2xl" />
          </button>

          <Link href="/carrinho" className="relative p-2 hover:bg-[#00f3ff]/10 rounded-full transition-colors group">
            <Icon icon="lucide:shopping-bag" className="text-2xl text-white group-hover:text-[#00f3ff]" />
            {count > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#ff00ff] text-white text-[10px] flex items-center justify-center rounded-full font-bold shadow-[0_0_8px_rgba(255,0,255,0.6)]">
                {count > 9 ? '9+' : count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden bg-black/95 border-t border-white/5 px-4 py-6 space-y-4">
          <Link href="/produtos" className="flex items-center gap-2 text-sm font-bold uppercase text-white hover:text-[#00f3ff] transition-colors" onClick={() => setMenuOpen(false)}>
            <Icon icon="lucide:box" /> Produtos
          </Link>
          <Link href="/agenda" className="flex items-center gap-2 text-sm font-bold uppercase text-white hover:text-[#ff00ff] transition-colors" onClick={() => setMenuOpen(false)}><Icon icon="lucide:calendar" /> Agenda</Link>
          <Link href="/ajuda" className="flex items-center gap-2 text-sm font-bold uppercase text-white hover:text-[#ff00ff] transition-colors" onClick={() => setMenuOpen(false)}><Icon icon="lucide:help-circle" /> Ajuda</Link>
          <Link href="/rastreamento" className="flex items-center gap-2 text-sm font-bold uppercase text-white hover:text-[#00ff00] transition-colors" onClick={() => setMenuOpen(false)}><Icon icon="lucide:package-search" /> Rastreamento</Link>
          {profile?.role === 'admin' && (
            <Link href="/painel-xk7m2q" className="block text-sm font-bold uppercase text-zinc-400 hover:text-[#ff00ff] transition-colors" onClick={() => setMenuOpen(false)}>Admin</Link>
          )}
          {user && (
            <Link href="/minha-conta" className="flex items-center gap-2 text-sm font-bold uppercase text-white hover:text-[#00f3ff] transition-colors" onClick={() => setMenuOpen(false)}>
              <Icon icon="lucide:user-circle" /> Minha Conta
            </Link>
          )}
          <div className="pt-4 border-t border-white/10 flex gap-3">
            {user ? (
              <button onClick={handleLogout} className="flex-1 text-center py-3 text-xs font-bold text-red-400 border-2 border-red-400/30 rounded-full uppercase hover:bg-red-500/10 transition-all cursor-pointer">
                Sair
              </button>
            ) : (
              <>
                <Link href="/login" className="flex-1 text-center py-3 text-xs font-bold text-white border-2 border-white/20 hover:border-[#00f3ff] hover:text-[#00f3ff] transition-all rounded-full uppercase" onClick={() => setMenuOpen(false)}>
                  Entrar
                </Link>
                <Link href="/login?tab=register" className="flex-1 text-center py-3 text-xs font-bold bg-[#00f3ff] text-black rounded-full border-2 border-[#00f3ff] hover:bg-black hover:text-[#00f3ff] transition-all uppercase" onClick={() => setMenuOpen(false)}>
                  Registrar
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
