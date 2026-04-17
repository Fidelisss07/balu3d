'use client'

import Link from 'next/link'
import { Icon } from '@iconify/react'
import { useState } from 'react'
import { saveNewsletter } from '@/lib/db'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [newsletterMsg, setNewsletterMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [newsletterLoading, setNewsletterLoading] = useState(false)

  async function handleNewsletter(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setNewsletterMsg({ type: 'err', text: 'E-mail inválido.' })
      return
    }
    setNewsletterLoading(true)
    try {
      await saveNewsletter(trimmed)
      setNewsletterMsg({ type: 'ok', text: 'Inscrito! Você receberá os drops.' })
      setEmail('')
    } catch {
      setNewsletterMsg({ type: 'err', text: 'Erro ao inscrever. Tente novamente.' })
    }
    setNewsletterLoading(false)
  }

  return (
    <footer className="bg-black border-t-2 border-zinc-900 pt-24 pb-12 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          <div className="col-span-1">
            <div className="flex items-center gap-3 mb-8 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://vgbujcuwptvheqijyjbe.supabase.co/storage/v1/object/public/hmac-uploads/uploads/34fbd5be-6d3a-4f38-8d0d-b848d84fc2b5/1775746832304-2b665314/logo_balu_3d.jpg"
                alt="Balu 3D"
                className="w-12 h-12 object-cover rounded-full border-2 border-white/20 group-hover:shadow-[0_0_15px_rgba(0,243,255,0.4)] group-hover:border-[#00f3ff] transition-all"
              />
              <span className="font-display text-2xl uppercase tracking-tighter text-white">Balu 3D</span>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed mb-8 font-bold italic">
              &quot;A fronteira entre o digital e o físico desaparece aqui. Transformamos pixels em realidade física para o seu universo gamer.&quot;
            </p>
            <div className="flex gap-4">
              <a
                href="https://instagram.com/balu3d"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 border-2 border-zinc-800 rounded-2xl text-white hover:bg-[#ff00ff] hover:border-[#ff00ff] transition-all"
                aria-label="Instagram"
              >
                <Icon icon="lucide:instagram" className="text-xl" />
              </a>
              <a
                href="https://facebook.com/balu3d"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 border-2 border-zinc-800 rounded-2xl text-white hover:bg-[#00f3ff] hover:border-[#00f3ff] transition-all"
                aria-label="Facebook"
              >
                <Icon icon="lucide:facebook" className="text-xl" />
              </a>
              <a
                href="https://twitter.com/balu3d"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 border-2 border-zinc-800 rounded-2xl text-white hover:bg-[#00ff00] hover:border-[#00ff00] transition-all"
                aria-label="Twitter"
              >
                <Icon icon="lucide:twitter" className="text-xl" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-black uppercase text-xs tracking-[0.3em] text-zinc-600 mb-8">Exploração</h4>
            <ul className="space-y-4">
              <li><Link href="/" className="text-zinc-300 hover:text-[#00f3ff] font-bold transition-colors text-sm uppercase">Início</Link></li>
              <li><Link href="/produtos" className="text-zinc-300 hover:text-[#ff00ff] font-bold transition-colors text-sm uppercase">Produtos</Link></li>
              <li><Link href="/#sobre" className="text-zinc-300 hover:text-[#00ff00] font-bold transition-colors text-sm uppercase">Sobre o Printverso</Link></li>
              <li><Link href="/ajuda" className="text-zinc-300 hover:text-white font-bold transition-colors text-sm uppercase">Suporte Técnico</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black uppercase text-xs tracking-[0.3em] text-zinc-600 mb-8">Logística</h4>
            <ul className="space-y-4">
              <li><Link href="/rastreamento" className="text-zinc-300 hover:text-[#00f3ff] font-bold transition-colors text-sm uppercase">Rastreio de Drone</Link></li>
              <li><Link href="/ajuda#envio" className="text-zinc-300 hover:text-[#ff00ff] font-bold transition-colors text-sm uppercase">Frete &amp; Coleta</Link></li>
              <li><Link href="/ajuda#devolucoes" className="text-zinc-300 hover:text-[#00ff00] font-bold transition-colors text-sm uppercase">Trocas &amp; Devoluções</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black uppercase text-xs tracking-[0.3em] text-zinc-600 mb-8">Level Up News</h4>
            <p className="text-sm text-zinc-500 mb-6 font-bold">Receba drops exclusivos no seu radar.</p>
            <form className="flex flex-col gap-3" onSubmit={handleNewsletter}>
              <input
                type="email"
                placeholder="PLAYER@EMAIL.COM"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setNewsletterMsg(null) }}
                className="bg-zinc-900 border-2 border-zinc-800 text-white px-6 py-4 rounded-2xl focus:outline-none focus:border-[#00f3ff] text-xs font-black placeholder:text-zinc-600"
              />
              <button
                type="submit"
                disabled={newsletterLoading}
                className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] hover:bg-[#ff00ff] hover:text-white transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {newsletterLoading ? 'Inscrevendo...' : 'Assinar Feed'}
              </button>
              {newsletterMsg && (
                <p className={`text-xs font-bold ${newsletterMsg.type === 'ok' ? 'text-[#00ff00]' : 'text-red-400'}`}>
                  {newsletterMsg.text}
                </p>
              )}
            </form>
          </div>
        </div>

        <div className="border-t-2 border-zinc-900 pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em]">© 2024 Balu 3D Printverso. All Systems Go.</p>
          <div className="flex gap-8 grayscale opacity-40 hover:grayscale-0 transition-all">
            <Icon icon="logos:visa" className="text-3xl" />
            <Icon icon="logos:mastercard" className="text-3xl" />
            <Icon icon="simple-icons:pix" className="text-3xl text-[#32BCAD]" />
            <Icon icon="logos:bitcoin" className="text-3xl" />
          </div>
        </div>
      </div>
    </footer>
  )
}
