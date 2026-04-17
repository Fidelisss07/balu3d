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

export interface CarouselSlide {
  id: number
  title: string
  subtitle: string
  image: string
  bgColor: string
  textColor: string
  accentColor: string
}

export interface Carousel {
  slides: CarouselSlide[]
  updatedAt?: Timestamp
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

// ═══════════════════════════════════════════════════════════════════════════════
// CARROSSÉIS (ADMIN)
// ═══════════════════════════════════════════════════════════════════════════════

export async function getCarousel(): Promise<Carousel> {
  const snap = await getDoc(doc(db, 'admin', 'carousel'))
  if (!snap.exists()) {
    // Retorna padrão se não existir
    return {
      slides: [
        { id: 0, title: 'CHARIZARD', subtitle: 'UNBOUND', image: '', bgColor: '#1a1a1a', textColor: '#00f3ff', accentColor: '#ff6b35' },
        { id: 1, title: 'DRAGONITE', subtitle: 'LEGENDARY', image: '', bgColor: '#1a1a1a', textColor: '#00f3ff', accentColor: '#4a90e2' },
        { id: 2, title: 'MEWTWO', subtitle: 'MYTHICAL', image: '', bgColor: '#1a1a1a', textColor: '#00f3ff', accentColor: '#a855f7' },
      ],
    }
  }
  return snap.data() as Carousel
}

export async function updateCarousel(carousel: Carousel): Promise<void> {
  await setDoc(doc(db, 'admin', 'carousel'), {
    ...carousel,
    updatedAt: serverTimestamp(),
  })
}

// ═══════════════════════════════════════════════════════════════════════════════
// COLEÇÕES (seção "Suas Coleções" na homepage)
// ═══════════════════════════════════════════════════════════════════════════════

export interface Collection {
  id: number
  title: string
  img: string
  color: string
}

export interface CollectionsData {
  sectionTitle: string
  highlightWord: string
  items: Collection[]
}

const DEFAULT_COLLECTIONS: CollectionsData = {
  sectionTitle: 'Suas',
  highlightWord: 'Coleções',
  items: [
    { id: 0, title: 'Legendary Collection', img: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?q=80&w=600', color: '#00f3ff' },
    { id: 1, title: 'Classic Kanto', img: 'https://images.unsplash.com/photo-1541562232579-512a21360020?q=80&w=600', color: '#ff00ff' },
    { id: 2, title: 'Rare Shiny Edition', img: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?q=80&w=800', color: '#00ff00' },
    { id: 3, title: 'Limited Drops', img: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=600', color: '#00f3ff' },
  ],
}

export async function getCollections(): Promise<CollectionsData> {
  const snap = await getDoc(doc(db, 'admin', 'collections'))
  if (!snap.exists()) return DEFAULT_COLLECTIONS
  return snap.data() as CollectionsData
}

export async function updateCollections(data: CollectionsData): Promise<void> {
  await setDoc(doc(db, 'admin', 'collections'), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

// ═══════════════════════════════════════════════════════════════════════════════
// WISHLIST
// ═══════════════════════════════════════════════════════════════════════════════

export async function getWishlist(userId: string): Promise<string[]> {
  const snap = await getDoc(doc(db, 'wishlists', userId))
  return snap.exists() ? (snap.data().slugs as string[]) : []
}

export async function toggleWishlist(userId: string, slug: string): Promise<boolean> {
  const ref = doc(db, 'wishlists', userId)
  const snap = await getDoc(ref)
  const current: string[] = snap.exists() ? (snap.data().slugs as string[]) : []
  const isIn = current.includes(slug)
  const updated = isIn ? current.filter((s) => s !== slug) : [...current, slug]
  await setDoc(ref, { slugs: updated, updatedAt: serverTimestamp() })
  return !isIn
}

// ═══════════════════════════════════════════════════════════════════════════════
// REVIEWS
// ═══════════════════════════════════════════════════════════════════════════════

export interface Review {
  id?: string
  productSlug: string
  userId: string
  userName: string
  rating: number  // 1-5
  text: string
  createdAt?: Timestamp
  verified?: boolean  // comprador verificado
}

export async function getReviews(productSlug: string): Promise<Review[]> {
  const q = query(
    collection(db, 'reviews'),
    where('productSlug', '==', productSlug),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Review))
}

export async function addReview(review: Omit<Review, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'reviews'), {
    ...review,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function hasUserReviewed(userId: string, productSlug: string): Promise<boolean> {
  const q = query(
    collection(db, 'reviews'),
    where('userId', '==', userId),
    where('productSlug', '==', productSlug)
  )
  const snap = await getDocs(q)
  return !snap.empty
}

// ═══════════════════════════════════════════════════════════════════════════════
// RESTOCK (avise-me)
// ═══════════════════════════════════════════════════════════════════════════════

export async function subscribeRestock(productSlug: string, email: string): Promise<void> {
  await setDoc(doc(db, 'restock', `${productSlug}_${email}`), {
    productSlug,
    email,
    createdAt: serverTimestamp(),
  }, { merge: true })
}

export async function getRestockSubscribers(productSlug: string): Promise<{ email: string }[]> {
  const q = query(collection(db, 'restock'), where('productSlug', '==', productSlug))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ email: d.data().email as string }))
}

// ═══════════════════════════════════════════════════════════════════════════════
// FAQ (editável pelo admin)
// ═══════════════════════════════════════════════════════════════════════════════

export interface FaqItem {
  q: string
  a: string
}

export interface FaqCategory {
  title: string
  icon: string
  color: string
  faqs: FaqItem[]
}

const DEFAULT_FAQ: FaqCategory[] = [
  {
    title: 'Produto & Qualidade',
    icon: 'lucide:box',
    color: '#00f3ff',
    faqs: [
      { q: 'Qual a resolução das figuras?', a: 'Todas as nossas figuras são impressas em resina 8K de ultra alta definição, garantindo superfícies lisas e detalhes microscópicos preservados. Nossa impressora SLA opera com camadas de 10 microns.' },
      { q: 'Quais materiais são utilizados?', a: 'Utilizamos resina fotopolimerizável Tough V4 para durabilidade e filamentos Silk Premium para bases e acessórios maiores. A resina é tratada com UV para máxima resistência.' },
      { q: 'As figuras vêm pintadas?', a: 'Sim! Todas as figuras são pintadas à mão por artistas especializados em miniatura. Cada peça leva em média 4 a 8 horas de pintura detalhada.' },
      { q: 'Qual o tamanho padrão das figuras?', a: 'O tamanho padrão é escala 1:8 (aproximadamente 20-25cm de altura). Também trabalhamos com escalas 1:4, 1:12 e tamanhos customizados mediante consulta.' },
    ],
  },
  {
    title: 'Pedidos & Customização',
    icon: 'mdi:pokeball',
    color: '#ff00ff',
    faqs: [
      { q: 'Posso pedir um Pokémon customizado?', a: 'Sim! Aceitamos encomendas via WhatsApp para modelos específicos, escalas customizadas ou variantes Shiny. Envie uma mensagem com sua ideia.' },
      { q: 'Posso enviar meu próprio arquivo STL?', a: 'Absolutamente! Se você tem um arquivo STL, enviamos um orçamento personalizado baseado na complexidade e tamanho do modelo.' },
      { q: 'Como funciona o processo de encomenda?', a: '1) Você nos contata pelo WhatsApp com os detalhes do que deseja. 2) Enviamos um orçamento em 24h. 3) Após aprovação, produzimos em 3-5 dias úteis. 4) Enviamos com rastreamento.' },
      { q: 'Vocês fazem edições limitadas?', a: 'Sim! Toda semana lançamos edições limitadas de Pokémon raros e Shiny. Assine nossa lista VIP via WhatsApp para ser avisado primeiro.' },
    ],
  },
  {
    title: 'Entrega & Envio',
    icon: 'lucide:truck',
    color: '#00ff00',
    faqs: [
      { q: 'Qual o tempo de entrega?', a: 'O prazo de produção é de 3 a 5 dias úteis. O tempo de transporte varia entre 2 a 7 dias dependendo da sua localização e modalidade escolhida.' },
      { q: 'As figuras chegam protegidas?', a: 'Sim! Cada figura é embalada individualmente em espuma de alta densidade, depois colocada em caixa rígida com lacre personalizado Balu 3D. Garantia contra danos no transporte.' },
      { q: 'Vocês enviam para todo o Brasil?', a: 'Enviamos para todos os estados do Brasil via Correios (PAC/SEDEX) e transportadoras parceiras. Calculamos o frete no checkout baseado no CEP.' },
      { q: 'Há frete grátis?', a: 'Sim! Compras acima de R$ 350,00 têm frete grátis para todo o Brasil. Pedidos menores pagam frete calculado pelo CEP de destino.' },
    ],
  },
  {
    title: 'Pagamento & Segurança',
    icon: 'lucide:shield-check',
    color: '#00f3ff',
    faqs: [
      { q: 'Quais formas de pagamento aceitam?', a: 'Aceitamos PIX (desconto de 5%), cartão de crédito em até 12x, cartão de débito, boleto bancário e transferência.' },
      { q: 'O site é seguro para compras?', a: 'Sim! Nosso site usa certificado SSL e processamento de pagamento via Stripe/Mercado Pago. Seus dados são criptografados e nunca armazenados.' },
      { q: 'Posso cancelar meu pedido?', a: 'Pedidos podem ser cancelados em até 2 horas após a confirmação do pagamento, antes do início da produção. Após isso, aplicamos nossa política de reembolso.' },
    ],
  },
]

export async function getFaq(): Promise<FaqCategory[]> {
  const snap = await getDoc(doc(db, 'admin', 'faq'))
  if (!snap.exists()) return DEFAULT_FAQ
  return snap.data().categories as FaqCategory[]
}

export async function updateFaq(categories: FaqCategory[]): Promise<void> {
  await setDoc(doc(db, 'admin', 'faq'), { categories, updatedAt: serverTimestamp() })
}

// ═══════════════════════════════════════════════════════════════════════════════
// CUPONS
// ═══════════════════════════════════════════════════════════════════════════════

export interface Coupon {
  code: string        // ex: 'BALU10' — chave do doc
  discount: number    // percentual (ex: 10 = 10%)
  active: boolean
  usageLimit?: number // opcional: máximo de usos
  usageCount?: number
  expiresAt?: string  // ISO date string opcional
  createdAt?: Timestamp
}

export async function getCoupons(): Promise<Coupon[]> {
  const snap = await getDocs(collection(db, 'coupons'))
  return snap.docs.map((d) => ({ code: d.id, ...d.data() } as Coupon))
}

export async function getActiveCoupons(): Promise<Coupon[]> {
  const q = query(collection(db, 'coupons'), where('active', '==', true))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ code: d.id, ...d.data() } as Coupon))
}

