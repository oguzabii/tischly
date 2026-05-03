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

// =====================================================================
// Tischly v0.2 + v0.3 additions
// =====================================================================

// ----- Restaurant whitelabel (v0.2) -----
export interface Restaurant {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  primary_color: string;
  accent_color: string;
  idle_video_url: string | null;
  idle_headline: Record<Lang, string>;
  idle_subline: Record<Lang, string>;
  charging_enabled: boolean;
  charging_minutes: number;
}

// ----- Ads (v0.2) -----
export type AdKind = 'image' | 'video';
export type AdPlacement = 'idle' | 'menu_banner' | 'category_break';

export interface Ad {
  id: string;
  restaurant_id: string;
  title: string;
  kind: AdKind;
  media_url: string;
  click_url: string | null;
  placement: AdPlacement;
  duration_ms: number;
  weight: number;
  active: boolean;
  starts_at: string;
  ends_at: string | null;
}

// ----- Charging (v0.2) -----
export interface ChargeSession {
  id: string;
  table_id: string;
  restaurant_id: string;
  guest_email: string | null;
  guest_name: string | null;
  consent: boolean;
  started_at: string;
  ends_at: string | null;
  ended_at: string | null;
  source: 'qr' | 'manual';
}

// ----- Guests / Loyalty (v0.3) -----
export type SessionRole = 'host' | 'companion';
export type ReferralStatus = 'pending' | 'rewarded' | 'expired';

export interface Guest {
  id: string;
  restaurant_id: string;
  auth_user_id: string | null;
  email: string;
  name: string;
  birthday: string | null;
  points: number;
  lifetime_spent: number;
  referral_code: string;
  referred_by: string | null;
  last_visit_at: string | null;
  visit_count: number;
  created_at: string;
}

export interface LoyaltyConfig {
  restaurant_id: string;
  points_per_currency: number;
  redeem_rate: number;
  redeem_min_points: number;
  birthday_gift_value: number;
  referral_reward_points: number;
  ai_recommendations: boolean;
}

export interface GuestSession {
  id: string;
  table_id: string;
  restaurant_id: string;
  guest_id: string;
  role: SessionRole;
  join_token: string;
  started_at: string;
  expires_at: string;
  ended_at: string | null;
}

export interface GuestSessionWithGuest extends GuestSession {
  guest: Guest;
}

export interface GuestFavorite {
  guest_id: string;
  item_id: string;
  order_count: number;
  last_ordered: string;
}

export interface AiSuggestion {
  item_id: string;
  reason: string;
  confidence: number;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  status: ReferralStatus;
  reward_points: number;
  created_at: string;
  rewarded_at: string | null;
}

// ----- Helpers -----
export function pointsToCHF(points: number, redeemRate: number = 0.01): number {
  return Math.round(points * redeemRate * 100) / 100;
}

export function chfToPoints(chf: number, redeemRate: number = 0.01): number {
  return Math.ceil(chf / redeemRate);
}
