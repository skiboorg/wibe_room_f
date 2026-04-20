<script setup lang="ts">
// ─── Types ───────────────────────────────────────────────────────────────────
export interface DiscussionAuthor {
  id: number
  full_name: string
  avatar: string | null
}

export interface DiscussionParticipant {
  id: number
  avatar: string | null
}

export interface Discussion {
  id: number
  title: string
  author: DiscussionAuthor
  is_pinned?: boolean
  is_closed?: boolean
  messages_count: number
  pages_count: number
  last_reply_at: string | null
  last_reply_participants: DiscussionParticipant[]
  slug?: string
}

export interface DiscussionListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Discussion[]
}

// ─── Store & Route ────────────────────────────────────────────────────────────
const communityStore = useCommunityStore()
const { currentCommunity } = storeToRefs(communityStore)
const { $api } = useNuxtApp()
const route = useRoute()

// ─── State ────────────────────────────────────────────────────────────────────
const discussions = ref<Discussion[]>([])
const totalCount = ref(0)
const isLoading = ref(true)
const currentPage = ref(1)
const perPage = 10

// ─── Computed ─────────────────────────────────────────────────────────────────
const totalPages = computed(() => Math.ceil(totalCount.value / perPage))

const breadcrumbs = computed(() => [
  { label: currentCommunity.value?.name ?? 'Группа', to: `/group/${route.params.group_slug}` },
  { label: 'Обсуждения' },
])

// ─── Data fetching ────────────────────────────────────────────────────────────
async function fetchDiscussions(page = 1) {
  isLoading.value = true
  try {
    // Когда бек готов: замените на реальный вызов
    // const resp = await $api.community.discussions({ slug: route.params.group_slug, page, per_page: perPage })
    // discussions.value = resp.results
    // totalCount.value = resp.count

    // ── Mock data (удалить после подключения бека) ──
    await new Promise(r => setTimeout(r, 400))
    discussions.value = Array.from({ length: perPage }, (_, i) => ({
      id: (page - 1) * perPage + i + 1,
      title: 'База таргетологов',
      author: { id: 1, full_name: 'Eloise Hawthorne', avatar: null },
      is_pinned: i === 0,
      is_closed: i === 1,
      messages_count: 8253,
      pages_count: 414,
      last_reply_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      last_reply_participants: Array.from({ length: 3 }, (_, j) => ({ id: j + 1, avatar: null })),
    }))
    totalCount.value = 19
    // ── End mock ──
  } finally {
    isLoading.value = false
  }
}

onMounted(() => fetchDiscussions(currentPage.value))

