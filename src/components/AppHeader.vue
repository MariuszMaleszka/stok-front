<script setup lang="ts">
import { ref, computed } from 'vue'
import Logo from '@/assets/stok-logo.svg'
import {useI18n} from "vue-i18n";
import {useCookies} from "@vueuse/integrations/useCookies";
import plFlag from '@/assets/pl-flag.svg'
import enFlag from '@/assets/en-flag.svg'

const { locale } = useI18n()
const menu = ref(false)
const cookies = useCookies(['locale'])

const currentFlag = computed(() => {
  return locale.value === 'pl' ? plFlag : enFlag
})

// Switch language
const changeLanguage = (lang) => {
  locale.value = lang
  cookies.set('locale', lang, { path: '/', maxAge: 60 * 60 * 24 * 365 }) // 1 year
}
</script>

<template>
  <VAppBar :elevation="0">
    <VImg
      :src="Logo"
      max-width="120"
      contain
      class="ml-2"
    />

    <VSpacer />

    <VMenu v-model="menu">
      <template v-slot:activator="{ props }">
        <VBtn v-bind="props" icon variant="text">
          <img :src="currentFlag" :alt="locale" style="width: 24px; height: 24px;">
        </VBtn>
      </template>

      <VList density="compact">
        <VListItem @click="changeLanguage('pl')">
          <template #prepend>
            <img class="mr-2" :src="plFlag" alt="pl">
          </template>
          PL
        </VListItem>
        <VListItem @click="changeLanguage('en')">
          <template #prepend>
            <img class="mr-2" :src="enFlag" alt="en">
          </template>
          EN
        </VListItem>
      </VList>
    </VMenu>
  </VAppBar>
</template>
