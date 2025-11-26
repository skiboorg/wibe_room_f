<script setup lang="ts">
import type {Event,} from "~/repository/community/types";
const props = defineProps<{
  event: Event
}>()
const emits  = defineEmits(['delete-event'])

</script>

<template>
<CardBase padding="sm">
  <div class="grid grid-cols-12 gap-4">
    <div class="col-span-4">
      <img class="rounded-lg w-full h-auto " :src="event.cover" alt="">
    </div>
    <div class="col-span-8">
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <p class="text-sm text-gray-400 font-medium">{{new Date(event.start_date).toLocaleDateString()}} {{event.time_text}}</p>
          <div class="flex">
            <Button text icon="pi pi-pencil" size="small" @click="navigateTo(`events/${event.slug}/edit/`)"/>
            <Button text icon="pi pi-trash"  size="small" severity="danger" @click="emits('delete-event',event.slug)"/>
          </div>
        </div>

        <p class="text-lg font-medium leading-[130%]">{{event.title}}</p>
        <p class="leading-[130%]">{{event.short_description}}</p>
       <UITextLink label="Перейти в мероприятие" :to="`events/${event.slug}`"/>

      </div>
    </div>
  </div>
</CardBase>
</template>

<style scoped>

</style>