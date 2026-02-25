<script setup lang="ts">
const authStore = useAuthStore()
const {user} = storeToRefs(authStore)
</script>

<template>
<div class="bg-[#E9B458] p-3 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between mb-3">
  <TypingText18 text="Создайте свое сообщество "/>
  <p class="text-md mb-4 md:mb-0">И начни монетизировать свои очень большие знания! Бесплатно до 2026 года</p>
  <div class="flex gap-3 w-full md:w-auto">
<!--    <UIButton extra-class="hidden md:block" size="sm" variant="outline_black"  label="Скрыть"/>-->
    <nuxt-link class="block w-full md:w-auto " :to="user ? '/group/create' :'/login'">
      <UIButton class="w-full" size="sm" variant="white"  label="Создать"/>
    </nuxt-link>

  </div>
</div>
</template>

<style scoped>

</style>