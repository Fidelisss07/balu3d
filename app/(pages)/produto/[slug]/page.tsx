'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Icon } from '@iconify/react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function ProductPage() {
  const [qty, setQty] = useState(1)
  const [selectedFinish, setSelectedFinish] = useState(0)

  const finishes = ['#000000', '#3f3f3f', '#00f3ff', '#ff00ff']
  const thumbs = [
    'https://images.unsplash.com/photo-1608889175123-8ee362201f81?q=80&w=300',
    'https://images.unsplash.com/photo-1594736223565-3544c039a36d?q=80&w=300',
    'https://images.unsplash.com/photo-1544273677-c433136021d4?q=80&w=300',
  ]

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] text-white">
      <Navbar cartCount={2} />

      <main className="flex-1 pt-32 pb-24 bg-grid-dark">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {/* Breadcrumb */}
          <nav className="mb-10 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
            <Link href="/" className="hover:text-white transition-colors">Início</Link>
            <Icon icon="lucide:chevron-right" />
            <a href="#" className="hover:text-white transition-colors">Produtos</a>
            <Icon icon="lucide:chevron-right" />
            <a href="#" className="hover:text-white transition-colors">Geek</a>
            <Icon icon="lucide:chevron-right" />
            <span className="text-[#00f3ff]">Kratos Resin Art</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-16 mb-24">
            {/* Images */}
            <div>
              <div className="aspect-square bg-zinc-900 rounded-[40px] border-2 border-white/5 overflow-hidden mb-6 group relative shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1608889175123-8ee362201f81?q=80&w=1200&auto=format&fit=crop"
                  alt="Kratos Figure Main"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-6 left-6 flex flex-col gap-3">
                  <span className="px-4 py-1.5 bg-[#00f3ff] text-black text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">Premium Resina</span>
                  <span className="px-4 py-1.5 bg-[#ff00ff] text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">Destaque</span>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {thumbs.map((src, i) => (
                  <div key={i} className={`aspect-square bg-zinc-900 rounded-2xl border-2 overflow-hidden cursor-pointer ${i === 0 ? 'border-[#00f3ff]' : 'border-white/5 hover:border-white/20 transition-all'}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`Thumb ${i + 1}`} className={`w-full h-full object-cover ${i === 0 ? '' : 'opacity-60 hover:opacity-100'}`} />
                  </div>
                ))}
                <div className="aspect-square bg-zinc-900 rounded-2xl border-2 border-white/5 overflow-hidden cursor-pointer hover:border-white/20 transition-all flex items-center justify-center">
                  <Icon icon="lucide:play-circle" className="text-4xl text-zinc-500 hover:text-white transition-colors" />
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="flex flex-col">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex text-[#00ff00]">
                    {[...Array(5)].map((_, i) => <Icon key={i} icon="mdi:star" />)}
                  </div>
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">(48 Avaliações)</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-black uppercase leading-none tracking-tighter mb-4 text-white">
                  Kratos <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] to-[#ff00ff]">Resin Art</span>
                </h1>
                <p className="text-2xl font-black text-zinc-400 mb-8">R$ 289,90 <span className="text-sm text-zinc-600 line-through ml-3 uppercase">R$ 349,00</span></p>

                <div className="mb-10 space-y-8">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 mb-4">Escolha o Acabamento</h4>
                    <div className="flex gap-4">
                      {finishes.map((color, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedFinish(i)}
                          className={`w-10 h-10 rounded-full border-2 transition-all ${selectedFinish === i ? 'border-[#00f3ff] shadow-[0_0_10px_rgba(0,243,255,0.3)]' : 'border-transparent hover:border-white/50'}`}
                          style={{ backgroundColor: color }}
                          aria-label={`Finish ${i + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 mb-4">Quantidade</h4>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center bg-zinc-900 border-2 border-white/5 rounded-2xl p-1">
                        <button
                          onClick={() => setQty(Math.max(1, qty - 1))}
                          className="w-12 h-12 flex items-center justify-center hover:bg-white/5 rounded-xl text-white transition-colors"
                          aria-label="Diminuir"
                        >
                          <Icon icon="lucide:minus" />
                        </button>
                        <span className="w-16 bg-transparent text-center font-black text-lg">{qty}</span>
                        <button
                          onClick={() => setQty(qty + 1)}
                          className="w-12 h-12 flex items-center justify-center hover:bg-white/5 rounded-xl text-white transition-colors"
                          aria-label="Aumentar"
                        >
                          <Icon icon="lucide:plus" />
                        </button>
                      </div>
                      <span className="text-xs font-bold text-zinc-600 uppercase tracking-widest">Estoque: 12 unidades</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-10">
                  <Link
                    href="/carrinho"
                    className="flex-1 bg-[#00f3ff] text-black h-20 rounded-3xl flex items-center justify-center gap-4 font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-[0_0_30px_rgba(0,243,255,0.3)]"
                  >
                    <Icon icon="lucide:shopping-bag" className="text-2xl" /> Adicionar ao Carrinho
                  </Link>
                  <button className="w-20 h-20 border-2 border-white/10 rounded-3xl flex items-center justify-center hover:border-[#ff00ff] hover:text-[#ff00ff] transition-all group" aria-label="Lista de desejos">
                    <Icon icon="lucide:heart" className="text-2xl group-active:scale-125 transition-transform" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t-2 border-white/5 pt-10">
                  <div className="flex items-start gap-4">
                    <Icon icon="lucide:truck" className="text-3xl text-[#00ff00]" />
                    <div>
                      <p className="text-sm font-black uppercase tracking-tighter">Frete Expresso</p>
                      <p className="text-xs text-zinc-500">Entrega em 3-7 dias úteis</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Icon icon="lucide:shield-check" className="text-3xl text-[#00f3ff]" />
                    <div>
                      <p className="text-sm font-black uppercase tracking-tighter">Garantia 3D</p>
                      <p className="text-xs text-zinc-500">Qualidade Balu garantida</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details & Reviews */}
          <div className="grid md:grid-cols-3 gap-16 border-t-2 border-white/5 pt-20">
            <div className="md:col-span-2 space-y-16">
              <div>
                <h2 className="text-4xl font-black uppercase tracking-tighter mb-8 flex items-center gap-4">
                  <div className="w-2 h-10 bg-[#ff00ff]"></div> Detalhes do Print
                </h2>
                <div className="text-zinc-400 leading-relaxed font-bold space-y-4">
                  <p>O Fantasma de Esparta chega ao mundo real com um nível de detalhamento absurdo. Esta peça não é apenas um colecionável, é uma obra de arte impressa em resina foto-polimerizável de alta densidade.</p>
                  <p>Ideal para decoração de setups gamer ou estantes de colecionadores exigentes. Cada curva, cicatriz e textura da armadura foi preservada no processo de impressão 8K.</p>
                  <ul className="list-disc pl-6 space-y-2 text-zinc-300">
                    <li>Escultura digital original otimizada para impressão 3D</li>
                    <li>Acabamento manual para remoção de suportes</li>
                    <li>Opção de primer cinza para pintura personalizada</li>
                    <li>Base temática inclusa no design</li>
                  </ul>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-600 mb-6">Especificações Técnicas</h3>
                  <div className="space-y-4">
                    {[['Material', 'Resina Premium Tough'], ['Dimensões', '22cm x 15cm x 12cm'], ['Escala', '1:10'], ['Tempo de Impressão', '18 Horas']].map(([k, v]) => (
                      <div key={k} className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-zinc-500 text-sm uppercase">{k}</span>
                        <span className="text-white font-bold">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-600 mb-6">Manutenção</h3>
                  <p className="text-sm text-zinc-400 italic">Evitar exposição direta ao sol por longos períodos para preservar as propriedades mecânicas da resina. Limpar apenas com pincel macio ou ar comprimido.</p>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div>
              <div className="bg-zinc-900/50 p-10 rounded-[40px] border-2 border-white/5 sticky top-28">
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-8">Avaliações de Players</h3>
                <div className="space-y-8">
                  {[
                    { user: '@gamer_pro123', text: '"Qualidade impecável. Nenhuma marca de impressão visível. Balu 3D é outro nível!"', stars: 5 },
                    { user: '@geek_master', text: '"A pintura aderiu super bem. Resina muito resistente. Só atrasou 1 dia o frete."', stars: 4 },
                  ].map((r) => (
                    <div key={r.user} className="border-b border-white/5 pb-6">
                      <div className="flex text-[#00ff00] text-xs mb-2">
                        {[...Array(r.stars)].map((_, i) => <Icon key={i} icon="mdi:star" />)}
                        {r.stars < 5 && <Icon icon="mdi:star-outline" />}
                      </div>
                      <p className="text-sm font-bold text-white mb-1">{r.user}</p>
                      <p className="text-xs text-zinc-500 italic mb-3">{r.text}</p>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors border-t border-white/5">
                  Ler todas as reviews
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
