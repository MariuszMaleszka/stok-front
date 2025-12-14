<script setup>
  import { useCookies } from '@vueuse/integrations/useCookies'
  import { computed, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useDisplay } from 'vuetify'
  import DatePickerResponsive from '@/components/DatePickerResponsive.vue'
  import ParticipantAccordion from '@/components/ParticipantAccordion.vue'
  import SelectedParticipantClasses from '@/components/SelectedParticipantClasses.vue'
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

  async function handleNextClick () {
    if (viewStore.stepOne === viewStore.STEP_ONE_DATA) {
      const { valid } = await dataForm.value.validate()
      if (!valid) {
        showSimpleToast(t('please_fill_required_fields'), 'error')
        return
      }
      viewStore.isStepOneDataCompleted = true
      viewStore.stepOne = viewStore.STEP_ONE_PREFERENCES
    } else if (viewStore.stepOne === viewStore.STEP_ONE_PREFERENCES) {
      const validationResults = await Promise.all(
        participantForms.value.map(form => form?.validate()),
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
        class="tabs-navigation"
        density="compact"
        hide-slider
      >
        <VTab
          :aria-label="$t('participants')"
          class="fs-11 text-capitalize ls-0 "
          :class="mobile ? 'pr-0 pl-0 ml-2': 'justify-start'"
          :value="viewStore.STEP_THREE_CART"
        >
          1. {{ $t('cart') }}
        </VTab>
        <VTab
          :aria-label="$t('classes')"
          class="fs-11 text-capitalize ls-0 "
          :class="mobile ? 'pr-0 pl-0': ''"
          :disabled="!stayStore.dateOfStay"
          :value="viewStore.STEP_THREE_PARTICIPANTS_DETAILS"
        >
          2. {{ $t('participants_data') }}
        </VTab>
        <VTab
          :aria-label="$t('classes')"
          class="fs-11 text-capitalize ls-0 "
          :class="mobile ? 'pr-0 pl-0': ''"
          :disabled="!stayStore.dateOfStay"
          :value="viewStore.STEP_THREE_PARTICIPANTS_PAYMENT"
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
        class="h-100 flex-1"
        :class="viewStore.stepThreeView === viewStore.STEP_THREE_CART ? 'd-flex flex-column' : ''"
        :value="viewStore.STEP_THREE_CART"
      >
        <div>
          <p
            class="fs-24 font-weight-bold my-4"
          >
            {{ $t('cart') }}
          </p>
          <div class="my-4">
            <p
              class="font-weight-medium mb-n2"
              :class="mobile ? 'fs-14' : 'fs-16'"
            >
              {{ $t('cart_subtitle') }}
            </p>
          </div>
          <div
            class="mb-4 mt-8"
            :class="mobile ? 'fs-18' : 'fs-20'"
          >
            <p>{{ $t('selected_classes') }}:</p>
          </div>
          <div class="d-flex flex-column ga-4 px-1">
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
        class="h-100 flex-1"
        :class="viewStore.stepThreeView === viewStore.STEP_THREE_PARTICIPANTS_DETAILS ? 'd-flex flex-column' : ''"
        :value="viewStore.STEP_THREE_PARTICIPANTS_DETAILS"
      >
        <div>
          <p class="fs-24 font-weight-bold my-4">
            {{ $t('participants_data') }}:
          </p>
          <div class="my-4">
            <p
              class="font-weight-medium "
              :class="mobile ? 'fs-18' : 'fs-20'"
            >
              {{ $t('participants_preferences') }}:
            </p>
            <p
              class="fs-11"
              :class="mobile ? 'fs-14' : 'fs-16'"
            >
              {{ $t('enter_preferences_details') }}
            </p>
          </div>

        </div>
      </VTabsWindowItem>
      <VTabsWindowItem
        class="h-100 flex-1"
        :class="viewStore.stepThreeView === viewStore.STEP_THREE_PARTICIPANTS_PAYMENT ? 'd-flex flex-column' : ''"
        :value="viewStore.STEP_THREE_PARTICIPANTS_PAYMENT"
      >
        <div class="px-1">
          <p class="fs-24 font-weight-bold my-4">
            {{ $t('payment') }}:
          </p>
          <div class="my-4">
            <p
              class="font-weight-medium "
              :class="mobile ? 'fs-14' : 'fs-16'"
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
