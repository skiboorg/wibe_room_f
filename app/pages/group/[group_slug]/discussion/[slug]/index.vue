<script setup lang="ts">
// ─── Types ───────────────────────────────────────────────────────────────────
export interface MessageAuthor {
  id: number
  full_name: string
  avatar: string | null
  is_admin?: boolean
}

export interface Reaction {
  like: number
}

export interface AttachedFile {
  id: string
  file: File
  preview: string | null
  name: string
  size: number
  type: 'image' | 'file'
}

export interface Message {
  id: number
  author: MessageAuthor
  content: string
  created_at: string
  reactions_count: Reaction
  my_reaction: 'like' | null
  reply_to?: { id: number; author_name: string; content_preview: string } | null
  attachments?: { id: number; url: string; type: 'image' | 'file'; name?: string; size?: number }[]
}

export interface DiscussionDetail {
  id: number
  title: string
  pages_count: number
  messages_count: number
}

// ─── Store & Route ────────────────────────────────────────────────────────────
const communityStore = useCommunityStore()
const { currentCommunity } = storeToRefs(communityStore)
const { $api } = useNuxtApp()
const route = useRoute()

// ─── State ────────────────────────────────────────────────────────────────────
const discussion = ref<DiscussionDetail | null>(null)
const messages = ref<Message[]>([])
const isLoading = ref(true)
const isSending = ref(false)
const currentPage = ref(Number(route.query.page) || 1)
const newMessage = ref('')
const replyTo = ref<Message | null>(null)
const messageInputRef = ref<HTMLTextAreaElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const attachedFiles = ref<AttachedFile[]>([])

// ─── Computed ─────────────────────────────────────────────────────────────────
const totalPages = computed(() => discussion.value?.pages_count ?? 1)

const canSend = computed(() => newMessage.value.trim().length > 0 || attachedFiles.value.length > 0)

const visiblePages = computed(() => {
  const total = totalPages.value
  const cur = currentPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | '...')[] = [1, 2, 3]
  if (cur > 4) pages.push('...')
  for (let p = Math.max(4, cur - 1); p <= Math.min(total - 3, cur + 1); p++) pages.push(p)
  if (cur < total - 3) pages.push('...')
  pages.push(total - 2, total - 1, total)
  return [...new Set(pages)]
})

// ─── Fetch ────────────────────────────────────────────────────────────────────
async function fetchMessages(page = 1) {
  isLoading.value = true
  try {
    // Когда бек готов:
    // const resp = await $api.community.discussion_messages({
    //   slug: route.params.group_slug,
    //   id: route.params.id,
    //   page,
    // })
    // discussion.value = resp.discussion
    // messages.value = resp.results

    // ── Mock ──
    await new Promise(r => setTimeout(r, 300))
    discussion.value = {
      id: Number(route.params.id),
      title: 'База таргетологов',
      pages_count: 414,
      messages_count: 8253,
    }
    messages.value = [
      {
        id: 1,
        author: { id: 10, full_name: 'Наталья Пехотова', avatar: null, is_admin: true },
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        content: `В этой теме можно оставить своё резюме. Пожалуйста, заполните заявку по образцу:\n\n1. Какие виды услуг вы оказываете? (Настройка таргетированной рекламы, комплексное сопровождение и т.д.)\n\n2. С какими нишами вы работаете? За какие проекты не беретесь?\n\n3. Где вы обучались? Есть ли у вас сертификаты?\n\n4. Ссылки на кейсы, если есть\n\n5. Ссылка на отзывы, если есть`,
        reactions_count: { like: 664 },
        my_reaction: null,
        reply_to: null,
      },
      {
        id: 2,
        author: { id: 11, full_name: 'Иван Иваныч', avatar: null },
        created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        content: '@natalya.pekh Боги, скальды и берсерки. Меч пронзает чьё-то сердце. Умирают Тор и Один. Ты ушла, и я свободен',
        reactions_count: { like: 664 },
        my_reaction: null,
        reply_to: null,
      },
      {
        id: 3,
        author: { id: 12, full_name: 'Молчаливый Боб', avatar: null },
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        content: 'Срал в бане вчера',
        reactions_count: { like: 5 },
        my_reaction: null,
        reply_to: null,
      },
    ]
    // ── End mock ──
  } finally {
    isLoading.value = false
  }
}

onMounted(() => fetchMessages(currentPage.value))

// ─── Файлы ───────────────────────────────────────────────────────────────────
function openFilePicker() {
  fileInputRef.value?.click()
}

