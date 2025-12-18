<script setup>
import DatePickerResponsive from "@/components/DatePickerResponsive.vue";
import {useStayStore} from '@/stores/StayStore.js'
import {useStayConfigStore} from "@/stores/StayConfigStore.js";
import {computed, ref, watch, nextTick} from "vue";
import {useCookies} from "@vueuse/integrations/useCookies";
import {useToast} from '@/composables/useToast'
import {useViewControlStore} from "@/stores/ViewControlStore.js";
import {useDisplay} from 'vuetify'
import SelectedParticipantClasses from "@/components/SelectedParticipantClasses.vue";
import {useI18n} from "vue-i18n";
import {formatPrice} from "@/utils/numbers.js";
import CheckGreenIcon from "@/assets/check-circle.svg";
import {useDebounceFn} from '@vueuse/core'
import PopupSmall from "@/components/modals/PopupSmall.vue";
import ParticipantData from "@/components/ParticipantData.vue";
import WalletIcon from "@/assets/wallet.svg";

const {showSimpleToast, showActionToast} = useToast()
const stayStore = useStayStore()
const configStore = useStayConfigStore()
const viewStore = useViewControlStore()
const cookies = useCookies(['locale'])
const {mobile, lgAndUp} = useDisplay()
const {t} = useI18n()

// Form refs
const dataForm = ref(null)
const stayManagerFormRef = ref(null)
const agreementsFormRef = ref(null)

const loyaltyCardField = ref(null)
const participantForms = ref([])
const stepThreeNestedRef = ref(null)
const activeChildStep = ref(1)

const rules = {
  required: value => !!value || t('fill_the_field_properly'),
  email: value => !value || /.+@.+\..+/.test(value) || t('invalid_email'),
  phone: value => !value || /^[\d+\s-()]+$/.test(value) || t('invalid_phone'),
  validLoyaltyCard: value => {
    if (!value) return true
    return stayStore.isValidLoyaltyCardNumber === true || t('invalid_loyalty_card_number')
  }
}

const selectInsurancesForAllCheckbox = ref(false) // input for selecting all
const revealInsurancesForAllInfo = ref(false) // to reveal info sections for all
const discountInfoDialog = ref(false) // discount info popup

watch(activeChildStep, async (newStep) => {
  await nextTick()
  viewStore.currentStep.child = newStep
})

watch(selectInsurancesForAllCheckbox, (newValue) => {
  stayStore.selectedInsurancesForAll = newValue

  stayStore.participants.forEach(participant => {
    participant.selectedClasses?.forEach(classItem => {
      stayStore.insuranceSelected[classItem.dynamicId] = newValue
    })
  })
})


