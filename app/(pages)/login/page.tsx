'use client'

import Link from 'next/link'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Icon } from '@iconify/react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

function LoginForm() {
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [loginForm, setLoginForm] = useState({ email: '', password: '', remember: false })
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', confirm: '' })

  useEffect(() => {
    if (searchParams.get('tab') === 'register') {
      setTab('register')
    }
  }, [searchParams])

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setLoginForm({ ...loginForm, [name]: type === 'checkbox' ? checked : value })
  }

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setRegisterForm({ ...registerForm, [name]: value })
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#1a1a1a] bg-grid-dark">
      <Navbar cartCount={2} />

      <main className="flex-1 flex items-center justify-center py-20 px-4 mt-20">
        <div className="w-full max-w-[480px] bg-black/40 backdrop-blur-xl p-8 md:p-12 rounded-[40px] border-2 border-white/5 relative overflow-hidden shadow-2xl">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#00f3ff] rounded-full blur-[100px] opacity-10"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#ff00ff] rounded-full blur-[100px] opacity-10"></div>

          <div className="relative z-10">
            {/* Logo */}
            <header className="text-center mb-8">
              <div className="inline-flex items-center gap-3 mb-4 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://vgbujcuwptvheqijyjbe.supabase.co/storage/v1/object/public/hmac-uploads/uploads/34fbd5be-6d3a-4f38-8d0d-b848d84fc2b5/1775746832304-2b665314/logo_balu_3d.jpg"
                  alt="Balu 3D"
                  className="w-16 h-16 object-cover rounded-full border-2 border-white/20 shadow-lg"
                />
                <h2 className="font-display text-2xl uppercase tracking-tighter glitch" data-text="BALU 3D">BALU 3D</h2>
              </div>
              <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Acesso ao Printverso</p>
            </header>

            {/* TABS */}
            <div className="flex bg-zinc-900/80 rounded-2xl p-1 mb-8">
              <button
                onClick={() => setTab('login')}
                className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer ${
                  tab === 'login' ? 'bg-[#00f3ff] text-black shadow-[0_0_15px_rgba(0,243,255,0.4)]' : 'text-zinc-500 hover:text-white'
                }`}
              >
                Entrar
              </button>
              <button
                onClick={() => setTab('register')}
                className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer ${
                  tab === 'register' ? 'bg-[#ff00ff] text-white shadow-[0_0_15px_rgba(255,0,255,0.4)]' : 'text-zinc-500 hover:text-white'
                }`}
              >
                Criar Conta
              </button>
            </div>

            {/* LOGIN FORM */}
            {tab === 'login' && (
              <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">E-mail</label>
                  <div className="relative border-2 border-white/5 rounded-2xl bg-zinc-900/50 focus-within:border-[#00f3ff] focus-within:shadow-[0_0_15px_rgba(0,243,255,0.3)] transition-all">
                    <Icon icon="lucide:mail" className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-xl" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="SEU@EMAIL.COM"
                      value={loginForm.email}
                      onChange={handleLoginChange}
                      className="w-full bg-transparent py-4 pl-12 pr-4 text-white placeholder:text-zinc-700 focus:outline-none font-bold text-sm uppercase"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">Senha</label>
                  <div className="relative border-2 border-white/5 rounded-2xl bg-zinc-900/50 focus-within:border-[#00f3ff] focus-within:shadow-[0_0_15px_rgba(0,243,255,0.3)] transition-all">
                    <Icon icon="lucide:lock" className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-xl" />
                    <input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={loginForm.password}
                      onChange={handleLoginChange}
                      className="w-full bg-transparent py-4 pl-12 pr-4 text-white placeholder:text-zinc-700 focus:outline-none font-bold text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between px-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="remember"
                      checked={loginForm.remember}
                      onChange={handleLoginChange}
                      className="w-5 h-5 rounded border-2 border-zinc-700 bg-zinc-900 transition-all cursor-pointer accent-[#00f3ff]"
                    />
                    <span className="text-xs font-bold text-zinc-500 group-hover:text-zinc-300 uppercase tracking-tight">Lembrar de mim</span>
                  </label>
                  <a href="#" className="text-xs font-bold text-[#ff00ff] hover:text-white transition-colors uppercase tracking-tight">Esqueci a senha</a>
                </div>

                <button
                  type="submit"
                  className="w-full py-5 bg-[#00f3ff] text-black font-black uppercase text-sm tracking-[0.2em] rounded-2xl cursor-pointer hover:shadow-[0_0_30px_rgba(0,243,255,0.4)] transition-all hover:scale-[1.02]"
                >
                  Entrar no Printverso
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setTab('register')}
                    className="text-zinc-500 text-xs font-bold uppercase cursor-pointer hover:text-white transition-colors"
                  >
                    Não tem conta? <span className="text-[#ff00ff]">Criar agora</span>
                  </button>
                </div>
              </form>
            )}

            {/* REGISTER FORM */}
            {tab === 'register' && (
              <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-2">
                  <label htmlFor="reg-name" className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">Nome do Treinador</label>
                  <div className="relative border-2 border-white/5 rounded-2xl bg-zinc-900/50 focus-within:border-[#ff00ff] focus-within:shadow-[0_0_15px_rgba(255,0,255,0.3)] transition-all">
                    <Icon icon="lucide:user" className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-xl" />
                    <input
                      id="reg-name"
                      name="name"
                      type="text"
                      placeholder="SEU NOME"
                      value={registerForm.name}
                      onChange={handleRegisterChange}
                      className="w-full bg-transparent py-4 pl-12 pr-4 text-white placeholder:text-zinc-700 focus:outline-none font-bold text-sm uppercase"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="reg-email" className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">E-mail</label>
                  <div className="relative border-2 border-white/5 rounded-2xl bg-zinc-900/50 focus-within:border-[#ff00ff] focus-within:shadow-[0_0_15px_rgba(255,0,255,0.3)] transition-all">
                    <Icon icon="lucide:mail" className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-xl" />
                    <input
                      id="reg-email"
                      name="email"
                      type="email"
                      placeholder="SEU@EMAIL.COM"
                      value={registerForm.email}
                      onChange={handleRegisterChange}
                      className="w-full bg-transparent py-4 pl-12 pr-4 text-white placeholder:text-zinc-700 focus:outline-none font-bold text-sm uppercase"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="reg-password" className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">Senha</label>
                  <div className="relative border-2 border-white/5 rounded-2xl bg-zinc-900/50 focus-within:border-[#ff00ff] focus-within:shadow-[0_0_15px_rgba(255,0,255,0.3)] transition-all">
                    <Icon icon="lucide:lock" className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-xl" />
                    <input
                      id="reg-password"
                      name="password"
                      type="password"
                      placeholder="MÍNIMO 8 CARACTERES"
                      value={registerForm.password}
                      onChange={handleRegisterChange}
                      className="w-full bg-transparent py-4 pl-12 pr-4 text-white placeholder:text-zinc-700 focus:outline-none font-bold text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="reg-confirm" className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">Confirmar Senha</label>
                  <div className="relative border-2 border-white/5 rounded-2xl bg-zinc-900/50 focus-within:border-[#ff00ff] focus-within:shadow-[0_0_15px_rgba(255,0,255,0.3)] transition-all">
                    <Icon icon="lucide:lock-keyhole" className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-xl" />
                    <input
                      id="reg-confirm"
                      name="confirm"
                      type="password"
                      placeholder="REPITA A SENHA"
                      value={registerForm.confirm}
                      onChange={handleRegisterChange}
                      className="w-full bg-transparent py-4 pl-12 pr-4 text-white placeholder:text-zinc-700 focus:outline-none font-bold text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-5 neon-button-magenta text-white font-black uppercase text-sm tracking-[0.2em] rounded-2xl cursor-pointer"
                >
                  Criar Conta no Printverso
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setTab('login')}
                    className="text-zinc-500 text-xs font-bold uppercase cursor-pointer hover:text-white transition-colors"
                  >
                    Já tem conta? <span className="text-[#00f3ff]">Entrar</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a]">
        <div className="w-8 h-8 border-2 border-[#00f3ff] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
