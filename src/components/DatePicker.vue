<script setup>
  import { VueDatePicker } from '@vuepic/vue-datepicker'
  import { pl } from 'date-fns/locale'
  import { computed, ref } from 'vue'
  import '@vuepic/vue-datepicker/dist/main.css'
  import { useDisplay } from 'vuetify'
  import { formatDateRange } from '@/utils/dates'

  const props = defineProps({
    modelValue: { type: [Date, Array], default: null },
    variant: {
      type: String,
      default: 'simple',
      validator: value => ['simple', 'range', 'multi-calendars', 'month-picker'].includes(value),
    },
    inline: {
      type: Boolean,
      default: false,
    },
    locale: {
      type: Object,
      default: () => pl,
    },
    showHeader: {
      type: Boolean,
      default: true,
    },
    enableTimePicker: {
      type: Boolean,
      default: false,
    },
    isMobile: {
      type: Boolean,
      default: false,
    },
  })

  const emit = defineEmits(['update:modelValue'])

  const { mobile } = useDisplay()
  const datePickerRef = ref(null)

  const pickerConfig = computed(() => {
    const baseConfig = {
      inline: props.inline,
    }

    switch (props.variant) {
      case 'range': {
        return { ...baseConfig, range: true }
      }
      case 'multi-calendars': {
        return { ...baseConfig, range: true, multiCalendars: 2 }
      }
      case 'month-picker': {
        return { ...baseConfig, monthPicker: true }
      }
      default: {
        return baseConfig
      }
    }
  })
  const handleClose = () => {
    datePickerRef.value?.closeMenu()
  }

  const currentMonth = ref(new Date().getMonth())
  const currentYear = ref(new Date().getFullYear())

  const customDayNames = ['Pn', 'Wt', 'Śr', 'Czw', 'Pt', 'Sb', 'Nd']
  const customDayNamesEN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const handlePrevMonth = () => {
    if (currentMonth.value === 0) {
      currentMonth.value = 11
      currentYear.value--
    } else {
      currentMonth.value--
    }
    datePickerRef.value?.setMonthYear({ month: currentMonth.value, year: currentYear.value })
  }

  const handleNextMonth = () => {
    if (currentMonth.value === 11) {
      currentMonth.value = 0
      currentYear.value++
    } else {
      currentMonth.value++
    }
    datePickerRef.value?.setMonthYear({ month: currentMonth.value, year: currentYear.value })
  }
  function onChange(newValue) {
    emit('update:modelValue', newValue)
  }
</script>

<template>
  <VueDatePicker
    :model-value="modelValue"
    ref="datePickerRef"
    :format="formatDateRange"
    :day-names="customDayNames"
    v-bind="pickerConfig"
    clearable
    :action-row="{
      selectBtnLabel: $t('save'),
      cancelBtnLabel: $t('cancel'),
      nowBtnLabel:  $t('current')
    }"
    :locale="props.locale"
    :time-config="{ enableTimePicker: props.enableTimePicker }"
    :formats="{
      month: 'LLLL',
    }"
    @update:model-value="onChange"
  >
    <template #menu-header>
      <div v-if="showHeader" class="fs-16 mb-3 d-flex justify-space-between">
        {{ $t('select_your_stay_dates') }}
        <button class="close-btn" aria-label="Close" @click="handleClose">
          <VIcon size="18" icon="mdi-close" />
        </button>
      </div>
      <div class="mb-3">
      <VAlert
        class="mb-2 fs-13 border alert-info"
        density="compact"
      >
        <span class="fc-blue">
          {{ $t('maximum_length_of_stay') }}
        </span>
      </VAlert>
      </div>
      <div class="d-flex justify-space-between px-4">
        <VIcon @click="handlePrevMonth" icon="mdi-chevron-left">
        </VIcon>
          {{ $t('select_month') }}
        <VIcon  @click="handleNextMonth" icon="mdi-chevron-right" />
      </div>
    </template>
    <template #trigger>
      <VTextField
        variant="outlined"
        readonly
        clearable
        clearIcon="mdi-close"
        hide-details
        control-variant="hidden"
        :model-value="formatDateRange(modelValue)"
        :placeholder="$t('select')"
      >
        <template #prepend-inner>
          <VIcon size="16" icon="mdi-calendar-blank-outline" />
        </template>

      </VTextField>
    </template>
    <template #action-preview="{ value }">
      <div v-if="modelValue" class="custom-preview mr-auto">
        {{ $t('selected') }}:
        <span class="fw-600">
          {{ formatDateRange(value) }}
        </span>
      </div>
    </template>
  </VueDatePicker>
</template>

<style lang="scss">
.dp__menu {
  font-family: 'Inter', sans-serif;
  border: none;
  margin-top: 1rem;
  @media (min-width: 960px) {
    margin-top: unset;
    border-radius: 16px;
   padding: 16px;
    -webkit-box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.2);
    -moz-box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.2);
    box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.2);
  }
  .dp__arrow_top {
    display: none;
  }
}
.dp__month_year_wrap {
  font-size: 13px;

  .dp--arrow-btn-nav {
    display: none !important;
  }
  .dp__month_year_select {
    width: unset !important;
    margin-right: 5px;
    text-transform: capitalize;
    font-weight: 700;
  }
}
.dp__menu_inner  {
  padding-bottom: 0;
  column-gap: 10px;

  @media (min-width: 960px) {
    padding: 16px 16px 0 16px !important;

  }
}
.dp__calendar_header {
  font-size: 13px;
  font-weight: 200;
}

.dp__action_button {
  padding-block: 8px !important;
  padding-inline: 16px !important;
  min-height: 35px;
  border-radius: 8px;
  font-size: 16px;
  margin-left: 8px;
}
.dp__action_cancel {
  background-color: $gray-light  !important;
  color: #000;
}
.dp__action_select {
  background-color: $gray !important;
  color: #fff;
}
.dp__cell_inner {
  font-size: 13px;
}
.dp__action_row {
  flex-direction: column;
  align-items: flex-start;
  border-top: 1px solid;
  padding-top: 12px;
}
</style>
