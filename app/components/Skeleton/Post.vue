<template>
  <div class="post-card-skeleton" :class="variant">
    <!-- Вариант с медиа -->
    <template v-if="variant === 'with-media'">
      <div class="flex mb-4">
        <div class="w-10 h-10 bg-gray-200 rounded-full mr-3 animate-pulse"></div>
        <div class="flex-1">
          <div class="h-4 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
          <div class="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>
      </div>
      <div class="space-y-2 mb-3">
        <div class="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div class="h-4 bg-gray-200 rounded w-4/5 animate-pulse"></div>
      </div>
      <div class="bg-gray-200 rounded-lg h-48 mb-3 animate-pulse"></div>
<!--      <div class="flex justify-between">-->
<!--        <div class="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>-->
<!--        <div class="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>-->
<!--      </div>-->
    </template>

    <!-- Вариант только текст -->
    <template v-else-if="variant === 'text-only'">
      <div class="flex mb-4">
        <div class="w-10 h-10 bg-gray-200 rounded-full mr-3 animate-pulse"></div>
        <div class="flex-1">
          <div class="h-4 bg-gray-200 rounded w-40 mb-2 animate-pulse"></div>
          <div class="h-3 bg-gray-200 rounded w-28 animate-pulse"></div>
        </div>
      </div>
      <div class="space-y-2 mb-4">
        <div class="h-4 bg-gray-200 rounded animate-pulse" v-for="i in lines" :key="i"></div>
      </div>
      <div class="flex space-x-4">
        <div class="h-6 bg-gray-200 rounded w-16 animate-pulse" v-for="i in 3" :key="i"></div>
      </div>
    </template>

    <!-- Компактный вариант -->
    <template v-else-if="variant === 'compact'">
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
        <div class="flex-1 space-y-2">
          <div class="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div class="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>
        <div class="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
      </div>
    </template>
  </div>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'with-media', // 'with-media', 'text-only', 'compact'
    validator: (value) => ['with-media', 'text-only', 'compact'].includes(value)
  },
  lines: {
    type: Number,
    default: 4
  }
})
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

.post-card-skeleton {
  background: white;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #f3f4f6;
}

.post-card-skeleton.compact {
  padding: 12px;
}
</style>