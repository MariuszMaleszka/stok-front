<script setup>
  import { computed, ref, watch } from 'vue'
  import CalendarPlusIcon from '@/assets/calendar-plus.svg'
  import InfoIcon from '@/assets/info.svg'
  import UserIcon from '@/assets/user.svg'
  import UsersGroupIcon from '@/assets/users-group.svg'
  import UsersIcon from '@/assets/users.svg'
  import { usePickedClassesStore } from '@/stores/PickedClassesStore'
  import { useStayStore } from '@/stores/StayStore'

  const props = defineProps({
    modelValue: { type: Boolean, default: false },
    dateStr: { type: String, default: '' },
  })

  const emit = defineEmits(['update:modelValue', 'next'])
  const stayStore = useStayStore()
  const pickedClassesStore = usePickedClassesStore()

  const currentStep = ref(1)
  const selectedType = ref(null)
  const showStepper = ref(false)

  function formatSchedule (text) {
    if (!text) return ''
    return text.replace(/(\d{1,2}:\d{2})/g, '<span class="text-primary font-weight-bold">$1</span>')
  }

  const savePreferences = ref(false)

  // Shared Flow State
  const sharedParticipants = ref([])

  // Group Flow State
  // selectedGroup is now in store

  // Mock Data
  const classTypes = [
    {
      id: 'individual',
      label: 'Zajęcia indywidualne',
      icon: UserIcon,
    },
    {
      id: 'shared',
      label: 'Zajęcia wspólne z innym uczestnikiem',
      icon: UsersIcon,
    },
    {
      id: 'group',
      label: 'Zajęcia grupowe',
      icon: UsersGroupIcon,
    },
  ]

  const timesOfDay = ['Dowolna', 'Rano', 'Popołudnie', 'Wieczór']
  const durations = ['1h', '2h', '3h']
  const genders = ['Dowolna', 'Kobieta', 'Mężczyzna']

  // Reset state when modal opens/closes or type changes
  watch(() => props.modelValue, val => {
    if (val) {
      resetState()
    }
  })

  function resetState () {
    currentStep.value = 1
    selectedType.value = null
    showStepper.value = false
    pickedClassesStore.resetState()
    savePreferences.value = false
    sharedParticipants.value = []

    // Always pre-select the first participant
    if (stayStore.participants.length > 0) {
      const p1 = stayStore.participants[0]
      sharedParticipants.value.push(p1.dynamicId || 0)
    }
  }

  function close () {
    emit('update:modelValue', false)
  }

  function handleTypeSelection () {
    if (selectedType.value) {
      showStepper.value = true
      currentStep.value = 1
    }
  }

  function goNext () {
    switch (selectedType.value) {
      case 'individual': {
        if (currentStep.value < 2) currentStep.value++
        else handleFinish()
        break
      }
      case 'shared': {
        if (currentStep.value < 3) currentStep.value++
        else handleFinish()
        break
      }
      case 'group': {
        handleFinish()
        break
      }
    }
  }

  function goBack () {
    if (currentStep.value > 1) {
      currentStep.value--
    } else {
      showStepper.value = false
      selectedType.value = null
    }
  }

  function handleFinish () {
    // Emit next with selected data
    emit('next', {
      type: selectedType.value,
      data: getDataForType(),
    })
    close()
  }

  function getDataForType () {
    if (selectedType.value === 'individual') {
      let slotObj = pickedClassesStore.availableSlots.find(s => s.id === pickedClassesStore.individualSlot)
      if (!slotObj) {
        slotObj = pickedClassesStore.availableSlots.find(s => s.id === Number(pickedClassesStore.individualSlot))
      }
      return { preferences: pickedClassesStore.individualPreferences, slot: slotObj || pickedClassesStore.individualSlot }
    }
    if (selectedType.value === 'shared') {
      let slotObj = pickedClassesStore.availableSlots.find(s => s.id === pickedClassesStore.sharedSlot)
      if (!slotObj) {
        slotObj = pickedClassesStore.availableSlots.find(s => s.id === Number(pickedClassesStore.sharedSlot))
      }
      return { participants: sharedParticipants.value, preferences: pickedClassesStore.sharedPreferences, slot: slotObj || pickedClassesStore.sharedSlot }
    }
    if (selectedType.value === 'group') {
      const groupObj = pickedClassesStore.availableGroups.find(g => g.id === pickedClassesStore.selectedGroup)
      return { group: groupObj || pickedClassesStore.selectedGroup }
    }
    return null
  }

  // Titles
  const modalTitle = computed(() => {
    if (!showStepper.value) return 'Dodawanie zajęć'
    if (selectedType.value === 'individual') return 'Dodawanie zajęć indywidualnych'
    if (selectedType.value === 'shared') return 'Dodawanie zajęć wspólnych'
    if (selectedType.value === 'group') return 'Dodawanie zajęć grupowych'
    return 'Dodawanie zajęć'
  })

  // Navigation Logic
  const isLastStep = computed(() => {
    if (!showStepper.value) return false
    if (selectedType.value === 'individual') return currentStep.value === 2
    if (selectedType.value === 'shared') return currentStep.value === 3
    if (selectedType.value === 'group') return true
    return false
  })

  const leftButtonText = computed(() => showStepper.value ? 'Wróć' : 'Wyjdź')

  const rightButtonText = computed(() => {
    if (!showStepper.value) return 'Dalej'
    return isLastStep.value ? 'Dodaj zajęcia' : 'Dalej'
  })

  const rightButtonIcon = computed(() => {
    if (!showStepper.value) return 'mdi-arrow-right'
    return isLastStep.value ? '' : 'mdi-arrow-right'
  })

  const isRightButtonDisabled = computed(() => {
    if (!showStepper.value) return !selectedType.value

    if (selectedType.value === 'individual' && currentStep.value === 2) {
      return !pickedClassesStore.individualSlot
    }
    if (selectedType.value === 'shared') {
      if (currentStep.value === 1) return sharedParticipants.value.length <= 1
      if (currentStep.value === 3) return !pickedClassesStore.sharedSlot
    }
    if (selectedType.value === 'group') {
      return !pickedClassesStore.selectedGroup
    }

    return false
  })

  const rightButtonColor = computed(() => {
    if (!showStepper.value) return selectedType.value ? 'blue' : 'grey-lighten-2'
    return 'blue'
  })

  function handleLeftButton () {
    if (showStepper.value) {
      goBack()
    } else {
      close()
    }
  }

  function handleRightButton () {
    if (showStepper.value) {
      goNext()
    } else {
      handleTypeSelection()
    }
  }

  function getFilters (prefs) {
    const filters = []
    if (prefs.timeOfDay) {
      filters.push({ key: 'timeOfDay', label: prefs.timeOfDay })
    }
    if (prefs.duration) {
      filters.push({ key: 'duration', label: `Lekcje ${prefs.duration}` })
    }
    if (prefs.instructorGender) {
      const genderLabel = prefs.instructorGender === 'Dowolna' ? 'płeć dowolna' : prefs.instructorGender.toLowerCase()
      filters.push({ key: 'instructorGender', label: `Instruktor ${genderLabel}` })
    }
    return filters
  }

  const individualFilters = computed(() => getFilters(pickedClassesStore.individualPreferences))
  const sharedFilters = computed(() => getFilters(pickedClassesStore.sharedPreferences))

  function removeFilter (type, key) {
    const prefs = type === 'individual' ? pickedClassesStore.individualPreferences : pickedClassesStore.sharedPreferences
    if (key === 'timeOfDay') prefs.timeOfDay = 'Dowolna'
    if (key === 'duration') prefs.duration = '2h'
    if (key === 'instructorGender') prefs.instructorGender = 'Dowolna'
  }

  function toggleParticipant (id) {
    const firstId = stayStore.participants[0]?.dynamicId || 0

    // Prevent removing the first participant
    if (id === firstId) {
      // Ensure it's selected (recovery mechanism)
      if (!sharedParticipants.value.includes(id)) {
        sharedParticipants.value.push(id)
      }
      return
    }

    const index = sharedParticipants.value.indexOf(id)
    if (index === -1) {
      if (sharedParticipants.value.length < 3) {
        sharedParticipants.value.push(id)
      }
    } else {
      sharedParticipants.value.splice(index, 1)
    }
  }
