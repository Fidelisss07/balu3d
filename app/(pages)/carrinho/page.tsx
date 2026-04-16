'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Icon } from '@iconify/react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { catalog } from '@/lib/catalog'

const SHIPPING = 15.00

// Recomendações baseadas no catálogo real
const recommendations = catalog.slice(0, 4)

export default function CartPage() {
  const { items, count, total, removeItem, updateQty, loading } = useCart()
  const { user } = useAuth()
  const [coupon, setCoupon] = useState('')
  const [couponMsg, setCouponMsg] = useState('')

  const grandTotal = total + SHIPPING

  function applyCoupon() {
    if (coupon.toUpperCase() === 'BALU10') {
      setCouponMsg('Cupom aplicado! -10% (em breve)')
    } else {
      setCouponMsg('Cupom inválido.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-[#00f3ff] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
      <Navbar />

      <main className="flex-1 pt-20 md:pt-28 pb-24 bg-grid-dark">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col gap-6 mb-12">
            <div className="relative">
              <div className="absolute -left-6 top-0 w-2 h-full bg-[#ff00ff]" />
              <h1 className="text-4xl md:text-7xl font-black uppercase leading-none tracking-tighter">
                Seu <span className="text-[#00f3ff]">Carrinho</span>
              </h1>
              <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mt-2">
                {count} {count === 1 ? 'item' : 'itens'} prontos para o spawn físico
                {!user && <span className="text-zinc-600"> · <Link href="/login" className="text-[#00f3ff] hover:underline">Entre</Link> para salvar seu carrinho</span>}
              </p>
            </div>
          </div>

          {items.length === 0 ? (
            /* Carrinho vazio */
            <div className="text-center py-32">
              <Icon icon="lucide:shopping-bag" className="text-8xl text-zinc-800 mx-auto mb-6" />
              <h2 className="text-2xl font-black uppercase text-white mb-3">Carrinho vazio</h2>
              <p className="text-zinc-500 font-bold mb-8">Adicione produtos do catálogo para começar.</p>
              <Link href="/produtos" className="inline-flex items-center gap-3 bg-[#00f3ff] text-black px-8 py-4 rounded-2xl font-black uppercase text-sm hover:scale-105 transition-all">
                <Icon icon="lucide:box" /> Ver Produtos
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              {/* Items */}
              <div className="lg:col-span-8 space-y-6">
                {items.map((item) => (
                  <div key={item.slug} className="bg-black/40 backdrop-blur-sm border border-white/5 rounded-[32px] p-6 flex flex-col sm:flex-row items-center gap-6 group hover:border-[#00f3ff]/30 transition-all">
                    <Link href={`/produto/${item.slug}`} className="w-32 h-32 shrink-0 bg-zinc-900 rounded-2xl overflow-hidden border-2 border-white/5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </Link>
                    <div className="flex-1 w-full">
                      <div className="flex justify-between items-start mb-2">
                        <Link href={`/produto/${item.slug}`}>
                          <h3 className="font-black text-xl uppercase tracking-tight text-white group-hover:text-[#00f3ff] transition-colors">{item.name}</h3>
                        </Link>
                        <button onClick={() => removeItem(item.slug)} className="text-zinc-600 hover:text-[#ff00ff] transition-colors cursor-pointer" aria-label="Remover">
                          <Icon icon="lucide:trash-2" className="text-xl" />
                        </button>
                      </div>
                      <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-4">Resina 8K · Impressão 3D</p>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4 bg-zinc-900 rounded-full border border-white/10 p-1">
                          <button onClick={() => updateQty(item.slug, item.qty - 1)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white transition-all cursor-pointer" aria-label="Diminuir">
                            <Icon icon="lucide:minus" />
                          </button>
                          <span className="font-black text-sm w-4 text-center">{item.qty}</span>
                          <button onClick={() => updateQty(item.slug, item.qty + 1)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-[#00f3ff] transition-all cursor-pointer" aria-label="Aumentar">
                            <Icon icon="lucide:plus" />
                          </button>
                        </div>
                        <p className="font-black text-xl text-white">R$ {(item.price * item.qty).toFixed(2).replace('.', ',')}</p>
                      </div>
                    </div>
                  </div>
                ))}

                <Link href="/produtos" className="inline-flex items-center gap-3 text-sm font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all group">
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
                      <span className="text-white">R$ {total.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div className="flex justify-between items-center text-zinc-400 font-medium">
                      <span>Frete estimado</span>
                      <span className="text-[#00ff00]">R$ {SHIPPING.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div className="h-px bg-zinc-800 w-full my-4" />
                    <div className="flex justify-between items-end">
                      <span className="text-zinc-500 font-bold uppercase text-xs tracking-widest">Total Final</span>
                      <span className="text-3xl font-black text-white">R$ {grandTotal.toFixed(2).replace('.', ',')}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Link href="/checkout" className="w-full flex items-center justify-center gap-3 py-6 bg-[#00f3ff] text-black font-black uppercase text-sm tracking-[0.2em] rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_30px_rgba(0,243,255,0.3)]">
                      Finalizar Compra
                      <Icon icon="lucide:shield-check" className="text-xl" />
                    </Link>
                    <p className="text-[10px] text-center text-zinc-600 font-bold uppercase tracking-widest">Pagamento 100% seguro via SSL</p>
                  </div>

                  <div className="mt-8 pt-8 border-t border-zinc-900">
                    <p className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4">Cupom de Desconto?</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="CÓDIGO"
                        value={coupon}
                        onChange={(e) => setCoupon(e.target.value)}
                        className="flex-1 bg-zinc-900 border-2 border-zinc-800 rounded-xl px-4 py-3 text-xs font-black text-white focus:outline-none focus:border-[#ff00ff] transition-all placeholder:text-zinc-700"
                      />
                      <button onClick={applyCoupon} className="px-4 py-3 border-2 border-zinc-800 rounded-xl text-zinc-500 hover:text-white hover:border-white transition-all cursor-pointer" aria-label="Aplicar cupom">
                        <Icon icon="lucide:check" />
                      </button>
                    </div>
                    {couponMsg && (
                      <p className={`text-xs font-bold mt-2 ml-1 ${couponMsg.includes('inválido') ? 'text-red-400' : 'text-[#00ff00]'}`}>
                        {couponMsg}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recomendações */}
          {items.length > 0 && (
            <div className="mt-32">
              <div className="flex items-center gap-6 mb-12">
                <h2 className="text-4xl font-black uppercase tracking-tighter">Também pode <span className="text-[#00ff00]">curtir</span></h2>
                <div className="h-px bg-zinc-800 flex-1" />
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {recommendations.filter((r) => !items.find((i) => i.slug === r.slug)).slice(0, 4).map((rec) => (
                  <Link key={rec.slug} href={`/produto/${rec.slug}`} className="group cursor-pointer">
                    <div className="aspect-square bg-zinc-900 rounded-3xl overflow-hidden relative mb-4 border-2 border-white/5 group-hover:border-white/20 transition-all">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={rec.img} alt={rec.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-70 group-hover:opacity-100" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: rec.color }}>Ver produto</span>
                      </div>
                    </div>
                    <h3 className="font-black text-sm mb-1 uppercase tracking-tight text-white">{rec.name}</h3>
                    <p className="font-black text-lg" style={{ color: rec.color }}>R$ {rec.price.toFixed(2).replace('.', ',')}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
