<script setup>
  import { useDisplay } from 'vuetify'

  const { mobile } = useDisplay()

  defineProps({
    modelValue: {
      type: Boolean,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    maxWidth: {
      type: String,
      default: '320px',
    },
    showActions: {
      type: Boolean,
      default: true,
    },
  })

  const emit = defineEmits(['update:modelValue'])

  function closeDialog () {
    emit('update:modelValue', false)
  }
</script>

<template>
  <VDialog
    :max-width="maxWidth"
    :model-value="modelValue"
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
            aria-label="Close"
            class="close-btn mb-auto"
            icon="mdi-close"
            @click="closeDialog"
          />
        </div>
      </VCardTitle>

      <VCardText>
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
            class="px-4 text-capitalize"
            variant="flat"
            @click="closeDialog"
          >
            Ok
          </VBtn>
        </slot>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
