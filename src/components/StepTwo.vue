<script setup>
import DatePickerResponsive from "@/components/DatePickerResponsive.vue";
import {useStayStore} from '@/stores/StayStore.js'
import {computed, ref} from "vue";
import {useCookies} from "@vueuse/integrations/useCookies";
import {useToast} from '@/composables/useToast'
import {useViewControlStore} from "@/stores/ViewControlStore.js";
import {useDisplay} from 'vuetify'
import {useI18n} from "vue-i18n";
import { useTimerStore } from '@/stores/TimerStore.js'

const timerStore = useTimerStore()

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

const isFormValid = computed(() => {

})
const handleNextClick = async () => {

}

watch(() => timerStore.timeRemaining, (remaining) => {
  if (remaining === 0) {
    showSimpleToast(t('time_expired'), 'warning')
  }
})

onMounted(() => {
  timerStore.startTimer()
})
</script>

<template>
  <div class="d-flex flex-column justify-space-between h-100 flex-1">
    <!-- tabs navigation remains the same -->
    <div>
      <div class="time-counter fs-12 text-center mt-2">
        {{ $t('timer_info') }}
        <span class="black-badge ">

        {{ timerStore.formattedTime }}
        </span>
      </div>
      <div>

      </div>

    <p class="fs-20 font-weight-bold my-4">
      {{ $t('select_classes') }}:
    </p>
    <div class="my-4">
      <p class="fs-18 font-weight-medium mb-n2">
        {{ $t('select_classes_for_each_participant') }}:
      </p>
      <small class="fs-11">
        {{ $t('select_day_or_period_of_stay') }}
      </small>
    </div>
    </div>


    <div class="navigation-tab-actions d-flex ga-4 justify-space-between ">
      <VBtn
        variant="outlined"
        size="x-large"
        color="blue"
        class="fs-16 text-capitalize flex-1"
        prepend-icon="mdi-arrow-left"
        @click="viewStore.currentView = 'one'; viewStore.stepOne = viewStore.STEP_ONE_PREFERENCES"
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
