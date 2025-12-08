<script setup>
import skiLOGO from '@/assets/ski-icon.svg'
import snowboardLOGO from '@/assets/snowboard-icon.svg'
import {useI18n} from "vue-i18n";
import {formatPrice} from "@/utils/numbers.js";
import {useStayStore} from "@/stores/StayStore.js";

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
const expandedPanel = ref(null)
const rules = {
  required: value => !!value || t('fill_the_field_properly'),
}

</script>

<template>
  <VExpansionPanels class="participant-selected-classes-item">
    <VExpansionPanel>
      <VExpansionPanelTitle>
        <div class="d-flex ga-2 fw-600">
          <span>
            {{ index + 1 }}.
          </span>
          <span>
           {{ props.participant.name || '-' }}
          </span>
        </div>
      </VExpansionPanelTitle>
      <VExpansionPanelText class="border-t">
       <VList class="py-0">
         <div
           v-for="(item, idx) in props.participant.selectedClasses"
           :key="idx"
           class="border-b"
         >
           <VListItem
            class="px-0 py-4"
           >
             <template #prepend>
               <img :src="item.classType === 'ski' ? skiLOGO : snowboardLOGO" alt="">
             </template>
             <template #append>
               <span class="mr-2 fs-12 fw-600">
                {{ formatPrice(item.price) }}
               </span>
                <VIcon icon="mdi-close" @click="console.log('delete')"/>
             </template>
             <VListItemTitle class="fs-12 fs-500 text-pre-wrap lh-normal">
              {{ item.title }}
             </VListItemTitle>
             <VListItemSubtitle class="fs-9 fw-500 text-pre-wrap lh-normal">
               {{ item.groupName }}
               {{ item.skillLevel }}
             </VListItemSubtitle>
             <VListItemSubtitle
               class="fs-9 fw-500 "
               v-for="(day, dIdx) in item.dates" :key="dIdx"
             >
               {{ day.date }}
               {{ day.time }}

             </VListItemSubtitle>

           </VListItem>
           <VListItem class="px-0">
             <VExpansionPanels v-model="expandedPanel" flat>
               <VExpansionPanel class="expansion-panel-small">
                 <VExpansionPanelTitle class="pa-0">
                   <div class="d-flex">
                     <span class="fs-10 fw-500">
                       {{ t('add_insurance')}}
                     </span>
                     <span class="fs-10 fw-400">
                      {{ expandedPanel === 0 ? t('collapse') : t('expand') }}
                     </span>

                   </div>
                 </VExpansionPanelTitle>
                 <VExpansionPanelText>
                   {{ item.insurance.description }}
                 </VExpansionPanelText>
               </VExpansionPanel>
             </VExpansionPanels>
           </VListItem>
         </div>

       </VList>
      </VExpansionPanelText>
    </VExpansionPanel>

<!--    <VDialog v-model="infoDialog" max-width="320px">-->
<!--      <VCard v-if="currentSkillLevelInfo">-->
<!--        <VCardTitle>-->
<!--          <div :class="mobile ? 'py-2':''" class="d-flex justify-space-between">-->
<!--            <span :class="mobile ? 'fs-14':'fs-16'">-->
<!--              {{ currentSkillLevelInfo.name }}-->
<!--            </span>-->
<!--            <button class="close-btn" aria-label="Close" @click="infoDialog = false">-->
<!--              <VIcon size="18" icon="mdi-close"/>-->
<!--            </button>-->
<!--          </div>-->
<!--        </VCardTitle>-->
<!--        <VCardText-->
<!--          :class="mobile ? 'pt-0':''"-->
<!--        >-->
<!--          <p :class="mobile ? 'fs-12':'fs-14'">-->
<!--            {{ currentSkillLevelInfo.additionalInfo }}-->
<!--          </p>-->
<!--        </VCardText>-->
<!--        <VCardActions class="border-t d-flex justify-between text-capitalize">-->
<!--          <VBtn variant="flat" class="px-4 text-capitalize" @click="infoDialog = false">-->
<!--            Ok-->
<!--          </VBtn>-->
<!--        </VCardActions>-->
<!--      </VCard>-->
<!--    </VDialog>-->
  </VExpansionPanels>
</template>
<style lang="scss">
.participant-selected-classes-item {
  .v-expansion-panel-text__wrapper {
    padding-inline: 8px;
    padding-block: 0;
  }
  .v-expansion-panel .v-list-item__prepend {
    margin-top: 5px;
    margin-bottom: auto;
  }
}
</style>
