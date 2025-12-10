<script setup>
import skiLOGO from '@/assets/ski-icon.svg'
import snowboardLOGO from '@/assets/snowboard-icon.svg'
import {useI18n} from "vue-i18n";
import {formatPrice} from "@/utils/numbers.js";
import {useStayStore} from "@/stores/StayStore.js";
import {useDisplay} from 'vuetify';
import PopupSmall from "@/components/modals/PopupSmall.vue";
import InsuranceIMG from '@/assets/insurance_img.png'
import PackageInfoBox from '@/components/PackageInfoBox.vue'

const props = defineProps({
  participant: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    required: true
  }
})

const {t} = useI18n()
const {mobile} = useDisplay()
const stayStore = useStayStore()
const expandedPanels = ref({})
const panel = ref([0])// Expansion panel state (main)

const insuranceSelected = ref({}) // Holds the insurance selection state
const insuranceInfoDialog = ref(false) // Controls the insurance info dialog visibility
const additionalInsuranceSelected = ref(false) // Insurance for all option
const additionalInsuranceExpanded = ref(false) // Controls the expansion of insurance for all details

const currentInsurance = ref(null) // Holds the insurance info to display

const classToDelete = ref(null) // Holds the class selected for deletion
const confirmClassDeletationDialog = ref(false) // Controls the confirmation dialog visibility

