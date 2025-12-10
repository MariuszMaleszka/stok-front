import { defineStore } from 'pinia'
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'

export const useStayConfigStore = defineStore('stayConfig', () => {
  const { t } = useI18n()

  const activityTypes = reactive([
    { name: t('ski'), selected: false },
    { name: t('snowboard'), selected: false }
  ])

  const skillLevels_ADULTS = reactive([
    {
      name: t('firstime'),
      description: t('firstime_desc'),
      additionalInfo: t('firstime_info'),
      selected: false
    },
    {
      name: t('novice'),
      description: t('novice_desc'),
      additionalInfo: t('novice_info'),
      selected: false
    },
    {
      name: t('intermediate'),
      description: t('intermediate_desc'),
      additionalInfo: t('intermediate_info'),
      selected: false
    },
    {
      name: t('advanced'),
      description: t('advanced_desc'),
      additionalInfo: t('advanced_info'),
      selected: false
    }
  ])

  const skillLevels_CHILDREN_SKI = reactive([
    {
      name: t('orange_group'),
      description: t('orange_group_desc'),
      ageRange: [4, 10],
      additionalInfo: t('orange_group_info'),
      selected: false
    },
    {
      name: t('bronze_group'),
      description: t('bronze_group_desc'),
      ageRange: [6, 10],
      additionalInfo: t('bronze_group_info'),
      selected: false
    },
    {
      name: t('silver_group'),
      description: t('silver_group_desc'),
      ageRange: [7, 14],
      additionalInfo: t('silver_group_info'),
      selected: false
    },
    {
      name: t('gold_group'),
      description: t('gold_group_desc'),
      ageRange: [9, 14],
      additionalInfo: t('gold_group_info'),
      selected: false
    },
    {
      name: t('diamond_group'),
      description: t('diamond_group_desc'),
      ageRange: [10, 14],
      additionalInfo: t('diamond_group_info'),
      selected: false
    }
  ])

  const skillLevels_CHILDREN_SNOWBOARD = reactive([
    {
      name: t('yellow_snowboard'),
      description: t('yellow_snowboard_desc'),
      ageRange: [7, 14],
      additionalInfo: t('yellow_snowboard_info'),
      selected: false
    },
    {
      name: t('wide_snowboard'),
      description: t('wide_snowboard_desc'),
      ageRange: [7, 14],
      additionalInfo: t('wide_snowboard_info'),
      selected: false
    },
    {
      name: t('narrow_snowboard'),
      description: t('narrow_snowboard_desc'),
      ageRange: [7, 14],
      additionalInfo: t('narrow_snowboard_info'),
      selected: false
    }
  ])

  const availableLanguages = reactive([
    { name: t('polish'), selected: true },
    { name: t('english'), selected: false }
  ])

  return {
    activityTypes,
    skillLevels_ADULTS,
    skillLevels_CHILDREN_SKI,
    skillLevels_CHILDREN_SNOWBOARD,
    availableLanguages
  }
})
