<script setup lang="ts">
definePageMeta({
  guest: true,
  layout: 'auth'
})
const show_form = ref('login')

const on_change_form = (form) => {
  show_form.value = form
}
</script>

<template>
  <UIButton show_arrow variant="outline" label="О проекте"/>
  <div class="h-full w-full flex items-start justify-center">
    <FormLogin v-if="show_form==='login'" class="mt-20" @change_form="on_change_form"/>
    <FormRegister v-if="show_form==='register'" @change_form="on_change_form"/>
</div>

</template>

<style scoped>

</style>