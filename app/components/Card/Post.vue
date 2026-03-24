<script setup lang="ts">
import type { Post } from '~/repository/community/types'

const props = defineProps<{
  post: Post
}>()

const emits = defineEmits(['delete-post', 'post-updated'])

// ── диалог комментариев ───────────────────────────────────────
const dialogVisible = ref(false)

function openDialog() {
  $api.community.post_view(localPost.value.id!)
  localPost.value.views = (localPost.value.views ?? 0) + 1
  dialogVisible.value = true
}

// ── реакция (toggle лайк) ─────────────────────────────────────
const { $api } = useNuxtApp()
const localPost = ref({ ...props.post })

const likesCount = computed(() => localPost.value.reactions_count?.like ?? 0)
const myLike = computed(() => localPost.value.my_reaction === 'like')

async function toggleLike() {
  try {
    // лайк считается просмотром
    $api.community.post_view(localPost.value.id!)
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

function formatCount(n: number): string {
  if (n >= 1000) return (n / 1000).toLocaleString('ru-RU', { maximumFractionDigits: 1 }) + 'k'
  return String(n)
}
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
    <div class="grid grid-cols-3 md:flex  items-center gap-3 mt-4 pt-4 border-t border-[#E2E4E9] text-[#8D95A5]">

      <!-- лайк: кнопка с рамкой + счётчик отдельно -->

      <button
          class="w-fit flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors text-sm font-medium"
          :class="myLike
          ? 'border-red-300 text-red-500 bg-red-50'
          : 'border-[#E2E4E9] text-[#8D95A5] hover:border-gray-400 hover:text-gray-600'"
          @click="toggleLike"
      >
        <!-- иконка большой палец -->
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11.75 4.00049C11.75 3.75737 11.6534 3.52396 11.4814 3.35205C11.3095 3.18014 11.0761 3.0835 10.833 3.0835C10.5901 3.08358 10.3574 3.18032 10.1855 3.35205C10.0136 3.52396 9.91699 3.75737 9.91699 4.00049V4.8335C9.91699 5.91646 9.48648 6.95542 8.7207 7.72119C8.13411 8.30771 7.38705 8.69597 6.58301 8.84619V13.1665C6.58301 13.6305 6.76772 14.0757 7.0957 14.4038C7.42382 14.7319 7.869 14.9164 8.33301 14.9165H14.167L14.2305 14.9194C14.3316 14.928 14.4809 14.8946 14.6553 14.7202C14.8342 14.5412 15.0036 14.2425 15.0996 13.8423L15.9131 9.7749C15.8989 9.55322 15.8065 9.34308 15.6484 9.18506C15.4765 9.01315 15.2431 8.9165 15 8.9165H12.5C12.0858 8.9165 11.75 8.58072 11.75 8.1665V4.00049ZM3.25 14.8335C3.25 14.8555 3.25889 14.8765 3.27441 14.8921C3.28996 14.9076 3.31102 14.9164 3.33301 14.9165H5C5.0221 14.9165 5.04297 14.9077 5.05859 14.8921C5.07422 14.8765 5.08301 14.8556 5.08301 14.8335V8.9165H3.33301C3.3111 8.91659 3.28995 8.92547 3.27441 8.94092C3.25879 8.95655 3.25 8.97839 3.25 9.00049V14.8335ZM13.25 7.4165H15C15.6409 7.4165 16.2558 7.6713 16.709 8.12451C17.1622 8.57772 17.417 9.19256 17.417 9.8335C17.417 9.88288 17.412 9.93253 17.4023 9.98096L16.5684 14.147C16.5667 14.155 16.5654 14.1634 16.5635 14.1714C16.4192 14.7867 16.1361 15.3615 15.7158 15.7817C15.3038 16.1936 14.7621 16.446 14.167 16.4155V16.4165H8.33301C7.59674 16.4164 6.8868 16.1662 6.31543 15.7134C6.25833 15.7988 6.19284 15.8789 6.11914 15.9526C5.82221 16.2496 5.41992 16.4165 5 16.4165H3.33301C2.9132 16.4164 2.51072 16.2495 2.21387 15.9526C1.91704 15.6557 1.75 15.2533 1.75 14.8335V9.00049C1.75 8.58056 1.91693 8.1773 2.21387 7.88037C2.51071 7.58362 2.91328 7.41659 3.33301 7.4165H5.83301C6.51807 7.4165 7.1757 7.14501 7.66016 6.66064C8.14462 6.17618 8.41699 5.51864 8.41699 4.8335V4.00049C8.41699 3.3597 8.67101 2.74469 9.12402 2.2915C9.57716 1.83837 10.1922 1.58358 10.833 1.5835C11.4739 1.5835 12.0888 1.83829 12.542 2.2915C12.9952 2.74472 13.25 3.35955 13.25 4.00049V7.4165Z" fill="#8D95A5"/>
        </svg>

        <span>Лайк</span>
        <span class="inline-block  md:hidden text-sm font-medium text-[#8D95A5]">{{ formatCount(likesCount) }}</span>
      </button>

      <!-- разделитель + счётчик лайков -->
      <span class="hidden md:inline-block text-sm font-medium text-[#8D95A5]">{{ formatCount(likesCount) }}</span>

      <!-- комментарии -->
      <button
          class="flex items-center gap-2 text-sm text-[#8D95A5] hover:text-gray-600 transition-colors ml-1"
          @click="openDialog"
      >
        <svg class="hidden md:inline-block" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="text-xs md:text-sm ">{{ formatCount(localPost.comments_count ?? 0) }} комментариев</span>
      </button>

      <!-- просмотры — справа -->
      <span v-if="localPost.views" class="ml-auto text-xs md:text-sm text-[#8D95A5]">
        {{ formatCount(localPost.views) }} просмотров
      </span>
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