</script>

<template>
  <VDialog
    max-width="600"
    :model-value="modelValue"
    persistent
    @update:model-value="emit('update:modelValue', $event)"
  >
    <VCard class="rounded-xl d-flex flex-column" style="max-height: 90vh;">
      <!-- Header Area (Fixed) -->
      <div class="modal-header pa-4">
        <div class="d-flex justify-space-between align-center">
          <span class="text-h6 font-weight-bold text-primary-900 mb-1">{{ modalTitle }}</span>
          <VBtn class="special-close-btn" variant="text" @click="close" />
        </div>

        <div class="d-flex align-center text-grey-darken-1">
          <img alt="" class="mr-2" :src="CalendarPlusIcon" width="13">
          <span class="font-weight-medium fs-14">{{ dateStr }}</span>
        </div>
      </div>

      <!-- Scrollable Content Area -->
      <div class="flex-grow-1 overflow-y-auto pa-4" style="min-height: 0;">
        <!-- TYPE SELECTION VIEW -->
        <div v-if="!showStepper">
          <div class="text-center mb-4">
            <span class="text-subtitle-1 font-weight-medium text-primary-900">Wybierz rodzaj zajęć:</span>
          </div>

          <div class="d-flex flex-column gap-3 mb-6">
            <div
              v-for="type in classTypes"
              :key="type.id"
              class="selection-card d-flex align-center px-4 py-3 cursor-pointer"
              :class="{ 'selected': selectedType === type.id }"
              @click="selectedType = type.id"
            >
              <div class="selection-circle mr-4 d-flex align-center justify-center" />
              <img alt="" class="mr-3" :src="type.icon" width="24">
              <span class="font-weight-medium text-primary-900 fs-14">{{ type.label }}</span>
            </div>
          </div>

          <div class="d-flex justify-center mb-6">
            <VBtn
              class="text-none text-caption"
              color="grey-darken-1 border-gray"
              variant="outlined"
            >
              <template #prepend>
                <img alt="" :src="InfoIcon" width="16">
              </template>
              Dowiedz się więcej o rodzajach zajęć
            </VBtn>
          </div>
        </div>

        <!-- STEPPER FLOWS -->
        <VStepper
          v-else
          v-model="currentStep"
          class="elevation-0"
          hide-actions
          :items="selectedType === 'individual' ? ['Preferencje', 'Termin'] : selectedType === 'shared' ? ['Uczestnicy', 'Preferencje', 'Termin'] : ['Grupa']"
        >
          <VStepperWindow v-model="currentStep">
            <!-- INDIVIDUAL FLOW -->
            <template v-if="selectedType === 'individual'">
              <!-- Step 1: Preferences -->
              <VStepperWindowItem :value="1">
                <div class="text-center mb-4">
                  <span class="text-subtitle-1 font-weight-medium text-primary-900">Dostosuj swoje zajęcia:</span>
                </div>

                <VSwitch
                  v-model="pickedClassesStore.searchPreviouslySelected"
                  class="ml-2 mb-2 gap-4"
                  color="primary"
                  density="compact"
                  hide-details
                  label="Szukaj tylko zajęć z wybranym wcześniej instruktorem"
                />

                <div>
                  <span class="text-subtitle-2 font-weight-bold mb-1 d-block text-primary-900">Pora dnia</span>
                  <VSelect
                    v-model="pickedClassesStore.individualPreferences.timeOfDay"
                    density="compact"
                    :items="timesOfDay"
                    variant="outlined"
                  />
                </div>
                <div>
                  <span class="text-subtitle-2 font-weight-bold mb-1 d-block text-primary-900">Długość lekcji</span>
                  <VSelect
                    v-model="pickedClassesStore.individualPreferences.duration"
                    density="compact"
                    :items="durations"
                    variant="outlined"
                  />
                </div>
                <div class="mb-4">
                  <span class="text-subtitle-2 font-weight-bold mb-1 d-block text-primary-900 mb-2">Płeć instruktora</span>
                  <VBtnToggle
                    v-model="pickedClassesStore.individualPreferences.instructorGender"
                    class="ga-2 w-100 gender-buttons"
                    mandatory
                  >
                    <VBtn
                      v-for="gender in genders"
                      :key="gender"
                      class="text-capitalize border rounded flex-1"
                      size="small"
                      :value="gender"
                      variant="outlined"
                    >
                      {{ gender }}
                    </VBtn>
                  </VBtnToggle>
                </div>                <div class="mb-4">
                  <VCheckbox
                    v-model="pickedClassesStore.individualPreferences.findSpecificInstructor"
                    color="primary"
                    density="compact"
                    hide-details
                    label="Znajdź konkretnego instruktora"
                  />
                  <div v-if="pickedClassesStore.individualPreferences.findSpecificInstructor">
                    <span class="text-subtitle-2 font-weight-bold mt-1 mb-1 d-block text-primary-900">Instruktor</span>
                    <VSelect
                      v-model="pickedClassesStore.individualPreferences.selectedInstructor"
                      class="instructor-select"
                      density="compact"
                      :items="pickedClassesStore.instructors"
                      placeholder="Wybierz instruktora"
                      variant="outlined"
                    />
                  </div>
                </div>
              </VStepperWindowItem>

              <!-- Step 2: Slots -->
              <VStepperWindowItem :value="2">
                <div class="text-center mb-4">
                  <span class="text-subtitle-1 font-weight-medium text-primary-900">Wybierz spośród dostępnych terminów:</span>
                </div>

                <div class="d-flex align-center justify-center flex-wrap gap-2 mb-4">
                  <VChip
                    v-for="filter in individualFilters"
                    :key="filter.key"
                    class="filter-chip"
                    :class="{ 'filter-chip--error': filter.isProblematic }"
                    closable
                    close-icon="mdi-close"
                    color="grey-lighten-4"
                    label
                    size="small"
                    variant="flat"
                    @click:close="removeFilter('individual', filter.key)"
                  >
                    <span>{{ filter.label }}</span>
                  </VChip>
                </div>

                <div v-if="pickedClassesStore.displayedIndividualSlots.length > 0" class="d-flex flex-column gap-3">
                  <div
                    v-for="slot in pickedClassesStore.displayedIndividualSlots"
                    :key="slot.id"
                    class="slot-card d-flex align-center px-4 py-3 cursor-pointer"
                    :class="{ 'selected': pickedClassesStore.individualSlot === slot.id }"
                    @click="pickedClassesStore.individualSlot = slot.id"
                  >
                    <div class="selection-circle mr-4 d-flex align-center justify-center flex-shrink-0" />

                    <div class="flex-grow-1 d-flex justify-space-between align-center">
                      <div class="d-flex flex-column align-start">
                        <span class="font-weight-bold fs-14 blue-text">{{ slot.time }}</span>
                        <div v-if="slot.instructor" class="text-caption-slot mt-1 text-left">
                          Instruktor wybrany wcześniej:<br>
                          <span class="font-weight-bold">{{ slot.instructor }}</span>
                        </div>
                      </div>
                      <div class="d-flex flex-column align-end justify-center h-100">
                        <div v-if="slot.isHappyHours" class="happy-hours-badge">
                          Happy hours
                        </div>
                        <span v-if="slot.price" class="font-weight-semibold blue-text fs-14 max-content-width">- {{ slot.price }},00zł</span>
                      </div>
                    </div>
                  </div>
                  <!-- TODO: Remove this button after backend integration -->
                  <div v-if="pickedClassesStore.individualFilteredSlots.length > pickedClassesStore.visibleSlotsLimit" class="mt-2">
                    <VBtn
                      block
                      class="text-capitalize load-more-btn"
                      variant="outlined"
                      @click="pickedClassesStore.loadMoreSlots('individual')"
                    >
                      Załaduj więcej
                    </VBtn>
                  </div>
                </div>

                <div v-else class="text-center py-4">
                  <div class="text-h6 font-weight-bold text-primary-900 mb-6">
                    Brak zajęć z podanymi<br>parametrami
                  </div>

                  <VBtn
                    class="text-capitalize mb-8 text-primary-900 border-primary find-other-btn"
                    color="primary"
                    height="59"
                    variant="outlined"
                    width="100%"
                  >
                    Znajdź zajęcia<br>najbliższe preferencjom
                  </VBtn>

                  <div class="border rounded-lg px-4 py-3 d-flex align-start text-left bg-white border-gray">
                    <VIcon class="mr-3 mt-1 flex-shrink-0" color="grey-darken-1" icon="mdi-message-text-outline" />
                    <div class="text-caption text-grey-darken-1" style="line-height: 1.4;">
                      Jeśli nie znalazłeś/aś dopasowanej oferty, skontaktuj się z naszym
                      <a class="text-decoration-underline text-grey-darken-1 font-weight-medium cursor-pointer" href="#">biurem obsługi klienta</a>.
                    </div>
                  </div>
                </div>
              </VStepperWindowItem>
            </template>

            <!-- SHARED FLOW -->
            <template v-if="selectedType === 'shared'">
              <!-- Step 1: Participants -->
              <VStepperWindowItem :value="1">
                <div class="text-center mb-4">
                  <span class="text-subtitle-1 font-weight-medium text-primary-900">Wybierz uczestników:</span>
                </div>
                <div class="mb-4">
                  <p class="text-caption text-grey-darken-1 mb-6 text-center" style="line-height: 1.4; max-width: 92%; margin: 0 auto;">
                    Wybierz maksymalnie trzech uczestników o podobnych preferncjach którzy mają uczestniczyć w zajęciach.
                  </p>
                  <div class="d-flex flex-column gap-3">
                    <div
                      v-for="(p, idx) in stayStore.participants"
                      :key="idx"
                      class="selection-card d-flex align-center px-4 py-3 cursor-pointer"
                      :class="{ 'selected': sharedParticipants.includes(p.dynamicId || idx), 'disabled': idx === 0 }"
                      @click="toggleParticipant(p.dynamicId || idx)"
                    >
                      <div class="selection-circle mr-4 d-flex align-center justify-center flex-shrink-0" />
                      <span class="font-weight-medium text-primary-900 fs-14">
                        {{ idx + 1 }} - {{ p.name || `Uczestnik ${idx + 1}` }}
                      </span>
                    </div>
                  </div>
                </div>
              </VStepperWindowItem>

              <!-- Step 2: Preferences (Same as Individual Step 1) -->
              <VStepperWindowItem :value="2">
                <div class="text-center mb-4">
                  <span class="text-subtitle-1 font-weight-medium text-primary-900">Dostosuj swoje zajęcia:</span>
                </div>
                <VSwitch
                  v-model="pickedClassesStore.searchPreviouslySelected"
                  class="ml-2 mb-2 gap-4"
                  color="primary"
                  density="compact"
                  hide-details
                  label="Szukaj tylko zajęć z wybranym wcześniej instruktorem"
                />
                <div class="mb-4">
                  <span class="text-subtitle-2 font-weight-bold mb-1 d-block text-primary-900">Pora dnia</span>
                  <VSelect
                    v-model="pickedClassesStore.sharedPreferences.timeOfDay"
                    density="compact"
                    :items="timesOfDay"
                    variant="outlined"
                  />
                </div>
                <div class="mb-4">
                  <span class="text-subtitle-2 font-weight-bold mb-1 d-block text-primary-900">Długość lekcji</span>
                  <VSelect
                    v-model="pickedClassesStore.sharedPreferences.duration"
                    density="compact"
                    :items="durations"
                    variant="outlined"
                  />
                </div>
                <div class="mb-4">
                  <span class="text-subtitle-2 font-weight-bold mb-1 d-block text-primary-900 mb-2">Płeć instruktora</span>
                  <VBtnToggle
                    v-model="pickedClassesStore.sharedPreferences.instructorGender"
                    class="ga-2 w-100 gender-buttons"
                    mandatory
                  >
                    <VBtn
                      v-for="gender in genders"
                      :key="gender"
                      class="text-capitalize border rounded flex-1"
                      size="small"
                      :value="gender"
                      variant="outlined"
                    >
                      {{ gender }}
                    </VBtn>
                  </VBtnToggle>
                </div>
                <div class="mb-4">

                  <VCheckbox
                    v-model="pickedClassesStore.sharedPreferences.findSpecificInstructor"
                    color="primary"
                    density="compact"
                    hide-details
                    label="Znajdź konkretnego instruktora"
                  />
                  <div v-if="pickedClassesStore.sharedPreferences.findSpecificInstructor">
                    <span class="text-subtitle-2 font-weight-bold mt-1 mb-1 d-block text-primary-900">Instruktor</span>
                    <VSelect
                      v-model="pickedClassesStore.sharedPreferences.selectedInstructor"
                      class="instructor-select"
                      density="compact"
                      :items="pickedClassesStore.instructors"
                      placeholder="Wybierz instruktora"
                      variant="outlined"
                    />
                  </div>
                </div>
              </VStepperWindowItem>

              <!-- Step 3: Slots (Same as Individual Step 2) -->
              <VStepperWindowItem :value="3">
                <div class="text-center mb-4">
                  <span class="text-subtitle-1 font-weight-medium text-primary-900">Wybierz spośród dostępnych terminów:</span>
                </div>

                <div class="d-flex align-center justify-centerflex-wrap gap-2 mb-4">
                  <VChip
                    v-for="filter in sharedFilters"
                    :key="filter.key"
                    class="filter-chip"
                    :class="{ 'filter-chip--error': filter.isProblematic }"
                    closable
                    close-icon="mdi-close"
                    color="grey-lighten-4"
                    label
                    size="small"
                    variant="flat"
                    @click:close="removeFilter('shared', filter.key)"
                  >
                    <span>{{ filter.label }}</span>
                  </VChip>
                </div>

                <div v-if="pickedClassesStore.displayedSharedSlots.length > 0" class="d-flex flex-column gap-3">
                  <div
                    v-for="slot in pickedClassesStore.displayedSharedSlots"
                    :key="slot.id"
                    class="slot-card d-flex align-center px-4 py-3 cursor-pointer"
                    :class="{ 'selected': pickedClassesStore.sharedSlot === slot.id }"
                    @click="pickedClassesStore.sharedSlot = slot.id"
                  >
                    <div class="selection-circle mr-4 d-flex align-center justify-center flex-shrink-0" />
                    <div class="flex-grow-1 d-flex justify-space-between align-center">
                      <div class="d-flex flex-column align-start">
                        <span class="font-weight-bold fs-14 blue-text">{{ slot.time }}</span>
                        <div v-if="slot.instructor" class="text-caption-slot mt-1 text-left">
                          Instruktor wybrany wcześniej:<br>
                          <span class="font-weight-bold">{{ slot.instructor }}</span>
                        </div>
                      </div>
                      <div class="d-flex flex-column align-end justify-center h-100">
                        <div v-if="slot.isHappyHours" class="happy-hours-badge">
                          Happy hours
                        </div>
                        <span v-if="slot.price" class="font-weight-semibold blue-text fs-14 max-content-width">- {{ slot.price }},00zł</span>
                      </div>
                    </div>
                  </div>
                  <!-- TODO: Remove this button after backend integration -->
                  <div v-if="pickedClassesStore.sharedFilteredSlots.length > pickedClassesStore.visibleSlotsLimit" class="mt-2">
                    <VBtn
                      block
                      class="text-capitalize load-more-btn"
                      variant="outlined"
                      @click="pickedClassesStore.loadMoreSlots('shared')"
                    >
                      Załaduj więcej
                    </VBtn>
                  </div>
                </div>

                <div v-else class="text-center py-4">
                  <div class="text-h6 font-weight-bold text-primary-900 mb-6">
                    Brak zajęć z podanymi<br>parametrami
                  </div>

                  <VBtn
                    class="text-capitalize mb-8 text-primary-900 border-primary"
                    color="primary"
                    height="59"
                    variant="outlined"
                    width="100%"
                  >
                    Znajdź zajęcia<br>najbliższe preferencjom
                  </VBtn>

                  <div class="border rounded-lg px-4 py-3 d-flex align-start text-left bg-white border-gray">
                    <VIcon class="mr-3 mt-1 flex-shrink-0" color="grey-darken-1" icon="mdi-message-text-outline" />
                    <div class="text-caption text-grey-darken-1" style="line-height: 1.4;">
                      Jeśli nie znalazłeś/aś dopasowanej oferty, skontaktuj się z naszym
                      <a class="text-decoration-underline text-grey-darken-1 font-weight-medium cursor-pointer" href="#">biurem obsługi klienta</a>.
                    </div>
                  </div>
                </div>
              </VStepperWindowItem>
            </template>

            <!-- GROUP FLOW -->
            <template v-if="selectedType === 'group'">
              <VStepperWindowItem :value="1">
                <div class="text-center mb-2">
                  <span class="text-subtitle-1 font-weight-medium text-primary-900">Wybierz zajęcia grupowe:</span>
                </div>
                <div class="mb-6">
                  <p class="text-caption text-grey-darken-1 text-center" style="line-height: 1.4; max-width: 90%; margin: 0 auto;">
                    Zajęcia grupowe są złożone z serii zajęć trwającej kilka dni. Po wybraniu zajęć, do twojego kalendarza zostanie dodana każda z rozłożonych na kilka dni lekcji.
                  </p>
                </div>

                <div class="d-flex flex-column gap-3">
                  <div
                    v-for="group in pickedClassesStore.filteredGroups"
                    :key="group.id"
                    class="slot-card d-flex align-center px-4 py-4 cursor-pointer flex-column"
                    :class="{ 'selected': pickedClassesStore.selectedGroup === group.id }"
                    @click="pickedClassesStore.selectedGroup = group.id"
                  >

                    <div class="d-flex align-center justify-center">
                      <!-- Checkbox/Circle -->
                      <div class="selection-circle mr-4 mt-1 d-flex align-center justify-center flex-shrink-0" />

                      <!-- Content -->
                      <div class="flex-grow-1">
                        <!-- Title & Happy Hours Badge -->
                        <div class="d-flex justify-space-between align-start mb-1">
                          <span class="text-caption text-grey-darken-1">{{ group.name }}</span>
                          <div v-if="group.isHappyHours" class="happy-hours-badge ml-2 mb-0">Happy hours</div>
                        </div>

                        <!-- Dates -->
                        <div class="font-weight-bold text-primary-900 mb-2 fs-14">
                          {{ group.dates }}
                        </div>

                        <!-- Description -->
                        <div class="text-caption text-grey-darken-1 mb-1" style="line-height: 1.4;">
                          {{ group.description }}
                        </div>

                        <!-- Schedule (Hours) -->
                        <div class="text-caption text-grey-darken-1 mb-3" style="line-height: 1.4;" v-html="formatSchedule(group.schedule)" />

                        <!-- Details Button -->
                        <VBtn
                          class="text-none text-caption px-3"
                          color="primary"
                          density="compact"
                          height="28"
                          variant="outlined"
                          @click.stop="openGroupDetails(group)"
                        >
                          Dowiedz się więcej
                        </VBtn>
                      </div>
                    </div>

                    <!-- Price (Absolute Bottom Right) -->
                    <div v-if="group.price" class="d-flex justify-end w-100 mt-1">
                      <span class="font-weight-bold text-primary-900 fs-14">-{{ group.price }},00zł</span>
                    </div>
                  </div>
                </div>
              </VStepperWindowItem>
            </template>
          </VStepperWindow>
        </VStepper>
      </div>

      <!-- Footer Actions (Fixed) -->
      <div class="footer-actions pa-4 bg-white">
        <div class="d-flex gap-3 mb-4">
          <VBtn
            class="flex-1-1 text-none rounded-lg"
            height="48"
            prepend-icon="mdi-arrow-left"
            variant="outlined"
            @click="handleLeftButton"
          >
            {{ leftButtonText }}
          </VBtn>
          <VBtn
            :append-icon="rightButtonIcon"
            class="flex-1-1 text-none rounded-lg"
            :color="rightButtonColor"
            :disabled="isRightButtonDisabled"
            height="48"
            variant="flat"
            @click="handleRightButton"
          >
            {{ rightButtonText }}
          </VBtn>
        </div>

        <div v-if="showStepper && !isLastStep" class="d-flex justify-center">
          <VCheckbox
            v-model="savePreferences"
            color="primary"
            density="compact"
            hide-details
            label="Zapisz moje preferencje"
          />
        </div>
      </div>

    </VCard>
  </VDialog>
