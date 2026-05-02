'use client'

import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, Star } from 'lucide-react'

const REVENUE_DATA = [
  { day: 'Mo', value: 1240, orders: 42 },
  { day: 'Di', value: 980,  orders: 31 },
  { day: 'Mi', value: 1560, orders: 55 },
  { day: 'Do', value: 1120, orders: 38 },
  { day: 'Fr', value: 2340, orders: 78 },
  { day: 'Sa', value: 2890, orders: 96 },
  { day: 'So', value: 2100, orders: 70 },
]

const MAX = Math.max(...REVENUE_DATA.map(d => d.value))

const TOP_ITEMS = [
  { name: 'Smash Burger',    orders: 48, revenue: 955.20 },
  { name: 'Diavola Pizza',   orders: 35, revenue: 591.50 },
  { name: 'BBQ Burger',      orders: 31, revenue: 554.90 },
  { name: 'Tiramisu',        orders: 28, revenue: 249.20 },
  { name: 'Bier vom Fass',   orders: 66, revenue: 429.00 },
]

export default function AdminAnalytics() {
  const totalRevenue = REVENUE_DATA.reduce((s, d) => s + d.value, 0)
  const totalOrders  = REVENUE_DATA.reduce((s, d) => s + d.orders, 0)

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">Analytik</h1>
      <p className="text-stone-400 -mt-4">Diese Woche · {new Date().toLocaleDateString('de-CH')}</p>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Gesamtumsatz', value: `CHF ${totalRevenue.toLocaleString('de-CH')}`, icon: DollarSign, color: 'text-amber-400', bg: 'bg-amber-400/10', trend: '+12%' },
          { label: 'Bestellungen', value: totalOrders.toString(), icon: ShoppingBag, color: 'text-sky-400', bg: 'bg-sky-400/10', trend: '+8%' },
          { label: 'Ø Bestellwert', value: `CHF ${(totalRevenue / totalOrders).toFixed(2)}`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/10', trend: '+3%' },
          { label: 'Bewertung', value: '4.8 ★', icon: Star, color: 'text-purple-400', bg: 'bg-purple-400/10', trend: '+0.2' },
        ].map(({ label, value, icon: Icon, color, bg, trend }) => (
          <div key={label} className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={20} className={color} />
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-stone-400 text-sm mt-1">{label}</p>
            <p className="text-emerald-400 text-xs mt-1 font-semibold">↑ {trend} vs. Vorwoche</p>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-6">Umsatz diese Woche</h2>
        <div className="flex items-end gap-4 h-48">
          {REVENUE_DATA.map(({ day, value, orders }) => (
            <div key={day} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-stone-400 text-xs">CHF {(value / 1000).toFixed(1)}k</span>
              <div
                className="w-full rounded-xl bg-amber-400/80 hover:bg-amber-400 transition-colors cursor-default"
                style={{ height: `${(value / MAX) * 100}%`, minHeight: '8px' }}
                title={`${orders} Bestellungen`}
              />
              <span className="text-stone-400 text-sm font-medium">{day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top items */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-5">Top Artikel</h2>
        <div className="space-y-3">
          {TOP_ITEMS.map((item, i) => (
            <div key={item.name} className="flex items-center gap-4">
              <span className="text-stone-600 font-bold w-6 text-sm">{i + 1}</span>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">{item.name}</p>
                <div className="mt-1.5 h-1.5 bg-stone-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${(item.orders / TOP_ITEMS[0].orders) * 100}%` }}
                  />
                </div>
              </div>
              <div className="text-right text-sm flex-shrink-0">
                <p className="text-white font-semibold">{item.orders}x</p>
                <p className="text-stone-400">CHF {item.revenue.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
