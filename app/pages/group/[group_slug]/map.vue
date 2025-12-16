<script setup lang="ts">
definePageMeta({
  auth: false,
  layout: 'group-alt'
})
</script>

<template>
<div class="w-full relative space-y-5 md:space-y-0">
  <img class="w-full h-auto object-cover rounded-2xl" src="~assets/images/map.png" alt="">
  <CardBase padding="md" class="md:absolute top-1/2 left-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2 z-10 max-w-[370px]">
    <TypingText20 class="mb-5 text-center" text="Карта участников"/>
    <p class="text-center mb-8">Раздел в разработке. Карта будет доступна только для участников сообщества «Скулеры-инвесторы»</p>
    <UIButton label="Вступить" extra-class="w-full"/>
  </CardBase>
</div>
</template>

<style scoped>

</style>