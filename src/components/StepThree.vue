<script setup>
  import { useDebounceFn } from '@vueuse/core'
  import { useCookies } from '@vueuse/integrations/useCookies'
  import { computed, ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useDisplay } from 'vuetify'
  import CheckGreenIcon from '@/assets/check-circle.svg'
  import InsuranceIMG from '@/assets/insurance_img.png'
  import DatePickerResponsive from '@/components/DatePickerResponsive.vue'
  import PopupSmall from '@/components/modals/PopupSmall.vue'
  import ParticipantAccordion from '@/components/ParticipantAccordion.vue'
  import ParticipantData from '@/components/ParticipantData.vue'
  import SelectedParticipantClasses from '@/components/SelectedParticipantClasses.vue'
  import { useToast } from '@/composables/useToast'
  import { useStayStore } from '@/stores/StayStore.js'
  import { useViewControlStore } from '@/stores/ViewControlStore.js'
  import { formatPrice } from '@/utils/numbers.js'

  const { showSimpleToast, showActionToast } = useToast()
  const stayStore = useStayStore()
  const viewStore = useViewControlStore()
  const cookies = useCookies(['locale'])
  const { mobile } = useDisplay()
  const currentLocale = computed(() => cookies.get('locale') || 'pl')
  const { t } = useI18n()

  // Form refs
  const dataForm = ref(null)
  const loyaltyCardField = ref(null)
  const participantForms = ref([])
  const stepThreeNestedRef = ref(null)
  const activeChildStep = ref(1)

  const rules = {
    required: value => !!value || t('fill_the_field_properly'),
    validLoyaltyCard: value => {
      if (!value) return true // Skip if empty (required rule handles this)
      return stayStore.isValidLoyaltyCardNumber === true || t('invalid_loyalty_card_number')
    },
  }

  const selectInsurancesForAllCheckbox = ref(false) // input for selecting all
  const revealInsurancesForAllInfo = ref(false) // to reveal info sections for all
  const discountInfoDialog = ref(false) // discount info popup

  const classesTotalPrice = computed(() => {
    let total = 0
    for (const price of stayStore.participantClassesTotalPrice.value) {
      total += price
    }
    return total
  })

  watch(activeChildStep, async newStep => {
    await nextTick()
    viewStore.currentStep.child = newStep
  })

  watch(selectInsurancesForAllCheckbox, newValue => {
    stayStore.selectedInsurancesForAll = newValue

    for (const participant of stayStore.participants) {
      if (participant.selectedClasses) for (const classItem of participant.selectedClasses) {
        stayStore.insuranceSelected[classItem.dynamicId] = newValue
      }
    }
  })

  // Toggle all insurances for all participants
  const allInsurancesEnabled = computed({
    get () {
      return stayStore.participants.every(participant =>
        participant.selectedClasses?.every(classItem => classItem.insurance?.enabled) ?? false,
      )
    },
    set (value) {
      for (const participant of stayStore.participants) {
        if (participant.selectedClasses) for (const classItem of participant.selectedClasses) {
          if (classItem.insurance) {
            classItem.insurance.enabled = value
          }
        }
      }
    },
  })

  // Sum total of insurances for all participants no matter if they are selected or not
  const sumTotalInsurancesForAll = computed(() => {
    return stayStore.participants.reduce((total, participant) => {
      const participantInsuranceTotal = participant.selectedClasses.reduce((sum, item) => {
        // Skip insurance for child participants in group classes
        if (participant.participantType === 'child' && item.type === 'group') {
          return sum
        }

        if (item.insurance?.price) {
          const price = item.insurance.perDay
            ? item.insurance.price * (item.dates?.length || 1)
            : item.insurance.price
          return sum + price
        }
        return sum
      }, 0)
      return total + participantInsuranceTotal
    }, 0)
  })

  // Handle loyalty card number validation on blur
  const handleCardNumberValidation = useDebounceFn(async () => {
    if (stayStore.loyaltyProgram.loyaltyCardNumber) {
      console.log('Handling loyalty card number validation...')
      const result = await stayStore.checkLoyaltyCardNumber(stayStore.loyaltyProgram.loyaltyCardNumber)
      if (!result) {
        showSimpleToast(t('invalid_loyalty_card_number'), 'error')
      }
      // Force re-validation after the check completes
      await nextTick()
      loyaltyCardField.value?.validate()
      console.log('Loyalty card validation result:', result)
    }
  }, 1500)

  // Expose for parent access
  defineExpose({
    stepThreeNestedRef,
  })

