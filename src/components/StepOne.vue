<script setup>
import DatePickerResponsive from "@/components/DatePickerResponsive.vue";
import {useStayStore} from '@/stores/StayStore.js'
import {computed, ref} from "vue";
import {useCookies} from "@vueuse/integrations/useCookies";
import {useToast} from '@/composables/useToast'
import {useViewControlStore} from "@/stores/ViewControlStore.js";
import {useDisplay} from 'vuetify'
import ParticipantAccordion from "@/components/ParticipantAccordion.vue";
import {useI18n} from "vue-i18n";

const {showSimpleToast, showActionToast} = useToast()
const stayStore = useStayStore()
const viewStore = useViewControlStore()
const cookies = useCookies(['locale'])
const {mobile} = useDisplay()
const currentLocale = computed(() => cookies.get('locale') || 'pl')
const {t} = useI18n()

// Form refs
const dataForm = ref(null)
const participantForms = ref([])
// Watch for changes in participants count and reset form refs
watch(() => stayStore.participants.length, () => {
  participantForms.value = []
})

const handleNextClick = async () => {
  if (viewStore.stepOneView === viewStore.STEP_ONE_DATA) {
    const {valid} = await dataForm.value.validate()
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
        density="compact"
        class="tabs-navigation"
        hide-slider
      >
        <VTab
          :value="viewStore.STEP_ONE_DATA"
          :aria-label="$t('participants')"
          :class="mobile ? 'pr-0 pl-0 ml-2': 'justify-start'"
          class="fs-11 text-capitalize ls-0 "
        >
          1. {{ $t('stay_datails') }}
        </VTab>
        <VTab
          :value="viewStore.STEP_ONE_PREFERENCES"
          :disabled="!stayStore.dateOfStay"
          :aria-label="$t('classes')"
          :class="mobile ? 'pr-0 pl-0': ''"
          class="fs-11 text-capitalize ls-0 "
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
        :value="viewStore.STEP_ONE_DATA"
        class="h-100 flex-1"
        :class="viewStore.stepOneView === viewStore.STEP_ONE_DATA ? 'd-flex flex-column' : ''"
      >
        <div>
          <p class="fs-24 font-weight-bold my-4">
            {{ $t('booking_classes') }}:
          </p>
          <div class="my-4">
            <p
              :class="mobile ? 'fs-18' : 'fs-20'"
              class="fs-18 font-weight-medium mb-n2"
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
                :locale="currentLocale"
                class="mb-2"
                :rules="[v => !!v || 'Required']"
              />
            </div>
            <div class="mb-6">
              <p class="custom-input-label mb-2">{{ $t('adults_number') }}</p>
              <VNumberInput
                v-model="stayStore.adultsNumber"
                class="mb-2"
                variant="outlined"
                controlVariant="split"
                hide-details="auto"
                :step="1"
                :min="stayStore.childrenNumber === 0 ? 1 : 0"
                :max="stayStore.maxAdults"
                max-width="165px"
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
                variant="outlined"
                controlVariant="split"
                hide-details="auto"
                :step="1"
                :min="stayStore.adultsNumber === 0 ? 1 : 0"
                :max="stayStore.maxChildren"
                max-width="165px"
              />
              <p class="fs-12 fc-gray">
                {{ $t('enter_number_of_participants_children') }}
              </p>
            </div>
          </VForm>
        </div>
      </VTabsWindowItem>

      <VTabsWindowItem
        :value="viewStore.STEP_ONE_PREFERENCES"
        class="h-100 flex-1"
        :class="viewStore.stepOneView === viewStore.STEP_ONE_PREFERENCES ? 'd-flex flex-column' : ''"
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
        variant="outlined"
        size="x-large"
        color="blue"
        class="fs-16 text-capitalize flex-1"
        prepend-icon="mdi-arrow-left"
        @click="viewStore.stepOneView = viewStore.STEP_ONE_DATA"
      >
        {{ $t('previous') }}
      </VBtn>
      <VBtn
        variant="flat"
        size="x-large"
        color="blue"
        class="fs-16 text-capitalize flex-2"
        :disabled="!stayStore.dateOfStay"
        @click="handleNextClick"
      >
        <!--        :disabled="!isFormValid"-->
        {{ $t('next') }}
      </VBtn>
    </div>
  </div>
</template>
