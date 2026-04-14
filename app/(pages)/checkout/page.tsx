'use client'

import { useState } from 'react'
import { Icon } from '@iconify/react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function CheckoutPage() {
  const [delivery, setDelivery] = useState('std')
  const [form, setForm] = useState({
    name: '', email: '', cep: '', address: '', city: '', state: 'SP',
    card: '', expiry: '', cvv: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  return (
    <div className="min-h-screen flex flex-col bg-grid-dark">
      <Navbar />

      <main className="flex-1 pt-32 pb-24 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Left: Form */}
            <div className="flex-1 space-y-12">
              {/* Steps */}
              <div className="flex items-center justify-between mb-8 max-w-md">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full border-2 border-[#00f3ff] flex items-center justify-center bg-[#00f3ff]/10 shadow-[0_0_15px_rgba(0,243,255,0.3)]">
                    <Icon icon="lucide:check" className="text-[#00f3ff]" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#00f3ff]">Carrinho</span>
                </div>
                <div className="h-0.5 flex-1 bg-gradient-to-r from-[#00f3ff] to-[#ff00ff] mx-4"></div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full border-2 border-[#ff00ff] flex items-center justify-center bg-[#ff00ff]/10 shadow-[0_0_15px_rgba(255,0,255,0.3)]">
                    <Icon icon="lucide:check" className="text-[#ff00ff]" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#ff00ff]">Entrega</span>
                </div>
                <div className="h-0.5 flex-1 bg-gradient-to-r from-[#ff00ff] to-zinc-800 mx-4"></div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full border-2 border-[#00ff00] flex items-center justify-center bg-[#00ff00]/10 shadow-[0_0_20px_rgba(0,255,0,0.4)] animate-pulse">
                    <span className="text-[#00ff00] font-black">3</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#00ff00]">Pagamento</span>
                </div>
              </div>

              {/* Shipping Address */}
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-8 bg-[#00f3ff]"></div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter">Endereço de Envio</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-full space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-4">Nome Completo</label>
                    <input name="name" type="text" placeholder="Ex: Alex G. Balu" value={form.name} onChange={handleChange}
                      className="w-full bg-black/40 border-2 border-white/5 rounded-2xl px-6 py-4 text-white placeholder:text-zinc-700 outline-none transition-all focus:border-[#00f3ff] focus:shadow-[0_0_15px_rgba(0,243,255,0.1)]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-4">Email de Contato</label>
                    <input name="email" type="email" placeholder="alex@printverso.com" value={form.email} onChange={handleChange}
                      className="w-full bg-black/40 border-2 border-white/5 rounded-2xl px-6 py-4 text-white placeholder:text-zinc-700 outline-none transition-all focus:border-[#00f3ff]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-4">CEP</label>
                    <input name="cep" type="text" placeholder="00000-000" value={form.cep} onChange={handleChange}
                      className="w-full bg-black/40 border-2 border-white/5 rounded-2xl px-6 py-4 text-white placeholder:text-zinc-700 outline-none transition-all focus:border-[#00f3ff]" />
                  </div>
                  <div className="col-span-full space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-4">Logradouro</label>
                    <input name="address" type="text" placeholder="Rua do Print, 123 - Bloco B" value={form.address} onChange={handleChange}
                      className="w-full bg-black/40 border-2 border-white/5 rounded-2xl px-6 py-4 text-white placeholder:text-zinc-700 outline-none transition-all focus:border-[#00f3ff]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-4">Cidade</label>
                    <input name="city" type="text" placeholder="São Paulo" value={form.city} onChange={handleChange}
                      className="w-full bg-black/40 border-2 border-white/5 rounded-2xl px-6 py-4 text-white placeholder:text-zinc-700 outline-none transition-all focus:border-[#00f3ff]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-4">Estado</label>
                    <select name="state" value={form.state} onChange={handleChange}
                      className="w-full bg-black/40 border-2 border-white/5 rounded-2xl px-6 py-4 text-white outline-none transition-all focus:border-[#00f3ff] appearance-none cursor-pointer">
                      <option value="SP">São Paulo</option>
                      <option value="RJ">Rio de Janeiro</option>
                      <option value="MG">Minas Gerais</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Delivery Method */}
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-8 bg-[#ff00ff]"></div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter">Método de Entrega</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: 'std', icon: 'lucide:truck', label: 'Padrão', desc: '5-8 Dias Úteis', price: 'Grátis', priceColor: '#00f3ff' },
                    { id: 'fast', icon: 'lucide:zap', label: 'Expresso', desc: '2-3 Dias Úteis', price: 'R$ 25,00', priceColor: '#ff00ff' },
                    { id: 'over', icon: 'lucide:rocket', label: 'Overnight', desc: 'Próximo Dia', price: 'R$ 50,00', priceColor: '#00ff00' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setDelivery(opt.id)}
                      className={`block text-left p-6 bg-black/40 border-2 rounded-3xl transition-all hover:border-white/10 ${delivery === opt.id ? 'border-[#00f3ff] shadow-[0_0_15px_rgba(0,243,255,0.2)]' : 'border-white/5'}`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <Icon icon={opt.icon} className="text-2xl text-zinc-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: opt.priceColor }}>{opt.price}</span>
                      </div>
                      <h3 className="font-black uppercase text-xs mb-1">{opt.label}</h3>
                      <p className="text-[10px] text-zinc-500 uppercase">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </section>

              {/* Payment */}
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-8 bg-[#00ff00]"></div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter">Pagamento Seguro</h2>
                </div>
                <div className="p-8 bg-black/60 border-2 border-white/5 rounded-[40px] space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-4">Número do Cartão</label>
                    <div className="relative">
                      <input name="card" type="text" placeholder="0000 0000 0000 0000" value={form.card} onChange={handleChange}
                        className="w-full bg-zinc-900/50 border-2 border-white/5 rounded-2xl px-6 py-4 text-white placeholder:text-zinc-800 outline-none transition-all focus:border-[#00ff00]" />
                      <Icon icon="logos:mastercard" className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-4">Validade</label>
                      <input name="expiry" type="text" placeholder="MM / AA" value={form.expiry} onChange={handleChange}
                        className="w-full bg-zinc-900/50 border-2 border-white/5 rounded-2xl px-6 py-4 text-white placeholder:text-zinc-800 outline-none transition-all focus:border-[#00ff00]" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-4">CVV</label>
                      <input name="cvv" type="text" placeholder="123" value={form.cvv} onChange={handleChange}
                        className="w-full bg-zinc-900/50 border-2 border-white/5 rounded-2xl px-6 py-4 text-white placeholder:text-zinc-800 outline-none transition-all focus:border-[#00ff00]" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-[#00ff00]/5 rounded-2xl border border-[#00ff00]/10">
                    <Icon icon="lucide:shield-check" className="text-[#00ff00] text-xl" />
                    <p className="text-[10px] font-bold text-[#00ff00] uppercase tracking-widest">Seus dados estão criptografados via PrintGate SSL</p>
                  </div>
                </div>
              </section>
            </div>

            {/* Right: Order Summary */}
            <aside className="lg:w-96">
              <div className="sticky top-28 space-y-8">
                <div className="bg-zinc-900/80 border-2 border-white/5 rounded-[40px] p-8 space-y-8 shadow-2xl">
                  <h2 className="text-xl font-black uppercase tracking-widest text-white border-b-2 border-white/5 pb-6">Resumo do Pedido</h2>
                  <div className="space-y-6">
                    {[
                      { name: 'Dragão Articulado Silk Blue', price: 'R$ 89,90', img: 'https://images.unsplash.com/photo-1559124568-d5a0f7da1ec5?q=80&w=200' },
                      { name: 'Suporte DualSense Pro', price: 'R$ 75,00', img: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=200' },
                    ].map((item) => (
                      <div key={item.name} className="flex gap-4">
                        <div className="w-16 h-16 bg-zinc-800 rounded-2xl overflow-hidden shrink-0 border border-white/10">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xs font-black uppercase text-zinc-200 leading-tight">{item.name}</h4>
                          <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1">1x • {item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4 pt-6 border-t border-white/5">
                    <div className="flex justify-between text-xs font-bold uppercase text-zinc-500">
                      <span>Subtotal</span><span>R$ 164,90</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold uppercase text-[#00f3ff]">
                      <span>Entrega</span><span>Grátis</span>
                    </div>
                    <div className="flex justify-between items-end pt-4">
                      <span className="text-xs font-black uppercase text-white">Total</span>
                      <span className="text-3xl font-black text-white">R$ 164,90</span>
                    </div>
                  </div>
                  <button
                    className="relative w-full group overflow-hidden mt-4"
                    onClick={() => alert('Pedido finalizado!')}
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#00f3ff] via-[#ff00ff] to-[#00ff00] rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-500"></div>
                    <div className="relative flex items-center justify-center gap-3 w-full bg-white text-black py-6 rounded-2xl font-black uppercase text-sm tracking-[0.2em] transition-all group-hover:bg-black group-hover:text-white">
                      Finalizar Compra <Icon icon="lucide:arrow-right" />
                    </div>
                  </button>
                  <div className="flex justify-center gap-4 pt-4">
                    <Icon icon="simple-icons:pix" className="text-2xl text-[#32BCAD]" />
                    <Icon icon="logos:visa" className="text-2xl" />
                    <Icon icon="logos:mastercard" className="text-2xl" />
                  </div>
                </div>
                <div className="p-6 border-2 border-white/5 rounded-3xl text-center space-y-3">
                  <Icon icon="lucide:lock" className="text-2xl text-zinc-500" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Ambiente 100% Seguro</p>
                  <p className="text-[10px] text-zinc-600 uppercase">Seus dados estão protegidos sob as leis do Printverso.</p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
