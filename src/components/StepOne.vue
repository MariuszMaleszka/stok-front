<script setup>
  import { useCookies } from '@vueuse/integrations/useCookies'
  import { computed, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useDisplay } from 'vuetify'
  import DatePickerResponsive from '@/components/DatePickerResponsive.vue'
  import ParticipantAccordion from '@/components/ParticipantAccordion.vue'
  import { useToast } from '@/composables/useToast'
  import { useStayStore } from '@/stores/StayStore.js'
  import { useViewControlStore } from '@/stores/ViewControlStore.js'

  const { showSimpleToast, showActionToast } = useToast()
  const stayStore = useStayStore()
  const viewStore = useViewControlStore()
  const cookies = useCookies(['locale'])
  const { mobile } = useDisplay()
  const currentLocale = computed(() => cookies.get('locale') || 'pl')
  const { t } = useI18n()

  // Form refs
  const dataForm = ref(null)
  const participantForms = ref([])
  // Watch for changes in participants count and reset form refs
  watch(() => stayStore.participants.length, () => {
    participantForms.value = []
  })

  const classesModalOpen = ref(false)
  const selectedParticipant = ref(null)
  function openClassesModal (participant) {
    selectedParticipant.value = participant
    classesModalOpen.value = true
  }
  function closeClassesModal () {
    classesModalOpen.value = false
    selectedParticipant.value = null
  }

  async function handleNextClick () {
    if (viewStore.stepOneView === viewStore.STEP_ONE_DATA) {
      const { valid } = await dataForm.value.validate()
      if (!valid) {
        showSimpleToast(t('please_fill_required_fields'), 'error')
        return
      }

      viewStore.isStepOneDataCompleted = true
      viewStore.stepOneView = viewStore.STEP_ONE_PREFERENCES
    } else if (viewStore.stepOneView === viewStore.STEP_ONE_PREFERENCES) {
      const validForms = participantForms.value.filter(form => form != null)
      const validationResults = await Promise.all(validForms.map(form => form.validate()))
      const allValid = validationResults.every(result => result?.valid)

      if (!allValid) {
        showSimpleToast(t('please_fill_required_fields'), 'error')
        return
      }

      viewStore.isStepOnePreferencesCompleted = true
      viewStore.goToNextStep()
    }
  }
</script>

