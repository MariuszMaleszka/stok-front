<script setup>
  import { useI18n } from 'vue-i18n'
  import { useDisplay } from 'vuetify'
  import InsuranceIMG from '@/assets/insurance_img.png'
  import GreenShield from '@/assets/shield-check-green.svg'
  import skiLOGO from '@/assets/ski-icon.svg'
  import snowboardLOGO from '@/assets/snowboard-icon.svg'
  import PopupSmall from '@/components/modals/PopupSmall.vue'
  import { useStayStore } from '@/stores/StayStore.js'
  import { formatPrice } from '@/utils/numbers.js'

  const props = defineProps({
    participant: {
      type: Object,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
  })

  const { t } = useI18n()
  const { mobile } = useDisplay()
  const stayStore = useStayStore()
  const expandedPanels = ref({})
  const panel = ref([0])// Expansion panel state (main)

  // const insuranceSelected = ref({}) // Holds the insurance selection state
  const insuranceInfoDialog = ref(false) // Controls the insurance info dialog visibility
  const currentInsurance = ref(null) // Holds the insurance info to display

  const classToDelete = ref(null) // Holds the class selected for deletion
  const confirmClassDeletationDialog = ref(false) // Controls the confirmation dialog visibility

  function openInsuranceDialog (insurance) {
    currentInsurance.value = insurance
    insuranceInfoDialog.value = true
  }
  // Delete class
  function deleteClass (dynamicId) {
    const item = props.participant.selectedClasses.find(c => c.dynamicId === dynamicId)
    if (item) {
      classToDelete.value = item
      confirmClassDeletationDialog.value = true
    }
  }
  // Confirm deletion
  function confirmDeleteClass () {
    if (classToDelete.value) {
      const index = props.participant.selectedClasses.findIndex(
        c => c.dynamicId === classToDelete.value.dynamicId,
      )
      if (index !== -1) {
        props.participant.selectedClasses.splice(index, 1)
      }
      classToDelete.value = null
    }
    confirmClassDeletationDialog.value = false
  }
  // Cancel deletion
  function cancelDelete () {
    classToDelete.value = null
    confirmClassDeletationDialog.value = false
  }

</script>

<template>
  <div>
    <VExpansionPanels v-model="panel" class="participant-selected-classes-item">
      <VExpansionPanel>
        <VExpansionPanelTitle>
          <div class="d-flex ga-2 fw-600">
            <span>{{ index + 1 }}.</span>
            <span>{{ props.participant.name || '-' }}</span>
          </div>
        </VExpansionPanelTitle>
        <VExpansionPanelText class="border-t">
          <VList class="py-0" density="compact">
            <div
              v-for="item in props.participant.selectedClasses"
              :key="item.dynamicId"
            >
              <div
                class="py-4 pb-0 d-flex justify-between"
                :class="mobile ? 'px-0': 'px-4'"
              >
                <img alt="" class="mb-auto" :src="item.classType === 'ski' ? skiLOGO : snowboardLOGO" width="28px">

                <div class="d-flex flex-column ml-2 flex-1">
                  <p
                    v-if="item.title"
                    class="fs-500 text-pre-wrap lh-normal"
                    :class="mobile ? 'fs-12 ': 'fs-14'"
                  >
                    {{ item.title }}
                  </p>

                  <div
                    class="d-flex flex-column fw-500 text-pre-wrap lh-normal fc-gray mt-1"
                    :class="mobile ? 'fs-9 ': 'fs-12'"
                  >
                    <div class="d-flex align-center">
                      <p v-if="item.groupName" class="fc-gray">
                        &#8226; <span>{{ item.groupName }},</span>
                      </p>
                      <p v-if="item.skillLevel" class="fc-gray">
                        &#8226;<span class="ml-1">{{ item.skillLevel }}</span>
                      </p>
                    </div>
                    <div
                      v-for="(day, dIdx) in item.dates"
                      :key="dIdx"
                      class="d-flex align-center"
                      :class="mobile ? 'fs-9 ': 'fs-12'"
                    >
                      <p v-if="day.date">
                        &#8226;<span class="ml-1">{{ day.date }}</span>
                      </p>
                      <p v-if="day.time">
                        &#8226;<span class="ml-1">{{ day.time }}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div class="d-flex align-center">
                  <span
                    class="mr-2 fw-600"
                    :class="mobile ? 'fs-12 ': 'fs-14'"
                  >
                    {{ formatPrice(item.price) }}&nbsp;{{ stayStore.currency }}
                  </span>
                  <VIcon color="grey" icon="mdi-close" size="18" @click="deleteClass(item.dynamicId)" />
                </div>
              </div>

              <VSheet
                v-if="participant.participantType === 'child' && item.type === 'group'"
                class="rounded mt-2 mb-4 bg-light-green"
              >
                <div
                  class="pt-0 rounded d-flex align-center justify-between"
                  :class="mobile ? 'px-0': 'px-4'"
                >
                  <img alt="shield" :src="GreenShield" width="16px">

                  <div
                    class="fw-400 d-flex align-center ml-2"
                    :class="mobile ? 'fs-10': 'fs-14'"
                  >
                    {{ t('insurance_included') }}

                    <VBtn
                      class="ma-2 text-capitalize px-2"
                      :class="mobile ? 'fs-10': 'fs-14'"
                      color="grey"
                      flat
                      size="small"
                      variant="text"
                      @click="expandedPanels[item.dynamicId] = !expandedPanels[item.dynamicId]"
                    >
                      {{ expandedPanels[item.dynamicId] ? t('collapse') : t('expand') }}
                      <VIcon :icon="expandedPanels[item.dynamicId] ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
                    </VBtn>
                  </div>

                </div>

                <VExpandTransition>
                  <VCard
                    v-show="expandedPanels[item.dynamicId]"
                    flat
                    style="background-color: transparent;"
                    width="100%"
                  >
                    <VCardText class="px-8 pt-0">
                      <p :class="mobile ? 'fs-10' : 'fs-12'">
                        {{ item.insurance.description }}
                      </p>

                      <div
                        class="custom-badge gray mt-4"
                        :class="mobile ? 'fs-10' : 'fs-12'"
                        @click="openInsuranceDialog(item.insurance)"
                      >
                        <VIcon class="mr-1" color="grey" icon="mdi-information-slab-circle" />
                        {{ $t('aditional_info') }}
                      </div>
                    </VCardText>
                  </VCard>
                </VExpandTransition>
              </VSheet>

              <VSheet
                v-else
                class="rounded bg-light-gray mt-2 mb-4"
              >
                <div
                  class="pt-0 rounded d-flex align-center justify-between"
                  :class="mobile ? 'px-0': 'px-4'"
                >
                  <VCheckbox
                    v-model="item.insurance.enabled"
                    color="info"
                    density="compact"
                    hide-details
                  />
                  <div
                    class="fw-400 d-flex align-center ml-2"
                    :class="mobile ? 'fs-10': 'fs-14'"
                  >
                    {{ t('add_insurance') }}

                    <VBtn
                      class="ma-2 text-capitalize px-2"
                      :class="mobile ? 'fs-10': 'fs-14'"
                      color="grey"
                      flat
                      size="small"
                      variant="text"
                      @click="expandedPanels[item.dynamicId] = !expandedPanels[item.dynamicId]"
                    >
                      {{ expandedPanels[item.dynamicId] ? t('collapse') : t('expand') }}
                      <VIcon :icon="expandedPanels[item.dynamicId] ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
                    </VBtn>
                  </div>

                  <div
                    class="d-flex flex-column align-end ml-auto ma-0 fc-gray"
                    :class="mobile ? 'fs-11 ': 'fs-14'"
                  >
                    <span class="fw-500">
                      + {{ formatPrice(item.insurance.price) }}
                    </span>
                    <span class="fw-400 mt-n1 text-no-wrap">
                      {{ item.insurance.perDay ? ` ( 1 ${t('day')})` : '' }}
                    </span>
                  </div>
                </div>

                <VExpandTransition>
                  <VCard
                    v-show="expandedPanels[item.dynamicId]"
                    flat
                    style="background-color: transparent;"
                    width="100%"
                  >
                    <VCardText class="px-8 pt-0">
                      <p :class="mobile ? 'fs-10' : 'fs-12'">
                        {{ item.insurance.description }}
                      </p>

                      <div
                        class="custom-badge gray mt-4"
                        :class="mobile ? 'fs-10' : 'fs-12'"
                        @click="openInsuranceDialog(item.insurance)"
                      >
                        <VIcon class="mr-1" color="grey" icon="mdi-information-slab-circle" />
                        {{ $t('aditional_info') }}
                      </div>
                    </VCardText>
                  </VCard>
                </VExpandTransition>
              </VSheet>

            </div>
          </VList>

          <VSheet
            class="participant-selected-classes-summary rounded-lg bg-gray-primary pa-4"
          >
            <p class="text-right ml-auto">
              <span class="fw-600" :class="mobile ? 'fs-12 ': 'fs-14'">
                {{ $t('total') }}
              </span>
              <span class="fw-500 ml-2" :class="mobile ? 'fs-14 ': 'fs-16'">
                {{ formatPrice(stayStore.participantClassesTotalPrice(participant.dynamicId) + stayStore.participantInsuranceTotalPrice(participant.dynamicId)) }}&nbsp;{{ stayStore.currency }}
                <br>
                <p v-if="stayStore.participantInsuranceTotalPrice(participant.dynamicId) > 0" class="fs-10 mt-n1">
                  {{ $t('including') }}
                  {{ formatPrice(stayStore.participantInsuranceTotalPrice(participant.dynamicId)) }}&nbsp;{{ stayStore.currency }}
                  {{ $t('insurance') }}
                </p>
              </span>
            </p>
          </VSheet>

        </VExpansionPanelText>
      </VExpansionPanel>
    </VExpansionPanels>

    <!--POPUPS-->
    <PopupSmall
      v-model="insuranceInfoDialog"
      max-width="500px"
      :title="currentInsurance?.title || t('insurance_details')"
    >
      <template #content>
        <img alt="Insurance" class="w-100 mb-4" :src="InsuranceIMG">
        <p>{{ currentInsurance?.description }}</p>
      </template>
      <template #actions>
        <VBtn variant="outlined" @click="insuranceInfoDialog = false">
          Ok
        </VBtn>
        <VBtn
          class="text-capitalize px-4"
          color="blue"
          variant="flat"
          @click="console.log('see more')"
        >
          {{ $t('see_more') }}
        </VBtn>
      </template>
    </PopupSmall>

    <PopupSmall
      v-model="confirmClassDeletationDialog"
      max-width="500px"
      :title="t('delete_class_confirmation')"
    >
      <template #content>
        <div
          v-if="classToDelete"
        >
          <div class="d-flex justify-between">
            <img alt="" class="mb-auto" :src="classToDelete.classType === 'ski' ? skiLOGO : snowboardLOGO" width="28px">

            <div class="d-flex flex-column ml-2 flex-1">
              <p
                class="fs-500 text-pre-wrap lh-normal"
                :class="mobile ? 'fs-12 ': 'fs-14'"
              >
                {{ classToDelete.title }}
              </p>

              <div
                class="d-flex flex-column fw-500 text-pre-wrap lh-normal fc-gray mt-1"
                :class="mobile ? 'fs-9 ': 'fs-12'"
              >
                <div class="d-flex align-center">
                  <p v-if="classToDelete.groupName" class="fc-gray">
                    &#8226; <span>{{ classToDelete.groupName }},</span>
                  </p>
                  <p v-if="classToDelete.skillLevel" class="fc-gray">
                    &#8226;<span class="ml-1">{{ classToDelete.skillLevel }}</span>
                  </p>
                </div>
                <div
                  v-for="(day, dIdx) in classToDelete.dates"
                  :key="dIdx"
                  class="d-flex align-center"
                  :class="mobile ? 'fs-9 ': 'fs-12'"
                >
                  <p v-if="day.date">
                    &#8226;<span class="ml-1">{{ day.date }}</span>
                  </p>
                  <p v-if="day.time">
                    &#8226;<span class="ml-1">{{ day.time }}</span>
                  </p>
                </div>
              </div>
            </div>

            <div class="d-flex align-center">
              <span
                class="fw-600"
                :class="mobile ? 'fs-12 ': 'fs-14'"
              >
                {{ formatPrice(classToDelete.price) }}&nbsp;{{ stayStore.currency }}
              </span>
            </div>
          </div>
        </div>
      </template>
      <template #actions>
        <VBtn class="text-capitalize" variant="outlined" @click="cancelDelete">
          {{ $t('cancel') }}
        </VBtn>
        <VBtn
          class="text-capitalize px-4"
          color="red"
          variant="flat"
          @click="confirmDeleteClass"
        >
          {{ $t('delete') }}
        </VBtn>
      </template>
    </PopupSmall>
  </div>

</template>
<style lang="scss">
.participant-selected-classes-item {
  .v-expansion-panel-text__wrapper {
    @media(max-width: 600px) {
      padding-left: 12px ;
      padding-right: 12px ;
    }
  }
}
</style>
