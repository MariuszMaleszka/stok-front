<script setup>
import { useDisplay } from 'vuetify'

const { mobile } = useDisplay()

defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  maxWidth: {
    type: String,
    default: '320px'
  },
  showActions: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue'])

const closeDialog = () => {
  emit('update:modelValue', false)
}
</script>

<template>
  <VDialog
    :model-value="modelValue"
    :max-width="maxWidth"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <VCard>
      <VCardTitle class="bg-light-gray text-pre-wrap border-b ">
        <div
          class="d-flex py-4 justify-space-between align-center"
        >
          <span class="lh-normal" :class="mobile ? 'fs-14' : 'fs-16'">
            {{ title }}
          </span>
          <VIcon
            class="close-btn mb-auto"
            aria-label="Close"
            icon="mdi-close"
            @click="closeDialog"
         />
        </div>
      </VCardTitle>

      <VCardText >
        <slot name="content">
          <p :class="mobile ? 'fs-12' : 'fs-14'">
            Default content
          </p>
        </slot>
      </VCardText>

      <VCardActions
        v-if="showActions"
        class="py-4 d-flex justify-between text-capitalize"
      >
        <slot name="actions">
          <VBtn
            variant="flat"
            class="px-4 text-capitalize"
            @click="closeDialog"
          >
            Ok
          </VBtn>
        </slot>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

