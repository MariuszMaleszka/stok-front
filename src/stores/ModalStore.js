/* eslint-disable unicorn/no-array-for-each */
/* eslint-disable unicorn/no-negated-condition */
import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'

export const useModalStore = defineStore('modalManager', () => {
  const focusAfterClose = ref('') // id to focus when modal is closed

  // Confirmation dialog state
  const confirmationDialogTitle = ref('')
  const confirmationDialogText = ref('')
  const confirmationDialogVisible = ref(false)
  const onConfirmationResult = ref(null)

  // Modal states
  // TODO: naming convention - no "Dialog" suffixes, the rest as the component is named
  const modals = reactive({
    dateRangePicker: false, // modal for picking date range
  })

  // Store for modal parameters
  const modalParams = reactive({})
  const modalResults = reactive({})
  const modalResolvers = reactive({})

  //
  // Manage dialogs
  // modalName -
  // focusElementId - id of html element that will be focused after modal is closed;
  // params - object with parameters to pass to modal
  //
  const openModal = (modalName, focusElementId = '', closeOtherModals = false, params = {}) => {
    if (closeOtherModals) {
      resetModals()
    }
    if (modals[modalName] !== undefined) {
      modals[modalName] = true
      // Set parameters for the modal
      modalParams[modalName] = params
      // Create new Promise for this modal instance
      return new Promise(resolve => {
        modalResolvers[modalName] = resolve
      })
    } else {
      console.error(`Modal '${modalName}' does not exists.`)
      return Promise.reject(new Error(`Modal '${modalName}' nie istnieje.`))
    }
    // eslint-disable-next-line no-unreachable
    if (focusElementId.length > 0) {
      focusAfterClose.value = focusElementId
    }
  }

  const closeModal = (modalName, result = null) => {
    if (modals[modalName] !== undefined) {
      modals[modalName] = false
      // Store the result
      modalResults[modalName] = result
      // Resolve the promise if there's a resolver
      if (modalResolvers[modalName]) {
        modalResolvers[modalName](result)
        modalResolvers[modalName] = null
      }
      // Clear parameters when closing modal
      modalParams[modalName] = {}
    } else {
      console.error(`Modal '${modalName}' nie istnieje.`)
    }
  }

  const toggleModal = modalName => {
    if (modals[modalName] !== undefined) {
      modals[modalName] = !modals[modalName]
    } else {
      console.error(`Modal '${modalName}' nie istnieje.`)
    }
  }

  const resetModals = () => {
    Object.keys(modals).forEach((key) => {
      modals[key] = false
      modalParams[key] = {}
      modalResults[key] = null
      if (modalResolvers[key]) {
        modalResolvers[key](null)
        modalResolvers[key] = null
      }
    })
  }

  // Opens confirmation modal with a message and title
  const openConfirmationModal = (message, title = '') => {
    return new Promise(resolve => {
      confirmationDialogTitle.value = title
      confirmationDialogText.value = message
      confirmationDialogVisible.value = true
      onConfirmationResult.value = resolve
    })
  }

  // Handles the confirmation modal result
  const handleConfirmation = result => {
    if (onConfirmationResult.value) {
      onConfirmationResult.value(result) // Call the resolve function with the result
      onConfirmationResult.value = null
    }
    confirmationDialogVisible.value = false
    setTimeout(() => {
      confirmationDialogTitle.value = ''
      confirmationDialogText.value = ''
    }, 250)
  }

  return {
    modals,
    modalParams,
    modalResults,
    openModal,
    closeModal,
    toggleModal,
    resetModals,
    focusAfterClose,
    confirmationDialogTitle,
    confirmationDialogText,
    confirmationDialogVisible,
    openConfirmationModal,
    handleConfirmation,
  }
})
