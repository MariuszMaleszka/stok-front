<script setup>
  import { ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { VDateInput } from 'vuetify/labs/VDateInput'
  import UserIcon from '@/assets/user-circle-blue.svg'
  import { useStayStore } from '@/stores/StayStore.js'

  const props = defineProps({
    participant: {
      type: Object,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
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
    },
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
        valid: formValid?.valid && hasChildminder,
      }
    },
  })
</script>

<template>
  <VForm ref="form" class="bg-white fc-black pa-4 rounded-lg my-4 box-shadow-sm">
    <div class="mb-4">
      <p class="custom-input-label mb-2">{{ $t('name') }}</p>
      <VTextField
        v-model="participant.name"
        autocomplete="off"
        clear-icon="mdi-close"
        clearable
        density="default"
        hide-details="auto"
        max-length="50"
        min-length="2"
        :rules="[rules.required]"
        variant="outlined"
        @keydown="(e) => /\d/.test(e.key) && e.preventDefault()"
      >
        <template #prepend-inner>
          <VIcon icon="mdi-account" size="18" />
        </template>
      </VTextField>
    </div>

    <div class="mb-4">
      <p class="custom-input-label mb-2">{{ $t('surname') }}</p>
      <VTextField
        v-model="participant.surname"
        autocomplete="off"
        clear-icon="mdi-close"
        clearable
        density="default"
        hide-details="auto"
        max-length="50"
        min-length="2"
        :rules="[rules.required]"
        variant="outlined"
        @keydown="(e) => /\d/.test(e.key) && e.preventDefault()"
      >
        <template #prepend-inner>
          <VIcon icon="mdi-account-outline" size="18" />
        </template>
      </VTextField>
    </div>

    <div class="mb-4">
      <p class="custom-input-label mb-2">{{ $t('phone_number') }}</p>
      <VTextField
        v-model="participant.phoneNumber"
        autocomplete="off"
        clear-icon="mdi-close"
        clearable
        density="default"
        hide-details="auto"
        max-length="9"
        :rules="[rules.required, rules.phone]"
        variant="outlined"
        @keydown="(e) => !/[\d+]/.test(e.key) && e.key !== 'Backspace' && e.preventDefault()"
      >
        <template #prepend-inner>
          <VIcon icon="mdi-phone" size="18" />
        </template>
      </VTextField>
    </div>

    <div class="mb-4">
      <p class="custom-input-label mb-2">{{ $t('birth_date') }}</p>
      <!--      <input v-model="participant.birthDate" type="date"/>-->
      <VDateInput
        v-model="participant.birthDate"
        density="default"
        hide-details="auto"
        prepend-icon=""
        :rules="[rules.required]"
        variant="outlined"
      >
        <template #prepend-inner>
          <VIcon icon="mdi-calendar" size="18" />
        </template>
      </VDateInput>
    </div>

    <div v-if="participant.participantType === 'child'" class="mb-4">
      <p class="custom-input-label mb-2">{{ $t('childminder') }}</p>
      <VSelect
        v-model="participant.childminder"
        density="default"
        hide-details="auto"
        item-title="name"
        item-value="dynamicId"
        :items="adultParticipants"
        :placeholder="$t('select_childminder')"
        :rules="[rules.required]"
        variant="outlined"
      >
        <template #prepend-inner>
          <VIcon icon="mdi-account-supervisor" size="18" />
        </template>
      </VSelect>
      <small v-if="showErrors && !participant.childminder" class="fs-12 fc-error pl-4 pt-2">
        {{ $t('select_childminder') }}
      </small>
    </div>
  </VForm>
</template>