</script>

<template>
  <VStepper
    ref="stepThreeNestedRef"
    v-model="activeChildStep"
    class="child-stepper step-three-element d-flex flex-column flex-1"
    flat
    hide-actions
  >

    <VStepperHeader class="mt-2">
      <VStepperItem
        class="px-1 py-0"
        complete
        :title="$t('cart')"
        :value="1"
      >
        <template #icon>
          1.
        </template>
      </VStepperItem>
      <VStepperItem
        class="px-1 py-0"
        :title="$t('participants_data')"
        :value="2"
      >
        <template #icon>
          2.
        </template>
      </VStepperItem>
      <VStepperItem
        class="px-1 py-0"
        :title="$t('payment')"
        :value="3"
      >
        <template #icon>
          3.
        </template>
      </VStepperItem>
    </VStepperHeader>

    <VStepperWindow class="flex-1">
      <VStepperWindowItem :value="1">
        <div>
          <p
            class="fs-24 font-weight-bold my-4"
          >
            {{ $t('cart') }}
          </p>
          <div class="my-4">
            <p
              class="font-weight-medium mb-n2"
              :class="mobile ? 'fs-14' : 'fs-16'"
            >
              {{ $t('cart_subtitle') }}
            </p>
          </div>
          <div
            class="mb-4 mt-8"
            :class="mobile ? 'fs-18' : 'fs-20'"
          >
            <p>{{ $t('selected_classes') }}:</p>
          </div>
          <div class="d-flex flex-column ga-4 pa-1">
            <SelectedParticipantClasses
              v-for="(participant, index) in stayStore.participants"
              :key="participant.dynamicId"
              :ref="el => participantForms[index] = el"
              class="ga-4"
              :index="index"
              :participant="participant"
            />
          </div>

        </div>
        <!--ADDITIONAL OPTIONS-->
        <div class="my-4 px-1">
          <p
            class="fw-600 mt-4"
            :class="mobile? 'fs-16':'fs-20'"
          >
            {{ $t('aditional_options') }}:
          </p>
          <VSheet class="rounded bg-light-gray mt-2 mb-4">
            <div
              class="pt-0 rounded d-flex align-center justify-between"
              :class="mobile ? 'px-0': 'px-1'"
            >
              <VCheckbox
                v-model="allInsurancesEnabled"
                class="mb-auto mt-1"
                color="info"
                density="compact"
                hide-details
              />
              <div
                class="fw-400 d-flex align-center ml-2"
                :class="mobile ? 'fs-10': 'fs-14'"
              >
                <div class="d-flex flex-column py-2">

                  <p class="ma-1 lh-normal">

                    {{ t('insurance_for_all_option') }}
                  </p>

                  <VBtn
                    class="text-capitalize w-max-content px-1"
                    :class="mobile ? 'fs-10': 'fs-14'"
                    color="grey"
                    flat
                    size="small"
                    variant="text"
                    @click="revealInsurancesForAllInfo = !revealInsurancesForAllInfo"
                  >
                    {{ revealInsurancesForAllInfo ? t('collapse') : t('expand') }}
                    <VIcon :icon="revealInsurancesForAllInfo ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
                  </VBtn>

                </div>

              </div>

              <div
                class="d-flex flex-column align-end ml-auto ma-0 fc-gray"
                :class="mobile ? 'fs-11 ': 'fs-14'"
              >
                <span class="fw-500">
                  +&nbsp;{{ formatPrice(sumTotalInsurancesForAll) }}&nbsp;{{ stayStore.currency }}
                </span>

              </div>
            </div>

            <VExpandTransition>
              <VCard
                v-show="revealInsurancesForAllInfo"
                flat
                style="background-color: transparent;"
                width="100%"
              >
                <VCardText class="pl-8 pt-0">
                  <p :class="mobile ? 'fs-10' : 'fs-12'">
                    Lorem
                  </p>

                </VCardText>
              </VCard>
            </VExpandTransition>
          </VSheet>
        </div>
        <div class="my-4 px-1">
          <p
            class="fw-600 mt-4"
            :class="mobile? 'fs-16':'fs-20'"
          >
            {{ $t('loyalty_card') }}
          </p>
          <VCheckbox
            v-model="stayStore.hasLoyaltyCard"
            color="info"
            hide-details="auto"
            :label="$t('i_have_loyalty_card')"
          />

          <VExpandTransition>
            <VForm
              v-show="stayStore.hasLoyaltyCard"
              ref="dataForm"
              flat
              style="background-color: transparent;"
              width="100%"
            >

              <div class="my-4">
                <p class="custom-input-label mb-2">{{ $t('enter_loyalty_card_number') }}</p>
                <VTextField
                  ref="loyaltyCardField"
                  v-model="stayStore.loyaltyProgram.loyaltyCardNumber"
                  density="default"
                  :disabled="stayStore.checkingLoyaltyCardNumber"
                  hide-details="auto"
                  maxlength="16"
                  :readonly="stayStore.isValidLoyaltyCardNumber"
                  :rules="stayStore.hasLoyaltyCard ? [rules.required, rules.validLoyaltyCard] : []"
                  variant="outlined"
                  @input="handleCardNumberValidation"
                >
                  <template #prepend-inner>
                    <img v-if="stayStore.isValidLoyaltyCardNumber" alt="check" :src="CheckGreenIcon">
                  </template>
                  <template #loader>
                    <VProgressLinear
                      v-if="stayStore.checkingLoyaltyCardNumber"
                      color="info"
                      height="2"
                      indeterminate
                    />
                  </template>
                </VTextField>
              </div>
              <div class="my-4">
                <p class="custom-input-label mb-2">{{ $t('name') }}</p>
                <VTextField
                  v-model="stayStore.loyaltyProgram.loyaltyCardOwnerName"
                  density="default"
                  hide-details="auto"
                  maxlength="50"
                  :rules="stayStore.hasLoyaltyCard ? [rules.required] : []"
                  variant="outlined"
                />
              </div>
              <div class="my-4">
                <p class="custom-input-label mb-2">{{ $t('surname') }}</p>
                <VTextField
                  v-model="stayStore.loyaltyProgram.loyaltyCardOwnerSurname"
                  density="default"
                  hide-details="auto"
                  maxlength="50"
                  :rules="stayStore.hasLoyaltyCard ? [rules.required] : []"
                  variant="outlined"
                />
              </div>

            </VForm>
          </VExpandTransition>
        </div>
        <!--SUMMARY-->
        <div class="my-4 px-1">
          <p
            class="fw-600 my-4"
            :class="mobile? 'fs-16':'fs-20'"
          >
            {{ $t('summary') }}
          </p>
          <VSheet
            class="bg-dark-gray rounded-lg fc-white"
            :class="mobile ? 'fs-11 pa-4' : 'fs-14 pa-8'"
          >
            <ul class="list-style-none pa-0 ma-0">
              <li
                v-for="(participant, idx) in stayStore.participants"
                :key="participant.dynamicId"
                class="pb-2 mb-2"
              >
                <div class="d-flex justify-space-between">
                  <span>{{ participant.name || '-' }}</span>
                  <span class="ml-auto">
                    {{ formatPrice(stayStore.participantClassesTotalPrice(participant.dynamicId) + stayStore.participantInsuranceTotalPrice(participant.dynamicId)) }}&nbsp;{{ stayStore.currency }}
                  </span>
                </div>
                <VDivider class="mt-1 mb-2" />
              </li>
            </ul>
            <!--DISCOUNTS-->
            <div
              v-if="parseFloat(stayStore.discountGeneric) > 0"
              class=" fw-600 mt-2"
            >
              <div class="d-flex justify-space-between fw-400">
                <div>
                  <VIcon
                    class="mr-1"
                    icon="mdi-information-slab-circle"
                    style="opacity: .4;"
                    @click="discountInfoDialog = true"
                  />
                  {{ $t('discount') }}
                </div>
                <span class="fw-400">
                  -&nbsp;{{ stayStore.discountGeneric }}&nbsp;{{ stayStore.currency }}
                </span>
              </div>
              <VDivider class="mt-1 mb-2" />
            </div>

            <div class="d-flex  ga-2 justify-end mt-4">
              <div class="d-flex flex-column">
                <div class="ml-auto">
                  <span class="ml-auto">
                    {{ $t('price_total') }}:
                  </span>
                  <span class="fs-16 ml-auto">
                    {{ formatPrice(stayStore.allParticipantsTotalPrice) }}&nbsp;{{ stayStore.currency }}
                  </span>
                </div>
                <div v-if="allInsurancesEnabled" class="fs-11">
                  <span>{{ $t('including') }}</span>&nbsp;<span class="text-lowercase">{{ $t('aditional_options') }}: </span>
                  <span>{{ formatPrice(sumTotalInsurancesForAll) }}&nbsp;{{ stayStore.currency }}</span>
                </div>
              </div>
            </div>
          </VSheet>
        </div>
        <!--POPUPS-->
        <PopupSmall
          v-model="discountInfoDialog"
          max-width="500px"
          :title="t('discounts_title')"
        >
          <template #content>
            <p>{{ t('discounts_info') }}</p>
          </template>
          <template #actions>
            <VBtn variant="outlined" @click="discountInfoDialog = false">
              Ok
            </VBtn>

          </template>
        </PopupSmall>
      </VStepperWindowItem>

      <VStepperWindowItem :value="2">
        <div>
          <p class="fs-24 font-weight-bold my-4">
            {{ $t('participants_data') }}:
          </p>
          <div class="my-4">
            <p
              class="font-weight-medium "
              :class="mobile ? 'fs-18' : 'fs-20'"
            >
              {{ $t('participants_preferences') }}:
            </p>
            <p
              class="fs-11"
              :class="mobile ? 'fs-14' : 'fs-16'"
            >
              {{ $t('enter_preferences_details') }}
            </p>
          </div>
          <ParticipantData
            v-for="(participant, index) in stayStore.participants"
            :key="participant.dynamicId"
            :ref="el => participantForms[index] = el"
            class="ga-4"
            :index="index"
            :participant="participant"
          />

          <!--SUMMARY-->
          <div class="my-4 px-1">
            <p
              class="fw-600 my-4"
              :class="mobile? 'fs-16':'fs-20'"
            >
              {{ $t('summary') }}
            </p>
            <VSheet
              class="bg-dark-gray rounded-lg fc-white"
              :class="mobile ? 'fs-11 pa-4' : 'fs-14 pa-8'"
            >
              <ul class="list-style-none pa-0 ma-0">
                <li
                  v-for="(participant, idx) in stayStore.participants"
                  :key="participant.dynamicId"
                  class="pb-2 mb-2"
                >
                  <div class="d-flex justify-space-between">
                    <span>{{ participant.name || '-' }}</span>
                    <span class="ml-auto">
                      {{ formatPrice(stayStore.participantClassesTotalPrice(participant.dynamicId) + stayStore.participantInsuranceTotalPrice(participant.dynamicId)) }}&nbsp;{{ stayStore.currency }}
                    </span>
                  </div>
                  <VDivider class="mt-1 mb-2" />
                </li>
              </ul>
              <!--DISCOUNTS-->
              <div
                v-if="parseFloat(stayStore.discountGeneric) > 0"
                class=" fw-600 mt-2"
              >
                <div class="d-flex justify-space-between fw-400">
                  <div>
                    <VIcon
                      class="mr-1"
                      icon="mdi-information-slab-circle"
                      style="opacity: .4;"
                      @click="discountInfoDialog = true"
                    />
                    {{ $t('discount') }}
                  </div>
                  <span class="fw-400">
                    -&nbsp;{{ stayStore.discountGeneric }}&nbsp;{{ stayStore.currency }}
                  </span>
                </div>
                <VDivider class="mt-1 mb-2" />
              </div>

              <div class="d-flex  ga-2 justify-end mt-4">
                <div class="d-flex flex-column">
                  <div class="ml-auto">
                    <span class="ml-auto">
                      {{ $t('price_total') }}:
                    </span>
                    <span class="fs-16 ml-auto">
                      {{ formatPrice(stayStore.allParticipantsTotalPrice) }}&nbsp;{{ stayStore.currency }}
                    </span>
                  </div>
                  <div v-if="allInsurancesEnabled" class="fs-11">
                    <span>{{ $t('including') }}</span>&nbsp;<span class="text-lowercase">{{ $t('aditional_options') }}: </span>
                    <span>{{ formatPrice(sumTotalInsurancesForAll) }}&nbsp;{{ stayStore.currency }}</span>
                  </div>
                </div>
              </div>
            </VSheet>
          </div>
        </div>
      </VStepperWindowItem>

      <VStepperWindowItem :value="3">
        <div class="px-1">
          <p class="fs-24 font-weight-bold my-4">
            {{ $t('payment') }}:
          </p>
          <div class="my-4">
            <p
              class="font-weight-medium "
              :class="mobile ? 'fs-14' : 'fs-16'"
            >
              {{ $t('participants_preferences') }}:
            </p>
          </div>

        </div>
      </VStepperWindowItem>
    </VStepperWindow>
  </VStepper>

</template>
