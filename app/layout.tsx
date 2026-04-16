import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'
import { CarouselProvider } from '@/context/CarouselContext'

export const metadata: Metadata = {
  title: 'Balu 3D | Impressões 3D Geek & Gamer',
  description: 'Colecionáveis 3D de luxo em resina 8K — figuras Geek, Gamer e Pokémon.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          <CartProvider>
            <CarouselProvider>
              {children}
            </CarouselProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
