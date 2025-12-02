<script setup>
import { useDisplay } from 'vuetify'
import { useUserStore } from '@/stores/userStore'

import { formatDateRange } from "@/utils/dates.js";
import DatePicker from "@/components/DatePicker.vue";

const { mobile } = useDisplay()
const userStore = useUserStore()
const dialog = ref(false)
</script>

<template>
  <span>Okres pobytu</span>
  <DatePicker
    v-if="!mobile"
    v-model="userStore.userDateOfStay"
    variant="multi-calendars"
  />
  <VTextField
    v-else
    variant="outlined"
    readonly
    clearable
    hide-details
    control-variant="hidden"
    clearIcon="mdi-close"
    :model-value="formatDateRange(userStore.userDateOfStay)"
    label="Wybierz"
    @click="dialog = true"
  >
    <template #prepend-inner>
      <VIcon size="16" icon="mdi-calendar-blank-outline" />
    </template>

  </VTextField>
  <VDialog
    v-model="dialog"
    scrollable
    fullscreen
  >
    <VCard >
      <VCardTitle>
        <div class="d-flex justify-space-between">
          Wybierz termin pobytu
          <VIcon icon="mdi-close" @click="dialog = false"/>
        </div>
      </VCardTitle>
      <VCardText class="px-2">
        <DatePicker
          v-model="userStore.userDateOfStay"
          class="w-full"
          variant="multi-calendars" inline :show-header="false"/>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<style lang="scss">
.dp__outer_menu_wrap {
  flex: 1;
}
</style>
<!-- Multi-calendar range picker -->

<!-- Simple single calendar -->
<!--    <DatePicker variant="simple" />-->

<!-- Range picker with time -->
<!--    <DatePicker enable-time-picker variant="range" />-->

<!-- Month picker -->
<!--    <DatePicker variant="month-picker" />-->
