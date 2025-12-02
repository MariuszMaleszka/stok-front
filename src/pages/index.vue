<script setup>
import { useDisplay } from 'vuetify'
import { useUserStore } from '@/stores/userStore'
import DatePickerResponsive from "@/components/DatePickerResponsive.vue";
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
const { mobile } = useDisplay()

// Switch language
const changeLanguage = (lang) => {
  locale.value = lang
}
</script>

<template>

  <VContainer max-width="1200" fluid>
    <VBtn @click="changeLanguage('pl')">pl</VBtn>
    <VBtn @click="changeLanguage('en')">en</VBtn>
    <h1>{{ $t('hello') }}</h1>
    <DatePickerResponsive />
  </VContainer>

</template>

