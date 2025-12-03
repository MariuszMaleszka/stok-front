<script setup>
import '@vuepic/vue-datepicker/dist/main.css'
import {VueDatePicker} from "@vuepic/vue-datepicker";
import {useDisplay} from 'vuetify'
import {formatDateRange} from "@/utils/dates.js";
import {pl, enUS} from "date-fns/locale";
import {computed, ref} from "vue";

const props = defineProps({
  modelValue: {type: [Date, Array], default: null},
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
    type: [String, Object],
    default: () => pl,
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

const datePickerRef = ref(null)

const {mobile} = useDisplay()
const dialog = ref(false)

const currentMonth = ref(new Date().getMonth())
const currentYear = ref(new Date().getFullYear())


const normalizedLocale = computed(() => {
  if (typeof props.locale === 'string') {
    return props.locale === 'pl' ? pl : enUS
  }
  return props.locale
})

const dayNames = computed(() => {
  const localeCode = typeof props.locale === 'string'
    ? props.locale
    : props.locale?.code

  return localeCode === 'pl'
    ? ['Pn', 'Wt', 'Śr', 'Czw', 'Pt', 'Sb', 'Nd']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
})

const handlePrevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
  datePickerRef.value?.setMonthYear({month: currentMonth.value, year: currentYear.value})
}

const handleNextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
  datePickerRef.value?.setMonthYear({month: currentMonth.value, year: currentYear.value})
}

const handleClose = () => {
  datePickerRef.value?.closeMenu()
}

const onChange = (newValue) => {
  emit('update:modelValue', newValue)
}

</script>

<template>
  <span>{{ $t('length_of_stay') }}</span>
  <!-- Desktop Picker -->
  <VueDatePicker
    v-if="!mobile"
    :model-value="modelValue"
    ref="datePickerRef"
    :format="formatDateRange"
    :day-names="dayNames"
    :range="{ maxRange: 14 }"
    multiCalendars
    clearable
    :action-row="{
      selectBtnLabel: $t('save'),
      cancelBtnLabel: $t('cancel'),
      nowBtnLabel:  $t('current'),
      selectBtnClass: 'sraka'
    }"
    :locale="normalizedLocale"
    :time-config="{ enableTimePicker: props.enableTimePicker }"
    :formats="{
      month: 'LLLL',
    }"
    @update:model-value="onChange"
  >
    <template #menu-header>
      <div class="fs-16 mb-3 d-flex justify-space-between">
        {{ $t('select_your_stay_dates') }}
        <button class="close-btn" aria-label="Close" @click="handleClose">
          <VIcon size="18" icon="mdi-close"/>
        </button>
      </div>
      <div class="mb-3">
        <VAlert
          class="mb-2 fs-13 border alert-info-small"
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
        <VIcon @click="handleNextMonth" icon="mdi-chevron-right"/>
      </div>
    </template>
    <template #trigger>
      <VTextField
        variant="outlined"
        density="default"
        readonly
        clearable
        clearIcon="mdi-close"
        hide-details
        control-variant="hidden"
        :model-value="formatDateRange(modelValue)"
        :placeholder="$t('select')"
        @click:clear="emit('update:modelValue', null)"
      >
        <template #prepend-inner>
          <VIcon size="16" icon="mdi-calendar-blank-outline"/>
        </template>

      </VTextField>
    </template>
    <template #action-preview="{ value }">
      <div v-if="modelValue" class="custom-preview fs-13 mr-auto">
        {{ $t('selected') }}:
        <span class="fw-600">
          {{ formatDateRange(value) }}
        </span>
      </div>
    </template>
  </VueDatePicker>

  <VTextField
    v-else
    variant="outlined"
    density="default"
    readonly
    clearable
    hide-details
    control-variant="hidden"
    clearIcon="mdi-close"
    :model-value="formatDateRange(modelValue)"
    :label="$t('select')"
    @click="dialog = true"
    @click:clear="emit('update:modelValue', null)"
  >
    <template #prepend-inner>
      <VIcon size="16" icon="mdi-calendar-blank-outline"/>
    </template>
  </VTextField>

  <!-- Mobile dialog-->
  <VDialog
    v-model="dialog"
    scrollable
    fullscreen
  >
    <VCard>
      <VCardTitle>
        <div class="d-flex justify-space-between">
          {{ $t('select_your_stay_dates') }}
          <VIcon icon="mdi-close" @click="dialog = false"/>
        </div>
      </VCardTitle>
      <VCardText class="px-2">
        <VueDatePicker
          :model-value="modelValue"
          ref="datePickerRef"
          :format="formatDateRange"
          :day-names="dayNames"
          :range="{ maxRange: 14 }"
          multiCalendars
          inline
          clearable
          :action-row="{
          selectBtnLabel: $t('save'),
          cancelBtnLabel: $t('cancel'),
          nowBtnLabel:  $t('current'),
          selectBtnClass: 'sraka'
        }"
          :locale="normalizedLocale"
          :time-config="{ enableTimePicker: props.enableTimePicker }"
          :formats="{
      month: 'LLLL',
    }"
          @update:model-value="onChange"
        >
          <template #menu-header>

            <div class="mb-3">
              <VAlert
                class="mb-2 fs-13 border alert-info-small"
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
              <VIcon @click="handleNextMonth" icon="mdi-chevron-right"/>
            </div>
          </template>

          <template #action-preview="{ value }">
            <div v-if="modelValue" class="custom-preview fs-13 mr-auto">
              {{ $t('selected') }}:
              <span class="fw-600">
          {{ formatDateRange(value) }}
        </span>
            </div>
          </template>
        </VueDatePicker>

      </VCardText>
    </VCard>
  </VDialog>
</template>

<style lang="scss">
.dp__outer_menu_wrap {
  @media (max-width: 960px) {
  width: 100%;
  }

}
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

.dp__menu_inner {
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
  background-color: $gray-light !important;
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
  border-top: 1px solid $gray-border;
  padding-top: 12px;
  margin-top: 12px;
}
.dp__cell_inner {
  padding: 1px 8px !important;
  margin: 1px !important;
  border-radius: $border-radius;
  height: 28px !important;
}

.dp--future.dp__range_start,
.dp--future.dp__range_end{
  background: #1a56db;

}
.dp__range_between{
  background: #dbeafe;
  color: $blue;
}
.dp__menu:has(.dp__range_start) .dp__action_select,
.dp__menu:has(.dp__range_end) .dp__action_select {
  background-color: $blue !important;
}
</style>
<!-- Multi-calendar range picker -->

<!-- Simple single calendar -->
<!--    <DatePicker variant="simple" />-->

<!-- Range picker with time -->
<!--    <DatePicker enable-time-picker variant="range" />-->

<!-- Month picker -->
<!--    <DatePicker variant="month-picker" />-->
