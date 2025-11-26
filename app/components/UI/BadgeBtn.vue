<script setup lang="ts">
const props = defineProps({
  show_sign: {
    type: Boolean,
    default: false
  },
  is_active: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    default: '',
    required:true
  },
  number: {
    type: Number ,
    required:false
  },

})
</script>

<template>
<div class="bg-white rounded-lg px-4 py-[10px] border-[#E2E4E9] border  inline-flex leading-[100%]  items-center gap-2 cursor-pointer select-none"
     :class="is_active ? 'border-secondary' : 'bg-white'"
>
  <span v-if="show_sign" class="text-gray-400">#</span>
  <span>{{label}}</span>
  <span v-if="number" class="text-gray-400">{{number}}</span>

</div>
</template>

<style scoped>

</style>