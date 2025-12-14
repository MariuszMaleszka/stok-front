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
]

// Blank participant template
const blankParticipant = {
  dynamicId: '',
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
}

export const useStayStore = defineStore('stayStore', () => {
  const configStore = useStayConfigStore()

  // States
  const dateOfStay = ref(null)
  const adultsNumber = ref(1)
  const childrenNumber = ref(0)
  const participants = ref([])

  // 👉 Computed event object
  const event = computed(() => ({
    id: null,
    dateOfStay: dateOfStay.value,
    adultsNumber: adultsNumber.value,
    childrenNumber: childrenNumber.value,
    participants: participants.value,
  }))

  // Computed max values based on total constraint
  const maxAdults = computed(() => 12 - childrenNumber.value)
  const maxChildren = computed(() => 12 - adultsNumber.value)

  // Participants number condition
  const participantQuantityConditions = computed(() => {
    return adultsNumber.value > 0 || childrenNumber.value > 0
  })

  // 👉 Participant classes total price
  const participantClassesTotalPrice = computed(() => {
    const priceMap = new Map()

    for (const participant of participants.value) {
      if (!participant.selectedClasses || participant.selectedClasses.length === 0) {
        priceMap.set(participant.dynamicId, 0)
        continue
      }

      const total = participant.selectedClasses.reduce((sum, classItem) => {
        let classTotal = classItem.price || 0

        if (classItem.insurance?.enabled) {
          classTotal += classItem.insurance.perDay && classItem.dates ? (classItem.insurance.price * classItem.dates.length) : classItem.insurance.price
        }

        return sum + classTotal
      }, 0)

      priceMap.set(participant.dynamicId, total)
    }

    return priceMap
  })

  // 👉 Promotions/discounts/suggestions
  const discountPackage_10 = ref(false)
  const discountPackage_20 = ref(false)
  const missingClassesForDiscount = ref(false)
  const insuranceForAllCost = 200

  // CRUCIAL: Watchers to sync participants with adults/children numbers
  // This is responsible for adding/removing participant entries
  watch([adultsNumber, childrenNumber], ([newAdults, newChildren]) => {
    const totalNeeded = newAdults + newChildren
    const currentLength = participants.value.length

    if (totalNeeded > currentLength) {
      const toAdd = totalNeeded - currentLength
      const newParticipants = Array.from({ length: toAdd }, () =>
        reactive({ ...blankParticipant, dynamicId: generateUniqueId() }),
      )
      participants.value.push(...newParticipants)
    } else if (totalNeeded < currentLength) {
      participants.value = participants.value.slice(0, totalNeeded)
    }

    for (const [index, participant] of participants.value.entries()) {
      participant.participantType = index < newAdults ? 'adult' : 'child'
    }
  }, { immediate: true })

  // Reset function
  const resetEvent = () => {
    dateOfStay.value = null
    adultsNumber.value = 1
    childrenNumber.value = 0
    participants.value = []
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
    insuranceForAllCost,

    // Computed
    maxAdults,
    maxChildren,
    participantQuantityConditions,
    participantClassesTotalPrice,

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
  }
})
