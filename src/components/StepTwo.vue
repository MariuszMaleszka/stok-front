<script setup>
  import { onMounted, ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import ClassesModal from '@/components/modals/ClassesModal.vue'
  import ParticipantCard from '@/components/ParticipantCard.vue'
  import { useToast } from '@/composables/useToast'
  import { usePickedClassesStore } from '@/stores/PickedClassesStore.js'
  import { useStayStore } from '@/stores/StayStore.js'
  import { useTimerStore } from '@/stores/TimerStore.js'

  const timerStore = useTimerStore()

  const { showSimpleToast } = useToast()
  const stayStore = useStayStore()
  const pickedClassesStore = usePickedClassesStore()

  const { t } = useI18n()

  const classesModalOpen = ref(false)
  const selectedParticipant = ref(null)
  function openClassesModal (participant) {
    selectedParticipant.value = participant
    classesModalOpen.value = true
  }
  function closeClassesModal () {
    classesModalOpen.value = false
    selectedParticipant.value = null
  }

  function getParticipantClassesTotalPrice (participantId) {
    const participantClasses = pickedClassesStore.bookedClasses.filter(c => c.participantId === participantId)
    if (!participantClasses || participantClasses.length === 0) return 0

    const processedGroupIds = new Set()

    return participantClasses.reduce((sum, booking) => {
      let price = 0
      if (booking.type === 'individual' || booking.type === 'shared') {
        if (booking.data.slot && booking.data.slot.price) {
          price = booking.data.slot.price
        }
      } else if (booking.type === 'group' && booking.data.group && booking.data.group.price) {
        if (booking.groupBookingId) {
          if (!processedGroupIds.has(booking.groupBookingId)) {
            price = booking.data.group.price
            processedGroupIds.add(booking.groupBookingId)
          }
        } else {
          // Fallback if no groupBookingId (should not happen with new code)
          price = booking.data.group.price
        }
      }
      return sum + price
    }, 0)
  }

  function hasParticipantBookedClasses (participantId) {
    return pickedClassesStore.bookedClasses.some(c => c.participantId === participantId)
  }

  watch(() => timerStore.timeRemaining, remaining => {
    if (remaining === 0) {
      showSimpleToast(t('time_expired'), 'warning')
    }
  })

  onMounted(() => {
    timerStore.startTimer()
  })
</script>

<template>
  <div class="d-flex flex-column justify-space-between h-100 flex-1">
    <!-- tabs navigation remains the same -->
    <div>
      <div class="time-counter fs-12 text-center mt-2">
        {{ $t('timer_info') }}
        <span class="black-badge ">

          {{ timerStore.formattedTime }}
        </span>
      </div>
      <div />

      <p class="fs-24 font-weight-medium mb-2 mt-4 text-black">
        {{ $t('select_classes') }}:
      </p>
      <div>
        <p class="fs-14 mb-2 text-gray-600">
          {{ $t('select_classes_subtitle') }}
        </p>
      </div>
      <div class="d-flex flex-column ga-3 mt-4 mb-4">
        <ParticipantCard
          v-for="(p, i) in stayStore.participants"
          :key="p.dynamicId || i"
          :activity-type="p.activityType === t('snowboard') ? 'snowboard' : 'ski'"
          :age="p.age"
          :completed="hasParticipantBookedClasses(p.dynamicId)"
          :currency="stayStore.currency"
          :index="i"
          :name="p.name || '-'"
          :participant-type="p.participantType"
          :subtitle="`${t(p.participantType || 'adult')} - ${p.activityType || t('ski')} - Poz. ${p.skillLevel || '-'}`"
          :total-price="getParticipantClassesTotalPrice(p.dynamicId)"
          @click="openClassesModal(p)"
          @edit="openClassesModal(p)"
        />
      </div>
    </div>

    <ClassesModal
      v-model="classesModalOpen"
      :activity-type="selectedParticipant?.activityType === t('snowboard') ? 'snowboard' : 'ski'"
      :age="selectedParticipant?.age"
      :participant="selectedParticipant"
      :participant-type="selectedParticipant?.participantType"
      :subtitle="`${t(selectedParticipant?.participantType || 'adult')} - ${selectedParticipant?.activityType || t('ski')} - Poz. ${selectedParticipant?.skillLevel || '-'}`"
      @save="closeClassesModal"
    />
  </div>
</template>

<style scoped lang="scss">
.text-gray-600 {
  color: #4B5563;
}

.v-overlay__scrim {
  color: #4B5563;
  top: 64px;
}

.v-overlay {
  top: 64px;
}
.v-overlay__scrim {
    top: 64px;
}

</style>
