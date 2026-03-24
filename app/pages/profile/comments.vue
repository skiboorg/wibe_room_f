<script setup lang="ts">
definePageMeta({ layout: 'profile' })

const { $api } = useNuxtApp()

const { data: comments, status } = useAsyncData(() => $api.auth.my_comments())

function formatDate(d: string) {
  return new Date(d).toLocaleString('ru-RU', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

function formatCount(n: number): string {
  if (n >= 1000) return (n / 1000).toLocaleString('ru-RU', { maximumFractionDigits: 1 }) + 'k'
  return String(n)
}
</script>

<template>
  <div class="space-y-3">
    <h2 class="font-semibold text-xl mb-4">Мои комментарии</h2>

    <!-- скелетон -->
    <template v-if="status === 'pending'">
      <CardBase v-for="i in 5" :key="i" padding="md">
        <div class="animate-pulse space-y-3">
          <div class="h-4 bg-gray-100 rounded w-1/3" />
          <div class="h-3 bg-gray-100 rounded w-full" />
          <div class="h-3 bg-gray-100 rounded w-2/3" />
        </div>
      </CardBase>
    </template>

    <template v-else-if="comments?.length === 0">
      <CardBase padding="md">
        <p class="text-gray-400 text-sm text-center py-6">Вы ещё не оставляли комментариев</p>
      </CardBase>
    </template>

    <template v-else>
      <CardBase v-for="comment in comments" :key="comment.id" padding="md">

        <!-- ── шапка: сообщество + переход ── -->
        <NuxtLink
            :to="`/group/${comment.community_slug}`"
            class="flex items-center justify-between mb-3 group"
        >
          <div class="flex items-center gap-2">
            <img
                v-if="comment.community_cover"
                :src="comment.community_cover"
                class="w-7 h-7 rounded-lg object-cover"
                alt=""
            />
            <div v-else class="w-7 h-7 rounded-lg bg-[#E2E4E9]" />
            <span class="text-sm font-medium group-hover:underline">{{ comment.community_name }}</span>
          </div>
          <i class="pi pi-arrow-right text-gray-400 text-sm" />
        </NuxtLink>

        <!-- ── тело комментария ── -->
        <div class="bg-[#F7F8FA] rounded-xl px-4 py-3">
          <!-- пост, к которому относится комментарий -->
          <div class="flex gap-2 text-xs text-gray-400 mb-2 ">
            <p>К посту:</p>
            <div class="font-medium text-gray-600 truncate" v-html="comment.post_title"></div>
          </div>

          <p class="text-sm text-gray-800 whitespace-pre-wrap">{{ comment.text }}</p>
          <img
              v-if="comment.image"
              :src="comment.image"
              class="mt-2 max-h-40 rounded-lg object-cover"
              alt=""
          />
        </div>

        <!-- ── подвал: дата + лайки ── -->
        <div class="flex items-center gap-4 mt-2 px-1">
          <span class="text-xs text-gray-400">{{ formatDate(comment.date) }}</span>
          <span class="flex items-center gap-1 text-xs text-gray-400">
            <i class="pi pi-heart text-[10px]" />
            {{ formatCount(comment.reactions_count?.like ?? 0) }}
          </span>
        </div>

      </CardBase>
    </template>
  </div>
</template>