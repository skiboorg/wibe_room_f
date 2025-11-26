<script setup lang="ts">
definePageMeta({
  auth: false,
  layout: 'group-alt'
})
</script>

<template>
  <FormGroupCRUD :is_edit_mode="true"/>
</template>