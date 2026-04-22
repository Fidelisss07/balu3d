'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getOrderById, getTrackingEvents, getOrdersByUser } from '@/lib/db'
import type { Order as DbOrder } from '@/lib/db'

const WA_URL = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP ?? '5511999999999'}`
import { useAuth } from '@/context/AuthContext'

// ─── tipos ───────────────────────────────────────────────────────────────────

type OrderStatus = 'confirmado' | 'impressao' | 'transito' | 'entregue'

interface TrackingEvent {
  date: string
  title: string
  subtitle?: string
  detail?: string
}

interface Order {
  id: string
  status: OrderStatus
  carrier: string
  trackingCode: string
  address: string
  estimatedDelivery: string
  items: { name: string; detail: string; color: string }[]
  events: TrackingEvent[]
}

// ─── helpers ──────────────────────────────────────────────────────────────────

const STATUS_STEPS: { key: OrderStatus; icon: string; label: string }[] = [
  { key: 'confirmado', icon: 'lucide:check', label: 'Confirmado' },
  { key: 'impressao', icon: 'lucide:layers', label: 'Impressão' },
  { key: 'transito', icon: 'lucide:truck', label: 'Em Trânsito' },
  { key: 'entregue', icon: 'lucide:home', label: 'Entregue' },
]

const STATUS_ORDER: OrderStatus[] = ['confirmado', 'impressao', 'transito', 'entregue']

const STATUS_LABEL: Record<OrderStatus, string> = {
  confirmado: 'Confirmado',
  impressao: 'Em Impressão',
  transito: 'Em Trânsito',
  entregue: 'Entregue',
}

const STATUS_COLOR: Record<OrderStatus, string> = {
  confirmado: '#00ff00',
  impressao: '#ff00ff',
  transito: '#00f3ff',
  entregue: '#00ff00',
}

const STATUS_ICON: Record<OrderStatus, string> = {
  confirmado: 'lucide:check',
  impressao: 'lucide:layers',
  transito: 'lucide:truck',
  entregue: 'lucide:package-check',
}

function stepIndex(status: OrderStatus) {
  return STATUS_ORDER.indexOf(status)
}

function progressPercent(status: OrderStatus) {
  const idx = stepIndex(status)
  return Math.round((idx / (STATUS_ORDER.length - 1)) * 100)
}

// Detecta se é código dos Correios (formato: 2 letras + 9 dígitos + 2 letras, ex: AA123456789BR)
function isCorreiosCode(code: string) {
  return /^[A-Z]{2}\d{9}[A-Z]{2}$/.test(code.trim().toUpperCase())
}

function correiosTrackUrl(code: string) {
  return `https://rastreamento.correios.com.br/app/index.php?objeto=${code.trim().toUpperCase()}`
}

// ─── inner page (usa useSearchParams) ────────────────────────────────────────

