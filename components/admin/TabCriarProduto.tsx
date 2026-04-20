'use client'

import { useState, useRef } from 'react'
import { Icon } from '@iconify/react'
import { addFirestoreProduct } from '@/lib/db'
import { validateImageFiles } from '@/lib/uploadValidation'

interface FirestoreProduct {
  id: string
  name: string
  slug: string
  price: number
  oldPrice?: number
  category: string
  img: string
  images?: string[]
  description: string
  stock: number
  height: string
  color: string
  badges: string[]
  sizes?: string[]
  visible: boolean
}

interface Props {
  onProductCreated: (product: FirestoreProduct) => void
}

function toSlug(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

async function uploadToCloudinary(file: File, onProgress?: (pct: number) => void): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!)
  formData.append('folder', 'balu3d')
  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round(e.loaded / e.total * 100))
    }
    xhr.onload = () => {
      if (xhr.status === 200) resolve(JSON.parse(xhr.responseText).secure_url)
      else reject(new Error(xhr.responseText))
    }
    xhr.onerror = () => reject(new Error('Falha na conexão com Cloudinary'))
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`)
    xhr.send(formData)
  })
}

const emptyForm = { name: '', price: '', oldPrice: '', category: 'Classic', img: '', description: '', stock: '', height: '', color: '#00f3ff', badges: '', sizes: '', visible: true }

export default function TabCriarProduto({ onProductCreated }: Props) {
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [formSuccess, setFormSuccess] = useState(false)
  const [imgFiles, setImgFiles] = useState<File[]>([])
  const [imgPreviews, setImgPreviews] = useState<string[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [previewSlide, setPreviewSlide] = useState(0)
  const imgInputRef = useRef<HTMLInputElement>(null)

  function fmt(n: number) {
    return `R$ ${n.toFixed(2).replace('.', ',')}`
  }

  async function handleCreateProduct() {
    setFormError('')
    const slug = toSlug(form.name)
    if (!form.name || !form.price || !form.stock) {
      setFormError('Preencha: nome, preço e stock.')
      return
    }
    if (imgFiles.length === 0) {
      setFormError('Selecione pelo menos uma imagem para o produto.')
      return
    }
    setFormLoading(true)
    try {
      const imgUrls: string[] = []
      for (let i = 0; i < imgFiles.length; i++) {
        const url = await uploadToCloudinary(imgFiles[i], (pct) =>
          setUploadProgress(Math.round((i / imgFiles.length) * 100 + pct / imgFiles.length))
        )
        imgUrls.push(url)
      }
      const newProduct = {
        name: form.name.trim(),
        slug,
        price: parseFloat(form.price),
        oldPrice: form.oldPrice ? parseFloat(form.oldPrice) : undefined,
        category: form.category,
        img: imgUrls[0],
        images: imgUrls,
        description: form.description.trim(),
        stock: parseInt(form.stock),
        height: form.height.trim(),
        color: form.color,
        badges: form.badges.split(',').map((b) => b.trim()).filter(Boolean),
        sizes: form.sizes.split(',').map((s) => s.trim()).filter(Boolean),
        visible: form.visible,
      }
      const id = await addFirestoreProduct(newProduct)
      onProductCreated({ id, ...newProduct } as FirestoreProduct)
      setForm(emptyForm)
      setImgFiles([])
      setImgPreviews([])
      setPreviewSlide(0)
      setUploadProgress(0)
      setFormSuccess(true)
      setTimeout(() => setFormSuccess(false), 3000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setFormError(`Erro ao criar produto: ${msg}`)
    } finally {
      setFormLoading(false)
      setUploadProgress(0)
    }
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-white">Criar <span className="text-[#00f3ff]">Produto</span></h1>
        <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mt-1">Novo produto adicionado ao Firestore</p>
      </div>

      <div className="grid xl:grid-cols-2 gap-8 items-start">
        {/* Form */}
        <div className="bg-black border border-zinc-800 rounded-[32px] p-8 space-y-6">
          {formSuccess && (
            <div className="flex items-center gap-3 p-4 bg-[#00ff00]/10 border border-[#00ff00]/30 rounded-2xl">
              <Icon icon="lucide:check-circle" className="text-[#00ff00] text-xl flex-shrink-0" />
              <p className="text-sm font-black text-[#00ff00]">Produto criado com sucesso!</p>
            </div>
          )}
          {formError && (
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl">
              <Icon icon="lucide:alert-circle" className="text-red-400 text-xl flex-shrink-0" />
              <p className="text-sm font-black text-red-400">{formError}</p>
            </div>
          )}

          {/* Nome */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block mb-2">Nome *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Kratos God of War"
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-[#00f3ff] placeholder:text-zinc-600" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block mb-2">Slug (automático)</label>
              <div className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-zinc-500 select-none">
                {form.name ? toSlug(form.name) : <span className="text-zinc-700">kratos-god-of-war</span>}
              </div>
            </div>
          </div>

          {/* Preços */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block mb-2">Preço (R$) *</label>
              <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="Ex: 89.90"
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-[#00f3ff] placeholder:text-zinc-600" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block mb-2">Preço Antigo</label>
              <input type="number" value={form.oldPrice} onChange={(e) => setForm({ ...form, oldPrice: e.target.value })}
                placeholder="Ex: 120.00"
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-[#00f3ff] placeholder:text-zinc-600" />
            </div>
          </div>

          {/* Categoria + Stock + Altura */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block mb-2">Categoria</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-[#00f3ff] cursor-pointer">
                {['Classic', 'Legendary', 'Shiny', 'Limited'].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block mb-2">Stock *</label>
              <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}
                placeholder="Ex: 10"
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-[#00f3ff] placeholder:text-zinc-600" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block mb-2">Altura</label>
              <input value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })}
                placeholder="Ex: 22cm"
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-[#00f3ff] placeholder:text-zinc-600" />
            </div>
          </div>

          {/* Tamanhos */}
          <div>
            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block mb-2">
              Tamanhos <span className="text-zinc-700 normal-case font-bold">(separados por vírgula)</span>
            </label>
            <div className="flex gap-2 mb-2 flex-wrap">
              {['P', 'M', 'G', 'GG'].map((s) => (
                <button key={s} type="button"
                  onClick={() => {
                    const current = form.sizes.split(',').map((x) => x.trim()).filter(Boolean)
                    const next = current.includes(s)
                      ? current.filter((x) => x !== s).join(', ')
                      : [...current, s].join(', ')
                    setForm({ ...form, sizes: next })
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all cursor-pointer border ${
                    form.sizes.split(',').map((x) => x.trim()).includes(s)
                      ? 'bg-[#00f3ff] text-black border-[#00f3ff]'
                      : 'bg-zinc-900 text-zinc-400 border-white/10 hover:border-[#00f3ff]/50'
                  }`}
                >{s}</button>
              ))}
            </div>
            <input value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })}
              placeholder="Ex: P, M, G, GG  ou  10cm, 15cm, 20cm"
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-[#00f3ff] placeholder:text-zinc-600" />
          </div>

          {/* Cor + Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block mb-2">Cor Neon</label>
              <div className="flex gap-3">
                <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="w-12 h-12 rounded-xl border border-white/10 bg-zinc-900 cursor-pointer" />
                <input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-[#00f3ff]" />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block mb-2">Badges (vírgula)</label>
              <input value={form.badges} onChange={(e) => setForm({ ...form, badges: e.target.value })}
                placeholder="Ex: Classic, Best Seller"
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-[#00f3ff] placeholder:text-zinc-600" />
            </div>
          </div>

          {/* Upload imagens */}
          <div>
            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block mb-2">
              Imagens * <span className="text-zinc-700 normal-case font-bold">(até 10 fotos)</span>
            </label>
            <input ref={imgInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []).slice(0, 10)
                if (!files.length) return
                const res = validateImageFiles(files)
                if (!res.ok) {
                  setFormError(res.error)
                  if (imgInputRef.current) imgInputRef.current.value = ''
                  return
                }
                setFormError('')
                setImgFiles((prev) => [...prev, ...files].slice(0, 10))
                const newPreviews = files.map((f) => URL.createObjectURL(f))
                setImgPreviews((prev) => [...prev, ...newPreviews].slice(0, 10))
                setPreviewSlide(0)
              }} />
            {imgPreviews.length > 0 ? (
              <div>
                <div className="flex gap-2 mb-3 flex-wrap">
                  {imgPreviews.map((src, i) => (
                    <div key={i} className="relative group">
                      <button onClick={() => setPreviewSlide(i)}
                        className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${previewSlide === i ? 'border-[#00f3ff]' : 'border-white/10 hover:border-white/30'}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt="" className="w-full h-full object-cover" />
                      </button>
                      <button
                        onClick={() => {
                          const newFiles = imgFiles.filter((_, idx) => idx !== i)
                          const newPrevs = imgPreviews.filter((_, idx) => idx !== i)
                          setImgFiles(newFiles); setImgPreviews(newPrevs)
                          setPreviewSlide(Math.min(previewSlide, newPrevs.length - 1))
                        }}
                        className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[8px] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >✕</button>
                    </div>
                  ))}
                  {imgPreviews.length < 10 && (
                    <button onClick={() => imgInputRef.current?.click()}
                      className="w-16 h-16 rounded-xl border-2 border-dashed border-zinc-700 hover:border-[#00f3ff]/50 flex items-center justify-center text-zinc-600 hover:text-[#00f3ff] transition-all cursor-pointer">
                      <Icon icon="lucide:plus" className="text-xl" />
                    </button>
                  )}
                </div>
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="w-full bg-zinc-800 rounded-full h-1 mb-3">
                    <div className="bg-[#00f3ff] h-1 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => imgInputRef.current?.click()}
                className="w-full border-2 border-dashed border-zinc-700 hover:border-[#00f3ff]/50 rounded-xl p-8 text-center transition-all cursor-pointer group">
                <Icon icon="lucide:images" className="text-3xl text-zinc-600 group-hover:text-[#00f3ff] mx-auto mb-2 transition-colors" />
                <p className="text-xs font-black uppercase text-zinc-600 group-hover:text-[#00f3ff] transition-colors">Clique para selecionar imagens</p>
                <p className="text-[10px] text-zinc-700 mt-1">PNG, JPG, WebP — até 10 fotos</p>
              </button>
            )}
          </div>

          {/* Descrição */}
          <div>
            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block mb-2">Descrição</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Descreva o produto..." rows={3}
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-[#00f3ff] placeholder:text-zinc-600 resize-none" />
          </div>

          {/* Visível */}
          <div className="flex items-center gap-3">
            <button onClick={() => setForm({ ...form, visible: !form.visible })}
              className={`w-10 h-6 rounded-full transition-all relative cursor-pointer ${form.visible ? 'bg-[#00f3ff]' : 'bg-zinc-700'}`}>
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form.visible ? 'left-5' : 'left-1'}`} />
            </button>
            <span className="text-sm font-bold text-zinc-400">Visível na loja imediatamente</span>
          </div>

          {/* Botões */}
          <div className="flex gap-4 pt-2">
            <button
              onClick={() => { setForm(emptyForm); setImgFiles([]); setImgPreviews([]); setPreviewSlide(0); setUploadProgress(0); if (imgInputRef.current) imgInputRef.current.value = '' }}
              className="flex-1 py-4 border border-zinc-700 rounded-2xl text-xs font-black text-zinc-400 hover:text-white hover:border-zinc-500 transition-all cursor-pointer uppercase">
              Limpar
            </button>
            <button onClick={handleCreateProduct} disabled={formLoading}
              className="flex-1 py-4 bg-[#00f3ff] text-black text-xs font-black uppercase rounded-2xl hover:bg-[#00d4e0] transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2">
              {formLoading ? (
                <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Criando...</>
              ) : (
                <><Icon icon="lucide:plus" /> Criar Produto</>
              )}
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="sticky top-24">
          <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-4">Preview da Página do Produto</p>
          <div className="bg-[#0a0a0a] border border-zinc-800 rounded-[32px] overflow-hidden">
            <div className="relative aspect-square bg-zinc-900 overflow-hidden">
              {imgPreviews.length > 0 ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imgPreviews[previewSlide]} alt="" className="w-full h-full object-cover" />
                  {imgPreviews.length > 1 && (
                    <>
                      <button onClick={() => setPreviewSlide((p) => (p - 1 + imgPreviews.length) % imgPreviews.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 backdrop-blur flex items-center justify-center text-white hover:bg-black/80 transition-all cursor-pointer">
                        <Icon icon="lucide:chevron-left" />
                      </button>
                      <button onClick={() => setPreviewSlide((p) => (p + 1) % imgPreviews.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 backdrop-blur flex items-center justify-center text-white hover:bg-black/80 transition-all cursor-pointer">
                        <Icon icon="lucide:chevron-right" />
                      </button>
                      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                        {imgPreviews.map((_, i) => (
                          <button key={i} onClick={() => setPreviewSlide(i)}
                            className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${i === previewSlide ? 'bg-white scale-125' : 'bg-white/40'}`} />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Icon icon="lucide:image" className="text-5xl text-zinc-700" />
                </div>
              )}
              {form.badges && (
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {form.badges.split(',').slice(0, 2).map((b, i) => b.trim() && (
                    <span key={i} className={`px-3 py-1 text-[10px] font-black uppercase rounded-full ${i === 0 ? 'bg-[#00f3ff] text-black' : 'bg-[#ff00ff] text-white'}`}>{b.trim()}</span>
                  ))}
                </div>
              )}
            </div>

            {imgPreviews.length > 1 && (
              <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar">
                {imgPreviews.map((src, i) => (
                  <button key={i} onClick={() => setPreviewSlide(i)}
                    className={`flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${i === previewSlide ? 'border-[#00f3ff]' : 'border-white/10'}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="p-5">
              <span className="inline-block px-3 py-1 bg-zinc-800 text-zinc-400 text-[10px] font-black uppercase rounded-full mb-3">{form.category}</span>
              <h3 className="text-2xl font-black uppercase leading-tight tracking-tighter mb-3 text-white">
                {form.name ? (
                  form.name.split(' ').length > 1 ? (
                    <>{form.name.split(' ')[0]}{' '}<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] to-[#ff00ff]">{form.name.split(' ').slice(1).join(' ')}</span></>
                  ) : (
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] to-[#ff00ff]">{form.name}</span>
                  )
                ) : <span className="text-zinc-600">Nome do Produto</span>}
              </h3>
              <div className="flex items-baseline gap-2 mb-3">
                <p className="text-xl font-black" style={{ color: form.color || '#00f3ff' }}>
                  {form.price ? fmt(parseFloat(form.price)) : 'R$ 0,00'}
                </p>
                {form.oldPrice && (
                  <p className="text-xs text-zinc-600 line-through">R$ {parseFloat(form.oldPrice).toFixed(2).replace('.', ',')}</p>
                )}
              </div>
              {form.description && <p className="text-xs text-zinc-400 leading-relaxed mb-3">{form.description}</p>}
              {form.height && <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-3">Altura: {form.height} · Impressão 3D em resina</p>}
              {form.sizes && form.sizes.split(',').filter(Boolean).length > 0 && (
                <div className="mb-3">
                  <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-2">Tamanho</p>
                  <div className="flex gap-2 flex-wrap">
                    {form.sizes.split(',').map((s) => s.trim()).filter(Boolean).map((s) => (
                      <span key={s} className="px-3 py-1.5 rounded-xl text-xs font-black uppercase bg-zinc-800 text-zinc-300 border border-white/10">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="h-10 rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase text-black" style={{ background: form.color || '#00f3ff' }}>
                <Icon icon="lucide:shopping-bag" /> Adicionar ao Carrinho
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
