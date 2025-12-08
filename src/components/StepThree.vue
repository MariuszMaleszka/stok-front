<script setup>
import DatePickerResponsive from "@/components/DatePickerResponsive.vue";
import {useStayStore} from '@/stores/StayStore.js'
import {computed, ref} from "vue";
import {useCookies} from "@vueuse/integrations/useCookies";
import {useToast} from '@/composables/useToast'
import {useViewControlStore} from "@/stores/ViewControlStore.js";
import {useDisplay} from 'vuetify'
import SelectedParticipantClasses from "@/components/SelectedParticipantClasses.vue";
import {useI18n} from "vue-i18n";
import ParticipantAccordion from "@/components/ParticipantAccordion.vue";

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

const handleNextClick = async () => {
  if (viewStore.stepOne === viewStore.STEP_ONE_DATA) {
    const {valid} = await dataForm.value.validate()
    if (!valid) {
      showSimpleToast(t('please_fill_required_fields'), 'error')
      return
    }
    viewStore.isStepOneDataCompleted = true
    viewStore.stepOne = viewStore.STEP_ONE_PREFERENCES
  } else if (viewStore.stepOne === viewStore.STEP_ONE_PREFERENCES) {
    const validationResults = await Promise.all(
      participantForms.value.map(form => form?.validate())
    )
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
        v-model="viewStore.stepThreeView"
        align-tabs="center"
        density="compact"
        class="tabs-navigation"
        hide-slider
      >
        <VTab
          :value="viewStore.STEP_THREE_CART"
          :aria-label="$t('participants')"
          :class="mobile ? 'pr-0 pl-0 ml-2': 'justify-start'"
          class="fs-11 text-capitalize ls-0 "
        >
          1. {{ $t('cart') }}
        </VTab>
        <VTab
          :value="viewStore.STEP_THREE_PARTICIPANTS_DETAILS"
          :disabled="!stayStore.dateOfStay"
          :aria-label="$t('classes')"
          :class="mobile ? 'pr-0 pl-0': ''"
          class="fs-11 text-capitalize ls-0 "
        >
          2. {{ $t('participants_data') }}
        </VTab>
        <VTab
          :value="viewStore.STEP_THREE_PARTICIPANTS_PAYMENT"
          :disabled="!stayStore.dateOfStay"
          :aria-label="$t('classes')"
          :class="mobile ? 'pr-0 pl-0': ''"
          class="fs-11 text-capitalize ls-0 "
        >
          3. {{ $t('payment') }}
        </VTab>
      </VTabs>
    </div>

    <VTabsWindow
      v-model="viewStore.stepThreeView"
      class="d-flex flex-column h-100 flex-1"
    >
      <VTabsWindowItem
        :value="viewStore.STEP_THREE_CART"
        class="h-100 flex-1"
        :class="viewStore.stepThreeView === viewStore.STEP_THREE_CART ? 'd-flex flex-column' : ''"
      >
        <div>
          <p
            class="fs-24 font-weight-bold my-4"
          >
            {{ $t('cart') }}
          </p>
          <div class="my-4">
            <p
              :class="mobile ? 'fs-14' : 'fs-16'"
              class="font-weight-medium mb-n2"
            >
              {{ $t('cart_subtitle') }}
            </p>
          </div>
          <div
            :class="mobile ? 'fs-18' : 'fs-20'"
            class="mb-4 mt-8"
          >
            <p>{{ $t('selected_classes') }}:</p>
          </div>
          <div class="px-1">
            <SelectedParticipantClasses
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

      <VTabsWindowItem
        :value="viewStore.STEP_THREE_PARTICIPANTS_DETAILS"
        class="h-100 flex-1"
        :class="viewStore.stepThreeView === viewStore.STEP_THREE_PARTICIPANTS_DETAILS ? 'd-flex flex-column' : ''"
      >
        <div>
          <p class="fs-24 font-weight-bold my-4">
            {{ $t('participants_data') }}:
          </p>
          <div class="my-4">
            <p
              :class="mobile ? 'fs-18' : 'fs-20'"
              class="font-weight-medium "
            >
              {{ $t('participants_preferences') }}:
            </p>
            <p
              :class="mobile ? 'fs-14' : 'fs-16'"
              class="fs-11"
            >
              {{ $t('enter_preferences_details') }}
            </p>
          </div>

        </div>
      </VTabsWindowItem>
      <VTabsWindowItem
        :value="viewStore.STEP_THREE_PARTICIPANTS_PAYMENT"
        class="h-100 flex-1"
        :class="viewStore.stepThreeView === viewStore.STEP_THREE_PARTICIPANTS_PAYMENT ? 'd-flex flex-column' : ''"
      >
        <div class="px-1">
          <p class="fs-24 font-weight-bold my-4">
            {{ $t('payment') }}:
          </p>
          <div class="my-4">
            <p
              :class="mobile ? 'fs-14' : 'fs-16'"
              class="font-weight-medium "
            >
              {{ $t('participants_preferences') }}:
            </p>
          </div>

        </div>
      </VTabsWindowItem>
    </VTabsWindow>

    <div class="navigation-tab-actions d-flex ga-4 justify-space-between ">
<!--      <VBtn-->
<!--        v-if="viewStore.stepOne === viewStore.STEP_ONE_PREFERENCES"-->
<!--        variant="outlined"-->
<!--        size="x-large"-->
<!--        color="blue"-->
<!--        class="fs-16 text-capitalize flex-1"-->
<!--        prepend-icon="mdi-arrow-left"-->
<!--        @click="viewStore.stepOne = viewStore.STEP_ONE_DATA"-->
<!--      >-->
<!--        {{ $t('previous') }}-->
<!--      </VBtn>-->
<!--      <VBtn-->
<!--        variant="flat"-->
<!--        size="x-large"-->
<!--        color="blue"-->
<!--        class="fs-16 text-capitalize flex-2"-->
<!--        :disabled="!stayStore.dateOfStay"-->
<!--        @click="handleNextClick"-->
<!--      >-->
<!--        &lt;!&ndash;        :disabled="!isFormValid"&ndash;&gt;-->
<!--        {{ $t('next') }}-->
<!--      </VBtn>-->
    </div>
  </div>
</template>