</template>

<style scoped lang="scss">
.text-primary-900 {
  color: #111827;
}

.gap-3 {
  gap: 12px;
}

.selection-card {
  img {
    max-width: 16px;
    max-height: 16px;
  }
}

.selection-card, .slot-card {
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  transition: all 0.2s ease;
  min-height: 70px;

  &:hover, &:focus {
    border-color: #E5E7EB;
    background-color: transparent;
  }

  &.selected {
    border-color: #2563EB;
    background-color: #EFF6FF;
    border-width: 1px;

    span,div {
      color: #2563EB;
    }
  }

  &.disabled {
    cursor: default;
    border-color: transparent;
    background-color: #EFF6FF;

    span {
      color: #2563EB;
    }
  }
}

.selection-circle {
  min-width: 20px;
  min-height: 20px;
  max-width: 20px;
  max-height: 20px;
  border-radius: 50%;
  border: 2px solid #D1D5DB;
  background: white;

  .selected & {
    border-color: #2563EB;
  }

  .disabled & {
    border-color: #818CF8;
    background-color: transparent;
  }
}

.inner-circle {
  width: 10px;
  height: 10px;
  background-color: #2563EB;
  border-radius: 50%;

  .disabled & {
    background-color: #818CF8;
  }
}

.flex-1-1 {
  flex: 1 1 0;
}

