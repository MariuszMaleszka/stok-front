<script setup>
import {computed, ref} from 'vue'
import {useDisplay} from 'vuetify'
import {useViewControlStore} from "@/stores/ViewControlStore.js"
import {useStayStore} from '@/stores/StayStore.js'
import {useI18n} from "vue-i18n"
import {useToast} from "@/composables/useToast.js"

import StepOne from "@/components/StepOne.vue"
import StepTwo from "@/components/StepTwo.vue"
import StepThree from "@/components/StepThree.vue"

const viewStore = useViewControlStore()
const stayStore = useStayStore()
const {showSimpleToast} = useToast()
const {mobile} = useDisplay()
const {t} = useI18n()

const parentStepperRef = ref(null)
const parentActiveStep = ref(1)

const stepOneComponentRef = ref(null)
const stepTwoComponentRef = ref(null)
const stepThreeComponentRef = ref(null)

const handlePrev = () => {
  if (viewStore.currentStep.parent === 3 && viewStore.currentStep.child === 3) {
    stepThreeComponentRef.value.stepThreeNestedRef.prev()
  }
  if (viewStore.currentStep.parent === 3 && viewStore.currentStep.child === 2) {
    stepThreeComponentRef.value.stepThreeNestedRef.prev()
  }
  if (viewStore.currentStep.parent === 3 && viewStore.currentStep.child === 1) {
    viewStore.currentStep = {parent: 2, child: 2} // reset child step to 2 to remain flow
    parentStepperRef.value.prev()
  }
  if (viewStore.currentStep.parent === 2) {
    parentStepperRef.value.prev()
  }
  if (viewStore.currentStep.parent === 1 && viewStore.currentStep.child === 2) {
    stepOneComponentRef.value.stepOneNestedRef.prev()
  }

}

const handleNext = async () => {

  if (viewStore.currentStep.parent === 1 && viewStore.currentStep.child === 1) {
    stepOneComponentRef.value.stepOneNestedRef.next()
  }
  if (viewStore.currentStep.parent === 1 && viewStore.currentStep.child === 2) {
    const isValid = await stepOneComponentRef.value?.validateCurrentStep()
    if (isValid) {
      parentStepperRef.value.next()
    }
    return
  }
  if (viewStore.currentStep.parent === 2) {
    viewStore.currentStep = {parent: 2, child: 1} // reset child step to 1 to remain flow
    parentStepperRef.value.next()
  }
  if (viewStore.currentStep.parent === 3) {
    stepThreeComponentRef.value.stepThreeNestedRef.next()
  }
}


watch(parentActiveStep, (newStep) => {
  viewStore.currentStep.parent = newStep

})
</script>

<template>
  {{ viewStore.currentStep }}
  <VContainer max-width="800" class="d-flex flex-column flex-1 mt-4">
    <VStepper
      ref="parentStepperRef"
      v-model="parentActiveStep"
      class="d-flex flex-column flex-1 rounded-lg"
      flat
      min-height="100%"
    >
      <VStepperHeader>
        <VStepperItem
          :value="1"
          :title="$t('participants')"
          :complete="viewStore.currentStep.parent === 2"
        />
        <v-divider></v-divider>
        <VStepperItem
          :value="2"
          :title="$t('classes')"
        />
        <v-divider></v-divider>
        <VStepperItem
          :value="3"
          :title="$t('details')"
        />
      </VStepperHeader>

      <VStepperWindow class="flex-1">
        <VStepperWindowItem :value="1">
          <StepOne ref="stepOneComponentRef"/>
        </VStepperWindowItem>

        <VStepperWindowItem :value="2">
          <StepTwo ref="stepTwoComponentRef"/>
        </VStepperWindowItem>

        <VStepperWindowItem :value="3">
          <StepThree ref="stepThreeComponentRef"/>
        </VStepperWindowItem>
      </VStepperWindow>

      <template #actions>
        <div class="d-flex justify-space-between">
          <VBtn
            v-if="viewStore.currentStep.parent !== 1 || viewStore.currentStep.child !== 1"
            variant="outlined"
            color="blue"
            class="fs-16 text-capitalize"
            prepend-icon="mdi-arrow-left"
            @click="handlePrev"
          >
            {{ t('previous') }}
          </VBtn>

          <VBtn
            v-if="viewStore.currentStep.parent !== 3 || viewStore.currentStep.child !== 3"
            variant="flat"
            color="blue"
            class="fs-16 text-capitalize px-8 ml-auto"
            :disabled="!stayStore.dateOfStay"
            @click="handleNext"
          >
            {{ t('next') }}
          </VBtn>
          <VBtn
            v-else
            variant="flat"
            color="blue"
            class="fs-16 text-capitalize px-8 ml-auto"
            :disabled="false"
            @click="console.log('Finish clicked')"
          >
            {{ t('finalize') }}
          </VBtn>


        </div>
      </template>
    </VStepper>
  </VContainer>
</template>

<style lang="scss">
.v-stepper {
  background: transparent;

  .v-stepper-window,
  .v-window__container,
  .v-window-item--active {
    display: flex;
    flex-direction: column;
    flex: 1;
  }
  .v-stepper-window {
    margin: 0;

  }
}
</style>
