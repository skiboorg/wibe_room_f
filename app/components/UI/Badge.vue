<script setup lang="ts">
const props = defineProps({
  label: {
    type: String,
    default: '',
    required:true
  },

})
</script>

<template>
<div class="bg-[#FCEDEA] rounded-lg px-3 py-2 border-[#F9DDD7] border text-secondary text-md">
  <span># {{label}}</span>
</div>
</template>

<style scoped>

</style>