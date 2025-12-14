import { useCookies } from '@vueuse/integrations/useCookies'
import { createI18n } from 'vue-i18n'

import en from './i18n/locales/en.json'
import pl from './i18n/locales/pl.json'

const cookies = useCookies(['locale'])
const savedLocale = cookies.get('locale') || 'pl'

export default createI18n({
  legacy: false, // Use Composition API mode
  locale: savedLocale,
  fallbackLocale: 'en',
  messages: {
    pl,
    en,
  },
})
