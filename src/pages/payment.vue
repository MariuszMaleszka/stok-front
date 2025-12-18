<script setup>
import {useDisplay} from 'vuetify'
import {useStayStore} from "@/stores/StayStore.js";
import CheckGreenIcon from '@/assets/check-circle.svg'
import ExclamationIcon from '@/assets/exclamation.svg'

const stayStore = useStayStore()
const {mobile} = useDisplay()
</script>

<template>
  <VContainer
    max-width="990"
    :class="mobile ? 'px-2': ''"
    class="d-flex flex-column flex-1 mt-4 mb-12"
  >
    <VCard
      v-if="stayStore.isPaymentCompleted"
      flat
      class="my-8 bg-transparent"
    >
      <VCardText>
        <div class="d-flex flex-column justify-center items-center ga-4 text-center">
          <img
            width="32px"
            :src="CheckGreenIcon"
            alt="check"
            class="mx-auto"
          >
          <div>
          <h2>
            {{ $t('booking_confirmed') }}
          </h2>
          <p>
            {{ $t('booking_confirmed_info') }}
          </p>
          </div>
        <VBtn
          class="mx-auto  text-transform-none"
          variant="flat"
          color="primary"
          size="large"
          @click="$router.push({ name: '/' })"
        >
          {{ $t('back_to_homepage') }}
        </VBtn>
        </div>

      </VCardText>
    </VCard>
<!--Failed-->
    <VCard
      v-if="stayStore.isPaymentFailed"
      flat
      class="my-8 bg-transparent"
    >
      <VCardText>
        <div class="d-flex flex-column justify-center items-center ga-4 text-center">
          <img
            width="32px"
            :src="ExclamationIcon"
            alt="check"
            class="mx-auto"
          >
          <div>
            <h2>
              {{ $t('payment_failed') }}
            </h2>
            <p>
              {{ $t('booking_confirmed_info') }}
            </p>
          </div>
          <VBtn
            class="mx-auto text-transform-none"
            variant="flat"
            color="primary"
            size="large"

            @click="$router.push({ name: '/' })"
          >
            {{ $t('back_to_homepage') }}
          </VBtn>
        </div>

      </VCardText>
    </VCard>

    <VCard
      v-if="stayStore.isPaymentFailed"
      flat
      class="my-8 bg-transparent"
    >
      <VCardText>
        <div class="d-flex flex-column justify-center items-center ga-4 text-center">
        <VIcon size="32" icon="mdi-progress-clock" class="mx-auto" />
          <div>
            <h2>
              {{ $t('payment_in_process') }}
            </h2>
            <p>
              {{ $t('payment_in_process_info') }}
            </p>
          </div>
          <VBtn
            class="mx-auto text-transform-none"
            variant="flat"
            color="primary"
            size="large"
            @click="$router.push({ name: '/payment' })"
          >
            {{ $t('back_to_payment') }}
          </VBtn>
        </div>

      </VCardText>
    </VCard>



  </VContainer>

</template>

<style scoped lang="scss">

</style>
