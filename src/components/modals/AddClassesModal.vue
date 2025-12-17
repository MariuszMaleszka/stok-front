<script setup>
  import { ref } from 'vue'
  import { useI18n } from 'vue-i18n'

  const props = defineProps({
    modelValue: { type: Boolean, default: false },
    dateStr: { type: String, default: '' },
  })

  const emit = defineEmits(['update:modelValue', 'next'])

  const { t } = useI18n()
  const selectedType = ref(null)

  const classTypes = [
    {
      id: 'individual',
      label: 'Zajęcia indywidualne',
      icon: 'mdi-account',
    },
    {
      id: 'shared',
      label: 'Zajęcia wspólne z innym uczestnikiem',
      icon: 'mdi-account-multiple',
    },
    {
      id: 'group',
      label: 'Zajęcia grupowe',
      icon: 'mdi-account-group',
    },
  ]

  function close () {
    emit('update:modelValue', false)
  }

  function next () {
    if (selectedType.value) {
      emit('next', selectedType.value)
    }
  }
</script>

<template>
  <VDialog
    max-width="500"
    :model-value="modelValue"
    persistent
    @update:model-value="emit('update:modelValue', $event)"
  >
    <VCard class="rounded-16">
      <div class="pa-4 background-class">
        <div class="d-flex justify-space-between align-center">
          <span class="font-weight-medium text-primary-900 fs-20">Dodawanie zajęć</span>
          <VBtn icon="mdi-close" variant="text" @click="close" />
        </div>

        <div class="d-flex align-center text-grey-darken-1 mb-2 fs-14">
          <VIcon class="mr-2" icon="mdi-calendar-blank" size="small" />
          <span class="font-weight-medium">{{ dateStr }}</span>
        </div>
      </div>

      <div class="text-center mt-4 pa-4">
        <span class="text-subtitle-1 font-weight-medium text-primary-900">Wybierz rodzaj zajęć:</span>
      </div>

      <div class="d-flex flex-column gap-3 mb-6 pa-4">
        <div
          v-for="type in classTypes"
          :key="type.id"
          class="selection-card d-flex align-center px-4 py-3 cursor-pointer"
          :class="{ 'selected': selectedType === type.id }"
          @click="selectedType = type.id"
        >
          <div class="selection-circle mr-3 d-flex align-center justify-center">
            <div v-if="selectedType === type.id" class="inner-circle" />
          </div>
          <VIcon class="mr-3" :color="selectedType === type.id ? 'primary' : 'grey-darken-1'" :icon="type.icon" />
          <span class="font-weight-medium text-primary-900 label-text">{{ type.label }}</span>
        </div>
      </div>

      <div class="d-flex justify-center mb-6 pa-4">
        <VBtn
          class="text-none text-caption"
          color="grey-darken-1"
          prepend-icon="mdi-information"
          variant="outlined"
        >
          Dowiedz się więcej o rodzajach zajęć
        </VBtn>
      </div>

      <div class="d-flex gap-3 pa-4">
        <VBtn
          class="flex-1-1 text-none rounded-lg"
          height="48"
          prepend-icon="mdi-arrow-left"
          variant="outlined"
          @click="close"
        >
          Wyjdź
        </VBtn>
        <VBtn
          append-icon="mdi-arrow-right"
          class="flex-1-1 text-none rounded-lg"
          :color="selectedType ? 'primary' : 'grey-lighten-2'"
          :disabled="!selectedType"
          height="48"
          variant="flat"
          @click="next"
        >
          Dalej
        </VBtn>
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
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  transition: all 0.2s ease;

  &:hover {
    border-color: #2563EB;
    background-color: #F9FAFB;
  }

  &.selected {
    border-color: #2563EB;
    background-color: #EFF6FF;
    border-width: 1px;
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

.inner-circle {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #2563EB;
}

.flex-1-1 {
  flex: 1 1 0;
}

.rounded-16 {
  border-radius: 16px!important;
}

.background-class {
  background: #F3F4F6;
}

.v-btn--variant-outlined  {
  border: 1px solid #E5E7EB;
  color: #6B7280 !important;
  font-weight: 400;
}

.label-text {
  font-size: 14px;
  color: #233876;
}
</style>
