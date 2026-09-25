import { createI18n } from 'vue-i18n'

import navEn from './nav/en'
import navSk from './nav/sk'
import languageEn from './language/en'
import languageSk from './language/sk'
import footerEn from './footer/en'
import footerSk from './footer/sk'
import authEn from './auth/en'
import authSk from './auth/sk'
import chartsEn from './charts/en'
import chartsSk from './charts/sk'

import homeEn from '../views/home/locales/en'
import homeSk from '../views/home/locales/sk'
import destinationsEn from '../views/destinations/locales/en'
import destinationsSk from '../views/destinations/locales/sk'
import destinationDetailEn from '../views/destination-detail/locales/en'
import destinationDetailSk from '../views/destination-detail/locales/sk'
import recommendationsEn from '../views/recommendations/locales/en'
import recommendationsSk from '../views/recommendations/locales/sk'
import preferencesEn from '../views/preferences/locales/en'
import preferencesSk from '../views/preferences/locales/sk'
import dashboardEn from '../views/dashboard/locales/en'
import dashboardSk from '../views/dashboard/locales/sk'
import tripsEn from '../views/trips/locales/en'
import tripsSk from '../views/trips/locales/sk'
import tripDetailEn from '../views/trip-detail/locales/en'
import tripDetailSk from '../views/trip-detail/locales/sk'

const en = {
  ...navEn,
  ...languageEn,
  ...footerEn,
  ...authEn,
  ...chartsEn,
  ...homeEn,
  ...destinationsEn,
  ...destinationDetailEn,
  ...recommendationsEn,
  ...preferencesEn,
  ...dashboardEn,
  ...tripsEn,
  ...tripDetailEn,
} as const

const sk = {
  ...navSk,
  ...languageSk,
  ...footerSk,
  ...authSk,
  ...chartsSk,
  ...homeSk,
  ...destinationsSk,
  ...destinationDetailSk,
  ...recommendationsSk,
  ...preferencesSk,
  ...dashboardSk,
  ...tripsSk,
  ...tripDetailSk,
} as const

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
