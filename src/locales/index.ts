import { createI18n } from 'vue-i18n'
import en from './en'
import sk from './sk'

export const supportedLocales = ['en', 'sk'] as const
export type SupportedLocale = (typeof supportedLocales)[number]

function getInitialLocale(): SupportedLocale {
  const savedLocale = localStorage.getItem('locale')
  if (savedLocale && supportedLocales.includes(savedLocale as SupportedLocale)) {
    return savedLocale as SupportedLocale
  }

  return navigator.language.toLowerCase().startsWith('sk') ? 'sk' : 'en'
}

export const i18n = createI18n({
  legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: 'en',
  messages: { en, sk },
})

export function setLocale(locale: SupportedLocale) {
  i18n.global.locale.value = locale
  localStorage.setItem('locale', locale)
  document.documentElement.lang = locale
}