// Toggle all insurances for all participants
const allInsurancesEnabled = computed({
  get() {
    return stayStore.participants.every(participant =>
      participant.selectedClasses?.every(classItem => classItem.insurance?.enabled) ?? false
    )
  },
  set(value) {
    stayStore.participants.forEach(participant => {
      participant.selectedClasses?.forEach(classItem => {
        if (classItem.insurance) {
          classItem.insurance.enabled = value
        }
      })
    })
  }
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


// Get adult participants for stay manager select
const adultParticipants = computed(() => {
  const adults = stayStore.participants.filter(p => p.participantType === 'adult')
  return [
    ...adults,
    {dynamicId: 'another', name: t('another_stay_manager'), surname: ''}
  ]
})

// Auto-select first adult and populate fields
watch(adultParticipants, (adults) => {
  const actualAdults = adults.filter(a => a.dynamicId !== 'another')
  if (actualAdults.length > 0 && !stayStore.stayManagerData.managerId) {
    const firstAdult = actualAdults[0]
    stayStore.stayManagerData.managerId = firstAdult.dynamicId
    stayStore.stayManagerData.name = firstAdult.name || ''
    stayStore.stayManagerData.surname = firstAdult.surname || ''
    stayStore.stayManagerData.phone = firstAdult.phone || ''
    stayStore.stayManagerData.email = firstAdult.email || ''
  }
}, {immediate: true})

// Update fields when selection changes
watch(() => stayStore.stayManagerData.managerId, (managerId) => {
  if (managerId === 'another') {
    // Clear fields when "another" is selected
    stayStore.stayManagerData.name = ''
    stayStore.stayManagerData.surname = ''
    stayStore.stayManagerData.phone = ''
    stayStore.stayManagerData.email = ''
  } else {
    const manager = stayStore.participants.find(p => p.dynamicId === managerId)
    if (manager) {
      stayStore.stayManagerData.name = manager.name || ''
      stayStore.stayManagerData.surname = manager.surname || ''
      stayStore.stayManagerData.phone = manager.phone || ''
      stayStore.stayManagerData.email = manager.email || ''
    }
  }
})

// Check if "another stay manager" is selected
const isAnotherStayManager = computed(() => stayStore.stayManagerData.managerId === 'another')

// Validate all forms in step 3/2 (participants data)
const validateCurrentStep = async () => {
  const validationResults = []

  // Validate loyalty card form if has loyalty card
  if (stayStore.hasLoyaltyCard && dataForm.value) {
    const loyaltyCardValid = await dataForm.value.validate()
    validationResults.push(loyaltyCardValid.valid)
  }

  // Validate all participant forms
  if (participantForms.value && participantForms.value.length > 0) {
    for (const form of participantForms.value) {
      if (form && form.validate) {
        const result = await form.validate()
        validationResults.push(result.valid)
      }
    }
  }

  // Validate stay manager form
  if (stayManagerFormRef.value) {
    const stayManagerValid = await stayManagerFormRef.value.validate()
    validationResults.push(stayManagerValid.valid)
  }

  // Validate agreements - all three must be checked
  const agreementsValid =
    stayStore.stokSchoolRegulationsAccepted &&
    stayStore.stokSchoolRodoAccepted &&
    stayStore.stokSchoolPaymentRegulationsAccepted

  if (!agreementsValid) {
    showSimpleToast(t('please_accept_all_required_agreements'), 'error')
    validationResults.push(false)
  }

  // Check if all validations passed
  const allValid = validationResults.every(result => result === true)

  if (!allValid) {
    showSimpleToast(t('please_fill_all_required_fields'), 'error')
  }

  return allValid
}

// Expose for parent access
defineExpose({
  stepThreeNestedRef,
  validateCurrentStep,
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
        :value="1"
        :title="$t('cart')"
        class="px-1 py-0"
        complete
      >
        <template #icon>
          1.
        </template>
      </VStepperItem>
      <VStepperItem
        :value="2"
        :title="$t('participants_data')"
        class="px-1 py-0"
      >
        <template #icon>
          2.
        </template>
      </VStepperItem>
      <VStepperItem
        :value="3"
        :title="$t('payment')"
        class="px-1 py-0"
      >
        <template #icon>
          3.
        </template>
      </VStepperItem>
    </VStepperHeader>

    <VStepperWindow class="flex-1">
      <VStepperWindowItem :value="1">
        <div class="d-flex flex-wrap">
          <div
            v-if="lgAndUp"
            class="my-4 pb-4 w-100 border-b"
          >
            <StayDateDisplay class="mb-4"/>
            <p class="fs-24 font-weight-bold mb-4">
              {{ $t('cart') }}
            </p>

            <p
              :class="mobile ? 'fs-14' : 'fs-16'"
              class="font-weight-medium mb-2"
            >
              {{ $t('cart_subtitle') }}
            </p>

          </div>
          <div :class="lgAndUp ? 'w-50' : 'w-100'">
            <StayDateDisplay v-if="!lgAndUp" class="my-4"/>
            <p
              v-if="!lgAndUp"
              class="fs-24 font-weight-bold my-4">
              {{ $t('cart') }}
            </p>
            <div
              v-if="!lgAndUp"
              class="my-4"
            >
              <p
                :class="mobile ? 'fs-14' : 'fs-16'"
                class="font-weight-medium "
              >
                {{ $t('cart_subtitle') }}
              </p>
            </div>
            <p
              class="fw-600 my-4"
              :class="mobile ? 'fs-18 mb-4 mt-8' : 'fs-20'"
            >
              {{ $t('selected_classes') }}:
            </p>
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
          <div :class="lgAndUp ? 'w-40 ml-auto' : 'w-100'">
            <!--ADDITIONAL OPTIONS-->
            <div class="my-4 px-1">
              <p
                :class="mobile? 'fs-16':'fs-20'"
                class="fw-600 my-4"
              >
                {{ $t('aditional_options') }}:
              </p>
              <VSheet class="rounded bg-light-gray mt-2 mb-4">
                <div
                  class="pa-4 ga-3 rounded d-flex align-center justify-between"
                >
                  <VCheckbox
                    density="compact"
                    v-model="allInsurancesEnabled"
                    hide-details
                    color="info"
                    class="mb-auto "
                  />
                  <div
                    :class="mobile ? 'fs-10': 'fs-14'"
                    class="fw-400 d-flex 2 align-center ml-2"
                  >
                    <div class="d-flex flex-column">
                      <p class="mt-2 lh-normal">
                        {{ t('insurance_for_all_option') }}
                      </p>

                      <VBtn
                        :class="mobile ? 'fs-10': 'fs-14'"
                        class="text-capitalize w-max-content px-0"
                        variant="text"
                        size="small"
                        flat
                        color="grey"
                        @click="revealInsurancesForAllInfo = !revealInsurancesForAllInfo"
                      >
                        {{ revealInsurancesForAllInfo ? t('collapse') : t('expand') }}
                        <VIcon :icon="revealInsurancesForAllInfo ? 'mdi-chevron-up' : 'mdi-chevron-down'"/>
                      </VBtn>

                    </div>
                  </div>

                  <div
                    :class="mobile ? 'fs-11 ': 'fs-14'"
                    class="d-flex mt-1 flex-column align-end ml-auto fc-gray mb-auto"
                  >
                    <span class="fw-500 mb-auto">
                      +&nbsp;{{ formatPrice(sumTotalInsurancesForAll) }}&nbsp;{{ stayStore.currency }}
                    </span>

                  </div>
                </div>

                <VExpandTransition>
                  <VCard
                    v-show="revealInsurancesForAllInfo"
                    width="100%"
                    flat
                    style="background-color: transparent;"
                  >
                    <VCardText class="pl-6 pt-0">
                      <p :class="mobile ? 'fs-10' : 'fs-12'">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
                        labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
                        laboris nisi ut aliquip ex ea commodo consequat.
                      </p>

                    </VCardText>
                  </VCard>
                </VExpandTransition>
              </VSheet>
            </div>
            <div class="my-4 px-1">
              <p
                :class="mobile? 'fs-16':'fs-20'"
                class="fw-600 mt-4"
              >
                {{ $t('loyalty_card') }}
              </p>
              <VCheckbox
                v-model="stayStore.hasLoyaltyCard"
                :label="$t('i_have_loyalty_card')"
                hide-details="auto"
                color="info"
              >
              </VCheckbox>

              <VExpandTransition>
                <VForm
                  ref="dataForm"
                  v-show="stayStore.hasLoyaltyCard"
                  width="100%"
                  flat
                  style="background-color: transparent;"
                >

                  <div class="my-4">
                    <p class="custom-input-label mb-2">{{ $t('enter_loyalty_card_number') }}</p>
                    <VTextField
                      ref="loyaltyCardField"
                      v-model="stayStore.loyaltyProgram.loyaltyCardNumber"
                      variant="outlined"
                      density="default"
                      maxlength="16"
                      hide-details="auto"
                      :readonly="stayStore.isValidLoyaltyCardNumber"
                      :disabled="stayStore.checkingLoyaltyCardNumber"
                      :rules="stayStore.hasLoyaltyCard ? [rules.required, rules.validLoyaltyCard] : []"
                      @input="handleCardNumberValidation"
                    >
                      <template #prepend-inner>
                        <img v-if="stayStore.isValidLoyaltyCardNumber" :src="CheckGreenIcon" alt="check">
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
                      variant="outlined"
                      density="default"
                      maxlength="50"
                      hide-details="auto"
                      :rules="stayStore.hasLoyaltyCard ? [rules.required] : []"
                    />
                  </div>
                  <div class="my-4">
                    <p class="custom-input-label mb-2">{{ $t('surname') }}</p>
                    <VTextField
                      v-model="stayStore.loyaltyProgram.loyaltyCardOwnerSurname"
                      variant="outlined"
                      density="default"
                      maxlength="50"
                      hide-details="auto"
                      :rules="stayStore.hasLoyaltyCard ? [rules.required] : []"
                    />
                  </div>

                </VForm>
              </VExpandTransition>
            </div>
            <!--SUMMARY-->
            <div class="my-4 px-1">
              <p
                :class="mobile? 'fs-16':'fs-20'"
                class="fw-600 my-4"
              >
                {{ $t('summary') }}
              </p>
              <VSheet
                :class="mobile ? 'fs-11 pa-4' : 'fs-14 pa-8'"
                class="bg-dark-gray rounded-lg fc-white"
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
                    {{
                          formatPrice(stayStore.participantClassesTotalPrice(participant.dynamicId) + stayStore.participantInsuranceTotalPrice(participant.dynamicId))
                        }}&nbsp;{{ stayStore.currency }}
                  </span>
                    </div>
                    <VDivider class="mt-1 mb-2"/>
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
                        icon="mdi-information-slab-circle"
                        @click="discountInfoDialog = true"
                        class="mr-1"
                        style="opacity: .4;"
                      />
                      {{ $t('discount') }}
                    </div>
                    <span class="fw-400">
                -&nbsp;{{ stayStore.discountGeneric }}&nbsp;{{ stayStore.currency }}
              </span>
                  </div>
                  <VDivider class="mt-1 mb-2"/>
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
                      <span>{{ $t('including') }}</span>&nbsp;<span class="text-lowercase">{{
                        $t('aditional_options')
                      }}: </span>
                      <span>{{ formatPrice(sumTotalInsurancesForAll) }}&nbsp;{{ stayStore.currency }}</span>
                    </div>
                  </div>
                </div>
              </VSheet>
            </div>
          </div>


        </div>

        <!--POPUPS-->
        <PopupSmall
          v-model="discountInfoDialog"
          :title="t('discounts_title')"
          max-width="500px"
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

      <!--PARTICIPANTS DATA-->
      <VStepperWindowItem
        :value="2"
      >
        <div class="container-narrow">
          <p class="fs-24 font-weight-bold my-4">
            {{ $t('enter_participants_data') }}:
          </p>
          <div class="my-4">

            <p
              :class="mobile ? 'fs-14' : 'fs-16'"
              class="fs-11"
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

          <!--stay MANAGER DATA-->
          <VForm ref="stayManagerFormRef" class="mt-8 mb-4 px-1">
            <p
              :class="mobile? 'fs-16':'fs-20'"
              class="fw-600 my-4"
            >
              {{ $t('stay_manager_data') }}:
            </p>
            <VSheet
              :class="mobile ? 'fs-11 pa-4' : 'fs-14 pa-8'"
              class="bg-white rounded-lg box-shadow-sm"
            >
              <div class="mb-2">
                <img :src="WalletIcon" alt="wallet">
                <div class="d-flex align-center fs-16 fw-500 mt-2">
                  {{ $t('select_stay_manager') }}:
                </div>
              </div>

              <VSelect
                v-model="stayStore.stayManagerData.managerId"
                :items="adultParticipants"
                item-title="name"
                item-value="dynamicId"
                clearIcon="mdi-close"
                variant="outlined"
                clearable
                hide-details="auto"
                :placeholder="$t('select_stay_manager')"
                :rules="[rules.required]"
              >
                <template #selection="{ item }">
                  {{ item.raw.name }}{{ item.raw.surname ? ' ' + item.raw.surname : '' }}
                </template>
                <template #item="{ item, props }">
                  <v-list-item v-bind="props">
                    <template #title>
                      {{ item.raw.name }}{{ item.raw.surname ? ' ' + item.raw.surname : '' }}
                    </template>
                  </v-list-item>
                </template>
              </VSelect>
              <VDivider class="my-4"/>

              <VRow class="mt-4">
                <VCol :cols="mobile ? 12 : 6">
                  <p class="custom-input-label mb-2">{{ isAnotherStayManager ? $t('payers_name') : $t('name') }}</p>
                  <VTextField
                    v-model="stayStore.stayManagerData.name"
                    variant="outlined"
                    density="default"
                    clearIcon="mdi-close"
                    maxLength="50"
                    minLength="2"
                    clearable
                    hide-details="auto"
                    :rules="[rules.required]"
                  />
                </VCol>

                <VCol :cols="mobile ? 12 : 6">
                  <p class="custom-input-label mb-2">{{
                      isAnotherStayManager ? $t('payers_surname') : $t('surname')
                    }}</p>
                  <VTextField
                    v-model="stayStore.stayManagerData.surname"
                    variant="outlined"
                    density="default"
                    maxLength="50"
                    minLength="2"
                    clearIcon="mdi-close"
                    clearable
                    hide-details="auto"
                    :rules="[rules.required]"
                  />
                </VCol>

                <VCol :cols="mobile ? 12 : 6">
                  <p class="custom-input-label mb-2">{{ $t('phone_number') }}</p>
                  <VTextField
                    v-model="stayStore.stayManagerData.phone"
                    variant="outlined"
                    density="default"
                    clearIcon="mdi-close"
                    clearable
                    maxLength="11"
                    hide-details="auto"
                    :rules="[rules.required, rules.phone]"
                    @keydown="(e) => !/[\d+]/.test(e.key) && e.key !== 'Backspace' && e.preventDefault()"
                  >
                  </VTextField>
                  <p class="fs-12 px-4 fc-gray">
                    {{ $t('enter_only_numbers') }}
                  </p>
                </VCol>

                <VCol :cols="mobile ? 12 : 6">
                  <p class="custom-input-label mb-2">{{ isAnotherStayManager ? $t('payers_email') : 'Email' }}</p>
                  <VTextField
                    v-model="stayStore.stayManagerData.email"
                    variant="outlined"
                    density="default"
                    clearIcon="mdi-close"
                    clearable
                    hide-details="auto"
                    type="email"
                    :rules="[rules.required, rules.email]"
                  />
                </VCol>
              </VRow>
              <VDivider class="mt-8 mb-4"/>
              <div class="my-4 w-100">
                <VCheckbox
                  v-model="stayStore.anotherPayerData"
                  density="compact"
                  color="info"
                  hide-details="auto"
                >
                  <template #label>
                    {{ $t('another_payers_data') }}
                  </template>
                </VCheckbox>
              </div>

              <VExpandTransition>
                <VRow v-show="stayStore.anotherPayerData" class="mt-2">
                  <VCol :cols="mobile ? 12 : 6">
                    <p class="custom-input-label mb-2">{{ $t('payers_name') }}</p>
                    <VTextField
                      v-model="stayStore.payerData.name"
                      variant="outlined"
                      density="default"
                      clearIcon="mdi-close"
                      maxLength="50"
                      minLength="2"
                      clearable
                      hide-details="auto"
                      :rules="stayStore.anotherPayerData ? [rules.required] : []"
                    />
                  </VCol>

                  <VCol :cols="mobile ? 12 : 6">
                    <p class="custom-input-label mb-2">{{ $t('payers_surname') }}</p>
                    <VTextField
                      v-model="stayStore.payerData.surname"
                      variant="outlined"
                      density="default"
                      maxLength="50"
                      clearIcon="mdi-close"
                      minLength="2"
                      clearable
                      hide-details="auto"
                      :rules="stayStore.anotherPayerData ? [rules.required] : []"
                    />
                  </VCol>

                  <VCol :cols="mobile ? 12 : 6">
                    <p class="custom-input-label mb-2">{{ $t('payers_email') }}</p>
                    <VTextField
                      v-model="stayStore.payerData.email"
                      variant="outlined"
                      density="default"
                      clearIcon="mdi-close"
                      clearable
                      hide-details="auto"
                      type="email"
                      :rules="stayStore.anotherPayerData ? [rules.required, rules.email] : []"
                    />
                  </VCol>
                </VRow>
              </VExpandTransition>

              <VDivider class="my-4"/>

              <div class="my-4 w-100">
                <VCheckbox
                  v-model="stayStore.receiveInvoice"
                  density="compact"
                  color="info"
                  hide-details="auto"
                >
                  <template #label>
                    {{ $t('receive_invoice') }}
                  </template>
                </VCheckbox>
              </div>

              <VExpandTransition>
                <VRow v-show="stayStore.receiveInvoice" class="mt-2">
                  <VCol :cols="mobile ? 12 : 6">
                    <p class="custom-input-label mb-2">{{ $t('company_name') }}</p>
                    <VTextField
                      v-model="stayStore.invoiceData.companyName"
                      variant="outlined"
                      density="default"
                      clearIcon="mdi-close"
                      maxLength="100"
                      clearable
                      hide-details="auto"
                      :rules="stayStore.receiveInvoice ? [rules.required] : []"
                    />
                  </VCol>

                  <VCol :cols="mobile ? 12 : 6">
                    <p class="custom-input-label mb-2">{{ $t('tax_id') }}</p>
                    <VTextField
                      v-model="stayStore.invoiceData.taxId"
                      variant="outlined"
                      density="default"
                      clearIcon="mdi-close"
                      maxLength="10"
                      clearable
                      hide-details="auto"
                      :rules="stayStore.receiveInvoice ? [rules.required] : []"
                      @keydown="(e) => !/[\d]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Tab' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.preventDefault()"
                    />

                  </VCol>

                  <VCol cols="12">
                    <p class="custom-input-label mb-2">{{ $t('company_address') }}</p>
                    <VTextField
                      v-model="stayStore.invoiceData.companyAddress"
                      variant="outlined"
                      density="default"
                      clearIcon="mdi-close"
                      maxLength="200"
                      clearable
                      hide-details="auto"
                      :rules="stayStore.receiveInvoice ? [rules.required] : []"
                    />
                    <p class="fs-12 px-4 fc-gray">
                      {{ $t('enter_street_and_number') }}
                    </p>
                  </VCol>
                </VRow>
              </VExpandTransition>

            </VSheet>
          </VForm>
          <!--AGREEMENTS-->
          <VForm ref="agreementsFormRef" class="agreements-container mt-8 mb-4 px-1 lh-normal">
            <p
              :class="mobile? 'fs-16':'fs-20'"
              class="fw-600 my-4"
            >
              {{ $t('consents_and_declarations') }}:
            </p>
              <VCheckbox
                v-model="stayStore.stokSchoolRegulationsAccepted"
                density="compact"
                color="info"
                hide-details="auto"
                :class="mobile? 'fs-12':'fs-14'"
                class="mb-2"
              >
                <template #label>
                  <span :class="mobile? 'fs-12':'fs-14'">
                    {{ $t('i_declare_that_i_have_read_and_accept_the_regulations') }}
                     <a :href="configStore.REGULATIONS_LINK" target="_blank" :class="mobile? 'fs-12':'fs-14'">
                   {{ $t('stok_rules') }}
                  </a>
                  </span>
                </template>
              </VCheckbox>

              <VCheckbox
                v-model="stayStore.stokSchoolRodoAccepted"
                density="compact"
                color="info"
                hide-details="auto"
                class="mb-2"
              >
                <template #label>
                  <span :class="mobile? 'fs-12':'fs-14'">
                    {{ $t('rodo_declaration') }}
                  </span>
                </template>
              </VCheckbox>

              <VCheckbox
                v-model="stayStore.stokSchoolPaymentRegulationsAccepted"
                density="compact"
                color="info"
                hide-details="auto"
                :class="mobile? 'fs-12':'fs-14'"
                class="mb-2"
              >
                <template #label>
                  <span :class="mobile? 'fs-12':'fs-14'">
                    {{ $t('i_declare_that_i_accept') }}&nbsp;
                  </span>
                  <a :href="configStore.PAYMENT_REGULATIONS_LINK" target="_blank" :class="mobile? 'fs-12':'fs-14'">
                   {{ $t('payment_regulations') }}
                  </a>
                </template>
              </VCheckbox>
            <small v-if="!stayStore.agreementsAcceptedCombined" class="fs-12 fc-error pl-4">
              {{ $t('please_accept_all_required_agreements') }}
            </small>
          </VForm>


          <!--SUMMARY-->
          <div class="mt-8 mb-4 px-1">
            <p
              :class="mobile? 'fs-16':'fs-20'"
              class="fw-600 my-4"
            >
              {{ $t('summary') }}:
            </p>
            <VSheet
              :class="mobile ? 'fs-11 pa-4' : 'fs-14 pa-8'"
              class="bg-dark-gray rounded-lg fc-white"
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
                    {{
                        formatPrice(stayStore.participantClassesTotalPrice(participant.dynamicId) + stayStore.participantInsuranceTotalPrice(participant.dynamicId))
                      }}&nbsp;{{ stayStore.currency }}
                  </span>
                  </div>
                  <VDivider class="mt-1 mb-2"/>
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
                      icon="mdi-information-slab-circle"
                      @click="discountInfoDialog = true"
                      class="mr-1"
                      style="opacity: .4;"
                    />
                    {{ $t('discount') }}
                  </div>
                  <span class="fw-400">
                -&nbsp;{{ stayStore.discountGeneric }}&nbsp;{{ stayStore.currency }}
              </span>
                </div>
                <VDivider class="mt-1 mb-2"/>
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
                    <span>{{ $t('including') }}</span>&nbsp;<span class="text-lowercase">{{
                      $t('aditional_options')
                    }}: </span>
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
              :class="mobile ? 'fs-14' : 'fs-16'"
              class="font-weight-medium "
            >
              {{ $t('participants_preferences') }}:
            </p>
          </div>

        </div>
      </VStepperWindowItem>
    </VStepperWindow>
  </VStepper>


</template>
<style lang="scss">
.agreements-container {
  .v-selection-control__wrapper {
    margin-right: .5rem;
    //margin-bottom: auto;
    //margin-top: 3px;
  }
}

</style>
