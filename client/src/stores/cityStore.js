import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCityStore = create(
  persist(
    (set) => ({
      city: 'Mumbai',
      setCity: (city) => set({ city }),
    }),
    { name: 'ibento-city' }
  )
)
