'use client'

import Link from 'next/link'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { register, login, resetPassword } from '@/lib/auth'
import { useAuth } from '@/context/AuthContext'

function LoginForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()

  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const [resetEmail, setResetEmail] = useState('')

  // Brute force protection: 5 tentativas falhas -> bloqueia botão por 30s
  const MAX_ATTEMPTS = 5
  const LOCKOUT_MS = 30_000
  const [lockUntil, setLockUntil] = useState(0)
  const [lockRemaining, setLockRemaining] = useState(0)

  useEffect(() => {
    if (searchParams.get('tab') === 'register') setTab('register')
  }, [searchParams])

  // Restaura lockout do localStorage
  useEffect(() => {
    const stored = parseInt(localStorage.getItem('login_lock_until') || '0', 10)
    if (stored > Date.now()) setLockUntil(stored)
  }, [])

  // Contador regressivo enquanto bloqueado
  useEffect(() => {
    if (lockUntil <= Date.now()) {
      setLockRemaining(0)
      return
    }
    const tick = () => {
      const rem = Math.max(0, Math.ceil((lockUntil - Date.now()) / 1000))
      setLockRemaining(rem)
      if (rem === 0) {
        localStorage.removeItem('login_lock_until')
        localStorage.removeItem('login_attempts')
      }
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [lockUntil])

  function registerFailedAttempt() {
    const attempts = parseInt(localStorage.getItem('login_attempts') || '0', 10) + 1
    localStorage.setItem('login_attempts', attempts.toString())
    if (attempts >= MAX_ATTEMPTS) {
      const until = Date.now() + LOCKOUT_MS
      localStorage.setItem('login_lock_until', until.toString())
      setLockUntil(until)
    }
  }

  function resetAttempts() {
    localStorage.removeItem('login_attempts')
    localStorage.removeItem('login_lock_until')
  }

  // Redireciona se já logado
  useEffect(() => {
    if (user) router.push(searchParams.get('redirect') || '/')
  }, [user, router, searchParams])

  function firebaseError(code: string) {
    const map: Record<string, string> = {
      'auth/user-not-found': 'E-mail não encontrado.',
      'auth/wrong-password': 'Senha incorreta.',
      'auth/invalid-credential': 'E-mail ou senha incorretos.',
      'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
      'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
      'auth/invalid-email': 'E-mail inválido.',
      'auth/too-many-requests': 'Muitas tentativas. Aguarde um momento.',
    }
    return map[code] ?? 'Ocorreu um erro. Tente novamente.'
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (lockUntil > Date.now()) {
      setError(`Muitas tentativas. Aguarde ${lockRemaining}s.`)
      return
    }
    setLoading(true)
    try {
      await login(loginForm.email, loginForm.password)
      resetAttempts()
      const redirectTo = searchParams.get('redirect') || '/'
      router.push(redirectTo)
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? ''
      setError(firebaseError(code))
      registerFailedAttempt()
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (registerForm.password !== registerForm.confirm) {
      setError('As senhas não coincidem.')
      return
    }
    setLoading(true)
    try {
      await register(registerForm.name, registerForm.email, registerForm.password)
      const redirectTo = searchParams.get('redirect') || '/'
      router.push(redirectTo)
    } catch (err: unknown) {
      // Erro pode ser de validação Zod ou de Firebase
      const zodIssue = (err as { issues?: Array<{ message: string }> }).issues?.[0]?.message
      if (zodIssue) {
        setError(zodIssue)
      } else {
        const code = (err as { code?: string }).code ?? ''
        setError(firebaseError(code))
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await resetPassword(resetEmail)
      setSuccess('E-mail de recuperação enviado! Verifique sua caixa de entrada.')
      setShowReset(false)
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? ''
      setError(firebaseError(code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#1a1a1a] bg-grid-dark">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-20 px-4 mt-20">
        <div className="w-full max-w-[480px] bg-black/40 backdrop-blur-xl p-8 md:p-12 rounded-[40px] border-2 border-white/5 relative overflow-hidden shadow-2xl">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#00f3ff] rounded-full blur-[100px] opacity-10" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#ff00ff] rounded-full blur-[100px] opacity-10" />

          <div className="relative z-10">
            {/* Logo */}
            <header className="text-center mb-8">
              <div className="inline-flex items-center gap-3 mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://vgbujcuwptvheqijyjbe.supabase.co/storage/v1/object/public/hmac-uploads/uploads/34fbd5be-6d3a-4f38-8d0d-b848d84fc2b5/1775746832304-2b665314/logo_balu_3d.jpg"
                  alt="Balu 3D"
                  className="w-16 h-16 object-cover rounded-full border-2 border-white/20 shadow-lg"
                />
                <h2 className="font-display text-2xl uppercase tracking-tighter text-white">BALU 3D</h2>
              </div>
              <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Acesso ao Printverso</p>
            </header>

            {/* Success */}
            {success && (
              <div className="mb-6 p-4 bg-[#00ff00]/10 border border-[#00ff00]/30 rounded-2xl flex items-center gap-3">
                <Icon icon="lucide:check-circle" className="text-[#00ff00] text-xl flex-shrink-0" />
                <p className="text-xs font-bold text-[#00ff00]">{success}</p>
              </div>
            )}

            {/* Reset password modal */}
            {showReset ? (
              <form onSubmit={handleReset} className="space-y-5">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-black uppercase text-white mb-2">Recuperar Senha</h3>
                  <p className="text-xs text-zinc-500">Digite seu e-mail e enviaremos um link de recuperação.</p>
                </div>
                <div className="relative border-2 border-white/5 rounded-2xl bg-zinc-900/50 focus-within:border-[#00f3ff] transition-all">
                  <Icon icon="lucide:mail" className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-xl" />
                  <input
                    type="email"
                    placeholder="SEU@EMAIL.COM"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    className="w-full bg-transparent py-4 pl-12 pr-4 text-white placeholder:text-zinc-700 focus:outline-none font-bold text-sm uppercase"
                  />
                </div>
                {error && <p className="text-xs text-red-400 font-bold text-center">{error}</p>}
                <button type="submit" disabled={loading} className="w-full py-5 bg-[#00f3ff] text-black font-black uppercase text-sm rounded-2xl cursor-pointer disabled:opacity-50">
                  {loading ? 'Enviando...' : 'Enviar Link'}
                </button>
                <button type="button" onClick={() => { setShowReset(false); setError('') }} className="w-full text-zinc-500 text-xs font-bold uppercase cursor-pointer hover:text-white transition-colors">
                  Voltar ao Login
                </button>
              </form>
            ) : (
              <>
                {/* TABS */}
                <div className="flex bg-zinc-900/80 rounded-2xl p-1 mb-8">
                  <button onClick={() => { setTab('login'); setError('') }} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer ${tab === 'login' ? 'bg-[#00f3ff] text-black shadow-[0_0_15px_rgba(0,243,255,0.4)]' : 'text-zinc-500 hover:text-white'}`}>
                    Entrar
                  </button>
                  <button onClick={() => { setTab('register'); setError('') }} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer ${tab === 'register' ? 'bg-[#ff00ff] text-white shadow-[0_0_15px_rgba(255,0,255,0.4)]' : 'text-zinc-500 hover:text-white'}`}>
                    Criar Conta
                  </button>
                </div>

                {/* Error */}
                {error && (
                  <div className="mb-5 p-3 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3">
                    <Icon icon="lucide:alert-circle" className="text-red-400 flex-shrink-0" />
                    <p className="text-xs font-bold text-red-400">{error}</p>
                  </div>
                )}

                {/* LOGIN */}
                {tab === 'login' && (
                  <form className="space-y-5" onSubmit={handleLogin}>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">E-mail</label>
                      <div className="relative border-2 border-white/5 rounded-2xl bg-zinc-900/50 focus-within:border-[#00f3ff] focus-within:shadow-[0_0_15px_rgba(0,243,255,0.3)] transition-all">
                        <Icon icon="lucide:mail" className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-xl" />
                        <input type="email" placeholder="SEU@EMAIL.COM" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} required
                          className="w-full bg-transparent py-4 pl-12 pr-4 text-white placeholder:text-zinc-700 focus:outline-none font-bold text-sm uppercase" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">Senha</label>
                      <div className="relative border-2 border-white/5 rounded-2xl bg-zinc-900/50 focus-within:border-[#00f3ff] focus-within:shadow-[0_0_15px_rgba(0,243,255,0.3)] transition-all">
                        <Icon icon="lucide:lock" className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-xl" />
                        <input type="password" placeholder="••••••••" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} required
                          className="w-full bg-transparent py-4 pl-12 pr-4 text-white placeholder:text-zinc-700 focus:outline-none font-bold text-sm" />
                      </div>
                    </div>
                    <div className="flex justify-end px-2">
                      <button type="button" onClick={() => { setShowReset(true); setError('') }} className="text-xs font-bold text-[#ff00ff] hover:text-white transition-colors uppercase tracking-tight cursor-pointer">
                        Esqueci a senha
                      </button>
                    </div>
                    <button type="submit" disabled={loading || lockRemaining > 0} className="w-full py-5 bg-[#00f3ff] text-black font-black uppercase text-sm tracking-[0.2em] rounded-2xl cursor-pointer hover:shadow-[0_0_30px_rgba(0,243,255,0.4)] transition-all hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed">
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Icon icon="lucide:loader-2" className="animate-spin" /> Entrando...
                        </span>
                      ) : lockRemaining > 0 ? (
                        <span className="flex items-center justify-center gap-2">
                          <Icon icon="lucide:shield-alert" /> Bloqueado ({lockRemaining}s)
                        </span>
                      ) : 'Entrar no Printverso'}
                    </button>
                    <div className="text-center pt-2">
                      <button type="button" onClick={() => { setTab('register'); setError('') }} className="text-zinc-500 text-xs font-bold uppercase cursor-pointer hover:text-white transition-colors">
                        Não tem conta? <span className="text-[#ff00ff]">Criar agora</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* REGISTER */}
                {tab === 'register' && (
                  <form className="space-y-5" onSubmit={handleRegister}>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">Nome Completo</label>
                      <div className="relative border-2 border-white/5 rounded-2xl bg-zinc-900/50 focus-within:border-[#ff00ff] focus-within:shadow-[0_0_15px_rgba(255,0,255,0.3)] transition-all">
                        <Icon icon="lucide:user" className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-xl" />
                        <input type="text" placeholder="SEU NOME" value={registerForm.name} onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })} required
                          className="w-full bg-transparent py-4 pl-12 pr-4 text-white placeholder:text-zinc-700 focus:outline-none font-bold text-sm uppercase" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">E-mail</label>
                      <div className="relative border-2 border-white/5 rounded-2xl bg-zinc-900/50 focus-within:border-[#ff00ff] focus-within:shadow-[0_0_15px_rgba(255,0,255,0.3)] transition-all">
                        <Icon icon="lucide:mail" className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-xl" />
                        <input type="email" placeholder="SEU@EMAIL.COM" value={registerForm.email} onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} required
                          className="w-full bg-transparent py-4 pl-12 pr-4 text-white placeholder:text-zinc-700 focus:outline-none font-bold text-sm uppercase" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">Senha</label>
                      <div className="relative border-2 border-white/5 rounded-2xl bg-zinc-900/50 focus-within:border-[#ff00ff] focus-within:shadow-[0_0_15px_rgba(255,0,255,0.3)] transition-all">
                        <Icon icon="lucide:lock" className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-xl" />
                        <input type="password" placeholder="MÍN. 8 CARACTERES, 1 MAIÚSCULA, 1 NÚMERO" value={registerForm.password} onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} required
                          className="w-full bg-transparent py-4 pl-12 pr-4 text-white placeholder:text-zinc-700 focus:outline-none font-bold text-sm" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">Confirmar Senha</label>
                      <div className="relative border-2 border-white/5 rounded-2xl bg-zinc-900/50 focus-within:border-[#ff00ff] focus-within:shadow-[0_0_15px_rgba(255,0,255,0.3)] transition-all">
                        <Icon icon="lucide:lock-keyhole" className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-xl" />
                        <input type="password" placeholder="REPITA A SENHA" value={registerForm.confirm} onChange={(e) => setRegisterForm({ ...registerForm, confirm: e.target.value })} required
                          className="w-full bg-transparent py-4 pl-12 pr-4 text-white placeholder:text-zinc-700 focus:outline-none font-bold text-sm" />
                      </div>
                    </div>
                    <button type="submit" disabled={loading} className="w-full py-5 bg-[#ff00ff] text-white font-black uppercase text-sm tracking-[0.2em] rounded-2xl cursor-pointer hover:shadow-[0_0_30px_rgba(255,0,255,0.4)] transition-all hover:scale-[1.02] disabled:opacity-50 disabled:scale-100">
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Icon icon="lucide:loader-2" className="animate-spin" /> Criando conta...
                        </span>
                      ) : 'Criar Conta no Printverso'}
                    </button>
                    <div className="text-center pt-2">
                      <button type="button" onClick={() => { setTab('login'); setError('') }} className="text-zinc-500 text-xs font-bold uppercase cursor-pointer hover:text-white transition-colors">
                        Já tem conta? <span className="text-[#00f3ff]">Entrar</span>
                      </button>
                    </div>
                  </form>
                )}
              </>
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
        <div className="w-8 h-8 border-2 border-[#00f3ff] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
