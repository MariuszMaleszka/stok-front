<script setup>
import {computed, ref, watch} from "vue"
import {useCookies} from "@vueuse/integrations/useCookies"
import {useDisplay} from 'vuetify'
import {useI18n} from "vue-i18n"

import DatePickerResponsive from "@/components/DatePickerResponsive.vue"
import ParticipantAccordion from "@/components/ParticipantAccordion.vue"
import {useStayStore} from '@/stores/StayStore.js'
import {useViewControlStore} from "@/stores/ViewControlStore.js"
import {useToast} from '@/composables/useToast'

const {t} = useI18n()
const {showSimpleToast} = useToast()
const stayStore = useStayStore()
const viewStore = useViewControlStore()
const cookies = useCookies(['locale'])
const {mobile} = useDisplay()
const currentLocale = computed(() => cookies.get('locale') || 'pl')

const stepOneNestedRef = ref(null)
const activeChildStep = ref(1)

const dataForm = ref(null)
const participantForms = ref([])

const validateCurrentStep = async () => {
  const results = await Promise.all(
    participantForms.value.map(form => form?.validate())
  )

  const allValid = results.every(result => result?.valid === true)

  if (!allValid) {
    showSimpleToast(t('please_fill_required_fields'), 'error')
  }

  return allValid
}


watch(() => stayStore.participants.length, () => {
  participantForms.value = []
})
watch(activeChildStep, async (newStep) => {
  await nextTick()
  viewStore.currentStep.child = newStep
})
defineExpose({
  stepOneNestedRef,
  validateCurrentStep
})


</script>

<template>
  <VStepper
    ref="stepOneNestedRef"
    v-model="activeChildStep"
    class="step-one-element d-flex flex-column flex-1"
    flat
    hide-actions
  >
    <VStepperHeader>
      <VStepperItem
        :value="1"
        :title="$t('stay_datails')"
        :complete="viewStore.isStepOneDataCompleted"
      />
      <VStepperItem
        :value="2"
        :title="$t('participants_preferences')"
      />
    </VStepperHeader>

    <VStepperWindow class="flex-1">
      <VStepperWindowItem :value="1">
        <div>
          <p class="fs-24 font-weight-bold my-4">
            {{ $t('booking_classes') }}:
          </p>
          <div class="my-4">
            <p
              :class="mobile ? 'fs-18' : 'fs-20'"
              class="font-weight-medium mb-n2"
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
      </VStepperWindowItem>

      <VStepperWindowItem :value="2">
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
              ref="participantForms"
              v-for="(participant, index) in stayStore.participants"
              :key="index"
              :ref="el => participantForms[index] = el"
              class="ga-4"
              :index="index"
              :participant="participant"
            />
          </div>
        </div>
      </VStepperWindowItem>
    </VStepperWindow>
  </VStepper>
</template>
<style lang="scss">
.step-one-element {
  .v-stepper-header {
    .v-avatar {
      display: none;
    }
  }

}

</style>
