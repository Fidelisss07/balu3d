'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getCarousel, updateCarousel, type Carousel } from '@/lib/db'

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
        const data = await getCarousel()
        setCarousel(data)
      } catch (err) {
        console.error('Erro ao carregar carrossel:', err)
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
      console.error('Erro ao atualizar carrossel:', err)
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
