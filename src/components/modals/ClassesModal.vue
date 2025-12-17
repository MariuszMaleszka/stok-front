<script setup>
  import { computed, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useDisplay } from 'vuetify'
  import calendarIcon from '@/assets/calendar-plus.svg'
  import skiLOGO from '@/assets/ski-icon.svg'
  import snowboardLOGO from '@/assets/snowboard-icon.svg'
  import AddClassesModal from '@/components/modals/AddClassesModal.vue'

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

  const showAddClassesModal = ref(false)
  const selectedDateForAdd = ref('')

  function openAddClassesModal (day) {
    selectedDateForAdd.value = `${day.dayName.charAt(0).toUpperCase() + day.dayName.slice(1)} ${day.dateStr}`
    showAddClassesModal.value = true
  }

  function handleAddClassesNext (type) {
    console.log('Selected class type:', type)
    // Here you can handle the next step logic
    showAddClassesModal.value = false
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
      <VCardTitle class="px-0">
        <div class="main-container">
          <p class="font-weight-medium fs-14 mt-4 text-gray-700">Wybierasz zajęcia dla:</p>
          <div class="d-flex justify-space-between align-center user-info-container mt-2" :class="mobile ? 'fs-16 ':''">
            <div class="d-flex align-start justify-start ga-2">
              <img
                alt=""
                class="mt-1"
                height="24"
                :src="iconSrc"
                width="24"
              >
              <div>
                <p class="fw-600 text-primary-900 mb-1 fs-30 line-height-1">{{ participant?.name || '-' }}</p>
                <span class="fw-600 d-flex flex-column fs-12 text-black55 font-weight-semibold">{{ displaySubtitle }}</span>
              </div>
            </div>
          </div>
        </div>
      </VCardTitle>
      <VCardText class="px-0">
        <div class="mb-4">
          <div class="main-container slider-controls d-flex align-center justify-space-between mb-2">
            <VIcon class="nav-icon" :color="carouselIndex === 0 ? 'grey' : 'black'" icon="mdi-arrow-left" @click="prevDay" />
            <span class="fs-16 font-weight-medium text-gray-900">{{ t('select_day') || 'Wybór dnia' }}</span>
            <VIcon class="nav-icon" :color="carouselIndex === days.length - 1 ? 'grey' : 'black'" icon="mdi-arrow-right" @click="nextDay" />
          </div>
          <VSlideGroup v-model="carouselIndex" center-active class="day-slider px-0 slider-breakout" :show-arrows="false">
            <VSlideGroupItem v-for="(day, idx) in days" :key="idx" :value="idx">
              <VCard class="ma-2 day-card" elevation="0">
                <VCardText class="class-card">
                  <div class="d-flex justify-start align-start border-bottom flex-column">
                    <span class="fs-12 text-primary-08 d-flex justify-end w-100">{{ idx + 1 }}/{{ days.length }}</span>
                    <div class="d-flex align-center ga-2">
                      <img
                        alt=""
                        height="16"
                        :src="calendarIcon"
                        width="16"
                      >
                      <div class="ml-2">
                        <span class="fw-600 text-primary-900">{{ day.dayName.charAt(0).toUpperCase() + day.dayName.slice(1) }}</span>
                        <div class="mt-1 text-primary-08">{{ day.dateStr }}</div>
                      </div>

                    </div>
                  </div>

                  <div class="text-center text-gray-600">{{ t('no_classes_selected') || 'Nie wybrano zajęć' }}</div>
                  <div class="d-flex justify-center">
                    <VBtn
                      class="px-6"
                      color="blue"
                      prepend-icon="mdi-plus-circle"
                      variant="flat"
                      @click="openAddClassesModal(day)"
                    >
                      {{ t('add_classes') || 'Dodaj zajęcia' }}
                    </VBtn>
                  </div>
                </VCardText>
              </VCard>
            </VSlideGroupItem>
          </VSlideGroup>
        </div>
      </VCardText>
      <VCardActions class="px-0">
        <div class="main-container d-flex justify-center align-center ga-4 text-capitalize w-100">
          <VBtn
            :class="[
              mobile ? 'px-2 no-letter-spacing' : '',
              'fs-16',
              'text-normal',
              'back-btn'
            ]"
            size="x-large"
            variant="outlined"
            @click="close"
          >
            <VIcon class="mr-1 no-letter-spacing" icon="mdi-arrow-left" />
            {{ t('return') || 'Powrót' }}
          </VBtn>
          <VBtn
            :class="[
              mobile ? 'px-2 no-letter-spacing' : 'px-8',
              'fs-16',
              'text-normal',
              'back-btn'
            ]"
            color="blue normal-text"
            size="x-large"
            variant="flat"
            @click="emit('save')"
          >
            {{ t('save_and_next') || 'Zapisz i przejdź dalej' }}
            <VIcon class="ml-1" icon="mdi-arrow-right" />
          </VBtn>
        </div>
      </VCardActions>
    </VCard>
  </VDialog>

  <AddClassesModal
    v-model="showAddClassesModal"
    :date-str="selectedDateForAdd"
    @next="handleAddClassesNext"
  />
</template>

<style scoped lang="scss">
.main-container {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 16px;
  width: 100%;
}

.slider-breakout {
  padding-left: max(16px, calc((100% - 960px) / 2 + 16px))!important;
}

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
  width: 78vw;
  height: 94vw;
  max-width: 280px;
  max-height: 340px;
  box-shadow: 0px 0px 5px 0px rgba(5, 44, 112, 0.2) !important;

  &:last-child {
    margin-right: 20px!important;
  }
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

.class-card {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.border-bottom {
    border-bottom: 1px solid #A4CAFE;
    padding-bottom: 8px;
}

:deep(.v-slide-group__next), :deep(.v-slide-group__prev) {
    display: none!important;
}

.w-100 {
  width: 100%;
}

.text-normal {
  text-transform: none;
}

.v-card-actions {
  padding: 16px;
}

.no-letter-spacing {
  letter-spacing: 0;
}

// .day-slider :deep(.v-slide-group__content) {
//   gap: 12px;
// }

</style>
