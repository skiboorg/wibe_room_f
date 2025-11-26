<template>
  <div class="space-y-4 animate-pulse">
    <!-- Карточка с обложкой и информацией -->
    <CardBase padding="none">
      <!-- Скелетон обложки -->
      <div class="h-[170px] w-full bg-gray-200 rounded-t-2xl"></div>

      <div class="p-4">
        <!-- Заголовок -->
        <div class="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>

        <!-- Статус группы -->
        <div class="flex items-center gap-2 mb-2">
          <div class="w-4 h-4 bg-gray-200 rounded"></div>
          <div class="h-4 bg-gray-200 rounded w-32"></div>
        </div>

        <!-- Ссылка -->
        <div class="h-5 bg-gray-200 rounded w-full mb-3"></div>

        <!-- Описание -->
        <div class="space-y-2 mb-3">
          <div class="h-4 bg-gray-200 rounded w-full"></div>
          <div class="h-4 bg-gray-200 rounded w-2/3"></div>
          <div class="h-4 bg-gray-200 rounded w-20"></div>
        </div>

        <!-- Ссылки сообщества -->
        <div class="space-y-2">
          <div class="h-5 bg-gray-200 rounded w-full" v-for="i in 2" :key="i"></div>
        </div>

        <!-- Кнопка настроек -->
        <div class="mt-2">
          <div class="h-10 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    </CardBase>

    <!-- Карточка статистики -->
    <CardBase padding="none">
      <div class="p-5 border-b">
        <div class="grid grid-cols-2">
          <div class="text-center border-r">
            <div class="h-6 bg-gray-200 rounded w-16 mx-auto mb-1"></div>
            <div class="h-4 bg-gray-200 rounded w-24 mx-auto"></div>
          </div>
          <div class="text-center">
            <div class="h-6 bg-gray-200 rounded w-12 mx-auto mb-1"></div>
            <div class="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
          </div>
        </div>
      </div>

      <div class="p-4">
        <div class="grid grid-cols-3 gap-4">
          <div class="flex flex-col items-center justify-center" v-for="i in 7" :key="i">
            <div class="w-12 h-12 bg-gray-200 rounded-full mb-1"></div>
            <div class="h-3 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
      </div>
    </CardBase>

    <!-- Логотип -->
    <div class="flex justify-center">
      <div class="w-32 h-6 bg-gray-200 rounded"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Пустой скрипт для скелетона
</script>

<style scoped>
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>