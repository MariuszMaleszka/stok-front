/* eslint-disable unicorn/no-array-for-each */
/* eslint-disable unicorn/no-negated-condition */
import {defineStore} from 'pinia'
import {reactive, ref} from 'vue'
import {useI18n} from "vue-i18n";



export const useStayStore = defineStore('stayStore', () => {
  const {t} = useI18n()


  const dateOfStay = ref(null)
  const adultsNumber = ref(1)
  const childrenNumber = ref(1)

  const participant = {
    name: '', // "Imię"
    participantType: '', // 'adult' or 'child'
    age: null, // required for children (4-16), null for adults
    activityType: '', // 'Narty' or 'Snowboard' - availability depends on age
    skillLevel: '', // 'first-time', 'beginner', 'intermediate', 'advanced'
    availableActivityTypes: [], // computed based on age: ['Narty'] for 4-8, ['Narty', 'Snowboard'] for 8+
    availableLessonTypes: [], // computed: ['group', 'individual'] or ['individual'] if beginner
    showGroupLessons: true, // false if skillLevel is 'first-time' (nowicjusz)
    classLang: 'pl' // 'pl' or 'en'
  }

  const activityTypes = reactive([
    {name: t('ski'), selected: false},
    {name: t('snowboard'), selected: false},
  ])

  const skillLevels_ADULT = reactive([
    {name: t('firstime'), selected: false},
    {name: t('novice'), selected: false},
    {name: t('intermediate'), selected: false},
    {name: t('advanced'), selected: false},
  ])
  const skillLevels_CHILD = reactive([
    {name: t('firstime'), selected: false},
    {name: t('orange_group'), selected: false},
  ])


  // const participantsArray = ref([])

  const addParticipant = () => {
    participantsArray.value.push({...participant})
  }

  const participants = computed(() => {
    const result = []

    // Add adults
    for (let i = 0; i < adultsNumber.value; i++) {
      result.push({
        ...participant,
        participantType: 'adult',
        name: `${t('adult')} ${i + 1}`,
        availableActivityTypes: [t('ski'), t('snowboard')],
        availableLessonTypes: ['group', 'individual'],
        showGroupLessons: true
      })
    }

    // Add children
    for (let i = 0; i < childrenNumber.value; i++) {
      result.push({
        ...participant,
        participantType: 'child',
        name: `${t('child')} ${i + 1}`,
        age: null, // Will be set by user
        availableActivityTypes: [], // Will be computed based on age
        availableLessonTypes: ['group', 'individual'],
        showGroupLessons: true
      })
    }

    return result
  })



    return {
    dateOfStay,
    adultsNumber,
    childrenNumber,
    activityTypes,
    skillLevels_ADULT,
    skillLevels_CHILD,
    // participantsArray,
    addParticipant,
    participants
  }
})
