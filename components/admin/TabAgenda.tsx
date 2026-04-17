'use client'

import { Icon } from '@iconify/react'
import { type AgendaEvent } from '@/lib/db'

interface Props {
  agendaEvents: AgendaEvent[]
  agendaLoading: boolean
  agendaSaving: boolean
  deletingEvent: string | null
  agendaMsg: string
  editingEvent: AgendaEvent | null
  eventForm: Omit<AgendaEvent, 'id' | 'createdAt'>
  setEditingEvent: (ev: AgendaEvent | null) => void
  setEventForm: (fn: (prev: Omit<AgendaEvent, 'id' | 'createdAt'>) => Omit<AgendaEvent, 'id' | 'createdAt'>) => void
  onSave: () => void
  onDelete: (id: string) => void
}

export default function TabAgenda({
  agendaEvents, agendaLoading, agendaSaving, deletingEvent, agendaMsg,
  editingEvent, eventForm, setEditingEvent, setEventForm, onSave, onDelete,
}: Props) {
  const form = editingEvent ?? eventForm
  const setForm = editingEvent
    ? (patch: Partial<AgendaEvent>) => setEditingEvent({ ...editingEvent, ...patch })
    : (patch: Partial<AgendaEvent>) => setEventForm((prev) => ({ ...prev, ...patch }))

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-white">
          Agenda <span className="text-[#ff00ff]">de Eventos</span>
        </h1>
        <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mt-1">Gerencie eventos e feiras presenciais</p>
      </div>

      {/* Form */}
      <div className="bg-black border border-zinc-800 rounded-[32px] p-8 mb-8">
        <h2 className="text-lg font-black uppercase text-white mb-6 flex items-center gap-2">
          <Icon icon={editingEvent ? 'lucide:edit' : 'lucide:plus-circle'} className="text-[#ff00ff]" />
          {editingEvent ? 'Editar Evento' : 'Novo Evento'}
          {editingEvent && (
            <button onClick={() => setEditingEvent(null)} className="ml-auto text-zinc-500 hover:text-white transition-all text-sm cursor-pointer">
              <Icon icon="lucide:x" />
            </button>
          )}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1 block">Título do Evento *</label>
            <input value={form.title} onChange={(e) => setForm({ title: e.target.value })}
              placeholder="Ex: Shopping Boulevard — Feira Nerd"
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ff00ff] placeholder:text-zinc-600" />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1 block">Data *</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ date: e.target.value })}
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ff00ff]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1 block">Início *</label>
              <input type="time" value={form.timeStart} onChange={(e) => setForm({ timeStart: e.target.value })}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ff00ff]" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1 block">Fim</label>
              <input type="time" value={form.timeEnd ?? ''} onChange={(e) => setForm({ timeEnd: e.target.value })}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ff00ff]" />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1 block">Local / Venue *</label>
            <input value={form.venue} onChange={(e) => setForm({ venue: e.target.value })}
              placeholder="Ex: Shopping Boulevard"
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ff00ff] placeholder:text-zinc-600" />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1 block">Endereço</label>
            <input value={form.address} onChange={(e) => setForm({ address: e.target.value })}
              placeholder="Ex: Av. das Flores, 123"
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ff00ff] placeholder:text-zinc-600" />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1 block">Cidade *</label>
            <input value={form.city} onChange={(e) => setForm({ city: e.target.value })}
              placeholder="Ex: São Paulo"
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ff00ff] placeholder:text-zinc-600" />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1 block">Estado</label>
            <input value={form.state} onChange={(e) => setForm({ state: e.target.value })}
              placeholder="Ex: SP"
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ff00ff] placeholder:text-zinc-600" />
          </div>
          <div className="md:col-span-2">
            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1 block">Descrição</label>
            <textarea value={form.description ?? ''} onChange={(e) => setForm({ description: e.target.value })}
              rows={3} placeholder="Informações adicionais sobre o evento..."
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ff00ff] placeholder:text-zinc-600 resize-none" />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1 block">URL da Imagem</label>
            <input value={form.imageUrl ?? ''} onChange={(e) => setForm({ imageUrl: e.target.value })}
              placeholder="https://..."
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ff00ff] placeholder:text-zinc-600" />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1 block">Link Google Maps</label>
            <input value={form.mapUrl ?? ''} onChange={(e) => setForm({ mapUrl: e.target.value })}
              placeholder="https://maps.google.com/..."
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ff00ff] placeholder:text-zinc-600" />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1 block">Instagram do Evento</label>
            <input value={form.instagramUrl ?? ''} onChange={(e) => setForm({ instagramUrl: e.target.value })}
              placeholder="https://instagram.com/..."
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ff00ff] placeholder:text-zinc-600" />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1 block">Cor do Evento</label>
            <div className="flex gap-2 items-center mt-1">
              {['#ff00ff', '#00f3ff', '#00ff00', '#f7c948', '#ff4444'].map((c) => (
                <button
                  key={c}
                  onClick={() => setForm({ color: c })}
                  className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer ${form.color === c ? 'scale-125 border-white' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        {agendaMsg && (
          <p className={`text-xs font-bold mt-4 ${agendaMsg.includes('Preencha') ? 'text-red-400' : 'text-[#00ff00]'}`}>{agendaMsg}</p>
        )}
        <div className="mt-6">
          <button onClick={onSave} disabled={agendaSaving}
            className="px-8 py-4 bg-[#ff00ff] text-black font-black uppercase rounded-2xl hover:bg-[#d400d4] transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed flex items-center gap-2">
            {agendaSaving ? (
              <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Salvando...</>
            ) : (
              <><Icon icon="lucide:save" /> {editingEvent ? 'Atualizar Evento' : 'Criar Evento'}</>
            )}
          </button>
        </div>
      </div>

      {/* Lista */}
      <div className="bg-black border border-zinc-800 rounded-[32px] p-8">
        <h2 className="text-lg font-black uppercase text-white mb-6">Todos os Eventos ({agendaEvents.length})</h2>
        {agendaLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-[#ff00ff] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : agendaEvents.length === 0 ? (
          <p className="text-zinc-600 font-bold text-sm text-center py-8">Nenhum evento cadastrado ainda.</p>
        ) : (
          <div className="space-y-4">
            {agendaEvents.map((ev) => (
              <div key={ev.id} className="flex items-center gap-4 p-4 bg-zinc-900/50 border border-white/5 rounded-2xl hover:border-white/10 transition-all">
                <div
                  className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 font-black text-center"
                  style={{ backgroundColor: `${ev.color}20`, border: `1px solid ${ev.color}40` }}
                >
                  <span className="text-[9px] uppercase tracking-wider" style={{ color: ev.color }}>
                    {ev.date.split('-')[1]}/{ev.date.split('-')[0].slice(2)}
                  </span>
                  <span className="text-lg leading-tight text-white">{ev.date.split('-')[2]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-white truncate">{ev.title}</p>
                  <p className="text-xs text-zinc-400 font-bold">{ev.venue} · {ev.city}, {ev.state}</p>
                  <p className="text-[10px] text-zinc-600">{ev.timeStart}{ev.timeEnd ? ` – ${ev.timeEnd}` : ''}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => setEditingEvent(ev)} className="p-2 text-zinc-500 hover:text-[#00f3ff] transition-colors cursor-pointer">
                    <Icon icon="lucide:edit" />
                  </button>
                  <button
                    onClick={() => onDelete(ev.id!)}
                    disabled={deletingEvent === ev.id}
                    className="p-2 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {deletingEvent === ev.id
                      ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                      : <Icon icon="lucide:trash-2" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
