import { useCookies } from '@vueuse/integrations/useCookies'
import { createI18n } from 'vue-i18n'

import plJson from './i18n/locales/pl.json'
import enJson from './i18n/locales/en.json'
import { pl as plVuetify, en as enVuetify } from 'vuetify/locale'

const cookies = useCookies(['locale'])
const savedLocale = cookies.get('locale') || 'pl'

const messages = {
  en: {
    ...enJson,
    $vuetify: enVuetify
  },
  pl: {
    ...plJson,
    $vuetify: plVuetify
  }
}

export default createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'en',
  messages,
  silentTranslationWarn: true,
  missingWarn: false
})
