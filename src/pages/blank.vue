<script setup>
import PackageInfoBox from "@/components/PackageInfoBox.vue";
import {useDisplay} from "vuetify";
import {useI18n} from "vue-i18n";


const {mobile} = useDisplay();
const { t } = useI18n();
</script>
<template>
  <VContainer>
    <!--INFO BOX-->
    <PackageInfoBox class="my-4" color="yellow">
      <span class="fw-500">11 / 10h w pakiecie.</span>
      <p class="mb-2">Aktywowano niższy pakiet cenowy <span>-100,00zł</span></p>
      <div :class="mobile? 'fs-10':'fs-12'" class="custom-badge info">
        Oszczędzasz -10%
      </div>
    </PackageInfoBox>
    <!--INFO BOX-->
    <PackageInfoBox class="my-4" color="green" :showIcon="false">
      <div class="d-flex justify-space-between mb-2">
        <p class="fw-500">Brakuje Ci 2h zajęć, by aktywować tańszy pakiet cenowy.</p>
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
        {{ $t('you_gain') }}-10%
      </div>
    </PackageInfoBox>
    <!--INFO BOX-->
    <PackageInfoBox class="my-4" color="orange" >
      <span class="fw-500">11 / 10h w pakiecie.</span>
      <p class="mb-2">Aktywowano niższy pakiet cenowy <span>-200,00zł</span></p>
      <div :class="mobile? 'fs-10':'fs-12'" class="custom-badge orange">
        {{ $t('you_save') }} -20%
      </div>
    </PackageInfoBox>

  </VContainer>

  <VContainer>
    This is the way
  </VContainer>


</template>
<style lang="scss"></style>
