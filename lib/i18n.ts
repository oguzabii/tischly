import type { Lang } from './types'
import de from '../messages/de.json'
import en from '../messages/en.json'
import tr from '../messages/tr.json'
import fr from '../messages/fr.json'
import it from '../messages/it.json'
import es from '../messages/es.json'

export const translations = { de, en, tr, fr, it, es } as const

export type Translations = typeof de

export function t(lang: Lang): Translations {
  return translations[lang] ?? translations.de
}

export const LANGUAGES: { code: Lang; label: string; flag: string }[] = [
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
]
