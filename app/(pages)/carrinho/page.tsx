'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Icon } from '@iconify/react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const initialItems = [
  { id: 1, name: 'Kratos Resin Art', desc: 'Resina Premium | Escala 1:10', price: 249.00, qty: 1, img: 'https://images.unsplash.com/photo-1608889175123-8ee362201f81?q=80&w=300', hoverColor: '#00f3ff' },
  { id: 2, name: 'Dragão Articulado', desc: 'Filamento Silk Blue | Grande', price: 89.90, qty: 1, img: 'https://images.unsplash.com/photo-1559124568-d5a0f7da1ec5?q=80&w=300', hoverColor: '#ff00ff' },
  { id: 3, name: 'Keycap Cherry MX', desc: 'Translúcido Neon', price: 15.00, qty: 1, img: 'https://images.unsplash.com/photo-1618384881928-bb373689480d?q=80&w=300', hoverColor: '#00ff00' },
]

const recommendations = [
  { name: 'D20 Giant RPG', price: 'R$ 65,00', img: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=400', color: '#00f3ff' },
  { name: 'Headset Holder', price: 'R$ 40,00', img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=400', color: '#ff00ff' },
  { name: 'Baby Groot Planter', price: 'R$ 55,00', img: 'https://images.unsplash.com/photo-1606103836293-0a063ee20566?q=80&w=400', color: '#00ff00' },
  { name: 'Replica Portal Gun', price: 'R$ 180,00', img: 'https://images.unsplash.com/photo-1589254065878-42c9da997008?q=80&w=400', color: '#00f3ff' },
]

export default function CartPage() {
  const [items, setItems] = useState(initialItems)
  const [coupon, setCoupon] = useState('')

  const updateQty = (id: number, delta: number) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
    ))
  }

  const removeItem = (id: number) => setItems(items.filter(i => i.id !== id))

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)
  const shipping = 15.00
  const total = subtotal + shipping

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar cartCount={items.length} />

      <main className="flex-1 pt-32 pb-24 bg-grid-dark">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col gap-8 mb-12">
            <div className="relative">
              <div className="absolute -left-6 top-0 w-2 h-full bg-[#ff00ff]"></div>
              <h1 className="text-5xl md:text-7xl font-black uppercase leading-none tracking-tighter">Seu <span className="text-[#00f3ff]">Carrinho</span></h1>
              <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mt-2">{items.length} itens prontos para o spawn físico</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Items */}
            <div className="lg:col-span-8 space-y-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-black/40 backdrop-blur-sm border border-white/5 rounded-[32px] p-6 flex flex-col sm:flex-row items-center gap-6 group hover:border-[#00f3ff]/30 transition-all"
                >
                  <div className="w-32 h-32 shrink-0 bg-zinc-900 rounded-2xl overflow-hidden border-2 border-white/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-black text-xl uppercase tracking-tight text-white group-hover:text-[#00f3ff] transition-colors">{item.name}</h3>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-zinc-600 hover:text-[#ff00ff] transition-colors"
                        aria-label="Remover"
                      >
                        <Icon icon="lucide:trash-2" className="text-xl" />
                      </button>
                    </div>
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-4">{item.desc}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4 bg-zinc-900 rounded-full border border-white/10 p-1">
                        <button
                          onClick={() => updateQty(item.id, -1)}
                          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white transition-all"
                          aria-label="Diminuir"
                        >
                          <Icon icon="lucide:minus" />
                        </button>
                        <span className="font-black text-sm w-4 text-center">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.id, 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-[#00f3ff] transition-all"
                          aria-label="Aumentar"
                        >
                          <Icon icon="lucide:plus" />
                        </button>
                      </div>
                      <p className="font-black text-xl text-white">R$ {(item.price * item.qty).toFixed(2).replace('.', ',')}</p>
                    </div>
                  </div>
                </div>
              ))}

              <Link
                href="/"
                className="inline-flex items-center gap-3 text-sm font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all group"
              >
                <Icon icon="lucide:arrow-left" className="group-hover:-translate-x-1 transition-transform" />
                Continuar Comprando
              </Link>
            </div>

            {/* Summary */}
            <div className="lg:col-span-4">
              <div className="bg-black border-2 border-zinc-800 rounded-[40px] p-8 sticky top-32 shadow-2xl">
                <h2 className="text-2xl font-black uppercase tracking-tighter mb-8">Resumo do Pedido</h2>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center text-zinc-400 font-medium">
                    <span>Subtotal</span>
                    <span className="text-white">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-400 font-medium">
                    <span>Frete</span>
                    <span className="text-[#00ff00]">R$ {shipping.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-400 font-medium">
                    <span>Taxas</span>
                    <span className="text-white">R$ 0,00</span>
                  </div>
                  <div className="h-px bg-zinc-800 w-full my-6"></div>
                  <div className="flex justify-between items-end">
                    <span className="text-zinc-500 font-bold uppercase text-xs tracking-widest">Total Final</span>
                    <span className="text-3xl font-black text-white">R$ {total.toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <Link
                    href="/checkout"
                    className="w-full flex items-center justify-center gap-3 py-6 bg-[#00f3ff] text-black font-black uppercase text-sm tracking-[0.2em] rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_30px_rgba(0,243,255,0.3)]"
                  >
                    Finalizar Compra
                    <Icon icon="lucide:shield-check" className="text-xl" />
                  </Link>
                  <p className="text-[10px] text-center text-zinc-600 font-bold uppercase tracking-widest">Pagamento 100% seguro via SSL</p>
                </div>

                <div className="mt-10 pt-10 border-t border-zinc-900">
                  <p className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4">Cupom de Desconto?</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="CÓDIGO"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      className="flex-1 bg-zinc-900 border-2 border-zinc-800 rounded-xl px-4 py-3 text-xs font-black text-white focus:outline-none focus:border-[#ff00ff] transition-all placeholder:text-zinc-700"
                    />
                    <button className="px-4 py-3 border-2 border-zinc-800 rounded-xl text-zinc-500 hover:text-white hover:border-white transition-all" aria-label="Aplicar cupom">
                      <Icon icon="lucide:check" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="mt-40">
            <div className="flex items-center gap-6 mb-12">
              <h2 className="text-4xl font-black uppercase tracking-tighter">Também pode <span className="text-[#00ff00]">curtir</span></h2>
              <div className="h-px bg-zinc-800 flex-1"></div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {recommendations.map((rec) => (
                <div key={rec.name} className="group cursor-pointer">
                  <div className={`aspect-square bg-zinc-900 rounded-3xl overflow-hidden relative mb-5 border-2 border-white/5 group-hover:border-[${rec.color}] transition-all`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={rec.img} alt={rec.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-60 group-hover:opacity-100" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: rec.color }}>Adicionar</span>
                    </div>
                  </div>
                  <h3 className="font-black text-sm mb-1 uppercase tracking-tight">{rec.name}</h3>
                  <p className="font-black text-lg text-zinc-400">{rec.price}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