export async function upsertCoupon(coupon: Coupon): Promise<void> {
  const { code, ...rest } = coupon
  await setDoc(doc(db, 'coupons', code.toUpperCase()), {
    ...rest,
    createdAt: serverTimestamp(),
  }, { merge: true })
}

export async function deleteCoupon(code: string): Promise<void> {
  await deleteDoc(doc(db, 'coupons', code.toUpperCase()))
}

export async function validateCoupon(code: string): Promise<Coupon | null> {
  const snap = await getDoc(doc(db, 'coupons', code.toUpperCase()))
  if (!snap.exists()) return null
  const c = { code: snap.id, ...snap.data() } as Coupon
  if (!c.active) return null
  if (c.expiresAt && new Date(c.expiresAt) < new Date()) return null
  if (c.usageLimit != null && (c.usageCount ?? 0) >= c.usageLimit) return null
  return c
}

// ═══════════════════════════════════════════════════════════════════════════════
// AGENDA (eventos presenciais)
// ═══════════════════════════════════════════════════════════════════════════════

export interface AgendaEvent {
  id?: string
  title: string
  date: string        // 'YYYY-MM-DD'
  timeStart: string   // 'HH:MM'
  timeEnd?: string
  venue: string
  address: string
  city: string
  state: string
  description?: string
  imageUrl?: string
  mapUrl?: string
  instagramUrl?: string
  color: string       // neon accent color
  createdAt?: Timestamp
}

