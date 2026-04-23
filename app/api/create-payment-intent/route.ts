import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const { amount, orderId } = await req.json()

    if (!amount || amount < 50) {
      return NextResponse.json({ error: 'Valor inválido' }, { status: 400 })
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // centavos
      currency: 'brl',
      payment_method_types: ['card'],
      metadata: { orderId: orderId ?? '' },
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (err) {
    console.error('create-payment-intent error:', err)
    return NextResponse.json({ error: 'Erro ao criar intenção de pagamento' }, { status: 500 })
  }
}
