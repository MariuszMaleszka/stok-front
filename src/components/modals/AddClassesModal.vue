<script setup>
  import { computed, ref, watch } from 'vue'
  import CalendarPlusIcon from '@/assets/calendar-plus.svg'
  import InfoIcon from '@/assets/info.svg'
  import UserIcon from '@/assets/user.svg'
  import UsersGroupIcon from '@/assets/users-group.svg'
  import UsersIcon from '@/assets/users.svg'
  import { useStayStore } from '@/stores/StayStore'

  const props = defineProps({
    modelValue: { type: Boolean, default: false },
    dateStr: { type: String, default: '' },
  })

  const emit = defineEmits(['update:modelValue', 'next'])
  const stayStore = useStayStore()

  const currentStep = ref(1)
  const selectedType = ref(null)
  const showStepper = ref(false)

  // Individual Flow State
  const individualPreferences = ref({
    searchPreviouslySelected: false,
    timeOfDay: 'Dowolna',
    duration: '2h',
    instructorGender: 'Dowolna',
    findSpecificInstructor: false,
  })
  const individualSlot = ref(null)
  const savePreferences = ref(false)

  // Shared Flow State
  const sharedParticipants = ref([])
  const sharedPreferences = ref({ ...individualPreferences.value })
  const sharedSlot = ref(null)

  // Group Flow State
  const selectedGroup = ref(null)

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

  const availableSlots = [
    { id: 1, time: '9:00 - 11:00', price: 50, instructor: 'Marcin Kowalik', gender: 'male' },
    { id: 2, time: '10:00 - 12:00', price: 50, instructor: 'Anna Nowak', gender: 'female' },
    { id: 3, time: '10:00 - 12:00', price: 50, isHappyHours: true },
    { id: 4, time: '10:30 - 12:30', price: 50 },
    { id: 5, time: '11:00 - 13:00', price: 50 },
  ]

  const availableGroups = [
    { id: 1, name: 'Nazwa grupy lorem ipsum', dates: '1 sty 2025 - 6 sty 2025', desc: '5 dni zajęć, zajęcia 1x dziennie od 9:30 do 10:30', price: 1400 },
    { id: 2, name: 'Nazwa grupy lorem ipsum', dates: '1 sty 2025 - 3 sty 2025', desc: '3 dni zajęć, zajęcia 2x dziennie od 9:30 do 10:30 oraz od 15:30 do 17:30', price: 1400 },
    { id: 3, name: 'Nazwa grupy lorem ipsum', dates: 'Happy hours', desc: '', price: null, isHappyHours: true },
  ]

  // Reset state when modal opens/closes or type changes
  watch(() => props.modelValue, val => {
    if (!val) {
      resetState()
    }
  })

  function resetState () {
    currentStep.value = 1
    selectedType.value = null
    showStepper.value = false
    individualPreferences.value = { searchPreviouslySelected: false, timeOfDay: 'Dowolna', duration: '2h', instructorGender: 'Dowolna', findSpecificInstructor: false }
    individualSlot.value = null
    savePreferences.value = false
    sharedParticipants.value = []
    sharedPreferences.value = { ...individualPreferences.value }
    sharedSlot.value = null
    selectedGroup.value = null
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
    if (selectedType.value === 'individual') return { preferences: individualPreferences.value, slot: individualSlot.value }
    if (selectedType.value === 'shared') return { participants: sharedParticipants.value, preferences: sharedPreferences.value, slot: sharedSlot.value }
    if (selectedType.value === 'group') return { group: selectedGroup.value }
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
          <VBtn class="special-close-btn" icon="mdi-close" variant="text" @click="close" />
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

                <div class="mb-4">
                  <VSwitch
                    v-model="individualPreferences.searchPreviouslySelected"
                    hide-details
                    label="Szukaj tylko zajęć z wybranym wcześniej instruktorem"
                  />
                </div>

                <div>
                  <span class="text-subtitle-2 font-weight-bold mb-1 d-block text-primary-900">Pora dnia</span>
                  <VSelect
                    v-model="individualPreferences.timeOfDay"
                    density="compact"
                    :items="timesOfDay"
                    variant="outlined"
                  />
                </div>
                <div>
                  <span class="text-subtitle-2 font-weight-bold mb-1 d-block text-primary-900">Długość lekcji</span>
                  <VSelect
                    v-model="individualPreferences.duration"
                    density="compact"
                    :items="durations"
                    variant="outlined"
                  />
                </div>
                <div class="mb-4">
                  <span class="text-subtitle-2 font-weight-bold mb-1 d-block text-primary-900 mb-2">Płeć instruktora</span>
                  <VBtnToggle
                    v-model="individualPreferences.instructorGender"
                    class="ga-2 w-100"
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
                    v-model="individualPreferences.findSpecificInstructor"
                    color="primary"
                    density="compact"
                    hide-details
                    label="Znajdź konkretnego instruktora"
                  />
                </div>
              </VStepperWindowItem>

              <!-- Step 2: Slots -->
              <VStepperWindowItem :value="2">
                <div class="text-center mb-4">
                  <span class="text-subtitle-1 font-weight-medium text-primary-900">Wybierz spośród dostępnych terminów:</span>
                </div>

                <div class="d-flex flex-column gap-3">
                  <div
                    v-for="slot in availableSlots"
                    :key="slot.id"
                    class="slot-card d-flex align-center px-4 py-3 cursor-pointer"
                    :class="{ 'selected': individualSlot === slot.id }"
                    @click="individualSlot = slot.id"
                  >
                    <div class="selection-circle mr-4 d-flex align-center justify-center" />
                    <div class="flex-grow-1">
                      <div class="d-flex justify-space-between align-center">
                        <span class="font-weight-bold text-primary-900">{{ slot.time }}</span>
                        <span v-if="slot.price" class="font-weight-bold text-primary-900">{{ slot.price }} zł</span>
                      </div>
                      <div class="d-flex align-center text-caption text-grey-darken-1">
                        <span v-if="slot.instructor">{{ slot.instructor }}</span>
                        <span v-if="slot.isHappyHours" class="text-primary font-weight-bold happy-hours">Happy Hours</span>
                      </div>
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
                  <p class="text-body-2 text-grey-darken-1 mb-2">Zaznacz osoby, z którymi chcesz mieć zajęcia:</p>
                  <div v-for="(p, idx) in stayStore.participants" :key="idx" class="d-flex align-center mb-2">
                    <VCheckbox
                      v-model="sharedParticipants"
                      density="compact"
                      hide-details
                      :label="p.name || `Uczestnik ${idx + 1}`"
                      :value="p.dynamicId || idx"
                    />
                  </div>
                </div>
              </VStepperWindowItem>

              <!-- Step 2: Preferences (Same as Individual Step 1) -->
              <VStepperWindowItem :value="2">
                <div class="text-center mb-4">
                  <span class="text-subtitle-1 font-weight-medium text-primary-900">Dostosuj swoje zajęcia:</span>
                </div>
                <div class="mb-4">
                  <VSwitch
                    v-model="sharedPreferences.searchPreviouslySelected"
                    hide-details
                    label="Szukaj tylko zajęć z wybranym wcześniej instruktorem"
                  />
                </div>
                <div class="mb-4">
                  <span class="text-subtitle-2 font-weight-bold mb-1 d-block text-primary-900">Pora dnia</span>
                  <VSelect
                    v-model="sharedPreferences.timeOfDay"
                    density="compact"
                    :items="timesOfDay"
                    variant="outlined"
                  />
                </div>
                <div class="mb-4">
                  <span class="text-subtitle-2 font-weight-bold mb-1 d-block text-primary-900">Długość lekcji</span>
                  <VSelect
                    v-model="sharedPreferences.duration"
                    density="compact"
                    :items="durations"
                    variant="outlined"
                  />
                </div>
                <div class="mb-4">
                  <span class="text-subtitle-2 font-weight-bold mb-1 d-block text-primary-900">Płeć instruktora</span>
                  <VBtnToggle
                    v-model="sharedPreferences.instructorGender"
                    class="ga-2 w-100"
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
                    v-model="sharedPreferences.findSpecificInstructor"
                    color="primary"
                    density="compact"
                    hide-details
                    label="Znajdź konkretnego instruktora"
                  />
                </div>
              </VStepperWindowItem>

              <!-- Step 3: Slots (Same as Individual Step 2) -->
              <VStepperWindowItem :value="3">
                <div class="text-center mb-4">
                  <span class="text-subtitle-1 font-weight-medium text-primary-900">Wybierz spośród dostępnych terminów:</span>
                </div>
                <div class="d-flex flex-column gap-3">
                  <div
                    v-for="slot in availableSlots"
                    :key="slot.id"
                    class="slot-card d-flex align-center px-4 py-3 cursor-pointer"
                    :class="{ 'selected': sharedSlot === slot.id }"
                    @click="sharedSlot = slot.id"
                  >
                    <div class="selection-circle mr-4 d-flex align-center justify-center" />
                    <div class="flex-grow-1">
                      <div class="d-flex justify-space-between align-center">
                        <span class="font-weight-bold text-primary-900">{{ slot.time }}</span>
                        <span v-if="slot.price" class="font-weight-bold text-primary-900">{{ slot.price }} zł</span>
                      </div>
                      <div class="d-flex align-center text-caption text-grey-darken-1">
                        <span v-if="slot.instructor">{{ slot.instructor }}</span>
                        <span v-if="slot.isHappyHours" class="text-primary font-weight-bold happy-hours">Happy Hours</span>
                      </div>
                    </div>
                  </div>
                </div>
              </VStepperWindowItem>
            </template>

            <!-- GROUP FLOW -->
            <template v-if="selectedType === 'group'">
              <VStepperWindowItem :value="1">
                <div class="text-center mb-4">
                  <span class="text-subtitle-1 font-weight-medium text-primary-900">Dostępne grupy:</span>
                </div>
                <div class="d-flex flex-column gap-3">
                  <div
                    v-for="group in availableGroups"
                    :key="group.id"
                    class="slot-card d-flex align-center px-4 py-3 cursor-pointer"
                    :class="{ 'selected': selectedGroup === group.id }"
                    @click="selectedGroup = group.id"
                  >
                    <div class="selection-circle mr-4 d-flex align-center justify-center" />
                    <div class="flex-grow-1">
                      <div class="d-flex justify-space-between align-center">
                        <span class="font-weight-bold text-primary-900 fs-14">{{ group.name }}</span>
                        <span v-if="group.price" class="font-weight-bold text-primary-900">{{ group.price }} zł</span>
                      </div>
                      <div class="text-caption text-grey-darken-1 mb-1">{{ group.dates }}</div>
                      <div class="text-caption text-grey-darken-1">{{ group.desc }}</div>
                      <div v-if="group.isHappyHours" class="text-caption text-primary font-weight-bold happy-hours">Happy Hours</div>
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

  &:hover {
    border-color: #2563EB;
    background-color: #F9FAFB;
  }

  &.selected {
    border-color: #2563EB;
    background-color: #EFF6FF;
    border-width: 1px;

    span {
      color: #2563EB;
    }
  }
}

.selection-circle {
  min-width: 20px;
  min-height: 20px;
  border-radius: 50%;
  border: 2px solid #D1D5DB;
  background: white;

  .selected & {
    border-color: #2563EB;
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
  font-size: 15px;
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

.happy-hours {
    color: #000 !important;
    font-size: 10px;
    font-weight: 400 !important;
    background: #FACA15;
    padding: 2px 6px;
    border-radius: 5px;
}
</style>
