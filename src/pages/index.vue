<script setup>
import {computed} from 'vue'
import {useDisplay} from 'vuetify'
import {useViewControlStore} from "@/stores/ViewControlStore.js"
import StepOne from "@/components/StepOne.vue"

const viewStore = useViewControlStore()
const {mobile} = useDisplay()

</script>

<template>
  <VContainer max-width="800" class="d-flex flex-column flex-1" >
    <h1>{{ $t('hello') }}</h1>

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
      class="h-100 flex-1"
    >
      <VTabsWindowItem value="one" class="h-100 flex-1">
       <StepOne />
      </VTabsWindowItem>
      <VTabsWindowItem value="two">
        <VSheet class="pa-5" color="orange">Two</VSheet>
      </VTabsWindowItem>
      <VTabsWindowItem value="three">
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

</style>
