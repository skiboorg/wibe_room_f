<script setup lang="ts">
definePageMeta({ layout: 'profile' })

const { $api } = useNuxtApp()

const { data: communities, status } = useAsyncData(() => $api.auth.my_communities())
</script>

<template>
  <div class="space-y-3">
    <h2 class="font-semibold text-xl mb-4">Мои сообщества</h2>

    <!-- скелетон -->
    <template v-if="status === 'pending'">
      <CardBase v-for="i in 4" :key="i" padding="md">
        <div class="animate-pulse flex gap-4">
          <div class="w-14 h-14 rounded-xl bg-gray-100 shrink-0" />
          <div class="flex-1 space-y-2 py-1">
            <div class="h-4 bg-gray-100 rounded w-1/2" />
            <div class="h-3 bg-gray-100 rounded w-3/4" />
            <div class="h-3 bg-gray-100 rounded w-1/4" />
          </div>
        </div>
      </CardBase>
    </template>

    <template v-else-if="communities?.length === 0">
      <CardBase padding="md">
        <p class="text-gray-400 text-sm text-center py-6">Вы ещё не состоите ни в одном сообществе</p>
      </CardBase>
    </template>

    <template v-else>
      <NuxtLink
          v-for="community in communities"
          :key="community.id"
          :to="`/group/${community.slug}`"
          class="block"
      >
        <CardBase padding="md" extra-class="hover:border-gray-300 transition-colors cursor-pointer">
          <div class="flex items-center gap-4">

            <!-- обложка -->
            <div class="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-[#E2E4E9]">
              <img
                  v-if="community.cover"
                  :src="community.cover"
                  class="w-full h-full object-cover"
                  alt=""
              />
              <div v-else class="w-full h-full flex items-center justify-center text-gray-300">
                <i class="pi pi-users text-2xl" />
              </div>
            </div>

            <!-- инфо -->
            <div class="flex-1 min-w-0">
              <p class="font-semibold truncate">{{ community.name }}</p>
              <p class="text-sm text-gray-500 line-clamp-1 mt-0.5">{{ community.short_description }}</p>
              <p class="text-xs text-gray-400 mt-1">{{ community.members_count }} участников</p>
            </div>

            <i class="pi pi-chevron-right text-gray-300 shrink-0" />
          </div>
        </CardBase>
      </NuxtLink>
    </template>

  </div>
</template>