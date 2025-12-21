<script setup>
  import { useCookies } from '@vueuse/integrations/useCookies'
  import { computed, onMounted, ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useDisplay } from 'vuetify'
  import DatePickerResponsive from '@/components/DatePickerResponsive.vue'
  import { useToast } from '@/composables/useToast'
  import { useStayStore } from '@/stores/StayStore.js'
  import { useTimerStore } from '@/stores/TimerStore.js'
  import { useViewControlStore } from '@/stores/ViewControlStore.js'

  const timerStore = useTimerStore()

  const { showSimpleToast, showActionToast } = useToast()
  const stayStore = useStayStore()
  const viewStore = useViewControlStore()
  const cookies = useCookies(['locale'])
  const { mobile } = useDisplay()
  const currentLocale = computed(() => cookies.get('locale') || 'pl')
  const { t } = useI18n()
  watch(() => timerStore.timeRemaining, remaining => {
    if (remaining === 0) {
      showSimpleToast(t('time_expired'), 'warning')
    }
  })

// onMounted(() => {
//   timerStore.startTimer()
// })
</script>

<template>
  <div class="d-flex flex-column justify-space-between h-100 flex-1">
    <!-- tabs navigation remains the same -->
    <div>

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
  </div>
</template>
