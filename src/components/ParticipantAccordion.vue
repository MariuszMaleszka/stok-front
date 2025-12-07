<script setup>
import {computed, ref} from 'vue'
import {useDisplay} from 'vuetify';
import {useI18n} from "vue-i18n";
import {useStayStore} from "@/stores/StayStore.js";

const props = defineProps({
  participant: {
    type: Object,
    required: true,
    default: () => ({
      name: '',
      participantType: '', // adult or child
      age: null,
      activityType: '',
      skillLevel: '',
      availableActivityTypes: [],
      availableLessonTypes: [],
      showGroupLessons: true
    })
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
const rules = {
  required: value => !!value || t('select'),
}
const {t} = useI18n()

const classType = ref(0) // 0 = ski, 1 = snowboard

// Computed property to get the correct skill levels based on participant type and class type
const availableSkillLevels = computed(() => {
  if (props.participant.participantType === 'adult') {
    // Adults have same levels for both ski and snowboard
    return stayStore.skillLevels_ADULTS
  } else if (props.participant.participantType === 'child') {
    // Children have different levels for ski and snowboard
    if (classType.value === 0) {
      return stayStore.skillLevels_CHILDREN_SKI
    } else if (classType.value === 1) {
      return stayStore.skillLevels_CHILDREN_SNOWBOARD
    }
  }
  return []
})

// Get current selected skill level info for the dialog
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
  // Deselect all levels first
  availableSkillLevels.value.forEach(l => l.selected = false)

  // Select the clicked level
  level.selected = true

  // Update the participant's skillLevel in the store
  props.participant.skillLevel = level.name

  // Close the dialog
  infoDialog.value = false
}

</script>

<template>
  <VExpansionPanels>
    <VExpansionPanel>
      <VExpansionPanelTitle>
        <span class="fw-600">

        {{ index + 1 }} - {{ t(`${participant.participantType}`) || '-' }}
        </span>
      </VExpansionPanelTitle>
      <VExpansionPanelText class="border-t">
        <div class="mb-4" v-if="participant.participantType === 'child'">
          <p class="custom-input-label mb-2">{{ $t('child_age') }}</p>
          <VNumberInput
            v-model="participant.age"
            variant="outlined"
            density="default"
            :min="4"
            :max="16"
            :step="1"
            control-variant="split"
            max-width="165px"
            hide-details="auto"
            :rules="[rules.required]"
          >

          </VNumberInput>
          <p class="fs-12 fc-gray">
            {{ $t('min_child_age') }}
            <a class="fc-gray" target="_blank" :href="CUSTOMER_SERVICE_LINK">{{ $t('with_customers_service') }}</a>
          </p>
        </div>
        <div class="mb-4">
          <p class=" custom-input-label mb-2">{{ $t('name') }}</p>

          <VTextField
            v-model="participant.name"
            variant="outlined"
            density="default"
            clearable
            clearIcon="mdi-close"
            hide-details="auto"
            control-variant="hidden"
            autocomplete="off"
            :placeholder="$t('enter_name')"
            @click:clear="props.name = ''"
            :rules="[rules.required]"
          >
            <!--        :error-messages="$t('select_date')"-->
            <template #prepend-inner>
              <VIcon size="18" icon="mdi-account"/>
            </template>
          </VTextField>
        </div>
        <div class="mb-4">
          <p class="custom-input-label mb-2">{{ $t('classes_type') }}</p>
          <VBtnToggle
            v-model="classType"
            class="ga-2 w-100"
          >
            <VBtn
              variant="outlined"
              :class="mobile ? 'flex-1' : 'px-8'"
              class="text-capitalize border rounded "
            >
              {{ $t('ski') }}
            </VBtn>

            <VBtn
              variant="outlined"
              :disabled="isSnowboardDisabled"
              :class="mobile ? 'flex-1' : 'px-8'"
              class="text-capitalize border rounded"
            >
              {{ $t('snowboard') }}
            </VBtn>

          </VBtnToggle>
        </div>
        <div class="mb-4" v-if="classType !== null">
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
                ></VIcon>
              </template>

              <VListItemTitle>
                <p class="mb-0  fs-14 text-pre-wrap lh-normal">
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
                >
                </VIcon>

              </template>

            </VListItem>
          </VList>

          <!--          <VRadioGroup class="px-0">-->
          <!--            <VRadio class="border rounded pa-2" label="Radio One" value="one">-->

          <!--            </VRadio>-->
          <!--            <VRadio class="border rounded pa-2" label="Radio Two" value="two">-->

          <!--            </VRadio>-->
          <!--            <VRadio class="border rounded pa-2" label="Radio Three" value="three">-->

          <!--            </VRadio>-->
          <!--          </VRadioGroup>-->
        </div>
      </VExpansionPanelText>
    </VExpansionPanel>
    <VDialog
      v-model="infoDialog"
      max-width="320px"
    >
      <VCard v-if="currentSkillLevelInfo">
        <VCardTitle>
          <div
            :class="mobile ? 'py-2':''"
            class="d-flex justify-space-between"
          >
            <span
              :class="mobile ? 'fs-14':'fs-16'">
              {{ currentSkillLevelInfo.name }}
            </span>
            <button class="close-btn" aria-label="Close"  @click="infoDialog = false">
              <VIcon size="18" icon="mdi-close"/>
            </button>
          </div>
        </VCardTitle>
        <VCardText
          :class="mobile ? 'pt-0':''"
          class="px-2"
        >
          {{ currentSkillLevelInfo.additionalInfo }}
        </VCardText>
        <VCardActions class="border-t d-flex justify-between text-capitalize">

          <VBtn
            variant="flat"
            class="px-4 text-capitalize"
            @click="infoDialog = false"
          >
            Ok
          </VBtn>
        </VCardActions>
      </VCard>

    </VDialog>
  </VExpansionPanels>
</template>

<style  lang="scss">

</style>
