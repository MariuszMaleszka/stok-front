<script setup>
import {computed, ref} from 'vue'
import {useDisplay} from 'vuetify';
import {useI18n} from "vue-i18n";
import {useStayStore} from "@/stores/StayStore.js";

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

const CUSTOMER_SERVICE_LINK = "https://szkolastok.pl/kontakt"
const {mobile} = useDisplay()
const stayStore = useStayStore()
const infoDialog = ref(false)
const selectedSkillLevel = ref(null)
const {t} = useI18n()
const panel = ref([0])
const form = ref(null)
const showErrors = ref(false)

const rules = {
  required: value => !!value || t('fill_the_field_properly'),
}

const classType = ref(null)

const availableSkillLevels = computed(() => {
  if (props.participant.participantType === 'adult') {
    return stayStore.skillLevels_ADULTS
  } else if (props.participant.participantType === 'child') {
    if (!props.participant.age) {
      return []
    }

    const age = parseInt(props.participant.age)

    if (classType.value === 0) {
      return stayStore.skillLevels_CHILDREN_SKI.filter(level =>
        age >= level.ageRange[0] && age <= level.ageRange[1]
      )
    } else if (classType.value === 1) {
      return stayStore.skillLevels_CHILDREN_SNOWBOARD.filter(level =>
        age >= level.ageRange[0] && age <= level.ageRange[1]
      )
    }
  }
  return []
})

const currentSkillLevelInfo = computed(() => {
  if (!selectedSkillLevel.value || !selectedSkillLevel.value[0]) return null
  return availableSkillLevels.value.find(level => level === selectedSkillLevel.value[0])
})

const isSnowboardDisabled = computed(() => {
  return props.participant.participantType === 'child' &&
    props.participant.age !== null &&
    props.participant.age < 8
})

const selectSkillLevel = (level) => {
  availableSkillLevels.value.forEach(l => l.selected = false)
  level.selected = true
  props.participant.skillLevel = level.name
  selectedSkillLevel.value = [level]
  infoDialog.value = false
}

watch(selectedSkillLevel, (newValue) => {
  if (newValue && newValue[0]) {
    props.participant.skillLevel = newValue[0].name
  } else {
    props.participant.skillLevel = ''
  }
})

watch(() => props.participant.age, (newAge) => {
  if (props.participant.participantType === 'child' && newAge !== null && newAge < 8 && classType.value === 1) {
    classType.value = null
    props.participant.activityType = ''
    selectedSkillLevel.value = null
    props.participant.skillLevel = ''
  }
})

// Expose validate method for parent
defineExpose({
  validate: async () => {
    showErrors.value = true
    const formValid = await form.value?.validate()

    // Additional validation for classType and skillLevel
    const hasClassType = classType.value !== null
    const hasSkillLevel = selectedSkillLevel.value !== null && selectedSkillLevel.value.length > 0

    return {
      valid: formValid?.valid && hasClassType && hasSkillLevel
    }
  }
})
</script>

