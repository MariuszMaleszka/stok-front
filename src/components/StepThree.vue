<script setup>
import DatePickerResponsive from "@/components/DatePickerResponsive.vue";
import {useStayStore} from '@/stores/StayStore.js'
import {computed, ref, watch} from "vue";
import {useCookies} from "@vueuse/integrations/useCookies";
import {useToast} from '@/composables/useToast'
import {useViewControlStore} from "@/stores/ViewControlStore.js";
import {useDisplay} from 'vuetify'
import SelectedParticipantClasses from "@/components/SelectedParticipantClasses.vue";
import {useI18n} from "vue-i18n";
import ParticipantAccordion from "@/components/ParticipantAccordion.vue";
import {formatPrice} from "@/utils/numbers.js";

const {showSimpleToast, showActionToast} = useToast()
const stayStore = useStayStore()
const viewStore = useViewControlStore()
const cookies = useCookies(['locale'])
const {mobile} = useDisplay()
const currentLocale = computed(() => cookies.get('locale') || 'pl')
const {t} = useI18n()

// Form refs
const dataForm = ref(null)
const participantForms = ref([])
const stepThreeNestedRef = ref(null)
const activeChildStep = ref(1)

const selectInsurancesForAllCheckbox = ref(false) // input for selecting all
const revealInsurancesForAllInfo = ref(false) // to reveal info sections for all


const classesTotalPrice = computed(() => {
  let total = 0
  stayStore.participantClassesTotalPrice.value.forEach(price => {
    total += price
  })
  return total
})


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
        <div>
          <p
            class="fs-24 font-weight-bold my-4"
          >
            {{ $t('cart') }}
          </p>
          <div class="my-4">
            <p
              :class="mobile ? 'fs-14' : 'fs-16'"
              class="font-weight-medium mb-n2"
            >
              {{ $t('cart_subtitle') }}
            </p>
          </div>
          <div
            :class="mobile ? 'fs-18' : 'fs-20'"
            class="mb-4 mt-8"
          >
            <p>{{ $t('selected_classes') }}:</p>
          </div>
          <div class="d-flex flex-column ga-4 pa-1">
            <SelectedParticipantClasses
              v-for="(participant, index) in stayStore.participants"
              :key="index"
              :ref="el => participantForms[index] = el"
              class="ga-4"
              :index="index"
              :participant="participant"
            />
          </div>

        </div>
        <div class="my-4 px-1">
          <p :class="mobile? 'fs-16':'fs-20'">
            {{ $t('aditional_options') }}:
          </p>
          <VSheet class="rounded bg-light-gray mt-2 mb-4">
            <div
              :class="mobile ? 'px-0': 'px-4'"
              class="pt-0 rounded d-flex align-center justify-between"
            >
              <VCheckbox
                density="compact"
                v-model="selectInsurancesForAllCheckbox"
                hide-details
                color="info"
              />
              <div
                :class="mobile ? 'fs-10': 'fs-14'"
                class="fw-400 d-flex align-center ml-2"
              >
                <div class="d-flex flex-column py-2">

                  <p class="ma-1 lh-normal">

                  {{ t('insurance_for_all_option') }}
                  </p>


                  <VBtn
                    :class="mobile ? 'fs-10': 'fs-14'"
                    class="text-capitalize w-max-content px-1"
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
                class="d-flex flex-column align-end ml-auto ma-0 fc-gray"
              >
                  <span class="fw-500">
                    +&nbsp;{{ formatPrice(stayStore.sumInsurances) }}
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
                <VCardText class="pl-8 pt-0">
                  <p :class="mobile ? 'fs-10' : 'fs-12'">
                    Lorem
                  </p>

<!--                  <div-->
<!--                    :class="mobile ? 'fs-10' : 'fs-12'"-->
<!--                    class="custom-badge gray mt-4"-->
<!--                    @click="openInsuranceDialog(item.insurance)"-->
<!--                  >-->
<!--                    <VIcon class="mr-1" color="grey" icon="mdi-information-slab-circle"/>-->
<!--                    {{ $t('aditional_info') }}-->
<!--                  </div>-->
                </VCardText>
              </VCard>
            </VExpandTransition>
          </VSheet>
        </div>
      </VStepperWindowItem>

      <VStepperWindowItem :value="2">
        <div>
          <p class="fs-24 font-weight-bold my-4">
            {{ $t('participants_data') }}:
          </p>
          <div class="my-4">
            <p
              :class="mobile ? 'fs-18' : 'fs-20'"
              class="font-weight-medium "
            >
              {{ $t('participants_preferences') }}:
            </p>
            <p
              :class="mobile ? 'fs-14' : 'fs-16'"
              class="fs-11"
            >
              {{ $t('enter_preferences_details') }}
            </p>
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
