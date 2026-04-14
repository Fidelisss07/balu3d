'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { createOrder } from '@/lib/db'

const SHIPPING_OPTIONS = [
  { id: 'pac',       icon: 'lucide:truck',  label: 'PAC',       desc: '8-12 Dias Úteis', price: 0,  priceLabel: 'Grátis',    color: '#00f3ff' },
  { id: 'sedex',     icon: 'lucide:zap',    label: 'SEDEX',     desc: '3-5 Dias Úteis',  price: 25, priceLabel: 'R$ 25,00',  color: '#ff00ff' },
  { id: 'sedex10',   icon: 'lucide:rocket', label: 'SEDEX 10',  desc: 'Próximo Dia',     price: 50, priceLabel: 'R$ 50,00',  color: '#00ff00' },
]

type PayMethod = 'credito' | 'pix'

interface FormState {
  name: string
  email: string
  cep: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  city: string
  state: string
  // cartão
  cardName: string
  cardNumber: string
  cardExpiry: string
  cardCvv: string
  // parcelamento
  installments: string
}

function formatCEP(v: string) {
  return v.replace(/\D/g, '').slice(0, 8).replace(/^(\d{5})(\d)/, '$1-$2')
}
function formatCard(v: string) {
  return v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}
function formatExpiry(v: string) {
  return v.replace(/\D/g, '').slice(0, 4).replace(/^(\d{2})(\d)/, '$1/$2')
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, clear, loading: cartLoading } = useCart()
  const { user } = useAuth()

  const [shipping, setShipping] = useState('pac')
  const [payMethod, setPayMethod] = useState<PayMethod>('credito')
  const [submitting, setSubmitting] = useState(false)
  const [cepLoading, setCepLoading] = useState(false)
  const [cepError, setCepError] = useState('')
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

  const [form, setForm] = useState<FormState>({
    name: user?.displayName ?? '',
    email: user?.email ?? '',
    cep: '', logradouro: '', numero: '', complemento: '', bairro: '', city: '', state: '',
    cardName: '', cardNumber: '', cardExpiry: '', cardCvv: '', installments: '1',
  })

  // Pré-preenche nome/email quando user carrega
  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        name: f.name || user.displayName || '',
        email: f.email || user.email || '',
      }))
    }
  }, [user])

  const shippingOption = SHIPPING_OPTIONS.find((o) => o.id === shipping)!
  const shippingCost = shippingOption.price
  const orderTotal = total + shippingCost

  // CEP lookup
  const handleCEP = useCallback(async (raw: string) => {
    const cep = raw.replace(/\D/g, '')
    if (cep.length !== 8) return
    setCepLoading(true)
    setCepError('')
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data = await res.json()
      if (data.erro) {
        setCepError('CEP não encontrado')
      } else {
        setForm((f) => ({
          ...f,
          logradouro: data.logradouro || '',
          bairro: data.bairro || '',
          city: data.localidade || '',
          state: data.uf || '',
        }))
      }
    } catch {
      setCepError('Erro ao buscar CEP')
    }
    setCepLoading(false)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    let v = value
    if (name === 'cep') { v = formatCEP(value); handleCEP(v) }
    if (name === 'cardNumber') v = formatCard(value)
    if (name === 'cardExpiry') v = formatExpiry(value)
    if (name === 'cardCvv') v = value.replace(/\D/g, '').slice(0, 4)
    setForm((f) => ({ ...f, [name]: v }))
    if (errors[name as keyof FormState]) setErrors((e) => ({ ...e, [name]: '' }))
  }

  const validate = () => {
    const e: Partial<Record<keyof FormState, string>> = {}
    if (!form.name.trim()) e.name = 'Nome obrigatório'
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email inválido'
    if (form.cep.replace(/\D/g, '').length !== 8) e.cep = 'CEP inválido'
    if (!form.logradouro.trim()) e.logradouro = 'Rua obrigatória'
    if (!form.numero.trim()) e.numero = 'Número obrigatório'
    if (!form.city.trim()) e.city = 'Cidade obrigatória'
    if (payMethod === 'credito') {
      if (form.cardNumber.replace(/\s/g, '').length < 16) e.cardNumber = 'Número inválido'
      if (!form.cardName.trim()) e.cardName = 'Nome obrigatório'
      if (form.cardExpiry.length < 5) e.cardExpiry = 'Validade inválida'
      if (form.cardCvv.length < 3) e.cardCvv = 'CVV inválido'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (items.length === 0) return
    if (!validate()) return
    setSubmitting(true)
    try {
      const orderId = await createOrder({
        userId: user?.uid ?? 'guest',
        userName: form.name,
        userEmail: form.email,
        items,
        subtotal: total,
        shipping: shippingCost,
        total: orderTotal,
        shippingMethod: shipping,
        paymentMethod: payMethod,
        address: {
          name: form.name,
          email: form.email,
          cep: form.cep,
          logradouro: `${form.logradouro}${form.numero ? ', ' + form.numero : ''}${form.complemento ? ' - ' + form.complemento : ''}`,
          bairro: form.bairro,
          city: form.city,
          state: form.state,
        },
        status: 'confirmado',
      })
      await clear()
      router.push(`/rastreamento?id=${orderId}`)
    } catch (err) {
      console.error(err)
      alert('Erro ao finalizar pedido. Tente novamente.')
    }
    setSubmitting(false)
  }

  const inputClass = (field: keyof FormState) =>
    `w-full bg-black/40 border-2 rounded-2xl px-6 py-4 text-white placeholder:text-zinc-700 outline-none transition-all ${
      errors[field] ? 'border-red-500 focus:border-red-400' : 'border-white/5 focus:border-[#00f3ff] focus:shadow-[0_0_15px_rgba(0,243,255,0.1)]'
    }`

  if (cartLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-[#00f3ff] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-6">
            <Icon icon="lucide:shopping-cart" className="text-6xl text-zinc-700 mx-auto" />
            <p className="text-zinc-400 font-black uppercase tracking-widest">Seu carrinho está vazio</p>
            <Link href="/produtos" className="inline-block px-8 py-4 bg-[#00f3ff] text-black font-black uppercase rounded-2xl hover:scale-105 transition-all">
              Ver Produtos
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-grid-dark">
      <Navbar />

      <main className="flex-1 pt-32 pb-24 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-12">

            {/* ── LEFT: FORM ────────────────────────────────── */}
            <div className="flex-1 space-y-12">

              {/* Steps indicator */}
              <div className="flex items-center max-w-md mb-8">
                {['Carrinho', 'Entrega', 'Pagamento'].map((step, i) => (
                  <div key={step} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                        i < 2 ? 'border-[#00f3ff] bg-[#00f3ff]/10 shadow-[0_0_15px_rgba(0,243,255,0.3)]' : 'border-[#00ff00] bg-[#00ff00]/10 shadow-[0_0_20px_rgba(0,255,0,0.4)] animate-pulse'
                      }`}>
                        {i < 2
                          ? <Icon icon="lucide:check" className={i === 0 ? 'text-[#00f3ff]' : 'text-[#ff00ff]'} />
                          : <span className="text-[#00ff00] font-black">3</span>
                        }
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${i === 0 ? 'text-[#00f3ff]' : i === 1 ? 'text-[#ff00ff]' : 'text-[#00ff00]'}`}>{step}</span>
                    </div>
                    {i < 2 && <div className={`h-0.5 flex-1 mx-4 ${i === 0 ? 'bg-gradient-to-r from-[#00f3ff] to-[#ff00ff]' : 'bg-gradient-to-r from-[#ff00ff] to-zinc-800'}`} />}
                  </div>
                ))}
              </div>

              {/* ── DADOS PESSOAIS ── */}
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-8 bg-[#00f3ff]" />
                  <h2 className="text-3xl font-black uppercase tracking-tighter">Dados Pessoais</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-full space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-4">Nome Completo *</label>
                    <input name="name" type="text" placeholder="Seu nome completo" value={form.name} onChange={handleChange}
                      className={inputClass('name')} />
                    {errors.name && <p className="text-red-400 text-[10px] font-bold ml-4">{errors.name}</p>}
                  </div>
                  <div className="col-span-full space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-4">Email *</label>
                    <input name="email" type="email" placeholder="seu@email.com" value={form.email} onChange={handleChange}
                      className={inputClass('email')} />
                    {errors.email && <p className="text-red-400 text-[10px] font-bold ml-4">{errors.email}</p>}
                  </div>
                </div>
              </section>

              {/* ── ENDEREÇO ── */}
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-8 bg-[#ff00ff]" />
                  <h2 className="text-3xl font-black uppercase tracking-tighter">Endereço de Entrega</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* CEP */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-4">CEP *</label>
                    <div className="relative">
                      <input name="cep" type="text" placeholder="00000-000" value={form.cep} onChange={handleChange}
                        className={inputClass('cep')} />
                      {cepLoading && (
                        <div className="absolute right-5 top-1/2 -translate-y-1/2">
                          <div className="w-4 h-4 border-2 border-[#00f3ff] border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                    {cepError && <p className="text-red-400 text-[10px] font-bold ml-4">{cepError}</p>}
                    {errors.cep && <p className="text-red-400 text-[10px] font-bold ml-4">{errors.cep}</p>}
                  </div>
                  {/* Bairro */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-4">Bairro</label>
                    <input name="bairro" type="text" placeholder="Seu bairro" value={form.bairro} onChange={handleChange}
                      className={inputClass('bairro')} />
                  </div>
                  {/* Rua */}
                  <div className="col-span-full space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-4">Rua / Logradouro *</label>
                    <input name="logradouro" type="text" placeholder="Rua das Impressões 3D" value={form.logradouro} onChange={handleChange}
                      className={inputClass('logradouro')} />
                    {errors.logradouro && <p className="text-red-400 text-[10px] font-bold ml-4">{errors.logradouro}</p>}
                  </div>
                  {/* Número */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-4">Número *</label>
                    <input name="numero" type="text" placeholder="42" value={form.numero} onChange={handleChange}
                      className={inputClass('numero')} />
                    {errors.numero && <p className="text-red-400 text-[10px] font-bold ml-4">{errors.numero}</p>}
                  </div>
                  {/* Complemento */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-4">Complemento</label>
                    <input name="complemento" type="text" placeholder="Apto, bloco, andar..." value={form.complemento} onChange={handleChange}
                      className={inputClass('complemento')} />
                  </div>
                  {/* Cidade */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-4">Cidade *</label>
                    <input name="city" type="text" placeholder="São Paulo" value={form.city} onChange={handleChange}
                      className={inputClass('city')} />
                    {errors.city && <p className="text-red-400 text-[10px] font-bold ml-4">{errors.city}</p>}
                  </div>
                  {/* Estado */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-4">Estado</label>
                    <input name="state" type="text" placeholder="SP" value={form.state} onChange={handleChange}
                      className={inputClass('state')} maxLength={2} />
                  </div>
                </div>
              </section>

              {/* ── ENTREGA CORREIOS ── */}
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-8 bg-[#00f3ff]" />
                  <h2 className="text-3xl font-black uppercase tracking-tighter">Entrega — Correios</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {SHIPPING_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setShipping(opt.id)}
                      className={`block text-left p-6 bg-black/40 border-2 rounded-3xl transition-all cursor-pointer ${
                        shipping === opt.id
                          ? 'border-[#00f3ff] shadow-[0_0_15px_rgba(0,243,255,0.2)]'
                          : 'border-white/5 hover:border-white/10'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <Icon icon={opt.icon} className="text-2xl text-zinc-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: opt.color }}>
                          {opt.priceLabel}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <Icon icon="simple-icons:correios" className="text-base text-yellow-500" />
                        <h3 className="font-black uppercase text-xs">{opt.label}</h3>
                      </div>
                      <p className="text-[10px] text-zinc-500 uppercase">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </section>

              {/* ── PAGAMENTO ── */}
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-8 bg-[#00ff00]" />
                  <h2 className="text-3xl font-black uppercase tracking-tighter">Pagamento Seguro</h2>
                </div>

                {/* Tabs */}
                <div className="flex gap-4">
                  {(['credito', 'pix'] as PayMethod[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setPayMethod(m)}
                      className={`flex items-center gap-3 px-6 py-3 rounded-2xl border-2 font-black uppercase text-xs tracking-widest transition-all cursor-pointer ${
                        payMethod === m
                          ? 'border-[#00ff00] bg-[#00ff00]/10 text-[#00ff00] shadow-[0_0_15px_rgba(0,255,0,0.2)]'
                          : 'border-white/5 text-zinc-500 hover:border-white/10'
                      }`}
                    >
                      <Icon icon={m === 'credito' ? 'lucide:credit-card' : 'simple-icons:pix'} className="text-lg" />
                      {m === 'credito' ? 'Cartão de Crédito' : 'PIX'}
                    </button>
                  ))}
                </div>

                <div className="p-8 bg-black/60 border-2 border-white/5 rounded-[40px] space-y-6">
                  {payMethod === 'credito' ? (
                    <>
                      {/* Nome no cartão */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-4">Nome no Cartão *</label>
                        <input name="cardName" type="text" placeholder="NOME SOBRENOME" value={form.cardName} onChange={handleChange}
                          className={`w-full bg-zinc-900/50 border-2 rounded-2xl px-6 py-4 text-white placeholder:text-zinc-800 outline-none transition-all uppercase ${errors.cardName ? 'border-red-500' : 'border-white/5 focus:border-[#00ff00]'}`} />
                        {errors.cardName && <p className="text-red-400 text-[10px] font-bold ml-4">{errors.cardName}</p>}
                      </div>
                      {/* Número */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-4">Número do Cartão *</label>
                        <div className="relative">
                          <input name="cardNumber" type="text" inputMode="numeric" placeholder="0000 0000 0000 0000" value={form.cardNumber} onChange={handleChange}
                            className={`w-full bg-zinc-900/50 border-2 rounded-2xl px-6 py-4 pr-16 text-white placeholder:text-zinc-800 outline-none transition-all ${errors.cardNumber ? 'border-red-500' : 'border-white/5 focus:border-[#00ff00]'}`} />
                          <Icon icon="logos:mastercard" className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl" />
                        </div>
                        {errors.cardNumber && <p className="text-red-400 text-[10px] font-bold ml-4">{errors.cardNumber}</p>}
                      </div>
                      {/* Validade + CVV */}
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-4">Validade *</label>
                          <input name="cardExpiry" type="text" inputMode="numeric" placeholder="MM/AA" value={form.cardExpiry} onChange={handleChange}
                            className={`w-full bg-zinc-900/50 border-2 rounded-2xl px-6 py-4 text-white placeholder:text-zinc-800 outline-none transition-all ${errors.cardExpiry ? 'border-red-500' : 'border-white/5 focus:border-[#00ff00]'}`} />
                          {errors.cardExpiry && <p className="text-red-400 text-[10px] font-bold ml-4">{errors.cardExpiry}</p>}
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-4">CVV *</label>
                          <input name="cardCvv" type="text" inputMode="numeric" placeholder="123" value={form.cardCvv} onChange={handleChange}
                            className={`w-full bg-zinc-900/50 border-2 rounded-2xl px-6 py-4 text-white placeholder:text-zinc-800 outline-none transition-all ${errors.cardCvv ? 'border-red-500' : 'border-white/5 focus:border-[#00ff00]'}`} />
                          {errors.cardCvv && <p className="text-red-400 text-[10px] font-bold ml-4">{errors.cardCvv}</p>}
                        </div>
                      </div>
                      {/* Parcelamento */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-4">Parcelamento</label>
                        <select name="installments" value={form.installments} onChange={handleChange}
                          className="w-full bg-zinc-900/50 border-2 border-white/5 rounded-2xl px-6 py-4 text-white outline-none focus:border-[#00ff00] transition-all appearance-none cursor-pointer">
                          {[1,2,3,4,5,6].map((n) => (
                            <option key={n} value={n}>
                              {n}x de R$ {(orderTotal / n).toFixed(2).replace('.', ',')} {n === 1 ? '(sem juros)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  ) : (
                    /* PIX */
                    <div className="text-center space-y-6 py-4">
                      <div className="w-40 h-40 mx-auto bg-white rounded-3xl flex items-center justify-center">
                        <Icon icon="simple-icons:pix" className="text-7xl text-[#32BCAD]" />
                      </div>
                      <div>
                        <p className="text-white font-black uppercase tracking-widest text-sm">Pague com PIX</p>
                        <p className="text-zinc-500 text-xs mt-2 font-bold uppercase">O QR Code será gerado após confirmar o pedido</p>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-[#00ff00]">
                        <Icon icon="lucide:zap" className="text-sm" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Confirmação instantânea</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 p-4 bg-[#00ff00]/5 rounded-2xl border border-[#00ff00]/10">
                    <Icon icon="lucide:shield-check" className="text-[#00ff00] text-xl shrink-0" />
                    <p className="text-[10px] font-bold text-[#00ff00] uppercase tracking-widest">Seus dados estão protegidos com criptografia SSL</p>
                  </div>
                </div>
              </section>
            </div>

            {/* ── RIGHT: ORDER SUMMARY ─────────────────────── */}
            <aside className="lg:w-96">
              <div className="sticky top-28 space-y-8">
                <div className="bg-zinc-900/80 border-2 border-white/5 rounded-[40px] p-8 space-y-8 shadow-2xl">
                  <h2 className="text-xl font-black uppercase tracking-widest text-white border-b-2 border-white/5 pb-6">
                    Resumo do Pedido
                  </h2>

                  {/* Items */}
                  <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                    {items.map((item) => (
                      <div key={item.slug} className="flex gap-4">
                        <div className="w-16 h-16 bg-zinc-800 rounded-2xl overflow-hidden shrink-0 border border-white/10">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-black uppercase text-zinc-200 leading-tight truncate">{item.name}</h4>
                          <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1">
                            {item.qty}x · R$ {item.price.toFixed(2).replace('.', ',')}
                          </p>
                          <p className="text-[10px] font-black mt-0.5" style={{ color: item.color || '#00f3ff' }}>
                            R$ {(item.price * item.qty).toFixed(2).replace('.', ',')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="space-y-4 pt-6 border-t border-white/5">
                    <div className="flex justify-between text-xs font-bold uppercase text-zinc-500">
                      <span>Subtotal</span>
                      <span>R$ {total.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold uppercase">
                      <span className="text-zinc-500">Entrega ({shippingOption.label})</span>
                      <span style={{ color: shippingOption.color }}>
                        {shippingCost === 0 ? 'Grátis' : `R$ ${shippingCost.toFixed(2).replace('.', ',')}`}
                      </span>
                    </div>
                    {payMethod === 'credito' && parseInt(form.installments) > 1 && (
                      <div className="flex justify-between text-xs font-bold uppercase text-zinc-500">
                        <span>Parcelamento</span>
                        <span>{form.installments}x de R$ {(orderTotal / parseInt(form.installments)).toFixed(2).replace('.', ',')}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-end pt-4">
                      <span className="text-xs font-black uppercase text-white">Total</span>
                      <span className="text-3xl font-black text-white">R$ {orderTotal.toFixed(2).replace('.', ',')}</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="relative w-full group overflow-hidden mt-4 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#00f3ff] via-[#ff00ff] to-[#00ff00] rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-500" />
                    <div className="relative flex items-center justify-center gap-3 w-full bg-white text-black py-6 rounded-2xl font-black uppercase text-sm tracking-[0.2em] transition-all group-hover:bg-black group-hover:text-white">
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Processando...
                        </>
                      ) : (
                        <>
                          Finalizar Compra
                          <Icon icon="lucide:arrow-right" />
                        </>
                      )}
                    </div>
                  </button>

                  {/* Payment icons */}
                  <div className="flex justify-center gap-4 pt-2">
                    <Icon icon="simple-icons:pix" className="text-2xl text-[#32BCAD]" />
                    <Icon icon="logos:visa" className="text-2xl" />
                    <Icon icon="logos:mastercard" className="text-2xl" />
                    <Icon icon="simple-icons:correios" className="text-2xl text-yellow-500" />
                  </div>
                </div>

                <div className="p-6 border-2 border-white/5 rounded-3xl text-center space-y-3">
                  <Icon icon="lucide:lock" className="text-2xl text-zinc-500" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Ambiente 100% Seguro</p>
                  <p className="text-[10px] text-zinc-600 uppercase">Dados protegidos com criptografia de ponta a ponta.</p>
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
