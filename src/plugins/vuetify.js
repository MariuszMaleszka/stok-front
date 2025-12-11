/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import '@fontsource/inter/index.css'

// Composables
import { createVuetify } from 'vuetify'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#1a56db',
          error: '#fb2c36'
        },
      },
    },
  },
  display: {
    mobileBreakpoint: 'sm',
  },
  defaults: {
    global: {
      style: {
        fontFamily: 'Inter, sans-serif',
      },
    },
  },
})
