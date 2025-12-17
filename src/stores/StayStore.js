import { defineStore } from 'pinia'
import { computed, reactive, ref, watch } from 'vue'
import { generateUniqueId } from '@/utils/numbers.js'
import { useStayConfigStore } from './StayConfigStore.js'
// To be removed
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
      { date: '01.01.2025', time: '9:00 - 9:55' },
    ],
    price: 100,
    insurance: {
      title: 'NNW Turystyczno-Sportowe lorem ipsum amet dolor blabla tututut',
      enabled: false,
      price: 10,
      perDay: true,
      description: 'PAKIET NNW TURYSTYCZNO-SPORTOWY - Wariant 111 SWIJ indywidualnych\n',
    },
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
      { date: '01.01.2025', time: '9:00 - 9:55' },
      { date: '02.01.2025', time: '9:00 - 9:55' },
      { date: '03.01.2025', time: '9:00 - 9:55' },
    ],
    price: 100,
    insurance: {
      title: 'NNW Turystyczno-Sportowe lorem ipsum amet dolor blabla tututut',
      enabled: false,
      price: 10,
      perDay: true,
      description: 'PAKIET NNW TURYSTYCZNO-SPORTOWY - Wariant 111 SWIJ indywidualnych podróży Kontynenty na terenie RP.',
      imgSource: '',
    },
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
      { date: '01.01.2025', time: '9:00 - 9:55' },
      { date: '02.01.2025', time: '9:00 - 9:55' },
      { date: '03.01.2025', time: '9:00 - 9:55' },
      { date: '04.01.2025', time: '9:00 - 9:55' },
      { date: '05.01.2025', time: '9:00 - 9:55' },
    ],
    price: 250,
    insurance: {
      title: 'NNW Turystyczno-Sportowe lorem ipsum amet dolor blabla tututut',
      enabled: false,
      price: 10,
      perDay: true,
      description: 'PAKIET NNW TURYSTYCZNO-SPORTOWY - Wariant Mateusz na terenie RP.',
      imgSource: '',
    },
  },
]

// Blank participant template
const blankParticipant = {
  dynamicId: '',
  name: '',
  surname: '',
  phone: null,
  birthDate: null,
  participantType: '',
  age: null,
  activityType: '',
  skillLevel: '',
  availableActivityTypes: [],
  availableLessonTypes: [],
  showGroupLessons: true,
  classLang: 'Polski',
  selectedClasses: DUMMY_SELECTED_CLASSES,
  loyaltyProgram: {},
}

