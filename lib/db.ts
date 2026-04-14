import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

export interface CartItem {
  slug: string
  name: string
  price: number
  qty: number
  img: string
  color: string
}

export interface Order {
  id?: string
  userId: string
  userName: string
  userEmail: string
  items: CartItem[]
  subtotal: number
  shipping: number
  total: number
  shippingMethod: string
  address: {
    name: string
    email: string
    cep: string
    logradouro: string
    bairro?: string
    city: string
    state: string
  }
  paymentMethod?: 'credito' | 'pix'
  status: 'confirmado' | 'impressao' | 'transito' | 'entregue' | 'cancelado'
  trackingCode?: string
  carrier?: string
  estimatedDelivery?: string
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

export interface TrackingEvent {
  date: string
  title: string
  subtitle?: string
  detail?: string
}

// ═══════════════════════════════════════════════════════════════════════════════
// CARRINHO
// ═══════════════════════════════════════════════════════════════════════════════

export async function getCart(userId: string): Promise<CartItem[]> {
  const snap = await getDoc(doc(db, 'carts', userId))
  return snap.exists() ? (snap.data().items as CartItem[]) : []
}

export async function saveCart(userId: string, items: CartItem[]): Promise<void> {
  await setDoc(doc(db, 'carts', userId), { items, updatedAt: serverTimestamp() })
}

export async function clearCart(userId: string): Promise<void> {
  await setDoc(doc(db, 'carts', userId), { items: [], updatedAt: serverTimestamp() })
}

// ═══════════════════════════════════════════════════════════════════════════════
// PEDIDOS
// ═══════════════════════════════════════════════════════════════════════════════

export async function createOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'orders'), {
    ...order,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const snap = await getDoc(doc(db, 'orders', orderId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Order
}

export async function getOrdersByUser(userId: string): Promise<Order[]> {
  const q = query(
    collection(db, 'orders'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order))
}

export async function getAllOrders(): Promise<Order[]> {
  const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order))
}

export async function updateOrderStatus(
  orderId: string,
  status: Order['status'],
  extra?: { trackingCode?: string; carrier?: string; estimatedDelivery?: string }
): Promise<void> {
  await updateDoc(doc(db, 'orders', orderId), {
    status,
    ...extra,
    updatedAt: serverTimestamp(),
  })
}

// ═══════════════════════════════════════════════════════════════════════════════
// RASTREAMENTO — eventos por pedido
// ═══════════════════════════════════════════════════════════════════════════════

export async function getTrackingEvents(orderId: string): Promise<TrackingEvent[]> {
  const q = query(
    collection(db, 'orders', orderId, 'events'),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => d.data() as TrackingEvent)
}

export async function addTrackingEvent(orderId: string, event: TrackingEvent): Promise<void> {
  await addDoc(collection(db, 'orders', orderId, 'events'), {
    ...event,
    createdAt: serverTimestamp(),
  })
}

// ═══════════════════════════════════════════════════════════════════════════════
// USUÁRIOS (admin)
// ═══════════════════════════════════════════════════════════════════════════════

export async function getAllUsers(): Promise<{ uid: string; name: string; email: string; role: string; createdAt?: Timestamp }[]> {
  const snap = await getDocs(collection(db, 'users'))
  return snap.docs.map((d) => d.data() as { uid: string; name: string; email: string; role: string; createdAt?: Timestamp })
}

export async function setUserRole(uid: string, role: 'customer' | 'admin'): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { role })
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUTOS FIRESTORE (admin pode adicionar produtos extras além do catalog.ts)
// ═══════════════════════════════════════════════════════════════════════════════

export async function getFirestoreProducts() {
  const snap = await getDocs(collection(db, 'products'))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function addFirestoreProduct(product: Record<string, unknown>): Promise<string> {
  const ref = await addDoc(collection(db, 'products'), {
    ...product,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateFirestoreProduct(productId: string, data: Partial<Record<string, unknown>>): Promise<void> {
  await updateDoc(doc(db, 'products', productId), { ...data, updatedAt: serverTimestamp() })
}

export async function deleteFirestoreProduct(productId: string): Promise<void> {
  await deleteDoc(doc(db, 'products', productId))
}
