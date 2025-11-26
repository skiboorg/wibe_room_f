<script setup lang="ts">
const {$api} = useNuxtApp()
const {event_slug} = useRoute().params
const {data:event} = await useHttpRequest(useAsyncData(()=>$api.community.event(event_slug)))

</script>

<template>

<CardBase padding="md">
  <img class="w-full h-auto object-cover block mb-3" :src="event?.cover" alt="">
  <div class="space-y-3 mb-2">
    <p class="text-sm text-gray-400 font-medium">{{new Date(event.start_date).toLocaleDateString()}} {{event.time_text}}</p>
    <p class="text-lg font-medium leading-[130%]">{{event.title}}</p>
    <p class="leading-[130%]">{{event.short_description}}</p>

  </div>
  <div class="" v-html="event.long_description"></div>
</CardBase>
</template>

<style scoped>

</style>