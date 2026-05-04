import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Lang, CartItem, Extra, MenuItem } from '../types'

interface AppState {
  lang: Lang
  langSelected: boolean
  tableId: string | null
  restaurantId: string | null
  guestId: string | null
  currentOrderId: string | null
  setLang: (lang: Lang) => void
  setLangSelected: (v: boolean) => void
  setTableId: (id: string) => void
  setRestaurantId: (id: string | null) => void
  setGuestId: (id: string | null) => void
  setCurrentOrderId: (id: string | null) => void

  // Cart
  cartItems: CartItem[]
  addToCart: (menuItem: Pick<MenuItem, 'id' | 'name' | 'price' | 'image'>, extras: Extra[], notes: string, quantity: number) => void
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
      restaurantId: null,
      guestId: null,
      currentOrderId: null,
      setLang: (lang) => set({ lang }),
      setLangSelected: (langSelected) => set({ langSelected }),
      setTableId: (tableId) => set({ tableId }),
      setRestaurantId: (restaurantId) => set({ restaurantId }),
      setGuestId: (guestId) => set({ guestId }),
      setCurrentOrderId: (currentOrderId) => set({ currentOrderId }),

      cartItems: [],

      addToCart: (menuItem, extras, notes, quantity) => {
        const lang = get().lang
        const extrasTotal = extras.reduce((s, e) => s + e.price, 0)
        const cartItem: CartItem = {
          id: `${menuItem.id}-${Date.now()}`,
          menuItemId: menuItem.id,
          name: menuItem.name[lang],
          price: menuItem.price + extrasTotal,
          quantity,
          extras,
          notes,
          image: menuItem.image,
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
    { name: 'tischly-store', partialize: (s) => ({ lang: s.lang, langSelected: s.langSelected, cartItems: s.cartItems, guestId: s.guestId, currentOrderId: s.currentOrderId }) }
  )
)
