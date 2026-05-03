'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRestaurant } from '@/lib/hooks/useRestaurantData'
import {
  getMenuItemsForAdmin, saveMenuItem, deleteMenuItem,
  toggleMenuItemAvailability, type DbMenuItem
} from '@/lib/hooks/useMenuItems'
import type { MenuCategory } from '@/lib/types'
import { Eye, EyeOff, Pencil, Plus, Trash2, X, Check, Loader2 } from 'lucide-react'

const CATEGORIES: { id: MenuCategory; label: string; emoji: string }[] = [
  { id: 'burger',  label: 'Burger',   emoji: '🍔' },
  { id: 'pizza',   label: 'Pizza',    emoji: '🍕' },
  { id: 'drinks',  label: 'Getränke', emoji: '🥤' },
  { id: 'desserts',label: 'Desserts', emoji: '🍰' },
]

const BLANK_ITEM = (restaurantId: string, category: MenuCategory): DbMenuItem => ({
  id: `${category}-${Date.now()}`,
  restaurant_id: restaurantId,
  category,
  name: { de: '', en: '', tr: '', fr: '', it: '', es: '' },
  description: { de: '', en: '', tr: '', fr: '', it: '', es: '' },
  price: 0,
  image_url: null,
  extras: [],
  tags: [],
  available: true,
  calories: null,
  allergens: [],
  sort_order: 99,
})

