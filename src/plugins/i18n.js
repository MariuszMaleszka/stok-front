import { createI18n } from 'vue-i18n'
import pl from './i18n/locales/pl.json'
import en from './i18n/locales/en.json'

export default createI18n({
  legacy: false, // Use Composition API mode
  locale: 'pl',
  fallbackLocale: 'en',
  messages: {
    pl,
    en
  }
})
