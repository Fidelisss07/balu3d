'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const pokeCatalog = [
  { name: 'Pikachu', price: '45,00', color: '#00f3ff', img: 'https://images.unsplash.com/photo-1613771404721-1f92d799e49f?q=80&w=400' },
  { name: 'Gyarados', price: '120,00', color: '#ff00ff', img: 'https://images.unsplash.com/photo-1559124568-d5a0f7da1ec5?q=80&w=400' },
  { name: 'Alakazam', price: '85,00', color: '#00ff00', img: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=400' },
  { name: 'Gengar', price: '65,00', color: '#00f3ff', img: 'https://images.unsplash.com/photo-1594736223565-3544c039a36d?q=80&w=400' },
  { name: 'Machamp', price: '95,00', color: '#ff00ff', img: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?q=80&w=400' },
  { name: 'Blastoise', price: '110,00', color: '#00ff00', img: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaad5b?q=80&w=400' },
  { name: 'Venusaur', price: '110,00', color: '#00f3ff', img: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=400' },
  { name: 'Lapras', price: '90,00', color: '#ff00ff', img: 'https://images.unsplash.com/photo-1544273677-c433136021d4?q=80&w=400' },
  { name: 'Arcanine', price: '75,00', color: '#00ff00', img: 'https://images.unsplash.com/photo-1606103836293-0a063ee20566?q=80&w=400' },
  { name: 'Dragonite', price: '120,00', color: '#00f3ff', img: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?q=80&w=400' },
  { name: 'Mewtwo', price: '150,00', color: '#ff00ff', img: 'https://images.unsplash.com/photo-1589254065878-42c9da997008?q=80&w=400' },
  { name: 'Articuno', price: '140,00', color: '#00ff00', img: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=400' },
]

const faqs = [
  { q: 'Qual a resolução das figuras?', a: 'Todas as nossas figuras são impressas em resina 8K de ultra alta definição, garantindo superfícies lisas e detalhes microscópicos preservados.' },
  { q: 'Quais materiais são utilizados?', a: 'Utilizamos resina fotopolimerizável Tough V4 para durabilidade e filamentos Silk Premium para bases e acessórios maiores.' },
  { q: 'Posso pedir um Pokémon customizado?', a: 'Sim! Aceitamos encomendas via WhatsApp para modelos específicos, escalas customizadas ou variantes Shiny.' },
  { q: 'Qual o tempo de entrega?', a: 'O prazo de produção é de 3 a 5 dias úteis. O tempo de transporte varia entre 2 a 7 dias dependendo da sua localização.' },
]

const slides = [
  {
    badge: 'PREMIUM EDITION',
    badgeColor: '#00f3ff',
    badgeBg: '#00f3ff',
    badgeText: 'text-black',
    title: 'CHARIZARD',
    subtitle: 'UNBOUND',
    subtitleGradient: 'from-[#00f3ff] to-[#ff00ff]',
    desc: 'Resina 8K com detalhes pintados à mão. A fúria do tipo fogo em cada camada impressa.',
    bgGradient: 'from-[#00f3ff]/30 via-transparent to-transparent',
    bgGradientDir: 'bg-gradient-to-br',
    ctaText: 'COLETAR AGORA',
    ctaColor: 'text-[#00f3ff] border-[#00f3ff] hover:bg-[#00f3ff] hover:text-black',
    ctaIcon: 'lucide:arrow-right',
    img: 'https://images.unsplash.com/photo-1613771404721-1f92d799e49f?q=80&w=800',
    imgAlt: 'Charizard Figurine',
    imgBorder: 'border-white/5 hover:border-[#00f3ff]',
    bg: 'bg-[#1a1a1a] bg-grid-dark',
    tags: ['8K RESOLUTION', 'HAND-PAINTED', 'LIMITED EDITION'],
  },
  {
    badge: 'ULTIMATE COLLECTION',
    badgeColor: '#ff00ff',
    badgeBg: '#ff00ff',
    badgeText: 'text-white',
    title: 'DRAGONITE',
    subtitle: 'ULTRA',
    subtitleGradient: 'from-[#ff00ff] to-[#00f3ff]',
    desc: 'O guardião dos mares em detalhes impressionantes. Inclui case de colecionador exclusivo.',
    bgGradient: 'from-[#ff00ff]/30 via-transparent to-transparent',
    bgGradientDir: 'bg-gradient-to-tl',
    ctaText: 'VER DETALHES',
    ctaColor: 'text-[#ff00ff] border-[#ff00ff] hover:bg-[#ff00ff] hover:text-white',
    ctaIcon: 'lucide:zap',
    img: 'https://images.unsplash.com/photo-1559124568-d5a0f7da1ec5?q=80&w=800',
    imgAlt: 'Dragonite Figure',
    imgBorder: 'border-[#ff00ff]/30 hover:border-[#ff00ff]',
    bg: 'bg-black',
    tags: ['ULTRA DETAIL', 'COLLECTOR CASE', 'RARE DROP'],
  },
  {
    badge: 'LEGENDARY FIGURE',
    badgeColor: '#00ff00',
    badgeBg: '#00ff00',
    badgeText: 'text-black',
    title: 'MEWTWO',
    subtitle: 'ORIGIN',
    subtitleGradient: 'from-[#00ff00] to-white',
    desc: "Acabamento 'Psionic Glow' com base numerada. O ápice da engenharia genética Pokémon.",
    bgGradient: 'from-[#00ff00]/20 via-transparent to-transparent',
    bgGradientDir: 'bg-gradient-to-tr',
    ctaText: 'VER COLEÇÃO',
    ctaColor: 'text-[#00ff00] border-[#00ff00] hover:bg-[#00ff00] hover:text-black',
    ctaIcon: 'lucide:box',
    img: 'https://images.unsplash.com/photo-1594736223565-3544c039a36d?q=80&w=800',
    imgAlt: 'Mewtwo Figure',
    imgBorder: 'border-white/5 hover:border-[#00ff00]',
    bg: 'bg-[#1a1a1a]',
    tags: ['PSIONIC GLOW', 'NUMBERED BASE', 'LEGENDARY'],
  },
]

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-20">
        {/* HERO CAROUSEL */}
        <section className="relative w-full overflow-hidden" style={{ height: 'calc(100svh - 80px)', minHeight: '580px', maxHeight: '900px' }}>
          {/* Slides wrapper */}
          <div
            className="flex h-full transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {slides.map((slide, idx) => (
              <div
                key={idx}
                className={`w-full h-full flex items-center shrink-0 px-5 md:px-8 relative ${slide.bg}`}
                style={{ minWidth: '100%' }}
              >
                <div className={`absolute inset-0 ${slide.bgGradientDir} ${slide.bgGradient} pointer-events-none`}></div>
                <div className="max-w-7xl w-full mx-auto grid md:grid-cols-2 items-center gap-6 md:gap-12 relative z-10">
                  <div className="flex flex-col justify-center">
                    <span
                      className="inline-block self-start px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] mb-4 md:mb-6 rounded-sm"
                      style={{ backgroundColor: slide.badgeBg, boxShadow: `0 0 20px ${slide.badgeColor}99`, color: slide.badgeText === 'text-black' ? '#000' : '#fff' }}
                    >{slide.badge}</span>
                    <h1 className="text-[clamp(3rem,12vw,9rem)] font-black mb-3 md:mb-8 leading-[0.85] tracking-tighter text-white">
                      {slide.title}<br />
                      <span className={`text-transparent bg-clip-text bg-gradient-to-r ${slide.subtitleGradient}`}>{slide.subtitle}</span>
                    </h1>
                    <p className="text-sm md:text-xl text-zinc-300 mb-5 md:mb-10 max-w-lg leading-relaxed line-clamp-2 md:line-clamp-none">{slide.desc}</p>
                    <div className="hidden sm:flex flex-wrap gap-3 md:gap-4 mb-5 md:mb-10">
                      {slide.tags.map((tag) => (
                        <span key={tag} className="px-3 md:px-4 py-2 bg-zinc-800 rounded-lg text-xs font-bold border border-white/10">{tag}</span>
                      ))}
                    </div>
                    <Link
                      href="/produtos"
                      className={`self-start inline-flex items-center gap-3 md:gap-6 bg-zinc-900 border-2 px-6 md:px-12 py-3.5 md:py-6 rounded-2xl font-black uppercase text-sm md:text-lg tracking-widest transition-all hover:scale-105 shadow-[0_0_30px_rgba(0,243,255,0.3)] ${slide.ctaColor}`}
                    >
                      {slide.ctaText} <Icon icon={slide.ctaIcon} />
                    </Link>
                  </div>
                  <div className="hidden md:flex justify-center">
                    <div className={`relative w-full aspect-square max-w-xl bg-zinc-900 rounded-[80px] shadow-2xl overflow-hidden group border-4 transition-all duration-700 ${slide.imgBorder}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={slide.img} alt={slide.imgAlt} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 brightness-110 saturate-[1.3]" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${currentSlide === idx ? 'w-8 bg-[#00f3ff]' : 'w-2 bg-white/30'}`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Arrow controls */}
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/40 border border-white/10 rounded-full text-white hover:bg-white/10 transition-all cursor-pointer"
            aria-label="Slide anterior"
          >
            <Icon icon="lucide:chevron-left" className="text-2xl" />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/40 border border-white/10 rounded-full text-white hover:bg-white/10 transition-all cursor-pointer"
            aria-label="Próximo slide"
          >
            <Icon icon="lucide:chevron-right" className="text-2xl" />
          </button>
        </section>

        {/* POKEMON COLLECTIONS */}
        <section className="py-16 md:py-32 bg-black overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 md:px-8 mb-8 md:mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter">Suas <span className="text-[#ff00ff]">Guildas</span> Pokémon</h2>
          </div>
          <div className="flex gap-6 md:gap-8 overflow-x-auto px-4 md:px-8 pb-8 md:pb-12 no-scrollbar scroll-smooth">
            {[
              { title: 'Legendary Collection', color: '#00f3ff', img: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?q=80&w=600' },
              { title: 'Classic Kanto', color: '#ff00ff', img: 'https://images.unsplash.com/photo-1541562232579-512a21360020?q=80&w=600' },
              { title: 'Rare Shiny Edition', color: '#00ff00', img: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?q=80&w=800' },
              { title: 'Limited Drops', color: '#00f3ff', img: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=600' },
            ].map((col) => (
              <div key={col.title} className="min-w-[280px] sm:min-w-[340px] md:min-w-[400px] h-[380px] md:h-[500px] rounded-[40px] md:rounded-[50px] relative overflow-hidden group cursor-pointer border-2 border-white/5 transition-all">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={col.img} alt={col.title} className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-all duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                <div className="absolute bottom-8 md:bottom-12 left-6 md:left-10">
                  <h3 className="text-2xl md:text-3xl font-black uppercase text-white mb-4 md:mb-6">{col.title}</h3>
                  <span className="px-5 py-2 md:px-6 md:py-3 bg-white text-black font-black uppercase text-[10px] rounded-xl group-hover:bg-[#00f3ff] transition-colors">Explorar</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* MAIN PRODUCT CATALOG */}
        <section id="produtos" className="bg-[#0a0a0a] text-white py-14 md:py-32 px-4 md:px-8 relative overflow-hidden">
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-10 md:mb-20">
              <h2 className="text-3xl sm:text-6xl md:text-8xl font-black uppercase mb-4 leading-none tracking-tighter">Shop Our <span className="text-[#00f3ff]">Pokémon</span> Figures</h2>
              <p className="text-zinc-500 font-bold uppercase tracking-[0.4em] text-sm">Colecionáveis de luxo em resina 8K</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-12">
              {pokeCatalog.map((item) => (
                <div
                  key={item.name}
                  className="group cursor-pointer bg-zinc-900/40 p-4 md:p-6 rounded-[30px] md:rounded-[40px] border border-white/5 transition-all"
                  style={{ borderColor: 'transparent' }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = item.color)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}
                >
                  <div className="aspect-square bg-zinc-900 rounded-[20px] md:rounded-[30px] overflow-hidden relative mb-4 md:mb-6">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.img} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 brightness-95" />
                  </div>
                  <h3 className="font-black text-base md:text-xl mb-1 md:mb-2 uppercase tracking-tighter text-white">{item.name}</h3>
                  <p className="font-black text-lg md:text-2xl text-[#00f3ff] mb-3 md:mb-6">R$ {item.price}</p>
                  <Link href="/carrinho">
                    <button className="w-full py-3 md:py-4 bg-zinc-800 text-white text-[10px] font-black uppercase rounded-xl md:rounded-2xl border border-white/10 hover:bg-white hover:text-black transition-all cursor-pointer">
                      Adicionar ao Carrinho
                    </button>
                  </Link>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link href="/produtos" className="inline-flex items-center gap-3 border-2 border-white/20 text-white px-8 py-4 rounded-2xl font-black uppercase text-sm tracking-widest hover:border-[#00f3ff] hover:text-[#00f3ff] transition-all">
                Ver Catálogo Completo <Icon icon="lucide:arrow-right" />
              </Link>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-16 md:py-32 bg-[#151515] relative">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-center">
              <div>
                <div className="w-20 h-20 md:w-24 md:h-24 bg-[#00f3ff]/10 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 border border-[#00f3ff]/20">
                  <Icon icon="mdi:pokeball" className="text-4xl md:text-5xl text-[#00f3ff]" />
                </div>
                <h3 className="text-xl md:text-2xl font-black uppercase mb-3 md:mb-4">01. Choose Pokemon</h3>
                <p className="text-zinc-500 text-sm font-bold leading-relaxed">Selecione seu favorito do nosso catálogo ou envie seu arquivo STL.</p>
              </div>
              <div>
                <div className="w-20 h-20 md:w-24 md:h-24 bg-[#ff00ff]/10 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 border border-[#ff00ff]/20">
                  <Icon icon="lucide:box" className="text-4xl md:text-5xl text-[#ff00ff]" />
                </div>
                <h3 className="text-xl md:text-2xl font-black uppercase mb-3 md:mb-4">02. Get Your Figure</h3>
                <p className="text-zinc-500 text-sm font-bold leading-relaxed">Produzimos em resina 8K e enviamos para seu endereço em tempo recorde.</p>
              </div>
              <div>
                <div className="w-20 h-20 md:w-24 md:h-24 bg-[#00ff00]/10 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 border border-[#00ff00]/20">
                  <Icon icon="lucide:trophy" className="text-4xl md:text-5xl text-[#00ff00]" />
                </div>
                <h3 className="text-xl md:text-2xl font-black uppercase mb-3 md:mb-4">03. Display & Collect</h3>
                <p className="text-zinc-500 text-sm font-bold leading-relaxed">Adicione o Masterpiece ao seu setup e comece sua coleção lendária.</p>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="py-16 md:py-32 px-4 md:px-8 bg-black">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
              <div className="bg-zinc-900/50 p-8 md:p-12 rounded-[40px] md:rounded-[50px] border border-white/5">
                <div className="flex text-[#00ff00] mb-6 md:mb-8">
                  {[...Array(5)].map((_, i) => <Icon key={i} icon="mdi:star" />)}
                </div>
                <p className="text-base md:text-xl font-bold italic text-zinc-300 mb-8 md:mb-10">&quot;O nível de detalhe no meu Charizard é absurdo. A resina 8K faz toda a diferença, não se vê nenhuma linha!&quot;</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-zinc-800"></div>
                  <div>
                    <p className="font-black uppercase text-white">@ash_k</p>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase">Elite Collector</p>
                  </div>
                </div>
              </div>
              <div className="bg-zinc-900/50 p-8 md:p-12 rounded-[40px] md:rounded-[50px] border border-white/5">
                <div className="flex text-[#00f3ff] mb-6 md:mb-8">
                  {[...Array(5)].map((_, i) => <Icon key={i} icon="mdi:star" />)}
                </div>
                <p className="text-base md:text-xl font-bold italic text-zinc-300 mb-8 md:mb-10">&quot;Recebi meu Mewtwo impecável. A pintura manual é digna de museu. Melhor investimento para o meu setup!&quot;</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-zinc-800"></div>
                  <div>
                    <p className="font-black uppercase text-white">@bruno_gym</p>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase">Gym Leader</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 md:py-32 px-4 md:px-8 bg-[#0a0a0a]">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black uppercase text-center mb-10 md:mb-16">Dúvidas do <span className="text-[#00ff00]">Treinador</span></h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-zinc-900/50 rounded-2xl border border-white/5 overflow-hidden">
                  <button
                    className="flex justify-between items-center p-5 md:p-6 cursor-pointer hover:bg-white/5 w-full text-left"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <h3 className="text-sm font-black uppercase text-white pr-4">{faq.q}</h3>
                    <Icon icon="lucide:chevron-down" className={`shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === i && (
                    <div className="px-5 md:px-6 pb-5 md:pb-6 text-zinc-500 text-sm font-bold">{faq.a}</div>
                  )}
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/ajuda" className="text-[#00f3ff] font-black uppercase text-sm tracking-widest hover:text-white transition-colors">
                Ver todas as dúvidas →
              </Link>
            </div>
          </div>
        </section>

        {/* WHATSAPP CTA */}
        <section id="ajuda" className="py-16 md:py-32 px-4 md:px-8 bg-black">
          <div className="max-w-5xl mx-auto bg-zinc-900 rounded-[50px] md:rounded-[80px] p-10 md:p-16 lg:p-32 overflow-hidden relative border-4 border-[#00ff00]/10">
            <div className="relative z-10 text-center">
              <span className="inline-block px-5 py-2 bg-[#00ff00] text-black text-[10px] font-black uppercase tracking-widest mb-8 md:mb-10 rounded-full">SUPORTE LENDÁRIO</span>
              <h2 className="text-4xl sm:text-6xl md:text-8xl font-black uppercase mb-6 md:mb-10 leading-[0.85] md:leading-[0.8] tracking-tighter text-white">Quer um<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff00] to-white">Shiny Raro?</span></h2>
              <p className="text-base md:text-xl text-zinc-400 mb-10 md:mb-16 max-w-xl mx-auto leading-relaxed font-bold">Fale com o Boss no WhatsApp para encomendas exclusivas e orçamentos de projetos sob medida.</p>
              <a
                href="https://wa.me/550000000000"
                className="inline-flex items-center justify-center gap-4 md:gap-6 bg-[#25D366] text-white px-10 md:px-14 py-6 md:py-8 rounded-[30px] font-black uppercase text-base md:text-xl hover:scale-105 hover:shadow-[0_0_50px_rgba(37,211,102,0.5)] transition-all"
              >
                <Icon icon="logos:whatsapp-icon" className="text-3xl md:text-5xl" />
                CHAT DIRETO
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
