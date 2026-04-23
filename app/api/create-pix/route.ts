import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const { amount, orderId } = await req.json()

    if (!amount || amount < 0.5) {
      return NextResponse.json({ error: 'Valor inválido' }, { status: 400 })
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'brl',
      payment_method_types: ['pix'],
      payment_method_data: { type: 'pix' },
      confirm: true,
      metadata: { orderId: orderId ?? '' },
    })

    const pixData = paymentIntent.next_action?.pix_display_qr_code

    return NextResponse.json({
      paymentIntentId: paymentIntent.id,
      qrCode: pixData?.image_url_svg ?? pixData?.image_url_png ?? null,
      qrCodeText: pixData?.data ?? null,
      expiresAt: pixData?.expires_at ?? null,
    })
  } catch (err) {
    console.error('create-pix error:', err)
    return NextResponse.json({ error: 'Erro ao gerar PIX' }, { status: 500 })
  }
}
