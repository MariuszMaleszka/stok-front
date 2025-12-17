<script setup>
  import { computed, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useDisplay } from 'vuetify'
  import StepOne from '@/components/StepOne.vue'
  import StepThree from '@/components/StepThree.vue'
  import StepTwo from '@/components/StepTwo.vue'

  import { useToast } from '@/composables/useToast.js'
  import { useStayStore } from '@/stores/StayStore.js'
  import { useViewControlStore } from '@/stores/ViewControlStore.js'

  const viewStore = useViewControlStore()
  const stayStore = useStayStore()
  const { showSimpleToast } = useToast()
  const { mobile } = useDisplay()
  const { t } = useI18n()

  const parentStepperRef = ref(null)
  const parentActiveStep = ref(1)

  const stepOneComponentRef = ref(null)
  const stepTwoComponentRef = ref(null)
  const stepThreeComponentRef = ref(null)

  function handlePrev () {
    if (viewStore.currentStep.parent === 3 && viewStore.currentStep.child === 3) {
      stepThreeComponentRef.value.stepThreeNestedRef.prev()
    }
    if (viewStore.currentStep.parent === 3 && viewStore.currentStep.child === 2) {
      stepThreeComponentRef.value.stepThreeNestedRef.prev()
    }
    if (viewStore.currentStep.parent === 3 && viewStore.currentStep.child === 1) {
      viewStore.currentStep = { parent: 2, child: 2 } // reset child step to 2 to remain flow
      parentStepperRef.value.prev()
    }
    if (viewStore.currentStep.parent === 2) {
      parentStepperRef.value.prev()
    }
    if (viewStore.currentStep.parent === 1 && viewStore.currentStep.child === 2) {
      stepOneComponentRef.value.stepOneNestedRef.prev()
    }
  }

  async function handleNext () {
    if (viewStore.currentStep.parent === 1 && viewStore.currentStep.child === 1) {
      stepOneComponentRef.value.stepOneNestedRef.next()
    }
    if (viewStore.currentStep.parent === 1 && viewStore.currentStep.child === 2) {
      const isValid = await stepOneComponentRef.value?.validateCurrentStep()
      if (isValid) {
        viewStore.isStepOneCompleted = true
        parentStepperRef.value.next()
      } else {
        viewStore.isStepOneCompleted = false
      }
      return
    }
    if (viewStore.currentStep.parent === 2) {
      viewStore.currentStep = { parent: 2, child: 1 } // reset child step to 1 to remain flow
      parentStepperRef.value.next()
    }
    if (viewStore.currentStep.parent === 3) {
      stepThreeComponentRef.value.stepThreeNestedRef.next()
    }
  }

  watch(parentActiveStep, newStep => {
    viewStore.currentStep.parent = newStep
  })
</script>

<template>
  {{ viewStore.currentStep }}
  <VContainer
    class="d-flex flex-column flex-1 mt-4"
    :class="mobile ? 'px-2': ''"
    max-width="800"
  >
    <VStepper
      ref="parentStepperRef"
      v-model="parentActiveStep"
      class="parent-stepper pa-0 fs-11 d-flex flex-column flex-1 "
      min-height="100%"
    >
      <VStepperHeader
        class="pa-4 box-shadow-sm"
        :class="mobile ? 'px-2 py-4' : ''"
      >
        <VStepperItem
          class="pa-1"
          :complete="viewStore.isStepOneCompleted"
          :title="$t('participants')"
          :value="1"
        />
        <VDivider :style="mobile ? 'max-width: 10px' : ''" />
        <VStepperItem
          class="pa-1"
          :title="$t('classes')"
          :value="2"
        />
        <VDivider :style="mobile ? 'max-width: 10px' : ''" />
        <VStepperItem
          class="pa-1"
          :title="$t('details')"
          :value="3"
        />
      </VStepperHeader>

      <VStepperWindow class="flex-1">
        <VStepperWindowItem :value="1">
          <StepOne ref="stepOneComponentRef" />
        </VStepperWindowItem>

        <VStepperWindowItem :value="2">
          <StepTwo ref="stepTwoComponentRef" />
        </VStepperWindowItem>

        <VStepperWindowItem :value="3">
          <StepThree ref="stepThreeComponentRef" />
        </VStepperWindowItem>
      </VStepperWindow>

      <template #actions>
        <div class="d-flex justify-space-between mt-4 mb-2">
          <VBtn
            v-if="viewStore.currentStep.parent !== 1 || viewStore.currentStep.child !== 1"
            class="fs-16 text-capitalize"
            color="blue"
            prepend-icon="mdi-arrow-left"
            variant="outlined"
            @click="handlePrev"
          >
            {{ t('previous') }}
          </VBtn>

          <VBtn
            v-if="viewStore.currentStep.parent !== 3 || viewStore.currentStep.child !== 3"
            class="fs-16 text-capitalize px-8 ml-auto"
            color="blue"
            :disabled="!stayStore.dateOfStay"
            variant="flat"
            @click="handleNext"
          >
            {{ t('next') }}
          </VBtn>
          <VBtn
            v-else
            class="fs-16 text-capitalize px-8 ml-auto"
            color="blue"
            :disabled="false"
            variant="flat"
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
  box-shadow: none;
  border: none !important;

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

  .v-divider {
    flex: .4
  }

  .v-stepper-item__avatar.v-avatar {
    background: none;
    color: #000;
    border: 1px solid;
    border-color: #000;
  }

}

// Parent stepper
.parent-stepper {
  &:not(.child-stepper) {
    > .v-stepper-header {
      border-radius: $border-radius;
      background: #fff;
      box-shadow: none;

      .v-stepper-item--selected {
        background-color: #EBF5FF;
        border-radius: 24px;
        color: $blue;
        font-weight: 600;

        .v-stepper-item__avatar.v-avatar {
          background-color: $blue;
          color: #fff;
          border-color: $blue;
        }
      }

      .v-stepper-item--complete {
        color: $blue;

        .v-stepper-item__avatar.v-avatar {
          background-color: $blue;
          color: #fff;
          border-color: $blue;
        }
      }
    }
  }
}

.child-stepper {
  .v-stepper-item__avatar.v-avatar {
    border: none;
  }

  .v-stepper-header {
    box-shadow: none;
    justify-content: center;
    column-gap: 10px;
  }

  .v-stepper-item__avatar.v-avatar {
    margin-right: 0 !important;
  }

  .v-stepper-item--selected {
    color: $blue;
    font-weight: 600;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 10px;
      width: 90%;
      height: 1px;
      background-color: $blue;
    }

    .v-stepper-item__avatar.v-avatar,
    .v-stepper-item__avatar.v-avatar > * {
      color: $blue;
    }
  }

  .v-stepper-item--complete {
    color: $blue;

    .v-stepper-item__avatar.v-avatar {
      color: $blue;
      border-color: $blue;
    }
  }
}
</style>
