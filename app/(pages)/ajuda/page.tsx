'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Icon } from '@iconify/react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const faqCategories = [
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

export default function AjudaPage() {
  const [openFaq, setOpenFaq] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const toggleFaq = (key: string) => setOpenFaq(openFaq === key ? null : key)

  const displayCategories = activeCategory
    ? faqCategories.filter((c) => c.title === activeCategory)
    : faqCategories

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
      <Navbar cartCount={2} />

      <main className="flex-1 pt-20">
        {/* HEADER */}
        <section className="bg-[#1a1a1a] bg-grid-dark py-16 md:py-24 px-4 md:px-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00ff00]/10 via-transparent to-[#ff00ff]/10 pointer-events-none"></div>
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <nav className="flex items-center justify-center gap-2 text-xs text-zinc-500 font-bold uppercase mb-6">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <Icon icon="lucide:chevron-right" className="text-xs" />
              <span className="text-[#00ff00]">Ajuda</span>
            </nav>
            <span className="inline-block px-4 py-2 bg-[#00ff00] text-black text-[10px] font-black uppercase tracking-widest mb-6 rounded-full">CENTRAL DE AJUDA</span>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tighter text-white leading-none mb-4">
              Como podemos<br /><span className="text-[#00ff00]">te ajudar?</span>
            </h1>
            <p className="text-zinc-500 font-bold max-w-lg mx-auto">Encontre respostas para as dúvidas mais comuns ou fale diretamente com a gente pelo WhatsApp.</p>
          </div>
        </section>

        {/* QUICK LINKS */}
        <section className="py-10 md:py-16 px-4 md:px-8 bg-black border-b border-white/5">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Meu Pedido', icon: 'lucide:package', href: '/rastreamento', color: '#00f3ff' },
                { label: 'Carrinho', icon: 'lucide:shopping-bag', href: '/carrinho', color: '#ff00ff' },
                { label: 'WhatsApp', icon: 'logos:whatsapp-icon', href: 'https://wa.me/550000000000', color: '#25D366' },
                { label: 'Catálogo', icon: 'lucide:box', href: '/produtos', color: '#00ff00' },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex flex-col items-center gap-3 p-5 bg-zinc-900/60 rounded-2xl border border-white/5 hover:border-white/20 transition-all group cursor-pointer text-center"
                >
                  <Icon icon={item.icon} className="text-3xl transition-transform group-hover:scale-110" style={{ color: item.color }} />
                  <span className="text-xs font-black uppercase text-white tracking-widest">{item.label}</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* CATEGORY FILTER */}
        <section className="pt-10 md:pt-16 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap gap-3 mb-10">
              <button
                onClick={() => setActiveCategory(null)}
                className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                  !activeCategory ? 'bg-[#00f3ff] text-black shadow-[0_0_15px_rgba(0,243,255,0.4)]' : 'bg-zinc-900 text-white/60 border border-white/10 hover:border-[#00f3ff] hover:text-white'
                }`}
              >
                Todas as categorias
              </button>
              {faqCategories.map((cat) => (
                <button
                  key={cat.title}
                  onClick={() => setActiveCategory(cat.title === activeCategory ? null : cat.title)}
                  className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                    activeCategory === cat.title ? 'text-black shadow-lg' : 'bg-zinc-900 text-white/60 border border-white/10 hover:text-white'
                  }`}
                  style={activeCategory === cat.title ? { backgroundColor: cat.color } : {}}
                >
                  {cat.title}
                </button>
              ))}
            </div>

            {/* FAQ SECTIONS */}
            <div className="space-y-10 pb-16 md:pb-24">
              {displayCategories.map((category) => (
                <div key={category.title}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${category.color}20`, border: `1px solid ${category.color}40` }}>
                      <Icon icon={category.icon} style={{ color: category.color }} className="text-xl" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-white">{category.title}</h2>
                  </div>
                  <div className="space-y-3">
                    {category.faqs.map((faq, i) => {
                      const key = `${category.title}-${i}`
                      return (
                        <div key={key} className="bg-zinc-900/50 rounded-2xl border border-white/5 overflow-hidden">
                          <button
                            className="flex justify-between items-center p-5 md:p-6 cursor-pointer hover:bg-white/5 w-full text-left"
                            onClick={() => toggleFaq(key)}
                          >
                            <h3 className="text-sm font-black uppercase text-white pr-4">{faq.q}</h3>
                            <Icon
                              icon="lucide:chevron-down"
                              className={`shrink-0 transition-transform text-zinc-500 ${openFaq === key ? 'rotate-180' : ''}`}
                            />
                          </button>
                          {openFaq === key && (
                            <div className="px-5 md:px-6 pb-5 md:pb-6 text-zinc-400 text-sm font-bold leading-relaxed">{faq.a}</div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WHATSAPP CTA */}
        <section className="py-16 md:py-24 px-4 md:px-8 bg-black">
          <div className="max-w-3xl mx-auto bg-zinc-900 rounded-[50px] p-10 md:p-16 border-4 border-[#25D366]/10 text-center">
            <div className="w-20 h-20 bg-[#25D366]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#25D366]/20">
              <Icon icon="logos:whatsapp-icon" className="text-4xl" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-4 text-white">Ainda com dúvidas?</h2>
            <p className="text-zinc-500 font-bold mb-8 max-w-md mx-auto">Nossa equipe responde no WhatsApp em menos de 10 minutos durante o horário comercial.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://wa.me/550000000000"
                className="inline-flex items-center gap-3 bg-[#25D366] text-white px-8 py-4 rounded-2xl font-black uppercase hover:scale-105 hover:shadow-[0_0_30px_rgba(37,211,102,0.5)] transition-all"
              >
                <Icon icon="logos:whatsapp-icon" className="text-2xl" />
                Falar no WhatsApp
              </a>
              <div className="text-zinc-600 text-xs font-bold uppercase">ou</div>
              <a
                href="mailto:contato@balu3d.com.br"
                className="inline-flex items-center gap-3 border-2 border-white/10 text-white px-8 py-4 rounded-2xl font-black uppercase hover:border-[#00f3ff] hover:text-[#00f3ff] transition-all"
              >
                <Icon icon="lucide:mail" className="text-xl" />
                Enviar E-mail
              </a>
            </div>
            <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest mt-8">Seg - Sex: 9h às 18h · Sáb: 10h às 14h</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
