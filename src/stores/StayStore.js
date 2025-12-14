import {defineStore} from 'pinia'
import {computed, reactive, ref, watch} from 'vue'
import {useStayConfigStore} from './StayConfigStore.js'
import {generateUniqueId} from '@/utils/numbers.js'
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

// Blank participant template
const blankParticipant = {
  dynamicId:'',
  name: '',
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
    loyaltyProgram: {
      loyaltyCard: hasLoyaltyCard.value,
      loyaltyCardOwnerName: loyaltyProgram.value.loyaltyCardOwnerName,
      loyaltyCardOwnerSurname: loyaltyProgram.value.loyaltyCardOwnerSurname,
      loyaltyCardNumber: loyaltyProgram.value.loyaltyCardNumber,
    }
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
  // 👉 Participant (singular) insurance total price
  const participantInsuranceTotalPrice = computed(() => {
    return (participantId) => {
      const participant = participants.value.find(p => p.dynamicId === participantId)
      if (!participant?.selectedClasses) {
        return 0
      }

      return participant.selectedClasses.reduce((sum, classItem) => {
        if (!classItem.insurance?.enabled) return sum

        const insurancePrice = classItem.insurance.price || 0
        const dayMultiplier = classItem.insurance.perDay ? (classItem.dates?.length || 1) : 1
        return sum + (insurancePrice * dayMultiplier)
      }, 0)
    }
  })

  // 👉 Promotions/discounts/suggestions
  const discountPackage_10 = ref(false) // not used for now
  const discountPackage_20 = ref(false) // not used for now
  const missingClassesForDiscount = ref(false) // not used for now

  // Additional options
  const insuranceSelected = ref({})

  // CRUCIAL: Watchers to sync participants with adults/children numbers
  // This is responsible for adding/removing participant entries
  watch([adultsNumber, childrenNumber], ([newAdults, newChildren]) => {
    const totalNeeded = newAdults + newChildren
    const currentLength = participants.value.length

    if (totalNeeded > currentLength) {
      const toAdd = totalNeeded - currentLength
      // Participants must have their own reactive objects
      const newParticipants = Array.from({length: toAdd}, () =>
        reactive({
          ...blankParticipant,
          dynamicId: generateUniqueId(),
          selectedClasses: JSON.parse(JSON.stringify(blankParticipant.selectedClasses))
        })
      )
      participants.value.push(...newParticipants)
    } else if (totalNeeded < currentLength) {
      participants.value = participants.value.slice(0, totalNeeded)
    }

    participants.value.forEach((participant, index) => {
      participant.participantType = index < newAdults ? 'adult' : 'child'
    })
  }, {immediate: true})

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
  const checkLoyaltyCardNumber = (number) => {
    checkingLoyaltyCardNumber.value = true
    isValidLoyaltyCardNumber.value = null // Reset validation state
    return new Promise((resolve) => {
      setTimeout(() => {
        const isValid = parseInt(number.slice(-1)) % 2 === 0
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
    // Computed
    maxAdults,
    maxChildren,
    participantsNumberCondition,
    participantClassesTotalPrice,
    participantInsuranceTotalPrice,
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
