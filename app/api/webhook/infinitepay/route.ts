import { NextRequest, NextResponse } from 'next/server'
import { updateOrderStatus } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // InfinitePay envia o status da cobrança via webhook
    // Campos exatos ajustar após receber primeiro evento real
    const status: string = body?.charge?.status ?? body?.status ?? ''
    const orderId: string = body?.charge?.order_id ?? body?.order_id ?? ''

    if (!orderId) {
      return NextResponse.json({ error: 'orderId ausente' }, { status: 400 })
    }

    if (status === 'paid' || status === 'approved' || status === 'succeeded') {
      await updateOrderStatus(orderId, 'confirmado').catch(console.error)
    }

    if (status === 'failed' || status === 'cancelled' || status === 'expired') {
      await updateOrderStatus(orderId, 'cancelado').catch(console.error)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('InfinitePay webhook error:', err)
    return NextResponse.json({ error: 'Erro no webhook' }, { status: 500 })
  }
}
