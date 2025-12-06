/* eslint-disable unicorn/no-array-for-each */
/* eslint-disable unicorn/no-negated-condition */
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useViewControlStore = defineStore('viewStore', () => {

  // Main tabs/steps: 'one', 'two', 'three'
  const currentView = ref('one')

  // Internal step for tab 'one': 'data' or 'preferences'
  const stepOne = ref('data')

  // Internal step for tab 'three': 'cart', 'data', or 'payment'
  const stepThree = ref('cart')

  // Helper to check if we can proceed to next main tab
  const canProceedFromOne = computed(() => {
    return stepOne.value === 'preferences' // Must complete both internal steps
  })

  const canProceedFromThree = computed(() => {
    return stepThree.value === 'payment' // Must reach payment step
  })

  // Reset internal steps when changing main tabs
  function resetStepOne() {
    stepOne.value = 'data'
  }

  function resetStepThree() {
    stepThree.value = 'cart'
  }

  return {
    currentView,
    stepOne,
    stepThree,
    canProceedFromOne,
    canProceedFromThree,
    resetStepOne,
    resetStepThree
  }
})
