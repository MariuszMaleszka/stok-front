<script setup>
import DatePickerResponsive from "@/components/DatePickerResponsive.vue";
import {useStayStore} from '@/stores/StayStore.js'
import {computed} from "vue";
import {useCookies} from "@vueuse/integrations/useCookies";
import {useToast} from '@/composables/useToast'
import {useViewControlStore} from "@/stores/ViewControlStore.js";
import {useDisplay} from 'vuetify'
import ParticipantAccordion from "@/components/ParticipantAccordion.vue";


const {showSimpleToast, showActionToast} = useToast()
const stayStore = useStayStore()
const viewStore = useViewControlStore()
const cookies = useCookies(['locale'])
const {mobile} = useDisplay()
const currentLocale = computed(() => cookies.get('locale') || 'pl')


const handleNextClick = () => {
  if (viewStore.stepOne === viewStore.STEP_ONE_DATA) {
    viewStore.isStepOneDataCompleted = true
    viewStore.stepOne = viewStore.STEP_ONE_PREFERENCES
  } else if (viewStore.stepOne === viewStore.STEP_ONE_PREFERENCES) {
    viewStore.isStepOnePreferencesCompleted = true
    viewStore.goToNextStep()
  }
}


</script>

<template>
  <div class="d-flex flex-column justify-space-between h-100 flex-1">

    <div class="tabs-holder-secondary">
      <VTabs
        v-model="viewStore.stepOne"
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
          1.
          {{ $t('stay_datails') }}
        </VTab>
        <VTab
          :value="viewStore.STEP_ONE_PREFERENCES"
          :disabled="!stayStore.dateOfStay"
          :aria-label="$t('classes')"
          :class="mobile ? 'pr-0 pl-0': ''"
          class="fs-11 text-capitalize ls-0 "
        >
          2.
          {{ $t('participants_preferences') }}
        </VTab>

      </VTabs>
    </div>


    <VTabsWindow
      v-model="viewStore.stepOne"
      class="d-flex flex-column h-100 flex-1"
    >
      <VTabsWindowItem
        :value="viewStore.STEP_ONE_DATA"
        class="h-100 flex-1"
        :class="viewStore.stepOne === viewStore.STEP_ONE_DATA ? 'd-flex flex-column' : ''"

      >
        <div>
          <p class="fs-20 font-weight-bold my-4">
            {{ $t('booking_classes') }}:
          </p>
          <div class="my-4">
            <p class="fs-18 fc-blue font-weight-medium mb-n2">
              {{ $t('provide_details_of_your_stay') }}:
            </p>
            <small class="fs-11">
              {{ $t('select_day_or_period_of_stay') }}
            </small>
          </div>


          <div class="mb-6">
            <p class="custom-input-label mb-2">{{ $t('length_of_stay') }}</p>
            <DatePickerResponsive
              v-model="stayStore.dateOfStay"
              :locale="currentLocale"
              class="mb-2"
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
              :min="1"
              :max="6"
              max-width="165px"
            >

            </VNumberInput>
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
              :min="1"
              :max="6"
              max-width="165px"
            >
            </VNumberInput>
            <p class="fs-12 fc-gray">
              {{ $t('enter_number_of_participants_children') }}
            </p>
          </div>
        </div>

      </VTabsWindowItem>
      <VTabsWindowItem
        :value="viewStore.STEP_ONE_PREFERENCES"
        class="h-100 flex-1"
        :class="viewStore.stepOne === viewStore.STEP_ONE_PREFERENCES ? 'd-flex flex-column' : ''"
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

          <div class="my-4">
            <VExpansionPanels>
              <ParticipantAccordion
                v-for="(participant, index) in stayStore.participants"
                :key="index"
                :index="index"
                :participant="participant"
              />
            </VExpansionPanels>

          </div>

        </div>


      </VTabsWindowItem>

    </VTabsWindow>

    <div class="navigation-tab-actions d-flex ga-4 justify-space-between ">
      <VBtn
        v-if="viewStore.stepOne === viewStore.STEP_ONE_PREFERENCES"
        variant="outlined"
        size="x-large"
        color="blue"
        class="fs-16 text-capitalize flex-1"
        @click="viewStore.stepOne = viewStore.STEP_ONE_DATA"
      >
        {{ $t('previous') }}
      </VBtn>
      <VBtn
        variant="flat"
        size="x-large"
        color="blue"
        class=" fs-16 text-capitalize flex-1"
        :disabled="!stayStore.dateOfStay"
        @click="handleNextClick"
      >
        {{ $t('next') }}
      </VBtn>
    </div>

  </div>
</template>

<style scoped lang="scss">

</style>
