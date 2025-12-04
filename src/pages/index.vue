<script setup>
import {computed} from 'vue'
import {useDisplay} from 'vuetify'
import {useUserStore} from '@/stores/UserStore.js'
import DatePickerResponsive from "@/components/DatePickerResponsive.vue";
import {useI18n} from 'vue-i18n'
import {useCookies} from "@vueuse/integrations/useCookies";

const userStore = useUserStore()
const {locale} = useI18n()
const {mobile} = useDisplay()
const cookies = useCookies(['locale'])
const currentLocale = computed(() => cookies.get('locale') || 'pl')


const tab = ref('one')


</script>

<template>
  <VContainer max-width="1200" fluid>
    <h1>{{ $t('hello') }}</h1>

    <div
      :class="mobile ? 'w-100' : 'w-fit-content'"
      class="tabs-holder"
    >
      <VTabs
        v-model="tab"
        align-tabs="center"
        class="tabs-navigation"
        hide-slider
      >
        <VTab
          value="one"
          :class="mobile ? 'px-2': ''"
          class="fs-11 text-capitalize ls-0 pr-0 pl-0"
        >
          <span class="dot-indicator mr-1">1</span>
          {{ $t('participants') }}
        </VTab>
        <VIcon size="18" icon="mdi-chevron-double-right" class="mx-0 my-auto"/>
        <VTab
          value="two"
          :class="mobile ? 'px-2': ''"
          class="fs-11 text-capitalize ls-0 pr-0 pl-0"
        >
          <span class="dot-indicator mr-1">2</span>
          {{ $t('classes') }}
        </VTab>
        <VIcon size="18" icon="mdi-chevron-double-right" class="mx-0 my-auto"/>

        <VTab
          value="three"
          :class="mobile ? 'px-2': ''"
          class="fs-11 text-capitalize ls-0 pr-0 pl-0"
        >
          <span class="dot-indicator mr-1">3</span>
          {{ $t('details') }}
        </VTab>
      </VTabs>
    </div>

    <VTabsWindow v-model="tab">
      <VTabsWindowItem value="one">
        <VSheet class="pa-5">
          <p>
            {{ $t('booking_classes') }}:
          </p>
          <p>
            {{ $t('provide_details_of_your_stay') }}:
          </p>
         <p>

          <small>
            {{ $t('select_day_or_period_of_stay') }}
          </small>
         </p>

          <DatePickerResponsive
            v-model="userStore.userDateOfStay"
            :locale="currentLocale"
          />
        </VSheet>
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
  //width: fit-content;
  margin-inline: auto;
  border: 1px solid;
  border-radius: $border-radius;
  background-color: #fff;
  .v-tab.v-tab.v-btn {
    min-width: unset;
    flex: 1;
    //width: unset;
    //margin: auto;
  }
  .v-tab-item--selected {
    color: $blue;

    .dot-indicator {
      border-color: $blue
    }
  }
}

</style>