<template>
  <VExpansionPanels>
    <VExpansionPanel v-model="panel">
      <VExpansionPanelTitle>
        <span class="fw-600">
          {{ index + 1 }} - {{ t(`${participant.participantType}`) || '-' }}
        </span>
      </VExpansionPanelTitle>
      <VExpansionPanelText class="border-t">
        <VForm ref="form">
          <div class="mb-4" v-if="participant.participantType === 'child'">
            <p class="custom-input-label mb-2">{{ $t('child_age') }}</p>
            <VNumberInput
              v-model="participant.age"
              variant="outlined"
              density="default"
              :min="4"
              :max="14"
              :step="1"
              control-variant="split"
              hide-details="auto"
              max-width="165px"
              :rules="[rules.required]"
            />
            <p class="fs-12 fc-gray">
              {{ $t('min_child_age') }}
              <a class="fc-gray" target="_blank" :href="CUSTOMER_SERVICE_LINK">{{ $t('with_customers_service') }}</a>
            </p>
          </div>

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
              :placeholder="$t('enter_name')"
              @click:clear="participant.name = ''"
              :rules="[rules.required]"
              @keydown="(e) => /\d/.test(e.key) && e.preventDefault()"
              @paste="(e) => {
                const pastedText = e.clipboardData.getData('text')
                if (/\d/.test(pastedText)) {
                  e.preventDefault()
                }
              }"
            >
              <template #prepend-inner>
                <VIcon size="18" icon="mdi-account"/>
              </template>
            </VTextField>
          </div>
          <div class="mb-4">
            <p class="custom-input-label mb-2">{{ $t('classes_lang') }}</p>

            <VSelect
              v-model="participant.classLang"
              :items="stayStore.availableLanguages"
              item-title="name"
              item-value="name"
              variant="outlined"
              density="default"
              hide-details="auto"
              :placeholder="$t('select_language')"
              :rules="[rules.required]"
            >
            </VSelect>


          </div>

          <div class="mb-4">
            <p class="custom-input-label mb-2">{{ $t('classes_type') }}</p>
            <VBtnToggle
              v-model="classType"
              class="ga-2 w-100"
              mandatory
              @update:model-value="(val) => {
                participant.activityType = val === 0 ? t('ski') : t('snowboard')
              }"
            >
              <VBtn
                :value="0"
                variant="outlined"
                :class="[
                  mobile ? 'flex-1' : 'px-8',
                  { 'border-error': showErrors && classType === null }
                ]"
                class="text-capitalize border rounded"
              >
                {{ $t('ski') }}
              </VBtn>
              <VBtn
                :value="1"
                variant="outlined"
                :disabled="isSnowboardDisabled"
                :class="[
                  mobile ? 'flex-1' : 'px-8',
                  { 'border-error border-2': showErrors && classType === null }
                ]"
                class="text-capitalize border rounded"
              >
                {{ $t('snowboard') }}
              </VBtn>
            </VBtnToggle>
            <small v-if="showErrors && classType === null" class="fs-12 fc-error pl-4 pt-2">
              {{ $t('select_class_type') }}
            </small>
          </div>

          <div class="mb-4" v-if="classType === 0 || classType === 1">
            <p class="custom-input-label mb-2">{{ $t('difficulty_level') }}</p>
            <VList
              v-model:selected="selectedSkillLevel"
              select-strategy="single-leaf"
              selectable
            >
              <VListItem
                v-for="(item, i) in availableSkillLevels"
                :key="i"
                :value="item"
                color="primary"
                class="border rounded-lg mb-2"
                @click="selectSkillLevel(item)"
              >
                <template v-slot:prepend="{ isSelected }">
                  <VIcon
                    size="16"
                    :icon="isSelected ? 'mdi-circle-slice-8' : 'mdi-circle-outline'"
                  />
                </template>
                <VListItemTitle>
                  <p class="mb-0 fs-14 text-pre-wrap lh-normal">
                    {{ item.name }}
                  </p>
                </VListItemTitle>
                <p class="mb-0 fs-11 text-pre-wrap">
                  {{ item.description }}
                </p>
                <template #append>
                  <VIcon
                    size="16"
                    icon="mdi-information-slab-circle"
                    @click.stop="selectedSkillLevel = [item]; infoDialog = true"
                  />
                </template>
              </VListItem>
            </VList>
            <small v-if="showErrors && !selectedSkillLevel" class="fs-12 fc-error pl-4">
              {{ $t('select_difficulty_level') }}
            </small>
          </div>
        </VForm>
      </VExpansionPanelText>
    </VExpansionPanel>

    <VDialog v-model="infoDialog" max-width="320px">
      <VCard v-if="currentSkillLevelInfo">
        <VCardTitle>
          <div :class="mobile ? 'py-2':''" class="d-flex justify-space-between">
            <span :class="mobile ? 'fs-14':'fs-16'">
              {{ currentSkillLevelInfo.name }}
            </span>
            <button class="close-btn" aria-label="Close" @click="infoDialog = false">
              <VIcon size="18" icon="mdi-close"/>
            </button>
          </div>
        </VCardTitle>
        <VCardText
          :class="mobile ? 'pt-0':''"
        >
          <p :class="mobile ? 'fs-12':'fs-14'">
            {{ currentSkillLevelInfo.additionalInfo }}
          </p>
        </VCardText>
        <VCardActions class="border-t d-flex justify-between text-capitalize">
          <VBtn variant="flat" class="px-4 text-capitalize" @click="infoDialog = false">
            Ok
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </VExpansionPanels>
</template>