.footer-actions {
  z-index: 10;
  position: sticky;
  bottom: 0;
}

.modal-header {
  background-color: #F9FAFB;
  border-bottom: 1px solid #F3F4F6;
}

.border-gray {
  border: 1px solid #F3F4F6;
}

:deep(.v-stepper-header) {
  display: none !important;
}

:deep(.v-label) {
  font-size: 14px;
  color: #111928;
  font-size: 14px;
  font-weight: 500;
}

.special-close-btn {
  position: relative;
  top: -12px;
  right: -12px;
}

:deep(.v-checkbox .v-label) {
  margin-left: 4px;
}

:deep(.v-switch__track) {
  border: 3px solid #E5E7EB !important;
  background-color: #E5E7EB !important;
  opacity: 1 !important;
  border-radius: 20px !important;
}

:deep(.v-selection-control--dirty .v-switch__track) {
  background-color: #2563EB !important;
}

:deep(.v-switch__thumb) {
  height: 20px !important;
  width: 20px !important;
  background-color: white !important;
}

:deep(.v-switch .v-selection-control__input > .v-overlay) {
  display: none !important;
}

.happy-hours-badge {
    color: #000 !important;
    font-size: 10px;
    font-weight: 400 !important;
    background: #FACA15;
    padding: 2px 3px;
    border-radius: 5px;
    margin-bottom: 16px !important;
    width: max-content;
    min-width: 70px;
    text-align: center;
}

