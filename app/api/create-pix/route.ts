import { NextRequest, NextResponse } from 'next/server'

const INFINITEPAY_API_URL = 'https://api.infinitepay.io/v2'

async function getInfinitePayToken(): Promise<string> {
  const res = await fetch(`${INFINITEPAY_API_URL}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.INFINITEPAY_CLIENT_ID,
      client_secret: process.env.INFINITEPAY_CLIENT_SECRET,
      grant_type: 'client_credentials',
    }),
  })
  if (!res.ok) throw new Error('Falha ao autenticar com InfinitePay')
  const data = await res.json()
  return data.access_token
}

export async function POST(req: NextRequest) {
  try {
    const { amount, orderId } = await req.json()

    if (!amount || amount < 0.5) {
      return NextResponse.json({ error: 'Valor inválido' }, { status: 400 })
    }

    if (!process.env.INFINITEPAY_CLIENT_ID || !process.env.INFINITEPAY_CLIENT_SECRET) {
      return NextResponse.json({ error: 'InfinitePay não configurado' }, { status: 500 })
    }

    const token = await getInfinitePayToken()

    const amountInCents = Math.round(amount * 100)

    const res = await fetch(`${INFINITEPAY_API_URL}/charges`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        amount: amountInCents,
        payment_method: 'pix',
        order_id: orderId ?? '',
        // Webhook configurado no painel InfinitePay
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      console.error('InfinitePay error:', err)
      throw new Error(err?.message ?? 'Erro ao criar cobrança PIX')
    }

    const data = await res.json()

    // InfinitePay retorna pix_qr_code (texto) e pix_qr_code_url (imagem)
    // Campos exatos podem variar — ajustar após testar com credenciais reais
    return NextResponse.json({
      paymentId: data.id ?? data.charge_id ?? null,
      qrCode: data.pix_qr_code_url ?? data.qr_code_url ?? null,
      qrCodeText: data.pix_qr_code ?? data.qr_code ?? null,
      expiresAt: data.expires_at ?? null,
    })
  } catch (err) {
    console.error('create-pix error:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erro ao gerar PIX' }, { status: 500 })
  }
}
