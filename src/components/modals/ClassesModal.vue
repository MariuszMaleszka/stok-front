<script setup>
  import { computed, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useDisplay } from 'vuetify'
  import skiLOGO from '@/assets/ski-icon.svg'
  import snowboardLOGO from '@/assets/snowboard-icon.svg'
  const props = defineProps({
    modelValue: { type: Boolean, default: false },
    participant: { type: Object, default: null },
    activityType: { type: String, default: 'ski' },
    index: { type: Number, default: 0 },
    name: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    participantType: { type: String, default: '' },
    age: { type: [Number, String], default: undefined },
    completed: { type: Boolean, default: false },
    totalPrice: { type: Number, default: undefined },
    currency: { type: String, default: '' },
  })
  const emit = defineEmits(['update:modelValue', 'save'])
  const { mobile } = useDisplay()
  const { t, locale } = useI18n()
  function close () {
    emit('update:modelValue', false)
  }
  const iconSrc = computed(() => props.activityType === 'snowboard' ? snowboardLOGO : skiLOGO)
  const displaySubtitle = computed(() => {
    const typeLabel = t(props.participantType || 'adult')
    const activityLabel = props.activityType === 'snowboard' ? t('snowboard') : t('ski')
    return `${typeLabel} - ${activityLabel}`
  })

  const carouselIndex = ref(0)
  const daysCount = 5
  const baseDate = computed(() => {
    const d = props.participant?.dateOfStay
    return d ? new Date(d) : new Date()
  })
  const days = computed(() => {
    const result = []
    for (let i = 0; i < daysCount; i++) {
      const d = new Date(baseDate.value)
      d.setDate(d.getDate() + i)
      const dayName = d.toLocaleDateString(locale.value === 'pl' ? 'pl-PL' : 'en-US', { weekday: 'long' })
      const dateStr = d.toLocaleDateString(locale.value === 'pl' ? 'pl-PL' : 'en-US', { day: '2-digit', month: 'long', year: 'numeric' })
      result.push({ dayName, dateStr })
    }
    return result
  })
  function prevDay () {
    carouselIndex.value = Math.max(0, carouselIndex.value - 1)
  }
  function nextDay () {
    carouselIndex.value = Math.min(days.value.length - 1, carouselIndex.value + 1)
  }
</script>

<template>
  <VDialog
    content-class="under-app-bar"
    fullscreen
    :model-value="modelValue"
    scrollable
    @update:model-value="emit('update:modelValue', $event)"
  >

    <VCard>
      <VCardTitle>
        <p class="font-weight-medium fs-14 mt-4 text-gray-700">Wybierasz zajęcia dla:</p>
        <div class="d-flex justify-space-between align-center user-info-container mt-2" :class="mobile ? 'fs-16 ':''">
          <div class="d-flex align-start justify-start ga-3">
            <img
              alt=""
              class="mt-1"
              height="24"
              :src="iconSrc"
              width="24"
            >
            <div>
              <p class="fw-600 text-primary-900 mb-1">{{ participant?.name || '-' }}</p>
              <span class="fw-600 d-flex flex-column fs-12 text-black55 font-weight-semibold">{{ displaySubtitle }}</span>
            </div>
          </div>
        </div>
      </VCardTitle>
      <VCardText>
        <div class="mb-4">
          <div class="slider-controls d-flex align-center justify-space-between mb-2">
            <VIcon class="nav-icon" color="primary" icon="mdi-chevron-left" @click="prevDay" />
            <span class="fs-16 font-weight-medium text-gray-900">{{ t('select_day') || 'Wybór dnia' }}</span>
            <VIcon class="nav-icon" color="primary" icon="mdi-chevron-right" @click="nextDay" />
          </div>
          <VSlideGroup v-model="carouselIndex" center-active class="day-slider">
            <VSlideGroupItem v-for="(day, idx) in days" :key="idx" :value="idx">
              <VCard class="ma-2 day-card" elevation="0" :style="{ minWidth: mobile ? '88%' : '60%' }">
                <VCardText>
                  <div class="d-flex justify-space-between align-center">
                    <div class="d-flex align-center ga-2">
                      <VIcon color="primary" icon="mdi-calendar" size="18" />
                      <span class="fw-600 text-primary-900">{{ day.dayName.charAt(0).toUpperCase() + day.dayName.slice(1) }}</span>
                    </div>
                    <span class="fs-12 text-primary-08">{{ idx + 1 }}/{{ days.length }}</span>
                  </div>
                  <div class="mt-1 text-primary-08">{{ day.dateStr }}</div>
                  <div class="text-center text-gray-600 mt-16 mb-16">{{ t('no_classes_selected') || 'Nie wybrano zajęć' }}</div>
                  <div class="d-flex justify-center">
                    <VBtn class="px-6" color="blue" prepend-icon="mdi-plus" variant="flat">
                      {{ t('add_classes') || 'Dodaj zajęcia' }}
                    </VBtn>
                  </div>
                </VCardText>
              </VCard>
            </VSlideGroupItem>
          </VSlideGroup>
        </div>
      </VCardText>
      <VCardActions class="d-flex justify-between text-capitalize">
        <VBtn
          class="fs-16 text-capitalize flex-1"
          color="blue"
          size="x-large"
          variant="outlined"
          @click="close"
        >
          <VIcon class="mr-2" icon="mdi-arrow-left" />
          {{ t('previous') }}
        </VBtn>
        <VBtn
          class="fs-16 text-capitalize flex-2"
          color="blue"
          size="x-large"
          variant="flat"
          @click="emit('save')"
        >
          {{ t('save') }} & {{ t('next') }}
          <VIcon class="ml-2" icon="mdi-arrow-right" />
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped lang="scss">

.text-gray-700 {
  color: #374151;
}

.text-primary-900 {
  color: #233876;
}

.text-gray-900 {
  color: #111928;
}

.background-primary-100 {
  background: #E1EFFE;
}

.under-app-bar {
  top: 64px;
  height: calc(100% - 64px);
}
.v-card {
  background: rgb(243 244 246);
}

:deep(.day-card) {
  background: #ffffff;
  border: 2px solid #C3DDFD;
  border-radius: 12px;
}

:deep(.v-overlay__scrim) {
  top: 64px;
}
.v-overlay {
  top: 64px;
}

.user-info-container {
    background: #E1EFFE;
    border-radius: 8px;
    padding: 12px 8px;
}

.text-black55 {
  color: rgba(0, 0, 0, 0.55);
}

.nav-icon {
  cursor: pointer;
}

.day-slider :deep(.v-slide-group__content) {
  gap: 12px;
}

</style>
