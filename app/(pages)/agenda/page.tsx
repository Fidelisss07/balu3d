'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { Icon } from '@iconify/react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getAgendaEvents, type AgendaEvent } from '@/lib/db'

const MONTHS = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
]
const WEEKDAYS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}
function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

export default function AgendaPage() {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [events, setEvents] = useState<AgendaEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [modalEvent, setModalEvent] = useState<AgendaEvent | null>(null)

  useEffect(() => {
    getAgendaEvents().then((data) => { setEvents(data); setLoading(false) })
  }, [])

  const closeModal = useCallback(() => setModalEvent(null), [])

  useEffect(() => {
    if (!modalEvent) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal() }
    window.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [modalEvent, closeModal])

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth)

  function dateKey(y: number, m: number, d: number) {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  }

  function eventsForDay(key: string) {
    return events.filter((e) => e.date === key)
  }

  const todayKey = dateKey(today.getFullYear(), today.getMonth(), today.getDate())

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
      <Navbar />

      <main className="flex-1 pt-20">
        {/* HEADER */}
        <section className="bg-[#1a1a1a] bg-grid-dark py-16 md:py-20 px-4 md:px-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#ff00ff]/10 via-transparent to-[#00f3ff]/10 pointer-events-none" />
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <nav className="flex items-center justify-center gap-2 text-xs text-zinc-500 font-bold uppercase mb-6">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <Icon icon="lucide:chevron-right" className="text-xs" />
              <span className="text-[#ff00ff]">Agenda</span>
            </nav>
            <span className="inline-block px-4 py-2 bg-[#ff00ff] text-black text-[10px] font-black uppercase tracking-widest mb-6 rounded-full">EVENTOS PRESENCIAIS</span>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tighter text-white leading-none mb-4">
              Onde a Balu 3D<br /><span className="text-[#ff00ff]">Vai Estar</span>
            </h1>
            <p className="text-zinc-500 font-bold max-w-lg mx-auto">Encontre feiras, eventos e exposições onde você pode ver nossas peças pessoalmente.</p>
          </div>
        </section>

        {/* CALENDAR */}
        <section className="py-10 md:py-16 px-4 md:px-8">
          <div className="max-w-5xl mx-auto">
            {loading ? (
              <div className="flex justify-center py-32">
                <div className="w-10 h-10 border-2 border-[#ff00ff] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="bg-zinc-900/40 border border-white/5 rounded-[40px] overflow-hidden">
                {/* Month navigation */}
                <div className="flex items-center justify-between p-6 md:p-8 border-b border-white/5">
                  <button onClick={prevMonth} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white transition-all cursor-pointer">
                    <Icon icon="lucide:chevron-left" />
                  </button>
                  <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white">
                    {MONTHS[viewMonth]} <span className="text-[#ff00ff]">{viewYear}</span>
                  </h2>
                  <button onClick={nextMonth} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white transition-all cursor-pointer">
                    <Icon icon="lucide:chevron-right" />
                  </button>
                </div>

                {/* Weekday headers */}
                <div className="grid grid-cols-7 border-b border-white/5">
                  {WEEKDAYS.map((d) => (
                    <div key={d} className="py-3 text-center text-[10px] font-black uppercase text-zinc-600 tracking-widest">{d}</div>
                  ))}
                </div>

                {/* Days grid */}
                <div className="grid grid-cols-7">
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square md:aspect-auto md:h-24 border-b border-r border-white/5" />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1
                    const key = dateKey(viewYear, viewMonth, day)
                    const dayEvents = eventsForDay(key)
                    const hasEvent = dayEvents.length > 0
                    const isToday = key === todayKey
                    const colPos = (firstDay + i) % 7
                    const isLastCol = colPos === 6

                    return (
                      <div
                        key={key}
                        onClick={() => hasEvent && setModalEvent(dayEvents[0])}
                        className={`aspect-square md:aspect-auto md:h-24 border-b border-white/5 flex flex-col p-2 transition-all relative
                          ${!isLastCol ? 'border-r' : ''}
                          ${hasEvent ? 'cursor-pointer hover:bg-[#ff00ff]/5' : ''}
                        `}
                      >
                        <span className={`text-xs md:text-sm font-black w-7 h-7 flex items-center justify-center rounded-full transition-all
                          ${isToday ? 'bg-[#00f3ff] text-black' : hasEvent ? 'text-white' : 'text-zinc-600'}
                        `}>
                          {day}
                        </span>
                        {/* Event dots — desktop */}
                        <div className="mt-auto hidden md:flex flex-wrap gap-0.5">
                          {dayEvents.slice(0, 3).map((ev, idx) => (
                            <div key={idx} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ev.color }} />
                          ))}
                        </div>
                        {/* Mobile badge */}
                        {hasEvent && (
                          <div
                            className="md:hidden absolute top-1 right-1 w-4 h-4 rounded-full text-black text-[8px] font-black flex items-center justify-center"
                            style={{ backgroundColor: dayEvents[0].color }}
                          >
                            {dayEvents.length}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* UPCOMING EVENTS LIST */}
        {!loading && (() => {
          const upcoming = events.filter((e) => e.date >= todayKey).slice(0, 6)
          if (upcoming.length === 0) return null
          return (
            <section className="pb-16 md:pb-24 px-4 md:px-8">
              <div className="max-w-5xl mx-auto">
                <div className="flex items-center gap-6 mb-10">
                  <h2 className="text-3xl font-black uppercase tracking-tighter text-white">
                    Próximos <span className="text-[#ff00ff]">Eventos</span>
                  </h2>
                  <div className="h-px bg-zinc-800 flex-1" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {upcoming.map((ev) => (
                    <button
                      key={ev.id}
                      onClick={() => {
                        const [y, m] = ev.date.split('-').map(Number)
                        setViewYear(y); setViewMonth(m - 1)
                        setModalEvent(ev)
                      }}
                      className="text-left rounded-3xl border p-5 transition-all hover:scale-[1.02] cursor-pointer"
                      style={{ borderColor: `${ev.color}30`, background: `${ev.color}08` }}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 font-black"
                          style={{ backgroundColor: `${ev.color}20`, border: `1px solid ${ev.color}40` }}
                        >
                          <span className="text-[10px] uppercase tracking-widest" style={{ color: ev.color }}>
                            {MONTHS[parseInt(ev.date.split('-')[1]) - 1].slice(0, 3)}
                          </span>
                          <span className="text-xl leading-none text-white">{ev.date.split('-')[2]}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-black text-sm uppercase text-white tracking-tight mb-1 leading-tight truncate">{ev.title}</h3>
                          <p className="text-[11px] text-zinc-400 font-bold truncate">{ev.venue}</p>
                          <p className="text-[11px] text-zinc-600 font-bold">{ev.city}, {ev.state} · {ev.timeStart}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          )
        })()}
      </main>

      <Footer />

      {/* EVENT MODAL */}
      {modalEvent && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          onClick={closeModal}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

          {/* Card */}
          <div
            className="relative w-full max-w-lg bg-zinc-950 rounded-[32px] overflow-hidden border shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            style={{ borderColor: `${modalEvent.color}40` }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/30 transition-all cursor-pointer"
            >
              <Icon icon="lucide:x" />
            </button>

            {/* Cover image */}
            {modalEvent.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={modalEvent.imageUrl} alt={modalEvent.title} className="w-full h-52 object-cover" />
            ) : (
              <div
                className="w-full h-32 flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${modalEvent.color}20, ${modalEvent.color}05)` }}
              >
                <Icon icon="lucide:calendar-days" className="text-5xl opacity-30" style={{ color: modalEvent.color }} />
              </div>
            )}

            {/* Content */}
            <div className="p-6 md:p-8">
              {/* Date badge */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest"
                  style={{ backgroundColor: `${modalEvent.color}20`, color: modalEvent.color, border: `1px solid ${modalEvent.color}40` }}
                >
                  {new Date(modalEvent.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>

              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-white leading-tight mb-5">
                {modalEvent.title}
              </h2>

              <div className="space-y-3 text-sm font-bold">
                <div className="flex items-center gap-3 text-zinc-300">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${modalEvent.color}15` }}>
                    <Icon icon="lucide:clock" style={{ color: modalEvent.color }} />
                  </div>
                  <span>{modalEvent.timeStart}{modalEvent.timeEnd ? ` – ${modalEvent.timeEnd}` : ''}</span>
                </div>
                <div className="flex items-center gap-3 text-zinc-300">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${modalEvent.color}15` }}>
                    <Icon icon="lucide:map-pin" style={{ color: modalEvent.color }} />
                  </div>
                  <span>{modalEvent.venue} · {modalEvent.city}, {modalEvent.state}</span>
                </div>
                <div className="flex items-start gap-3 text-zinc-400">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: `${modalEvent.color}15` }}>
                    <Icon icon="lucide:navigation" style={{ color: modalEvent.color }} />
                  </div>
                  <span className="leading-relaxed">{modalEvent.address}</span>
                </div>
              </div>

              {modalEvent.description && (
                <p className="mt-5 pt-5 border-t border-white/5 text-zinc-500 text-sm font-bold leading-relaxed">
                  {modalEvent.description}
                </p>
              )}

              {(modalEvent.mapUrl || modalEvent.instagramUrl) && (
                <div className="mt-6 flex gap-3 flex-wrap">
                  {modalEvent.mapUrl && (
                    <a
                      href={modalEvent.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-black uppercase transition-all hover:scale-105"
                      style={{ backgroundColor: `${modalEvent.color}20`, color: modalEvent.color, border: `1px solid ${modalEvent.color}40` }}
                    >
                      <Icon icon="lucide:map" /> Ver no Mapa
                    </a>
                  )}
                  {modalEvent.instagramUrl && (
                    <a
                      href={modalEvent.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-black uppercase bg-zinc-800 text-zinc-300 border border-white/10 hover:border-white/30 transition-all hover:scale-105"
                    >
                      <Icon icon="mdi:instagram" /> Instagram
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
