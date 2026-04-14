'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getOrderById, getTrackingEvents } from '@/lib/db'
import { useAuth } from '@/context/AuthContext'

// ─── tipos ───────────────────────────────────────────────────────────────────

type OrderStatus = 'confirmado' | 'impressao' | 'transito' | 'entregue'

interface TrackingEvent {
  date: string
  title: string
  subtitle?: string
  detail?: string
}

interface OrderItem {
  name: string
  detail: string
  color: string
}

interface Order {
  id: string
  status: OrderStatus
  carrier: string
  trackingCode: string
  address: string
  estimatedDelivery: string
  items: OrderItem[]
  events: TrackingEvent[]
}

// ─── banco de pedidos simulados ───────────────────────────────────────────────

const ORDERS: Record<string, Order> = {
  'BLU-98421': {
    id: 'BLU-98421',
    status: 'transito',
    carrier: 'Correios PAC',
    trackingCode: 'BLU9842100X',
    address: 'Rua dos Gamers, 1337 • Apto 404\nBairro Printverso • São Paulo, SP\n01234-567',
    estimatedDelivery: '16 Abr, 2026',
    items: [
      { name: 'Charizard — Ed. Limitada', detail: 'Qtd: 1 • Resina 8K', color: '#ff6b35' },
      { name: 'Mewtwo Shiny', detail: 'Qtd: 1 • Resina 8K', color: '#00f3ff' },
    ],
    events: [
      { date: 'Hoje, 08:32', title: 'Em rota para o cliente', subtitle: 'Motorista: Carlos R.', detail: 'O pacote saiu do centro logístico e está no veículo de entrega final.' },
      { date: 'Ontem, 21:50', title: 'Triagem Hub Logístico Sul', subtitle: 'Guarulhos – SP' },
      { date: 'Ontem, 14:15', title: 'Postado pela Balu 3D', subtitle: 'Balu 3D Matriz — São Paulo, SP' },
      { date: '13 Abr, 14:15', title: 'Impressão finalizada e embalado', subtitle: 'Controle de qualidade: aprovado ✓' },
      { date: '12 Abr, 09:42', title: 'Pedido confirmado e pago', subtitle: 'Entrou na fila de impressão' },
    ],
  },
  'BLU-77010': {
    id: 'BLU-77010',
    status: 'impressao',
    carrier: 'Correios SEDEX',
    trackingCode: 'Ainda não disponível',
    address: 'Av. Nerd, 42 • Bloco B\nVila Pixel • Rio de Janeiro, RJ\n22041-001',
    estimatedDelivery: '19 Abr, 2026',
    items: [
      { name: 'Kratos God of War', detail: 'Qtd: 1 • Ed. Exclusiva', color: '#ff00ff' },
    ],
    events: [
      { date: 'Hoje, 10:05', title: 'Impressão 3D em andamento', subtitle: 'Camada 142 / 280 — ~6h restantes', detail: 'Seu item está sendo impresso em resina 8K.' },
      { date: '13 Abr, 18:00', title: 'Pedido confirmado e pago', subtitle: 'Entrou na fila de impressão' },
    ],
  },
  'BLU-55302': {
    id: 'BLU-55302',
    status: 'entregue',
    carrier: 'Correios PAC',
    trackingCode: 'BLU5530200Z',
    address: 'Rua da República, 99\nCentro • Curitiba, PR\n80010-000',
    estimatedDelivery: '10 Abr, 2026',
    items: [
      { name: 'Pikachu Classic', detail: 'Qtd: 2 • Resina 8K', color: '#f7c948' },
      { name: 'Gengar Shiny', detail: 'Qtd: 1 • Resina 8K', color: '#a855f7' },
    ],
    events: [
      { date: '10 Abr, 14:20', title: 'Entregue ao destinatário', subtitle: 'Assinatura coletada', detail: 'Entrega concluída com sucesso.' },
      { date: '10 Abr, 09:01', title: 'Em rota para o cliente', subtitle: 'Motorista: Ana P.' },
      { date: '09 Abr, 22:10', title: 'Triagem Hub Logístico Sul', subtitle: 'Curitiba – PR' },
      { date: '08 Abr, 16:00', title: 'Postado pela Balu 3D', subtitle: 'Balu 3D Matriz — São Paulo, SP' },
      { date: '06 Abr, 11:30', title: 'Impressão finalizada e embalado', subtitle: 'Controle de qualidade: aprovado ✓' },
      { date: '05 Abr, 09:00', title: 'Pedido confirmado e pago', subtitle: 'Entrou na fila de impressão' },
    ],
  },
  'BLU-33199': {
    id: 'BLU-33199',
    status: 'confirmado',
    carrier: 'Correios PAC',
    trackingCode: 'Ainda não disponível',
    address: 'Rua Sakura, 7 • Casa 3\nJd. Anime • Belo Horizonte, MG\n30130-010',
    estimatedDelivery: '22 Abr, 2026',
    items: [
      { name: 'Naruto Sage Mode', detail: 'Qtd: 1 • Resina 8K', color: '#ff6b00' },
    ],
    events: [
      { date: 'Hoje, 12:45', title: 'Pedido confirmado e pago', subtitle: 'Aguardando início da impressão' },
    ],
  },
}

