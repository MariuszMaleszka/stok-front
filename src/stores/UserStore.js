/* eslint-disable unicorn/no-array-for-each */
/* eslint-disable unicorn/no-negated-condition */
import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'

export const useUserStore = defineStore('userStore', () => {

  const userDateOfStay = ref(null)

  return {
    userDateOfStay,
  }
})
