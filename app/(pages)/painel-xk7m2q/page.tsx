'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import Navbar from '@/components/Navbar'
import { useAuth } from '@/context/AuthContext'
import TabAgenda from '@/components/admin/TabAgenda'
import TabCriarProduto from '@/components/admin/TabCriarProduto'
import {
  getAllOrders, getAllUsers, updateOrderStatus, addTrackingEvent,
  setUserRole, getFirestoreProducts, addFirestoreProduct, updateFirestoreProduct,
  deleteFirestoreProduct, getSiteConfig, updateSiteConfig, getCoupons, upsertCoupon, deleteCoupon,
  getFaq, updateFaq,
  getAgendaEvents, upsertAgendaEvent, deleteAgendaEvent,
  type Order, type TrackingEvent, type SiteConfig, type Coupon, type FaqCategory, type FaqItem, type AgendaEvent
} from '@/lib/db'
import { catalog } from '@/lib/catalog'

// ─── Types ────────────────────────────────────────────────────────────────────

type AdminTab = 'dashboard' | 'pedidos' | 'kanban' | 'produtos' | 'criar-produto' | 'clientes' | 'relatorio' | 'cupons' | 'faq' | 'agenda' | 'configuracoes'

interface FirestoreProduct {
  id: string
  name: string
  slug: string
  price: number
  oldPrice?: number
  category: string
  img: string
  images?: string[]
  description: string
  stock: number
  height: string
  color: string
  badges: string[]
  sizes?: string[]
  visible: boolean
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  confirmado: 'Confirmado',
  impressao: 'Em Impressão',
  transito: 'Em Trânsito',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
}

const STATUS_COLOR: Record<string, string> = {
  confirmado: '#00ff00',
  impressao: '#ff00ff',
  transito: '#00f3ff',
  entregue: '#00ff00',
  cancelado: '#ef4444',
}

const STATUS_ICON: Record<string, string> = {
  confirmado: 'lucide:check-circle',
  impressao: 'lucide:printer',
  transito: 'lucide:truck',
  entregue: 'lucide:package-check',
  cancelado: 'lucide:x-circle',
}

