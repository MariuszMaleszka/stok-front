import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useViewControlStore = defineStore('viewStore', () => {
  // Constants
  const STEP_ONE = 'one'
  const STEP_TWO = 'two'
  const STEP_THREE = 'three'

  const STEP_ONE_DATA = 'data'
  const STEP_ONE_PREFERENCES = 'preferences'

  const STEP_THREE_CART = 'step_three_cart'
  const STEP_THREE_PARTICIPANTS_DETAILS = 'step_three_participants_details'
  const STEP_THREE_PARTICIPANTS_PAYMENT = 'step_three_participants_payment'

  // State
  const currentView = ref(STEP_ONE)
  const stepOneView = ref(STEP_ONE_DATA)
  const stepThreeView = ref(STEP_THREE_CART)

  const isStepOneDataCompleted = ref(false)
  const isStepOnePreferencesCompleted = ref(false)
  const isStepTwoCompleted = ref(false)

  // Computed
  const canProceedFromStepOneData = computed(() => isStepOneDataCompleted.value)
  const canProceedFromStepOnePreferences = computed(() => isStepOnePreferencesCompleted.value)
  const canProceedFromStepTwo = computed(() => isStepTwoCompleted.value)

  // Methods
  function goToNextStep () {
    if (currentView.value === STEP_ONE) {
      if (stepOneView.value === STEP_ONE_DATA && canProceedFromStepOneData.value) {
        stepOneView.value = STEP_ONE_PREFERENCES
      } else if (stepOneView.value === STEP_ONE_PREFERENCES && canProceedFromStepOnePreferences.value) {
        currentView.value = STEP_TWO
      }
    } else if (currentView.value === STEP_TWO && canProceedFromStepTwo.value) {
      currentView.value = STEP_THREE
    }
  }

  function goToPreviousStep () {
    if (currentView.value === STEP_ONE && stepOneView.value === STEP_ONE_PREFERENCES) {
      stepOneView.value = STEP_ONE_DATA
    } else if (currentView.value === STEP_TWO) {
      currentView.value = STEP_ONE
      stepOneView.value = STEP_ONE_PREFERENCES
    }
  }

  function resetStepOne () {
    stepOneView.value = STEP_ONE_DATA
    isStepOneDataCompleted.value = false
    isStepOnePreferencesCompleted.value = false
  }

  return {
    // Constants
    STEP_ONE,
    STEP_TWO,
    STEP_THREE,
    STEP_ONE_DATA,
    STEP_ONE_PREFERENCES,
    STEP_THREE_CART,
    STEP_THREE_PARTICIPANTS_DETAILS,
    STEP_THREE_PARTICIPANTS_PAYMENT,

    // State
    currentView,
    stepOneView,
    stepThreeView,
    isStepOneDataCompleted,
    isStepOnePreferencesCompleted,
    isStepTwoCompleted,

    // Computed
    canProceedFromStepOneData,
    canProceedFromStepOnePreferences,
    canProceedFromStepTwo,

    // Methods
    goToNextStep,
    goToPreviousStep,
    resetStepOne,
  }
})
