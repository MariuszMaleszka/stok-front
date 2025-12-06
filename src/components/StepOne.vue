<script setup>
import DatePickerResponsive from "@/components/DatePickerResponsive.vue";
import {useStayStore} from '@/stores/StayStore.js'
import {computed} from "vue";
import {useCookies} from "@vueuse/integrations/useCookies";
import {useI18n} from "vue-i18n";

const stayStore = useStayStore()
const cookies = useCookies(['locale'])
const currentLocale = computed(() => cookies.get('locale') || 'pl')

</script>

<template>
  <div class="d-flex flex-column h-100 flex-1">
    <p class="fs-20 font-weight-bold my-4">
      {{ $t('booking_classes') }}:
    </p>
    <div class="my-4">
      <p class="fs-18 fc-blue font-weight-medium mb-n2">
        {{ $t('provide_details_of_your_stay') }}:
      </p>
      <small class="fs-11">
        {{ $t('select_day_or_period_of_stay') }}
      </small>
    </div>


    <div class="mb-6">
      <p class="custom-input-label mb-2">{{ $t('length_of_stay') }}</p>
      <DatePickerResponsive
        v-model="stayStore.dateOfStay"
        :locale="currentLocale"
        class="mb-2"
      />
    </div>
    <div class="mb-6">
      <p class="custom-input-label mb-2">{{ $t('adults_number') }}</p>
      <VNumberInput
        v-model="stayStore.adultsNumber"
        class="mb-2"
        variant="outlined"
        controlVariant="split"
        hide-details="auto"
        :min="1"
        :max="6"
        max-width="165px"
      >

      </VNumberInput>
      <p class="fs-12 fc-gray">
        {{ $t('enter_number_of_participants_adult') }}
      </p>
    </div>
    <div class="mb-6">
      <p class="custom-input-label mb-2">{{ $t('children_number') }}</p>
      <VNumberInput
        v-model="stayStore.childrenNumber"
        class="mb-2"
        variant="outlined"
        controlVariant="split"
        hide-details="auto"
        :min="1"
        :max="6"
        max-width="165px"
      >
      </VNumberInput>
      <p class="fs-12 fc-gray">
        {{ $t('enter_number_of_participants_children') }}
      </p>
    </div>
    <VBtn
      variant="flat"
      size="x-large"
      color="blue"
      class=" fs-16 text-capitalize"
    >
      {{ $t('next') }}
    </VBtn>
  </div>
</template>

<style scoped lang="scss">

</style>
