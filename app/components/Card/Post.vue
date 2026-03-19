<script setup lang="ts">
import type { Post } from '~/repository/community/types'

const props = defineProps<{
  post: Post
}>()

const emits = defineEmits(['delete-post', 'post-updated'])

// ── диалог комментариев ───────────────────────────────────────
const dialogVisible = ref(false)

// ── реакция (toggle лайк) ─────────────────────────────────────
const { $api } = useNuxtApp()
const localPost = ref({ ...props.post })

const likesCount = computed(() => localPost.value.reactions_count?.like ?? 0)
const myLike = computed(() => localPost.value.my_reaction === 'like')

async function toggleLike() {
  try {
    await $api.community.post_react(localPost.value.id!, 'like')
    // обновляем локально оптимистично
    if (myLike.value) {
      localPost.value.reactions_count = {
        ...localPost.value.reactions_count,
        like: Math.max(0, likesCount.value - 1),
      }
      localPost.value.my_reaction = null
    } else {
      localPost.value.reactions_count = {
        ...localPost.value.reactions_count,
        like: likesCount.value + 1,
      }
      localPost.value.my_reaction = 'like'
    }
    emits('post-updated', localPost.value)
  } catch (e) {
    console.error(e)
  }
}

// ── vk iframe ────────────────────────────────────────────────
function vkIframeUrl(link: string) {
  const match = link.match(/video-?(\d+)_?(\d+)/)
  if (!match) return ''
  return `https://vkvideo.ru/video_ext.php?oid=-${match[1]}&id=${match[2]}&autoplay=0`
}

// ── контекстное меню ─────────────────────────────────────────
const menu = ref()
const items = ref([
  {
    label: 'Действия',
    items: [
      {
        label: 'Удалить',
        icon: 'pi pi-trash',
        command: () => emits('delete-post', props.post.id),
      },
    ],
  },
])
const toggle = (event: Event) => menu.value.toggle(event)

// синхронизируем если пост пришёл снаружи заново
watch(() => props.post, (p) => { localPost.value = { ...p } }, { deep: true })
</script>

