import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const usePickedClassesStore = defineStore('pickedClassesStore', () => {
  // Mock Data
  const availableSlots = ref([
    { id: 1, time: '9:00 - 11:00', price: 50, instructor: 'Marcin Kowalik', gender: 'male', duration: '2h', timeOfDay: 'Rano' },
    { id: 2, time: '10:00 - 12:00', price: 50, instructor: 'Anna Nowak', gender: 'female', duration: '2h', timeOfDay: 'Rano' },
    { id: 3, time: '10:00 - 12:00', price: 50, isHappyHours: true, duration: '2h', timeOfDay: 'Rano' },
    { id: 4, time: '10:30 - 12:30', price: 50, duration: '2h', timeOfDay: 'Rano' },
    { id: 5, time: '11:00 - 13:00', price: 50, duration: '2h', timeOfDay: 'Rano' },
    { id: 6, time: '14:00 - 16:00', price: 50, instructor: 'Piotr Wiśniewski', gender: 'male', duration: '2h', timeOfDay: 'Popołudnie' },
    { id: 7, time: '15:00 - 16:00', price: 35, instructor: 'Maria Zielińska', gender: 'female', duration: '1h', timeOfDay: 'Popołudnie' },
    { id: 8, time: '18:00 - 20:00', price: 50, instructor: 'Tomasz Kamiński', gender: 'male', duration: '2h', timeOfDay: 'Wieczór' },
    { id: 9, time: '19:00 - 20:00', price: 35, instructor: 'Katarzyna Lewandowska', gender: 'female', duration: '1h', timeOfDay: 'Wieczór' },
  ])

  const availableGroups = ref([
    { id: 1, name: 'Nazwa grupy lorem ipsum', dates: '1 sty 2025 - 6 sty 2025', description: '5 dni zajęć, zajęcia 1x dziennie', schedule: 'od 9:30 do 10:30', price: 1400 },
    { id: 2, name: 'Nazwa grupy lorem ipsum', dates: '1 sty 2025 - 3 sty 2025', description: '3 dni zajęć, zajęcia 2x dziennie', schedule: 'od 9:30 do 10:30 oraz od 15:30 do 17:30', price: 1400 },
    { id: 3, name: 'Nazwa grupy lorem ipsum', dates: '1 sty 2025 - 6 sty 2025', description: '5 dni zajęć, zajęcia 1x dziennie', schedule: 'od 9:30 do 10:30', isHappyHours: true },
  ])

  // State
  const searchPreviouslySelected = ref(false)

  // Individual Preferences
  const individualPreferences = ref({
    selectedInstructor: null,
    timeOfDay: 'Dowolna',
    duration: '2h',
    instructorGender: 'Dowolna',
    findSpecificInstructor: false,
  })

  // Shared Preferences
  const sharedPreferences = ref({
    selectedInstructor: null,
    timeOfDay: 'Dowolna',
    duration: '2h',
    instructorGender: 'Dowolna',
    findSpecificInstructor: false,
  })

  // Selected Slots
  const individualSlot = ref(null)
  const sharedSlot = ref(null)
  const selectedGroup = ref(null)

  // Pagination
  const visibleSlotsLimit = ref(4)

  // Booked Classes
  const bookedClasses = ref([])

  // Getters
  const instructors = computed(() => {
    const names = new Set(availableSlots.value.filter(s => s.instructor).map(s => s.instructor))
    return Array.from(names)
  })

  const getFilteredSlots = type => {
    let slots = availableSlots.value
    const prefs = type === 'individual' ? individualPreferences.value : sharedPreferences.value

    // Filter by Time of Day
    if (prefs.timeOfDay && prefs.timeOfDay !== 'Dowolna') {
      slots = slots.filter(s => s.timeOfDay === prefs.timeOfDay)
    }

    // Filter by "Previously Selected Instructor" (Switch)
    if (searchPreviouslySelected.value) {
      slots = slots.filter(s => s.instructor)
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

    return slots
  }

  const individualFilteredSlots = computed(() => getFilteredSlots('individual'))
  const sharedFilteredSlots = computed(() => getFilteredSlots('shared'))

  const displayedIndividualSlots = computed(() => individualFilteredSlots.value.slice(0, visibleSlotsLimit.value))
  const displayedSharedSlots = computed(() => sharedFilteredSlots.value.slice(0, visibleSlotsLimit.value))

  const getBookedClass = (participantId, dateStr) => {
    return bookedClasses.value.find(c => c.participantId === participantId && c.dateStr === dateStr)
  }

  // Actions
  function loadMoreSlots(type) {
    visibleSlotsLimit.value = type === 'individual'
      ? individualFilteredSlots.value.length
      : sharedFilteredSlots.value.length
  }

  function resetState() {
    searchPreviouslySelected.value = false
    individualPreferences.value = { selectedInstructor: null, timeOfDay: 'Dowolna', duration: '2h', instructorGender: 'Dowolna', findSpecificInstructor: false }
    sharedPreferences.value = { selectedInstructor: null, timeOfDay: 'Dowolna', duration: '2h', instructorGender: 'Dowolna', findSpecificInstructor: false }
    individualSlot.value = null
    sharedSlot.value = null
    selectedGroup.value = null
    visibleSlotsLimit.value = 4
  }

  function addBookedClass(booking) {
    // Remove existing booking for this participant and date if exists
    const index = bookedClasses.value.findIndex(c => c.participantId === booking.participantId && c.dateStr === booking.dateStr)
    if (index !== -1) {
      bookedClasses.value.splice(index, 1)
    }
    bookedClasses.value.push(booking)
  }

  function removeBookedClass(participantId, dateStr) {
    const index = bookedClasses.value.findIndex(c => c.participantId === participantId && c.dateStr === dateStr)
    if (index !== -1) {
      bookedClasses.value.splice(index, 1)
    }
  }

  return {
    // State
    availableSlots,
    availableGroups,
    searchPreviouslySelected,
    individualPreferences,
    sharedPreferences,
    individualSlot,
    sharedSlot,
    selectedGroup,
    visibleSlotsLimit,
    bookedClasses,

    // Getters
    instructors,
    individualFilteredSlots,
    sharedFilteredSlots,
    displayedIndividualSlots,
    displayedSharedSlots,
    getBookedClass,

    // Actions
    loadMoreSlots,
    resetState,
    addBookedClass,
    removeBookedClass,
  }
})
