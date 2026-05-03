import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Lang, CartItem, Extra } from '../types'
import { menuItems } from '../mockData'

interface AppState {
  lang: Lang
  langSelected: boolean
  tableId: string | null
  setLang: (lang: Lang) => void
  setLangSelected: (v: boolean) => void
  setTableId: (id: string) => void

  // Cart
  cartItems: CartItem[]
  addToCart: (menuItemId: string, extras: Extra[], notes: string, quantity: number) => void
  removeFromCart: (cartItemId: string) => void
  updateQuantity: (cartItemId: string, quantity: number) => void
  clearCart: () => void
  cartTotal: () => number
  cartCount: () => number

  // UI state
  activeView: string
  setActiveView: (view: string) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      lang: 'de',
      langSelected: false,
      tableId: null,
      setLang: (lang) => set({ lang }),
      setLangSelected: (langSelected) => set({ langSelected }),
      setTableId: (tableId) => set({ tableId }),

      cartItems: [],

      addToCart: (menuItemId, extras, notes, quantity) => {
        const item = menuItems.find((m) => m.id === menuItemId)
        if (!item) return
        const lang = get().lang
        const extrasTotal = extras.reduce((s, e) => s + e.price, 0)
        const cartItem: CartItem = {
          id: `${menuItemId}-${Date.now()}`,
          menuItemId,
          name: item.name[lang],
          price: item.price + extrasTotal,
          quantity,
          extras,
          notes,
          image: item.image,
        }
        set((s) => ({ cartItems: [...s.cartItems, cartItem] }))
      },

      removeFromCart: (cartItemId) =>
        set((s) => ({ cartItems: s.cartItems.filter((i) => i.id !== cartItemId) })),

      updateQuantity: (cartItemId, quantity) =>
        set((s) => ({
          cartItems:
            quantity <= 0
              ? s.cartItems.filter((i) => i.id !== cartItemId)
              : s.cartItems.map((i) =>
                  i.id === cartItemId ? { ...i, quantity } : i
                ),
        })),

      clearCart: () => set({ cartItems: [] }),

      cartTotal: () =>
        get().cartItems.reduce((s, i) => s + i.price * i.quantity, 0),

      cartCount: () =>
        get().cartItems.reduce((s, i) => s + i.quantity, 0),

      activeView: 'home',
      setActiveView: (view) => set({ activeView: view }),
    }),
    { name: 'tischly-store', partialize: (s) => ({ lang: s.lang, langSelected: s.langSelected, cartItems: s.cartItems }) }
  )
)
