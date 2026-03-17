import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (accessToken) => {
        set({ accessToken })
        if (accessToken) localStorage.setItem('accessToken', accessToken)
        else localStorage.removeItem('accessToken')
      },
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => {
        set({ user: null, accessToken: null, isAuthenticated: false })
        localStorage.removeItem('accessToken')
      },
      updateUser: (updates) =>
        set((state) => ({ user: { ...state.user, ...updates } })),
    }),
    {
      name: 'ibento-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