const KANBAN_COLUMNS: { id: Order['status']; label: string; color: string }[] = [
  { id: 'confirmado', label: 'Confirmado', color: '#00ff00' },
  { id: 'impressao', label: 'Em Impressão', color: '#ff00ff' },
  { id: 'transito', label: 'Em Trânsito', color: '#00f3ff' },
  { id: 'entregue', label: 'Entregue', color: '#00ff00' },
  { id: 'cancelado', label: 'Cancelado', color: '#ef4444' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return `R$ ${n.toFixed(2).replace('.', ',')}`
}

function fmtDate(ts: { seconds: number } | string | undefined) {
  if (!ts) return '—'
  const date = typeof ts === 'string' ? new Date(ts) : new Date((ts as { seconds: number }).seconds * 1000)
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function waLink(order: Order, message: string) {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP ?? '5511999999999'
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}

// ─── Componente de Modal de Detalhes do Pedido ───────────────────────────────

function OrderDetailModal({
  order,
  onClose,
  onAddEvent,
}: {
  order: Order
  onClose: () => void
  onAddEvent: (orderId: string, event: TrackingEvent) => Promise<void>
}) {
  const [events, setEvents] = useState<TrackingEvent[]>([])
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [newEventTitle, setNewEventTitle] = useState('')
  const [newEventDetail, setNewEventDetail] = useState('')
  const [addingEvent, setAddingEvent] = useState(false)

  useEffect(() => {
    if (!order.id) return
    import('@/lib/db').then(({ getTrackingEvents }) => {
      getTrackingEvents(order.id!).then((evs) => {
        setEvents(evs)
        setLoadingEvents(false)
      })
    })
  }, [order.id])

  async function handleAddEvent() {
    if (!newEventTitle.trim() || !order.id) return
    setAddingEvent(true)
    const event: TrackingEvent = {
      date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      title: newEventTitle.trim(),
      detail: newEventDetail.trim() || undefined,
    }
    await onAddEvent(order.id, event)
    setEvents((prev) => [event, ...prev])
    setNewEventTitle('')
    setNewEventDetail('')
    setAddingEvent(false)
  }

  const waMsg = `Olá ${order.userName}! Atualização do seu pedido #${order.id?.slice(0, 8).toUpperCase()} na Balu 3D: ${STATUS_LABEL[order.status]}. Acompanhe em: balu3d.com.br/rastreamento`

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0d0d0d] border border-zinc-800 rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800 sticky top-0 bg-[#0d0d0d] z-10">
          <div>
            <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Pedido</p>
            <h2 className="text-xl font-black text-white uppercase">#{order.id?.slice(0, 8).toUpperCase()}</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-black px-3 py-1 rounded-full" style={{ color: STATUS_COLOR[order.status], background: `${STATUS_COLOR[order.status]}15` }}>
              {STATUS_LABEL[order.status]}
            </span>
            <button onClick={onClose} className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-white/5 transition-all cursor-pointer">
              <Icon icon="lucide:x" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Cliente */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5">
            <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-3">Cliente</p>
            <p className="text-sm font-black text-white">{order.userName}</p>
            <p className="text-xs text-zinc-400">{order.userEmail}</p>
          </div>

          {/* Endereço */}
          {order.address && (
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5">
              <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-3">Endereço de Entrega</p>
              <p className="text-sm font-black text-white">{order.address.name}</p>
              <p className="text-xs text-zinc-400">{order.address.logradouro}</p>
              {order.address.bairro && <p className="text-xs text-zinc-400">{order.address.bairro}</p>}
              <p className="text-xs text-zinc-400">{order.address.city} — {order.address.state} · CEP {order.address.cep}</p>
              <p className="text-xs text-zinc-500 mt-1">{order.address.email}</p>
            </div>
          )}

          {/* Entrega + Pagamento */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4">
              <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-2">Tipo de Entrega</p>
              <p className="text-sm font-black text-white uppercase">{order.shippingMethod ?? '—'}</p>
              <p className="text-[10px] text-zinc-500 mt-1">{fmt(order.shipping)}</p>
            </div>
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4">
              <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-2">Pagamento</p>
              <p className="text-sm font-black text-white uppercase">{order.paymentMethod === 'pix' ? 'PIX' : 'Cartão de Crédito'}</p>
            </div>
          </div>

          {/* Itens */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5">
            <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-3">Itens do Pedido</p>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.slug} className="flex items-start gap-3 pb-4 border-b border-zinc-800 last:border-0 last:pb-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.img} alt={item.name} className="w-14 h-14 rounded-xl object-cover border border-white/5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-white">{item.name}</p>
                    {item.category && <p className="text-[10px] text-zinc-500 mt-0.5">{item.category}</p>}
                    {item.material && (
                      <p className="text-[10px] text-[#00f3ff] mt-0.5 flex items-center gap-1">
                        <Icon icon="lucide:layers" className="text-[10px]" /> {item.material}
                      </p>
                    )}
                    {item.size && (
                      <p className="text-[10px] text-[#ff00ff] mt-0.5 flex items-center gap-1">
                        <Icon icon="lucide:ruler" className="text-[10px]" /> Tamanho: {item.size}
                      </p>
                    )}
                    <p className="text-[10px] text-zinc-500 mt-1">Qtd: {item.qty} · {fmt(item.price)} un.</p>
                  </div>
                  <p className="text-xs font-black text-white shrink-0">{fmt(item.price * item.qty)}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-800 space-y-1">
              <div className="flex justify-between text-xs text-zinc-400"><span>Subtotal</span><span>{fmt(order.subtotal)}</span></div>
              <div className="flex justify-between text-xs text-zinc-400"><span>Frete ({order.shippingMethod})</span><span>{fmt(order.shipping)}</span></div>
              <div className="flex justify-between text-sm font-black text-white"><span>Total</span><span>{fmt(order.total)}</span></div>
            </div>
          </div>

          {/* Notificar via WhatsApp */}
          <div className="bg-[#25D366]/5 border border-[#25D366]/20 rounded-2xl p-5">
            <p className="text-[10px] font-black uppercase text-[#25D366] tracking-widest mb-3 flex items-center gap-2">
              <Icon icon="mdi:whatsapp" /> Notificar Cliente
            </p>
            <p className="text-xs text-zinc-400 mb-3 leading-relaxed">{waMsg}</p>
            <a
              href={waLink(order, waMsg)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366] text-black text-xs font-black uppercase rounded-xl hover:bg-[#20ba58] transition-all"
            >
              <Icon icon="mdi:whatsapp" /> Abrir WhatsApp
            </a>
          </div>

          {/* Timeline de Rastreamento */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5">
            <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-4">Adicionar Evento de Rastreamento</p>
            <div className="space-y-3 mb-4">
              <input
                type="text"
                placeholder="Título do evento (ex: Saiu para entrega)"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-[#00f3ff] placeholder:text-zinc-600"
              />
              <input
                type="text"
                placeholder="Detalhe (opcional)"
                value={newEventDetail}
                onChange={(e) => setNewEventDetail(e.target.value)}
                className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-[#00f3ff] placeholder:text-zinc-600"
              />
              <button
                onClick={handleAddEvent}
                disabled={addingEvent || !newEventTitle.trim()}
                className="w-full py-3 bg-[#00f3ff] text-black text-xs font-black uppercase rounded-xl hover:bg-[#00d4e0] transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                {addingEvent ? 'Adicionando...' : 'Adicionar Evento'}
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-800">
              <p className="text-[10px] font-black uppercase text-zinc-600 tracking-widest mb-3">Histórico</p>
              {loadingEvents ? (
                <div className="flex justify-center py-4"><div className="w-5 h-5 border-2 border-[#00f3ff] border-t-transparent rounded-full animate-spin" /></div>
              ) : events.length === 0 ? (
                <p className="text-xs text-zinc-600 font-bold text-center py-4">Nenhum evento ainda.</p>
              ) : (
                <div className="space-y-3">
                  {events.map((ev, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#00f3ff] mt-1.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-black text-white">{ev.title}</p>
                        {ev.detail && <p className="text-[10px] text-zinc-500">{ev.detail}</p>}
                        <p className="text-[10px] text-zinc-600">{ev.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function AdminPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()

  const [tab, setTab] = useState<AdminTab>('dashboard')
  const [orders, setOrders] = useState<Order[]>([])
  const [users, setUsers] = useState<{ uid: string; name: string; email: string; role: string }[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  // Pedidos — filtros
  const [searchOrder, setSearchOrder] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('todos')

  // Clientes — filtros + role change
  const [searchUser, setSearchUser] = useState('')
  const [updatingRole, setUpdatingRole] = useState<string | null>(null)

  // Produtos Firestore
  const [fsProducts, setFsProducts] = useState<FirestoreProduct[]>([])
  const [fsLoading, setFsLoading] = useState(true)
  const [deletingProduct, setDeletingProduct] = useState<string | null>(null)
  const [togglingProduct, setTogglingProduct] = useState<string | null>(null)
  const [editingProduct, setEditingProduct] = useState<FirestoreProduct | null>(null)



  // Configurações
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null)
  const [configSaving, setConfigSaving] = useState(false)
  const [configSaved, setConfigSaved] = useState(false)

  // FAQ
  const [faqCategories, setFaqCategories] = useState<FaqCategory[]>([])
  const [faqLoading, setFaqLoading] = useState(false)
  const [faqSaving, setFaqSaving] = useState(false)
  const [faqSaved, setFaqSaved] = useState(false)

  // Agenda
  const [agendaEvents, setAgendaEvents] = useState<AgendaEvent[]>([])
  const [agendaLoading, setAgendaLoading] = useState(false)
  const [agendaSaving, setAgendaSaving] = useState(false)
  const [deletingEvent, setDeletingEvent] = useState<string | null>(null)
  const emptyEventForm: Omit<AgendaEvent, 'id' | 'createdAt'> = { title: '', date: '', timeStart: '', timeEnd: '', venue: '', address: '', city: '', state: '', description: '', imageUrl: '', mapUrl: '', instagramUrl: '', color: '#ff00ff' }
  const [eventForm, setEventForm] = useState<Omit<AgendaEvent, 'id' | 'createdAt'>>(emptyEventForm)
  const [editingEvent, setEditingEvent] = useState<AgendaEvent | null>(null)
  const [agendaMsg, setAgendaMsg] = useState('')

  // Cupons
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [couponsLoading, setCouponsLoading] = useState(false)
  const [couponForm, setCouponForm] = useState({ code: '', discount: '', active: true, expiresAt: '', usageLimit: '' })
  const [couponSaving, setCouponSaving] = useState(false)
  const [couponMsg, setCouponMsg] = useState('')
  const [deletingCoupon, setDeletingCoupon] = useState<string | null>(null)

  // Relatório
  const [relPeriod, setRelPeriod] = useState<7 | 30 | 90>(30)

  // Kanban — drag
  const dragOrderId = useRef<string | null>(null)

  // ── Proteção de rota
  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== 'admin')) {
      router.replace('/')
    }
  }, [authLoading, user, profile, router])

  // ── Carrega dados
  useEffect(() => {
    if (profile?.role !== 'admin') return
    async function load() {
      setDataLoading(true)
      setFsLoading(true)
      const [ordersData, usersData, productsData, configData] = await Promise.all([getAllOrders(), getAllUsers(), getFirestoreProducts(), getSiteConfig()])
      setOrders(ordersData)
      setUsers(usersData)
      setFsProducts(productsData as FirestoreProduct[])
      setSiteConfig(configData)
      setDataLoading(false)
      setFsLoading(false)
    }
    load()
  }, [profile])

  // ── Handlers
  async function handleStatusChange(orderId: string, status: Order['status']) {
    if (status === 'cancelado' && !confirm('Cancelar este pedido? Esta ação não pode ser desfeita.')) return
    setUpdatingOrder(orderId)
    await updateOrderStatus(orderId, status)
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o))
    setUpdatingOrder(null)
  }

  async function handleAddEvent(orderId: string, event: TrackingEvent) {
    await addTrackingEvent(orderId, event)
  }

  async function handleRoleChange(uid: string, role: 'customer' | 'admin') {
    setUpdatingRole(uid)
    await setUserRole(uid, role)
    setUsers((prev) => prev.map((u) => u.uid === uid ? { ...u, role } : u))
    setUpdatingRole(null)
  }

  // ── Handlers de produto
  async function handleDeleteProduct(id: string) {
    if (!confirm('Deletar este produto? Esta ação não pode ser desfeita.')) return
    setDeletingProduct(id)
    await deleteFirestoreProduct(id)
    setFsProducts((prev) => prev.filter((p) => p.id !== id))
    setDeletingProduct(null)
  }

  async function handleToggleVisible(product: FirestoreProduct) {
    setTogglingProduct(product.id)
    await updateFirestoreProduct(product.id, { visible: !product.visible })
    setFsProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, visible: !p.visible } : p))
    setTogglingProduct(null)
  }

  async function handleEditSave(product: FirestoreProduct) {
    setTogglingProduct(product.id)
    await updateFirestoreProduct(product.id, {
      name: product.name,
      slug: product.slug,
      price: product.price,
      oldPrice: product.oldPrice ?? null,
      category: product.category,
      description: product.description,
      stock: product.stock,
      height: product.height,
      color: product.color,
      badges: product.badges,
      sizes: product.sizes ?? [],
      visible: product.visible,
    })
    setFsProducts((prev) => prev.map((p) => p.id === product.id ? product : p))
    setEditingProduct(null)
    setTogglingProduct(null)
  }

  // ── Config handler
  async function handleSaveConfig() {
    if (!siteConfig) return
    setConfigSaving(true)
    await updateSiteConfig(siteConfig)
    setConfigSaving(false)
    setConfigSaved(true)
    setTimeout(() => setConfigSaved(false), 3000)
  }

  // ── Handlers de FAQ
  async function loadFaq() {
    setFaqLoading(true)
    const data = await getFaq()
    setFaqCategories(data)
    setFaqLoading(false)
  }

  async function handleSaveFaq() {
    setFaqSaving(true)
    await updateFaq(faqCategories)
    setFaqSaving(false)
    setFaqSaved(true)
    setTimeout(() => setFaqSaved(false), 3000)
  }

  function faqAddQuestion(catIdx: number) {
    setFaqCategories((prev) => {
      const next = [...prev]
      next[catIdx] = { ...next[catIdx], faqs: [...next[catIdx].faqs, { q: '', a: '' }] }
      return next
    })
  }

  function faqRemoveQuestion(catIdx: number, qIdx: number) {
    setFaqCategories((prev) => {
      const next = [...prev]
      next[catIdx] = { ...next[catIdx], faqs: next[catIdx].faqs.filter((_, i) => i !== qIdx) }
      return next
    })
  }

  function faqUpdateQuestion(catIdx: number, qIdx: number, field: keyof FaqItem, value: string) {
    setFaqCategories((prev) => {
      const next = [...prev]
      const faqs = [...next[catIdx].faqs]
      faqs[qIdx] = { ...faqs[qIdx], [field]: value }
      next[catIdx] = { ...next[catIdx], faqs }
      return next
    })
  }

  // ── Handlers de agenda
  async function loadAgendaEvents() {
    setAgendaLoading(true)
    let data = await getAgendaEvents()
    if (data.length === 0) {
      // Seed com evento de exemplo
      await upsertAgendaEvent({
        title: 'Feira Nerd — Shopping Boulevard',
        date: '2026-05-10',
        timeStart: '10:00',
        timeEnd: '20:00',
        venue: 'Shopping Boulevard',
        address: 'Av. Gov. José Malcher, 3300 — Belém',
        city: 'Belém',
        state: 'PA',
        description: 'Venha nos visitar no estande da Balu 3D! Figuras exclusivas, impressão ao vivo e edições limitadas só no evento.',
        mapUrl: 'https://maps.google.com/?q=Shopping+Boulevard+Belém',
        instagramUrl: 'https://instagram.com/balu3d',
        color: '#ff00ff',
      })
      data = await getAgendaEvents()
    }
    setAgendaEvents(data)
    setAgendaLoading(false)
  }

  async function handleSaveEvent() {
    const form = editingEvent ?? eventForm
    if (!form.title || !form.date || !form.timeStart || !form.venue || !form.city) {
      setAgendaMsg('Preencha: título, data, horário, local e cidade.')
      return
    }
    setAgendaSaving(true)
    if (editingEvent) {
      await upsertAgendaEvent(editingEvent)
      setEditingEvent(null)
    } else {
      await upsertAgendaEvent(eventForm as AgendaEvent)
      setEventForm(emptyEventForm)
    }
    setAgendaMsg('Evento salvo!')
    await loadAgendaEvents()
    setAgendaSaving(false)
    setTimeout(() => setAgendaMsg(''), 3000)
  }

  async function handleDeleteEvent(id: string) {
    if (!confirm('Deletar este evento? Esta ação não pode ser desfeita.')) return
    setDeletingEvent(id)
    await deleteAgendaEvent(id)
    setAgendaEvents((prev) => prev.filter((e) => e.id !== id))
    setDeletingEvent(null)
  }

  // ── Handlers de cupom
  async function loadCoupons() {
    setCouponsLoading(true)
    const data = await getCoupons()
    setCoupons(data)
    setCouponsLoading(false)
  }

  async function handleSaveCoupon() {
    const code = couponForm.code.trim().toUpperCase()
    const discount = Number(couponForm.discount)
    if (!code || !discount || discount <= 0 || discount > 100) {
      setCouponMsg('Preencha código e desconto válido (1-100%).')
      return
    }
    setCouponSaving(true)
    await upsertCoupon({
      code,
      discount,
      active: couponForm.active,
      expiresAt: couponForm.expiresAt || undefined,
      usageLimit: couponForm.usageLimit ? Number(couponForm.usageLimit) : undefined,
    })
    setCouponForm({ code: '', discount: '', active: true, expiresAt: '', usageLimit: '' })
    setCouponMsg(`Cupom ${code} salvo!`)
    await loadCoupons()
    setCouponSaving(false)
    setTimeout(() => setCouponMsg(''), 3000)
  }

  async function handleDeleteCoupon(code: string) {
    if (!confirm(`Deletar cupom ${code}? Esta ação não pode ser desfeita.`)) return
    setDeletingCoupon(code)
    await deleteCoupon(code)
    setCoupons((prev) => prev.filter((c) => c.code !== code))
    setDeletingCoupon(null)
  }

  // ── Kanban drag handlers
  function onDragStart(orderId: string) {
    dragOrderId.current = orderId
  }

  async function onDrop(status: Order['status']) {
    const orderId = dragOrderId.current
    if (!orderId) return
    const order = orders.find((o) => o.id === orderId)
    if (!order || order.status === status) return
    await handleStatusChange(orderId, status)
    dragOrderId.current = null
  }

  // ── Guards
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="w-10 h-10 border-2 border-[#00f3ff] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center space-y-4">
          <p className="text-zinc-400 font-black uppercase tracking-widest text-sm">Acesso restrito</p>
          <p className="text-zinc-600 text-xs">Faça login para continuar.</p>
          <a href="/login" className="inline-block px-6 py-3 bg-[#00f3ff] text-black font-black uppercase rounded-2xl text-xs hover:bg-[#00d4e0] transition-all">
            Ir para Login
          </a>
        </div>
      </div>
    )
  }

  if (!profile || profile.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto">
            <span className="text-2xl">🔒</span>
          </div>
          <p className="text-red-400 font-black uppercase tracking-widest text-sm">Acesso Negado</p>
          <p className="text-zinc-600 text-xs">Você não tem permissão de administrador.</p>
          <a href="/" className="inline-block px-6 py-3 bg-zinc-800 text-white font-black uppercase rounded-2xl text-xs hover:bg-zinc-700 transition-all">
            Voltar ao Início
          </a>
        </div>
      </div>
    )
  }

  // ── Stats
  const totalRevenue = orders.filter(o => o.status !== 'cancelado').reduce((s, o) => s + o.total, 0)
  const pendingOrders = orders.filter(o => o.status === 'confirmado' || o.status === 'impressao').length
  const inTransit = orders.filter(o => o.status === 'transito').length
  const delivered = orders.filter(o => o.status === 'entregue').length

  // ── Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchSearch = searchOrder === '' ||
      o.id?.toLowerCase().includes(searchOrder.toLowerCase()) ||
      o.userName.toLowerCase().includes(searchOrder.toLowerCase()) ||
      o.userEmail.toLowerCase().includes(searchOrder.toLowerCase())
    const matchStatus = filterStatus === 'todos' || o.status === filterStatus
    return matchSearch && matchStatus
  })

  // ── Filtered users
  const filteredUsers = users.filter((u) =>
    searchUser === '' ||
    u.name?.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchUser.toLowerCase())
  )

  // ── Relatório
  const cutoff = Date.now() - relPeriod * 24 * 60 * 60 * 1000
  const periodOrders = orders.filter((o) => {
    if (!o.createdAt) return false
    const ts = (o.createdAt as { seconds: number }).seconds * 1000
    return ts >= cutoff && o.status !== 'cancelado'
  })
  const periodRevenue = periodOrders.reduce((s, o) => s + o.total, 0)
  const avgTicket = periodOrders.length > 0 ? periodRevenue / periodOrders.length : 0
  const productSales: Record<string, { name: string; qty: number; revenue: number }> = {}
  periodOrders.forEach((o) => {
    o.items.forEach((item) => {
      if (!productSales[item.slug]) productSales[item.slug] = { name: item.name, qty: 0, revenue: 0 }
      productSales[item.slug].qty += item.qty
      productSales[item.slug].revenue += item.price * item.qty
    })
  })
  const topProducts = Object.values(productSales).sort((a, b) => b.qty - a.qty).slice(0, 5)

  function exportCSV() {
    const rows = [
      ['ID', 'Cliente', 'Email', 'Status', 'Total', 'Data'],
      ...periodOrders.map((o) => [
        o.id?.slice(0, 8).toUpperCase() ?? '',
        o.userName,
        o.userEmail,
        STATUS_LABEL[o.status],
        o.total.toFixed(2),
        fmtDate(o.createdAt as { seconds: number } | undefined),
      ]),
    ]
    const csv = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `balu3d-relatorio-${relPeriod}dias.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Nav items
  const navItems: { id: AdminTab; icon: string; label: string }[] = [
    { id: 'dashboard', icon: 'lucide:layout-dashboard', label: 'Dashboard' },
    { id: 'pedidos', icon: 'lucide:shopping-cart', label: 'Pedidos' },
    { id: 'kanban', icon: 'lucide:kanban', label: 'Fila Kanban' },
    { id: 'relatorio', icon: 'lucide:bar-chart-2', label: 'Relatório' },
    { id: 'produtos', icon: 'lucide:box', label: 'Produtos' },
    { id: 'criar-produto', icon: 'lucide:plus-circle', label: 'Criar Produto' },
    { id: 'clientes', icon: 'lucide:users', label: 'Clientes' },
    { id: 'cupons', icon: 'lucide:ticket', label: 'Cupons' },
    { id: 'faq', icon: 'lucide:help-circle', label: 'FAQ' },
    { id: 'agenda', icon: 'lucide:calendar', label: 'Agenda' },
    { id: 'configuracoes', icon: 'lucide:settings', label: 'Configurações' },
  ]

  // Carrega cupons ao entrar na aba
  useEffect(() => {
    if (tab === 'cupons' && coupons.length === 0) loadCoupons()
    if (tab === 'faq' && faqCategories.length === 0) loadFaq()
    if (tab === 'agenda' && agendaEvents.length === 0) loadAgendaEvents()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] bg-grid-dark">
      <Navbar />

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onAddEvent={handleAddEvent}
        />
      )}

      <div className="flex-1 flex pt-16 md:pt-20">
        {/* Sidebar — desktop */}
        <aside className="w-64 bg-black/60 backdrop-blur-xl border-r border-white/5 fixed left-0 h-[calc(100vh-80px)] overflow-y-auto hidden md:block top-20">
          <div className="p-6">
            <div className="mb-3">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-2">Logado como</p>
              <p className="text-xs font-black text-[#00f3ff] truncate">{user?.displayName ?? user?.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 bg-[#ff00ff]/10 border border-[#ff00ff]/30 rounded-full text-[9px] font-black text-[#ff00ff] uppercase">ADMIN</span>
            </div>
            <div className="h-px bg-zinc-800 my-5" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-3">Navegação</p>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                    tab === item.id
                      ? 'bg-[#00f3ff]/10 text-[#00f3ff] border border-[#00f3ff]/20'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon icon={item.icon} /> {item.label}
                </button>
              ))}
            </nav>
            <div className="h-px bg-zinc-800 my-5" />
            <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-all">
              <Icon icon="lucide:arrow-left" /> Ver Site
            </Link>
          </div>
        </aside>

        {/* Bottom nav — mobile */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-t border-white/10">
          <div className="flex items-center justify-around px-2 py-2 overflow-x-auto gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl min-w-[48px] flex-shrink-0 transition-all cursor-pointer ${
                  tab === item.id ? 'text-[#00f3ff]' : 'text-zinc-600'
                }`}
              >
                <Icon icon={item.icon} className="text-lg" />
                <span className="text-[8px] font-black uppercase leading-none text-center">{item.label.split(' ')[0]}</span>
              </button>
            ))}
            <Link href="/" className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl min-w-[48px] flex-shrink-0 text-zinc-600">
              <Icon icon="lucide:arrow-left" className="text-lg" />
              <span className="text-[8px] font-black uppercase leading-none">Site</span>
            </Link>
          </div>
        </nav>

        {/* Main */}
        <main className="flex-1 md:ml-64 p-4 md:p-10 pb-24 md:pb-10">
          <div className="max-w-6xl mx-auto">

            {/* ── DASHBOARD ──────────────────────────────────────────── */}
            {tab === 'dashboard' && (
              <>
                <div className="mb-10">
                  <h1 className="text-4xl font-black uppercase tracking-tighter text-white">
                    Dashboard <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] to-[#ff00ff]">Admin</span>
                  </h1>
                  <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mt-1">Visão geral da Balu 3D</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: 'Receita Total', value: fmt(totalRevenue), icon: 'lucide:trending-up', color: '#00ff00' },
                    { label: 'Total Pedidos', value: orders.length, icon: 'lucide:shopping-cart', color: '#00f3ff' },
                    { label: 'Aguardando', value: pendingOrders, icon: 'lucide:clock', color: '#ff00ff' },
                    { label: 'Em Trânsito', value: inTransit, icon: 'lucide:truck', color: '#f7c948' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-black border border-zinc-800 rounded-[24px] p-6 hover:border-zinc-600 transition-all">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">{stat.label}</p>
                        <Icon icon={stat.icon} className="text-xl" style={{ color: stat.color }} />
                      </div>
                      <p className="text-2xl font-black text-white">{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* Status visual */}
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-8">
                  {KANBAN_COLUMNS.map((col) => {
                    const count = orders.filter((o) => o.status === col.id).length
                    const pct = orders.length > 0 ? Math.round((count / orders.length) * 100) : 0
                    return (
                      <div key={col.id} className="bg-black border border-zinc-800 rounded-[20px] p-4 text-center">
                        <Icon icon={STATUS_ICON[col.id]} className="text-2xl mx-auto mb-2" style={{ color: col.color }} />
                        <p className="text-lg font-black text-white">{count}</p>
                        <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">{col.label}</p>
                        <div className="mt-2 h-1 bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: col.color }} />
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Atalhos */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <button onClick={() => setTab('pedidos')} className="bg-black border border-zinc-800 rounded-[20px] p-5 flex items-center gap-4 hover:border-[#00f3ff]/40 transition-all cursor-pointer group text-left">
                    <div className="w-10 h-10 rounded-xl bg-[#00f3ff]/10 flex items-center justify-center">
                      <Icon icon="lucide:list-ordered" className="text-[#00f3ff] text-xl" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-white group-hover:text-[#00f3ff] transition-colors">Ver Pedidos</p>
                      <p className="text-[10px] text-zinc-500">{filteredOrders.length} total</p>
                    </div>
                  </button>
                  <button onClick={() => setTab('kanban')} className="bg-black border border-zinc-800 rounded-[20px] p-5 flex items-center gap-4 hover:border-[#ff00ff]/40 transition-all cursor-pointer group text-left">
                    <div className="w-10 h-10 rounded-xl bg-[#ff00ff]/10 flex items-center justify-center">
                      <Icon icon="lucide:kanban" className="text-[#ff00ff] text-xl" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-white group-hover:text-[#ff00ff] transition-colors">Fila Kanban</p>
                      <p className="text-[10px] text-zinc-500">{pendingOrders} pendentes</p>
                    </div>
                  </button>
                  <button onClick={() => setTab('relatorio')} className="bg-black border border-zinc-800 rounded-[20px] p-5 flex items-center gap-4 hover:border-[#00ff00]/40 transition-all cursor-pointer group text-left">
                    <div className="w-10 h-10 rounded-xl bg-[#00ff00]/10 flex items-center justify-center">
                      <Icon icon="lucide:bar-chart-2" className="text-[#00ff00] text-xl" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-white group-hover:text-[#00ff00] transition-colors">Relatório</p>
                      <p className="text-[10px] text-zinc-500">Exportar CSV</p>
                    </div>
                  </button>
                </div>

                {/* Gráfico vendas por dia — últimos 14 dias */}
                {(() => {
                  const today = new Date()
                  const days = Array.from({ length: 14 }, (_, i) => {
                    const d = new Date(today)
                    d.setDate(today.getDate() - (13 - i))
                    return d
                  })
                  const dayData = days.map((d) => {
                    const label = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                    const revenue = orders
                      .filter((o) => {
                        if (!o.createdAt) return false
                        const od = new Date((o.createdAt as { seconds: number }).seconds * 1000)
                        return od.toDateString() === d.toDateString() && o.status !== 'cancelado'
                      })
                      .reduce((s, o) => s + o.total, 0)
                    return { label, revenue }
                  })
                  const maxRev = Math.max(...dayData.map((d) => d.revenue), 1)
                  return (
                    <div className="bg-black border border-zinc-800 rounded-[32px] p-8 mb-8">
                      <h2 className="text-xl font-black uppercase text-white mb-6">Receita — últimos 14 dias</h2>
                      <div className="flex items-end gap-1.5 h-36 w-full">
                        {dayData.map((d, i) => {
                          const pct = d.revenue / maxRev
                          const isToday = i === 13
                          return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                              {d.revenue > 0 && (
                                <div className="absolute bottom-full mb-2 bg-zinc-800 border border-white/10 rounded-lg px-2 py-1 text-[9px] font-black text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                  {fmt(d.revenue)}
                                </div>
                              )}
                              <div
                                className="w-full rounded-t-lg transition-all duration-500"
                                style={{
                                  height: `${Math.max(pct * 112, d.revenue > 0 ? 4 : 0)}px`,
                                  background: isToday ? '#00f3ff' : '#00ff00',
                                  opacity: d.revenue > 0 ? 1 : 0.15,
                                }}
                              />
                              <span className="text-[8px] text-zinc-600 font-bold hidden sm:block">{d.label}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })()}

                {/* Últimos pedidos */}
                <div className="bg-black border border-zinc-800 rounded-[32px] p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black uppercase text-white">Últimos Pedidos</h2>
                    <button onClick={() => setTab('pedidos')} className="text-xs font-black text-[#00f3ff] uppercase cursor-pointer hover:underline">Ver todos</button>
                  </div>
                  {dataLoading ? (
                    <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-[#00f3ff] border-t-transparent rounded-full animate-spin" /></div>
                  ) : orders.length === 0 ? (
                    <p className="text-zinc-500 font-bold text-center py-12">Nenhum pedido ainda.</p>
                  ) : (
                    <div className="space-y-3">
                      {orders.slice(0, 5).map((order) => (
                        <button
                          key={order.id}
                          onClick={() => setSelectedOrder(order)}
                          className="w-full flex items-center gap-4 p-4 bg-zinc-900/40 rounded-2xl border border-white/5 hover:border-white/20 transition-all cursor-pointer text-left"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-white uppercase truncate">#{order.id?.slice(0, 8).toUpperCase()}</p>
                            <p className="text-[10px] text-zinc-500 font-bold">{order.userName} · {order.items.length} item(s)</p>
                          </div>
                          <span className="text-xs font-black px-3 py-1 rounded-full" style={{ color: STATUS_COLOR[order.status], background: `${STATUS_COLOR[order.status]}15` }}>
                            {STATUS_LABEL[order.status]}
                          </span>
                          <p className="text-sm font-black text-white">{fmt(order.total)}</p>
                          <Icon icon="lucide:chevron-right" className="text-zinc-600 text-sm" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ── PEDIDOS ────────────────────────────────────────────── */}
            {tab === 'pedidos' && (
              <>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                  <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter text-white">Pedidos</h1>
                    <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mt-1">{filteredOrders.length} resultado(s)</p>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    <div className="relative">
                      <Icon icon="lucide:search" className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 text-sm" />
                      <input
                        type="text"
                        placeholder="Buscar por nome, email ou ID..."
                        value={searchOrder}
                        onChange={(e) => setSearchOrder(e.target.value)}
                        className="bg-zinc-900 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-[#00f3ff] placeholder:text-zinc-600 w-64"
                      />
                    </div>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="bg-zinc-900 border border-white/10 text-white text-xs font-black uppercase px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#00f3ff] cursor-pointer"
                    >
                      <option value="todos">Todos os Status</option>
                      {Object.entries(STATUS_LABEL).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {dataLoading ? (
                  <div className="flex justify-center py-32"><div className="w-10 h-10 border-2 border-[#00f3ff] border-t-transparent rounded-full animate-spin" /></div>
                ) : filteredOrders.length === 0 ? (
                  <div className="text-center py-32">
                    <Icon icon="lucide:inbox" className="text-7xl text-zinc-800 mx-auto mb-6" />
                    <p className="text-zinc-500 font-black uppercase">Nenhum pedido encontrado</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map((order) => (
                      <div key={order.id} className="bg-black border border-zinc-800 rounded-[28px] p-6 hover:border-zinc-600 transition-all">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              <p className="text-sm font-black text-white uppercase">#{order.id?.slice(0, 8).toUpperCase()}</p>
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ color: STATUS_COLOR[order.status], background: `${STATUS_COLOR[order.status]}15` }}>
                                {STATUS_LABEL[order.status]}
                              </span>
                            </div>
                            <p className="text-xs text-zinc-400 font-bold">{order.userName} · {order.userEmail}</p>
                            <p className="text-[10px] text-zinc-600 mt-1">{order.items.map(i => i.name).join(', ')}</p>
                            <p className="text-[10px] text-zinc-700 mt-0.5">{fmtDate(order.createdAt as { seconds: number } | undefined)}</p>
                          </div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <p className="font-black text-lg text-white">{fmt(order.total)}</p>
                            <select
                              value={order.status}
                              disabled={updatingOrder === order.id}
                              onChange={(e) => handleStatusChange(order.id!, e.target.value as Order['status'])}
                              className="bg-zinc-900 border border-white/10 text-white text-xs font-black uppercase px-3 py-2 rounded-xl focus:outline-none focus:border-[#00f3ff] cursor-pointer disabled:opacity-50"
                            >
                              {Object.entries(STATUS_LABEL).map(([k, v]) => (
                                <option key={k} value={k}>{v}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-[#00f3ff] hover:bg-zinc-700 transition-all cursor-pointer"
                              aria-label="Ver detalhes"
                            >
                              <Icon icon="lucide:eye" />
                            </button>
                            {updatingOrder === order.id && (
                              <div className="w-4 h-4 border-2 border-[#00f3ff] border-t-transparent rounded-full animate-spin" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ── KANBAN ─────────────────────────────────────────────── */}
            {tab === 'kanban' && (
              <>
                <div className="mb-8">
                  <h1 className="text-4xl font-black uppercase tracking-tighter text-white">Fila de <span className="text-[#ff00ff]">Impressão</span></h1>
                  <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mt-1">Arraste os cards para mover entre status</p>
                </div>

                {dataLoading ? (
                  <div className="flex justify-center py-32"><div className="w-10 h-10 border-2 border-[#00f3ff] border-t-transparent rounded-full animate-spin" /></div>
                ) : (
                  <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 md:grid md:grid-cols-3 lg:grid-cols-5 md:overflow-visible md:pb-0 md:mx-0 md:px-0">
                    {KANBAN_COLUMNS.map((col) => {
                      const colOrders = orders.filter((o) => o.status === col.id)
                      return (
                        <div
                          key={col.id}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => onDrop(col.id)}
                          className="bg-black border border-zinc-800 rounded-[24px] p-4 min-h-[200px] min-w-[180px] md:min-w-0 flex-shrink-0 md:flex-shrink"
                        >
                          <div className="flex items-center gap-2 mb-4">
                            <Icon icon={STATUS_ICON[col.id]} className="text-base" style={{ color: col.color }} />
                            <p className="text-xs font-black uppercase tracking-widest" style={{ color: col.color }}>{col.label}</p>
                            <span className="ml-auto text-[10px] font-black text-zinc-600 bg-zinc-900 px-2 py-0.5 rounded-full">{colOrders.length}</span>
                          </div>
                          <div className="space-y-3">
                            {colOrders.length === 0 && (
                              <div className="text-center py-8">
                                <p className="text-[10px] text-zinc-700 font-bold uppercase">Vazio</p>
                              </div>
                            )}
                            {colOrders.map((order) => (
                              <div
                                key={order.id}
                                draggable
                                onDragStart={() => onDragStart(order.id!)}
                                onClick={() => setSelectedOrder(order)}
                                className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4 cursor-grab active:cursor-grabbing hover:border-white/20 transition-all"
                              >
                                <p className="text-[10px] font-black text-white uppercase mb-1">#{order.id?.slice(0, 8).toUpperCase()}</p>
                                <p className="text-[10px] text-zinc-500 font-bold truncate">{order.userName}</p>
                                <p className="text-[10px] text-zinc-600 mt-1">{order.items.length} item(s)</p>
                                <p className="text-xs font-black mt-2" style={{ color: col.color }}>{fmt(order.total)}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            )}

            {/* ── RELATÓRIO ──────────────────────────────────────────── */}
            {tab === 'relatorio' && (
              <>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                  <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter text-white">Relatório</h1>
                    <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mt-1">Período: últimos {relPeriod} dias</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex bg-zinc-900 border border-white/10 rounded-xl overflow-hidden">
                      {([7, 30, 90] as const).map((p) => (
                        <button
                          key={p}
                          onClick={() => setRelPeriod(p)}
                          className={`px-4 py-2 text-xs font-black uppercase transition-all cursor-pointer ${relPeriod === p ? 'bg-[#00f3ff] text-black' : 'text-zinc-400 hover:text-white'}`}
                        >
                          {p}d
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={exportCSV}
                      className="flex items-center gap-2 px-4 py-2 bg-[#00ff00]/10 border border-[#00ff00]/30 text-[#00ff00] text-xs font-black uppercase rounded-xl hover:bg-[#00ff00]/20 transition-all cursor-pointer"
                    >
                      <Icon icon="lucide:download" /> Exportar CSV
                    </button>
                  </div>
                </div>

                {/* Stats do período */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: 'Receita no período', value: fmt(periodRevenue), icon: 'lucide:trending-up', color: '#00ff00' },
                    { label: 'Pedidos', value: periodOrders.length, icon: 'lucide:shopping-cart', color: '#00f3ff' },
                    { label: 'Ticket Médio', value: fmt(avgTicket), icon: 'lucide:tag', color: '#ff00ff' },
                    { label: 'Entregues', value: delivered, icon: 'lucide:package-check', color: '#00ff00' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-black border border-zinc-800 rounded-[24px] p-6">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">{stat.label}</p>
                        <Icon icon={stat.icon} className="text-xl" style={{ color: stat.color }} />
                      </div>
                      <p className="text-2xl font-black text-white">{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* Produtos mais vendidos */}
                <div className="bg-black border border-zinc-800 rounded-[32px] p-8 mb-8">
                  <h2 className="text-xl font-black uppercase text-white mb-6">Produtos Mais Vendidos</h2>
                  {topProducts.length === 0 ? (
                    <p className="text-zinc-500 font-bold text-center py-12">Nenhuma venda no período.</p>
                  ) : (
                    <div className="space-y-4">
                      {topProducts.map((p, i) => {
                        const maxQty = topProducts[0].qty
                        const pct = Math.round((p.qty / maxQty) * 100)
                        return (
                          <div key={p.name} className="flex items-center gap-4">
                            <span className="text-xs font-black text-zinc-600 w-4">#{i + 1}</span>
                            <div className="flex-1">
                              <div className="flex justify-between mb-1">
                                <p className="text-xs font-black text-white">{p.name}</p>
                                <p className="text-xs font-black text-zinc-400">{p.qty} un · {fmt(p.revenue)}</p>
                              </div>
                              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{ width: `${pct}%`, background: i === 0 ? '#00f3ff' : i === 1 ? '#ff00ff' : '#00ff00' }}
                                />
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Lista de pedidos do período */}
                <div className="bg-black border border-zinc-800 rounded-[32px] p-8">
                  <h2 className="text-xl font-black uppercase text-white mb-6">Pedidos no Período ({periodOrders.length})</h2>
                  {periodOrders.length === 0 ? (
                    <p className="text-zinc-500 font-bold text-center py-12">Nenhum pedido no período.</p>
                  ) : (
                    <div className="space-y-3">
                      {periodOrders.map((order) => (
                        <button
                          key={order.id}
                          onClick={() => setSelectedOrder(order)}
                          className="w-full flex items-center gap-4 p-4 bg-zinc-900/40 rounded-2xl border border-white/5 hover:border-white/20 transition-all cursor-pointer text-left"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-white uppercase">#{order.id?.slice(0, 8).toUpperCase()}</p>
                            <p className="text-[10px] text-zinc-500">{order.userName} · {fmtDate(order.createdAt as { seconds: number } | undefined)}</p>
                          </div>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ color: STATUS_COLOR[order.status], background: `${STATUS_COLOR[order.status]}15` }}>
                            {STATUS_LABEL[order.status]}
                          </span>
                          <p className="text-sm font-black text-white">{fmt(order.total)}</p>
                          <Icon icon="lucide:chevron-right" className="text-zinc-600 text-sm" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ── PRODUTOS ───────────────────────────────────────────── */}
            {tab === 'produtos' && (
              <>
                {/* Modal de edição inline */}
                {editingProduct && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#0d0d0d] border border-zinc-800 rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                      {/* Header */}
                      <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-zinc-800">
                        <h2 className="text-xl font-black text-white uppercase tracking-tight">Editar Produto</h2>
                        <button onClick={() => setEditingProduct(null)} className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-white/5 cursor-pointer"><Icon icon="lucide:x" /></button>
                      </div>

                      {/* Fields */}
                      <div className="px-8 py-6 space-y-4">
                        {/* Nome */}
                        <div>
                          <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block mb-1">Nome</label>
                          <input value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00f3ff]" />
                        </div>

                        {/* Slug (readonly) */}
                        <div>
                          <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block mb-1">Slug (gerado automaticamente)</label>
                          <input value={editingProduct.slug} readOnly className="w-full bg-zinc-900/50 border border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-500 cursor-not-allowed focus:outline-none" />
                        </div>

                        {/* Preço + Preço Antigo */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block mb-1">Preço (R$)</label>
                            <input type="number" value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })} className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00f3ff]" />
                          </div>
                          <div>
                            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block mb-1">Preço Antigo</label>
                            <input type="number" value={editingProduct.oldPrice ?? ''} onChange={(e) => setEditingProduct({ ...editingProduct, oldPrice: e.target.value ? parseFloat(e.target.value) : undefined })} className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00f3ff]" placeholder="Opcional" />
                          </div>
                        </div>

                        {/* Categoria + Stock */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block mb-1">Categoria</label>
                            <select value={editingProduct.category} onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })} className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00f3ff]">
                              <option value="Classic">Classic</option>
                              <option value="Legendary">Legendary</option>
                              <option value="Shiny">Shiny</option>
                              <option value="Limited">Limited</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block mb-1">Stock</label>
                            <input type="number" value={editingProduct.stock} onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })} className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00f3ff]" />
                          </div>
                        </div>

                        {/* Altura + Cor Neon */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block mb-1">Altura (ex: 22cm)</label>
                            <input value={editingProduct.height} onChange={(e) => setEditingProduct({ ...editingProduct, height: e.target.value })} className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00f3ff]" placeholder="ex: 22cm" />
                          </div>
                          <div>
                            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block mb-1">Cor Neon</label>
                            <div className="flex items-center gap-2">
                              <input type="color" value={editingProduct.color} onChange={(e) => setEditingProduct({ ...editingProduct, color: e.target.value })} className="w-12 h-12 rounded-xl border border-white/10 bg-zinc-900 cursor-pointer p-1" />
                              <span className="text-xs text-zinc-400 font-mono">{editingProduct.color}</span>
                            </div>
                          </div>
                        </div>

                        {/* Badges */}
                        <div>
                          <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block mb-1">Badges (separadas por vírgula)</label>
                          <input value={editingProduct.badges.join(', ')} onChange={(e) => setEditingProduct({ ...editingProduct, badges: e.target.value.split(',').map((b) => b.trim()).filter(Boolean) })} className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00f3ff]" placeholder="ex: Novo, Popular, Limitado" />
                        </div>

                        {/* Tamanhos */}
                        <div>
                          <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block mb-1">Tamanhos (separados por vírgula)</label>
                          <input value={(editingProduct.sizes ?? []).join(', ')} onChange={(e) => setEditingProduct({ ...editingProduct, sizes: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00f3ff]" placeholder="ex: P, M, G, GG" />
                        </div>

                        {/* Descrição */}
                        <div>
                          <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block mb-1">Descrição</label>
                          <textarea value={editingProduct.description} onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })} rows={4} className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00f3ff] resize-none" />
                        </div>

                        {/* Visível */}
                        <div className="flex items-center gap-3 pt-1">
                          <button
                            onClick={() => setEditingProduct({ ...editingProduct, visible: !editingProduct.visible })}
                            className={`w-10 h-6 rounded-full transition-all relative cursor-pointer ${editingProduct.visible ? 'bg-[#00f3ff]' : 'bg-zinc-700'}`}
                          >
                            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${editingProduct.visible ? 'left-5' : 'left-1'}`} />
                          </button>
                          <span className="text-xs font-bold text-zinc-400">Visível na loja</span>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex gap-3 px-8 pb-8">
                        <button onClick={() => setEditingProduct(null)} className="flex-1 py-3 border border-zinc-700 rounded-xl text-xs font-black text-zinc-400 hover:text-white hover:border-zinc-500 transition-all cursor-pointer">Cancelar</button>
                        <button
                          onClick={() => handleEditSave(editingProduct)}
                          disabled={togglingProduct === editingProduct.id}
                          className="flex-1 py-3 bg-[#00f3ff] text-black text-xs font-black uppercase rounded-xl hover:bg-[#00d4e0] transition-all disabled:opacity-50 cursor-pointer"
                        >
                          {togglingProduct === editingProduct.id ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-end justify-between mb-8">
                  <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter text-white">Produtos</h1>
                    <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mt-1">
                      {fsLoading ? '...' : `${fsProducts.length} produto(s) no Firestore`}
                    </p>
                  </div>
                  <button
                    onClick={() => setTab('criar-produto')}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#00f3ff] text-black text-xs font-black uppercase rounded-xl hover:bg-[#00d4e0] transition-all cursor-pointer"
                  >
                    <Icon icon="lucide:plus" /> Novo Produto
                  </button>
                </div>

                {/* Resumo por categoria */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                  {(['Classic', 'Legendary', 'Shiny', 'Limited'] as const).map((cat) => {
                    const count = fsProducts.filter((p) => p.category === cat).length
                    const colors: Record<string, string> = { Classic: '#00f3ff', Legendary: '#ff00ff', Shiny: '#f7c948', Limited: '#00ff00' }
                    return (
                      <div key={cat} className="bg-black border border-zinc-800 rounded-[20px] p-5">
                        <p className="text-2xl font-black text-white">{count}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest mt-1" style={{ color: colors[cat] }}>{cat}</p>
                      </div>
                    )
                  })}
                </div>

                {fsLoading ? (
                  <div className="flex justify-center py-32"><div className="w-10 h-10 border-2 border-[#00f3ff] border-t-transparent rounded-full animate-spin" /></div>
                ) : fsProducts.length === 0 ? (
                  <div className="text-center py-32">
                    <Icon icon="lucide:box" className="text-7xl text-zinc-800 mx-auto mb-6" />
                    <p className="text-zinc-500 font-black uppercase mb-4">Nenhum produto no Firestore ainda.</p>
                    <button onClick={() => setTab('criar-produto')} className="inline-flex items-center gap-2 px-6 py-3 bg-[#00f3ff] text-black text-xs font-black uppercase rounded-xl hover:bg-[#00d4e0] transition-all cursor-pointer">
                      <Icon icon="lucide:plus" /> Criar Primeiro Produto
                    </button>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {fsProducts.map((product) => {
                      const stockLow = product.stock <= 3
                      return (
                        <div key={product.id} className={`bg-black border rounded-[24px] p-5 transition-all ${product.visible ? 'border-zinc-800 hover:border-zinc-600' : 'border-zinc-900 opacity-60'}`}>
                          <div className="flex items-start gap-4 mb-4">
                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-900 flex-shrink-0 border border-white/5">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={product.img} alt={product.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-xs font-black text-white uppercase truncate">{product.name}</p>
                                {!product.visible && <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 uppercase">Oculto</span>}
                              </div>
                              <p className="text-[10px] text-zinc-500 font-bold">{product.category}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-sm font-black" style={{ color: product.color }}>{fmt(product.price)}</p>
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${stockLow ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-zinc-800 text-zinc-500'}`}>
                                  Stock: {product.stock}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 pt-3 border-t border-zinc-900">
                            <button
                              onClick={() => setEditingProduct(product)}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-[#00f3ff] hover:bg-zinc-700 transition-all text-[10px] font-black uppercase cursor-pointer"
                            >
                              <Icon icon="lucide:pencil" /> Editar
                            </button>
                            <button
                              onClick={() => handleToggleVisible(product)}
                              disabled={togglingProduct === product.id}
                              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer disabled:opacity-50 ${product.visible ? 'bg-zinc-800 text-zinc-400 hover:text-[#ff00ff] hover:bg-zinc-700' : 'bg-[#00f3ff]/10 text-[#00f3ff] hover:bg-[#00f3ff]/20'}`}
                            >
                              <Icon icon={product.visible ? 'lucide:eye-off' : 'lucide:eye'} />
                              {product.visible ? 'Ocultar' : 'Mostrar'}
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              disabled={deletingProduct === product.id}
                              className="p-2 rounded-xl bg-zinc-800 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer disabled:opacity-50"
                              aria-label="Deletar"
                            >
                              {deletingProduct === product.id
                                ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                : <Icon icon="lucide:trash-2" />
                              }
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            )}

            {/* ── CRIAR PRODUTO ──────────────────────────────────────── */}
            {tab === 'criar-produto' && (
              <TabCriarProduto
                onProductCreated={(product) => setFsProducts((prev) => [...prev, product])}
              />
            )}

            {/* ── CLIENTES ───────────────────────────────────────────── */}
            {tab === 'clientes' && (
              <>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                  <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter text-white">Clientes</h1>
                    <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mt-1">{filteredUsers.length} usuário(s)</p>
                  </div>
                  <div className="relative">
                    <Icon icon="lucide:search" className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 text-sm" />
                    <input
                      type="text"
                      placeholder="Buscar por nome ou email..."
                      value={searchUser}
                      onChange={(e) => setSearchUser(e.target.value)}
                      className="bg-zinc-900 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-[#00f3ff] placeholder:text-zinc-600 w-64"
                    />
                  </div>
                </div>

                {dataLoading ? (
                  <div className="flex justify-center py-32"><div className="w-10 h-10 border-2 border-[#00f3ff] border-t-transparent rounded-full animate-spin" /></div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-32">
                    <Icon icon="lucide:users" className="text-7xl text-zinc-800 mx-auto mb-6" />
                    <p className="text-zinc-500 font-black uppercase">Nenhum usuário encontrado</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredUsers.map((u) => {
                      const userOrders = orders.filter((o) => o.userEmail === u.email)
                      const userRevenue = userOrders.filter(o => o.status !== 'cancelado').reduce((s, o) => s + o.total, 0)
                      return (
                        <div key={u.uid} className="bg-black border border-zinc-800 rounded-[24px] p-5 flex items-center gap-5 hover:border-zinc-600 transition-all">
                          <div className="w-10 h-10 rounded-full bg-[#00f3ff]/10 border border-[#00f3ff]/20 flex items-center justify-center text-[#00f3ff] font-black text-sm flex-shrink-0">
                            {(u.name ?? u.email ?? 'U')[0].toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-white truncate">{u.name}</p>
                            <p className="text-xs text-zinc-500 font-bold truncate">{u.email}</p>
                            <p className="text-[10px] text-zinc-600 mt-0.5">{userOrders.length} pedido(s) · {fmt(userRevenue)} gasto</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${
                              u.role === 'admin'
                                ? 'bg-[#ff00ff]/10 text-[#ff00ff] border border-[#ff00ff]/20'
                                : 'bg-zinc-800 text-zinc-400'
                            }`}>
                              {u.role}
                            </span>
                            <select
                              value={u.role}
                              disabled={updatingRole === u.uid}
                              onChange={(e) => handleRoleChange(u.uid, e.target.value as 'customer' | 'admin')}
                              className="bg-zinc-900 border border-white/10 text-white text-[10px] font-black uppercase px-2 py-1.5 rounded-lg focus:outline-none focus:border-[#00f3ff] cursor-pointer disabled:opacity-50"
                            >
                              <option value="customer">Customer</option>
                              <option value="admin">Admin</option>
                            </select>
                            {updatingRole === u.uid && (
                              <div className="w-4 h-4 border-2 border-[#ff00ff] border-t-transparent rounded-full animate-spin" />
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            )}

            {/* ── FAQ ───────────────────────────────────────────────── */}
            {tab === 'faq' && (
              <div>
                <div className="mb-10 flex items-end justify-between">
                  <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter text-white">
                      FAQ <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] to-[#ff00ff]">Editável</span>
                    </h1>
                    <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mt-1">Edite as perguntas e respostas da página de Ajuda</p>
                  </div>
                  <button onClick={handleSaveFaq} disabled={faqSaving}
                    className="px-6 py-3 bg-[#00f3ff] text-black font-black uppercase rounded-2xl hover:bg-[#00d4e0] transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2">
                    {faqSaving ? <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Salvando...</>
                      : faqSaved ? <><Icon icon="lucide:check" /> Salvo!</>
                      : <><Icon icon="lucide:save" /> Salvar FAQ</>}
                  </button>
                </div>

                {faqLoading ? (
                  <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-[#00f3ff] border-t-transparent rounded-full animate-spin" /></div>
                ) : (
                  <div className="space-y-8 max-w-4xl">
                    {faqCategories.map((cat, catIdx) => (
                      <div key={catIdx} className="bg-black border border-zinc-800 rounded-[24px] p-6">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${cat.color}20`, border: `1px solid ${cat.color}40` }}>
                            <Icon icon={cat.icon} style={{ color: cat.color }} />
                          </div>
                          <h3 className="text-sm font-black uppercase text-white tracking-widest">{cat.title}</h3>
                        </div>
                        <div className="space-y-4">
                          {cat.faqs.map((faq, qIdx) => (
                            <div key={qIdx} className="bg-zinc-900 rounded-2xl p-4 border border-white/5 space-y-2">
                              <div className="flex items-start gap-2">
                                <div className="flex-1 space-y-2">
                                  <input
                                    value={faq.q}
                                    onChange={(e) => faqUpdateQuestion(catIdx, qIdx, 'q', e.target.value)}
                                    placeholder="Pergunta..."
                                    className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-black text-white focus:outline-none focus:border-[#00f3ff] placeholder:text-zinc-600"
                                  />
                                  <textarea
                                    value={faq.a}
                                    onChange={(e) => faqUpdateQuestion(catIdx, qIdx, 'a', e.target.value)}
                                    placeholder="Resposta..."
                                    rows={2}
                                    className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-[#00f3ff] placeholder:text-zinc-600 resize-none"
                                  />
                                </div>
                                <button
                                  onClick={() => faqRemoveQuestion(catIdx, qIdx)}
                                  className="mt-1 p-2 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
                                >
                                  <Icon icon="lucide:trash-2" className="text-sm" />
                                </button>
                              </div>
                            </div>
                          ))}
                          <button
                            onClick={() => faqAddQuestion(catIdx)}
                            className="w-full py-2.5 border border-dashed border-zinc-700 rounded-2xl text-xs font-black uppercase text-zinc-500 hover:border-[#00f3ff] hover:text-[#00f3ff] transition-all cursor-pointer flex items-center justify-center gap-2"
                          >
                            <Icon icon="lucide:plus" /> Adicionar Pergunta
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── CUPONS ────────────────────────────────────────────── */}
            {tab === 'cupons' && (
              <div>
                <div className="mb-10">
                  <h1 className="text-4xl font-black uppercase tracking-tighter text-white">
                    Cupons <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] to-[#ff00ff]">de Desconto</span>
                  </h1>
                  <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mt-1">Crie e gerencie cupons para os clientes</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl">
                  {/* Criar cupom */}
                  <div className="bg-black border border-zinc-800 rounded-[24px] p-6 space-y-4">
                    <h3 className="text-sm font-black uppercase text-[#00f3ff] tracking-widest flex items-center gap-2">
                      <Icon icon="lucide:plus-circle" /> Criar / Editar Cupom
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1 block">Código (ex: BALU10)</label>
                        <input
                          value={couponForm.code}
                          onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                          className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm font-black text-white focus:outline-none focus:border-[#00f3ff] placeholder:text-zinc-600 uppercase"
                          placeholder="BALU10"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1 block">Desconto (%)</label>
                        <input
                          type="number" min="1" max="100"
                          value={couponForm.discount}
                          onChange={(e) => setCouponForm({ ...couponForm, discount: e.target.value })}
                          className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00f3ff]"
                          placeholder="10"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1 block">Limite de usos (opcional)</label>
                        <input
                          type="number" min="1"
                          value={couponForm.usageLimit}
                          onChange={(e) => setCouponForm({ ...couponForm, usageLimit: e.target.value })}
                          className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00f3ff]"
                          placeholder="Ex: 100"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1 block">Válido até (opcional)</label>
                        <input
                          type="date"
                          value={couponForm.expiresAt}
                          onChange={(e) => setCouponForm({ ...couponForm, expiresAt: e.target.value })}
                          className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00f3ff]"
                        />
                      </div>
                      <label className="flex items-center justify-between cursor-pointer pt-1">
                        <span className="text-sm font-black text-white">Ativo</span>
                        <div
                          onClick={() => setCouponForm({ ...couponForm, active: !couponForm.active })}
                          className={`relative w-12 h-6 rounded-full transition-all cursor-pointer ${couponForm.active ? 'bg-[#00f3ff]' : 'bg-zinc-700'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${couponForm.active ? 'left-7' : 'left-1'}`} />
                        </div>
                      </label>
                    </div>
                    {couponMsg && (
                      <p className={`text-xs font-black ${couponMsg.includes('salvo') ? 'text-[#00ff00]' : 'text-red-400'}`}>{couponMsg}</p>
                    )}
                    <button
                      onClick={handleSaveCoupon}
                      disabled={couponSaving}
                      className="w-full py-3 bg-[#00f3ff] text-black font-black uppercase rounded-xl hover:bg-[#00d4e0] transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {couponSaving ? <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Salvando...</> : <><Icon icon="lucide:save" /> Salvar Cupom</>}
                    </button>
                  </div>

                  {/* Lista de cupons */}
                  <div className="bg-black border border-zinc-800 rounded-[24px] p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-black uppercase text-[#ff00ff] tracking-widest flex items-center gap-2">
                        <Icon icon="lucide:ticket" /> Cupons Cadastrados
                      </h3>
                      <button onClick={loadCoupons} className="text-zinc-500 hover:text-white transition-colors cursor-pointer">
                        <Icon icon="lucide:refresh-cw" />
                      </button>
                    </div>

                    {couponsLoading ? (
                      <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-[#00f3ff] border-t-transparent rounded-full animate-spin" /></div>
                    ) : coupons.length === 0 ? (
                      <p className="text-zinc-600 text-xs font-bold text-center py-10">Nenhum cupom cadastrado.</p>
                    ) : (
                      <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                        {coupons.map((c) => (
                          <div key={c.code} className="flex items-center justify-between bg-zinc-900 rounded-2xl px-4 py-3 border border-white/5">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${c.active ? 'bg-[#00ff00]' : 'bg-zinc-600'}`} />
                              <div>
                                <p className="text-sm font-black text-white tracking-widest">{c.code}</p>
                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                  <span className="text-[10px] font-bold text-[#00f3ff]">-{c.discount}%</span>
                                  {c.usageLimit != null && (
                                    <span className="text-[10px] text-zinc-500">{c.usageCount ?? 0}/{c.usageLimit} usos</span>
                                  )}
                                  {c.expiresAt && (
                                    <span className="text-[10px] text-zinc-500">até {new Date(c.expiresAt).toLocaleDateString('pt-BR')}</span>
                                  )}
                                  {!c.active && <span className="text-[10px] text-red-400 font-black">INATIVO</span>}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setCouponForm({ code: c.code, discount: String(c.discount), active: c.active, expiresAt: c.expiresAt ?? '', usageLimit: c.usageLimit != null ? String(c.usageLimit) : '' })}
                                className="p-2 rounded-xl text-zinc-500 hover:text-[#00f3ff] hover:bg-[#00f3ff]/10 transition-all cursor-pointer"
                                title="Editar"
                              >
                                <Icon icon="lucide:pencil" className="text-sm" />
                              </button>
                              <button
                                onClick={() => handleDeleteCoupon(c.code)}
                                disabled={deletingCoupon === c.code}
                                className="p-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer disabled:opacity-50"
                                title="Deletar"
                              >
                                {deletingCoupon === c.code
                                  ? <div className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                  : <Icon icon="lucide:trash-2" className="text-sm" />}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── CONFIGURAÇÕES ─────────────────────────────────────── */}
            {tab === 'configuracoes' && siteConfig && (
              <div>
                <div className="mb-10">
                  <h1 className="text-4xl font-black uppercase tracking-tighter text-white">
                    Configurações <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] to-[#ff00ff]">do Site</span>
                  </h1>
                  <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mt-1">Edite as configurações globais da loja</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
                  {/* WhatsApp */}
                  <div className="bg-black border border-zinc-800 rounded-[24px] p-6 space-y-4">
                    <h3 className="text-sm font-black uppercase text-[#25D366] tracking-widest flex items-center gap-2">
                      <Icon icon="mdi:whatsapp" /> WhatsApp
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1 block">Número (com DDI)</label>
                        <input value={siteConfig.whatsappNumber} onChange={(e) => setSiteConfig({...siteConfig, whatsappNumber: e.target.value})}
                          className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#25D366] placeholder:text-zinc-600"
                          placeholder="5511999999999" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1 block">Mensagem Padrão CTA</label>
                        <textarea value={siteConfig.whatsappMessage} onChange={(e) => setSiteConfig({...siteConfig, whatsappMessage: e.target.value})}
                          className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#25D366] placeholder:text-zinc-600 resize-none h-20"
                          placeholder="Mensagem padrão..." />
                      </div>
                    </div>
                  </div>

                  {/* Loja */}
                  <div className="bg-black border border-zinc-800 rounded-[24px] p-6 space-y-4">
                    <h3 className="text-sm font-black uppercase text-[#00f3ff] tracking-widest flex items-center gap-2">
                      <Icon icon="lucide:store" /> Dados da Loja
                    </h3>
                    <div className="space-y-3">
                      {[
                        { key: 'storeName', label: 'Nome da Loja', placeholder: 'Balu 3D' },
                        { key: 'storeEmail', label: 'E-mail de Contato', placeholder: 'contato@balu3d.com.br' },
                        { key: 'instagramUrl', label: 'Instagram URL', placeholder: 'https://instagram.com/...' },
                      ].map(({ key, label, placeholder }) => (
                        <div key={key}>
                          <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1 block">{label}</label>
                          <input value={(siteConfig as unknown as Record<string, unknown>)[key] as string}
                            onChange={(e) => setSiteConfig({...siteConfig, [key]: e.target.value})}
                            className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00f3ff] placeholder:text-zinc-600"
                            placeholder={placeholder} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pagamentos */}
                  <div className="bg-black border border-zinc-800 rounded-[24px] p-6 space-y-4">
                    <h3 className="text-sm font-black uppercase text-[#00ff00] tracking-widest flex items-center gap-2">
                      <Icon icon="lucide:credit-card" /> Pagamentos
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1 block">Desconto Pix (%)</label>
                        <input type="number" min="0" max="30" value={siteConfig.pixDiscount}
                          onChange={(e) => setSiteConfig({...siteConfig, pixDiscount: Number(e.target.value)})}
                          className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00f3ff]" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1 block">Valor do Frete (R$)</label>
                        <input type="number" min="0" step="0.01" value={siteConfig.shippingCost ?? 15}
                          onChange={(e) => setSiteConfig({...siteConfig, shippingCost: Number(e.target.value)})}
                          className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00f3ff]" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1 block">Frete Grátis acima de (R$, 0=desativado)</label>
                        <input type="number" min="0" value={siteConfig.freeShippingAbove}
                          onChange={(e) => setSiteConfig({...siteConfig, freeShippingAbove: Number(e.target.value)})}
                          className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00f3ff]" />
                      </div>
                    </div>
                  </div>

                  {/* Modo Manutenção */}
                  <div className="bg-black border border-zinc-800 rounded-[24px] p-6 space-y-4">
                    <h3 className="text-sm font-black uppercase text-[#ff00ff] tracking-widest flex items-center gap-2">
                      <Icon icon="lucide:wrench" /> Manutenção
                    </h3>
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <p className="text-sm font-black text-white">Modo Manutenção</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">Exibe banner de manutenção para visitantes</p>
                      </div>
                      <div
                        onClick={() => setSiteConfig({...siteConfig, maintenanceMode: !siteConfig.maintenanceMode})}
                        className={`relative w-12 h-6 rounded-full transition-all cursor-pointer ${siteConfig.maintenanceMode ? 'bg-[#ff00ff]' : 'bg-zinc-700'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${siteConfig.maintenanceMode ? 'left-7' : 'left-1'}`} />
                      </div>
                    </label>
                  </div>
                </div>

                {/* Salvar */}
                <div className="mt-8 flex items-center gap-4">
                  <button onClick={handleSaveConfig} disabled={configSaving}
                    className="px-8 py-4 bg-[#00f3ff] text-black font-black uppercase rounded-2xl hover:bg-[#00d4e0] transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed flex items-center gap-2">
                    {configSaving ? (
                      <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Salvando...</>
                    ) : configSaved ? (
                      <><Icon icon="lucide:check" /> Salvo!</>
                    ) : (
                      <><Icon icon="lucide:save" /> Salvar Configurações</>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ── AGENDA ────────────────────────────────────────────── */}
            {tab === 'agenda' && (
              <TabAgenda
                agendaEvents={agendaEvents}
                agendaLoading={agendaLoading}
                agendaSaving={agendaSaving}
                deletingEvent={deletingEvent}
                agendaMsg={agendaMsg}
                editingEvent={editingEvent}
                eventForm={eventForm}
                setEditingEvent={setEditingEvent}
                setEventForm={setEventForm}
                onSave={handleSaveEvent}
                onDelete={handleDeleteEvent}
              />
            )}

          </div>
        </main>
      </div>
    </div>
  )
}
