<script setup>
import { computed } from 'vue'
import { useDisplay } from 'vuetify'
import { useUserStore } from '@/stores/UserStore.js'
import DatePickerResponsive from "@/components/DatePickerResponsive.vue";
import { useI18n } from 'vue-i18n'
import {useCookies} from "@vueuse/integrations/useCookies";

const userStore = useUserStore()
const { locale } = useI18n()
const { mobile } = useDisplay()
const cookies = useCookies(['locale'])
const currentLocale = computed(() => cookies.get('locale') || 'pl')

// Switch language
const changeLanguage = (lang) => {
  locale.value = lang
  cookies.set('locale', lang, { path: '/', maxAge: 60 * 60 * 24 * 365 }) // 1 year
}
</script>

<template>

  <VContainer max-width="1200" fluid>
    <VBtn @click="changeLanguage('pl')">pl</VBtn>
    <VBtn @click="changeLanguage('en')">en</VBtn>
    <h1>{{ $t('hello') }}</h1>
    <DatePickerResponsive
      v-model="userStore.userDateOfStay"
      :locale="currentLocale"
    />
  </VContainer>

</template>

