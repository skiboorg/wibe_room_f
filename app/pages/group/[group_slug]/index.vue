<script setup lang="ts">
const {$api} = useNuxtApp()
const communityStore = useCommunityStore()
const {currentCommunity, loading, needRefresh} = storeToRefs(communityStore)
const authStore = useAuthStore()
const {user} = storeToRefs(authStore)

const filters = ref({
  tag: 'all',
  q: '',
  page: 1,
})

const searchInput = ref('')
let searchTimer: ReturnType<typeof setTimeout> | null = null

const {data: post_response, refresh, status} = useHttpRequest(useAsyncData(() => $api.community.posts({
  query: filters.value,
})))
const {data: tags, refresh: tags_refresh} = useHttpRequest(useAsyncData(() => $api.community.post_tags()))

// поиск с дебаунсом 400мс
function onSearchInput() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    filters.value.q = searchInput.value
    filters.value.page = 1
    refresh()
  }, 400)
}

function onSearchEnter() {
  if (searchTimer) clearTimeout(searchTimer)
  filters.value.q = searchInput.value
  filters.value.page = 1
  refresh()
}

function clearSearch() {
  searchInput.value = ''
  filters.value.q = ''
  filters.value.page = 1
  refresh()
}

const page_update = async (page: number) => {
  filters.value.page = page
  await refresh()
}

const handlePostDelete = async (id: number) => {
  await $api.community.post_delete({ id })
  await refresh()
}

watch(() => loading.value, async () => {
  await tags_refresh()
  await refresh()
})
</script>

<template>
  <template v-if="status === 'pending'">
    <div class="space-y-4">
      <SkeletonPost v-for="i in 10" :key="i" />
    </div>
  </template>

  <template v-else>
    <div class="space-y-4">

      <!-- написать пост -->
      <CardBase v-if="currentCommunity?.is_owner" padding="lg_sm">
        <div class="flex items-start gap-4">
          <UIAvatar :image="user.avatar" size="md" />
          <UIButton
              @click="navigateTo(`/group/${currentCommunity.slug}/post`)"
              variant="outline"
              label="Напишите пост"
              fluid
          />
        </div>
      </CardBase>

      <!-- закреплённые посты -->
      <CardPost
          v-for="post in post_response?.pinned"
          :key="post.id"
          :post="post"
          @delete-post="handlePostDelete"
      />

      <!-- лента + поиск -->
      <div>
        <CardBase padding="lg_sm">
          <div class="flex items-center justify-between gap-3">
            <p class="text-lg font-medium shrink-0">Лента постов</p>

            <!-- поиск -->
            <div
                class="flex items-center gap-2 bg-[#F1F2F4] px-3 py-2 rounded-lg flex-1 max-w-xs transition-all"
                :class="searchInput ? 'ring-1 ring-black' : ''"
            >
              <svg class="shrink-0 text-gray-400" width="14" height="14" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.5 0C8.22391 0 9.87721 0.684819 11.0962 1.90381C12.3152 3.12279 13 4.77609 13 6.5C13 8.11 12.41 9.59 11.44 10.73L11.71 11H12.5L17.5 16L16 17.5L11 12.5V11.71L10.73 11.44C9.55037 12.4465 8.05065 12.9996 6.5 13C4.77609 13 3.12279 12.3152 1.90381 11.0962C0.684819 9.87721 0 8.22391 0 6.5C0 4.77609 0.684819 3.12279 1.90381 1.90381C3.12279 0.684819 4.77609 0 6.5 0ZM6.5 2C4 2 2 4 2 6.5C2 9 4 11 6.5 11C9 11 11 9 11 6.5C11 4 9 2 6.5 2Z" fill="#8D95A5"/>
              </svg>
              <input
                  v-model="searchInput"
                  class="bg-transparent w-full outline-none text-sm"
                  placeholder="Поиск по постам..."
                  @input="onSearchInput"
                  @keyup.enter="onSearchEnter"
              />
              <button
                  v-if="searchInput"
                  class="text-gray-400 hover:text-black transition-colors shrink-0"
                  @click="clearSearch"
              >
                <i class="pi pi-times text-xs" />
              </button>
            </div>
          </div>
        </CardBase>

        <!-- теги -->
        <div class="flex gap-2">
          <UIRadioBtns
              v-model="filters.tag"
              show_sign
              :items="tags"
              @select="() => { filters.page = 1; refresh() }"
          />
        </div>
      </div>

      <!-- результаты поиска — подпись -->
      <p v-if="filters.q" class="text-sm text-gray-400 px-1">
        Результаты поиска по «<span class="font-medium text-gray-700">{{ filters.q }}</span>»:
        {{ post_response?.count ?? 0 }} постов
      </p>

      <!-- посты -->
      <template v-if="post_response?.posts?.length === 0 && filters.q">
        <CardBase padding="md">
          <p class="text-center text-gray-400 text-sm py-4">Ничего не найдено</p>
        </CardBase>
      </template>

      <CardPost
          v-for="post in post_response?.posts"
          :key="post.id"
          :post="post"
          @delete-post="handlePostDelete"
      />

      <UIPaginator
          :total="post_response?.count ?? 0"
          :page="filters.page"
          :per-page="20"
          @update:page="page_update"
      />
    </div>
  </template>
</template>