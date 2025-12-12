<script setup>
import DatePickerResponsive from "@/components/DatePickerResponsive.vue";
import {useStayStore} from '@/stores/StayStore.js'
import {computed, ref, watch} from "vue";
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
const stepThreeNestedRef = ref(null)
const activeChildStep = ref(1)

watch(activeChildStep, async (newStep) => {
  await nextTick()
  viewStore.currentStep.child = newStep
})
// Expose for parent access
defineExpose({
  stepThreeNestedRef,
})

</script>

<template>
  <VStepper
    ref="stepThreeNestedRef"
    v-model="activeChildStep"
    class="step-three-element d-flex flex-column flex-1"
    flat
    hide-actions
  >

    <VStepperHeader>
      <VStepperItem
        :value="1"
        :title="$t('cart')"
      />
      <VStepperItem
        :value="2"
        :title="$t('participants_data')"
      />
      <VStepperItem
        :value="3"
        :title="$t('payment')"
      />
    </VStepperHeader>

    <VStepperWindow class="flex-1">
      <VStepperWindowItem :value="1">
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
      </VStepperWindowItem>

      <VStepperWindowItem :value="2">
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
      </VStepperWindowItem>

      <VStepperWindowItem :value="3">
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
      </VStepperWindowItem>
    </VStepperWindow>
  </VStepper>

</template>
