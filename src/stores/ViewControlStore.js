import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useViewControlStore = defineStore('viewStore', () => {
  // Constants for tab values
  const STEP_ONE_DATA = 'step_one_data'
  const STEP_ONE_PREFERENCES = 'step_one_preferences'
  const STEP_TWO = 'two'
  const STEP_THREE = 'three'

  // Main tabs/steps: 'one', 'two', 'three'
  const currentView = ref('one')

  // Internal step for tab 'one'
  const stepOne = ref(STEP_ONE_DATA)

  // Flags to track completion
  const isStepOneDataCompleted = ref(false)
  const isStepOnePreferencesCompleted = ref(false)
  const isStepTwoCompleted = ref(false)

  // Computed flags
  const canProceedFromStepOneData = computed(() => isStepOneDataCompleted.value)
  const canProceedFromStepOnePreferences = computed(() => isStepOnePreferencesCompleted.value)
  const canProceedFromStepTwo = computed(() => isStepTwoCompleted.value)

  // Navigation method
  function goToNextStep() {
    if (currentView.value === 'one') {
      if (stepOne.value === STEP_ONE_DATA && canProceedFromStepOneData.value) {
        stepOne.value = STEP_ONE_PREFERENCES
      } else if (stepOne.value === STEP_ONE_PREFERENCES && canProceedFromStepOnePreferences.value) {
        currentView.value = STEP_TWO
      }
    } else if (currentView.value === STEP_TWO && canProceedFromStepTwo.value) {
      currentView.value = STEP_THREE
    }
  }

  // Reset methods
  function resetStepOne() {
    stepOne.value = STEP_ONE_DATA
    isStepOneDataCompleted.value = false
    isStepOnePreferencesCompleted.value = false
  }

  return {
    currentView,
    stepOne,
    STEP_ONE_DATA,
    STEP_ONE_PREFERENCES,
    STEP_TWO,
    STEP_THREE,
    isStepOneDataCompleted,
    isStepOnePreferencesCompleted,
    isStepTwoCompleted,
    canProceedFromStepOneData,
    canProceedFromStepOnePreferences,
    canProceedFromStepTwo,
    goToNextStep,
    resetStepOne
  }
})
