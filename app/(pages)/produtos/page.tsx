'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Icon } from '@iconify/react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const catalog = [
  { name: 'Pikachu', price: '45,00', color: '#00f3ff', category: 'Classic', img: 'https://images.unsplash.com/photo-1613771404721-1f92d799e49f?q=80&w=400' },
  { name: 'Gyarados', price: '120,00', color: '#ff00ff', category: 'Legendary', img: 'https://images.unsplash.com/photo-1559124568-d5a0f7da1ec5?q=80&w=400' },
  { name: 'Alakazam', price: '85,00', color: '#00ff00', category: 'Classic', img: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=400' },
  { name: 'Gengar', price: '65,00', color: '#00f3ff', category: 'Classic', img: 'https://images.unsplash.com/photo-1594736223565-3544c039a36d?q=80&w=400' },
  { name: 'Machamp', price: '95,00', color: '#ff00ff', category: 'Classic', img: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?q=80&w=400' },
  { name: 'Blastoise', price: '110,00', color: '#00ff00', category: 'Classic', img: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaad5b?q=80&w=400' },
  { name: 'Venusaur', price: '110,00', color: '#00f3ff', category: 'Classic', img: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=400' },
  { name: 'Lapras', price: '90,00', color: '#ff00ff', category: 'Shiny', img: 'https://images.unsplash.com/photo-1544273677-c433136021d4?q=80&w=400' },
  { name: 'Arcanine', price: '75,00', color: '#00ff00', category: 'Classic', img: 'https://images.unsplash.com/photo-1606103836293-0a063ee20566?q=80&w=400' },
  { name: 'Dragonite', price: '120,00', color: '#00f3ff', category: 'Legendary', img: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?q=80&w=400' },
  { name: 'Mewtwo', price: '150,00', color: '#ff00ff', category: 'Legendary', img: 'https://images.unsplash.com/photo-1589254065878-42c9da997008?q=80&w=400' },
  { name: 'Articuno', price: '140,00', color: '#00ff00', category: 'Legendary', img: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=400' },
  { name: 'Charizard', price: '180,00', color: '#00f3ff', category: 'Limited', img: 'https://images.unsplash.com/photo-1613771404721-1f92d799e49f?q=80&w=400' },
  { name: 'Mew', price: '200,00', color: '#ff00ff', category: 'Shiny', img: 'https://images.unsplash.com/photo-1559124568-d5a0f7da1ec5?q=80&w=400' },
  { name: 'Eevee', price: '55,00', color: '#00ff00', category: 'Classic', img: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?q=80&w=400' },
  { name: 'Snorlax', price: '130,00', color: '#00f3ff', category: 'Shiny', img: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=400' },
]

const categories = ['Todos', 'Classic', 'Legendary', 'Shiny', 'Limited']

export default function ProdutosPage() {
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [sortBy, setSortBy] = useState('name')

  const filtered = catalog
    .filter((item) => activeCategory === 'Todos' || item.category === activeCategory)
    .sort((a, b) => {
      if (sortBy === 'price-asc') return parseFloat(a.price.replace(',', '.')) - parseFloat(b.price.replace(',', '.'))
      if (sortBy === 'price-desc') return parseFloat(b.price.replace(',', '.')) - parseFloat(a.price.replace(',', '.'))
      return a.name.localeCompare(b.name)
    })

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
      <Navbar cartCount={2} />

      <main className="flex-1 pt-20">
        {/* HEADER */}
        <section className="bg-[#1a1a1a] bg-grid-dark py-16 md:py-24 px-4 md:px-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00f3ff]/10 via-transparent to-[#ff00ff]/10 pointer-events-none"></div>
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <nav className="flex items-center gap-2 text-xs text-zinc-500 font-bold uppercase mb-4">
                  <Link href="/" className="hover:text-white transition-colors">Home</Link>
                  <Icon icon="lucide:chevron-right" className="text-xs" />
                  <span className="text-[#00f3ff]">Produtos</span>
                </nav>
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tighter text-white leading-none">
                  Catálogo <span className="text-[#00f3ff]">Pokémon</span>
                </h1>
                <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-xs mt-4">
                  {filtered.length} figuras disponíveis · Resina 8K
                </p>
              </div>
              {/* Sort */}
              <div className="flex items-center gap-2">
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

            {/* Category Filter */}
            <div className="flex flex-wrap gap-3 mt-8">
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
        </section>

        {/* PRODUCT GRID */}
        <section className="py-12 md:py-20 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
              {filtered.map((item) => (
                <div
                  key={item.name}
                  className="group cursor-pointer bg-zinc-900/40 p-4 md:p-6 rounded-[30px] md:rounded-[40px] border border-transparent transition-all hover:shadow-lg"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = item.color
                    e.currentTarget.style.boxShadow = `0 0 20px ${item.color}22`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'transparent'
                    e.currentTarget.style.boxShadow = ''
                  }}
                >
                  <div className="aspect-square bg-zinc-900 rounded-[20px] md:rounded-[30px] overflow-hidden relative mb-4 md:mb-6">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.img} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 brightness-95" />
                    <span className="absolute top-3 right-3 px-2 py-1 bg-black/60 text-white text-[9px] font-black uppercase rounded-lg backdrop-blur-sm border border-white/10">
                      {item.category}
                    </span>
                  </div>
                  <h3 className="font-black text-base md:text-xl mb-1 uppercase tracking-tighter text-white">{item.name}</h3>
                  <p className="font-black text-lg md:text-2xl mb-3 md:mb-5" style={{ color: item.color }}>R$ {item.price}</p>
                  <div className="flex gap-2">
                    <Link href={`/produto/${item.name.toLowerCase()}`} className="flex-1">
                      <button className="w-full py-2 md:py-3 bg-transparent text-white text-[10px] font-black uppercase rounded-xl border border-white/10 hover:border-white hover:bg-white/5 transition-all cursor-pointer">
                        Ver
                      </button>
                    </Link>
                    <Link href="/carrinho" className="flex-1">
                      <button className="w-full py-2 md:py-3 bg-zinc-800 text-white text-[10px] font-black uppercase rounded-xl border border-white/10 hover:bg-white hover:text-black transition-all cursor-pointer">
                        Comprar
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CUSTOM ORDER CTA */}
        <section className="py-16 md:py-24 px-4 md:px-8 bg-black">
          <div className="max-w-4xl mx-auto text-center bg-zinc-900 rounded-[50px] p-10 md:p-16 border border-[#00f3ff]/10">
            <span className="inline-block px-4 py-2 bg-[#00f3ff] text-black text-[10px] font-black uppercase tracking-widest mb-6 rounded-full">ENCOMENDA ESPECIAL</span>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-white">Não encontrou<br />o seu <span className="text-[#00f3ff]">Pokémon?</span></h2>
            <p className="text-zinc-500 font-bold mb-8 max-w-lg mx-auto">Fazemos encomendas personalizadas via WhatsApp. Qualquer Pokémon, qualquer escala, qualquer variante Shiny.</p>
            <a
              href="https://wa.me/550000000000"
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