// ─── helpers ──────────────────────────────────────────────────────────────────

const STATUS_STEPS: { key: OrderStatus; icon: string; label: string }[] = [
  { key: 'confirmado', icon: 'lucide:check', label: 'Confirmado' },
  { key: 'impressao', icon: 'lucide:layers', label: 'Em Impressão' },
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
  // between 4 nodes: 0%, 33%, 66%, 100%
  return Math.round((idx / (STATUS_ORDER.length - 1)) * 100)
}

// ─── componente ──────────────────────────────────────────────────────────────

export default function RastreamentoPage() {
  const { user } = useAuth()
  const [input, setInput] = useState('')
  const [searched, setSearched] = useState(false)
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const normalized = input.trim().toUpperCase()
    setLoading(true)
    setSearched(false)

    try {
      // 1. Tenta buscar no Firestore pelo ID real do pedido
      const firestoreOrder = await getOrderById(normalized)
      if (firestoreOrder) {
        const events = await getTrackingEvents(normalized)
        // Converte para o formato local
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
          events: events.length > 0 ? events : [
            { date: 'Pedido criado', title: 'Pedido confirmado e pago', subtitle: 'Aguardando início da impressão' }
          ],
        }
        setOrder(mapped)
        setSearched(true)
        setLoading(false)
        return
      }
    } catch {
      // Firestore falhou ou não encontrou — tenta mock abaixo
    }

    // 2. Fallback: pedidos mock de demonstração
    setTimeout(() => {
      setOrder(ORDERS[normalized] ?? null)
      setSearched(true)
      setLoading(false)
    }, 400)
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const color = order ? STATUS_COLOR[order.status] : '#00f3ff'

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
      <Navbar />

      <main className="flex-1 pt-20">
        {/* ── HEADER ────────────────────────────────────────────────── */}
        <section className="bg-[#1a1a1a] bg-grid-dark py-16 md:py-24 px-4 md:px-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00f3ff]/10 via-transparent to-[#ff00ff]/10 pointer-events-none" />
          <div className="max-w-4xl mx-auto relative z-10 text-center">
            <nav className="flex items-center justify-center gap-2 text-xs text-zinc-500 font-bold uppercase mb-6">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <Icon icon="lucide:chevron-right" className="text-xs" />
              <span className="text-[#00f3ff]">Rastreamento</span>
            </nav>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tighter text-white leading-none mb-4">
              Rastrear <span className="text-[#00f3ff]">Pedido</span>
            </h1>
            <p className="text-zinc-500 font-bold text-sm mb-10 max-w-sm mx-auto">
              Digite o número do seu pedido (ex: BLU-98421) para ver o status em tempo real.
            </p>

            {/* Search form */}
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
              <div className="relative flex-1">
                <Icon icon="lucide:search" className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-lg pointer-events-none" />
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="BLU-00000"
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

            {/* Hint pedidos demo */}
            <p className="text-zinc-600 text-xs mt-4 font-bold">
              Pedidos de teste: BLU-98421 · BLU-77010 · BLU-55302 · BLU-33199
            </p>
          </div>
        </section>

        {/* ── RESULTADO ─────────────────────────────────────────────── */}
        {searched && (
          <section className="py-12 md:py-20 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">

              {/* Não encontrado */}
              {!order && (
                <div className="text-center py-24">
                  <Icon icon="lucide:package-x" className="text-7xl text-zinc-700 mx-auto mb-6" />
                  <h2 className="text-2xl font-black uppercase text-white mb-3">Pedido não encontrado</h2>
                  <p className="text-zinc-500 font-bold mb-8 max-w-sm mx-auto">
                    Não encontramos nenhum pedido com o código <span className="text-white">&ldquo;{input.trim().toUpperCase()}&rdquo;</span>. Verifique o número e tente novamente.
                  </p>
                  <a
                    href="https://wa.me/550000000000"
                    className="inline-flex items-center gap-3 bg-[#25D366] text-white px-8 py-4 rounded-2xl font-black uppercase text-sm hover:scale-105 hover:shadow-[0_0_30px_rgba(37,211,102,0.4)] transition-all"
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
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 mb-1">Pedido Encontrado</p>
                      <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white">
                        PEDIDO <span style={{ color }}>#{order.id}</span>
                      </h2>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Status Atual</p>
                        <p className="text-lg font-black uppercase" style={{ color }}>{STATUS_LABEL[order.status]}</p>
                      </div>
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center border-2"
                        style={{ borderColor: color, boxShadow: `0 0 20px ${color}44` }}
                      >
                        <Icon icon={STATUS_ICON[order.status]} className="text-3xl" style={{ color }} />
                      </div>
                    </div>
                  </div>

                  {/* Timeline de status */}
                  <div className="bg-black border-2 border-zinc-800 rounded-[40px] p-8 md:p-12 mb-10 overflow-hidden relative">
                    <div className="grid grid-cols-4 gap-4 relative">
                      {/* Barra de progresso */}
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
                          <div key={step.key} className="relative flex md:flex-col items-center gap-3 md:text-center col-span-1">
                            <div
                              className="w-14 h-14 rounded-full flex items-center justify-center z-10 flex-shrink-0 border-4 transition-all"
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
                                className="text-xl"
                                style={{ color: isActive ? 'black' : isDone ? '#00ff00' : '#3f3f46' }}
                              />
                            </div>
                            <div className="hidden md:block">
                              <h4 className="font-black uppercase text-xs mb-1" style={{ color: isActive ? 'white' : isDone ? '#00ff00' : '#3f3f46' }}>
                                {step.label}
                              </h4>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Legenda mobile */}
                    <div className="md:hidden mt-6 flex justify-between text-[10px] font-black uppercase text-zinc-600">
                      {STATUS_STEPS.map((step) => {
                        const thisIdx = stepIndex(step.key)
                        const curIdx = stepIndex(order.status)
                        const isActive = thisIdx === curIdx
                        const isDone = thisIdx < curIdx
                        return (
                          <span key={step.key} style={{ color: isActive ? color : isDone ? '#00ff00' : undefined }}>
                            {step.label}
                          </span>
                        )
                      })}
                    </div>

                    {/* Previsão */}
                    {order.status !== 'entregue' && (
                      <div className="mt-8 pt-8 border-t border-zinc-800 flex items-center gap-3 text-sm">
                        <Icon icon="lucide:calendar-clock" className="text-[#00f3ff] text-xl flex-shrink-0" />
                        <span className="text-zinc-400 font-bold">Previsão de entrega:</span>
                        <span className="font-black text-white">{order.estimatedDelivery}</span>
                      </div>
                    )}
                    {order.status === 'entregue' && (
                      <div className="mt-8 pt-8 border-t border-zinc-800 flex items-center gap-3 text-sm">
                        <Icon icon="lucide:package-check" className="text-[#00ff00] text-xl flex-shrink-0" />
                        <span className="font-black text-[#00ff00]">Pedido entregue em {order.estimatedDelivery}</span>
                      </div>
                    )}
                  </div>

                  {/* Conteúdo principal */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Log de eventos */}
                    <div className="lg:col-span-2 bg-black border-2 border-zinc-800 rounded-[40px] p-8 md:p-10">
                      <h3 className="text-xl font-black uppercase mb-8 flex items-center gap-3">
                        <Icon icon="lucide:history" className="text-[#ff00ff]" />
                        Histórico de Eventos
                      </h3>
                      <div className="space-y-8">
                        {order.events.map((ev, i) => {
                          const isFirst = i === 0
                          const isLast = i === order.events.length - 1
                          return (
                            <div key={i} className="flex gap-5 relative">
                              {!isLast && (
                                <div className="absolute left-[11px] top-6 bottom-[-32px] w-0.5 bg-zinc-800" />
                              )}
                              <div
                                className="w-6 h-6 rounded-full border-4 border-black z-10 flex-shrink-0 mt-0.5"
                                style={{ background: isFirst ? color : '#3f3f46' }}
                              />
                              <div>
                                <p className={`text-sm font-black uppercase tracking-tight mb-1 ${isFirst ? 'text-white' : 'text-zinc-400'}`}>
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
                    <div className="flex flex-col gap-6">

                      {/* Informações de envio */}
                      <div className="bg-zinc-900/50 border-2 border-zinc-800 rounded-[40px] p-8">
                        <p className="text-[10px] font-black uppercase text-zinc-600 mb-6 tracking-widest">Informações de Envio</p>
                        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-zinc-800">
                          <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center border border-white/10 flex-shrink-0">
                            <Icon icon="lucide:box" className="text-2xl text-[#00f3ff]" />
                          </div>
                          <div>
                            <p className="text-xs text-zinc-500 font-bold uppercase mb-0.5">Transportadora</p>
                            <p className="text-sm font-black text-white">{order.carrier}</p>
                          </div>
                        </div>
                        <div className="space-y-5">
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
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-zinc-600 uppercase mb-2">Endereço de Destino</p>
                            <p className="text-xs font-bold text-zinc-400 leading-relaxed whitespace-pre-line">{order.address}</p>
                          </div>
                        </div>
                      </div>

                      {/* Itens do pedido */}
                      <div className="bg-black border-2 border-zinc-800 rounded-[40px] p-8">
                        <p className="text-[10px] font-black uppercase text-zinc-600 mb-6 tracking-widest">Itens no Pacote</p>
                        <div className="space-y-5">
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
                      <div className="bg-gradient-to-br from-zinc-900 to-black border-2 border-[#00ff00]/20 rounded-[40px] p-8 relative overflow-hidden">
                        <div className="absolute -right-4 -bottom-4 opacity-10">
                          <Icon icon="lucide:help-circle" className="text-8xl text-[#00ff00]" />
                        </div>
                        <h4 className="text-lg font-black uppercase mb-2 text-white">Algum problema?</h4>
                        <p className="text-xs text-zinc-500 font-bold mb-6 leading-relaxed">
                          Nosso suporte está online para ajudar com qualquer dúvida sobre sua entrega.
                        </p>
                        <a
                          href="https://wa.me/550000000000"
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

        {/* ── EMPTY STATE INICIAL ───────────────────────────────────── */}
        {!searched && !loading && (
          <section className="py-20 px-4 md:px-8">
            <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { icon: 'lucide:check-circle', color: '#00ff00', label: 'Confirmado', desc: 'Pagamento aprovado, entrando na fila de impressão.' },
                { icon: 'lucide:layers', color: '#ff00ff', label: 'Em Impressão', desc: 'Sua figura está sendo impressa em resina 8K.' },
                { icon: 'lucide:truck', color: '#00f3ff', label: 'Em Trânsito', desc: 'A caminho de você — acompanhe em tempo real.' },
                { icon: 'lucide:package-check', color: '#00ff00', label: 'Entregue', desc: 'Seu pedido chegou ao destino com sucesso.' },
              ].map((s) => (
                <div key={s.label} className="bg-zinc-900/40 border border-white/5 rounded-[30px] p-6 flex items-start gap-5">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${s.color}15`, border: `1px solid ${s.color}44` }}>
                    <Icon icon={s.icon} className="text-2xl" style={{ color: s.color }} />
                  </div>
                  <div>
                    <p className="font-black uppercase text-sm text-white mb-1">{s.label}</p>
                    <p className="text-xs text-zinc-500 font-bold leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}
