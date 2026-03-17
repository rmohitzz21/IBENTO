import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      totalAmount: 0,

      addItem: (service) => {
        const existing = get().items.find((i) => i.serviceId === service._id)
        if (existing) return
        const newItems = [
          ...get().items,
          {
            serviceId: service._id,
            vendorId: service.vendorId,
            service,
            quantity: 1,
            addOns: [],
          },
        ]
        set({
          items: newItems,
          totalAmount: newItems.reduce(
            (sum, i) => sum + i.service.price * i.quantity,
            0
          ),
        })
      },

      removeItem: (serviceId) => {
        const newItems = get().items.filter((i) => i.serviceId !== serviceId)
        set({
          items: newItems,
          totalAmount: newItems.reduce(
            (sum, i) => sum + i.service.price * i.quantity,
            0
          ),
        })
      },

      clearCart: () => set({ items: [], totalAmount: 0 }),

      itemCount: () => get().items.length,
    }),
    { name: 'ibento-cart' }
  )
)
