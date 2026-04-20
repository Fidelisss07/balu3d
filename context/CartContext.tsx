'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { getCart, saveCart, clearCart, type CartItem } from '@/lib/db'
import { logger } from '@/lib/logger'

interface CartContextType {
  items: CartItem[]
  count: number
  total: number
  addItem: (item: Omit<CartItem, 'qty'> & { qty?: number }) => void
  removeItem: (slug: string) => void
  updateQty: (slug: string, qty: number) => void
  clear: () => void
  loading: boolean
}

const CartContext = createContext<CartContextType>({
  items: [],
  count: 0,
  total: 0,
  addItem: () => {},
  removeItem: () => {},
  updateQty: () => {},
  clear: () => {},
  loading: false,
})

const LOCAL_KEY = 'balu3d_cart'

function loadLocal(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '[]')
  } catch {
    return []
  }
}

function saveLocal(items: CartItem[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(items))
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  // Lê localStorage de forma síncrona para evitar flash de carrinho vazio
  const [items, setItems] = useState<CartItem[]>(() => loadLocal())
  const [loading, setLoading] = useState(false)
  // Controla se o carregamento inicial já terminou (evita salvar [] antes de carregar)
  const [initialized, setInitialized] = useState(false)

  // Carrega carrinho — Firestore se logado, localStorage se não
  // Aguarda o Auth resolver antes de agir
  useEffect(() => {
    if (authLoading) return
    async function load() {
      if (user) {
        setLoading(true)
        try {
          const firestoreItems = await getCart(user.uid)
          const local = loadLocal()
          if (local.length > 0) {
            const merged = [...firestoreItems]
            for (const li of local) {
              const existing = merged.find((i) => i.slug === li.slug)
              if (existing) {
                existing.qty += li.qty
              } else {
                merged.push(li)
              }
            }
            setItems(merged)
            await saveCart(user.uid, merged)
            localStorage.removeItem(LOCAL_KEY)
          } else {
            setItems(firestoreItems)
          }
        } catch (err) {
          logger.error('Erro ao carregar carrinho do Firestore:', err)
          // fallback: mantém o que está no localStorage
        } finally {
          setLoading(false)
          setInitialized(true)
        }
      } else {
        // sem user: localStorage já está no estado inicial
        setInitialized(true)
      }
    }
    load()
  }, [user, authLoading])

  // Persiste sempre que items mudam — só após inicialização completa
  useEffect(() => {
    if (!initialized) return
    if (user) {
      saveCart(user.uid, items)
    } else {
      saveLocal(items)
    }
  }, [items, user, initialized])

  const addItem = useCallback((item: Omit<CartItem, 'qty'> & { qty?: number }) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.slug === item.slug)
      if (existing) {
        return prev.map((i) =>
          i.slug === item.slug ? { ...i, qty: i.qty + (item.qty ?? 1) } : i
        )
      }
      return [...prev, { ...item, qty: item.qty ?? 1 }]
    })
  }, [])

  const removeItem = useCallback((slug: string) => {
    setItems((prev) => prev.filter((i) => i.slug !== slug))
  }, [])

  const updateQty = useCallback((slug: string, qty: number) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => i.slug !== slug))
    } else {
      setItems((prev) => prev.map((i) => (i.slug === slug ? { ...i, qty } : i)))
    }
  }, [])

  const clear = useCallback(async () => {
    setItems([])
    if (user) await clearCart(user.uid)
    else localStorage.removeItem(LOCAL_KEY)
  }, [user])

  const count = items.reduce((s, i) => s + i.qty, 0)
  const total = items.reduce((s, i) => s + i.price * i.qty, 0)

  return (
    <CartContext.Provider value={{ items, count, total, addItem, removeItem, updateQty, clear, loading }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