export const useStayStore = defineStore('stayStore', () => {
  const configStore = useStayConfigStore()

  // States
  const dateOfStay = ref(null)
  const adultsNumber = ref(1)
  const childrenNumber = ref(0)
  const participants = ref([])
  const hasLoyaltyCard = ref(false) // Loyalty card checkbox
  const loyaltyProgram = ref({
    loyaltyCard: false,
    loyaltyCardOwnerName: '',
    loyaltyCardOwnerSurname: '',
    loyaltyCardNumber: null,
  })

  // 👉 Computed event object
  const event = computed(() => ({
    id: null,
    dateOfStay: dateOfStay.value,
    adultsNumber: adultsNumber.value,
    childrenNumber: childrenNumber.value,
    participants: participants.value,
    additionalOptions: {},
    loyaltyProgram: {
      loyaltyCard: hasLoyaltyCard.value,
      loyaltyCardOwnerName: loyaltyProgram.value.loyaltyCardOwnerName,
      loyaltyCardOwnerSurname: loyaltyProgram.value.loyaltyCardOwnerSurname,
      loyaltyCardNumber: loyaltyProgram.value.loyaltyCardNumber,
    },
  }))

  // Computed max values based on total constraint
  const maxAdults = computed(() => 12 - childrenNumber.value)
  const maxChildren = computed(() => 12 - adultsNumber.value)

  // Participants number condition
  const participantsNumberCondition = computed(() => {
    return adultsNumber.value > 0 || childrenNumber.value > 0
  })

  // 👉 Participant (singular) classes total price
  const participantClassesTotalPrice = computed(() => {
    return participantId => {
      const participant = participants.value.find(p => p.dynamicId === participantId)
      if (!participant?.selectedClasses || participant.selectedClasses.length === 0) {
        return 0
      }

      return participant.selectedClasses.reduce((sum, classItem) => {
        return sum + (classItem.price || 0)
      }, 0)
    }
  })
  // 👉 Participant (singular) insurance total price
  const participantInsuranceTotalPrice = computed(() => {
    return participantId => {
      const participant = participants.value.find(p => p.dynamicId === participantId)
      if (!participant?.selectedClasses) {
        return 0
      }

      return participant.selectedClasses.reduce((sum, classItem) => {
        // Skip insurance for child participants in group classes
        if (participant.participantType === 'child' && classItem.type === 'group') {
          return sum
        }

        if (!classItem.insurance?.enabled) {
          return sum
        }

        const insurancePrice = classItem.insurance.price || 0
        const dayMultiplier = classItem.insurance.perDay ? (classItem.dates?.length || 1) : 1
        return sum + (insurancePrice * dayMultiplier)
      }, 0)
    }
  })

  // 👉 All participants total price (combined classes + insurance)
  const allParticipantsTotalPrice = computed(() => {
    const classesTotal = participants.value.reduce((total, participant) => {
      return total + participantClassesTotalPrice.value(participant.dynamicId)
    }, 0)

    const insuranceTotal = participants.value.reduce((total, participant) => {
      return total + participantInsuranceTotalPrice.value(participant.dynamicId)
    }, 0)

    return Math.max(0, (classesTotal + insuranceTotal) - discountGeneric)
  })

  // 👉 Promotions/discounts/suggestions
  const discountPackage_10 = ref(false) // not used for now
  const discountPackage_20 = ref(false) // not used for now
  const discountGeneric = 50 // a generic discount value for demonstration
  const missingClassesForDiscount = ref(false) // not used for now

  // Additional options
  const insuranceSelected = ref({}) // selections per participant

  // CRUCIAL: Watchers to sync participants with adults/children numbers
  // This is responsible for adding/removing participant entries
  watch([adultsNumber, childrenNumber], ([newAdults, newChildren]) => {
    const totalNeeded = newAdults + newChildren
    const currentLength = participants.value.length

    if (totalNeeded > currentLength) {
      const toAdd = totalNeeded - currentLength
      const adultsToAdd = Math.max(0, newAdults - participants.value.filter(p => p.participantType === 'adult').length)

      const newParticipants = Array.from({ length: toAdd }, (_, i) => {
        const isAdult = i < adultsToAdd
        return reactive({
          ...blankParticipant,
          dynamicId: generateUniqueId(),
          participantType: isAdult ? 'adult' : 'child',
          age: isAdult ? null : null, // Age will be set by user for children
          selectedClasses: JSON.parse(JSON.stringify(blankParticipant.selectedClasses)),
        })
      })
      participants.value.push(...newParticipants)
    } else if (totalNeeded < currentLength) {
      // Remove excess participants from the end
      const toRemove = currentLength - totalNeeded
      participants.value.splice(-toRemove)
    }
  }, { immediate: true })

  // Reset function
  const resetEvent = () => {
    dateOfStay.value = null
    adultsNumber.value = 1
    childrenNumber.value = 0
    participants.value = []
  }

  // Loyalty card number checking simulation
  const checkingLoyaltyCardNumber = ref(false)
  const isValidLoyaltyCardNumber = ref(null)
  const checkLoyaltyCardNumber = number => {
    checkingLoyaltyCardNumber.value = true
    isValidLoyaltyCardNumber.value = null // Reset validation state
    return new Promise(resolve => {
      setTimeout(() => {
        const isValid = Number.parseInt(number.slice(-1)) % 2 === 0
        isValidLoyaltyCardNumber.value = isValid
        checkingLoyaltyCardNumber.value = false
        resolve(isValid)
      }, 1000)
    })
  }

  return {
    // State
    event,
    dateOfStay,
    adultsNumber,
    childrenNumber,
    participants,
    discountPackage_10,
    discountPackage_20,
    missingClassesForDiscount,
    insuranceSelected,
    hasLoyaltyCard,
    loyaltyProgram,
    isValidLoyaltyCardNumber,
    discountGeneric,
    // Computed
    maxAdults,
    maxChildren,
    participantsNumberCondition,
    participantClassesTotalPrice,
    participantInsuranceTotalPrice,
    allParticipantsTotalPrice,
    checkingLoyaltyCardNumber,

    // Actions
    resetEvent,

    // Configuration (from config store)
    activityTypes: configStore.activityTypes,
    skillLevels_ADULTS: configStore.skillLevels_ADULTS,
    skillLevels_CHILDREN_SKI: configStore.skillLevels_CHILDREN_SKI,
    skillLevels_CHILDREN_SNOWBOARD: configStore.skillLevels_CHILDREN_SNOWBOARD,
    availableLanguages: configStore.availableLanguages,
    currency: configStore.currency,

    // Temporary
    DUMMY_SELECTED_CLASSES,
    // Methods
    checkLoyaltyCardNumber,
  }
})
