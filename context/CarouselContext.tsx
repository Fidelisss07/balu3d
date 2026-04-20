'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getCarousel, updateCarousel, type Carousel } from '@/lib/db'
import { logger } from '@/lib/logger'

interface CarouselContextType {
  carousel: Carousel | null
  loading: boolean
  updateSlide: (slideId: number, data: Partial<Carousel['slides'][0]>) => Promise<void>
}

const CarouselContext = createContext<CarouselContextType>({
  carousel: null,
  loading: true,
  updateSlide: async () => {},
})

export function CarouselProvider({ children }: { children: ReactNode }) {
  const [carousel, setCarousel] = useState<Carousel | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)

        const data = await Promise.race([
          getCarousel(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout carregando carrossel')), 5000)
          )
        ]) as Carousel

        clearTimeout(timeoutId)
        setCarousel(data)
      } catch (err) {
        logger.error('Erro ao carregar carrossel:', err)
        // Fallback: usar valores padrão
        setCarousel({
          slides: [
            { id: 0, title: 'CHARIZARD', subtitle: 'UNBOUND', image: '', bgColor: '#1a1a1a', textColor: '#00f3ff', accentColor: '#ff6b35' },
            { id: 1, title: 'DRAGONITE', subtitle: 'LEGENDARY', image: '', bgColor: '#1a1a1a', textColor: '#00f3ff', accentColor: '#4a90e2' },
            { id: 2, title: 'MEWTWO', subtitle: 'MYTHICAL', image: '', bgColor: '#1a1a1a', textColor: '#00f3ff', accentColor: '#a855f7' },
          ],
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const updateSlide = async (slideId: number, data: Partial<Carousel['slides'][0]>) => {
    if (!carousel) return

    const updatedSlides = carousel.slides.map((slide) =>
      slide.id === slideId ? { ...slide, ...data } : slide
    )

    const updated = { ...carousel, slides: updatedSlides }
    setCarousel(updated)

    try {
      await updateCarousel(updated)
    } catch (err) {
      logger.error('Erro ao atualizar carrossel:', err)
    }
  }

  return (
    <CarouselContext.Provider value={{ carousel, loading, updateSlide }}>
      {children}
    </CarouselContext.Provider>
  )
}

export function useCarousel() {
  return useContext(CarouselContext)
}