const openInsuranceDialog = (insurance) => {
  currentInsurance.value = insurance
  insuranceInfoDialog.value = true
}
// Delete class
const deleteClass = (dynamicId) => {
  const item = props.participant.selectedClasses.find(c => c.dynamicId === dynamicId)
  if (item) {
    classToDelete.value = item
    confirmClassDeletationDialog.value = true
  }
}
// Confirm deletion
const confirmDeleteClass = () => {
  if (classToDelete.value) {
    const index = props.participant.selectedClasses.findIndex(
      c => c.dynamicId === classToDelete.value.dynamicId
    )
    if (index !== -1) {
      props.participant.selectedClasses.splice(index, 1)
    }
    classToDelete.value = null
  }
  confirmClassDeletationDialog.value = false
}
// Cancel deletion
const cancelDelete = () => {
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
          <VList density="compact" class="py-0">
            <div
              v-for="item in props.participant.selectedClasses"
              :key="item.dynamicId"
              class="border-b"
            >
              <div
                :class="mobile ? 'px-0': 'px-4'"
                class="py-4 pb-0 d-flex justify-between"
              >
                <img class="mb-auto" width="28px" :src="item.classType === 'ski' ? skiLOGO : snowboardLOGO" alt="">

                <div class="d-flex flex-column ml-2 flex-1">
                  <p
                    v-if="item.title"
                    :class="mobile ? 'fs-12 ': 'fs-14'"
                    class="fs-500 text-pre-wrap lh-normal"
                  >
                    {{ item.title }}
                  </p>

                  <div
                    :class="mobile ? 'fs-9 ': 'fs-12'"
                    class="d-flex flex-column fw-500 text-pre-wrap lh-normal fc-gray mt-1"
                  >
                    <div class="d-flex align-center">
                      <p v-if="item.groupName" class="fc-gray">
                        &#8226; <span class="ml-1">{{ item.groupName }},</span>
                      </p>
                      <p v-if="item.skillLevel" class="fc-gray">
                        &#8226;<span class="ml-1">{{ item.skillLevel }}</span>
                      </p>
                    </div>
                    <div
                      :class="mobile ? 'fs-9 ': 'fs-12'"
                      class="d-flex align-center"
                      v-for="(day, dIdx) in item.dates" :key="dIdx"
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
                  :class="mobile ? 'fs-12 ': 'fs-14'"
                  class="mr-2 fw-600"
                >
                  {{ formatPrice(item.price) }}
                </span>
                  <VIcon size="small" color="grey" icon="mdi-close" @click="deleteClass(item.dynamicId)"/>
                </div>
              </div>

              <VSheet class="rounded bg-light-gray mt-2 mb-4">
                <div
                  :class="mobile ? 'px-0': 'px-4'"
                  class="pt-0 rounded d-flex align-center justify-between"
                >
                  <VCheckbox
                    density="compact"
                    v-model="insuranceSelected[item.dynamicId]"
                    hide-details
                    color="info"
                  />
                  <div
                    :class="mobile ? 'fs-10': 'fs-14'"
                    class="fw-400 d-flex align-center ml-2"
                  >
                    {{ t('add_insurance') }}

                    <VBtn
                      :class="mobile ? 'fs-10': 'fs-14'"
                      class="ma-2 text-capitalize px-2"
                      variant="text"
                      size="small"
                      flat
                      color="grey"
                      @click="expandedPanels[item.dynamicId] = !expandedPanels[item.dynamicId]"
                    >
                      {{ expandedPanels[item.dynamicId] ? t('collapse') : t('expand') }}
                      <VIcon :icon="expandedPanels[item.dynamicId] ? 'mdi-chevron-up' : 'mdi-chevron-down'"/>
                    </VBtn>
                  </div>

                  <div
                    :class="mobile ? 'fs-11 ': 'fs-14'"
                    class="d-flex flex-column align-end ml-auto ma-0 fc-gray"
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
                    width="100%"
                    flat
                    style="background-color: transparent;"
                  >
                    <VCardText class="px-8 pt-0">
                      <p :class="mobile ? 'fs-10' : 'fs-12'">
                        {{ item.insurance.description }}
                      </p>

                      <div
                        :class="mobile ? 'fs-10' : 'fs-12'"
                        class="custom-badge gray mt-4"
                        @click="openInsuranceDialog(item.insurance)"
                      >
                        <VIcon class="mr-1" color="grey" icon="mdi-information-slab-circle"/>
                        {{ $t('aditional_info') }}
                      </div>
                    </VCardText>
                  </VCard>
                </VExpandTransition>
              </VSheet>
            </div>
          </VList>
          <!--INFO BOX-->
          <PackageInfoBox class="my-4" color="yellow">
            <span class="fw-500">11 / 10h w pakiecie.</span>
            <p class="mb-2">Aktywowano niższy pakiet cenowy <span>-100,00zł</span></p>
            <div :class="mobile? 'fs-10':'fs-12'" class="custom-badge info">
              Oszczędzasz -10%
            </div>
          </PackageInfoBox>
          <!--INFO BOX-->
          <PackageInfoBox class="my-4" color="green" :showIcon="false">
            <div class="d-flex justify-space-between mb-2">
              <p class="fw-500">Brakuje Ci 2h zajęć, by aktywować tańszy pakiet cenowy.</p>
              <VBtn
                variant="outlined"
                color="green"
                :class="mobile? 'fs-12':'fs-14'"
                class="text-capitalize pa-2 mt-4 mb-2 ml-2"
              >
                {{ $t('add_classes') }}
              </VBtn>
            </div>
            <div :class="mobile ? 'fs-10' : 'fs-12'" class="custom-badge green">
              {{ $t('you_gain') }}-10%
            </div>
          </PackageInfoBox>
          <!--INFO BOX-->
          <PackageInfoBox class="my-4" color="orange" >
            <span class="fw-500">11 / 10h w pakiecie.</span>
            <p class="mb-2">Aktywowano niższy pakiet cenowy <span>-200,00zł</span></p>
            <div :class="mobile? 'fs-10':'fs-12'" class="custom-badge orange">
              {{ $t('you_save') }} -20%
            </div>
          </PackageInfoBox>

          <VSheet
            class="participant-selected-classes-summary rounded-lg bg-gray-primary pa-4"
          >
            <p class="text-right ml-auto">
            <span :class="mobile ? 'fs-12 ': 'fs-14'" class="fw-600">
              {{ $t('total') }}
            </span>
              <span class="fw-500 ml-2" >
             {{ formatPrice(stayStore.participantClassesTotalPrice.get(participant.dynamicId)) }}&nbsp;{{ stayStore.currency }}
            </span>
            </p>
          </VSheet>

        </VExpansionPanelText>
      </VExpansionPanel>
    </VExpansionPanels>

    <!--ADITIONAL OPTIONS-->
    <!--ADITIONAL OPTIONS-->
    <div class="aditional-options w-100">
      <p :class="mobile ? 'fs-16' : 'fs-20'" class="fc-smoked fw-500 my-4">
        {{ $t('aditional_options') }}:
      </p>
      <VSheet class="rounded bg-light-gray mt-2 mb-4">
        <div
          :class="mobile ? 'px-0': 'px-4'"
          class="pt-0 rounded d-flex align-center justify-between"
        >
          <VCheckbox
            v-model="additionalInsuranceSelected"
            density="compact"
            hide-details
            color="info"
            class="mb-auto"
          />
          <div
            :class="mobile ? 'fs-10': 'fs-14'"
            class="fw-400 d-flex flex-column align-center ml-2"
          >
            <p class="mt-2">
              {{ t('insurance_for_all_option') }}
            </p>

            <VBtn
              :class="mobile ? 'fs-10': 'fs-14'"
              class="text-capitalize px-0 mr-auto"
              variant="text"
              size="small"
              flat
              color="grey"
              @click="additionalInsuranceExpanded = !additionalInsuranceExpanded"
            >
              {{ additionalInsuranceExpanded ? t('collapse') : t('expand') }}
              <VIcon :icon="additionalInsuranceExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down'"/>
            </VBtn>
          </div>

          <div
            :class="mobile ? 'fs-11 ': 'fs-14'"
            class="d-flex flex-column align-end ml-auto fc-gray mb-auto mt-2"
          >
            <span class="fw-500">
              -&nbsp;{{ formatPrice(stayStore.insuranceForAllCost) }}&nbsp;{{ stayStore.currency }}
            </span>
          </div>
        </div>

        <VExpandTransition>
          <VCard
            v-show="additionalInsuranceExpanded"
            width="100%"
            flat
            style="background-color: transparent;"
          >
            <VCardText class="px-8">
              <p :class="mobile ? 'fs-10' : 'fs-12'">
                <!-- Add insurance description here -->
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Cum cupiditate ipsa ipsum laborum libero tempore ut voluptatem? Dolorem ex libero maiores necessitatibus quaerat. Adipisci, culpa doloribus illum odit quod tempore.
              </p>

              <div
                :class="mobile ? 'fs-10' : 'fs-12'"
                class="custom-badge gray mt-4"
              >
                <VIcon class="mr-1" color="grey" icon="mdi-information-slab-circle"/>
                {{ $t('aditional_info') }}
              </div>
            </VCardText>
          </VCard>
        </VExpandTransition>
      </VSheet>
    </div>

    <!--POPUPS-->
    <PopupSmall
      v-model="insuranceInfoDialog"
      :title="currentInsurance?.title || t('insurance_details')"
      max-width="500px"
    >
      <template #content>
        <img :src="InsuranceIMG" alt="Insurance" class="w-100 mb-4">
        <p>{{ currentInsurance?.description }}</p>
      </template>
      <template #actions>
        <VBtn variant="outlined" @click="insuranceInfoDialog = false">
          Ok
        </VBtn>
        <VBtn
          variant="flat"
          color="blue"
          class="text-capitalize px-4"
          @click="console.log('see more')"
        >
          {{ $t('see_more') }}
        </VBtn>
      </template>
    </PopupSmall>

    <PopupSmall
      v-model="confirmClassDeletationDialog"
      :title="t('delete_class_confirmation')"
      max-width="500px"
    >
      <template #content>
        <div
          v-if="classToDelete"
        >
          <div class="d-flex justify-between">
            <img class="mb-auto" width="28px" :src="classToDelete.classType === 'ski' ? skiLOGO : snowboardLOGO" alt="">

            <div class="d-flex flex-column ml-2 flex-1">
              <p
                :class="mobile ? 'fs-12 ': 'fs-14'"
                class="fs-500 text-pre-wrap lh-normal"
              >
                {{ classToDelete.title }}
              </p>

              <div
                :class="mobile ? 'fs-9 ': 'fs-12'"
                class="d-flex flex-column fw-500 text-pre-wrap lh-normal fc-gray mt-1"
              >
                <div class="d-flex align-center">
                  <p v-if="classToDelete.groupName" class="fc-gray">
                    &#8226; <span class="ml-1">{{ classToDelete.groupName }},</span>
                  </p>
                  <p v-if="classToDelete.skillLevel" class="fc-gray">
                    &#8226;<span class="ml-1">{{ classToDelete.skillLevel }}</span>
                  </p>
                </div>
                <div
                  :class="mobile ? 'fs-9 ': 'fs-12'"
                  class="d-flex align-center"
                  v-for="(day, dIdx) in classToDelete.dates" :key="dIdx"
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
                :class="mobile ? 'fs-12 ': 'fs-14'"
                class="fw-600"
              >
                {{ formatPrice(classToDelete.price) }}
              </span>
            </div>
          </div>
        </div>
      </template>
      <template #actions>
        <VBtn variant="outlined" class="text-capitalize" @click="cancelDelete">
          {{ $t('cancel') }}
        </VBtn>
        <VBtn
          variant="flat"
          color="red"
          class="text-capitalize px-4"
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
