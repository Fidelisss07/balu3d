import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { updateOrderStatus } from '@/lib/db'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Sem assinatura' }, { status: 400 })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Assinatura inválida' }, { status: 400 })
  }

  const orderId = (event.data.object as { metadata?: { orderId?: string } }).metadata?.orderId

  if (event.type === 'payment_intent.succeeded') {
    if (orderId) {
      await updateOrderStatus(orderId, 'confirmado').catch(console.error)
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    if (orderId) {
      await updateOrderStatus(orderId, 'cancelado').catch(console.error)
    }
  }

  return NextResponse.json({ received: true })
}