<template>
  <div class="d-flex flex-column justify-space-between h-100 flex-1">
    <!-- tabs navigation remains the same -->
    <div class="tabs-holder-secondary">
      <VTabs
        v-model="viewStore.stepOneView"
        align-tabs="center"
        class="tabs-navigation"
        density="compact"
        hide-slider
      >
        <VTab
          :aria-label="$t('participants')"
          class="fs-11 text-capitalize ls-0 "
          :class="mobile ? 'pr-0 pl-0 ml-2': 'justify-start'"
          :value="viewStore.STEP_ONE_DATA"
        >
          1. {{ $t('stay_datails') }}
        </VTab>
        <VTab
          :aria-label="$t('classes')"
          class="fs-11 text-capitalize ls-0 "
          :class="mobile ? 'pr-0 pl-0': ''"
          :disabled="!stayStore.dateOfStay"
          :value="viewStore.STEP_ONE_PREFERENCES"
        >
          2. {{ $t('participants_preferences') }}
        </VTab>
      </VTabs>
    </div>

    <VTabsWindow
      v-model="viewStore.stepOneView"
      class="d-flex flex-column h-100 flex-1"
    >
      <VTabsWindowItem
        class="h-100 flex-1"
        :class="viewStore.stepOneView === viewStore.STEP_ONE_DATA ? 'd-flex flex-column' : ''"
        :value="viewStore.STEP_ONE_DATA"
      >
        <div>
          <p class="fs-24 font-weight-bold my-4">
            {{ $t('booking_classes') }}:
          </p>
          <div class="my-4">
            <p
              class="fs-18 font-weight-medium mb-n2"
              :class="mobile ? 'fs-18' : 'fs-20'"
            >
              {{ $t('provide_details_of_your_stay') }}:
            </p>
            <small class="fs-11">
              {{ $t('select_day_or_period_of_stay') }}
            </small>
          </div>

          <VForm ref="dataForm">
            <div class="mb-6">
              <p class="custom-input-label mb-2">{{ $t('length_of_stay') }}</p>
              <DatePickerResponsive
                v-model="stayStore.dateOfStay"
                class="mb-2"
                :locale="currentLocale"
                :rules="[v => !!v || 'Required']"
              />
            </div>
            <div class="mb-6">
              <p class="custom-input-label mb-2">{{ $t('adults_number') }}</p>
              <VNumberInput
                v-model="stayStore.adultsNumber"
                class="mb-2"
                control-variant="split"
                hide-details="auto"
                :max="stayStore.maxAdults"
                max-width="165px"
                :min="stayStore.childrenNumber === 0 ? 1 : 0"
                :step="1"
                variant="outlined"
              />
              <p class="fs-12 fc-gray">
                {{ $t('enter_number_of_participants_adult') }}
              </p>
            </div>
            <div class="mb-6">
              <p class="custom-input-label mb-2">{{ $t('children_number') }}</p>
              <VNumberInput
                v-model="stayStore.childrenNumber"
                class="mb-2"
                control-variant="split"
                hide-details="auto"
                :max="stayStore.maxChildren"
                max-width="165px"
                :min="stayStore.adultsNumber === 0 ? 1 : 0"
                :step="1"
                variant="outlined"
              />
              <p class="fs-12 fc-gray">
                {{ $t('enter_number_of_participants_children') }}
              </p>
            </div>
          </VForm>
        </div>
      </VTabsWindowItem>

      <VTabsWindowItem
        class="h-100 flex-1"
        :class="viewStore.stepOneView === viewStore.STEP_ONE_PREFERENCES ? 'd-flex flex-column' : ''"
        :value="viewStore.STEP_ONE_PREFERENCES"
      >
        <div class="px-1">
          <p class="fs-20 font-weight-bold my-4">
            {{ $t('booking_classes') }}:
          </p>
          <div class="my-4">
            <p class="fs-18 fc-blue font-weight-medium mb-n2">
              {{ $t('participants_preferences') }}:
            </p>
            <small class="fs-11">
              {{ $t('enter_preferences_details') }}
            </small>
          </div>

          <div class="d-flex flex-column ga-4 my-4">
            <ParticipantAccordion
              v-for="(participant, index) in stayStore.participants"
              :key="index"
              :ref="el => participantForms[index] = el"
              class="ga-4"
              :index="index"
              :participant="participant"
            />
          </div>
        </div>
      </VTabsWindowItem>
    </VTabsWindow>

    <div class="navigation-tab-actions d-flex ga-4 justify-space-between ">
      <VBtn
        v-if="viewStore.stepOneView === viewStore.STEP_ONE_PREFERENCES"
        class="fs-16 text-capitalize flex-1"
        color="blue"
        prepend-icon="mdi-arrow-left"
        size="x-large"
        variant="outlined"
        @click="viewStore.stepOneView = viewStore.STEP_ONE_DATA"
      >
        {{ $t('previous') }}
      </VBtn>
      <VBtn
        class="fs-16 text-capitalize flex-2"
        color="blue"
        :disabled="!stayStore.dateOfStay"
        size="x-large"
        variant="flat"
        @click="handleNextClick"
      >
        <!--        :disabled="!isFormValid"-->
        {{ $t('next') }}
      </VBtn>
    </div>

    <VDialog
      v-model="classesModalOpen"
      content-class="under-app-bar"
      fullscreen
      scrollable
    >
      <VCard>
        <VCardTitle>
          <div class="d-flex justify-space-between align-center" :class="mobile ? 'fs-16 py-2':''">
            <div class="d-flex align-center ga-3">
              <VIcon icon="mdi-account" size="18" />
              <span class="fw-600">{{ selectedParticipant?.name || '-' }}</span>
            </div>
            <VBtn icon="mdi-close" variant="text" @click="closeClassesModal" />
          </div>
        </VCardTitle>
        <VCardText>
          <div class="mb-4">
            <p class="fw-500 mb-2" :class="mobile ? 'fs-14':'fs-16'">
              {{ $t('select_day') || 'Wybór dnia' }}
            </p>
            <VCarousel height="260" hide-delimiter-background>
              <VCarouselItem v-for="(day, idx) in 5" :key="idx">
                <VCard class="ma-2" elevation="2">
                  <VCardText>
                    <div :class="mobile ? 'fs-12':'fs-14'">
                      {{ $t('selected') }}: {{ idx + 1 }}/5
                    </div>
                    <div class="mt-4">
                      {{ $t('add_classes') }}
                    </div>
                  </VCardText>
                </VCard>
              </VCarouselItem>
            </VCarousel>
          </div>
        </VCardText>
        <VCardActions class="border-t d-flex justify-between text-capitalize">
          <VBtn prepend-icon="mdi-arrow-left" variant="outlined" @click="closeClassesModal">
            {{ $t('previous') }}
          </VBtn>
          <VBtn class="px-4" color="blue" variant="flat" @click="closeClassesModal">
            {{ $t('save') }} & {{ $t('next') }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<style scoped>
.under-app-bar {
  top: 64px;
  height: calc(100% - 64px);
}
</style>
