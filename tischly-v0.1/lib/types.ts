export type Lang = 'de' | 'en' | 'tr' | 'fr' | 'it' | 'es'

export type MenuCategory = 'burger' | 'pizza' | 'drinks' | 'desserts'

export interface Extra {
  id: string
  name: string
  price: number
}

export interface MenuItem {
  id: string
  category: MenuCategory
  name: Record<Lang, string>
  description: Record<Lang, string>
  price: number
  image: string
  extras: Extra[]
  tags: ('popular' | 'new' | 'vegan' | 'vegetarian' | 'spicy' | 'glutenFree')[]
  available: boolean
  calories?: number
  allergens?: string[]
}

export interface CartItem {
  id: string
  menuItemId: string
  name: string
  price: number
  quantity: number
  extras: Extra[]
  notes: string
  image: string
}

export interface Order {
  id: string
  tableId: string
  items: CartItem[]
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'paid'
  total: number
  createdAt: string
  notes?: string
}

export interface Offer {
  id: string
  title: Record<Lang, string>
  description: Record<Lang, string>
  discount: number
  discountType: 'percent' | 'fixed'
  image: string
  validUntil: string
  code?: string
}

export interface TableData {
  id: string
  number: number
  status: 'free' | 'occupied' | 'reserved'
  seats: number
  currentOrderId?: string
}

export interface DailySpecial {
  menuItemId: string
  note: Record<Lang, string>
}
