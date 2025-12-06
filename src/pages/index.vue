<script setup>
import {computed} from 'vue'
import {useDisplay} from 'vuetify'
import {useViewControlStore} from "@/stores/ViewControlStore.js"
import StepOne from "@/components/StepOne.vue"

const viewStore = useViewControlStore()
const {mobile} = useDisplay()

</script>

<template>
  <VContainer max-width="800" class="steps-holder d-flex flex-column flex-1 mt-4" >

    <div
      class="tabs-holder w-100 box-shadow-sm my-1"
    >
      <VTabs
        v-model="viewStore.currentView"
        align-tabs="center"
        density="compact"
        class="tabs-navigation"
        hide-slider
      >
        <VTab
          value="one"
          :aria-label="$t('participants')"
          :class="mobile ? 'pr-0 pl-0 ml-2': 'justify-start'"
          class="fs-11 text-capitalize ls-0 "
        >
          <span class="dot-indicator mr-1">1</span>
          {{ $t('participants') }}
          <VIcon size="20" icon="mdi-chevron-double-right" class="ml-1 my-auto"/>
        </VTab>
        <VTab
          value="two"
          :disabled="!viewStore.isStepOnePreferencesCompleted"
          :aria-label="$t('classes')"
          :class="mobile ? 'pr-0 pl-0': ''"
          class="fs-11 text-capitalize ls-0 "
        >
          <span class="dot-indicator mr-1">2</span>
          {{ $t('classes') }}
          <VIcon size="20" icon="mdi-chevron-double-right" class="ml-1 my-auto"/>
        </VTab>

        <VTab
          value="three"
          :disabled="!viewStore.isStepTwoCompleted"
          :aria-label="$t('details')"
          :class="mobile ? 'pr-0 pl-0 mr-2': 'justify-end'"
          class="fs-11 text-capitalize ls-0 "
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
        value="one"
        class="h-100 flex-1"
        :class="viewStore.currentView === 'one' ? 'd-flex flex-column' : ''"
      >
       <StepOne />
      </VTabsWindowItem>
      <VTabsWindowItem
        value="two"
        class="h-100 flex-1"
        :class="viewStore.currentView === 'two' ? 'd-flex flex-column' : ''"
      >
        <VSheet class="pa-5" color="orange">Two</VSheet>
      </VTabsWindowItem>
      <VTabsWindowItem
        value="three"
        class="h-100 flex-1"
        :class="viewStore.currentView === 'three' ? 'd-flex flex-column' : ''"
      >
        <VSheet class="pa-5" color="brown">Three</VSheet>
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
