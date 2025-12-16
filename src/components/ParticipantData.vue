<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStayStore } from '@/stores/StayStore.js'
import UserIcon from '@/assets/user-circle-blue.svg'
import { VDateInput } from 'vuetify/labs/VDateInput'

const props = defineProps({
  participant: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    required: true
  }
})

const { t } = useI18n()
const stayStore = useStayStore()
const form = ref(null)
const showErrors = ref(false)

const rules = {
  required: value => !!value || t('fill_the_field_properly'),
  phone: value => {
    const phoneRegex = /^\+?[0-9]{9,15}$/
    return !value || phoneRegex.test(value) || t('invalid_phone_number')
  }
}

// Get adult participants for childminder selection
const adultParticipants = computed(() => {
  return stayStore.participants.filter(p => p.participantType === 'adult')
})

defineExpose({
  validate: async () => {
    showErrors.value = true
    const formValid = await form.value?.validate()

    // Additional validation for childminder if child
    const hasChildminder = props.participant.participantType === 'child'
      ? !!props.participant.childminder
      : true

    return {
      valid: formValid?.valid && hasChildminder
    }
  }
})
</script>

<template>
  <VForm ref="form" class="bg-white fc-black pa-4 rounded-lg my-4 box-shadow-sm">
    <div class="mb-4">
      <p class="custom-input-label mb-2">{{ $t('name') }}</p>
      <VTextField
        v-model="participant.name"
        variant="outlined"
        density="default"
        clearable
        clearIcon="mdi-close"
        autocomplete="off"
        hide-details="auto"
        maxLength="50"
        minLength="2"
        :rules="[rules.required]"
        @keydown="(e) => /\d/.test(e.key) && e.preventDefault()"
      >
        <template #prepend-inner>
          <VIcon size="18" icon="mdi-account"/>
        </template>
      </VTextField>
    </div>

    <div class="mb-4">
      <p class="custom-input-label mb-2">{{ $t('surname') }}</p>
      <VTextField
        v-model="participant.surname"
        variant="outlined"
        density="default"
        clearable
        clearIcon="mdi-close"
        autocomplete="off"
        hide-details="auto"
        maxLength="50"
        minLength="2"
        :rules="[rules.required]"
        @keydown="(e) => /\d/.test(e.key) && e.preventDefault()"
      >
        <template #prepend-inner>
          <VIcon size="18" icon="mdi-account-outline"/>
        </template>
      </VTextField>
    </div>

    <div class="mb-4">
      <p class="custom-input-label mb-2">{{ $t('phone_number') }}</p>
      <VTextField
        v-model="participant.phoneNumber"
        variant="outlined"
        density="default"
        clearable
        clearIcon="mdi-close"
        autocomplete="off"
        hide-details="auto"
        maxLength="9"
        :rules="[rules.required, rules.phone]"
        @keydown="(e) => !/[\d+]/.test(e.key) && e.key !== 'Backspace' && e.preventDefault()"
      >
        <template #prepend-inner>
          <VIcon size="18" icon="mdi-phone"/>
        </template>
      </VTextField>
    </div>

    <div class="mb-4">
      <p class="custom-input-label mb-2">{{ $t('birth_date') }}</p>
<!--      <input v-model="participant.birthDate" type="date"/>-->
      <VDateInput
        v-model="participant.birthDate"
        variant="outlined"
        density="default"
        prepend-icon=""
        hide-details="auto"
        :rules="[rules.required]"
      >
        <template #prepend-inner>
          <VIcon size="18" icon="mdi-calendar"/>
        </template>
      </VDateInput>
    </div>

    <div v-if="participant.participantType === 'child'" class="mb-4">
      <p class="custom-input-label mb-2">{{ $t('childminder') }}</p>
      <VSelect
        v-model="participant.childminder"
        :items="adultParticipants"
        item-title="name"
        item-value="dynamicId"
        variant="outlined"
        density="default"
        hide-details="auto"
        :placeholder="$t('select_childminder')"
        :rules="[rules.required]"
      >
        <template #prepend-inner>
          <VIcon size="18" icon="mdi-account-supervisor"/>
        </template>
      </VSelect>
      <small v-if="showErrors && !participant.childminder" class="fs-12 fc-error pl-4 pt-2">
        {{ $t('select_childminder') }}
      </small>
    </div>
  </VForm>
</template>
