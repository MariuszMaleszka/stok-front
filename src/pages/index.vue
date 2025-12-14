<script setup>
  import { computed } from 'vue'
  import { useDisplay } from 'vuetify'
  import StepOne from '@/components/StepOne.vue'
  import StepTwo from '@/components/StepTwo.vue'
  import { useViewControlStore } from '@/stores/ViewControlStore.js'

  const viewStore = useViewControlStore()
  const { mobile } = useDisplay()

</script>

<template>
  <VContainer class="steps-holder d-flex flex-column flex-1 mt-4" max-width="800">

    <div
      class="tabs-holder w-100 box-shadow-sm my-1"
    >
      <VTabs
        v-model="viewStore.currentView"
        align-tabs="center"
        class="tabs-navigation"
        density="compact"
        hide-slider
      >
        <VTab
          :aria-label="$t('participants')"
          class="fs-11 text-capitalize ls-0 "
          :class="mobile ? 'pr-0 pl-0 ml-2': 'justify-start'"
          value="one"
        >
          <span class="dot-indicator mr-1">1</span>
          {{ $t('participants') }}
          <VIcon class="ml-1 my-auto" icon="mdi-chevron-double-right" size="20" />
        </VTab>
        <VTab
          :aria-label="$t('classes')"
          class="fs-11 text-capitalize ls-0 "
          :class="mobile ? 'pr-0 pl-0': ''"
          :disabled="!viewStore.isStepOnePreferencesCompleted"
          value="two"
        >
          <span class="dot-indicator mr-1">2</span>
          {{ $t('classes') }}
          <VIcon class="ml-1 my-auto" icon="mdi-chevron-double-right" size="20" />
        </VTab>

        <VTab
          :aria-label="$t('details')"
          class="fs-11 text-capitalize ls-0 "
          :class="mobile ? 'pr-0 pl-0 mr-2': 'justify-end'"
          :disabled="!viewStore.isStepTwoCompleted"
          value="three"
        >
          <span class="dot-indicator mr-1">3</span>
          {{ $t('details') }}
        </VTab>
      </VTabs>

    </div>

    <VTabsWindow
      v-model="viewStore.currentView"
      class="d-flex flex-column h-100 flex-1"
    >
      <VTabsWindowItem
        class="h-100 flex-1"
        :class="viewStore.currentView === 'one' ? 'd-flex flex-column' : ''"
        value="one"
      >
        <StepOne />
      </VTabsWindowItem>
      <VTabsWindowItem
        class="h-100 flex-1"
        :class="viewStore.currentView === 'two' ? 'd-flex flex-column' : ''"
        value="two"
      >
        <StepTwo />
      </VTabsWindowItem>
      <VTabsWindowItem
        class="h-100 flex-1"
        :class="viewStore.currentView === 'three' ? 'd-flex flex-column' : ''"
        value="three"
      >
        <StepThree />
      </VTabsWindowItem>
    </VTabsWindow>

  </VContainer>
</template>

<style lang="scss">

.tabs-holder {
  margin-inline: auto;
  border-radius: $border-radius;
  background-color: #fff;
  padding-block: .2rem;

  .v-tab.v-tab.v-btn {
    flex: auto;
  }

  .v-tab-item--selected {
    color: $blue;

    .dot-indicator {
      border-color: $blue
    }
  }
}
.tabs-holder-secondary {
  background-color: transparent;
  .v-tab-item--selected {
    color: $blue;
    text-decoration: underline;
  }
}
.steps-holder {
  .v-window__container {
    flex: 1 1 auto;
  }
}

</style>
