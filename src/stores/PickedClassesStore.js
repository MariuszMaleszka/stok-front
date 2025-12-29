import { useCookies } from '@vueuse/integrations/useCookies'
import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useStayStore } from './StayStore'

export const usePickedClassesStore = defineStore('pickedClassesStore', () => {
  const stayStore = useStayStore()
  const cookies = useCookies(['booking_preferences'])

  // Helper to generate dynamic dates
  const getFutureDate = daysToAdd => {
    const d = new Date()
    d.setDate(d.getDate() + daysToAdd)
    return d
  }

  const formatDate = date => {
    return date.toISOString().split('T')[0]
  }

  // Helper to generate classDates array
  const generateClassDates = count => {
    return Array.from({ length: count }, (_, i) => formatDate(getFutureDate(i)))
  }

  // Base slots templates
  const baseSlots = [
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
        { date: '01.01.2025', time: '9:00 - 10:00' },
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
      // Compatibility fields
      gender: 'male',
      duration: '1h',
      timeOfDay: 'Rano',
      isChildSpecialist: false,
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
        { date: '03.01.2025', time: '9:00 - 9:55' },
        { date: '03.01.2025', time: '9:00 - 9:55' },
        { date: '03.01.2025', time: '9:00 - 9:55' },
        { date: '03.01.2025', time: '9:00 - 9:55' },
        { date: '03.01.2025', time: '9:00 - 9:55' },
        { date: '03.01.2025', time: '9:00 - 9:55' },
        { date: '03.01.2025', time: '9:00 - 9:55' },
        { date: '03.01.2025', time: '9:00 - 9:55' },
        { date: '03.01.2025', time: '9:00 - 9:55' },
        { date: '03.01.2025', time: '9:00 - 9:55' },
        { date: '03.01.2025', time: '9:00 - 9:55' },
        { date: '03.01.2025', time: '9:00 - 9:55' },
        { date: '03.01.2025', time: '9:00 - 9:55' },
        { date: '03.01.2025', time: '9:00 - 9:55' },
        { date: '03.01.2025', time: '9:00 - 9:55' },
        { date: '03.01.2025', time: '9:00 - 9:55' },
        { date: '03.01.2025', time: '9:00 - 9:55' },
        { date: '03.01.2025', time: '9:00 - 9:55' },
      ],
      price: 350,
      insurance: {
        title: 'NNW Turystyczno-Sportowe lorem ipsum amet dolor blabla tututut',
        enabled: false,
        price: 10,
        perDay: true,
        description: 'PAKIET NNW TURYSTYCZNO-SPORTOWY - Wariant Mateusz na terenie RP.',
        imgSource: '',
      },
      // Compatibility fields
      gender: 'male',
      duration: '1h',
      timeOfDay: 'Rano',
      isChildSpecialist: true,
    },
  ]

  // Generate slots for next 30 days
  const generateAvailableSlots = () => {
    const slots = []
    const daysToGenerate = 30
    for (let i = 0; i < daysToGenerate; i++) {
      const date = getFutureDate(i)
      const dateStr = formatDate(date)
      for (const [index, slot] of baseSlots.entries()) {
        // Populate dates with current date
        const dates = slot.dates.map(d => ({ ...d, date: dateStr }))
        slots.push({
          ...slot,
          id: `${dateStr}-${index}`,
          dates,
        })
      }
    }
    return slots
  }

  // Mock Data
  const availableSlots = ref(generateAvailableSlots())

  const availableGroups = ref([
    {
      id: 1,
      type: 'group',
      title: 'Zajęcia grupowe - narciarstwo',
      classType: 'ski',
      groupName: 'Grupa poranna',
      instructor: 'Kaczyński Jan',
      skillLevel: 'Średni',
      dates: generateClassDates(5).map(d => ({ date: d, time: '09:00 - 09:55' })),
      description: '5 dni zajęć, zajęcia 1x dziennie',
      price: 1200,
      insurance: {
        title: 'NNW Turystyczno-Sportowe lorem ipsum amet dolor blabla tututut',
        enabled: false,
        price: 10,
        perDay: true,
        description: 'PAKIET NNW TURYSTYCZNO-SPORTOWY - Wariant 111 SWIJ indywidualnych\n',
      },
    },
    {
      id: 2,
      type: 'group',
      title: 'Zajęcia grupowe - snowboard',
      classType: 'snowboard',
      groupName: 'Grupa popołudniowa',
      instructor: 'Nowak Anna',
      skillLevel: 'Początkujący',
      dates: generateClassDates(5).map(d => ({ date: d, time: '14:00 - 14:55' })),
      description: '5 dni zajęć, zajęcia 1x dziennie',
      price: 690,
      insurance: {
        title: 'NNW Turystyczno-Sportowe lorem ipsum amet dolor blabla tututut',
        enabled: false,
        price: 10,
        perDay: true,
        description: 'PAKIET NNW TURYSTYCZNO-SPORTOWY - Wariant 111 SWIJ indywidualnych\n',
      },
    },
  ])

  // State
  const searchPreviouslySelected = ref(false)
  const selectedDate = ref(formatDate(new Date()))
  const selectedActivityType = ref('ski')

  function setSelectedActivityType (type) {
    selectedActivityType.value = type
  }

  // Save/Load preference for "Search Previously Selected"
  function setSearchPreviouslySelected (val) {
    searchPreviouslySelected.value = val
    cookies.set('search_prev_instructor', val ? 'true' : 'false')
  }

  // Save/Load general filter preferences
  function saveFilterPreferences (prefs) {
    // Save common fields
    const toSave = {
      timeOfDay: prefs.timeOfDay,
      duration: prefs.duration,
      instructorGender: prefs.instructorGender,
      findSpecificInstructor: prefs.findSpecificInstructor,
      childSpecialist: prefs.childSpecialist,
      selectedInstructor: prefs.selectedInstructor,
    }
    cookies.set('user_filter_preferences', JSON.stringify(toSave))
  }

  function loadFilterPreferences () {
    const saved = cookies.get('user_filter_preferences')
    if (saved) {
      try {
        const parsed = typeof saved === 'string' ? JSON.parse(saved) : saved
        return {
          timeOfDay: parsed.timeOfDay || 'Dowolna',
          duration: parsed.duration || '2h',
          instructorGender: parsed.instructorGender || 'Dowolna',
          findSpecificInstructor: parsed.findSpecificInstructor || false,
          childSpecialist: parsed.childSpecialist || false,
          selectedInstructor: parsed.selectedInstructor || null,
        }
      } catch {
        return null
      }
    }
    return null
  }

  // Auto-enable if preference is saved and we have an instructor
  watch(searchPreviouslySelected, val => {
    // Also sync if changed directly (e.g. v-model, though we prefer setter)
    cookies.set('search_prev_instructor', val ? 'true' : 'false')
  })

  // Individual Preferences
  const individualPreferences = ref({
    selectedInstructor: null,
    timeOfDay: 'Dowolna',
    duration: '2h',
    instructorGender: 'Dowolna',
    findSpecificInstructor: false,
    childSpecialist: false,
  })

  // Shared Preferences
  const sharedPreferences = ref({
    selectedInstructor: null,
    timeOfDay: 'Dowolna',
    duration: '2h',
    instructorGender: 'Dowolna',
    findSpecificInstructor: false,
    childSpecialist: false,
  })

  // Selected Slots
  const individualSlot = ref(null)
  const sharedSlot = ref(null)
  const selectedGroup = ref(null)
  const childAddOnSelections = ref({})
  const childAddOnPrice = 340

  // Pagination
  const visibleSlotsLimit = ref(4)

  // Booked Classes
  const bookedClasses = ref([])

  // Getters
  const instructors = computed(() => {
    const names = new Set(availableSlots.value.filter(s => s.instructor).map(s => s.instructor))
    return Array.from(names)
  })

  // Computed helper to get status for current group or a specific group
  const isChildAddOnSelected = computed(() => {
    return groupId => !!childAddOnSelections.value[groupId]
  })

  // Check if there is any booked class with an instructor
  const hasPreviouslySelectedInstructor = computed(() => {
    return bookedClasses.value.some(booking => booking.instructor)
  })

  const getFilteredSlots = type => {
    let slots = availableSlots.value

    // Filter by Date
    if (selectedDate.value) {
      slots = slots.filter(s => s.dates && s.dates[0] && s.dates[0].date === selectedDate.value)
    }

    const prefs = type === 'individual' ? individualPreferences.value : sharedPreferences.value

    // Filter by Time of Day
    if (prefs.timeOfDay && prefs.timeOfDay !== 'Dowolna') {
      slots = slots.filter(s => s.timeOfDay === prefs.timeOfDay)
    }

    // Filter by "Previously Selected Instructor" (Switch)
    if (searchPreviouslySelected.value) {
      const prevInstructors = bookedClasses.value.map(b => b.instructor).filter(Boolean)
      slots = prevInstructors.length > 0
        ? slots.filter(s => prevInstructors.includes(s.instructor))
        : slots.filter(s => s.instructor)
    }

    // Filter by Selected Instructor (if checkbox is checked)
    if (prefs.findSpecificInstructor && prefs.selectedInstructor) {
      slots = slots.filter(s => s.instructor === prefs.selectedInstructor)
    }

    // Filter by Duration
    if (prefs.duration) {
      slots = slots.filter(s => s.duration === prefs.duration)
    }

    // Filter by Gender
    if (prefs.instructorGender && prefs.instructorGender !== 'Dowolna') {
      const targetGender = prefs.instructorGender === 'Mężczyzna' ? 'male' : 'female'
      slots = slots.filter(s => s.gender === targetGender)
    }

    // Filter by Child Specialist
    if (prefs.childSpecialist) {
      slots = slots.filter(s => s.isChildSpecialist)
    }

    return slots
  }

  const individualFilteredSlots = computed(() => getFilteredSlots('individual'))
  const sharedFilteredSlots = computed(() => getFilteredSlots('shared'))

  const filteredGroups = computed(() => {
    // Determine stay duration
    let duration = 5 // Default max
    if (stayStore.dateOfStay && Array.isArray(stayStore.dateOfStay) && stayStore.dateOfStay.length > 0) {
      const start = new Date(stayStore.dateOfStay[0])
      const end = stayStore.dateOfStay[1] ? new Date(stayStore.dateOfStay[1]) : new Date(start)
      const diffTime = Math.abs(end - start)
      duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    } else if (stayStore.dateOfStay) {
      // Single date case
      duration = 1
    }

    return availableGroups.value.filter(group => {
      // Filter by Activity Type
      if (group.classType && group.classType !== selectedActivityType.value) {
        return false
      }

      // Extract days from description e.g. "5 dni zajęć"
      const match = group.description.match(/(\d+)\s+dni/)
      if (match) {
        const groupDays = Number.parseInt(match[1], 10)
        return groupDays <= duration
      }
      return true
    })
  })

  const displayedIndividualSlots = computed(() => individualFilteredSlots.value.slice(0, visibleSlotsLimit.value))
  const displayedSharedSlots = computed(() => sharedFilteredSlots.value.slice(0, visibleSlotsLimit.value))

  const getBookedClass = (participantId, dateStr) => {
    // Deprecated: returns first booking
    return bookedClasses.value.find(c => c.participantId === participantId && c.dateStr === dateStr)
  }

  const getBookedClasses = (participantId, dateStr) => {
    return bookedClasses.value.filter(c => c.participantId === participantId && c.dateStr === dateStr)
  }

  // Actions
  function setSelectedDate (dateIso) {
    selectedDate.value = dateIso
  }

  function loadMoreSlots () {
    visibleSlotsLimit.value += 4
  }

  function resetState () {
    // Reset state but respect preference if applicable
    const pref = cookies.get('search_prev_instructor')
    searchPreviouslySelected.value = hasPreviouslySelectedInstructor.value && (pref === 'true' || pref === true)

    const savedFilters = loadFilterPreferences()
    const defaults = { selectedInstructor: null, timeOfDay: 'Dowolna', duration: '2h', instructorGender: 'Dowolna', findSpecificInstructor: false, childSpecialist: false }

    if (savedFilters) {
      individualPreferences.value = { ...defaults, ...savedFilters }
      sharedPreferences.value = { ...defaults, ...savedFilters }
    } else {
      individualPreferences.value = { ...defaults }
      sharedPreferences.value = { ...defaults }
    }

    individualSlot.value = null
    sharedSlot.value = null
    selectedGroup.value = null
    childAddOnSelections.value = {}
    visibleSlotsLimit.value = 4
  }

  function addBookedClass (booking) {
    // Extract instructor if present in data.slot
    let instructor = booking.instructor
    if (!instructor && booking.data && booking.data.slot && booking.data.slot.instructor) {
      instructor = booking.data.slot.instructor
    }

    // Add unique ID
    const newBooking = {
      ...booking,
      instructor,
      id: Date.now() + Math.random().toString(36).slice(2, 11),
    }
    bookedClasses.value.push(newBooking)
  }

  function removeBookedClass (bookingId) {
    const bookingToRemove = bookedClasses.value.find(c => c.id === bookingId)
    if (!bookingToRemove) {
      return
    }

    if (bookingToRemove.groupBookingId) {
      // Remove all with same groupBookingId
      bookedClasses.value = bookedClasses.value.filter(c => c.groupBookingId !== bookingToRemove.groupBookingId)
    } else {
      const index = bookedClasses.value.findIndex(c => c.id === bookingId)
      if (index !== -1) {
        bookedClasses.value.splice(index, 1)
      }
    }
  }

  return {
    // State
    availableSlots,
    availableGroups,
    searchPreviouslySelected,
    selectedDate,
    selectedActivityType,
    individualPreferences,
    sharedPreferences,
    individualSlot,
    sharedSlot,
    selectedGroup,
    childAddOnSelections,
    isChildAddOnSelected,
    childAddOnPrice,
    visibleSlotsLimit,
    bookedClasses,

    // Getters
    instructors,
    individualFilteredSlots,
    sharedFilteredSlots,
    filteredGroups,
    displayedIndividualSlots,
    displayedSharedSlots,
    getBookedClass,
    getBookedClasses,
    hasPreviouslySelectedInstructor,

    // Actions
    setSelectedDate,
    setSelectedActivityType,
    setSearchPreviouslySelected,
    saveFilterPreferences,
    loadFilterPreferences,
    loadMoreSlots,
    resetState,
    addBookedClass,
    removeBookedClass,
  }
})
