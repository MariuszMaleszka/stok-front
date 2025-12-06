/* eslint-disable unicorn/no-array-for-each */
/* eslint-disable unicorn/no-negated-condition */
import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'

export const useStayStore = defineStore('stayStore', () => {

  const dateOfStay = ref(null)
  const adultsNumber = ref(1)
  const childrenNumber = ref(1)


  return {
    dateOfStay,
    adultsNumber,
    childrenNumber

  }
})
