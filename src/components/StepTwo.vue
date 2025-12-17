<script setup>
  import { onMounted, ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import ClassesModal from '@/components/modals/ClassesModal.vue'
  import ParticipantCard from '@/components/ParticipantCard.vue'
  import { useToast } from '@/composables/useToast'
  import { useStayStore } from '@/stores/StayStore.js'
  import { useTimerStore } from '@/stores/TimerStore.js'

  const timerStore = useTimerStore()

  const { showSimpleToast } = useToast()
  const stayStore = useStayStore()

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
          :completed="false"
          :currency="stayStore.currency"
          :index="i"
          :name="p.name || '-'"
          :participant-type="p.participantType"
          :subtitle="`${t(p.participantType || 'adult')} - ${p.activityType || t('ski')} - Poz. ${p.skillLevel || '-'}`"
          :total-price="stayStore.participantClassesTotalPrice(p.dynamicId)"
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
