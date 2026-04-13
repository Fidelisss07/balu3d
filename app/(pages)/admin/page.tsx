'use client'

import Link from 'next/link'
import { Icon } from '@iconify/react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const inventory = [
  { name: 'Dragão Silk Blue', cat: 'Geek', price: 'R$ 89,90', img: 'https://images.unsplash.com/photo-1559124568-d5a0f7da1ec5?q=80&w=150', color: '#ff00ff', locked: false },
  { name: 'Mini Charmander', cat: 'Gamer', price: 'R$ 45,00', img: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaad5b?q=80&w=150', color: '#00f3ff', locked: false },
  { name: 'Suporte DualSense', cat: 'Custom', price: 'R$ 75,00', img: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=150', color: '#00ff00', locked: false },
  { name: 'Busto Batman', cat: 'Geek', price: 'R$ 120,00', img: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=150', color: '#ff00ff', locked: true },
]

export default function AdminPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#1a1a1a] bg-grid-dark">
      <Navbar cartCount={2} />

      <div className="flex-1 flex pt-20">
        {/* Sidebar */}
        <aside className="w-64 bg-black/60 backdrop-blur-xl border-r border-white/5 fixed left-0 h-[calc(100vh-80px)] overflow-y-auto hidden md:block">
          <div className="p-8">
            <div className="mb-10">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-6">Navegação Admin</p>
              <nav className="space-y-2">
                <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-all">
                  <Icon icon="lucide:layout-dashboard" /> Dashboard
                </Link>
                <Link href="/admin" className="admin-sidebar-item active flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all">
                  <Icon icon="lucide:box" /> Produtos
                </Link>
                <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-all">
                  <Icon icon="lucide:shopping-cart" /> Pedidos
                </a>
                <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-all">
                  <Icon icon="lucide:users" /> Clientes
                </a>
              </nav>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-6">Sistema</p>
              <nav className="space-y-2">
                <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-all">
                  <Icon icon="lucide:settings" /> Configurações
                </a>
                <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-red-400 hover:bg-red-500/10 transition-all">
                  <Icon icon="lucide:log-out" /> Sair do Painel
                </a>
              </nav>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 md:ml-64 p-6 md:p-10">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <h1 className="text-4xl md:text-5xl font-black uppercase leading-none tracking-tighter text-white">
                  Gestão de <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] to-[#ff00ff]">Produtos</span>
                </h1>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mt-2">Adicione, edite ou remova itens do catálogo Balu 3D</p>
              </div>
              <div className="flex gap-4">
                <div className="bg-zinc-900 border border-white/10 px-4 py-2 rounded-full flex items-center gap-3">
                  <span className="w-2 h-2 bg-[#00ff00] rounded-full animate-pulse shadow-[0_0_8px_#00ff00]"></span>
                  <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Status: Online</span>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-10">
              {/* Product Form */}
              <section className="lg:col-span-2 space-y-8">
                <div className="bg-black/40 backdrop-blur-md rounded-[32px] border border-white/5 p-8 shadow-2xl">
                  <div className="flex items-center gap-3 mb-8">
                    <Icon icon="lucide:plus-circle" className="text-2xl text-[#00f3ff]" />
                    <h2 className="text-xl font-black uppercase tracking-tight">Novo Produto</h2>
                  </div>
                  <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Nome do Produto</label>
                        <input type="text" placeholder="Ex: Bust Kratos God of War"
                          className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-[#00f3ff] transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Categoria</label>
                        <select className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-[#ff00ff] transition-all appearance-none cursor-pointer">
                          <option>Geek</option>
                          <option>Gamer</option>
                          <option>Custom</option>
                          <option>Utilitário</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Descrição Completa</label>
                      <textarea rows={4} placeholder="Detalhes técnicos, material usado, dimensões..."
                        className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-[#00ff00] transition-all resize-none"></textarea>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Preço (R$)</label>
                        <input type="number" step="0.01" placeholder="0.00"
                          className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-[#00f3ff] transition-all" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Variantes (Separadas por vírgula)</label>
                        <input type="text" placeholder="Ex: Resina, PLA Silk, Pintado"
                          className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-[#ff00ff] transition-all" />
                      </div>
                    </div>
                    <div className="space-y-4 pt-4">
                      <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Imagens do Produto (Máx 5)</label>
                      <div className="drop-zone w-full aspect-[21/9] rounded-2xl border-2 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-all group">
                        <Icon icon="lucide:upload-cloud" className="text-4xl text-zinc-600 group-hover:text-[#00f3ff] transition-colors mb-2" />
                        <p className="text-sm text-zinc-500 group-hover:text-white transition-colors">Arraste imagens ou <span className="text-[#00f3ff]">busque arquivos</span></p>
                        <p className="text-[10px] text-zinc-700 mt-2 uppercase font-black">JPG, PNG ou WEBP • Máx 10MB cada</p>
                      </div>
                      <div className="flex flex-wrap gap-4 mt-4">
                        <div className="relative w-24 h-24 bg-zinc-800 rounded-xl overflow-hidden border border-[#00f3ff] group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src="https://images.unsplash.com/photo-1608889175123-8ee362201f81?q=80&w=200" alt="preview" className="w-full h-full object-cover" />
                          <button className="absolute top-1 right-1 bg-black/80 p-1 rounded-md text-red-500 hover:bg-red-500 hover:text-white" aria-label="Remover imagem">
                            <Icon icon="lucide:trash-2" className="text-xs" />
                          </button>
                        </div>
                        <div className="w-24 h-24 bg-zinc-900 rounded-xl border border-dashed border-white/10 flex items-center justify-center text-zinc-700">
                          <Icon icon="lucide:plus" className="text-xl" />
                        </div>
                      </div>
                    </div>
                    <div className="pt-8 flex items-center justify-between">
                      <p className="text-xs text-zinc-500">Todos os campos marcados são obrigatórios para indexação no site.</p>
                      <button type="submit" className="px-10 py-4 bg-gradient-to-r from-[#00f3ff] to-[#ff00ff] text-black font-black uppercase text-xs tracking-[0.2em] rounded-xl hover:scale-105 transition-all shadow-xl shadow-cyan-500/20 active:scale-95">
                        Salvar Produto
                      </button>
                    </div>
                  </form>
                </div>
              </section>

              {/* Inventory */}
              <section className="space-y-8">
                <div className="bg-black/40 backdrop-blur-md rounded-[32px] border border-white/5 p-8 shadow-2xl h-full">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <Icon icon="lucide:layout-grid" className="text-2xl text-[#ff00ff]" />
                      <h2 className="text-xl font-black uppercase tracking-tight">Estoque Ativo</h2>
                    </div>
                    <span className="px-3 py-1 bg-zinc-900 border border-white/10 rounded-full text-[10px] font-black">48 Itens</span>
                  </div>
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {inventory.map((item) => (
                      <div
                        key={item.name}
                        className={`group bg-zinc-900/40 p-4 rounded-2xl border border-white/5 transition-all flex items-center gap-4 ${item.locked ? 'opacity-60' : `hover:border-[${item.color}]/30`}`}
                      >
                        <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-black">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.img} alt={item.name} className={`w-full h-full object-cover transition-transform ${item.locked ? 'grayscale' : 'group-hover:scale-110'}`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xs font-black uppercase text-white truncate">{item.name}</h4>
                          <p className="text-[10px] text-zinc-500 font-bold tracking-widest">{item.cat} • {item.price}</p>
                        </div>
                        <div className="flex gap-2">
                          {item.locked ? (
                            <button className="p-2 rounded-lg bg-zinc-800 text-zinc-400" aria-label="Bloqueado">
                              <Icon icon="lucide:lock" />
                            </button>
                          ) : (
                            <>
                              <button className="p-2 rounded-lg bg-zinc-800 text-cyan-400 hover:bg-cyan-400 hover:text-black transition-all" aria-label="Editar">
                                <Icon icon="lucide:edit-3" />
                              </button>
                              <button className="p-2 rounded-lg bg-zinc-800 text-red-400 hover:bg-red-400 hover:text-black transition-all" aria-label="Excluir">
                                <Icon icon="lucide:trash-2" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8">
                    <a href="#" className="flex items-center justify-center w-full py-4 border-2 border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:border-white hover:text-white transition-all">
                      Ver Galeria Completa
                    </a>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}
