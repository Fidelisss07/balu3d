'use client'

import { useState } from 'react'
import { Icon } from '@iconify/react'
import { useCarousel } from '@/context/CarouselContext'
import { validateImageFile } from '@/lib/uploadValidation'
import { logger } from '@/lib/logger'

export function AdminCarouselEditor() {
  const { carousel, updateSlide } = useCarousel()
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  if (!carousel) return <div>Carregando...</div>

  const handleImageUpload = async (slideId: number, file: File) => {
    if (!file) return

    const validation = validateImageFile(file)
    if (!validation.ok) {
      setMessage(`✗ ${validation.error}`)
      setTimeout(() => setMessage(''), 3000)
      return
    }

    setUploading(true)
    setMessage('Enviando imagem...')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('slideId', slideId.toString())

      const response = await fetch('/api/upload-carousel', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Erro ao fazer upload')

      const { imageUrl } = await response.json()
      await updateSlide(slideId, { image: imageUrl })
      setMessage('✓ Imagem enviada com sucesso!')

      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      logger.error('Erro:', error)
      setMessage('✗ Erro ao enviar imagem')
      setTimeout(() => setMessage(''), 3000)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h2 className="text-3xl font-black uppercase tracking-tight mb-2">Editar Carrosséis</h2>
        <p className="text-zinc-400 text-sm">Personalize os 3 banners principais da homepage</p>
      </div>

      {/* Mensagem de feedback */}
      {message && (
        <div className={`p-4 rounded-xl text-sm font-bold ${message.includes('✓') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {message}
        </div>
      )}

      {/* Grid dos 3 slides */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {carousel.slides.map((slide) => (
          <div key={slide.id} className="bg-black/40 border border-white/10 rounded-3xl p-6 space-y-6">
            {/* Cabeçalho do slide */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center font-black text-lg">{slide.id + 1}</div>
              <span className="font-bold uppercase text-zinc-400 text-sm">Slide {slide.id + 1}</span>
            </div>

            {/* Preview da imagem */}
            <div className="relative w-full aspect-video bg-zinc-900 rounded-2xl overflow-hidden border-2 border-white/5 group">
              {slide.image ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={slide.image} alt={`Slide ${slide.id + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-[#00f3ff] text-black rounded-lg font-black text-sm hover:bg-[#00f3ff]/80 transition">
                      <Icon icon="lucide:upload" />
                      Trocar
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleImageUpload(slide.id, e.target.files[0])}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                </>
              ) : (
                <label className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-white/5 transition">
                  <div className="text-center">
                    <Icon icon="lucide:image" className="text-4xl text-zinc-600 mx-auto mb-2" />
                    <p className="text-xs font-bold text-zinc-500 uppercase">Clique para enviar</p>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleImageUpload(slide.id, e.target.files[0])}
                      disabled={uploading}
                    />
                  </div>
                </label>
              )}
            </div>

            {/* Inputs de texto */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-2">Título</label>
                <input
                  type="text"
                  value={slide.title}
                  onChange={(e) => updateSlide(slide.id, { title: e.target.value })}
                  placeholder="Ex: CHARIZARD"
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white font-bold focus:outline-none focus:border-[#00f3ff] transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-2">Subtítulo</label>
                <input
                  type="text"
                  value={slide.subtitle}
                  onChange={(e) => updateSlide(slide.id, { subtitle: e.target.value })}
                  placeholder="Ex: UNBOUND"
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white font-bold focus:outline-none focus:border-[#00f3ff] transition"
                />
              </div>
            </div>

            {/* Color Pickers */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-2">Cor de Fundo</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={slide.bgColor}
                    onChange={(e) => updateSlide(slide.id, { bgColor: e.target.value })}
                    className="w-14 h-10 rounded-lg border border-white/10 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={slide.bgColor}
                    onChange={(e) => updateSlide(slide.id, { bgColor: e.target.value })}
                    className="flex-1 bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#00f3ff] transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-2">Cor do Texto</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={slide.textColor}
                    onChange={(e) => updateSlide(slide.id, { textColor: e.target.value })}
                    className="w-14 h-10 rounded-lg border border-white/10 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={slide.textColor}
                    onChange={(e) => updateSlide(slide.id, { textColor: e.target.value })}
                    className="flex-1 bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#00f3ff] transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-2">Cor Destaque</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={slide.accentColor}
                    onChange={(e) => updateSlide(slide.id, { accentColor: e.target.value })}
                    className="w-14 h-10 rounded-lg border border-white/10 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={slide.accentColor}
                    onChange={(e) => updateSlide(slide.id, { accentColor: e.target.value })}
                    className="flex-1 bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#00f3ff] transition"
                  />
                </div>
              </div>
            </div>

            {/* Preview ao vivo */}
            <div className="border-t border-white/10 pt-4">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Preview</p>
              <div
                className="rounded-xl p-4 text-center space-y-2 overflow-hidden"
                style={{ backgroundColor: slide.bgColor }}
              >
                <h3 className="font-black text-2xl truncate" style={{ color: slide.textColor }}>
                  {slide.title || 'TÍTULO'}
                </h3>
                <p className="text-xs font-bold truncate" style={{ color: slide.accentColor }}>
                  {slide.subtitle || 'SUBTÍTULO'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
