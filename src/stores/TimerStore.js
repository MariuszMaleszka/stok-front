import { defineStore } from 'pinia'
import { computed, h, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import TimerToastContent from '@/components/toasts/TimerToast.vue'
import { useToast } from '@/composables/useToast'

export const useTimerStore = defineStore('timerStore', () => {
  const { t } = useI18n()
  const router = useRouter()
  const timeRemaining = ref(0.1 * 60)
  const timerInterval = ref(null)
  const resetTimeout = ref(null)
  const isTimerActive = ref(false)
  const fiveMinuteWarningShown = ref(false)

  const { showSimpleToast, showActionToast } = useToast()

  const formattedTime = computed(() => {
    const minutes = Math.floor(timeRemaining.value / 60)
    const seconds = timeRemaining.value % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  })

  const startTimer = () => {
    if (timerInterval.value) {
      return
    }

    isTimerActive.value = true
    timerInterval.value = setInterval(() => {
      if (timeRemaining.value > 0) {
        timeRemaining.value--

        if (timeRemaining.value === 5 * 60 && !fiveMinuteWarningShown.value) {
          fiveMinuteWarningShown.value = true
          showActionToast(
            h(TimerToastContent, {
              timeExpireWarning: t('time_expire_warning'),
              timeLeftLabel: t('time_left'),
            }),
            t('extend_time_by_5'),
            () => addFiveMinutes(),
            'margin-left: 40px; width:calc(100% - 40px); background: #1a56db; margin-top: 8px;',
          )
        }
      } else {
        stopTimer()
        resetBooking()
      }
    }, 1000)
  }

  const stopTimer = () => {
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
      timerInterval.value = null
      isTimerActive.value = false
    }
    if (resetTimeout.value) {
      clearTimeout(resetTimeout.value)
      resetTimeout.value = null
    }
  }

  const resetTimer = () => {
    stopTimer()
    timeRemaining.value = 20 * 60
    fiveMinuteWarningShown.value = false
  }

  const resetBooking = () => {
    showSimpleToast(t('booking_time_expired'), 'warning')

    resetTimeout.value = setTimeout(() => {
      router.push('/')
    }, 2000)
  }

  const addFiveMinutes = () => {
    if (resetTimeout.value) {
      clearTimeout(resetTimeout.value)
      resetTimeout.value = null
    }
    timeRemaining.value += 5 * 60
    fiveMinuteWarningShown.value = false
    showSimpleToast(t('added_5_minutes'), 'success')
  }

  return {
    timeRemaining,
    formattedTime,
    isTimerActive,
    startTimer,
    stopTimer,
    resetTimer,
    addFiveMinutes,
  }
})
