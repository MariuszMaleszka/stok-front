<script setup lang="ts">
  import { useCookies } from '@vueuse/integrations/useCookies'
  import { ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import Logo from '@/assets/stok-logo.svg'

  const { locale } = useI18n()
  const menu = ref(false)
  const cookies = useCookies(['locale'])
  // Switch language
  function changeLanguage (lang) {
    locale.value = lang
    cookies.set('locale', lang, { path: '/', maxAge: 60 * 60 * 24 * 365 }) // 1 year
  }

</script>

<template>
  <VAppBar :elevation="0">
    <VImg
      class="ml-2"
      contain
      max-width="78"
      :src="Logo"
    />

    <VSpacer />

    <VMenu v-model="menu">
      <template #activator="{ props }">
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
