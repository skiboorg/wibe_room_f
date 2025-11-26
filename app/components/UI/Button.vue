<script setup lang="ts">
const props = defineProps({
  variant: {
    type: String as () => 'filled' | 'black'| 'white' | 'outline'| 'outline_black' ,
    default: 'filled'
  },

  size: {
    type: String as () => 'sm' | 'md' ,
    default: 'md'
  },

  label: {
    type: String,
  },
  show_arrow: {
    type: Boolean,
    default: false
  },
  fluid: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  extraClass: {
    type: String,
    default: ''
  },

})


const sizeClasses: Record<string, string> = {
  sm: 'px-5 py-2',
  md: 'px-5 py-3',
}
const variantClasses: Record<string, string> = {
  filled: 'bg-[#E9B458]  font-medium border border-[##4A452]',
  black: 'bg-black text-white  font-medium border border-black',
  white: 'bg-white   font-medium border border-white',
  outline: 'border border-[#C6CAD2]',
  outline_black: 'border border-[#000]',
}

</script>

<template>
  <button class=" cursor-pointer rounded-lg inline-flex items-center justify-center gap-3"
          :class="[
              variantClasses[props.variant],
              sizeClasses[[props.size]],
              extraClass,
              disabled ? 'pointer-events-none opacity-50' : '',
              fluid ? 'w-full': ''
              ]">

    <template v-if="loading">
      <i class="pi pi-spin pi-spinner" style="font-size: 1rem"></i>
    </template>
    <template v-else>
      <svg v-if="show_arrow" width="6" height="11" viewBox="0 0 6 11" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5.61712 0.248959C5.28518 -0.0829864 4.7479 -0.0829864 4.41595 0.248959L0.248959 4.41497C-0.0829864 4.74692 -0.0829864 5.28518 0.248959 5.61712L4.41595 9.78412C4.74781 10.1156 5.28526 10.1156 5.61712 9.78412C5.94907 9.45217 5.94907 8.91391 5.61712 8.58197L2.05267 5.01556L5.61712 1.45013C5.94907 1.11819 5.94907 0.580905 5.61712 0.248959Z" fill="black"/>
      </svg>
      <slot v-if="$slots.icon_left" name="icon_left"/>
      <p v-if="label">{{label}}</p>
      <slot v-if="$slots.icon_right" name="icon_right"/>
    </template>

  </button>
</template>

<style scoped>

</style>