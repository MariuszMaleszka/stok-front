import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useTimerStore = defineStore('timerStore', () => {
  const timeRemaining = ref(20 * 60) // 20 minutes in seconds
  const timerInterval = ref(null)
  const isTimerActive = ref(false)

  const formattedTime = computed(() => {
    const minutes = Math.floor(timeRemaining.value / 60)
    const seconds = timeRemaining.value % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  })

  const startTimer = () =>  {
    if (timerInterval.value) return

    isTimerActive.value = true
    timerInterval.value = setInterval(() => {
      if (timeRemaining.value > 0) {
        timeRemaining.value--
      } else {
        stopTimer()
      }
    }, 1000)
  }

  const stopTimer = () => {
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
      timerInterval.value = null
      isTimerActive.value = false
    }
  }

  const resetTimer = () =>  {
    stopTimer()
    timeRemaining.value = 20 * 60
  }

  // Add 5 minutes to the current timer
  const addFiveMinutes = () => {
    timeRemaining.value += 5 * 60 // Add 5 minutes in seconds
  }

  return {
    timeRemaining,
    formattedTime,
    isTimerActive,
    startTimer,
    stopTimer,
    resetTimer,
    addFiveMinutes
  }
})
