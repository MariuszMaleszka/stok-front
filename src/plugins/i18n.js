import { createI18n } from 'vue-i18n'
import { useCookies } from '@vueuse/integrations/useCookies'

import pl from './i18n/locales/pl.json'
import en from './i18n/locales/en.json'

const cookies = useCookies(['locale'])
const savedLocale = cookies.get('locale') || 'pl'

export default createI18n({
  legacy: false, // Use Composition API mode
  locale: savedLocale,
  fallbackLocale: 'en',
  messages: {
    pl,
    en
  }
})
