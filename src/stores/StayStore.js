import {defineStore} from 'pinia'
import {computed, reactive, ref, watch} from 'vue'
import {useI18n} from "vue-i18n";



// To be removed
const DUMMY_SELECTED_CLASSES = [
  {
    type: 'group',
    title: 'Zajęcia grupowe - narciarstwo',
    classType: 'ski',
    groupName: 'Grupa poranna',
    instructor: 'Kaczyński Jan',
    skillLevel: 'Średni',
    dates: [
      { date: '01.01.2025', time: '9:00 - 9:55' }
    ],
    price: 100.00,
    insurance: {
      enabled: false,
      price: 10.00,
      perDay: true,
      description: 'PAKIET NNW TURYSTYCZNO-SPORTOWY - Wariant 111 SWIJ indywidualnych\n' +
        'podróży Kontynenty na terenie RP. '
    }
  },
  {
    type: 'individual',
    title: 'Zajęcia indywidualne',
    classType: 'snowboard',
    instructor: 'Marcin Kowalik',
    dates: [
      { date: '01.01.2025', time: '9:00 - 9:55' },
      { date: '02.01.2025', time: '9:00 - 9:55' },
      { date: '03.01.2025', time: '9:00 - 9:55' },
    ],
    price: 100.00,
    insurance: {
      enabled: false,
      price: 10.00,
      perDay: true,
      description: 'PAKIET NNW TURYSTYCZNO-SPORTOWY - Wariant 111 SWIJ indywidualnych\n' +
        'podróży Kontynenty na terenie RP. '
    }
  }
]


export const useStayStore = defineStore('stayStore', () => {
  const {t} = useI18n()

  const dateOfStay = ref(null)
  const adultsNumber = ref(1)
  const childrenNumber = ref(0)  // Start with 0 children

  const availableLanguages = [
    {name: t('polish'), selected: true},
    {name: t('english'), selected: false},
  ]

  const participantTemplate = {
    name: '',
    participantType: '',
    age: null,
    activityType: '',
    skillLevel: '',
    availableActivityTypes: [],
    availableLessonTypes: [],
    showGroupLessons: true,
    classLang: 'Polski',
    selectedClasses: DUMMY_SELECTED_CLASSES
  }

  const activityTypes = reactive([
    {name: t('ski'), selected: false},
    {name: t('snowboard'), selected: false},
  ])

  const skillLevels_ADULTS = reactive([
    {
      name: t('firstime'),
      description: t('firstime_desc'),
      additionalInfo: t('firstime_info'),
      selected: false
    },
    {
      name: t('novice'),
      description: t('novice_desc'),
      additionalInfo: t('novice_info'),
      selected: false
    },
    {
      name: t('intermediate'),
      description: t('intermediate_desc'),
      additionalInfo: t('intermediate_info'),
      selected: false
    },
    {
      name: t('advanced'),
      description: t('advanced_desc'),
      additionalInfo: t('advanced_info'),
      selected: false
    },
  ])

  const skillLevels_CHILDREN_SKI = reactive([
    {
      name: t('orange_group'),
      description: t('orange_group_desc'),
      ageRange: [4,10],
      additionalInfo: t('orange_group_info'),
      selected: false
    },
    {
      name: t('bronze_group'),
      description: t('bronze_group_desc'),
      ageRange: [6, 10],
      additionalInfo: t('bronze_group_info'),
      selected: false
    },
    {
      name: t('silver_group'),
      description: t('silver_group_desc'),
      ageRange: [7, 14],
      additionalInfo: t('silver_group_info'),
      selected: false
    },
    {
      name: t('gold_group'),
      description: t('gold_group_desc'),
      ageRange: [9, 14],
      additionalInfo: t('gold_group_info'),
      selected: false
    },
    {
      name: t('diamond_group'),
      description: t('diamond_group_desc'),
      ageRange: [10, 14],
      additionalInfo: t('diamond_group_info'),
      selected: false
    }
  ])

  const skillLevels_CHILDREN_SNOWBOARD = reactive([
    {
      name: t('yellow_snowboard'),
      description: t('yellow_snowboard_desc'),
      ageRange: [7, 14],
      additionalInfo: t('yellow_snowboard_info'),
      selected: false
    },
    {
      name: t('wide_snowboard'),
      description: t('wide_snowboard_desc'),
      ageRange: [7, 14],
      additionalInfo: t('wide_snowboard_info'),
      selected: false
    },
    {
      name: t('narrow_snowboard'),
      description: t('narrow_snowboard_desc'),
      ageRange: [7, 14],
      additionalInfo: t('narrow_snowboard_info'),
      selected: false
    }
  ])


  const participants = ref([])

  // Computed max values based on total constraint
  const maxAdults = computed(() => 12 - childrenNumber.value)
  const maxChildren = computed(() => 12 - adultsNumber.value)

  // Participants number validation
  const canProceed = computed(() => {
    return adultsNumber.value > 0 || childrenNumber.value > 0
  })






  watch([adultsNumber, childrenNumber], ([newAdults, newChildren]) => {
    const totalNeeded = newAdults + newChildren
    const currentLength = participants.value.length

    if (totalNeeded > currentLength) {
      const toAdd = totalNeeded - currentLength
      const newParticipants = Array.from({length: toAdd}, () =>
        reactive({...participantTemplate})
      )
      participants.value.push(...newParticipants)
    } else if (totalNeeded < currentLength) {
      participants.value = participants.value.slice(0, totalNeeded)
    }

    participants.value.forEach((participant, index) => {
      participant.participantType = index < newAdults ? 'adult' : 'child'
    })
  }, { immediate: true })




  return {
    dateOfStay,
    adultsNumber,
    childrenNumber,
    activityTypes,
    skillLevels_ADULTS,
    skillLevels_CHILDREN_SKI,
    skillLevels_CHILDREN_SNOWBOARD,
    participants,
    maxAdults,
    maxChildren,
    canProceed,
    availableLanguages,
    DUMMY_SELECTED_CLASSES
  }
})
