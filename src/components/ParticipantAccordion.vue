<script setup>
import {formatDateRange} from "@/utils/dates.js";
import {useI18n} from "vue-i18n";

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

const rules = {
  required: value => !!value || t('select'),
}
const {t} = useI18n()
</script>

<template>
  <VExpansionPanel>
    <VExpansionPanelTitle>
      {{ index + 1 }}: {{ t(`${participant.participantType}`) || '-' }}
    </VExpansionPanelTitle>
    <VExpansionPanelText class="border-t">
      <VTextField
        :model-value="props.participant.name"
        variant="outlined"
        density="default"
        readonly
        clearable
        clearIcon="mdi-close"
        hide-details="auto"
        control-variant="hidden"
        :placeholder="$t('select')"
        @click:clear="props.name = ''"
        :rules="[rules.required]"
      >
        <!--        :error-messages="$t('select_date')"-->
        <template #prepend-inner>
          <VIcon size="16" icon="mdi-account"/>
        </template>
      </VTextField>
    </VExpansionPanelText>
  </VExpansionPanel>
</template>

<style scoped lang="scss">
.v-expansion-panel {
  border-radius: $border-radius-accordion;
}
</style>
