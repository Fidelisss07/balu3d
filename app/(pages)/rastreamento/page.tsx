'use client'

import Link from 'next/link'
import { Icon } from '@iconify/react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function TrackingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar cartCount={2} />

      <main className="flex-1 pt-32 pb-24 px-8 bg-grid-dark">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Link href="/" className="p-2 bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition-colors" aria-label="Voltar">
                  <Icon icon="lucide:arrow-left" />
                </Link>
                <span className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Rastreamento de Pedido</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">PEDIDO <span className="text-[#00f3ff]">#BLU-98421</span></h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Status Atual</p>
                <p className="text-lg font-black text-[#00f3ff] uppercase">Em Trânsito</p>
              </div>
              <div className="w-16 h-16 bg-zinc-900 border-2 border-[#00f3ff] rounded-2xl flex items-center justify-center pulse-cyan">
                <Icon icon="lucide:truck" className="text-3xl text-[#00f3ff]" />
              </div>
            </div>
          </div>

          {/* Tracking Timeline */}
          <div className="bg-black border-2 border-zinc-800 rounded-[40px] p-8 md:p-12 mb-10 overflow-hidden relative">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              {/* Connector Line */}
              <div className="hidden md:block absolute top-7 left-[10%] right-[10%] h-1 bg-zinc-800">
                <div className="h-full bg-gradient-to-r from-[#00ff00] to-[#00f3ff]" style={{ width: '66%' }}></div>
              </div>

              {[
                { icon: 'lucide:check', label: 'Confirmado', date: '12 Out, 09:42', done: true, active: false },
                { icon: 'lucide:box', label: 'Em Impressão', date: '13 Out, 14:15', done: true, active: false },
                { icon: 'lucide:truck', label: 'Em Trânsito', date: 'Chega em 2 dias', done: false, active: true },
                { icon: 'lucide:home', label: 'Entregue', date: 'Previsão: 16 Out', done: false, active: false },
              ].map((step) => (
                <div key={step.label} className="relative flex md:flex-col items-center gap-4 md:text-center">
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center z-10 ${
                      step.active
                        ? 'bg-[#00f3ff] shadow-[0_0_25px_rgba(0,243,255,0.5)]'
                        : step.done
                        ? 'bg-black border-4 border-[#00ff00] shadow-[0_0_15px_rgba(0,255,0,0.3)]'
                        : 'bg-black border-4 border-zinc-800'
                    }`}
                  >
                    <Icon
                      icon={step.icon}
                      className={`text-2xl ${step.active ? 'text-black' : step.done ? 'text-[#00ff00]' : 'text-zinc-700'}`}
                    />
                  </div>
                  <div>
                    <h4 className={`font-black uppercase text-sm mb-1 ${step.active ? 'text-white' : step.done ? 'text-[#00ff00]' : 'text-zinc-700'}`}>
                      {step.label}
                    </h4>
                    <p className={`text-xs font-bold ${step.active ? 'text-[#00f3ff] italic uppercase' : 'text-zinc-500'}`}>{step.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 flex flex-col gap-10">
              {/* Map */}
              <div className="bg-zinc-900 rounded-[40px] border-2 border-white/5 overflow-hidden h-[450px] relative">
                <div
                  className="absolute inset-0 bg-cover grayscale contrast-125 mix-blend-multiply"
                  style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=1200&auto=format&fit=crop)', opacity: 0.4 }}
                ></div>
                <div className="absolute inset-0 bg-grid-dark opacity-40"></div>
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <path d="M 100 350 Q 300 300 500 200 T 700 100" stroke="#00f3ff" strokeWidth="4" fill="transparent" className="map-line opacity-50" />
                  <circle cx="100" cy="350" r="8" fill="#00ff00" />
                  <circle cx="500" cy="200" r="12" fill="#00f3ff" className="pulse-cyan" />
                  <circle cx="700" cy="100" r="8" fill="white" />
                </svg>
                <div className="absolute bottom-8 left-8 right-8 flex flex-wrap gap-4">
                  <div className="bg-black/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex-1 min-w-[200px]">
                    <p className="text-[10px] font-black uppercase text-zinc-500 mb-1 tracking-widest">Última Localização</p>
                    <p className="text-sm font-black text-white">Centro de Distribuição Norte - Setor 7</p>
                  </div>
                  <div className="bg-black/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl">
                    <p className="text-[10px] font-black uppercase text-zinc-500 mb-1 tracking-widest">Distância</p>
                    <p className="text-sm font-black text-[#00f3ff]">42 km restantes</p>
                  </div>
                </div>
              </div>

              {/* Log */}
              <div className="bg-black border-2 border-zinc-800 rounded-[40px] p-10">
                <h3 className="text-2xl font-black uppercase mb-8 flex items-center gap-3">
                  <Icon icon="lucide:history" className="text-[#ff00ff]" />
                  Registros em Tempo Real
                </h3>
                <div className="space-y-8">
                  <div className="flex gap-6 relative">
                    <div className="absolute left-[11px] top-6 bottom-[-32px] w-0.5 bg-zinc-800"></div>
                    <div className="w-6 h-6 rounded-full bg-[#00f3ff] border-4 border-black z-10 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-black text-white mb-1 uppercase tracking-tight">Em rota para o cliente</p>
                      <p className="text-xs text-zinc-500 mb-2 font-bold">Hoje, às 08:32 • Motorista: Carlos R.</p>
                      <div className="bg-zinc-900 border border-white/5 p-3 rounded-xl text-xs text-zinc-400 leading-relaxed">
                        O pacote saiu do centro logístico e está no veículo de entrega final.
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-6 relative">
                    <div className="absolute left-[11px] top-6 bottom-[-32px] w-0.5 bg-zinc-800"></div>
                    <div className="w-6 h-6 rounded-full bg-zinc-700 border-4 border-black z-10 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-black text-zinc-300 mb-1 uppercase tracking-tight">Triagem Hub Logístico</p>
                      <p className="text-xs text-zinc-500 font-bold">Ontem, às 21:50</p>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="w-6 h-6 rounded-full bg-zinc-700 border-4 border-black z-10 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-black text-zinc-300 mb-1 uppercase tracking-tight">Drone Pick-up: Finalizado</p>
                      <p className="text-xs text-zinc-500 font-bold">Ontem, às 14:15 • Local: Printverso Matriz</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="flex flex-col gap-10">
              {/* Carrier Info */}
              <div className="bg-zinc-900/50 border-2 border-zinc-800 rounded-[40px] p-8">
                <p className="text-[10px] font-black uppercase text-zinc-600 mb-6 tracking-widest">Informações de Envio</p>
                <div className="flex items-center gap-4 mb-8 pb-8 border-b border-zinc-800">
                  <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center border border-white/10">
                    <Icon icon="lucide:box" className="text-2xl text-[#00f3ff]" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 font-bold uppercase mb-0.5">Transportadora</p>
                    <p className="text-sm font-black text-white">LOGGI GAMER SQUAD</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-black text-zinc-600 uppercase mb-2">Código de Rastreio</p>
                    <div className="flex items-center justify-between bg-black p-3 rounded-xl border border-white/5">
                      <code className="text-xs font-black text-[#00f3ff]">BLU9842100X</code>
                      <button className="text-zinc-500 hover:text-white transition-colors" aria-label="Copiar código">
                        <Icon icon="lucide:copy" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-zinc-600 uppercase mb-2">Endereço de Destino</p>
                    <p className="text-xs font-bold text-zinc-400 leading-relaxed">
                      Rua dos Gamers, 1337 • Apto 404<br />
                      Bairro Printverso • São Paulo, SP<br />
                      01234-567
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-black border-2 border-zinc-800 rounded-[40px] p-8">
                <p className="text-[10px] font-black uppercase text-zinc-600 mb-6 tracking-widest">Itens no Pacote</p>
                <div className="space-y-6">
                  {[
                    { name: 'Kratos Resin Art', detail: 'Qtd: 1 • Edição Limitada', color: '#ff00ff', img: 'https://images.unsplash.com/photo-1608889175123-8ee362201f81?q=80&w=100' },
                    { name: 'Dragão Articulado', detail: 'Qtd: 2 • Silk Blue', color: '#00f3ff', img: 'https://images.unsplash.com/photo-1559124568-d5a0f7da1ec5?q=80&w=100' },
                  ].map((item) => (
                    <div key={item.name} className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-zinc-900 border border-white/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.img} alt={item.name} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-white uppercase mb-1">{item.name}</p>
                        <p className="text-[10px] font-bold" style={{ color: item.color }}>{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Support CTA */}
              <div className="bg-gradient-to-br from-zinc-900 to-black border-2 border-[#00ff00]/20 rounded-[40px] p-8 relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 opacity-10">
                  <Icon icon="lucide:help-circle" className="text-8xl text-[#00ff00]" />
                </div>
                <h4 className="text-xl font-black uppercase mb-3 text-white">Problemas com a entrega?</h4>
                <p className="text-xs text-zinc-500 font-bold mb-6">Nossos especialistas estão online para ajudar no rastreio manual.</p>
                <a
                  href="#"
                  className="w-full flex items-center justify-center gap-3 bg-zinc-900 border-2 border-[#00ff00] text-[#00ff00] py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-[#00ff00] hover:text-black transition-all shadow-[0_0_20px_rgba(0,255,0,0.2)] group"
                >
                  <Icon icon="lucide:message-circle" className="text-xl" />
                  Suporte 24h
                  <Icon icon="lucide:arrow-right" className="group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
