<script setup lang="ts">
const authStore = useAuthStore()
const {user} = storeToRefs(authStore)
</script>

<template>
<div class="bg-[#E9B458] p-3 rounded-2xl flex items-center justify-between mb-3">
  <TypingText18 text="Создайте свое сообщество "/>
  <p class="text-md">И начни монетизировать свои очень большие знания! Бесплатно до 2026 года</p>
  <div class="flex gap-3">
    <UIButton size="sm" variant="outline_black"  label="Скрыть"/>
    <nuxt-link :to="user ? '/group/create' :'/login'">
      <UIButton size="sm" variant="white"  label="Создать"/>
    </nuxt-link>

  </div>
</div>
</template>

<style scoped>

</style>