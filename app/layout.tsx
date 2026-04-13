import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Balu 3D | Pokémon Printverso',
  description: 'Colecionáveis 3D de luxo em resina 8K — figuras Pokémon, Geek e Gamer.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
