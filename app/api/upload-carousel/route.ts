import { NextRequest, NextResponse } from 'next/server'
import { storage } from '@/lib/firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const slideId = formData.get('slideId') as string

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    // Converte arquivo para buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Cria referência no Firebase Storage
    const timestamp = Date.now()
    const filename = `carousel-${slideId}-${timestamp}.${file.name.split('.').pop()}`
    const storageRef = ref(storage, `carousels/${filename}`)

    // Faz upload
    await uploadBytes(storageRef, buffer, {
      contentType: file.type,
    })

    // Obtém URL pública
    const imageUrl = await getDownloadURL(storageRef)

    return NextResponse.json({ imageUrl }, { status: 200 })
  } catch (error) {
    console.error('Erro ao fazer upload:', error)
    return NextResponse.json({ error: 'Erro ao fazer upload' }, { status: 500 })
  }
}
