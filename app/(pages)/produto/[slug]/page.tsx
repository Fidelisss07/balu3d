'use client'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getFirestoreProducts, getWishlist, toggleWishlist, getReviews, addReview, hasUserReviewed, subscribeRestock, type Review } from '@/lib/db'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  oldPrice?: number
  category: string
  img: string
  images?: string[]
  description?: string
  stock: number
  height?: string
  color: string
  badges?: string[]
  sizes?: string[]
  visible?: boolean
}

function calcularFrete(cep: string): { pac: number; sedex: number; prazoPac: string; prazoSedex: string } | null {
  const clean = cep.replace(/\D/g, '')
  if (clean.length !== 8) return null
  const prefix = parseInt(clean.substring(0, 2))
  if (prefix >= 1 && prefix <= 19) return { pac: 15.9, sedex: 29.9, prazoPac: '5-8 dias úteis', prazoSedex: '2-3 dias úteis' }
  if (prefix >= 20 && prefix <= 28) return { pac: 18.9, sedex: 34.9, prazoPac: '6-9 dias úteis', prazoSedex: '2-3 dias úteis' }
  if (prefix >= 29 && prefix <= 39) return { pac: 19.9, sedex: 36.9, prazoPac: '7-10 dias úteis', prazoSedex: '3-4 dias úteis' }
  if (prefix >= 40 && prefix <= 49) return { pac: 21.9, sedex: 39.9, prazoPac: '8-12 dias úteis', prazoSedex: '3-4 dias úteis' }
  if (prefix >= 50 && prefix <= 69) return { pac: 22.9, sedex: 42.9, prazoPac: '9-14 dias úteis', prazoSedex: '4-5 dias úteis' }
  if (prefix >= 70 && prefix <= 79) return { pac: 20.9, sedex: 38.9, prazoPac: '8-11 dias úteis', prazoSedex: '3-4 dias úteis' }
  return { pac: 24.9, sedex: 45.9, prazoPac: '10-15 dias úteis', prazoSedex: '5-6 dias úteis' }
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const { addItem } = useCart()
  const { user } = useAuth()
  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [notFoundFlag, setNotFoundFlag] = useState(false)

  const [qty, setQty] = useState(1)
  const [activeImg, setActiveImg] = useState(0)
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [cep, setCep] = useState('')
  const [cepFormatted, setCepFormatted] = useState('')
  const [frete, setFrete] = useState<ReturnType<typeof calcularFrete>>(null)
  const [freteLoading, setFreteLoading] = useState(false)
  const [freteError, setFreteError] = useState('')
  const [addedMsg, setAddedMsg] = useState(false)

  // Wishlist
  const [wishlisted, setWishlisted] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)

  // Reviews
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [alreadyReviewed, setAlreadyReviewed] = useState(false)
  const [newRating, setNewRating] = useState(5)
  const [newText, setNewText] = useState('')
  const [reviewSaving, setReviewSaving] = useState(false)
  const [reviewMsg, setReviewMsg] = useState('')

  // Restock
  const [restockEmail, setRestockEmail] = useState('')
  const [restockSaving, setRestockSaving] = useState(false)
  const [restockMsg, setRestockMsg] = useState('')

  useEffect(() => {
    async function loadProduct() {
      // 1. Busca no Firestore
      const fsData = await getFirestoreProducts()
      const fsAll = fsData as Product[]
      const fsFound = fsAll.find((p) => p.slug === params.slug && p.visible !== false)

      if (fsFound) {
        setProduct(fsFound)
        setRelated(fsAll.filter((p) => p.category === fsFound.category && p.slug !== fsFound.slug && p.visible !== false).slice(0, 4))
        setLoading(false)
        return
      }

      // 2. Fallback: busca no catalog.ts estático
      const { catalog } = await import('@/lib/catalog')
      const catFound = catalog.find((p) => p.slug === params.slug)

      if (catFound) {
        const adapted: Product = {
          id: catFound.slug,
          name: catFound.name,
          slug: catFound.slug,
          price: catFound.price,
          oldPrice: catFound.oldPrice,
          category: catFound.category,
          img: catFound.img,
          images: catFound.images || [catFound.img],
          description: catFound.description,
          stock: catFound.stock,
          height: catFound.height,
          color: catFound.color,
          badges: catFound.badges,
          sizes: undefined,
          visible: true,
        }
        setProduct(adapted)
        const catRelated: Product[] = catalog
          .filter((p) => p.category === catFound.category && p.slug !== catFound.slug)
          .slice(0, 4)
          .map((p) => ({
            id: p.slug,
            name: p.name,
            slug: p.slug,
            price: p.price,
            oldPrice: p.oldPrice,
            category: p.category,
            img: p.img,
            images: p.images || [p.img],
            description: p.description,
            stock: p.stock,
            height: p.height,
            color: p.color,
            badges: p.badges,
            visible: true,
          }))
        setRelated(catRelated)
      } else {
        setNotFoundFlag(true)
      }

      setLoading(false)
    }

    loadProduct()
  }, [params.slug])

  // Carrega wishlist e reviews após produto carregar
  useEffect(() => {
    if (!product) return
    // wishlist
    if (user) {
      getWishlist(user.uid).then((slugs) => setWishlisted(slugs.includes(product.slug)))
    }
    // reviews
    setReviewsLoading(true)
    getReviews(product.slug).then((data) => {
      setReviews(data)
      setReviewsLoading(false)
    })
    if (user) {
      hasUserReviewed(user.uid, product.slug).then(setAlreadyReviewed)
    }
    // pre-fill restock email
    if (user?.email) setRestockEmail(user.email)
  }, [product, user])

  async function handleToggleWishlist() {
    if (!user || !product) return
    setWishlistLoading(true)
    const added = await toggleWishlist(user.uid, product.slug)
    setWishlisted(added)
    setWishlistLoading(false)
  }

  async function handleSubmitReview() {
    if (!user || !product || !newText.trim()) return
    setReviewSaving(true)
    await addReview({
      productSlug: product.slug,
      userId: user.uid,
      userName: user.displayName ?? user.email ?? 'Anônimo',
      rating: newRating,
      text: newText.trim(),
    })
    setReviewMsg('Avaliação enviada! Obrigado.')
    setAlreadyReviewed(true)
    const updated = await getReviews(product.slug)
    setReviews(updated)
    setNewText('')
    setReviewSaving(false)
  }

  async function handleRestockSubscribe() {
    if (!product || !restockEmail.trim()) return
    setRestockSaving(true)
    await subscribeRestock(product.slug, restockEmail.trim())
    setRestockMsg('Ótimo! Você será avisado quando voltar.')
    setRestockSaving(false)
  }

  function handleCepChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 8)
    const formatted = raw.length > 5 ? `${raw.slice(0, 5)}-${raw.slice(5)}` : raw
    setCepFormatted(formatted)
    setCep(raw)
    setFrete(null)
    setFreteError('')
  }

  function handleCalcularFrete() {
    if (cep.length !== 8) { setFreteError('CEP inválido. Digite os 8 dígitos.'); return }
    setFreteLoading(true)
    setFreteError('')
    setTimeout(() => {
      const resultado = calcularFrete(cep)
      setFrete(resultado)
      if (!resultado) setFreteError('CEP não encontrado.')
      setFreteLoading(false)
    }, 800)
  }

  function handleAddToCart() {
    if (!product) return
    addItem({
      slug: product.slug,
      name: product.name,
      price: product.price,
      qty,
      img: product.img,
      color: product.color,
      material: 'Resina 8K · Impressão 3D',
      size: selectedSize || product.height || undefined,
      category: product.category,
    })
    setAddedMsg(true)
    setTimeout(() => setAddedMsg(false), 2000)
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

  if (notFoundFlag || !product) return notFound()

  const isLowStock = product.stock <= 3 && product.stock > 0
  const isOutOfStock = product.stock === 0

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] text-white">
      <Navbar />

      <main className="flex-1 pt-32 pb-24 bg-grid-dark">
        <div className="max-w-7xl mx-auto px-4 md:px-8">

          {/* Breadcrumb */}
          <nav className="mb-10 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
            <Link href="/" className="hover:text-white transition-colors">Início</Link>
            <Icon icon="lucide:chevron-right" />
            <Link href="/produtos" className="hover:text-white transition-colors">Produtos</Link>
            <Icon icon="lucide:chevron-right" />
            <span className="text-zinc-400">{product.category}</span>
            <Icon icon="lucide:chevron-right" />
            <span className="text-[#00f3ff]">{product.name}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 mb-24">
            {/* IMAGEM */}
            <div>
              {(() => {
                const imgs = product.images && product.images.length > 0 ? product.images : [product.img]
                return (
                  <>
                    <div className="aspect-square bg-zinc-900 rounded-[40px] border-2 border-white/5 overflow-hidden mb-4 relative shadow-2xl">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imgs[activeImg]}
                        alt={product.name}
                        className="w-full h-full object-cover transition-all duration-500"
                      />
                      {imgs.length > 1 && (
                        <>
                          <button
                            onClick={() => setActiveImg((p) => (p - 1 + imgs.length) % imgs.length)}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur flex items-center justify-center text-white hover:bg-black/80 transition-all cursor-pointer"
                          ><Icon icon="lucide:chevron-left" /></button>
                          <button
                            onClick={() => setActiveImg((p) => (p + 1) % imgs.length)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur flex items-center justify-center text-white hover:bg-black/80 transition-all cursor-pointer"
                          ><Icon icon="lucide:chevron-right" /></button>
                          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                            {imgs.map((_, i) => (
                              <button key={i} onClick={() => setActiveImg(i)} className={`w-2 h-2 rounded-full transition-all cursor-pointer ${i === activeImg ? 'bg-white scale-125' : 'bg-white/30'}`} />
                            ))}
                          </div>
                        </>
                      )}
                      <div className="absolute top-6 left-6 flex flex-col gap-3">
                        {(product.badges || []).slice(0, 2).map((badge, i) => (
                          <span key={badge} className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg ${i === 0 ? 'bg-[#00f3ff] text-black' : 'bg-[#ff00ff] text-white'}`}>
                            {badge}
                          </span>
                        ))}
                      </div>
                      {isLowStock && (
                        <div className="absolute bottom-6 right-6">
                          <span className="px-4 py-2 bg-red-500 text-white text-[10px] font-black uppercase rounded-full shadow-lg animate-pulse">
                            Últimas {product.stock} unidades!
                          </span>
                        </div>
                      )}
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="px-6 py-3 bg-zinc-800 text-zinc-400 text-sm font-black uppercase rounded-2xl">Esgotado</span>
                        </div>
                      )}
                    </div>
                    {/* Thumbnails */}
                    {imgs.length > 1 && (
                      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                        {imgs.map((src, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveImg(i)}
                            className={`flex-shrink-0 w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${i === activeImg ? 'border-[#00f3ff]' : 'border-white/10 hover:border-white/30'}`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={src} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )
              })()}
            </div>

            {/* INFO */}
            <div className="flex flex-col">
              <span className="inline-block px-4 py-1.5 bg-zinc-800 text-zinc-400 text-[10px] font-black uppercase tracking-widest rounded-full mb-4 w-fit">
                {product.category}
              </span>

              <h1 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase leading-none tracking-tighter mb-4 text-white">
                {product.name.split(' ').length > 1 ? (
                  <>
                    {product.name.split(' ')[0]}{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] to-[#ff00ff]">
                      {product.name.split(' ').slice(1).join(' ')}
                    </span>
                  </>
                ) : (
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] to-[#ff00ff]">{product.name}</span>
                )}
              </h1>

              <div className="flex items-baseline gap-3 mb-6">
                <p className="text-3xl font-black" style={{ color: product.color || '#00f3ff' }}>
                  R$ {product.price.toFixed(2).replace('.', ',')}
                </p>
                {product.oldPrice && (
                  <>
                    <p className="text-sm text-zinc-600 line-through">R$ {product.oldPrice.toFixed(2).replace('.', ',')}</p>
                    <span className="px-2 py-1 bg-[#00ff00] text-black text-[10px] font-black uppercase rounded-lg">
                      -{Math.round((1 - product.price / product.oldPrice) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>

              {product.description && (
                <p className="text-zinc-400 font-bold leading-relaxed mb-8">{product.description}</p>
              )}

              {product.height && (
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6">
                  <Icon icon="lucide:ruler" className="text-[#00f3ff]" />
                  Altura: {product.height} · Impressão 3D em resina
                </div>
              )}

              {/* Tamanhos */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 mb-3">
                    Tamanho <span className="text-[#00f3ff]">{selectedSize ? `— ${selectedSize}` : '— selecione'}</span>
                  </h4>
                  <div className="flex gap-2 flex-wrap">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s === selectedSize ? '' : s)}
                        className={`px-5 py-2.5 rounded-2xl text-sm font-black uppercase transition-all cursor-pointer border-2 ${
                          selectedSize === s
                            ? 'border-[#00f3ff] bg-[#00f3ff]/10 text-[#00f3ff]'
                            : 'border-white/10 bg-zinc-900 text-zinc-400 hover:border-white/30 hover:text-white'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantidade */}
              {!isOutOfStock && (
                <div className="mb-6">
                  <h4 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 mb-4">Quantidade</h4>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center bg-zinc-900 border-2 border-white/5 rounded-2xl p-1">
                      <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-12 h-12 flex items-center justify-center hover:bg-white/5 rounded-xl text-white transition-colors cursor-pointer">
                        <Icon icon="lucide:minus" />
                      </button>
                      <span className="w-16 text-center font-black text-lg">{qty}</span>
                      <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="w-12 h-12 flex items-center justify-center hover:bg-white/5 rounded-xl text-white transition-colors cursor-pointer">
                        <Icon icon="lucide:plus" />
                      </button>
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-widest ${isLowStock ? 'text-red-400' : 'text-zinc-600'}`}>
                      {isLowStock ? `⚠ Apenas ${product.stock} em estoque` : `Estoque: ${product.stock} unidades`}
                    </span>
                  </div>
                </div>
              )}

              {/* Total */}
              {!isOutOfStock && (
                <div className="mb-6 p-4 bg-zinc-900/50 rounded-2xl border border-white/5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Total ({qty}x)</span>
                    <span className="text-2xl font-black" style={{ color: product.color || '#00f3ff' }}>
                      R$ {(product.price * qty).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              )}

              {/* Botões */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="flex-1 bg-[#00f3ff] text-black py-4 px-6 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-sm hover:scale-[1.02] transition-all shadow-[0_0_30px_rgba(0,243,255,0.3)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Icon icon={addedMsg ? 'lucide:check' : 'lucide:shopping-bag'} className="text-xl" />
                  {addedMsg ? 'Adicionado!' : isOutOfStock ? 'Esgotado' : 'Adicionar ao Carrinho'}
                </button>
                {user && (
                  <button
                    onClick={handleToggleWishlist}
                    disabled={wishlistLoading}
                    title={wishlisted ? 'Remover da Wishlist' : 'Adicionar à Wishlist'}
                    className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center border-2 transition-all cursor-pointer disabled:opacity-50 self-center ${
                      wishlisted
                        ? 'border-[#ff00ff] bg-[#ff00ff]/10 text-[#ff00ff]'
                        : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-[#ff00ff] hover:text-[#ff00ff]'
                    }`}
                  >
                    {wishlistLoading
                      ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      : <Icon icon={wishlisted ? 'mdi:heart' : 'mdi:heart-outline'} className="text-xl" />
                    }
                  </button>
                )}
              </div>

              {/* Restock — só mostra quando esgotado */}
              {isOutOfStock && (
                <div className="mb-6 p-5 bg-zinc-900/50 border border-white/10 rounded-3xl">
                  <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-2">
                    <Icon icon="lucide:bell" className="text-[#ff00ff]" /> Avise-me quando voltar
                  </p>
                  {restockMsg ? (
                    <p className="text-sm font-black text-[#00ff00]">{restockMsg}</p>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="email"
                        placeholder="seu@email.com"
                        value={restockEmail}
                        onChange={(e) => setRestockEmail(e.target.value)}
                        className="flex-1 bg-zinc-800 border border-white/10 text-white px-4 py-3 rounded-2xl text-sm font-bold placeholder:text-zinc-600 focus:outline-none focus:border-[#ff00ff]"
                      />
                      <button
                        onClick={handleRestockSubscribe}
                        disabled={restockSaving || !restockEmail.trim()}
                        className="px-5 py-3 bg-[#ff00ff] text-black font-black uppercase text-xs rounded-2xl hover:scale-105 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {restockSaving ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : 'OK'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Cálculo de frete */}
              <div className="border-2 border-white/5 rounded-3xl p-6 mb-8 bg-zinc-900/30">
                <h4 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400 mb-4 flex items-center gap-2">
                  <Icon icon="lucide:truck" className="text-[#00ff00]" /> Calcular Frete
                </h4>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="00000-000"
                    value={cepFormatted}
                    onChange={handleCepChange}
                    onKeyDown={(e) => e.key === 'Enter' && handleCalcularFrete()}
                    maxLength={9}
                    className="flex-1 bg-zinc-900 border border-white/10 text-white px-4 py-3 rounded-2xl text-sm font-bold placeholder:text-zinc-600 focus:outline-none focus:border-[#00f3ff] transition-colors"
                  />
                  <button
                    onClick={handleCalcularFrete}
                    disabled={freteLoading || cep.length !== 8}
                    className="px-6 py-3 bg-[#00f3ff] text-black font-black uppercase text-xs rounded-2xl hover:scale-105 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {freteLoading ? <Icon icon="lucide:loader-2" className="animate-spin text-lg" /> : 'OK'}
                  </button>
                </div>
                {freteError && <p className="text-red-400 text-xs font-bold mt-3 flex items-center gap-2"><Icon icon="lucide:alert-circle" /> {freteError}</p>}
                {frete && (
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="bg-zinc-900 rounded-2xl p-4 border border-white/5">
                      <div className="flex items-center gap-2 mb-1"><Icon icon="lucide:package" className="text-[#00ff00] text-sm" /><span className="text-[10px] font-black uppercase text-zinc-400">PAC</span></div>
                      <p className="text-lg font-black text-white">R$ {frete.pac.toFixed(2).replace('.', ',')}</p>
                      <p className="text-[10px] text-zinc-500">{frete.prazoPac}</p>
                    </div>
                    <div className="bg-zinc-900 rounded-2xl p-4 border border-[#00f3ff]/20">
                      <div className="flex items-center gap-2 mb-1"><Icon icon="lucide:zap" className="text-[#00f3ff] text-sm" /><span className="text-[10px] font-black uppercase text-zinc-400">SEDEX</span></div>
                      <p className="text-lg font-black text-[#00f3ff]">R$ {frete.sedex.toFixed(2).replace('.', ',')}</p>
                      <p className="text-[10px] text-zinc-500">{frete.prazoSedex}</p>
                    </div>
                  </div>
                )}
                <a href="https://buscacepinter.correios.com.br" target="_blank" rel="noopener noreferrer" className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors mt-3 inline-block">
                  Não sei meu CEP →
                </a>
              </div>

              {/* Garantias */}
              <div className="grid grid-cols-2 gap-4 border-t-2 border-white/5 pt-6">
                <div className="flex items-start gap-3">
                  <Icon icon="lucide:shield-check" className="text-2xl text-[#00f3ff] mt-0.5 shrink-0" />
                  <div><p className="text-sm font-black uppercase tracking-tighter">Garantia Balu</p><p className="text-xs text-zinc-500">Qualidade garantida ou devolvemos</p></div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon icon="lucide:package-check" className="text-2xl text-[#00ff00] mt-0.5 shrink-0" />
                  <div><p className="text-sm font-black uppercase tracking-tighter">Embalagem Segura</p><p className="text-xs text-zinc-500">Caixa reforçada anti-impacto</p></div>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="border-t-2 border-white/5 pt-20 mb-24">
            <div className="flex items-end justify-between mb-12">
              <h2 className="text-4xl font-black uppercase tracking-tighter flex items-center gap-4">
                <div className="w-2 h-10 bg-[#ff00ff]" /> Avaliações
                {reviews.length > 0 && (
                  <span className="text-lg text-zinc-500 font-bold normal-case tracking-normal">
                    ({reviews.length})
                    {' · '}
                    <span className="text-[#00ff00]">{(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)}</span>
                    <Icon icon="mdi:star" className="inline text-[#00ff00] ml-1 text-base" />
                  </span>
                )}
              </h2>
            </div>

            {/* Formulário de avaliação */}
            {user && !alreadyReviewed && !isOutOfStock && (
              <div className="bg-zinc-900/50 rounded-[30px] p-8 border border-white/10 mb-8">
                <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">Deixar Avaliação</p>
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map((star) => (
                    <button key={star} onClick={() => setNewRating(star)} className="cursor-pointer transition-transform hover:scale-125">
                      <Icon icon={star <= newRating ? 'mdi:star' : 'mdi:star-outline'} className="text-2xl text-[#00ff00]" />
                    </button>
                  ))}
                </div>
                <textarea
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="Conte sua experiência com o produto..."
                  rows={3}
                  className="w-full bg-zinc-800 border border-white/10 text-white px-4 py-3 rounded-2xl text-sm font-bold placeholder:text-zinc-600 focus:outline-none focus:border-[#ff00ff] resize-none mb-3"
                />
                {reviewMsg && <p className="text-xs font-black text-[#00ff00] mb-3">{reviewMsg}</p>}
                <button
                  onClick={handleSubmitReview}
                  disabled={reviewSaving || !newText.trim()}
                  className="px-6 py-3 bg-[#ff00ff] text-black font-black uppercase text-xs rounded-2xl hover:scale-105 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {reviewSaving ? 'Enviando...' : 'Enviar Avaliação'}
                </button>
              </div>
            )}
            {user && alreadyReviewed && (
              <div className="flex items-center gap-3 mb-6 text-xs font-black text-zinc-500 uppercase tracking-widest">
                <Icon icon="lucide:check-circle" className="text-[#00ff00]" /> Você já avaliou este produto.
              </div>
            )}
            {!user && (
              <div className="mb-6 text-xs font-bold text-zinc-500">
                <Link href="/login" className="text-[#00f3ff] hover:underline">Entre</Link> para deixar uma avaliação.
              </div>
            )}

            {reviewsLoading ? (
              <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-[#ff00ff] border-t-transparent rounded-full animate-spin" /></div>
            ) : reviews.length === 0 ? (
              <p className="text-zinc-600 font-bold text-sm text-center py-12">Nenhuma avaliação ainda. Seja o primeiro!</p>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                {reviews.map((r) => (
                  <div key={r.id} className="bg-zinc-900/50 rounded-[30px] p-5 md:p-8 border border-white/5">
                    <div className="flex text-[#00ff00] text-sm mb-3">
                      {[1,2,3,4,5].map((s) => (
                        <Icon key={s} icon={s <= r.rating ? 'mdi:star' : 'mdi:star-outline'} />
                      ))}
                    </div>
                    <p className="text-sm font-black text-white mb-1">{r.userName}</p>
                    {r.createdAt && (
                      <p className="text-[10px] text-zinc-600 mb-2">
                        {new Date((r.createdAt as { seconds: number }).seconds * 1000).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                    <p className="text-xs text-zinc-400 leading-relaxed">{r.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Produtos relacionados */}
          {related.length > 0 && (
            <div className="border-t-2 border-white/5 pt-20">
              <h2 className="text-4xl font-black uppercase tracking-tighter mb-12 flex items-center gap-4">
                <div className="w-2 h-10 bg-[#00f3ff]" /> Você também vai gostar
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {related.map((item) => (
                  <Link key={item.id} href={`/produto/${item.slug}`}>
                    <div className="group bg-zinc-900/40 p-4 rounded-[30px] border border-transparent hover:border-white/20 transition-all cursor-pointer">
                      <div className="aspect-square bg-zinc-900 rounded-[20px] overflow-hidden mb-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.img} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      </div>
                      <h4 className="font-black text-sm uppercase tracking-tighter mb-1">{item.name}</h4>
                      <p className="font-black text-lg" style={{ color: item.color || '#00f3ff' }}>
                        R$ {item.price.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
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