function RastreamentoInner() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const [input, setInput] = useState('')
  const [searched, setSearched] = useState(false)
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [myOrders, setMyOrders] = useState<DbOrder[]>([])
  const [myOrdersLoading, setMyOrdersLoading] = useState(false)

  // Carrega pedidos do usuário logado
  useEffect(() => {
    if (user) {
      setMyOrdersLoading(true)
      getOrdersByUser(user.uid).then((orders) => {
        setMyOrders(orders)
        setMyOrdersLoading(false)
      }).catch(() => setMyOrdersLoading(false))
    }
  }, [user])

  // Auto-busca quando vem de ?id= (ex: redirect do checkout)
  useEffect(() => {
    const id = searchParams.get('id')
    if (id) {
      setInput(id)
      doSearch(id)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchCorreiosEvents(code: string): Promise<TrackingEvent[]> {
    try {
      const res = await fetch(`https://brasilapi.com.br/api/correios/v1/${code}`, { signal: AbortSignal.timeout(6000) })
      if (!res.ok) return []
      const data = await res.json()
      // BrasilAPI retorna { eventos: [{ descricao, data, hora, origem }] }
      const eventos: { descricao?: string; description?: string; data?: string; hora?: string; origem?: { cidade?: string; uf?: string } }[] = data?.eventos ?? data?.objeto?.[0]?.evento ?? []
      return eventos.map((ev) => ({
        date: ev.data ? `${ev.data}${ev.hora ? ' ' + ev.hora : ''}` : '—',
        title: ev.descricao ?? ev.description ?? 'Atualização dos Correios',
        subtitle: ev.origem?.cidade ? `${ev.origem.cidade}${ev.origem.uf ? ' – ' + ev.origem.uf : ''}` : undefined,
      }))
    } catch {
      return []
    }
  }

  async function doSearch(query: string) {
    const normalized = query.trim()
    if (!normalized) return
    setLoading(true)
    setSearched(false)

    try {
      const firestoreOrder = await getOrderById(normalized)
      if (firestoreOrder) {
        const [manualEvents, correiosEvents] = await Promise.all([
          getTrackingEvents(normalized),
          firestoreOrder.trackingCode && isCorreiosCode(firestoreOrder.trackingCode)
            ? fetchCorreiosEvents(firestoreOrder.trackingCode)
            : Promise.resolve([]),
        ])

        // Mescla: eventos dos Correios primeiro (mais recentes), depois os manuais do admin
        const allEvents: TrackingEvent[] = [
          ...correiosEvents,
          ...manualEvents,
        ]
        if (allEvents.length === 0) {
          allEvents.push({ date: 'Pedido criado', title: 'Pedido confirmado e pago', subtitle: 'Aguardando início da impressão' })
        }

        const mapped: Order = {
          id: firestoreOrder.id ?? normalized,
          status: firestoreOrder.status as OrderStatus,
          carrier: firestoreOrder.carrier ?? 'Correios PAC',
          trackingCode: firestoreOrder.trackingCode ?? 'Ainda não disponível',
          address: firestoreOrder.address
            ? `${firestoreOrder.address.logradouro}\n${firestoreOrder.address.city}, ${firestoreOrder.address.state}\n${firestoreOrder.address.cep}`
            : '',
          estimatedDelivery: firestoreOrder.estimatedDelivery ?? '—',
          items: firestoreOrder.items.map((i) => ({
            name: i.name,
            detail: `Qtd: ${i.qty} · Resina 8K`,
            color: i.color,
          })),
          events: allEvents,
        }
        setOrder(mapped)
        setSearched(true)
        setLoading(false)
        return
      }
    } catch {
      setOrder(null)
      setSearched(true)
      setLoading(false)
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    await doSearch(input)
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const color = order ? STATUS_COLOR[order.status] : '#00f3ff'
  const hasCorreiosCode = order && isCorreiosCode(order.trackingCode)

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
      <Navbar />

      <main className="flex-1 pt-16 md:pt-20">
        {/* ── HEADER ────────────────────────────────────────────────── */}
        <section className="bg-[#1a1a1a] bg-grid-dark py-12 md:py-24 px-4 md:px-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00f3ff]/10 via-transparent to-[#ff00ff]/10 pointer-events-none" />
          <div className="max-w-4xl mx-auto relative z-10 text-center">
            <nav className="flex items-center justify-center gap-2 text-xs text-zinc-500 font-bold uppercase mb-6">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <Icon icon="lucide:chevron-right" className="text-xs" />
              <span className="text-[#00f3ff]">Rastreamento</span>
            </nav>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter text-white leading-none mb-4">
              Rastrear <span className="text-[#00f3ff]">Pedido</span>
            </h1>
            <p className="text-zinc-500 font-bold text-sm mb-8 max-w-sm mx-auto">
              Digite o número do seu pedido para ver o status em tempo real.
            </p>

            {/* Search form */}
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
              <div className="relative flex-1">
                <Icon icon="lucide:search" className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-lg pointer-events-none" />
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Cole o ID do pedido aqui"
                  className="w-full bg-zinc-900 border border-white/10 text-white pl-11 pr-4 py-4 rounded-2xl text-sm font-black uppercase placeholder:text-zinc-600 placeholder:normal-case placeholder:font-normal focus:outline-none focus:border-[#00f3ff] transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="px-8 py-4 bg-[#00f3ff] text-black font-black uppercase text-sm rounded-2xl hover:scale-105 hover:shadow-[0_0_25px_rgba(0,243,255,0.5)] transition-all disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Icon icon="lucide:loader-2" className="animate-spin" />
                    Buscando...
                  </span>
                ) : 'Buscar'}
              </button>
            </form>

          </div>
        </section>

        {/* ── RESULTADO ─────────────────────────────────────────────── */}
        {searched && (
          <section className="py-10 md:py-20 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">

              {/* Não encontrado */}
              {!order && (
                <div className="text-center py-16 md:py-24">
                  <Icon icon="lucide:package-x" className="text-6xl md:text-7xl text-zinc-700 mx-auto mb-6" />
                  <h2 className="text-xl md:text-2xl font-black uppercase text-white mb-3">Pedido não encontrado</h2>
                  <p className="text-zinc-500 font-bold mb-8 max-w-sm mx-auto text-sm">
                    Não encontramos nenhum pedido com o código <span className="text-white">&ldquo;{input.trim().toUpperCase()}&rdquo;</span>.
                  </p>
                  <a
                    href={WA_URL}
                    className="inline-flex items-center gap-3 bg-[#25D366] text-white px-6 py-4 rounded-2xl font-black uppercase text-sm hover:scale-105 hover:shadow-[0_0_30px_rgba(37,211,102,0.4)] transition-all"
                  >
                    <Icon icon="logos:whatsapp-icon" className="text-xl" />
                    Falar com Suporte
                  </a>
                </div>
              )}

              {/* Pedido encontrado */}
              {order && (
                <>
                  {/* Header do pedido */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 md:mb-10">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 mb-1">Pedido Encontrado</p>
                      <h2 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter text-white">
                        PEDIDO <span style={{ color }}>#{order.id}</span>
                      </h2>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Status Atual</p>
                        <p className="text-lg font-black uppercase" style={{ color }}>{STATUS_LABEL[order.status]}</p>
                      </div>
                      <div
                        className="w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center border-2"
                        style={{ borderColor: color, boxShadow: `0 0 20px ${color}44` }}
                      >
                        <Icon icon={STATUS_ICON[order.status]} className="text-2xl md:text-3xl" style={{ color }} />
                      </div>
                    </div>
                  </div>

                  {/* Timeline de status */}
                  <div className="bg-black border-2 border-zinc-800 rounded-[32px] md:rounded-[40px] p-6 md:p-12 mb-8 md:mb-10 overflow-hidden relative">
                    <div className="grid grid-cols-4 gap-2 md:gap-4 relative">
                      {/* Barra de progresso — só desktop */}
                      <div className="hidden md:block absolute top-7 left-[calc(12.5%)] right-[calc(12.5%)] h-1 bg-zinc-800">
                        <div
                          className="h-full transition-all duration-700"
                          style={{
                            width: `${progressPercent(order.status)}%`,
                            background: `linear-gradient(to right, #00ff00, ${color})`,
                          }}
                        />
                      </div>

                      {STATUS_STEPS.map((step) => {
                        const thisIdx = stepIndex(step.key)
                        const curIdx = stepIndex(order.status)
                        const isDone = thisIdx < curIdx
                        const isActive = thisIdx === curIdx
                        return (
                          <div key={step.key} className="relative flex flex-col items-center text-center gap-2">
                            <div
                              className="w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center z-10 flex-shrink-0 border-4 transition-all"
                              style={
                                isActive
                                  ? { background: color, borderColor: color, boxShadow: `0 0 25px ${color}66` }
                                  : isDone
                                  ? { background: 'black', borderColor: '#00ff00', boxShadow: '0 0 12px rgba(0,255,0,0.3)' }
                                  : { background: 'black', borderColor: '#27272a' }
                              }
                            >
                              <Icon
                                icon={step.icon}
                                className="text-base md:text-xl"
                                style={{ color: isActive ? 'black' : isDone ? '#00ff00' : '#3f3f46' }}
                              />
                            </div>
                            <h4 className="font-black uppercase text-[9px] md:text-xs leading-tight" style={{ color: isActive ? 'white' : isDone ? '#00ff00' : '#3f3f46' }}>
                              {step.label}
                            </h4>
                          </div>
                        )
                      })}
                    </div>

                    {/* Previsão */}
                    {order.status !== 'entregue' && (
                      <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-zinc-800 flex items-center gap-3 text-sm">
                        <Icon icon="lucide:calendar-clock" className="text-[#00f3ff] text-xl flex-shrink-0" />
                        <span className="text-zinc-400 font-bold text-xs md:text-sm">Previsão de entrega:</span>
                        <span className="font-black text-white text-xs md:text-sm">{order.estimatedDelivery}</span>
                      </div>
                    )}
                    {order.status === 'entregue' && (
                      <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-zinc-800 flex items-center gap-3 text-sm">
                        <Icon icon="lucide:package-check" className="text-[#00ff00] text-xl flex-shrink-0" />
                        <span className="font-black text-[#00ff00] text-xs md:text-sm">Pedido entregue em {order.estimatedDelivery}</span>
                      </div>
                    )}
                  </div>

                  {/* Conteúdo principal */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

                    {/* Log de eventos */}
                    <div className="lg:col-span-2 bg-black border-2 border-zinc-800 rounded-[32px] md:rounded-[40px] p-6 md:p-10">
                      <h3 className="text-lg md:text-xl font-black uppercase mb-6 md:mb-8 flex items-center gap-3">
                        <Icon icon="lucide:history" className="text-[#ff00ff]" />
                        Histórico de Eventos
                      </h3>
                      <div className="space-y-6 md:space-y-8">
                        {order.events.map((ev, i) => {
                          const isFirst = i === 0
                          const isLast = i === order.events.length - 1
                          return (
                            <div key={i} className="flex gap-4 md:gap-5 relative">
                              {!isLast && (
                                <div className="absolute left-[9px] md:left-[11px] top-6 bottom-[-24px] md:bottom-[-32px] w-0.5 bg-zinc-800" />
                              )}
                              <div
                                className="w-5 h-5 md:w-6 md:h-6 rounded-full border-4 border-black z-10 flex-shrink-0 mt-0.5"
                                style={{ background: isFirst ? color : '#3f3f46' }}
                              />
                              <div>
                                <p className={`text-xs md:text-sm font-black uppercase tracking-tight mb-1 ${isFirst ? 'text-white' : 'text-zinc-400'}`}>
                                  {ev.title}
                                </p>
                                {ev.subtitle && (
                                  <p className="text-xs text-zinc-500 font-bold mb-1">{ev.date} · {ev.subtitle}</p>
                                )}
                                {!ev.subtitle && (
                                  <p className="text-xs text-zinc-500 font-bold mb-1">{ev.date}</p>
                                )}
                                {ev.detail && (
                                  <div className="bg-zinc-900 border border-white/5 p-3 rounded-xl text-xs text-zinc-400 leading-relaxed mt-2">
                                    {ev.detail}
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Sidebar */}
                    <div className="flex flex-col gap-4 md:gap-6">

                      {/* Informações de envio */}
                      <div className="bg-zinc-900/50 border-2 border-zinc-800 rounded-[32px] p-6 md:p-8">
                        <p className="text-[10px] font-black uppercase text-zinc-600 mb-5 tracking-widest">Informações de Envio</p>
                        <div className="flex items-center gap-4 mb-5 pb-5 border-b border-zinc-800">
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-black rounded-xl flex items-center justify-center border border-white/10 flex-shrink-0">
                            <Icon icon="lucide:box" className="text-xl md:text-2xl text-[#00f3ff]" />
                          </div>
                          <div>
                            <p className="text-xs text-zinc-500 font-bold uppercase mb-0.5">Transportadora</p>
                            <p className="text-sm font-black text-white">{order.carrier}</p>
                          </div>
                        </div>
                        <div className="space-y-4 md:space-y-5">
                          <div>
                            <p className="text-[10px] font-black text-zinc-600 uppercase mb-2">Código de Rastreio</p>
                            <div className="flex items-center justify-between bg-black p-3 rounded-xl border border-white/5 gap-2">
                              <code className="text-xs font-black text-[#00f3ff] break-all">{order.trackingCode}</code>
                              {order.trackingCode !== 'Ainda não disponível' && (
                                <button
                                  onClick={() => handleCopy(order.trackingCode)}
                                  className="text-zinc-500 hover:text-white transition-colors flex-shrink-0 cursor-pointer"
                                  aria-label="Copiar código"
                                >
                                  <Icon icon={copied ? 'lucide:check' : 'lucide:copy'} className={copied ? 'text-[#00ff00]' : ''} />
                                </button>
                              )}
                            </div>
                            {/* Link automático Correios */}
                            {hasCorreiosCode && (
                              <a
                                href={correiosTrackUrl(order.trackingCode)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 flex items-center gap-2 text-xs font-black text-[#f7c948] hover:text-white transition-colors group"
                              >
                                <Icon icon="lucide:external-link" className="text-sm" />
                                Rastrear nos Correios
                                <Icon icon="lucide:arrow-right" className="text-xs group-hover:translate-x-1 transition-transform" />
                              </a>
                            )}
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-zinc-600 uppercase mb-2">Endereço de Destino</p>
                            <p className="text-xs font-bold text-zinc-400 leading-relaxed whitespace-pre-line">{order.address}</p>
                          </div>
                        </div>
                      </div>

                      {/* Itens do pedido */}
                      <div className="bg-black border-2 border-zinc-800 rounded-[32px] p-6 md:p-8">
                        <p className="text-[10px] font-black uppercase text-zinc-600 mb-5 tracking-widest">Itens no Pacote</p>
                        <div className="space-y-4 md:space-y-5">
                          {order.items.map((item) => (
                            <div key={item.name} className="flex items-center gap-4">
                              <div
                                className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center border"
                                style={{ borderColor: `${item.color}44`, background: `${item.color}11` }}
                              >
                                <Icon icon="lucide:box" className="text-sm" style={{ color: item.color }} />
                              </div>
                              <div>
                                <p className="text-xs font-black text-white uppercase mb-0.5">{item.name}</p>
                                <p className="text-[10px] font-bold" style={{ color: item.color }}>{item.detail}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Suporte */}
                      <div className="bg-gradient-to-br from-zinc-900 to-black border-2 border-[#00ff00]/20 rounded-[32px] p-6 md:p-8 relative overflow-hidden">
                        <div className="absolute -right-4 -bottom-4 opacity-10">
                          <Icon icon="lucide:help-circle" className="text-8xl text-[#00ff00]" />
                        </div>
                        <h4 className="text-base md:text-lg font-black uppercase mb-2 text-white">Algum problema?</h4>
                        <p className="text-xs text-zinc-500 font-bold mb-5 leading-relaxed">
                          Nosso suporte está online para ajudar com qualquer dúvida sobre sua entrega.
                        </p>
                        <a
                          href={WA_URL}
                          className="w-full flex items-center justify-center gap-3 bg-zinc-900 border-2 border-[#00ff00] text-[#00ff00] py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-[#00ff00] hover:text-black transition-all shadow-[0_0_20px_rgba(0,255,0,0.2)] group cursor-pointer"
                        >
                          <Icon icon="logos:whatsapp-icon" className="text-lg" />
                          Suporte 24h
                          <Icon icon="lucide:arrow-right" className="group-hover:translate-x-1 transition-transform" />
                        </a>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        {/* ── EMPTY STATE ───────────────────────────────────────────── */}
        {!searched && !loading && (
          <section className="py-12 md:py-20 px-4 md:px-8">
            {user ? (
              /* Usuário logado: mostrar pedidos recentes */
              <div className="max-w-3xl mx-auto">
                <h2 className="text-xl font-black uppercase text-white mb-6 flex items-center gap-3">
                  <Icon icon="lucide:history" className="text-[#00f3ff]" />
                  Seus Pedidos Recentes
                </h2>
                {myOrdersLoading ? (
                  <div className="space-y-3">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="bg-zinc-900/40 border border-white/5 rounded-[24px] p-5 animate-pulse h-20" />
                    ))}
                  </div>
                ) : myOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <Icon icon="lucide:package" className="text-5xl text-zinc-700 mx-auto mb-4" />
                    <p className="text-zinc-500 font-bold mb-6">Você ainda não fez pedidos.</p>
                    <Link
                      href="/produtos"
                      className="inline-flex items-center gap-2 bg-[#00f3ff] text-black px-6 py-3 rounded-2xl font-black uppercase text-sm hover:scale-105 transition-all"
                    >
                      Ver Produtos
                      <Icon icon="lucide:arrow-right" />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myOrders.slice(0, 5).map((o) => {
                      const statusColor: Record<string, string> = { confirmado: '#00ff00', impressao: '#ff00ff', transito: '#00f3ff', entregue: '#00ff00', cancelado: '#ef4444' }
                      const statusLabel: Record<string, string> = { confirmado: 'Confirmado', impressao: 'Em Impressão', transito: 'Em Trânsito', entregue: 'Entregue', cancelado: 'Cancelado' }
                      const sc = statusColor[o.status] ?? '#ffffff'
                      const sl = statusLabel[o.status] ?? o.status
                      const dateStr = o.createdAt
                        ? new Date((o.createdAt as { toDate?: () => Date }).toDate?.() ?? o.createdAt as unknown as Date).toLocaleDateString('pt-BR')
                        : '—'
                      return (
                        <button
                          key={o.id}
                          onClick={() => { setInput(o.id!); doSearch(o.id!) }}
                          className="w-full bg-zinc-900/40 border border-white/5 hover:border-white/20 rounded-[24px] p-5 flex items-center justify-between gap-4 text-left transition-all hover:bg-zinc-900/70 cursor-pointer"
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                              style={{ background: `${sc}15`, border: `1px solid ${sc}44` }}
                            >
                              <Icon icon="lucide:package" className="text-lg" style={{ color: sc }} />
                            </div>
                            <div>
                              <p className="font-black uppercase text-sm text-white">{o.id}</p>
                              <p className="text-xs text-zinc-500 font-bold">{dateStr}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 flex-shrink-0">
                            <span className="text-sm font-black text-white hidden sm:block">
                              R$ {o.total.toFixed(2).replace('.', ',')}
                            </span>
                            <span
                              className="text-[10px] font-black uppercase px-2 py-1 rounded-lg"
                              style={{ background: `${sc}20`, color: sc }}
                            >
                              {sl}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* Não logado: cards informativos */
              <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                {[
                  { icon: 'lucide:check-circle', color: '#00ff00', label: 'Confirmado', desc: 'Pagamento aprovado, entrando na fila de impressão.' },
                  { icon: 'lucide:layers', color: '#ff00ff', label: 'Em Impressão', desc: 'Sua figura está sendo impressa em resina 8K.' },
                  { icon: 'lucide:truck', color: '#00f3ff', label: 'Em Trânsito', desc: 'A caminho de você — acompanhe em tempo real.' },
                  { icon: 'lucide:package-check', color: '#00ff00', label: 'Entregue', desc: 'Seu pedido chegou ao destino com sucesso.' },
                ].map((s) => (
                  <div key={s.label} className="bg-zinc-900/40 border border-white/5 rounded-[24px] md:rounded-[30px] p-5 md:p-6 flex items-start gap-4 md:gap-5">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${s.color}15`, border: `1px solid ${s.color}44` }}>
                      <Icon icon={s.icon} className="text-xl md:text-2xl" style={{ color: s.color }} />
                    </div>
                    <div>
                      <p className="font-black uppercase text-sm text-white mb-1">{s.label}</p>
                      <p className="text-xs text-zinc-500 font-bold leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}

// ─── wrapper com Suspense (exigido pelo useSearchParams) ──────────────────────

export default function RastreamentoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="w-10 h-10 border-2 border-[#00f3ff] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <RastreamentoInner />
    </Suspense>
  )
}