export default function AdminMenu() {
  const { restaurant } = useRestaurant()
  const [cat, setCat] = useState<MenuCategory>('burger')
  const [items, setItems] = useState<DbMenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<DbMenuItem | null>(null)
  const [saving, setSaving] = useState(false)
  const [isNew, setIsNew] = useState(false)
  const [msg, setMsg] = useState('')

  const load = useCallback(async (rid: string) => {
    setLoading(true)
    try { setItems(await getMenuItemsForAdmin(rid)) }
    catch { /* ignore */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if (restaurant?.id) load(restaurant.id)
  }, [restaurant?.id, load])

  const filtered = items.filter(m => m.category === cat)

  async function handleToggle(id: string, current: boolean) {
    await toggleMenuItemAvailability(id, !current)
    setItems(prev => prev.map(m => m.id === id ? { ...m, available: !current } : m))
  }

  async function handleSave() {
    if (!editing) return
    setSaving(true)
    try {
      await saveMenuItem(editing)
      setItems(prev => {
        const idx = prev.findIndex(m => m.id === editing.id)
        if (idx >= 0) { const next = [...prev]; next[idx] = editing; return next }
        return [...prev, editing]
      })
      setMsg('✓ Gespeichert')
      setTimeout(() => setMsg(''), 2500)
      setEditing(null)
      setIsNew(false)
    } catch (e) {
      setMsg('Fehler beim Speichern')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Artikel wirklich löschen?')) return
    await deleteMenuItem(id)
    setItems(prev => prev.filter(m => m.id !== id))
  }

  function openNew() {
    if (!restaurant?.id) return
    setIsNew(true)
    setEditing(BLANK_ITEM(restaurant.id, cat))
  }

  const setField = (field: keyof DbMenuItem, value: unknown) =>
    setEditing(prev => prev ? { ...prev, [field]: value } : prev)

  const setName = (lang: string, val: string) =>
    setEditing(prev => prev ? { ...prev, name: { ...prev.name, [lang]: val } } : prev)

  const setDesc = (lang: string, val: string) =>
    setEditing(prev => prev ? { ...prev, description: { ...prev.description, [lang]: val } } : prev)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Speisekarte</h1>
        {msg && <span className="text-sm text-emerald-400">{msg}</span>}
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 text-black font-semibold text-sm hover:bg-amber-300 transition-colors"
        >
          <Plus size={16} /> Neuer Artikel
        </button>
      </div>

      {/* Category tabs */}
      <div className="flex gap-3 flex-wrap">
        {CATEGORIES.map(({ id, label, emoji }) => (
          <button
            key={id}
            onClick={() => setCat(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              cat === id ? 'bg-amber-400 text-black' : 'bg-stone-800 text-stone-300 hover:bg-stone-700 border border-stone-700'
            }`}
          >
            {emoji} {label}
          </button>
        ))}
      </div>

      {/* Edit / New item form */}
      {editing && (
        <div className="bg-stone-900 border border-amber-500/30 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">{isNew ? 'Neuer Artikel' : 'Artikel bearbeiten'}</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-stone-400 text-xs mb-1 block">Name (DE) *</label>
              <input className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-white text-sm focus:border-amber-400 outline-none"
                value={editing.name.de} onChange={e => setName('de', e.target.value)} placeholder="z.B. Classic Burger" />
            </div>
            <div>
              <label className="text-stone-400 text-xs mb-1 block">Name (EN)</label>
              <input className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-white text-sm focus:border-amber-400 outline-none"
                value={editing.name.en} onChange={e => setName('en', e.target.value)} placeholder="e.g. Classic Burger" />
            </div>
            <div>
              <label className="text-stone-400 text-xs mb-1 block">Name (TR)</label>
              <input className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-white text-sm focus:border-amber-400 outline-none"
                value={editing.name.tr} onChange={e => setName('tr', e.target.value)} />
            </div>
            <div>
              <label className="text-stone-400 text-xs mb-1 block">Name (FR)</label>
              <input className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-white text-sm focus:border-amber-400 outline-none"
                value={editing.name.fr} onChange={e => setName('fr', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-stone-400 text-xs mb-1 block">Beschreibung (DE)</label>
              <textarea className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-white text-sm focus:border-amber-400 outline-none resize-none"
                rows={2} value={editing.description.de} onChange={e => setDesc('de', e.target.value)} />
            </div>
            <div>
              <label className="text-stone-400 text-xs mb-1 block">Beschreibung (EN)</label>
              <textarea className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-white text-sm focus:border-amber-400 outline-none resize-none"
                rows={2} value={editing.description.en} onChange={e => setDesc('en', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-stone-400 text-xs mb-1 block">Preis (CHF) *</label>
              <input type="number" step="0.10" min="0" className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-white text-sm focus:border-amber-400 outline-none"
                value={editing.price} onChange={e => setField('price', parseFloat(e.target.value) || 0)} />
            </div>
            <div>
              <label className="text-stone-400 text-xs mb-1 block">Kalorien</label>
              <input type="number" min="0" className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-white text-sm focus:border-amber-400 outline-none"
                value={editing.calories ?? ''} onChange={e => setField('calories', e.target.value ? parseInt(e.target.value) : null)} />
            </div>
            <div>
              <label className="text-stone-400 text-xs mb-1 block">Bild-URL</label>
              <input className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-white text-sm focus:border-amber-400 outline-none"
                value={editing.image_url ?? ''} onChange={e => setField('image_url', e.target.value || null)} placeholder="https://..." />
            </div>
          </div>

          <div>
            <label className="text-stone-400 text-xs mb-1 block">Tags (kommagetrennt: popular, vegan, vegetarian, spicy, new, glutenFree)</label>
            <input className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-white text-sm focus:border-amber-400 outline-none"
              value={(editing.tags ?? []).join(', ')}
              onChange={e => setField('tags', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} />
          </div>

          <div>
            <label className="text-stone-400 text-xs mb-1 block">Allergene (kommagetrennt)</label>
            <input className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-white text-sm focus:border-amber-400 outline-none"
              value={(editing.allergens ?? []).join(', ')}
              onChange={e => setField('allergens', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="avail" checked={editing.available} onChange={e => setField('available', e.target.checked)} className="w-4 h-4 accent-amber-400" />
            <label htmlFor="avail" className="text-stone-300 text-sm">Verfügbar</label>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 text-black font-semibold text-sm hover:bg-amber-300 disabled:opacity-50 transition-colors">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              Speichern
            </button>
            <button onClick={() => { setEditing(null); setIsNew(false) }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-800 text-stone-300 font-semibold text-sm hover:bg-stone-700 transition-colors">
              <X size={16} /> Abbrechen
            </button>
          </div>
        </div>
      )}

      {/* Items table */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-amber-400" /></div>
      ) : (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-800">
                <th className="text-left px-5 py-4 text-stone-400 text-sm font-medium">Artikel</th>
                <th className="text-left px-5 py-4 text-stone-400 text-sm font-medium">Preis</th>
                <th className="text-left px-5 py-4 text-stone-400 text-sm font-medium">Tags</th>
                <th className="text-left px-5 py-4 text-stone-400 text-sm font-medium">Status</th>
                <th className="text-left px-5 py-4 text-stone-400 text-sm font-medium">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-stone-500">Keine Artikel in dieser Kategorie</td></tr>
              ) : filtered.map(item => (
                <tr key={item.id} className="border-b border-stone-800/50 hover:bg-stone-800/30 transition-colors">
                  <td className="px-5 py-4">
                    <p className="text-white font-medium">{item.name.de}</p>
                    <p className="text-stone-500 text-xs mt-0.5 truncate max-w-xs">{item.description.de}</p>
                  </td>
                  <td className="px-5 py-4 text-amber-400 font-semibold">
                    CHF {Number(item.price).toFixed(2)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(item.tags ?? []).map(tag => (
                        <span key={tag} className="px-2 py-0.5 rounded-full bg-stone-700 text-stone-300 text-xs">{tag}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-lg border text-xs font-medium ${
                      item.available
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-stone-700/50 text-stone-500 border-stone-600/30'
                    }`}>
                      {item.available ? 'Verfügbar' : 'Nicht verfügbar'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggle(item.id, item.available)}
                        className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors"
                        title="Verfügbarkeit umschalten"
                      >
                        {item.available ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                      <button
                        onClick={() => { setEditing(item); setIsNew(false) }}
                        className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors"
                        title="Bearbeiten"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 rounded-lg bg-stone-800 hover:bg-red-900/50 text-stone-400 hover:text-red-400 transition-colors"
                        title="Löschen"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
