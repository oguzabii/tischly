'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRestaurant } from '@/lib/hooks/useRestaurantData'
import { getOffersForAdmin, saveOffer, deleteOffer, type DbOffer } from '@/lib/hooks/useOffers'
import { Plus, Pencil, Trash2, X, Check, Loader2, Tag } from 'lucide-react'

const BLANK_OFFER = (restaurantId: string): DbOffer => ({
  id: `offer-${Date.now()}`,
  restaurant_id: restaurantId,
  title: { de: '', en: '', tr: '', fr: '', it: '', es: '' },
  description: { de: '', en: '', tr: '', fr: '', it: '', es: '' },
  discount: 0,
  discount_type: 'percent',
  image_url: null,
  valid_until: null,
  code: null,
  active: true,
  sort_order: 99,
})

export default function OffersAdmin() {
  const { restaurant } = useRestaurant()
  const [offers, setOffers] = useState<DbOffer[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<DbOffer | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const load = useCallback(async (rid: string) => {
    setLoading(true)
    try { setOffers(await getOffersForAdmin(rid)) }
    catch { /* ignore */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if (restaurant?.id) load(restaurant.id)
  }, [restaurant?.id, load])

  async function handleSave() {
    if (!editing) return
    setSaving(true)
    try {
      await saveOffer(editing)
      setOffers(prev => {
        const idx = prev.findIndex(o => o.id === editing.id)
        if (idx >= 0) { const next = [...prev]; next[idx] = editing; return next }
        return [...prev, editing]
      })
      setMsg('✓ Gespeichert')
      setTimeout(() => setMsg(''), 2500)
      setEditing(null)
      setIsNew(false)
    } catch {
      setMsg('Fehler beim Speichern')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Angebot wirklich löschen?')) return
    await deleteOffer(id)
    setOffers(prev => prev.filter(o => o.id !== id))
  }

  const setField = (field: keyof DbOffer, value: unknown) =>
    setEditing(prev => prev ? { ...prev, [field]: value } : prev)

  const setTitle = (lang: string, val: string) =>
    setEditing(prev => prev ? { ...prev, title: { ...prev.title, [lang]: val } } : prev)

  const setDesc = (lang: string, val: string) =>
    setEditing(prev => prev ? { ...prev, description: { ...prev.description, [lang]: val } } : prev)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Angebote</h1>
        {msg && <span className="text-sm text-emerald-400">{msg}</span>}
        <button
          onClick={() => { if (restaurant?.id) { setIsNew(true); setEditing(BLANK_OFFER(restaurant.id)) } }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 text-black font-semibold text-sm hover:bg-amber-300 transition-colors"
        >
          <Plus size={16} /> Neues Angebot
        </button>
      </div>

      {/* Edit form */}
      {editing && (
        <div className="bg-stone-900 border border-amber-500/30 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">{isNew ? 'Neues Angebot' : 'Angebot bearbeiten'}</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-stone-400 text-xs mb-1 block">Titel (DE) *</label>
              <input className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-white text-sm focus:border-amber-400 outline-none"
                value={editing.title.de} onChange={e => setTitle('de', e.target.value)} placeholder="z.B. Happy Hour" />
            </div>
            <div>
              <label className="text-stone-400 text-xs mb-1 block">Titel (EN)</label>
              <input className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-white text-sm focus:border-amber-400 outline-none"
                value={editing.title.en} onChange={e => setTitle('en', e.target.value)} placeholder="e.g. Happy Hour" />
            </div>
            <div>
              <label className="text-stone-400 text-xs mb-1 block">Titel (TR)</label>
              <input className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-white text-sm focus:border-amber-400 outline-none"
                value={editing.title.tr} onChange={e => setTitle('tr', e.target.value)} />
            </div>
            <div>
              <label className="text-stone-400 text-xs mb-1 block">Titel (FR)</label>
              <input className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-white text-sm focus:border-amber-400 outline-none"
                value={editing.title.fr} onChange={e => setTitle('fr', e.target.value)} />
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

          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="text-stone-400 text-xs mb-1 block">Rabatt</label>
              <input type="number" min="0" className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-white text-sm focus:border-amber-400 outline-none"
                value={editing.discount} onChange={e => setField('discount', parseFloat(e.target.value) || 0)} />
            </div>
            <div>
              <label className="text-stone-400 text-xs mb-1 block">Typ</label>
              <select className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-white text-sm focus:border-amber-400 outline-none"
                value={editing.discount_type} onChange={e => setField('discount_type', e.target.value)}>
                <option value="percent">% Prozent</option>
                <option value="fixed">CHF Fixbetrag</option>
              </select>
            </div>
            <div>
              <label className="text-stone-400 text-xs mb-1 block">Gültig bis</label>
              <input type="date" className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-white text-sm focus:border-amber-400 outline-none"
                value={editing.valid_until ?? ''} onChange={e => setField('valid_until', e.target.value || null)} />
            </div>
            <div>
              <label className="text-stone-400 text-xs mb-1 block">Code (optional)</label>
              <input className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-white text-sm focus:border-amber-400 outline-none"
                value={editing.code ?? ''} onChange={e => setField('code', e.target.value || null)} placeholder="PROMO24" />
            </div>
          </div>

          <div>
            <label className="text-stone-400 text-xs mb-1 block">Bild-URL (optional)</label>
            <input className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-white text-sm focus:border-amber-400 outline-none"
              value={editing.image_url ?? ''} onChange={e => setField('image_url', e.target.value || null)} placeholder="https://..." />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="active" checked={editing.active} onChange={e => setField('active', e.target.checked)} className="w-4 h-4 accent-amber-400" />
            <label htmlFor="active" className="text-stone-300 text-sm">Aktiv (sichtbar für Gäste)</label>
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

      {/* Offers list */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-amber-400" /></div>
      ) : offers.length === 0 ? (
        <div className="text-center py-16 text-stone-500">
          <Tag size={32} className="mx-auto mb-3 opacity-40" />
          <p>Noch keine Angebote. Klicke auf &quot;Neues Angebot&quot;.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {offers.map(offer => (
            <div key={offer.id} className="bg-stone-900 border border-stone-800 rounded-2xl p-5 flex items-center gap-5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <p className="text-white font-semibold">{offer.title.de}</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    offer.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-stone-700 text-stone-500'
                  }`}>
                    {offer.active ? 'Aktiv' : 'Inaktiv'}
                  </span>
                  {offer.code && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-mono">
                      {offer.code}
                    </span>
                  )}
                </div>
                <p className="text-stone-400 text-sm truncate">{offer.description.de}</p>
                <p className="text-amber-400 text-sm font-semibold mt-1">
                  {offer.discount_type === 'percent' ? `${offer.discount}% Rabatt` : `CHF ${Number(offer.discount).toFixed(2)} Rabatt`}
                  {offer.valid_until && <span className="text-stone-500 font-normal ml-2">bis {offer.valid_until}</span>}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => { setEditing(offer); setIsNew(false) }}
                  className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors">
                  <Pencil size={16} />
                </button>
                <button onClick={() => handleDelete(offer.id)}
                  className="p-2 rounded-lg bg-stone-800 hover:bg-red-900/50 text-stone-400 hover:text-red-400 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
