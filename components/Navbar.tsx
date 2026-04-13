'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Icon } from '@iconify/react'

interface NavbarProps {
  cartCount?: number
}

export default function Navbar({ cartCount = 2 }: NavbarProps) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/')

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
          <Link
            href="/produtos"
            className={`text-sm font-bold transition-colors uppercase flex items-center gap-1 hover:text-[#00f3ff] ${isActive('/produtos') ? 'text-[#00f3ff]' : 'text-white'}`}
          >
            <Icon icon="lucide:box" /> Produtos
          </Link>
          <Link
            href="/ajuda"
            className={`text-sm font-bold transition-colors uppercase hover:text-[#ff00ff] ${isActive('/ajuda') ? 'text-[#ff00ff]' : 'text-white'}`}
          >
            Ajuda
          </Link>
          <Link
            href="/rastreamento"
            className={`text-sm font-bold transition-colors uppercase hover:text-[#00ff00] ${isActive('/rastreamento') ? 'text-[#00ff00]' : 'text-white'}`}
          >
            Rastreamento
          </Link>
          <Link
            href="/carrinho"
            className={`text-sm font-bold transition-colors uppercase hover:text-white ${isActive('/carrinho') ? 'text-white' : 'text-white/40'}`}
          >
            Minhas Compras
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <Link
              href="/login"
              className="px-5 py-2 text-xs font-bold text-white border-2 border-white/20 hover:border-[#00f3ff] hover:text-[#00f3ff] transition-all rounded-full uppercase"
            >
              Entrar
            </Link>
            <Link
              href="/login?tab=register"
              className="px-5 py-2 text-xs font-bold bg-[#00f3ff] text-black rounded-full border-2 border-[#00f3ff] hover:bg-black hover:text-[#00f3ff] transition-all uppercase"
            >
              Registrar
            </Link>
          </div>
          <button
            className="lg:hidden p-2 text-white cursor-pointer"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <Icon icon={menuOpen ? 'lucide:x' : 'lucide:menu'} className="text-2xl" />
          </button>
          <Link
            href="/carrinho"
            className="relative p-2 hover:bg-[#00f3ff]/10 rounded-full transition-colors group"
          >
            <Icon icon="lucide:shopping-bag" className="text-2xl text-white group-hover:text-[#00f3ff]" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#ff00ff] text-white text-[10px] flex items-center justify-center rounded-full font-bold shadow-[0_0_8px_rgba(255,0,255,0.6)]">
                {cartCount}
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
          <Link href="/ajuda" className="block text-sm font-bold uppercase text-white hover:text-[#ff00ff] transition-colors" onClick={() => setMenuOpen(false)}>Ajuda</Link>
          <Link href="/rastreamento" className="block text-sm font-bold uppercase text-white hover:text-[#00ff00] transition-colors" onClick={() => setMenuOpen(false)}>Rastreamento</Link>
          <Link href="/carrinho" className="block text-sm font-bold uppercase text-white/60 hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>Minhas Compras</Link>
          <div className="pt-4 border-t border-white/10 flex gap-3">
            <Link href="/login" className="flex-1 text-center py-3 text-xs font-bold text-white border-2 border-white/20 hover:border-[#00f3ff] hover:text-[#00f3ff] transition-all rounded-full uppercase" onClick={() => setMenuOpen(false)}>
              Entrar
            </Link>
            <Link href="/login?tab=register" className="flex-1 text-center py-3 text-xs font-bold bg-[#00f3ff] text-black rounded-full border-2 border-[#00f3ff] hover:bg-black hover:text-[#00f3ff] transition-all uppercase" onClick={() => setMenuOpen(false)}>
              Registrar
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
