<script setup>
import PackageInfoBox from "@/components/PackageInfoBox.vue";
import {useDisplay} from "vuetify";
import {useI18n} from "vue-i18n";
import {useStayStore} from "@/stores/StayStore.js";

const stayStore = useStayStore();

const {mobile} = useDisplay();
const { t } = useI18n();
</script>
<template>
  <VContainer>
    <!--INFO BOX-->
    <PackageInfoBox v-if="stayStore.firstPackageEligible" class="my-4" color="yellow">
      <span class="fw-500"><span class="fw-600">{{stayStore.allParticipantsTotalHours}}</span>/10h w {{ $t('in_package') }}.</span>
      <p class="mb-2">{{ $t('lower_price_package_activated') }}
        <span>{{ stayStore.allParticipantsTotalPrice }}</span>
      </p>
      <div :class="mobile? 'fs-10':'fs-12'" class="custom-badge info">
        {{ $t('you_save') }} -{{ stayStore.FIRST_LEVEL_DISCOUNT }}%
      </div>
    </PackageInfoBox>

    <!--INFO BOX-->
    <PackageInfoBox v-if="stayStore.secondPackageEligible" class="my-4" color="yellow" >
      <span class="fw-500"><span class="fw-600">{{stayStore.allParticipantsTotalHours}}</span>/20h w {{ $t('in_package') }}.</span>
      <p class="mb-2">{{ $t('cheaper_price_package_activated') }}
        <span>{{ stayStore.allParticipantsTotalPrice }}</span>
      </p>
      <div :class="mobile? 'fs-10':'fs-12'" class="custom-badge info">
        {{ $t('you_save') }} -{{ stayStore.SECOND_LEVEL_DISCOUNT }}%
      </div>
    </PackageInfoBox>


    <!--INFO BOX-->
    <PackageInfoBox
      v-if="(stayStore.missingHoursToFirstThreshold > 0 && stayStore.missingHoursToFirstThreshold <= 2) ||
        (stayStore.firstPackageEligible && stayStore.missingHoursToSecondThreshold > 0)"
      class="my-4"
      color="green"
      :showIcon="false"
    >
      <div class="d-flex justify-space-between mb-2">
        <p class="fw-500">
          {{ $t('you_are_missing') }}
          <span class="fc-green-dark fw-600">{{ stayStore.missingClassesForDiscount }}h {{ $t('classes_plural') }},</span>
          {{ $t('to_activate_the_package') }}
        </p>
        <VBtn
          variant="outlined"
          color="green"
          :class="mobile? 'fs-12':'fs-14'"
          class="text-capitalize pa-2 mt-4 mb-2 ml-2"
        >
          {{ $t('add_classes') }}
        </VBtn>
      </div>
      <div :class="mobile ? 'fs-10' : 'fs-12'" class="custom-badge green">
        {{ $t('you_gain') }} {{ stayStore.firstPackageEligible ? stayStore.SECOND_LEVEL_DISCOUNT : stayStore.FIRST_LEVEL_DISCOUNT }}%
      </div>
    </PackageInfoBox>

  </VContainer>

  <VContainer>
    <p>

   total hours (no group classes): {{ stayStore.allParticipantsTotalHours }}
    </p>
    <p>
      missing hours to first discount package: {{ stayStore.missingHoursToFirstThreshold }}
    </p>
    <p>
      missing hours to second discount package: {{ stayStore.missingHoursToSecondThreshold }}
    </p>
    <p>
      missing classes for discount: {{ stayStore.missingClassesForDiscount }}
    </p>
  </VContainer>


</template>
<style lang="scss"></style>
