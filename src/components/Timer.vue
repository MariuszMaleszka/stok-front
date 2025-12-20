<script setup>
import {useTimerStore} from "@/stores/TimerStore.js";

const timerStore = useTimerStore();
onMounted(() => {
  timerStore.startTimer()
})
</script>

<template>
  <div class="time-counter d-flex fs-12  align-center">
    <span class="mr-1 pa-1 text-right" style="max-width: 130px;">
      {{ $t('timer_info') }}
    </span>
    <span class="black-badge text-center pa-1">
      {{ timerStore.formattedTime }}
    </span>
  </div>
</template>

<style scoped lang="scss">
.time-counter {
  //max-width: 200px;
  line-height: 12px;
  width: fit-content;
}
</style>
