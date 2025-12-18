/**
 * StayStore - Main Pinia store for managing ski school stay reservations
 *
 * This store handles all data related to a stay booking including:
 * - Date and participant selection
 * - Class/lesson assignments for each participant
 * - Pricing calculations (classes, insurance, discounts)
 * - Manager, payer, and invoice data
 * - Loyalty program integration
 * - Legal agreements acceptance
 */

import {defineStore} from 'pinia'
import {computed, reactive, ref, watch} from 'vue'
import {useStayConfigStore} from './StayConfigStore.js'
import {generateUniqueId} from '@/utils/numbers.js'

// ============================================================================
// DUMMY DATA (TO BE REMOVED IN PRODUCTION)
// ============================================================================

/**
 * Temporary dummy data for selected classes during development
 * @deprecated Will be removed and replaced with actual API data
 */
const DUMMY_SELECTED_CLASSES = [
  {
    dynamicId: 'mjsjg7s6',
    type: 'group',
    title: 'Zajęcia grupowe - narciarstwo',
    classType: 'ski',
    groupName: 'Grupa poranna',
    instructor: 'Kaczyński Jan',
    skillLevel: 'Średni',
    dates: [
      {date: '01.01.2025', time: '9:00 - 9:55'}
    ],
    price: 100.00,
    insurance: {
      title: 'NNW Turystyczno-Sportowe lorem ipsum amet dolor blabla tututut',
      enabled: false,
      price: 10.00,
      perDay: true,
      description: 'PAKIET NNW TURYSTYCZNO-SPORTOWY - Wariant 111 SWIJ indywidualnych\n',
    }
  },
  {
    dynamicId: 'asdh7126xs',
    type: 'individual',
    title: 'Zajęcia indywidualne',
    classType: 'snowboard',
    groupName: 'Grupa wieczorna',
    skillLevel: 'Nowicjusz',
    instructor: 'Marcin Kowalik',
    dates: [
      {date: '01.01.2025', time: '9:00 - 9:55'},
      {date: '02.01.2025', time: '9:00 - 9:55'},
      {date: '03.01.2025', time: '9:00 - 9:55'},
    ],
    price: 100.00,
    insurance: {
      title: 'NNW Turystyczno-Sportowe lorem ipsum amet dolor blabla tututut',
      enabled: false,
      price: 10.00,
      perDay: true,
      description: 'PAKIET NNW TURYSTYCZNO-SPORTOWY - Wariant 111 SWIJ indywidualnych podróży Kontynenty na terenie RP.',
      imgSource: ''
    }
  },
  {
    dynamicId: 'ff12126xs',
    type: 'individual',
    title: 'Zajęcia Specjalne - Mateusz',
    classType: 'snowboard',
    groupName: 'Grupa wieczorna - specjalna',
    skillLevel: 'Nowicjusz',
    instructor: 'Mateusz Zzaskakującymnazwiskiem',
    dates: [
      {date: '01.01.2025', time: '9:00 - 9:55'},
      {date: '02.01.2025', time: '9:00 - 9:55'},
      {date: '03.01.2025', time: '9:00 - 9:55'},
      {date: '04.01.2025', time: '9:00 - 9:55'},
      {date: '05.01.2025', time: '9:00 - 9:55'},
    ],
    price: 250.00,
    insurance: {
      title: 'NNW Turystyczno-Sportowe lorem ipsum amet dolor blabla tututut',
      enabled: false,
      price: 10.00,
      perDay: true,
      description: 'PAKIET NNW TURYSTYCZNO-SPORTOWY - Wariant Mateusz na terenie RP.',
      imgSource: ''
    }
  }
]

// ============================================================================
// PARTICIPANT TEMPLATE
// ============================================================================

/**
 * Blank participant template object
 * Used to initialize new participants when they are added to the stay
 * Contains all required fields with default values
 */
