'use client'

import Link from 'next/link'
import { useState, useMemo, useEffect } from 'react'
import { Icon } from '@iconify/react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getFirestoreProducts } from '@/lib/db'

const WA_URL = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP ?? '5511999999999'}`

interface Product {
  id: string
  name: string
  slug: string
  price: number
  oldPrice?: number
  category: string
  img: string
  description?: string
  stock: number
  color: string
  badges?: string[]
  visible?: boolean
}

export default function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [sortBy, setSortBy] = useState('name')
  const [search, setSearch] = useState('')

  useEffect(() => {
    getFirestoreProducts().then((data) => {
      // Só mostra produtos visíveis (ou sem campo visible definido)
      const visible = (data as Product[]).filter((p) => p.visible !== false)
      setProducts(visible)
      setLoading(false)
    })
  }, [])

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category))).filter(Boolean)
    return ['Todos', ...cats]
  }, [products])

  const filtered = useMemo(() => {
    return products
      .filter((item) => {
        const matchCat = activeCategory === 'Todos' || item.category === activeCategory
        const matchSearch = item.name.toLowerCase().includes(search.toLowerCase())
        return matchCat && matchSearch
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price
        if (sortBy === 'price-desc') return b.price - a.price
        return a.name.localeCompare(b.name)
      })
  }, [products, activeCategory, sortBy, search])

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
      <Navbar />

      <main className="flex-1 pt-20">
        {/* HEADER */}
        <section className="bg-[#1a1a1a] bg-grid-dark py-16 md:py-24 px-4 md:px-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00f3ff]/10 via-transparent to-[#ff00ff]/10 pointer-events-none" />
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <nav className="flex items-center gap-2 text-xs text-zinc-500 font-bold uppercase mb-4">
                  <Link href="/" className="hover:text-white transition-colors">Home</Link>
                  <Icon icon="lucide:chevron-right" className="text-xs" />
                  <span className="text-[#00f3ff]">Produtos</span>
                </nav>
                <h1 className="text-3xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter text-white leading-none">
                  Catálogo <span className="text-[#00f3ff]">3D</span>
                </h1>
                <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-xs mt-4">
                  {loading ? 'Carregando...' : `${filtered.length} produto${filtered.length !== 1 ? 's' : ''} disponíve${filtered.length !== 1 ? 'is' : 'l'} · Impressão 3D`}
                </p>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2 self-start md:self-auto">
                <span className="text-xs text-zinc-500 font-bold uppercase">Ordenar:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-zinc-900 border border-white/10 text-white text-xs font-bold uppercase px-4 py-2 rounded-xl focus:outline-none focus:border-[#00f3ff] cursor-pointer"
                >
                  <option value="name">Nome A-Z</option>
                  <option value="price-asc">Menor Preço</option>
                  <option value="price-desc">Maior Preço</option>
                </select>
              </div>
            </div>

            {/* Search + Category Filter */}
            <div className="mt-8 flex flex-col gap-4">
              <div className="relative max-w-md">
                <Icon icon="lucide:search" className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-lg pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar produto..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 text-white pl-11 pr-4 py-3 rounded-2xl text-sm font-bold placeholder:text-zinc-600 focus:outline-none focus:border-[#00f3ff] transition-colors"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors cursor-pointer">
                    <Icon icon="lucide:x" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                      activeCategory === cat
                        ? 'bg-[#00f3ff] text-black shadow-[0_0_15px_rgba(0,243,255,0.4)]'
                        : 'bg-zinc-900 text-white/60 border border-white/10 hover:border-[#00f3ff] hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* PRODUCT GRID */}
        <section className="py-12 md:py-20 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="flex justify-center py-32">
                <div className="w-10 h-10 border-2 border-[#00f3ff] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-24">
                <Icon icon="lucide:search-x" className="text-6xl text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-500 font-black uppercase tracking-widest">
                  {products.length === 0 ? 'Nenhum produto cadastrado ainda.' : `Nenhum produto encontrado para "${search}"`}
                </p>
                {(search || activeCategory !== 'Todos') && (
                  <button
                    onClick={() => { setSearch(''); setActiveCategory('Todos') }}
                    className="mt-6 px-6 py-3 border border-white/10 rounded-2xl text-xs font-black uppercase hover:border-[#00f3ff] hover:text-[#00f3ff] transition-all cursor-pointer"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                {filtered.map((item) => (
                  <Link
                    key={item.id}
                    href={`/produto/${item.slug}`}
                    className="group cursor-pointer bg-zinc-900/40 p-4 md:p-6 rounded-[30px] md:rounded-[40px] border border-transparent transition-all hover:shadow-lg block"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = item.color || '#00f3ff'
                      e.currentTarget.style.boxShadow = `0 0 20px ${item.color || '#00f3ff'}22`
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'transparent'
                      e.currentTarget.style.boxShadow = ''
                    }}
                  >
                    <div className="aspect-square bg-zinc-900 rounded-[20px] md:rounded-[30px] overflow-hidden relative mb-4 md:mb-6">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.img}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 brightness-95"
                      />
                      <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
                        <span className="px-2 py-1 bg-black/60 text-white text-[9px] font-black uppercase rounded-lg backdrop-blur-sm border border-white/10">
                          {item.category}
                        </span>
                        {item.stock <= 3 && item.stock > 0 && (
                          <span className="px-2 py-1 bg-red-500/80 text-white text-[9px] font-black uppercase rounded-lg backdrop-blur-sm">
                            Últimas {item.stock}!
                          </span>
                        )}
                        {item.stock === 0 && (
                          <span className="px-2 py-1 bg-zinc-800 text-zinc-400 text-[9px] font-black uppercase rounded-lg backdrop-blur-sm">
                            Esgotado
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="font-black text-base md:text-xl mb-1 uppercase tracking-tighter text-white">{item.name}</h3>

                    <div className="flex items-baseline gap-2 mb-3 md:mb-5">
                      <p className="font-black text-lg md:text-2xl" style={{ color: item.color || '#00f3ff' }}>
                        R$ {item.price.toFixed(2).replace('.', ',')}
                      </p>
                      {item.oldPrice && (
                        <p className="text-xs text-zinc-600 line-through">
                          R$ {item.oldPrice.toFixed(2).replace('.', ',')}
                        </p>
                      )}
                    </div>

                    {item.description && (
                      <p className="text-[11px] text-zinc-500 mb-3 leading-relaxed hidden md:block line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-zinc-500 group-hover:text-white transition-colors">
                        Ver detalhes →
                      </span>
                      <Icon icon="lucide:arrow-right" className="text-zinc-600 group-hover:text-white group-hover:translate-x-1 transition-all text-sm" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24 px-4 md:px-8 bg-black">
          <div className="max-w-4xl mx-auto text-center bg-zinc-900 rounded-[50px] p-10 md:p-16 border border-[#00f3ff]/10">
            <span className="inline-block px-4 py-2 bg-[#00f3ff] text-black text-[10px] font-black uppercase tracking-widest mb-6 rounded-full">
              ENCOMENDA ESPECIAL
            </span>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-white">
              Não encontrou<br />o que procura?
            </h2>
            <p className="text-zinc-500 font-bold mb-8 max-w-lg mx-auto">
              Fazemos encomendas personalizadas via WhatsApp. Qualquer figura, qualquer escala.
            </p>
            <a
              href={WA_URL}
              className="inline-flex items-center gap-3 bg-[#25D366] text-white px-8 py-4 rounded-2xl font-black uppercase hover:scale-105 hover:shadow-[0_0_30px_rgba(37,211,102,0.5)] transition-all"
            >
              <Icon icon="logos:whatsapp-icon" className="text-2xl" />
              Pedir pelo WhatsApp
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