export async function getAgendaEvents(): Promise<AgendaEvent[]> {
  const q = query(collection(db, 'agenda'), orderBy('date', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AgendaEvent))
}

export async function upsertAgendaEvent(event: AgendaEvent): Promise<string> {
  const { id, ...rest } = event
  if (id) {
    await setDoc(doc(db, 'agenda', id), { ...rest, updatedAt: serverTimestamp() }, { merge: true })
    return id
  }
  const ref = await addDoc(collection(db, 'agenda'), { ...rest, createdAt: serverTimestamp() })
  return ref.id
}

export async function deleteAgendaEvent(id: string): Promise<void> {
  await deleteDoc(doc(db, 'agenda', id))
}

// ═══════════════════════════════════════════════════════════════════════════════
// NEWSLETTER
// ═══════════════════════════════════════════════════════════════════════════════

export async function saveNewsletter(email: string): Promise<void> {
  await setDoc(doc(db, 'newsletter', email), {
    email,
    subscribedAt: serverTimestamp(),
  }, { merge: true })
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURAÇÕES DO SITE (admin)
// ═══════════════════════════════════════════════════════════════════════════════

export interface SiteConfig {
  whatsappNumber: string   // ex: '5511999999999'
  whatsappMessage: string  // mensagem padrão do CTA
  storeName: string        // ex: 'Balu 3D'
  storeEmail: string
  instagramUrl: string
  freeShippingAbove: number // valor mínimo para frete grátis (0 = desativado)
  shippingCost: number      // valor fixo do frete (R$)
  pixDiscount: number       // % de desconto no pix (ex: 5)
  maintenanceMode: boolean
}

const DEFAULT_CONFIG: SiteConfig = {
  whatsappNumber: '5511999999999',
  whatsappMessage: 'Olá! Gostaria de fazer um pedido personalizado na Balu 3D.',
  storeName: 'Balu 3D',
  storeEmail: 'contato@balu3d.com.br',
  instagramUrl: 'https://instagram.com/balu3d',
  freeShippingAbove: 200,
  shippingCost: 15,
  pixDiscount: 5,
  maintenanceMode: false,
}

export async function getSiteConfig(): Promise<SiteConfig> {
  const snap = await getDoc(doc(db, 'admin', 'config'))
  if (!snap.exists()) return DEFAULT_CONFIG
  return { ...DEFAULT_CONFIG, ...snap.data() } as SiteConfig
}

export async function updateSiteConfig(config: Partial<SiteConfig>): Promise<void> {
  await setDoc(doc(db, 'admin', 'config'), {
    ...config,
    updatedAt: serverTimestamp(),
  }, { merge: true })
}