function onFilesSelected(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files) return
  Array.from(input.files).forEach(file => {
    const isImage = file.type.startsWith('image/')
    const entry: AttachedFile = {
      id: `${Date.now()}-${Math.random()}`,
      file,
      preview: null,
      name: file.name,
      size: file.size,
      type: isImage ? 'image' : 'file',
    }
    if (isImage) {
      const reader = new FileReader()
      reader.onload = ev => { entry.preview = ev.target?.result as string }
      reader.readAsDataURL(file)
    }
    attachedFiles.value.push(entry)
  })
  input.value = ''
}

function removeAttachment(id: string) {
  attachedFiles.value = attachedFiles.value.filter(f => f.id !== id)
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`
}

// ─── Отправка ────────────────────────────────────────────────────────────────
async function sendMessage() {
  if (!canSend.value || isSending.value) return
  isSending.value = true
  try {
    // Когда бек готов:
    // const form = new FormData()
    // form.append('content', newMessage.value)
    // if (replyTo.value) form.append('reply_to', String(replyTo.value.id))
    // attachedFiles.value.forEach(f => form.append('files', f.file))
    // await $api.community.discussion_send({ slug: route.params.group_slug, id: route.params.id, data: form })

    const msg: Message = {
      id: Date.now(),
      author: { id: 0, full_name: 'Вы', avatar: null },
      content: newMessage.value,
      created_at: new Date().toISOString(),
      reactions_count: { like: 0 },
      my_reaction: null,
      reply_to: replyTo.value
          ? { id: replyTo.value.id, author_name: replyTo.value.author.full_name, content_preview: replyTo.value.content.slice(0, 80) }
          : null,
      attachments: attachedFiles.value.map((f, i) => ({
        id: i,
        url: f.preview ?? '',
        type: f.type,
        name: f.name,
        size: f.size,
      })),
    }
    messages.value.push(msg)
    newMessage.value = ''
    attachedFiles.value = []
    replyTo.value = null
    await nextTick()
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  } finally {
    isSending.value = false
  }
}

function setReply(msg: Message) {
  replyTo.value = msg
  messageInputRef.value?.focus()
}

function cancelReply() {
  replyTo.value = null
}

async function toggleLike(msg: Message) {
  if (!currentCommunity.value?.is_member) return
  if (msg.my_reaction === 'like') {
    msg.reactions_count.like = Math.max(0, msg.reactions_count.like - 1)
    msg.my_reaction = null
  } else {
    msg.reactions_count.like++
    msg.my_reaction = 'like'
  }
}

function onPageChange(page: number) {
  currentPage.value = page
  fetchMessages(page)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function formatTime(iso: string) {
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const min = Math.floor(diff / 60000)
  if (min < 60) return `· ${min} мин назад`
  const h = Math.floor(min / 60)
  if (h < 24) return `· ${h} ч назад`
  return '· ' + d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function autoResize(e: Event) {
  const el = e.target as HTMLTextAreaElement
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 160) + 'px'
}

function onEnterKey(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}
</script>

<template>
  <div>
    <!-- ══════════════════════════════════════════════════
         Карточка: бредкрамбы + заголовок + пагинация
    ══════════════════════════════════════════════════ -->
    <CardBase padding="md" class="mb-4">
      <!-- Breadcrumbs -->
      <div class="flex items-center flex-wrap gap-x-2 gap-y-0.5 text-sm text-[#8D95A5] mb-5">
        <NuxtLink :to="`/group/${route.params.group_slug}`" class="hover:text-black transition-colors">
          {{ currentCommunity?.name ?? 'Группа' }}
        </NuxtLink>
        <span class="text-[#C6CAD2]">›</span>
        <NuxtLink :to="`/group/${route.params.group_slug}/discussion`" class="hover:text-black transition-colors">
          Обсуждения
        </NuxtLink>
        <span class="text-[#C6CAD2]">›</span>
        <span>Просмотр темы</span>
        <span class="text-[#8D95A5]">{{ discussion?.messages_count }}</span>
      </div>

      <!-- Заголовок + пагинация в одну строку -->
      <div class="flex items-center justify-between gap-4">
        <h1 class="font-bold text-xl leading-snug">
          {{ discussion?.title ?? '…' }}
        </h1>

        <!-- Пагинация: 1 2 3 … 412 413 414 -->
        <div v-if="totalPages > 1" class="flex items-center gap-0.5 shrink-0">
          <button
              v-for="page in visiblePages"
              :key="page"
              :disabled="page === '...'"
              :class="[
              'min-w-[36px] h-9 px-2 rounded-lg text-sm font-medium transition-colors',
              page === currentPage
                ? 'bg-[#F1F2F4] text-black'
                : page === '...'
                  ? 'cursor-default text-[#8D95A5] min-w-0'
                  : 'text-black hover:bg-[#F1F2F4]'
            ]"
              @click="typeof page === 'number' && onPageChange(page)"
          >{{ page }}</button>
        </div>
      </div>
    </CardBase>

    <!-- ══════════════════════════════════════════════════
         Форма отправки
    ══════════════════════════════════════════════════ -->
    <CardBase padding="md" class="mb-4">
      <!-- Reply preview -->
      <div v-if="replyTo" class="flex items-start gap-2 mb-3 p-2.5 bg-[#F1F2F4] rounded-lg">
        <div class="flex-1 min-w-0">
          <p class="font-medium text-xs text-[#8D95A5] mb-0.5">Ответ для {{ replyTo.author.full_name }}</p>
          <p class="text-[#8D95A5] truncate text-xs">{{ replyTo.content.slice(0, 80) }}…</p>
        </div>
        <button @click="cancelReply" class="text-[#8D95A5] hover:text-black shrink-0 mt-0.5">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <!-- Превью прикреплённых файлов -->
      <div v-if="attachedFiles.length" class="flex flex-wrap gap-2 mb-3">
        <div v-for="f in attachedFiles" :key="f.id" class="relative group/att">
          <!-- Картинка -->
          <div v-if="f.type === 'image' && f.preview" class="w-16 h-16 rounded-lg overflow-hidden border border-[#E2E4E9]">
            <img :src="f.preview" class="w-full h-full object-cover" />
          </div>
          <!-- Файл -->
          <div v-else class="flex items-center gap-2 h-14 px-3 rounded-lg border border-[#E2E4E9] bg-[#F7F8FA] max-w-[180px]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" class="shrink-0 text-[#8D95A5]">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M14 2v6h6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <div class="min-w-0">
              <p class="text-xs font-medium truncate leading-snug">{{ f.name }}</p>
              <p class="text-[10px] text-[#8D95A5]">{{ formatFileSize(f.size) }}</p>
            </div>
          </div>
          <!-- Удалить -->
          <button
              class="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-black text-white flex items-center justify-center opacity-0 group-hover/att:opacity-100 transition-opacity"
              @click="removeAttachment(f.id)"
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path d="M1 1L7 7M7 1L1 7" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Input row -->
      <div class="flex items-center gap-3">
        <!-- Аватар пользователя -->
        <div class="w-10 h-10 rounded-full bg-[#E2E4E9] flex items-center justify-center text-xs font-semibold text-[#8D95A5] shrink-0">
          Я
        </div>

        <!-- Поле ввода с иконками внутри -->
        <div class="flex-1 flex items-center gap-2 bg-[#F1F2F4] rounded-xl px-4 py-2.5">
          <textarea
              ref="messageInputRef"
              v-model="newMessage"
              placeholder="Написать сообщение..."
              rows="1"
              class="flex-1 resize-none bg-transparent text-sm outline-none placeholder-[#8D95A5] leading-relaxed"
              style="max-height: 160px; overflow-y: auto;"
              @input="autoResize"
              @keydown="onEnterKey"
          />

          <!-- Кнопка прикрепить файл/картинку -->
          <button
              class="shrink-0 text-[#8D95A5] hover:text-black transition-colors"
              title="Прикрепить файл или изображение"
              @click="openFilePicker"
          >
            <!-- иконка: квадрат с горами (как на скриншоте) -->
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2.5" stroke="currentColor" stroke-width="1.7"/>
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
              <path d="M3 15.5l4.5-4.5 3.5 3.5 2.5-2.5L18 17" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

          <input
              ref="fileInputRef"
              type="file"
              multiple
              class="hidden"
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.txt"
              @change="onFilesSelected"
          />
        </div>

        <!-- Кнопка отправки -->
        <button
            :disabled="!canSend || isSending"
            :class="[
            'w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0',
            canSend
              ? 'bg-[#8D95A5] hover:bg-black text-white cursor-pointer'
              : 'bg-[#E2E4E9] text-[#C6CAD2] cursor-not-allowed'
          ]"
            @click="sendMessage"
        >
          <!-- стрелка вправо -->
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </CardBase>

    <!-- ══════════════════════════════════════════════════
         Сообщения — скелетон
    ══════════════════════════════════════════════════ -->
    <div v-if="isLoading" class="space-y-3">
      <CardBase v-for="n in 3" :key="n" padding="md" class="animate-pulse">
        <div class="flex gap-3">
          <div class="w-10 h-10 rounded-full bg-[#E2E4E9] shrink-0" />
          <div class="flex-1 space-y-2 pt-1">
            <div class="h-3 w-36 bg-[#E2E4E9] rounded" />
            <div class="h-4 w-full bg-[#E2E4E9] rounded" />
            <div class="h-4 w-3/4 bg-[#E2E4E9] rounded" />
          </div>
        </div>
      </CardBase>
    </div>

    <!-- ══════════════════════════════════════════════════
         Сообщения
    ══════════════════════════════════════════════════ -->
    <div v-else class="space-y-3">
      <CardBase v-for="msg in messages" :key="msg.id" padding="md" class="group">
        <div class="flex items-start gap-3">
          <!-- Avatar -->
          <div class="shrink-0">
            <div v-if="msg.author.avatar" class="w-10 h-10 rounded-full overflow-hidden">
              <img :src="msg.author.avatar" :alt="msg.author.full_name" class="w-full h-full object-cover" />
            </div>
            <div v-else class="w-10 h-10 rounded-full bg-[#E2E4E9] flex items-center justify-center text-sm font-semibold text-[#8D95A5]">
              {{ getInitials(msg.author.full_name) }}
            </div>
          </div>

          <!-- Body -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center flex-wrap gap-x-2 gap-y-0.5 mb-2">
              <span class="font-semibold text-sm">{{ msg.author.full_name }}</span>
              <span
                  v-if="msg.author.is_admin"
                  class="text-xs text-[#22C55E] font-medium border border-[#BBF7D0] rounded-full px-2 py-0.5 leading-none"
              >Автор</span>
              <span class="text-xs text-[#8D95A5]">{{ formatTime(msg.created_at) }}</span>
              <button class="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-[#8D95A5] hover:text-black">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>

            <!-- Reply-to -->
            <div v-if="msg.reply_to" class="mb-3 pl-3 border-l-2 border-[#C6CAD2] text-xs text-[#8D95A5]">
              <p class="font-medium mb-0.5">{{ msg.reply_to.author_name }}</p>
              <p class="line-clamp-2">{{ msg.reply_to.content_preview }}…</p>
            </div>

            <!-- Content -->
            <div class="text-sm leading-relaxed whitespace-pre-wrap break-words text-black/90">{{ msg.content }}</div>

            <!-- Attachments -->
            <div v-if="msg.attachments?.length" class="mt-3 flex flex-wrap gap-2">
              <a
                  v-for="att in msg.attachments.filter(a => a.type === 'image' && a.url)"
                  :key="att.id"
                  :href="att.url"
                  target="_blank"
              >
                <img :src="att.url" class="max-h-48 max-w-xs rounded-lg object-cover border border-[#E2E4E9]" />
              </a>
              <a
                  v-for="att in msg.attachments.filter(a => a.type === 'file')"
                  :key="`f-${att.id}`"
                  :href="att.url"
                  target="_blank"
                  class="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#E2E4E9] bg-[#F7F8FA] hover:bg-[#ECEEF2] transition-colors text-sm"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="text-[#8D95A5] shrink-0">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M14 2v6h6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span class="truncate max-w-[140px]">{{ att.name ?? 'Файл' }}</span>
                <span v-if="att.size" class="text-xs text-[#8D95A5] shrink-0">{{ formatFileSize(att.size) }}</span>
              </a>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-4 mt-3">
              <button
                  class="flex items-center gap-1.5 text-xs transition-colors"
                  :class="msg.my_reaction === 'like' ? 'text-red-500' : 'text-[#8D95A5] hover:text-red-400'"
                  @click="toggleLike(msg)"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                      :fill="msg.my_reaction === 'like' ? 'currentColor' : 'none'"
                      stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"
                  />
                </svg>
                <span>{{ msg.reactions_count.like }}</span>
              </button>

              <button
                  class="flex items-center gap-1.5 text-xs text-[#8D95A5] hover:text-black transition-colors"
                  @click="setReply(msg)"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M3 10H13C17.418 10 21 13.582 21 18V20M3 10L9 4M3 10L9 16" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Ответить
              </button>
            </div>
          </div>
        </div>
      </CardBase>
    </div>

    <!-- Pagination bottom -->
    <div v-if="totalPages > 1" class="flex items-center gap-0.5 mt-6">
      <button
          v-for="page in visiblePages"
          :key="page"
          :disabled="page === '...'"
          :class="[
          'min-w-[36px] h-9 px-2 rounded-lg text-sm font-medium transition-colors',
          page === currentPage
            ? 'bg-[#F1F2F4] text-black'
            : page === '...'
              ? 'cursor-default text-[#8D95A5]'
              : 'text-black hover:bg-[#F1F2F4]'
        ]"
          @click="typeof page === 'number' && onPageChange(page)"
      >{{ page }}</button>
    </div>
  </div>
</template>