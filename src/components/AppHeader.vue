<script setup lang="ts">
import { ref } from 'vue'
import Logo from '@/assets/stok-logo.svg'
import {useI18n} from "vue-i18n";
import {useCookies} from "@vueuse/integrations/useCookies";

const { locale } = useI18n()
const menu = ref(false)
const cookies = useCookies(['locale'])
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
        <VAppBarNavIcon v-bind="props" />
      </template>

      <VList>
        <VListItem>
          <VBtn @click="changeLanguage('pl')">pl</VBtn>
        </VListItem>
        <VListItem>
          <VBtn @click="changeLanguage('en')">en</VBtn>
        </VListItem>
      </VList>
    </VMenu>
  </VAppBar>
</template>

<style scoped lang="scss">

</style>
