<script setup>
defineProps({
  message: {
    type: String,
    required: true,
  },
  buttonText: {
    type: String,
    required: true,
  },
  onAction: {
    type: Function,
    required: true,
  },
})

const handleAction = () => {
  onAction()
}
</script>
<template>
  <div class="toast-with-action">
    <p class="toast-message">{{ message }}</p>
    <button
      class="toast-button"
      @click="handleAction"
    >
      {{ buttonText }}
    </button>
  </div>
</template>
<style scoped lang="scss">
.toast-with-action {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
}

.toast-message {
  flex: 1;
  margin: 0;
  color: inherit;
}

.toast-button {
  padding: 0.5rem 1rem;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background-color 0.2s;

  &:hover {
    background-color: #1565c0;
  }

  &:active {
    background-color: #0d47a1;
  }
}
</style>
