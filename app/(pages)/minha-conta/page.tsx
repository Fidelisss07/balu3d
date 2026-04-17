'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import { signOut, updateProfile } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import { getOrdersByUser, type Order } from '@/lib/db'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const STATUS_COLOR: Record<string, string> = {
  confirmado: '#00ff00',
  impressao: '#ff00ff',
  transito: '#00f3ff',
  entregue: '#00ff00',
  cancelado: '#ef4444',
}

const STATUS_LABEL: Record<string, string> = {
  confirmado: 'Confirmado',
  impressao: 'Em Impressão',
  transito: 'Em Trânsito',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
}

type Tab = 'pedidos' | 'dados'

function OrderSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5 animate-pulse"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="h-4 w-24 rounded bg-white/10" />
            <div className="h-5 w-20 rounded-full bg-white/10" />
          </div>
          <div className="h-3 w-32 rounded bg-white/10 mb-2" />
          <div className="h-3 w-40 rounded bg-white/10" />
        </div>
      ))}
    </div>
  )
}

export default function MinhaContaPage() {
  const router = useRouter()
  const { user, profile, loading } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('pedidos')
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersError, setOrdersError] = useState<string | null>(null)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [nameSaving, setNameSaving] = useState(false)
  const [nameMsg, setNameMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  // Route guard
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/minha-conta')
    }
  }, [user, loading, router])

  // Fetch orders when tab is active and user is ready
  useEffect(() => {
    if (!user || activeTab !== 'pedidos') return

    setOrdersLoading(true)
    setOrdersError(null)

    getOrdersByUser(user.uid)
      .then((data) => setOrders(data))
      .catch(() => setOrdersError('Não foi possível carregar seus pedidos.'))
      .finally(() => setOrdersLoading(false))
  }, [user, activeTab])

  const handleLogout = async () => {
    await signOut(auth)
    router.push('/')
  }

  const handleSaveName = async () => {
    if (!user) return
    const trimmed = nameInput.trim()
    if (!trimmed) { setNameMsg({ type: 'err', text: 'Nome não pode ser vazio.' }); return }
    setNameSaving(true)
    try {
      await updateProfile(user, { displayName: trimmed })
      setNameMsg({ type: 'ok', text: 'Nome atualizado!' })
      setEditingName(false)
    } catch {
      setNameMsg({ type: 'err', text: 'Erro ao salvar. Tente novamente.' })
    }
    setNameSaving(false)
  }

  // Show nothing while auth resolves
  if (loading || !user) {
    return null
  }

  const displayName =
    user.displayName || profile?.name || user.email?.split('@')[0] || 'Usuário'
  const initial = displayName.charAt(0).toUpperCase()
  const isAdmin = profile?.role === 'admin'

  // Format Firestore Timestamp or Date to string
  const formatDate = (value: unknown): string => {
    if (!value) return '—'
    if (typeof value === 'object' && value !== null && 'toDate' in value) {
      return (value as { toDate: () => Date }).toDate().toLocaleDateString('pt-BR')
    }
    if (value instanceof Date) return value.toLocaleDateString('pt-BR')
    return String(value)
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] text-white">
      <Navbar />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-12">
        {/* ── Header ── */}
        <div className="mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar */}
          <div
            className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold border-2"
            style={{
              background: 'linear-gradient(135deg, #00f3ff22, #ff00ff22)',
              borderColor: '#00f3ff',
              color: '#00f3ff',
            }}
          >
            {initial}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold">
                Olá, {displayName}
              </h1>
              <span
                className="px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider"
                style={{
                  background: isAdmin ? '#ff00ff22' : '#00f3ff22',
                  color: isAdmin ? '#ff00ff' : '#00f3ff',
                  border: `1px solid ${isAdmin ? '#ff00ff' : '#00f3ff'}`,
                }}
              >
                {isAdmin ? 'Admin' : 'Cliente'}
              </span>
            </div>
            {user.metadata?.creationTime && (
              <p className="text-sm text-white/40">
                Membro desde{' '}
                {new Date(user.metadata.creationTime).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-white/10 text-white/60 hover:border-red-500/60 hover:text-red-400 transition-colors"
          >
            <Icon icon="ph:sign-out-bold" width={16} />
            Sair da Conta
          </button>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 mb-8 border-b border-white/10">
          {(
            [
              { key: 'pedidos', label: 'Meus Pedidos', icon: 'ph:package-bold' },
              { key: 'dados', label: 'Dados Pessoais', icon: 'ph:user-circle-bold' },
            ] as { key: Tab; label: string; icon: string }[]
          ).map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className="flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors relative"
              style={{
                color: activeTab === key ? '#00f3ff' : 'rgba(255,255,255,0.4)',
              }}
            >
              <Icon icon={icon} width={16} />
              {label}
              {activeTab === key && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ background: '#00f3ff' }}
                />
              )}
            </button>
          ))}
        </div>

        {/* ── Tab: Pedidos ── */}
        {activeTab === 'pedidos' && (
          <section>
            {ordersLoading && <OrderSkeleton />}

            {ordersError && (
              <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-red-400">
                <Icon icon="ph:warning-circle-bold" width={20} />
                {ordersError}
              </div>
            )}

            {!ordersLoading && !ordersError && orders.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 gap-5 text-center">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ background: '#00f3ff11', border: '1px solid #00f3ff33' }}
                >
                  <Icon icon="ph:package-bold" width={36} style={{ color: '#00f3ff' }} />
                </div>
                <div>
                  <p className="text-lg font-semibold text-white/80 mb-1">
                    Você ainda não fez nenhum pedido
                  </p>
                  <p className="text-sm text-white/40">
                    Explore nossos produtos e faça seu primeiro pedido!
                  </p>
                </div>
                <Link
                  href="/produtos"
                  className="px-6 py-3 rounded-lg text-sm font-semibold transition-opacity hover:opacity-80"
                  style={{ background: '#00f3ff', color: '#0a0a0a' }}
                >
                  Explorar Produtos
                </Link>
              </div>
            )}

            {!ordersLoading && orders.length > 0 && (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5 hover:border-white/20 transition-colors"
                  >
                    {/* Order header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                      <span className="font-mono text-sm text-white/60">
                        #{order.id?.slice(0, 8) ?? '—'}
                      </span>
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
                        style={{
                          background: `${STATUS_COLOR[order.status] ?? '#888'}22`,
                          color: STATUS_COLOR[order.status] ?? '#888',
                          border: `1px solid ${STATUS_COLOR[order.status] ?? '#888'}`,
                        }}
                      >
                        {STATUS_LABEL[order.status] ?? order.status}
                      </span>
                    </div>

                    {/* Date & Total */}
                    <div className="flex flex-wrap gap-4 text-sm text-white/50 mb-3">
                      <span className="flex items-center gap-1.5">
                        <Icon icon="ph:calendar-blank-bold" width={14} />
                        {formatDate(order.createdAt)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Icon icon="ph:money-bold" width={14} />
                        R$ {order.total?.toFixed(2).replace('.', ',')}
                      </span>
                    </div>

                    {/* Items */}
                    <ul className="space-y-1 mb-4">
                      {order.items?.map((item, idx) => (
                        <li key={idx} className="text-sm text-white/70">
                          {item.name} ×{item.qty ?? 1}
                        </li>
                      ))}
                    </ul>

                    {/* Tracking button */}
                    <Link
                      href={`/rastreamento?id=${order.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold border transition-colors hover:opacity-80"
                      style={{
                        borderColor: '#00f3ff',
                        color: '#00f3ff',
                        background: '#00f3ff11',
                      }}
                    >
                      <Icon icon="ph:map-pin-bold" width={14} />
                      Ver Rastreamento
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── Tab: Dados Pessoais ── */}
        {activeTab === 'dados' && (
          <section className="space-y-4">
            {/* Nome — editável */}
            <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
              <p className="flex items-center gap-2 text-xs text-white/40 uppercase tracking-wider mb-2">
                <Icon icon="ph:user-bold" width={14} />
                Nome completo
              </p>
              {editingName ? (
                <div className="space-y-2">
                  <input
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-[#00f3ff] transition-colors"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveName}
                      disabled={nameSaving}
                      className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#00f3ff] text-black hover:opacity-80 transition-opacity disabled:opacity-50 cursor-pointer"
                    >
                      {nameSaving ? 'Salvando...' : 'Salvar'}
                    </button>
                    <button
                      onClick={() => { setEditingName(false); setNameMsg(null) }}
                      className="px-4 py-1.5 rounded-lg text-xs font-semibold border border-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                  {nameMsg && (
                    <p className={`text-xs font-semibold ${nameMsg.type === 'ok' ? 'text-[#00ff00]' : 'text-red-400'}`}>{nameMsg.text}</p>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-sm font-mono text-white/80">{displayName}</p>
                  <button
                    onClick={() => { setNameInput(displayName); setEditingName(true); setNameMsg(null) }}
                    className="text-xs text-[#00f3ff] hover:underline cursor-pointer"
                  >
                    Editar
                  </button>
                </div>
              )}
            </div>

            {/* E-mail — somente leitura */}
            <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
              <p className="flex items-center gap-2 text-xs text-white/40 uppercase tracking-wider mb-1.5">
                <Icon icon="ph:envelope-bold" width={14} />
                E-mail
              </p>
              <p className="text-sm font-mono text-white/80 break-all">{user.email ?? '—'}</p>
            </div>

            {/* UID — somente leitura */}
            <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
              <p className="flex items-center gap-2 text-xs text-white/40 uppercase tracking-wider mb-1.5">
                <Icon icon="ph:fingerprint-bold" width={14} />
                UID (suporte)
              </p>
              <p className="text-sm font-mono break-all" style={{ color: '#00f3ff88', fontSize: '0.72rem' }}>{user.uid}</p>
            </div>

            <p className="text-xs text-white/30 pt-2">
              Para alterar o e-mail, entre em contato com o suporte.
            </p>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}