function onPageChange(page: number) {
  currentPage.value = page
  fetchDiscussions(page)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatRelativeTime(iso: string | null) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 60) return `${min} мин назад`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h} ч назад`
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

function formatNumber(n: number) {
  return n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n)
}

function getAvatarInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

// Возвращает последние 3 страницы, исключая первые 3
function getLastPages(totalPages: number): number[] {
  if (totalPages <= 6) return []
  return [totalPages - 2, totalPages - 1, totalPages].filter(p => p > 3)
}

const visiblePages = computed(() => {
  const total = totalPages.value
  const cur = currentPage.value
  const pages: (number | '...')[] = []
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  pages.push(1)
  if (cur > 3) pages.push('...')
  for (let p = Math.max(2, cur - 1); p <= Math.min(total - 1, cur + 1); p++) pages.push(p)
  if (cur < total - 2) pages.push('...')
  pages.push(total)
  return pages
})
</script>

<template>
  <div>
    <!-- Breadcrumbs -->
    <div class="flex items-center gap-2 text-sm text-[#8D95A5] mb-6">
      <NuxtLink
          v-for="(crumb, i) in breadcrumbs"
          :key="i"
          :to="crumb.to"
          :class="[
          'hover:text-black transition-colors',
          !crumb.to ? 'text-black font-medium pointer-events-none' : ''
        ]"
      >{{ crumb.label }}</NuxtLink>
      <span v-if="breadcrumbs.length > 1" class="text-[#C6CAD2] -mx-1">›</span>
      <span class="text-black font-medium">Обсуждения {{ totalCount }}</span>
    </div>

    <!-- Loading skeletons -->
    <CardBase v-if="isLoading" class="divide-y divide-[#F1F2F4]">
      <div v-for="n in 9" :key="n" class="py-4 px-1 animate-pulse">
        <div class="flex items-start gap-3">
          <div class="w-8 h-8 rounded-full bg-[#E2E4E9] shrink-0 mt-0.5" />
          <div class="flex-1 space-y-2">
            <div class="h-3 w-24 bg-[#E2E4E9] rounded" />
            <div class="h-5 w-64 bg-[#E2E4E9] rounded" />
            <div class="h-3 w-48 bg-[#E2E4E9] rounded" />
          </div>
        </div>
      </div>
    </CardBase>

    <!-- Discussion list -->
    <CardBase v-else class="divide-y divide-[#F1F2F4]">
      <div
          v-for="discussion in discussions"
          :key="discussion.id"
          class="flex items-center gap-4 py-4"
      >
        <!-- Author avatar -->
        <div class="shrink-0 self-start mt-0.5">
          <div v-if="discussion.author.avatar" class="w-9 h-9 rounded-full overflow-hidden">
            <img :src="discussion.author.avatar" :alt="discussion.author.full_name" class="w-full h-full object-cover" />
          </div>
          <div v-else class="w-9 h-9 rounded-full bg-[#E2E4E9] flex items-center justify-center text-xs font-semibold text-[#8D95A5]">
            {{ getAvatarInitials(discussion.author.full_name) }}
          </div>
        </div>

        <!-- Main content -->
        <div class="flex-1 min-w-0">
          <!-- Author name + green «Автор» badge -->
          <div class="flex items-center gap-1.5 mb-1">
            <span class="text-sm text-[#8D95A5]">{{ discussion.author.full_name }}</span>
            <span class="text-xs text-[#22C55E] font-medium">Автор</span>
          </div>

          <!-- Title — ссылка на обсуждение (1-я страница) -->
          <div class="flex items-center gap-2 mb-1">
            <NuxtLink
                :to="`/group/${route.params.group_slug}/discussion/${discussion.id}`"
                class="font-bold text-[15px] leading-snug hover:underline"
            >{{ discussion.title }}</NuxtLink>
            <!-- pin -->
            <span v-if="discussion.is_pinned" class="shrink-0 text-[#8D95A5]" title="Закреплено">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <path d="M10.7935 0.51234L14.5155 4.23434C14.7148 4.43368 14.863 4.6782 14.9474 4.9471C15.0319 5.216 15.0502 5.50133 15.0007 5.77881C14.9512 6.05629 14.8354 6.31771 14.6632 6.54083C14.491 6.76395 14.2674 6.94218 14.0115 7.06034L12.6845 7.67334C12.2611 7.86931 11.8876 8.1586 11.592 8.51953C11.2963 8.88046 11.0863 9.30364 10.9775 9.75734L10.3935 12.2113C10.0765 13.5433 8.42153 14.0113 7.45353 13.0433L5.24953 10.8393L1.27953 14.8083C1.20993 14.8779 1.1273 14.9332 1.03637 14.9708C0.94543 15.0085 0.847963 15.0279 0.749533 15.0279C0.651103 15.0279 0.553637 15.0085 0.462699 14.9708C0.371762 14.9332 0.289134 14.8779 0.219533 14.8083C0.149933 14.7387 0.0947224 14.6561 0.0570548 14.5652C0.0193872 14.4742 0 14.3768 0 14.2783C0 14.1799 0.0193872 14.0824 0.0570548 13.9915C0.0947224 13.9006 0.149933 13.8179 0.219533 13.7483L4.18853 9.77834L1.98453 7.57434C1.01653 6.60634 1.48453 4.95134 2.81653 4.63434L5.27053 4.05034C5.72453 3.94228 6.14803 3.73247 6.50905 3.43676C6.87008 3.14105 7.15918 2.76716 7.35453 2.34334L7.96753 1.01634C8.0857 0.760448 8.26392 0.536885 8.48705 0.364666C8.71017 0.192448 8.97159 0.0766707 9.24907 0.0271841C9.52654 -0.0223025 9.81187 -0.00403435 10.0808 0.0804344C10.3497 0.164903 10.5942 0.313073 10.7935 0.51234Z" fill="currentColor"/>
              </svg>
            </span>
            <!-- lock -->
            <span v-if="discussion.is_closed" class="shrink-0 text-[#8D95A5]" title="Закрыто">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <path d="M11 7V5C11 3.34 9.66 2 8 2S5 3.34 5 5V7H4C3.45 7 3 7.45 3 8V13C3 13.55 3.45 14 4 14H12C12.55 14 13 13.55 13 13V8C13 7.45 12.55 7 12 7H11ZM8 11C7.45 11 7 10.55 7 10S7.45 9 8 9 9 9.45 9 10 8.55 11 8 11ZM9.1 7H6.9V5C6.9 4.39 7.39 3.9 8 3.9S9.1 4.39 9.1 5V7Z" fill="currentColor"/>
              </svg>
            </span>
          </div>

          <!-- Счётчик сообщений + кликабельные страницы с красной рамкой -->
          <div class="flex items-center flex-wrap gap-1.5 text-xs text-[#8D95A5]">
            <span>{{ formatNumber(discussion.messages_count) }} сообщения</span>
            <span>·</span>
            <span>Страницы:</span>

            <!-- первые 3 -->
            <NuxtLink
                v-for="p in Math.min(3, discussion.pages_count)"
                :key="p"
                :to="`/group/${route.params.group_slug}/discussion/${discussion.id}?page=${p}`"
                class="inline-flex items-center justify-center min-w-[22px] h-[20px] px-1.5 rounded border border-[#EDAAA8] text-[#C0392B] hover:bg-red-50 transition-colors leading-none font-medium"
                @click.stop
            >{{ p }}</NuxtLink>

            <!-- многоточие (только если страниц больше 6) -->
            <span v-if="discussion.pages_count > 6">…</span>

            <!-- последние 3 страницы (не дублируем первые 3) -->
            <NuxtLink
                v-for="p in getLastPages(discussion.pages_count)"
                :key="`last-${p}`"
                :to="`/group/${route.params.group_slug}/discussion/${discussion.id}?page=${p}`"
                class="inline-flex items-center justify-center min-w-[22px] h-[20px] px-1.5 rounded border border-[#EDAAA8] text-[#C0392B] hover:bg-red-50 transition-colors leading-none font-medium"
                @click.stop
            >{{ p }}</NuxtLink>
          </div>
        </div>

        <!-- Right: avatars + last reply time -->
        <div class="shrink-0 flex flex-col items-end gap-1.5 ml-4">
          <div class="flex -space-x-2.5">
            <div
                v-for="(p, idx) in discussion.last_reply_participants.slice(0, 4)"
                :key="p.id"
                :style="{ zIndex: discussion.last_reply_participants.length - idx }"
                class="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-[#D1D5DB] flex items-center justify-center text-[10px] font-semibold text-white"
            >
              <img v-if="p.avatar" :src="p.avatar" class="w-full h-full object-cover" />
            </div>
          </div>
          <span v-if="discussion.last_reply_at" class="text-xs text-[#8D95A5] whitespace-nowrap">
            Последний ответ {{ formatRelativeTime(discussion.last_reply_at) }}
          </span>
        </div>
      </div>
    </CardBase>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center gap-1 mt-6">
      <button
          v-for="page in visiblePages"
          :key="page"
          :disabled="page === '...'"
          :class="[
          'w-9 h-9 rounded-lg text-sm font-medium transition-colors',
          page === currentPage
            ? 'bg-black text-white'
            : page === '...'
              ? 'cursor-default text-[#8D95A5]'
              : 'bg-white border border-[#E2E4E9] text-black hover:border-black'
        ]"
          @click="typeof page === 'number' && onPageChange(page)"
      >{{ page }}</button>

      <button
          v-if="currentPage < totalPages"
          class="flex items-center gap-1 px-3 h-9 rounded-lg text-sm bg-white border border-[#E2E4E9] hover:border-black transition-colors"
          @click="onPageChange(currentPage + 1)"
      >
        Дальше
        <svg width="6" height="10" viewBox="0 0 6 10" fill="none">
          <path d="M1 1L5 5L1 9" stroke="#8D95A5" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  </div>
</template>