const blankParticipant = {
  dynamicId: '',                    // Unique identifier generated at runtime
  name: '',                         // Participant's first name
  surname:'',                       // Participant's last name
  phone: null,                      // Contact phone number
  birthDate: null,                  // Date of birth (used to calculate age)
  participantType: '',              // Either 'adult' or 'child'
  age: null,                        // Calculated age or manually entered
  activityType: '',                 // Selected activity (ski/snowboard)
  skillLevel: '',                   // Skill level (beginner/intermediate/advanced)
  availableActivityTypes: [],       // Activity types this participant can choose
  availableLessonTypes: [],         // Lesson types available for this participant
  showGroupLessons: true,           // Whether to show group lesson options
  classLang: 'Polski',              // Preferred language for classes
  selectedClasses: DUMMY_SELECTED_CLASSES, // Classes enrolled in
}

// ============================================================================
// STORE DEFINITION
// ============================================================================

export const useStayStore = defineStore('stayStore', () => {
  // Get access to configuration store for shared settings
  const configStore = useStayConfigStore()

  // ==========================================================================
  // STATE - BASIC STAY INFORMATION
  // ==========================================================================

  /** Selected date range for the stay */
  const dateOfStay = ref(null)

  /** Number of adult participants (1-12) */
  const adultsNumber = ref(1)

  /** Number of child participants (0-12) */
  const childrenNumber = ref(0)

  /** Array of all participants with their complete data */
  const participants = ref([])

  // ==========================================================================
  // STATE - LOYALTY PROGRAM
  // ==========================================================================

  /** Whether the user has a loyalty card checkbox state */
  const hasLoyaltyCard = ref(false)

  /** Loyalty program details */
  const loyaltyProgram = ref({
    loyaltyCard: false,           // Redundant with hasLoyaltyCard, may be unified later
    loyaltyCardOwnerName: '',     // Card owner's first name
    loyaltyCardOwnerSurname: '',  // Card owner's last name
    loyaltyCardNumber: null,      // Loyalty card number
  })

  // ==========================================================================
  // COMPUTED - COMPLETE EVENT OBJECT
  // ==========================================================================

  /**
   * Computed event object that aggregates all booking data
   * This represents the complete state that would be sent to the backend
   * Note: Some fields (regulations) are set to null here but updated from store refs
   */
  const event = computed(() => ({
    id: null,                                    // Reservation ID (assigned by backend)
    dateOfStay: dateOfStay.value,               // Selected stay date range
    adultsNumber: adultsNumber.value,           // Number of adults
    childrenNumber: childrenNumber.value,       // Number of children
    participants: participants.value,           // Complete participant data array
    additionalOptions: {},                      // Reserved for future additional options
    loyaltyProgram: {
      loyaltyCard: hasLoyaltyCard.value,
      loyaltyCardOwnerName: loyaltyProgram.value.loyaltyCardOwnerName,
      loyaltyCardOwnerSurname: loyaltyProgram.value.loyaltyCardOwnerSurname,
      loyaltyCardNumber: loyaltyProgram.value.loyaltyCardNumber,
    },
    stayManagerData: stayManagerData.value,     // Person managing the booking
    anotherPayerData: anotherPayerData.value,   // Whether payer is different from manager
    payerData: anotherPayerData.value ? payerData.value : null, // Payer info (if different)
    receiveInvoice: receiveInvoice.value,       // Whether customer wants an invoice
    invoiceData: receiveInvoice.value ? invoiceData.value : null, // Invoice details (if requested)
    stokSchoolRegulationsAccepted: null,        // School regulations agreement
    stokSchoolRodoAccepted: null,               // RODO/GDPR agreement
    stokSchoolPaymentRegulationsAccepted: null, // Payment terms agreement
  }))

  // ==========================================================================
  // STATE - STAY MANAGER DATA
  // ==========================================================================

  /**
   * Information about the person managing/organizing the stay
   * This is the primary contact person for the reservation
   */
  const stayManagerData = ref({
    managerId: null,  // Manager ID (if returning customer)
    name: '',         // Manager's first name
    surname: '',      // Manager's last name
    phone: '',        // Contact phone number
    email: ''         // Contact email address
  })

  // ==========================================================================
  // STATE - PAYER DATA (IF DIFFERENT FROM MANAGER)
  // ==========================================================================

  /** Whether the person paying is different from the stay manager */
  const anotherPayerData = ref(false)

  /**
   * Payer information (only used if anotherPayerData is true)
   * Person responsible for payment if different from the manager
   */
  const payerData = ref({
    name: '',     // Payer's first name
    surname: '',  // Payer's last name
    email: ''     // Payer's email address
  })

  // ==========================================================================
  // STATE - LEGAL AGREEMENTS
  // ==========================================================================

  /** Acceptance of school regulations checkbox */
  const stokSchoolRegulationsAccepted = ref(false)

  /** Acceptance of RODO/GDPR privacy policy checkbox */
  const stokSchoolRodoAccepted = ref(false)

  /** Acceptance of payment regulations checkbox */
  const stokSchoolPaymentRegulationsAccepted = ref(false)

  /**
   * Combined check - all three agreements must be accepted to proceed
   * Used to enable/disable the final confirmation button
   */
  const agreementsAcceptedCombined = computed(() => {
    return stokSchoolRegulationsAccepted.value &&
           stokSchoolRodoAccepted.value &&
           stokSchoolPaymentRegulationsAccepted.value
  })

  // ==========================================================================
  // STATE - INVOICE DATA
  // ==========================================================================

  /** Whether the customer wants to receive an invoice checkbox */
  const receiveInvoice = ref(false)

  /**
   * Invoice/company details (only used if receiveInvoice is true)
   * Required for business customers who need tax documentation
   */
  const invoiceData = ref({
    companyName: '',    // Company/business name
    taxId: '',          // Tax identification number (NIP)
    companyAddress: ''  // Registered company address
  })

  // ==========================================================================
  // COMPUTED - PARTICIPANT NUMBER CONSTRAINTS
  // ==========================================================================

  /**
   * Maximum number of adults allowed
   * Constrained by total limit (12) minus current children number
   */
  const maxAdults = computed(() => 12 - childrenNumber.value)

  /**
   * Maximum number of children allowed
   * Constrained by total limit (12) minus current adults number
   */
  const maxChildren = computed(() => 12 - adultsNumber.value)

  /**
   * Validation check - at least one participant must be selected
   * Used to enable/disable next step buttons
   */
  const participantsNumberCondition = computed(() => {
    return adultsNumber.value > 0 || childrenNumber.value > 0
  })

  // ==========================================================================
  // COMPUTED - PRICING CALCULATIONS
  // ==========================================================================

  /**
   * Calculate total price of classes for a single participant
   * @param {string} participantId - The unique ID of the participant
   * @returns {number} Total price of all classes for this participant
   */
  const participantClassesTotalPrice = computed(() => {
    return (participantId) => {
      const participant = participants.value.find(p => p.dynamicId === participantId)
      if (!participant?.selectedClasses || participant.selectedClasses.length === 0) {
        return 0
      }

      return participant.selectedClasses.reduce((sum, classItem) => {
        return sum + (classItem.price || 0)
      }, 0)
    }
  })

  /**
   * Calculate total insurance price for a single participant
   * @param {string} participantId - The unique ID of the participant
   * @returns {number} Total insurance cost for this participant
   *
   * Note: Insurance is skipped for children in group classes
   * For other cases, price is multiplied by number of days if perDay is true
   */
  const participantInsuranceTotalPrice = computed(() => {
    return (participantId) => {
      const participant = participants.value.find(p => p.dynamicId === participantId)
      if (!participant?.selectedClasses) {
        return 0
      }

      return participant.selectedClasses.reduce((sum, classItem) => {
        // Skip insurance for child participants in group classes
        if (participant.participantType === 'child' && classItem.type === 'group') {
          return sum
        }

        if (!classItem.insurance?.enabled) return sum

        const insurancePrice = classItem.insurance.price || 0
        const dayMultiplier = classItem.insurance.perDay ? (classItem.dates?.length || 1) : 1
        return sum + (insurancePrice * dayMultiplier)
      }, 0)
    }
  })

  /**
   * Calculate total price for all participants combined
   * Sums up all classes and insurance costs, then applies generic discount
   * @returns {number} Final total price for the entire booking (never negative)
   */
  const allParticipantsTotalPrice = computed(() => {
    const classesTotal = participants.value.reduce((total, participant) => {
      return total + participantClassesTotalPrice.value(participant.dynamicId)
    }, 0)

    const insuranceTotal = participants.value.reduce((total, participant) => {
      return total + participantInsuranceTotalPrice.value(participant.dynamicId)
    }, 0)

    return Math.max(0, (classesTotal + insuranceTotal) - discountGeneric)
  })

  // ==========================================================================
  // STATE - DISCOUNTS AND PROMOTIONS
  // ==========================================================================

  /**
   * Discount and promotional features
   * Currently in development, will be used for implementing package deals
   */
  const discountPackage_10 = ref(false)         // 10% package discount (not yet implemented)
  const discountPackage_20 = ref(false)         // 20% package discount (not yet implemented)
  const discountGeneric = 50                    // Generic discount value for demonstration
  const missingClassesForDiscount = ref(false)  // Tracks if user is close to discount threshold

  // ==========================================================================
  // STATE - ADDITIONAL OPTIONS
  // ==========================================================================

  /**
   * Insurance selections per participant
   * Object structure: { participantId: insuranceOption }
   */
  const insuranceSelected = ref({})

  // ==========================================================================
  // WATCHER - PARTICIPANT SYNCHRONIZATION
  // ==========================================================================

  /**
   * CRUCIAL: Automatically sync the participants array with adults/children counts
   *
   * This watcher ensures that:
   * - When counts increase: new participant objects are created
   * - When counts decrease: excess participants are removed
   * - Adult participants are added first, then children
   * - Each new participant gets a unique ID and proper type
   */
  watch([adultsNumber, childrenNumber], ([newAdults, newChildren]) => {
    const totalNeeded = newAdults + newChildren
    const currentLength = participants.value.length

    // Add new participants if needed
    if (totalNeeded > currentLength) {
      const toAdd = totalNeeded - currentLength
      const adultsToAdd = Math.max(0, newAdults - participants.value.filter(p => p.participantType === 'adult').length)

      // Create new participant objects with proper type assignment
      const newParticipants = Array.from({length: toAdd}, (_, i) => {
        const isAdult = i < adultsToAdd
        return reactive({
          ...blankParticipant,
          dynamicId: generateUniqueId(),
          participantType: isAdult ? 'adult' : 'child',
          age: isAdult ? null : null, // Age will be set by user input
          selectedClasses: JSON.parse(JSON.stringify(blankParticipant.selectedClasses)) // Deep clone to avoid shared reference
        })
      })
      participants.value.push(...newParticipants)
    } else if (totalNeeded < currentLength) {
      // Remove excess participants from the end
      const toRemove = currentLength - totalNeeded
      participants.value.splice(-toRemove)
    }
  }, {immediate: true}) // Execute immediately on store initialization

  // ==========================================================================
  // ACTIONS - RESET FUNCTIONALITY
  // ==========================================================================

  /**
   * Reset the entire booking to initial state
   * Clears all selections and returns to default values
   */
  const resetEvent = () => {
    dateOfStay.value = null
    adultsNumber.value = 1
    childrenNumber.value = 0
    participants.value = []
  }

  // ==========================================================================
  // ACTIONS - LOYALTY CARD VALIDATION
  // ==========================================================================

  /** Loading state during loyalty card number validation */
  const checkingLoyaltyCardNumber = ref(false)

  /** Result of loyalty card number validation (true/false/null) */
  const isValidLoyaltyCardNumber = ref(null)

  /**
   * Validate loyalty card number (simulated with timeout)
   * @param {string} number - The loyalty card number to check
   * @returns {Promise<boolean>} Promise resolving to validation result
   *
   * Validation logic (temporary): Card is valid if last digit is even
   * TODO: Replace with actual API call to loyalty program service
   */
  const checkLoyaltyCardNumber = (number) => {
    checkingLoyaltyCardNumber.value = true
    isValidLoyaltyCardNumber.value = null // Reset validation state
    return new Promise((resolve) => {
      setTimeout(() => {
        // Temporary validation: even last digit = valid card
        const isValid = parseInt(number.slice(-1)) % 2 === 0
        isValidLoyaltyCardNumber.value = isValid
        checkingLoyaltyCardNumber.value = false
        resolve(isValid)
      }, 1000) // Simulate network delay
    })
  }

  // ==========================================================================
  // STORE EXPORTS
  // ==========================================================================

  return {
    // ==========================================================================
    // STATE REFS
    // ==========================================================================

    event,                          // Complete event object (computed)
    dateOfStay,                     // Selected date range
    adultsNumber,                   // Number of adults
    childrenNumber,                 // Number of children
    participants,                   // Participants array
    discountPackage_10,             // 10% package discount flag
    discountPackage_20,             // 20% package discount flag
    missingClassesForDiscount,      // Discount threshold tracking
    insuranceSelected,              // Insurance selections per participant
    hasLoyaltyCard,                 // Loyalty card checkbox state
    loyaltyProgram,                 // Loyalty program data
    isValidLoyaltyCardNumber,       // Loyalty card validation result
    discountGeneric,                // Generic discount amount
    stayManagerData,                // Stay manager information
    anotherPayerData,               // Different payer checkbox
    payerData,                      // Payer information
    receiveInvoice,                 // Invoice request checkbox
    invoiceData,                    // Invoice/company details
    stokSchoolRegulationsAccepted,  // School regulations acceptance
    stokSchoolRodoAccepted,         // RODO/GDPR acceptance
    stokSchoolPaymentRegulationsAccepted, // Payment regulations acceptance
    agreementsAcceptedCombined,     // All agreements check (computed)

    // ==========================================================================
    // COMPUTED PROPERTIES
    // ==========================================================================

    maxAdults,                      // Maximum adults allowed
    maxChildren,                    // Maximum children allowed
    participantsNumberCondition,    // Validation: at least one participant
    participantClassesTotalPrice,   // Single participant classes price calculator
    participantInsuranceTotalPrice, // Single participant insurance price calculator
    allParticipantsTotalPrice,      // Total price for all participants
    checkingLoyaltyCardNumber,      // Loyalty card validation loading state

    // ==========================================================================
    // ACTIONS/METHODS
    // ==========================================================================

    resetEvent,                     // Reset booking to initial state
    checkLoyaltyCardNumber,         // Validate loyalty card number

    // ==========================================================================
    // CONFIGURATION (from StayConfigStore)
    // ==========================================================================

    activityTypes: configStore.activityTypes,                               // Available activities (ski/snowboard)
    skillLevels_ADULTS: configStore.skillLevels_ADULTS,                     // Adult skill levels
    skillLevels_CHILDREN_SKI: configStore.skillLevels_CHILDREN_SKI,         // Children ski skill levels
    skillLevels_CHILDREN_SNOWBOARD: configStore.skillLevels_CHILDREN_SNOWBOARD, // Children snowboard skill levels
    availableLanguages: configStore.availableLanguages,                     // Available class languages
    currency: configStore.currency,                                         // Currency settings

    // ==========================================================================
    // TEMPORARY/DEVELOPMENT
    // ==========================================================================

    DUMMY_SELECTED_CLASSES,         // Temporary dummy data (to be removed)
  }
})
