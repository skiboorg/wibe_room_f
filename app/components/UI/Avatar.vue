<script setup lang="ts">
const props = defineProps({
  size: {
    type: String as () => 'xs' | 'sm' | 'md' |'lg'|'xl' ,
    default: 'sm'
  },
  image:{
    type: String,
    default: ''
  },
  extraClass: {
    type: String,
    default: ''
  },

})


const sizeClasses: Record<string, string> = {
  xs: 'w-6 h-6',
  sm: 'w-9 h-9',
  md: 'w-10 h-10',
  lg: 'w-[56px] h-[56px]',
  xl: 'w-[72px] h-[72px]',
}
</script>

<template>
  <img  class=" rounded-full object-cover" :class="sizeClasses[props.size]"
        :src="image ? image : '/noavatar.png'"
        alt="">
</template>

<style scoped>

</style>