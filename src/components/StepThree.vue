<!--
  StepThree Component - Cart, Participant Data & Payment Step

  This component handles the third major step of the booking process.
  It contains three child steps:
  1. Cart - Review selected classes, add insurance, apply loyalty card
  2. Participant Data - Enter details for all participants and stay manager
  3. Payment - Process payment (to be implemented)

  Features:
  - Multi-step nested stepper (3 child steps)
  - Form validation for all participant data
  - Loyalty card validation with async checking
  - Insurance selection for all participants
  - Stay manager selection and data entry
  - Optional payer data if different from manager
  - Optional invoice data for companies
  - Legal agreements acceptance
  - Real-time price calculation with discounts
-->

<script setup>
  import { useDebounceFn } from '@vueuse/core'
  // ============================================================================
  // IMPORTS - Vue & Utilities
  // ============================================================================
  import { computed, nextTick, ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'

  import { useDisplay } from 'vuetify'
  // ============================================================================
  // IMPORTS - Assets
  // ============================================================================
  import CheckGreenIcon from '@/assets/check-circle.svg'
  import WalletIcon from '@/assets/wallet.svg'
  // ============================================================================
  // IMPORTS - Components
  // ============================================================================
  import PopupSmall from '@/components/modals/PopupSmall.vue'
  import ParticipantData from '@/components/ParticipantData.vue'
  import SelectedParticipantClasses from '@/components/SelectedParticipantClasses.vue'

  import { useToast } from '@/composables/useToast'
  import { usePickedClassesStore } from '@/stores/PickedClassesStore.js'
  import { useStayConfigStore } from '@/stores/StayConfigStore.js'

  // ============================================================================
  // IMPORTS - Stores & Composables
  // ============================================================================
  import { useStayStore } from '@/stores/StayStore.js'
  import { useViewControlStore } from '@/stores/ViewControlStore.js'
  import { formatPrice } from '@/utils/numbers.js'

  // ============================================================================
  // COMPOSABLES & STORE INITIALIZATION
  // ============================================================================
  const { showSimpleToast } = useToast()
  const stayStore = useStayStore()
  const configStore = useStayConfigStore()
  const classStore = usePickedClassesStore()
  const viewStore = useViewControlStore()
  const { mobile, lgAndUp } = useDisplay()
  const { t } = useI18n()

  function getParticipantBookings (participantId) {
    return classStore.bookedClasses.filter(
      booking => booking.participantId === participantId,
    )
  }

  // ============================================================================
  // TEMPLATE REFS - Form References
  // ============================================================================

  /** Form ref for loyalty card validation */
  const dataForm = ref(null)

  /** Form ref for stay manager data validation */
  const stayManagerFormRef = ref(null)

  /** Form ref for legal agreements validation */
  const agreementsFormRef = ref(null)

  /** Specific field ref for loyalty card input (for programmatic validation) */
  const loyaltyCardField = ref(null)

  /** Array of refs for all participant forms (dynamic based on participant count) */
  const participantForms = ref([])

  /** Main stepper ref for this component (exposed to parent) */
  const stepThreeNestedRef = ref(null)

  // ============================================================================
  // STATE - Child Step Navigation
  // ============================================================================

  /** Active child step within this stepper (1=Cart, 2=Participant Data, 3=Payment) */
  const activeChildStep = ref(1)

  // ============================================================================
  // VALIDATION RULES
  // ============================================================================

  /**
   * Validation rules for form fields
   * Each rule returns true if valid, or an error message string if invalid
   */
  const rules = {
    /** Required field validation */
    required: value => !!value || t('fill_the_field_properly'),

    /** Email format validation (optional field) */
    email: value => !value || /.+@.+\..+/.test(value) || t('invalid_email'),

    /** Phone number validation - allows digits, +, spaces, hyphens, parentheses */
    phone: value => !value || /^[\d+\s-()]+$/.test(value) || t('invalid_phone'),

    /**
     * Loyalty card validation - checks async validation result from store
     * Only validates if a value is entered
     */
    validLoyaltyCard: value => {
      if (!value) return true
      return stayStore.isValidLoyaltyCardNumber === true || t('invalid_loyalty_card_number')
    },
  }

  // ============================================================================
  // STATE - UI Controls
  // ============================================================================

  /** Toggle to show/hide insurance information details */
  const revealInsurancesForAllInfo = ref(false)

  /** Dialog visibility for discount information popup */
  const discountInfoDialog = ref(false)

  // ============================================================================
  // WATCHERS - Child Step Synchronization
  // ============================================================================

  /**
   * Sync active child step with view control store
   * Updates the global step tracker when user navigates between child steps
   */
  watch(activeChildStep, async newStep => {
    await nextTick()
    viewStore.currentStep.child = newStep
  })

  // ============================================================================
  // COMPUTED - Insurance Management
  // ============================================================================

  /**
   * Two-way computed property for enabling/disabling ALL insurances
   *
   * Getter: Returns true only if ALL participants have ALL their insurances enabled
   * Setter: Enables or disables insurance for all classes of all participants
   *
   * Used by the "Insurance for all" checkbox in the cart
   */
  const allInsurancesEnabled = computed({
    get () {
      return stayStore.participants.every(participant => {
        const bookings = getParticipantBookings(participant.dynamicId)
        return bookings.every(booking => booking.insurance?.enabled) && bookings.length > 0
      })
    },
    set (value) {
      for (const participant of stayStore.participants) {
        const bookings = getParticipantBookings(participant.dynamicId)
        for (const booking of bookings) {
          if (booking.insurance) {
            booking.insurance.enabled = value
          }
        }
      }
    },
  })
  function toggleAllInsurances (value) {
    const pickedClassesStore = usePickedClassesStore()
    const processedGroups = new Set()

    for (const booking of pickedClassesStore.bookedClasses) {
      // For group bookings, only process once per groupBookingId
      if (booking.groupBookingId) {
        if (processedGroups.has(booking.groupBookingId)) continue
        processedGroups.add(booking.groupBookingId)

        // Update all bookings in the same group
        for (const b of pickedClassesStore.bookedClasses
        .filter(b => b.groupBookingId === booking.groupBookingId)) {
          b.insurance.enabled = value
        }
      } else {
        booking.insurance.enabled = value
      }
    }
  }

  /**
   * Calculate total insurance cost for all participants
   * This shows the POTENTIAL cost if all available insurances were enabled
   *
   * Special rules:
   * - Skips insurance for children in group classes
   * - Multiplies price by number of days if insurance is perDay
   *
   * @returns {number} Total insurance price across all participants
   */
  const sumTotalInsurancesForAll = computed(() => {
    // Track processed group bookings to avoid counting them multiple times
    const processedGroupBookings = new Set()

    return stayStore.participants.reduce((total, participant) => {
      const bookings = getParticipantBookings(participant.dynamicId)
      const participantInsuranceTotal = bookings.reduce((sum, booking) => {
        // Skip insurance for child participants in group classes
        if (participant.participantType === 'child' && booking.type === 'group') {
          return sum
        }

        if (booking.insurance?.price) {
          // For group bookings, only count once per groupBookingId
          if (booking.type === 'group' && booking.groupBookingId) {
            if (processedGroupBookings.has(booking.groupBookingId)) {
              return sum // Already counted this group booking
            }
            processedGroupBookings.add(booking.groupBookingId)
            // Multiply by number of days
            return sum + (booking.insurance.price * booking.data.group.classDates.length)
          }

          // For individual and shared bookings, use price as-is
          return sum + booking.insurance.price
        }
        return sum
      }, 0)
      return total + participantInsuranceTotal
    }, 0)
  })

  // ============================================================================
  // ACTIONS - Loyalty Card Validation
  // ============================================================================

  /**
   * Handles deletion of a selected class for a participant
   * Triggered by event from SelectedParticipantClasses component
   *
   * @param {Object} participant - The participant object
   * @param {string} classId - The dynamicId of the class to remove
   */
  // function handleClassDeletion(participant, bookingId) {
  //   classStore.removeBookedClass(bookingId)
  // }

  /**
   * Debounced handler for loyalty card number validation
   *
   * Waits 1.5 seconds after user stops typing, then:
   * 1. Calls the store's async validation method
   * 2. Shows error toast if invalid
   * 3. Forces field re-validation to show/hide error
   *
   * Debouncing prevents excessive API calls during typing
   */
  const handleCardNumberValidation = useDebounceFn(async () => {
    if (stayStore.loyaltyProgram.loyaltyCardNumber) {
      console.log('Handling loyalty card number validation...')
      const result = await stayStore.checkLoyaltyCardNumber(stayStore.loyaltyProgram.loyaltyCardNumber)
      if (!result) {
        showSimpleToast(t('invalid_loyalty_card_number'), 'error')
      }
      // Force re-validation after the check completes
      await nextTick()
      loyaltyCardField.value?.validate()
      console.log('Loyalty card validation result:', result)
    }
  }, 1500)

  // ============================================================================
  // COMPUTED - Stay Manager Selection
  // ============================================================================

  /**
   * Build list of adult participants for stay manager dropdown
   * Includes all adult participants plus an "another" option for non-participants
   *
   * @returns {Array} Array of selectable adults with special "another" option
   */
  const adultParticipants = computed(() => {
    const adults = stayStore.participants.filter(p => p.participantType === 'adult')
    return [
      ...adults,
      { dynamicId: 'another', name: t('another_stay_manager'), surname: '' },
    ]
  })

  // ============================================================================
  // WATCHERS - Stay Manager Auto-population
  // ============================================================================

  /**
   * Auto-select first adult participant as stay manager on initialization
   * This watcher runs immediately and whenever adult participants change
   *
   * Only populates if no manager is already selected
   * Copies name, surname, phone, and email from the first adult
   */
  watch(adultParticipants, adults => {
    const actualAdults = adults.filter(a => a.dynamicId !== 'another')
    if (actualAdults.length > 0 && !stayStore.stayManagerData.managerId) {
      const firstAdult = actualAdults[0]
      stayStore.stayManagerData.managerId = firstAdult.dynamicId
      stayStore.stayManagerData.name = firstAdult.name || ''
      stayStore.stayManagerData.surname = firstAdult.surname || ''
      stayStore.stayManagerData.phone = firstAdult.phone || ''
      stayStore.stayManagerData.email = firstAdult.email || ''
    }
  }, { immediate: true })

  /**
   * Update stay manager fields when selection changes
   *
   * If "another" is selected: Clear all fields (user enters new data)
   * If existing participant selected: Auto-populate from participant data
   *
   * This creates a seamless UX where selecting a participant auto-fills their info
   */
  watch(() => stayStore.stayManagerData.managerId, managerId => {
    if (managerId === 'another') {
      // Clear fields when "another" is selected - user will enter custom data
      stayStore.stayManagerData.name = ''
      stayStore.stayManagerData.surname = ''
      stayStore.stayManagerData.phone = ''
      stayStore.stayManagerData.email = ''
    } else {
      // Auto-populate from selected participant's data
      const manager = stayStore.participants.find(p => p.dynamicId === managerId)
      if (manager) {
        stayStore.stayManagerData.name = manager.name || ''
        stayStore.stayManagerData.surname = manager.surname || ''
        stayStore.stayManagerData.phone = manager.phone || ''
        stayStore.stayManagerData.email = manager.email || ''
      }
    }
  })

  // ============================================================================
  // COMPUTED - Stay Manager Helpers
  // ============================================================================

  /**
   * Check if "another stay manager" option is selected
   * Used to conditionally change field labels (e.g., "Name" vs "Payer's Name")
   *
   * @returns {boolean} True if custom manager (not a participant) is selected
   */
  const isAnotherStayManager = computed(() => stayStore.stayManagerData.managerId === 'another')

  // ============================================================================
  // ACTIONS - Form Validation
  // ============================================================================

  /**
   * Comprehensive validation for all forms in step 3/2 (Participant Data child step)
   *
   * Validates in order:
   * 1. Loyalty card form (if loyalty card checkbox is checked)
   * 2. All participant forms (name, email, phone, etc.)
   * 3. Stay manager form
   * 4. Legal agreements (all three must be accepted)
   *
   * Shows appropriate error toasts if validation fails
   *
   * @returns {Promise<boolean>} True if all validations pass, false otherwise
   */
  async function validateCurrentStep () {
    const validationResults = []

    // Validate loyalty card form if has loyalty card
    if (stayStore.hasLoyaltyCard && dataForm.value) {
      const loyaltyCardValid = await dataForm.value.validate()
      validationResults.push(loyaltyCardValid.valid)
    }

    // Validate all participant forms
    if (participantForms.value && participantForms.value.length > 0) {
      for (const form of participantForms.value) {
        if (form && form.validate) {
          const result = await form.validate()
          validationResults.push(result.valid)
        }
      }
    }

    // Validate stay manager form
    if (stayManagerFormRef.value) {
      const stayManagerValid = await stayManagerFormRef.value.validate()
      validationResults.push(stayManagerValid.valid)
    }

    // Check if all form validations passed (before agreements)
    const allFormsValid = validationResults.every(result => result === true)

    // Validate agreements - all three must be checked
    const agreementsValid
      = stayStore.stokSchoolRegulationsAccepted
        && stayStore.stokSchoolRodoAccepted
        && stayStore.stokSchoolPaymentRegulationsAccepted

    // Show appropriate error message
    if (!allFormsValid) {
      showSimpleToast(t('please_fill_all_required_fields'), 'error')
      return false
    }

    if (!agreementsValid) {
      showSimpleToast(t('please_accept_all_required_agreements'), 'error')
      return false
    }

    return true
  }

  // ============================================================================
  // COMPONENT EXPOSURE
  // ============================================================================

  /**
   * Expose stepper ref and validation function to parent component
   * Parent uses these to control navigation and validate before proceeding
   */
  defineExpose({
    stepThreeNestedRef,
    validateCurrentStep,
  })

</script>

<template>
  <!--
    Main Stepper Component for Step 3
    Contains 3 child steps: Cart (1), Participant Data (2), Payment (3)
  -->
  <VStepper
    ref="stepThreeNestedRef"
    v-model="activeChildStep"
    class="child-stepper step-three-element d-flex flex-column flex-1"
    flat
    hide-actions
  >

    <VStepperHeader class="mt-2">
      <VStepperItem
        class="px-1 py-0"
        complete
        :title="$t('cart')"
        :value="1"
      >
        <template #icon>
          1.
        </template>
      </VStepperItem>
      <VStepperItem
        class="px-1 py-0"
        :title="$t('participants_data')"
        :value="2"
      >
        <template #icon>
          2.
        </template>
      </VStepperItem>
      <VStepperItem
        class="px-1 py-0"
        :title="$t('payment')"
        :value="3"
      >
        <template #icon>
          3.
        </template>
      </VStepperItem>
    </VStepperHeader>

    <VStepperWindow class="flex-1">
      <!-- ================================================================== -->
      <!-- CHILD STEP 1: CART - Review Classes & Add Insurance -->
      <!-- ================================================================== -->
      <VStepperWindowItem :value="1">
        <div class="d-flex flex-wrap">
          <div
            v-if="lgAndUp"
            class="my-4 pb-4 w-100 border-b"
          >
            <StayDateDisplay class="mb-4" />
            <p class="fs-24 font-weight-bold mb-4">
              {{ $t('cart') }}
            </p>

            <p
              class="font-weight-medium mb-2"
              :class="mobile ? 'fs-14' : 'fs-16'"
            >
              {{ $t('cart_subtitle') }}
            </p>

          </div>
          <div :class="lgAndUp ? 'w-50' : 'w-100'">
            <!-- Date and title display for mobile -->
            <StayDateDisplay v-if="!lgAndUp" class="my-4" />
            <p
              v-if="!lgAndUp"
              class="fs-24 font-weight-bold my-4"
            >
              {{ $t('cart') }}
            </p>
            <div
              v-if="!lgAndUp"
              class="my-4"
            >
              <p
                class="font-weight-medium "
                :class="mobile ? 'fs-14' : 'fs-16'"
              >
                {{ $t('cart_subtitle') }}
              </p>
            </div>
            <div v-if="stayStore.participants.some(p => getParticipantBookings(p.dynamicId).length > 0)">
              <p
                class="fw-600 my-4"
                :class="mobile ? 'fs-18 mb-4 mt-8' : 'fs-20'"
              >
                {{ $t('selected_classes') }}:
              </p>
              <div class="d-flex flex-column ga-4 pa-1">
                <SelectedParticipantClasses
                  v-for="(participant, index) in stayStore.participants"
                  :key="participant.dynamicId"
                  :ref="el => participantForms[index] = el"
                  class="ga-4"
                  :index="index"
                  :participant="participant"
                />
                <!--                  @delete-class="handleClassDeletion(participant, $event)"-->
              </div>
            </div>
            <VSheet
              v-else
              class="bg-white fs-16 rounded-lg px-4 py-8 lh-normal text-center"
            >
              <div class="d-flex flex-column ga-2 mb-4 fw-500 align-center justify-center">
                <p>
                  {{ $t('cart_is_empty') }}
                </p>
                <p>
                  {{ $t('back_to_class_selection') }}:
                </p>
              </div>
              <VBtn
                class="fs-16 mx-auto"
                color="blue"
                :disabled="!stayStore.dateOfStay"
                prepend-icon="mdi-arrow-left"
                size="large"
                variant="flat"
                @click="viewStore.parentStepperRef?.prev()"
              >
                {{ $t('select_classes') }}
              </VBtn>
            </VSheet>
          </div>
          <div :class="lgAndUp ? 'w-40 ml-auto' : 'w-100'">
            <!-- =========================================================== -->
            <!-- ADDITIONAL OPTIONS - Insurance for all participants -->
            <!-- =========================================================== -->
            <div class="my-4 px-1">
              <p
                class="fw-600 my-4"
                :class="mobile? 'fs-16':'fs-20'"
              >
                {{ $t('aditional_options') }}:
              </p>
              <VSheet class="rounded bg-light-gray mt-2 mb-4">
                <div
                  class="pa-4 ga-3 rounded d-flex align-center justify-between"
                >
                  <VCheckbox
                    v-model="allInsurancesEnabled"
                    class="mb-auto "
                    color="info"
                    density="compact"
                    hide-details
                    @update:model-value="toggleAllInsurances"
                  />
                  <div
                    class="fw-400 d-flex 2 align-center ml-2"
                    :class="mobile ? 'fs-10': 'fs-14'"
                  >
                    <div class="d-flex flex-column">
                      <p class="mt-2 lh-normal">
                        {{ t('insurance_for_all_option') }}
                      </p>

                      <VBtn
                        class="text-capitalize w-max-content px-0"
                        :class="mobile ? 'fs-10': 'fs-14'"
                        color="grey"
                        flat
                        size="small"
                        variant="text"
                        @click="revealInsurancesForAllInfo = !revealInsurancesForAllInfo"
                      >
                        {{ revealInsurancesForAllInfo ? t('collapse') : t('expand') }}
                        <VIcon :icon="revealInsurancesForAllInfo ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
                      </VBtn>

                    </div>
                  </div>

                  <div
                    class="d-flex mt-1 flex-column align-end ml-auto fc-gray mb-auto"
                    :class="mobile ? 'fs-11 ': 'fs-14'"
                  >
                    <span class="fw-500 mb-auto">
                      +&nbsp;{{ formatPrice(sumTotalInsurancesForAll) }}&nbsp;{{ stayStore.currency }}
                    </span>

                  </div>
                </div>

                <VExpandTransition>
                  <VCard
                    v-show="revealInsurancesForAllInfo"
                    flat
                    style="background-color: transparent;"
                    width="100%"
                  >
                    <VCardText class="pl-6 pt-0">
                      <p :class="mobile ? 'fs-10' : 'fs-12'">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
                        labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
                        laboris nisi ut aliquip ex ea commodo consequat.
                      </p>

                    </VCardText>
                  </VCard>
                </VExpandTransition>
              </VSheet>
            </div>

            <!-- =========================================================== -->
            <!-- LOYALTY CARD - Optional loyalty program benefits -->
            <!-- =========================================================== -->
            <div class="my-4 px-1">
              <p
                class="fw-600 mt-4"
                :class="mobile? 'fs-16':'fs-20'"
              >
                {{ $t('loyalty_card') }}
              </p>
              <VCheckbox
                v-model="stayStore.hasLoyaltyCard"
                color="info"
                hide-details="auto"
                :label="$t('i_have_loyalty_card')"
              />

              <VExpandTransition>
                <VForm
                  v-show="stayStore.hasLoyaltyCard"
                  ref="dataForm"
                  flat
                  style="background-color: transparent;"
                  width="100%"
                >

                  <div class="my-4">
                    <p class="custom-input-label mb-2">{{ $t('enter_loyalty_card_number') }}</p>
                    <VTextField
                      ref="loyaltyCardField"
                      v-model="stayStore.loyaltyProgram.loyaltyCardNumber"
                      density="default"
                      :disabled="stayStore.checkingLoyaltyCardNumber"
                      hide-details="auto"
                      maxlength="16"
                      :readonly="stayStore.isValidLoyaltyCardNumber"
                      :rules="stayStore.hasLoyaltyCard ? [rules.required, rules.validLoyaltyCard] : []"
                      variant="outlined"
                      @input="handleCardNumberValidation"
                    >
                      <template #prepend-inner>
                        <img v-if="stayStore.isValidLoyaltyCardNumber" alt="check" :src="CheckGreenIcon">
                      </template>
                      <template #loader>
                        <VProgressLinear
                          v-if="stayStore.checkingLoyaltyCardNumber"
                          color="info"
                          height="2"
                          indeterminate
                        />
                      </template>
                    </VTextField>
                  </div>
                  <div class="my-4">
                    <p class="custom-input-label mb-2">{{ $t('name') }}</p>
                    <VTextField
                      v-model="stayStore.loyaltyProgram.loyaltyCardOwnerName"
                      density="default"
                      hide-details="auto"
                      maxlength="50"
                      :rules="stayStore.hasLoyaltyCard ? [rules.required] : []"
                      variant="outlined"
                    />
                  </div>
                  <div class="my-4">
                    <p class="custom-input-label mb-2">{{ $t('surname') }}</p>
                    <VTextField
                      v-model="stayStore.loyaltyProgram.loyaltyCardOwnerSurname"
                      density="default"
                      hide-details="auto"
                      maxlength="50"
                      :rules="stayStore.hasLoyaltyCard ? [rules.required] : []"
                      variant="outlined"
                    />
                  </div>

                </VForm>
              </VExpandTransition>
            </div>

            <!-- =========================================================== -->
            <!-- SUMMARY - Price breakdown for cart step -->
            <!-- =========================================================== -->
            <div class="my-4 px-1">
              <p
                class="fw-600 my-4"
                :class="mobile? 'fs-16':'fs-20'"
              >
                {{ $t('summary') }}
              </p>
              <VSheet
                class="bg-dark-gray rounded-lg fc-white"
                :class="mobile ? 'fs-11 pa-4' : 'fs-14 pa-8'"
              >
                <ul class="list-style-none pa-0 ma-0">
                  <li
                    v-for="participant in stayStore.participants"
                    :key="participant.dynamicId"
                    class="pb-2 mb-2"
                  >
                    <div class="d-flex justify-space-between">
                      <span>{{ participant.name || '-' }}</span>
                      <span class="ml-auto">
                        {{
                          formatPrice(stayStore.participantClassesTotalPrice(participant.dynamicId) + stayStore.participantInsuranceTotalPrice(participant.dynamicId))
                        }}&nbsp;{{ stayStore.currency }}
                      </span>
                    </div>
                    <VDivider class="mt-1 mb-2" />
                  </li>
                  <li
                    v-if="classStore.hasAnyChildAddOnsSelected"
                    :key="`child-addons-${classStore.hasAnyChildAddOnsSelected}`"
                    class="pb-2 mb-2"
                  >
                    <div class="d-flex justify-space-between">
                      <span>{{ $t('child_add_ons') }}</span>
                      <span class="ml-auto">
                        {{ formatPrice(classStore.childAddOnPrice) }}&nbsp;{{ stayStore.currency }}
                      </span>
                    </div>
                    <VDivider class="mt-1 mb-2" />
                  </li>
                </ul>

                <!-- Discount display (if applicable) -->
                <div
                  v-if="parseFloat(stayStore.finalDiscount) > 0"
                  class=" fw-600 mt-2"
                >
                  <div class="d-flex justify-space-between fw-400">
                    <div>
                      <VIcon
                        class="mr-1"
                        icon="mdi-information-slab-circle"
                        style="opacity: .4;"
                        @click="discountInfoDialog = true"
                      />
                      {{ $t('discount') }}
                    </div>
                    <span class="fw-400">
                      -&nbsp;{{ stayStore.finalDiscount }}&nbsp;{{ stayStore.currency }}
                    </span>
                  </div>
                  <VDivider class="mt-1 mb-2" />
                </div>

                <div class="d-flex  ga-2 justify-end mt-4">
                  <div class="d-flex flex-column">
                    <div class="ml-auto">
                      <span class="ml-auto">
                        {{ $t('price_total') }}:
                      </span>
                      <span class="fs-16 ml-auto">
                        {{ formatPrice(stayStore.allParticipantsTotalPrice) }}&nbsp;{{ stayStore.currency }}
                      </span>
                    </div>
                    <div v-if="allInsurancesEnabled" class="fs-11 text-right">
                      <div>
                        {{ $t('including') }} <span class="text-lowercase">{{ $t('aditional_options') }}:</span>
                      </div>

                      <p>- {{ $t('insurance') }}: {{ formatPrice(sumTotalInsurancesForAll) }}&nbsp;{{ stayStore.currency }}</p>
                    </div>
                  </div>
                </div>
                <!--                {{ classStore.childAddOnSelections }}-->
                <!--                {{ classStore.childAddOnPrice }}-->
              </VSheet>
            </div>
          </div>

        </div>

        <!-- Discount information popup modal -->
        <PopupSmall
          v-model="discountInfoDialog"
          max-width="500px"
          :title="t('discounts_title')"
        >
          <template #content>
            <p>{{ t('discounts_info') }}</p>
          </template>
          <template #actions>
            <VBtn variant="outlined" @click="discountInfoDialog = false">
              Ok
            </VBtn>
          </template>
        </PopupSmall>
      </VStepperWindowItem>

      <!-- ================================================================== -->
      <!-- CHILD STEP 2: PARTICIPANT DATA - Collect participant information -->
      <!-- ================================================================== -->
      <VStepperWindowItem
        :value="2"
      >
        <div class="container-narrow">
          <p class="fs-24 font-weight-bold my-4">
            {{ $t('enter_participants_data') }}:
          </p>
          <div class="my-4">

            <p
              class="fs-11"
              :class="mobile ? 'fs-14' : 'fs-16'"
            >
              {{ $t('enter_preferences_details') }}
            </p>
          </div>
          <ParticipantData
            v-for="(participant, index) in stayStore.participants"
            :key="participant.dynamicId"
            :ref="el => participantForms[index] = el"
            class="ga-4"
            :index="index"
            :participant="participant"
            @update:participant="Object.assign(participant, $event)"
          />

          <!-- =========================================================== -->
          <!-- STAY MANAGER DATA - Select or enter contact person info -->
          <!-- =========================================================== -->
          <VForm ref="stayManagerFormRef" class="mt-8 mb-4 px-1">
            <p
              class="fw-600 my-4"
              :class="mobile? 'fs-16':'fs-20'"
            >
              {{ $t('stay_manager_data') }}:
            </p>
            <VSheet
              class="bg-white rounded-lg box-shadow-sm"
              :class="mobile ? 'fs-11 pa-4' : 'fs-14 pa-8'"
            >
              <div class="mb-2">
                <img alt="wallet" :src="WalletIcon">
                <div class="d-flex align-center fs-16 fw-500 mt-2">
                  {{ $t('select_stay_manager') }}:
                </div>
              </div>

              <VSelect
                v-model="stayStore.stayManagerData.managerId"
                clear-icon="mdi-close"
                clearable
                hide-details="auto"
                item-title="name"
                item-value="dynamicId"
                :items="adultParticipants"
                :placeholder="$t('select_stay_manager')"
                :rules="[rules.required]"
                variant="outlined"
              >
                <template #selection="{ item }">
                  {{ item.raw.name }}{{ item.raw.surname ? ' ' + item.raw.surname : '' }}
                </template>
                <template #item="{ item, props }">
                  <v-list-item v-bind="props">
                    <template #title>
                      {{ item.raw.name }}{{ item.raw.surname ? ' ' + item.raw.surname : '' }}
                    </template>
                  </v-list-item>
                </template>
              </VSelect>
              <VDivider class="my-4" />

              <VRow class="mt-4">
                <VCol :cols="mobile ? 12 : 6">
                  <p class="custom-input-label mb-2">{{ isAnotherStayManager ? $t('payers_name') : $t('name') }}</p>
                  <VTextField
                    v-model="stayStore.stayManagerData.name"
                    clear-icon="mdi-close"
                    clearable
                    density="default"
                    hide-details="auto"
                    max-length="50"
                    min-length="2"
                    :rules="[rules.required]"
                    variant="outlined"
                  />
                </VCol>

                <VCol :cols="mobile ? 12 : 6">
                  <p class="custom-input-label mb-2">{{
                    isAnotherStayManager ? $t('payers_surname') : $t('surname')
                  }}</p>
                  <VTextField
                    v-model="stayStore.stayManagerData.surname"
                    clear-icon="mdi-close"
                    clearable
                    density="default"
                    hide-details="auto"
                    max-length="50"
                    min-length="2"
                    :rules="[rules.required]"
                    variant="outlined"
                  />
                </VCol>

                <VCol :cols="mobile ? 12 : 6">
                  <p class="custom-input-label mb-2">{{ $t('phone_number') }}</p>
                  <VTextField
                    v-model="stayStore.stayManagerData.phone"
                    clear-icon="mdi-close"
                    clearable
                    density="default"
                    hide-details="auto"
                    maxLength="11"
                    minLength="9"
                    :rules="[rules.required, rules.phone]"
                    variant="outlined"
                    @keydown="(e) => !/[\d+]/.test(e.key) && e.key !== 'Backspace' && e.preventDefault()"
                  />
                  <p class="fs-12 px-4 fc-gray mt-1">
                    {{ $t('enter_only_digits_min_9') }}
                  </p>
                </VCol>

                <VCol :cols="mobile ? 12 : 6">
                  <p class="custom-input-label mb-2">{{ isAnotherStayManager ? $t('payers_email') : 'Email' }}</p>
                  <VTextField
                    v-model="stayStore.stayManagerData.email"
                    clear-icon="mdi-close"
                    clearable
                    density="default"
                    hide-details="auto"
                    :rules="[rules.required, rules.email]"
                    type="email"
                    variant="outlined"
                  />
                </VCol>
              </VRow>
              <VDivider class="mt-8 mb-4" />

              <!-- Optional: Different payer data (if payer != manager) -->
              <div class="my-4 w-100">
                <VCheckbox
                  v-model="stayStore.anotherPayerData"
                  color="info"
                  density="compact"
                  hide-details="auto"
                >
                  <template #label>
                    {{ $t('another_payers_data') }}
                  </template>
                </VCheckbox>
              </div>

              <VExpandTransition>
                <VRow v-show="stayStore.anotherPayerData" class="mt-2">
                  <VCol :cols="mobile ? 12 : 6">
                    <p class="custom-input-label mb-2">{{ $t('payers_name') }}</p>
                    <VTextField
                      v-model="stayStore.payerData.name"
                      clear-icon="mdi-close"
                      clearable
                      density="default"
                      hide-details="auto"
                      max-length="50"
                      min-length="2"
                      :rules="stayStore.anotherPayerData ? [rules.required] : []"
                      variant="outlined"
                    />
                  </VCol>

                  <VCol :cols="mobile ? 12 : 6">
                    <p class="custom-input-label mb-2">{{ $t('payers_surname') }}</p>
                    <VTextField
                      v-model="stayStore.payerData.surname"
                      clear-icon="mdi-close"
                      clearable
                      density="default"
                      hide-details="auto"
                      max-length="50"
                      min-length="2"
                      :rules="stayStore.anotherPayerData ? [rules.required] : []"
                      variant="outlined"
                    />
                  </VCol>

                  <VCol :cols="mobile ? 12 : 6">
                    <p class="custom-input-label mb-2">{{ $t('payers_email') }}</p>
                    <VTextField
                      v-model="stayStore.payerData.email"
                      clear-icon="mdi-close"
                      clearable
                      density="default"
                      hide-details="auto"
                      :rules="stayStore.anotherPayerData ? [rules.required, rules.email] : []"
                      type="email"
                      variant="outlined"
                    />
                  </VCol>
                </VRow>
              </VExpandTransition>

              <VDivider class="my-4" />

              <!-- Optional: Invoice data for companies -->
              <div class="my-4 w-100">
                <VCheckbox
                  v-model="stayStore.receiveInvoice"
                  color="info"
                  density="compact"
                  hide-details="auto"
                >
                  <template #label>
                    {{ $t('receive_invoice') }}
                  </template>
                </VCheckbox>
              </div>

              <VExpandTransition>
                <VRow v-show="stayStore.receiveInvoice" class="mt-2">
                  <VCol :cols="mobile ? 12 : 6">
                    <p class="custom-input-label mb-2">{{ $t('company_name') }}</p>
                    <VTextField
                      v-model="stayStore.invoiceData.companyName"
                      clear-icon="mdi-close"
                      clearable
                      density="default"
                      hide-details="auto"
                      max-length="100"
                      :rules="stayStore.receiveInvoice ? [rules.required] : []"
                      variant="outlined"
                    />
                  </VCol>

                  <VCol :cols="mobile ? 12 : 6">
                    <p class="custom-input-label mb-2">{{ $t('tax_id') }}</p>
                    <VTextField
                      v-model="stayStore.invoiceData.taxId"
                      clear-icon="mdi-close"
                      clearable
                      density="default"
                      hide-details="auto"
                      max-length="10"
                      :rules="stayStore.receiveInvoice ? [rules.required] : []"
                      variant="outlined"
                      @keydown="(e) => !/[\d]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Tab' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.preventDefault()"
                    />

                  </VCol>

                  <VCol cols="12">
                    <p class="custom-input-label mb-2">{{ $t('company_address') }}</p>
                    <VTextField
                      v-model="stayStore.invoiceData.companyAddress"
                      clear-icon="mdi-close"
                      clearable
                      density="default"
                      hide-details="auto"
                      max-length="200"
                      :rules="stayStore.receiveInvoice ? [rules.required] : []"
                      variant="outlined"
                    />
                    <p class="fs-12 px-4 fc-gray">
                      {{ $t('enter_street_and_number') }}
                    </p>
                  </VCol>
                </VRow>
              </VExpandTransition>

            </VSheet>
          </VForm>

          <!-- =========================================================== -->
          <!-- LEGAL AGREEMENTS - Required consents and declarations -->
          <!-- =========================================================== -->
          <VForm ref="agreementsFormRef" class="agreements-container mt-8 mb-4 px-1 lh-normal">
            <p
              class="fw-600 my-4"
              :class="mobile? 'fs-16':'fs-20'"
            >
              {{ $t('consents_and_declarations') }}:
            </p>
            <VCheckbox
              v-model="stayStore.stokSchoolRegulationsAccepted"
              class="mb-2"
              :class="mobile? 'fs-12':'fs-14'"
              color="info"
              density="compact"
              hide-details="auto"
            >
              <template #label>
                <span :class="mobile? 'fs-12':'fs-14'">
                  {{ $t('i_accept') }}
                  <a :class="mobile? 'fs-12':'fs-14'" :href="configStore.REGULATIONS_LINK" target="_blank">
                    {{ $t('stok_rules') }}
                  </a>
                </span>
              </template>
            </VCheckbox>

            <VCheckbox
              v-model="stayStore.stokSchoolPrivacyPolicyAccepted"
              class="mb-2"
              color="info"
              density="compact"
              hide-details="auto"
            >
              <template #label>
                <span :class="mobile? 'fs-12':'fs-14'">
                  {{ $t('i_have_read_terms_and_conditions') }}
                     <a :class="mobile? 'fs-12':'fs-14'" :href="configStore.PRIVACY_LINK" target="_blank">
                    {{ $t('with_privacy_policy') }}
                  </a>
                </span>
              </template>
            </VCheckbox>

            <VCheckbox
              v-model="stayStore.stokSchoolPaymentRegulationsAccepted"
              class="mb-2"
              :class="mobile? 'fs-12':'fs-14'"
              color="info"
              density="compact"
              hide-details="auto"
            >
              <template #label>
                <span :class="mobile? 'fs-12':'fs-14'">
                  {{ $t('i_accept') }}&nbsp;
                </span>
                <a :class="mobile? 'fs-12':'fs-14'" :href="configStore.PAYMENT_REGULATIONS_LINK" target="_blank">
                  {{ $t('payment_regulations') }}
                </a>
              </template>
            </VCheckbox>
            <small v-if="!stayStore.agreementsAcceptedCombined" class="fs-12 fc-error pl-4">
              {{ $t('please_accept_all_required_agreements') }}
            </small>
          </VForm>

          <!-- =========================================================== -->
          <!-- SUMMARY - Final price breakdown before payment -->
          <!-- =========================================================== -->
          <div class="mt-8 mb-4 px-1">
            <p
              class="fw-600 my-4"
              :class="mobile? 'fs-16':'fs-20'"
            >
              {{ $t('summary') }}:
            </p>
            <VSheet
              class="bg-dark-gray rounded-lg fc-white"
              :class="mobile ? 'fs-11 pa-4' : 'fs-14 pa-8'"
            >
              <ul class="list-style-none pa-0 ma-0">
                <li
                  v-for="participant in stayStore.participants"
                  :key="participant.dynamicId"
                  class="pb-2 mb-2"
                >
                  <div class="d-flex justify-space-between">
                    <span>{{ participant.name || '-' }}</span>
                    <span class="ml-auto">
                      {{
                        formatPrice(stayStore.participantClassesTotalPrice(participant.dynamicId) + stayStore.participantInsuranceTotalPrice(participant.dynamicId))
                      }}&nbsp;{{ stayStore.currency }}
                    </span>
                  </div>
                  <VDivider class="mt-1 mb-2" />
                </li>
                <li
                  v-if="classStore.hasAnyChildAddOnsSelected"
                  :key="`child-addons-${classStore.hasAnyChildAddOnsSelected}`"
                  class="pb-2 mb-2"
                >
                  <div class="d-flex justify-space-between">
                    <span>{{ $t('child_add_ons') }}</span>
                    <span class="ml-auto">
                      {{ formatPrice(classStore.childAddOnPrice) }}&nbsp;{{ stayStore.currency }}
                    </span>
                  </div>
                  <VDivider class="mt-1 mb-2" />
                </li>
              </ul>

              <!-- Discount display (if applicable) -->
              <div
                v-if="parseFloat(stayStore.finalDiscount) > 0"
                class=" fw-600 mt-2"
              >
                <div class="d-flex justify-space-between fw-400">
                  <div>
                    <VIcon
                      class="mr-1"
                      icon="mdi-information-slab-circle"
                      style="opacity: .4;"
                      @click="discountInfoDialog = true"
                    />
                    {{ $t('discount') }}
                  </div>
                  <span class="fw-400">
                    -&nbsp;{{ stayStore.finalDiscount }}&nbsp;{{ stayStore.currency }}
                  </span>
                </div>
                <VDivider class="mt-1 mb-2" />
              </div>

              <div class="d-flex  ga-2 justify-end mt-4">
                <div class="d-flex flex-column">

                  <div class="d-flex  ga-2 justify-end mt-4">
                    <div class="d-flex flex-column">
                      <div class="ml-auto">
                        <span class="ml-auto">
                          {{ $t('price_total') }}:
                        </span>
                        <span class="fs-16 ml-auto">
                          {{ formatPrice(stayStore.allParticipantsTotalPrice) }}&nbsp;{{ stayStore.currency }}
                        </span>
                      </div>
                      <div v-if="allInsurancesEnabled" class="fs-11 text-right">
                        <div>
                          {{ $t('including') }} <span class="text-lowercase">{{ $t('aditional_options') }}:</span>
                        </div>

                        <p>- {{ $t('insurance') }}: {{ formatPrice(sumTotalInsurancesForAll) }}&nbsp;{{ stayStore.currency }}</p>
                      </div>
                    </div>
                  </div>
                  <!--                  <div class="ml-auto">-->
                  <!--                    <span class="ml-auto">-->
                  <!--                      {{ $t('price_total') }}:-->
                  <!--                    </span>-->
                  <!--                    <span class="fs-16 ml-auto">-->
                  <!--                      {{ formatPrice(stayStore.allParticipantsTotalPrice) }}&nbsp;{{ stayStore.currency }}-->
                  <!--                    </span>-->
                  <!--                  </div>-->
                  <!--                  <div v-if="allInsurancesEnabled" class="fs-11">-->
                  <!--                    <span>{{ $t('including') }}</span>&nbsp;<span class="text-lowercase">{{-->
                  <!--                      $t('aditional_options')-->
                  <!--                    }}: </span>-->
                  <!--                    <span>{{ formatPrice(sumTotalInsurancesForAll) }}&nbsp;{{ stayStore.currency }}</span>-->
                  <!--                  </div>-->
                </div>
              </div>
            </VSheet>
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
              class="font-weight-medium "
              :class="mobile ? 'fs-14' : 'fs-16'"
            >
              {{ $t('participants_preferences') }}:
            </p>
          </div>

        </div>
      </VStepperWindowItem>
    </VStepperWindow>
  </VStepper>

</template>
<style lang="scss">
.agreements-container {
  .v-selection-control__wrapper {
    margin-right: .5rem;
    //margin-bottom: auto;
    //margin-top: 3px;
  }
}

</style>
