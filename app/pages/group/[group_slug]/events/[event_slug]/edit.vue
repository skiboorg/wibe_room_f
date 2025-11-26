<script setup lang="ts">
const {$api} = useNuxtApp()
const {event_slug} = useRoute().params
const {data:event} = await useHttpRequest(useAsyncData(()=>$api.community.event(event_slug)))

</script>

<template>
  <FormEvent :is_edit_mode="true" :event="event" />
</template>

<style scoped>

</style>