<template>
  <CardBase padding="md">
    <!-- шапка -->
    <div class="flex items-center justify-between mb-[18px]">
      <div class="flex items-center gap-2">
        <UIAvatar :image="localPost.added_by.avatar" />
        <div>
          <p class="font-medium">
            {{ localPost.added_by.full_name }}
            <span v-if="localPost.added_by.is_admin"
                  class="px-[6px] py-1 text-gray-400 text-xs border border-[#C6CAD2] rounded-[41px]">
              Админ
            </span>
          </p>
          <p class="text-sm text-gray-400">{{ new Date(localPost.date).toLocaleString() }}</p>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <span v-if="localPost.is_pinned" class="inline-flex items-center gap-1 text-gray-400 text-md">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.7935 0.51234L14.5155 4.23434C14.7148 4.43368 14.863 4.6782 14.9474 4.9471C15.0319 5.216 15.0502 5.50133 15.0007 5.77881C14.9512 6.05629 14.8354 6.31771 14.6632 6.54083C14.491 6.76395 14.2674 6.94218 14.0115 7.06034L12.6845 7.67334C12.2611 7.86931 11.8876 8.1586 11.592 8.51953C11.2963 8.88046 11.0863 9.30364 10.9775 9.75734L10.3935 12.2113C10.0765 13.5433 8.42153 14.0113 7.45353 13.0433L5.24953 10.8393L1.27953 14.8083C1.20993 14.8779 1.1273 14.9332 1.03637 14.9708C0.94543 15.0085 0.847963 15.0279 0.749533 15.0279C0.651103 15.0279 0.553637 15.0085 0.462699 14.9708C0.371762 14.9332 0.289134 14.8779 0.219533 14.8083C0.149933 14.7387 0.0947224 14.6561 0.0570548 14.5652C0.0193872 14.4742 0 14.3768 0 14.2783C0 14.1799 0.0193872 14.0824 0.0570548 13.9915C0.0947224 13.9006 0.149933 13.8179 0.219533 13.7483L4.18853 9.77834L1.98453 7.57434C1.01653 6.60634 1.48453 4.95134 2.81653 4.63434L5.27053 4.05034C5.72453 3.94228 6.14803 3.73247 6.50905 3.43676C6.87008 3.14105 7.15918 2.76716 7.35453 2.34334L7.96753 1.01634C8.0857 0.760448 8.26392 0.536885 8.48705 0.364666C8.71017 0.192448 8.97159 0.0766707 9.24907 0.0271841C9.52654 -0.0223025 9.81187 -0.00403435 10.0808 0.0804344C10.3497 0.164903 10.5942 0.313073 10.7935 0.51234Z" fill="#8D95A5"/>
          </svg>
          Закреплено
        </span>
        <Button size="sm" severity="contrast" text v-if="localPost.is_own" type="button"
                icon="pi pi-ellipsis-h" @click="toggle" aria-haspopup="true" aria-controls="overlay_menu" />
        <Menu ref="menu" id="overlay_menu" :model="items" :popup="true" />
      </div>
    </div>

    <!-- фото -->
    <img v-for="photo in localPost.photos" :key="photo.id"
         class="rounded-lg w-full h-auto block mb-[18px]" :src="photo.image" alt="" />

    <!-- vk видео -->
    <div v-if="localPost.vk_video_link" class="mb-[18px]">
      <iframe :src="vkIframeUrl(localPost.vk_video_link)" width="100%" height="300px"
              style="background-color: #000"
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock;"
              frameborder="0" allowfullscreen />
    </div>

    <!-- теги -->
    <div class="flex flex-wrap gap-2 mb-[18px]">
      <UIBadge v-for="tag in localPost.post_tags" :key="tag.id" :label="tag.name" />
    </div>

    <!-- заголовок -->
    <h3 class="font-semibold text-[20px] leading-[130%] mb-6">{{ localPost.title }}</h3>

    <!-- текст (свёрнутый) -->
    <UIExpandableContent :content="localPost.text" />

    <!-- панель действий -->
    <div class="flex gap-4 mt-4 pt-4 border-t border-[#E2E4E9]">
      <!-- лайк -->
      <button
          class="flex gap-2 items-center text-sm transition-colors"
          :class="myLike ? 'text-red-500' : 'text-gray-500 hover:text-red-400'"
          @click="toggleLike"
      >
        <svg width="21" height="19" viewBox="0 0 21 19" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.10961 11.3496C7.60961 16.5996 10.2346 18.0996 10.2346 18.0996C10.2346 18.0996 12.8596 16.5996 17.3596 11.3496C21.8596 6.09961 18.8596 0.849609 15.1096 0.849609C11.3596 0.849609 10.2346 5.34961 10.2346 5.34961C10.2346 5.34961 9.10961 0.849609 5.35961 0.849609C1.60961 0.849609 -1.39039 6.09961 3.10961 11.3496Z"
                :fill="myLike ? '#ef4444' : 'none'"
                :stroke="myLike ? '#ef4444' : 'currentColor'"
                stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>{{ likesCount }}</span>
      </button>

      <!-- комментарии — открывает диалог -->
      <button
          class="flex gap-2 items-center text-sm text-gray-500 hover:text-black transition-colors"
          @click="dialogVisible = true"
      >
        <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4.8501 0.849609C3.78923 0.849609 2.77182 1.27104 2.02167 2.02118C1.27153 2.77133 0.850098 3.78874 0.850098 4.84961V11.0576C0.850098 12.1185 1.27153 13.1359 2.02167 13.886C2.77182 14.6362 3.78923 15.0576 4.8501 15.0576H4.9431V18.8496C4.94301 18.9468 4.97126 19.042 5.02439 19.1234C5.07752 19.2048 5.15323 19.2689 5.24226 19.308C5.33128 19.347 5.42976 19.3593 5.52564 19.3432C5.62152 19.3272 5.71064 19.2835 5.7821 19.2176L10.3021 15.0576H14.6711C15.732 15.0576 16.7494 14.6362 17.4995 13.886C18.2497 13.1359 18.6711 12.1185 18.6711 11.0576V4.84961C18.6711 3.78874 18.2497 2.77133 17.4995 2.02118C16.7494 1.27104 15.732 0.849609 14.6711 0.849609H4.8501Z"
                stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>{{ localPost.comments_count ?? 0 }}</span>
      </button>
    </div>
  </CardBase>

  <!-- диалог с постом и комментариями -->
  <ModalPostComments
      v-if="dialogVisible"
      :post="localPost"
      @close="dialogVisible = false"
      @comment-added="localPost.comments_count = (localPost.comments_count ?? 0) + 1"
  />
</template>