.text-caption {
  line-height: 1.4;
}

.blue-text {
  color: #233876!important;
}

.text-caption-slot {
  font-size: 11px;
  color: rgba(35, 56, 118, 0.65);
}

.max-content-width {
  width: max-content;
}

.filter-chip {
  font-family: 'Inter', sans-serif !important;
  font-size: 10px !important;
  font-weight: 600 !important;
  line-height: 150% !important;
  color: rgba(0, 0, 0, 0.55);
  border-radius: 8px!important;

  :deep(.v-chip__content) {
    font-family: 'Inter', sans-serif !important;
    font-size: 10px !important;
    font-weight: 600 !important;
    line-height: 150% !important;
    color: rgba(0, 0, 0, 0.55);
  }
}

.filter-chip--error {
  background-color: #FDE8E8 !important;
}

:deep(.v-chip__close) {
  font-size: 14px !important;
  color: rgba(31, 42, 55, 0.55) !important;
  opacity: 1 !important;
}

.load-more-btn {
  border-color: #2563EB !important;
  color: #2563EB !important;
  font-weight: 500;
  line-height: 1;
}

:deep(.v-chip.v-chip--size-small)  {
    --v-chip-height: 19px;
    padding: 0 8px !important;
}

.gap-2 {
  gap: 8px;
}

.footer-actions {
 :deep(.v-btn) {
    height: 48px!important;
    line-height: 1;
}

}

.find-other-btn {
    line-height: 1.4!important;
}

.gender-buttons {
  height: 38px!important;

  :deep(.v-btn) {
    height: 38px!important;
    color: #6B7280;
  }
}

:deep(.v-select .v-field .v-field__input > input) {
    align-self: center !important;
}

.gap-4 {

  :deep(.v-selection-control) {
      gap: 4px;
}

}
</style>
