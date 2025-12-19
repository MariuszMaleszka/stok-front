<script setup>
import GreenShieldIcon from "@/assets/shield-check-green.svg";
import YellowShieldIcon from "@/assets/shield-check-yellow.svg";
import OrangeShieldIcon from "@/assets/shield-check-orange.svg";
import TagIcon from "@/assets/tag.svg";
import {useDisplay} from "vuetify";
const props = defineProps({
  color: {
    type: String,
    default: 'yellow',
    validator: (value) => ['yellow', 'green', 'orange'].includes(value)
  },
  showIcon: {
    type: Boolean,
    default: true
  }
});
const {mobile} = useDisplay();
const icon = computed(() => {
  const iconMap = {
    green: GreenShieldIcon,
    yellow: TagIcon,
    orange: OrangeShieldIcon
  };
  return iconMap[props.color];
});

const backgroundColor = computed(() => {
  const bgMap = {
    green: 'bg-green-light',
    yellow: 'bg-yellow-light',
    orange: 'bg-orange-light'
  };
  return bgMap[props.color];
});
</script>

<template>
  <div
    :class="[
    mobile ? 'pa-4 pt-2' : 'px-4 pb-4 py-2',
    'package-card-info',
    'rounded-lg',
    'position-relative',
    backgroundColor
  ]"
  >
    <div class="d-flex justify-end mb-n4 mr-n1">
      <VIcon class="ml-auto" color="grey" icon="mdi-information-slab-circle" />
    </div>
    <VListItem
      class="pa-0 position-relative"
    >
      <template v-if="showIcon" #prepend>
        <img class="mt-1 mr-2" width="18px" :src="icon" alt="">
      </template>
      <div :class="mobile ? 'fs-12' : 'fs-14'">
        <slot />
      </div>

    </VListItem>

  </div>
</template>

<style lang="scss">
.package-card-info {
  &.bg-yellow-light {
    background-color: $bg-yellow-light;
  }

  &.bg-green-light {
    background-color: #F3FAF7;
  }
  &.bg-orange-light{
    background-color: #FEECDC;

  }
  .v-list-item__prepend {
    align-self: flex-start !important;
  }
  .v-list-item__content,
  .v-list-item__prepend {
    margin-top: 8px
  }
}
</style>
