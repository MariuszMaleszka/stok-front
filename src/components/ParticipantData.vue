<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStayStore } from '@/stores/StayStore.js'
import UserIcon from '@/assets/user-circle-blue.svg'
import { VDateInput } from 'vuetify/labs/VDateInput'
import {useDisplay} from "vuetify"
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
const {mobile} = useDisplay()
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

const isAnotherChildminder = computed(() =>
  props.participant.childminder === 'another'
)

// Prepare select items with "Another childminder" option
const childminderOptions = computed(() => {
  return [
    ...adultParticipants.value,
    { name: t('another_childminder'), dynamicId: 'another' }
  ]
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
    <div class="border-b mb-4 pb-4">
      <img :src="UserIcon" alt="user-icon">
      <div class="d-flex align-center fs-16 fw-500 mt-2">

      {{ index + 1 }}. {{ participant.name}}
      </div>
    </div>
    <VRow >
      <VCol :cols="mobile ? 12 : 6">

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
          </VTextField>

      </VCol>

      <VCol :cols="mobile ? 12 : 6">
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
          </VTextField>

      </VCol>

      <VCol :cols="mobile ? 12 : 6">
        <p class="custom-input-label mb-2">{{ $t('phone_number') }}</p>
        <VTextField
          v-model="participant.phoneNumber"
          variant="outlined"
          density="default"
          clearable
          autocomplete="off"
          hide-details="auto"
          maxLength="11"
          :rules="[rules.required, rules.phone]"
          @keydown="(e) => !/[\d+]/.test(e.key) && e.key !== 'Backspace' && e.preventDefault()"
        >
        </VTextField>
      </VCol>

      <VCol :cols="mobile ? 12 : 6">
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
      </VCol>

      <VCol
        v-if="participant.participantType === 'child'"
        :cols="12"
      >
        <p class="custom-input-label mb-2">{{ $t('childminder') }}</p>
        <VSelect
          v-model="participant.childminder"
          :items="childminderOptions"
          item-title="name"
          item-value="dynamicId"
          clearable
          variant="outlined"
          density="default"
          :placeholder="$t('select_childminder')"
          hide-details="auto"
          :rules="[rules.required]"
        >

        </VSelect>
        <small v-if="showErrors && !participant.childminder" class="fs-12 fc-error pl-4 pt-2">
          {{ $t('select_childminder') }}
        </small>
      </VCol>
      <!-- Additional fields for "Another childminder" -->
      <template v-if="isAnotherChildminder">
        <VCol :cols="mobile ? 12 : 6">
          <p class="custom-input-label mb-2">{{ $t('childminder_name') }}</p>
          <VTextField
            v-model="participant.anotherChildminderName"
            variant="outlined"
            density="default"
            clearable
            clearIcon="mdi-close"
            autocomplete="off"
            hide-details="auto"
            :rules="[rules.required]"
          />
        </VCol>

        <VCol :cols="mobile ? 12 : 6">
          <p class="custom-input-label mb-2">{{ $t('surname') }}</p>
          <VTextField
            v-model="participant.anotherChildminderSurname"
            variant="outlined"
            density="default"
            clearable
            clearIcon="mdi-close"
            autocomplete="off"
            hide-details="auto"
            :rules="[rules.required]"
          />
        </VCol>

        <VCol :cols="mobile ? 12 : 6">
          <p class="custom-input-label mb-2">{{ $t('childminder_phone') }}</p>
          <VTextField
            v-model="participant.anotherChildminderPhone"
            variant="outlined"
            density="default"
            clearable
            maxLength="11"
            autocomplete="off"
            hide-details="auto"
            :rules="[rules.required, rules.phone]"
            @keydown="(e) => !/[\d+]/.test(e.key) && e.key !== 'Backspace' && e.preventDefault()"
          />
        </VCol>
      </template>

    </VRow>
  </VForm>
</template>
