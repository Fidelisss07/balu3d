import { NextRequest, NextResponse } from 'next/server'
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from '@/lib/uploadValidation'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const slideId = formData.get('slideId') as string | null

    if (!file || !slideId) {
      return NextResponse.json({ error: 'Arquivo ou slideId ausente' }, { status: 400 })
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
      return NextResponse.json({ error: 'Tipo inválido. Use JPG, PNG ou WebP.' }, { status: 400 })
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: 'Arquivo muito grande (máx 5MB).' }, { status: 400 })
    }
    if (file.size === 0) {
      return NextResponse.json({ error: 'Arquivo vazio.' }, { status: 400 })
    }

    const safeSlideId = slideId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64)
    if (!safeSlideId) {
      return NextResponse.json({ error: 'slideId inválido' }, { status: 400 })
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    if (!cloudName || !uploadPreset) {
      return NextResponse.json({ error: 'Cloudinary não configurado' }, { status: 500 })
    }

    const upload = new FormData()
    upload.append('file', file)
    upload.append('upload_preset', uploadPreset)
    upload.append('folder', 'balu3d/carousels')
    upload.append('public_id', `carousel-${safeSlideId}-${Date.now()}`)

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: upload,
    })

    if (!res.ok) {
      const err = await res.text()
      logger.error('Cloudinary error:', err)
      return NextResponse.json({ error: 'Erro no upload para Cloudinary' }, { status: 500 })
    }

    const data = await res.json()
    return NextResponse.json({ imageUrl: data.secure_url }, { status: 200 })
  } catch (error) {
    logger.error('Erro ao fazer upload:', error)
    return NextResponse.json({ error: 'Erro ao fazer upload' }, { status: 500 })
  }
}
