<script setup lang="ts">
import type { Post, PostComment } from '~/repository/community/types'

const props = defineProps<{
  post: Post
}>()

const emits = defineEmits(['close', 'comment-added'])

const { $api } = useNuxtApp()

// ── комментарии ───────────────────────────────────────────────
const comments = ref<PostComment[]>([])
const loadingComments = ref(true)

async function fetchComments() {
  loadingComments.value = true
  try {
    const data = await $api.community.post_comments(props.post.id!)
    comments.value = data as PostComment[]
  } catch (e) {
    console.error(e)
  } finally {
    loadingComments.value = false
  }
}

onMounted(fetchComments)

// ── новый комментарий к посту ─────────────────────────────────
const newCommentText = ref('')
const newCommentPhoto = ref<File | null>(null)
const newCommentPhotoPreview = ref<string | null>(null)
const sendingComment = ref(false)

function onPhotoSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  newCommentPhoto.value = file
  newCommentPhotoPreview.value = URL.createObjectURL(file)
}

function removePhoto() {
  newCommentPhoto.value = null
  newCommentPhotoPreview.value = null
}

async function submitComment() {
  if (!newCommentText.value.trim()) return
  sendingComment.value = true
  try {
    const added = await $api.community.post_comment_add(props.post.id!, {
      text: newCommentText.value,
      parent: null,
      image: newCommentPhoto.value,
    })
    comments.value.push(added as PostComment)
    newCommentText.value = ''
    newCommentPhoto.value = null
    newCommentPhotoPreview.value = null
    emits('comment-added')
  } catch (e) {
    console.error(e)
  } finally {
    sendingComment.value = false
  }
}

// ── лайк на комментарий ───────────────────────────────────────
async function toggleCommentLike(comment: PostComment) {
  try {
    await $api.community.comment_react(comment.id, 'like')
    if (comment.my_reaction === 'like') {
      comment.reactions_count = { ...comment.reactions_count, like: Math.max(0, (comment.reactions_count?.like ?? 0) - 1) }
      comment.my_reaction = null
    } else {
      comment.reactions_count = { ...comment.reactions_count, like: (comment.reactions_count?.like ?? 0) + 1 }
      comment.my_reaction = 'like'
    }
  } catch (e) {
    console.error(e)
  }
}

async function toggleReplyLike(comment: PostComment, reply: PostComment) {
  try {
    await $api.community.comment_react(reply.id, 'like')
    if (reply.my_reaction === 'like') {
      reply.reactions_count = { ...reply.reactions_count, like: Math.max(0, (reply.reactions_count?.like ?? 0) - 1) }
      reply.my_reaction = null
    } else {
      reply.reactions_count = { ...reply.reactions_count, like: (reply.reactions_count?.like ?? 0) + 1 }
      reply.my_reaction = 'like'
    }
  } catch (e) {
    console.error(e)
  }
}

// ── ответ на комментарий (вложенная модалка) ──────────────────
const replyDialogVisible = ref(false)
const replyTarget = ref<PostComment | null>(null)
const replyText = ref('')
const replyPhoto = ref<File | null>(null)
const replyPhotoPreview = ref<string | null>(null)
const sendingReply = ref(false)
const replyInputKey = ref(0)

function openReplyDialog(comment: PostComment) {
  replyTarget.value = comment
  replyText.value = ''
  replyPhoto.value = null
  replyPhotoPreview.value = null
  replyInputKey.value++
  replyDialogVisible.value = true
}

function onReplyPhotoSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  replyPhoto.value = file
  replyPhotoPreview.value = URL.createObjectURL(file)
}

function removeReplyPhoto() {
  replyPhoto.value = null
  replyPhotoPreview.value = null
}

async function submitReply() {
  if (!replyText.value.trim() || !replyTarget.value) return
  sendingReply.value = true
  try {
    const added = await $api.community.post_comment_add(props.post.id!, {
      text: replyText.value,
      parent: replyTarget.value.id,
      image: replyPhoto.value,
    })
    const parent = comments.value.find(c => c.id === replyTarget.value!.id)
    if (parent) {
      parent.replies = parent.replies ?? []
      parent.replies.push(added as PostComment)
    }
    replyDialogVisible.value = false
  } catch (e) {
    console.error(e)
  } finally {
    sendingReply.value = false
  }
}

// ── удаление комментария ──────────────────────────────────────
async function deleteComment(comment: PostComment) {
  try {
    await $api.community.comment_delete(comment.id)
    const idx = comments.value.findIndex(c => c.id === comment.id)
    if (idx !== -1) {
      comments.value.splice(idx, 1)
    } else {
      // это ответ — ищем в replies
      for (const c of comments.value) {
        const rIdx = c.replies?.findIndex(r => r.id === comment.id) ?? -1
        if (rIdx !== -1) { c.replies!.splice(rIdx, 1); break }
      }
    }
  } catch (e) {
    console.error(e)
  }
}

// ── форматирование даты ───────────────────────────────────────
function formatDate(d: string) {
  return new Date(d).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <!-- основной диалог -->
  <Dialog
      :visible="true"
      modal
      :closable="false"
      :style="{ width: '640px' }"
      :pt="{
      root: { class: 'rounded-2xl !max-w-[96vw] w-full mx-2', style: 'overflow: hidden;' },
      header: { class: 'hidden', style: 'display: none;' },
      content: { class: 'p-0', style: 'overflow: hidden; padding: 0;' },
      footer: { class: 'hidden', style: 'display: none;' },
    }"
  >
    <div class="flex flex-col h-[90vh] max-h-[90vh] w-full overflow-hidden">

      <!-- ── шапка диалога ─────────────────────────────────── -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-[#E2E4E9]">
        <div class="flex items-center gap-2">
          <UIAvatar :image="post.added_by.avatar" size="sm" />
          <div>
            <p class="font-medium text-sm">{{ post.added_by.full_name }}</p>
            <p class="text-xs text-gray-400">{{ formatDate(post.date) }}</p>
          </div>
        </div>
        <button class="text-gray-400 hover:text-black transition-colors" @click="emits('close')">
          <i class="pi pi-times text-lg" />
        </button>
      </div>

      <!-- ── тело поста + комментарии (скролл) ────────────── -->
      <div class="overflow-y-auto overflow-x-hidden flex-1 min-h-0 px-5 py-4 space-y-5 w-full">

        <!-- контент поста -->
        <div>
          <img v-for="photo in post.photos" :key="photo.id"
               class="rounded-lg w-full max-h-[40vh] object-contain block mb-3 bg-gray-50" :src="photo.image" alt="" />

          <div class="flex flex-wrap gap-2 mb-3">
            <UIBadge v-for="tag in post.post_tags" :key="tag.id" :label="tag.name" />
          </div>

          <h3 class="font-semibold text-[18px] leading-[130%] mb-3">{{ post.title }}</h3>
          <div class="prose prose-sm max-w-full w-full break-words overflow-hidden text-gray-700" v-html="post.text" />
        </div>

        <div class="border-t border-[#E2E4E9]" />

        <!-- список комментариев -->
        <div v-if="loadingComments" class="flex justify-center py-6">
          <i class="pi pi-spin pi-spinner text-gray-400 text-2xl" />
        </div>

        <div v-else-if="comments.length === 0" class="text-center text-gray-400 text-sm py-4">
          Пока нет комментариев
        </div>

        <div v-else class="space-y-5">
          <div v-for="comment in comments" :key="comment.id">

            <!-- корневой комментарий -->
            <div class="flex gap-3">
              <UIAvatar :image="comment.author?.avatar" size="xs" class="mt-1 shrink-0" />
              <div class="flex-1">
                <div class="bg-[#F7F8FA] rounded-xl px-4 py-3">
                  <p class="font-medium text-sm">{{ comment.author?.full_name }}</p>
                  <p class="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{{ comment.text }}</p>
                  <img v-if="comment.image" :src="comment.image"
                       class="mt-2 max-h-48 rounded-lg object-cover cursor-pointer"
                       @click="window.open(comment.image, '_blank')" />
                </div>
                <!-- действия комментария -->
                <div class="flex items-center gap-4 mt-1 px-1">
                  <span class="text-xs text-gray-400">{{ formatDate(comment.date) }}</span>
                  <button
                      class="text-xs flex items-center gap-1 transition-colors"
                      :class="comment.my_reaction === 'like' ? 'text-red-500' : 'text-gray-400 hover:text-red-400'"
                      @click="toggleCommentLike(comment)"
                  >
                    <i class="pi pi-heart-fill text-[10px]" />
                    <span>{{ comment.reactions_count?.like ?? 0 }}</span>
                  </button>
                  <button
                      class="text-xs text-gray-400 hover:text-black transition-colors"
                      @click="openReplyDialog(comment)"
                  >
                    Ответить
                  </button>
                  <button
                      v-if="comment.can_delete"
                      class="text-xs text-red-400 hover:text-red-600 transition-colors ml-auto"
                      @click="deleteComment(comment)"
                  >
                    Удалить
                  </button>
                </div>

                <!-- вложенные ответы -->
                <div v-if="comment.replies?.length" class="mt-3 space-y-3 pl-2 border-l-2 border-[#E2E4E9]">
                  <div v-for="reply in comment.replies" :key="reply.id" class="flex gap-3">
                    <UIAvatar :image="reply.author?.avatar" size="xs" class="mt-1 shrink-0" />
                    <div class="flex-1">
                      <div class="bg-[#F7F8FA] rounded-xl px-4 py-3">
                        <p class="font-medium text-sm">{{ reply.author?.full_name }}</p>
                        <p class="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{{ reply.text }}</p>
                        <img v-if="reply.image" :src="reply.image"
                             class="mt-2 max-h-48 rounded-lg object-cover cursor-pointer"
                             @click="window.open(reply.image, '_blank')" />
                      </div>
                      <div class="flex items-center gap-4 mt-1 px-1">
                        <span class="text-xs text-gray-400">{{ formatDate(reply.date) }}</span>
                        <button
                            class="text-xs flex items-center gap-1 transition-colors"
                            :class="reply.my_reaction === 'like' ? 'text-red-500' : 'text-gray-400 hover:text-red-400'"
                            @click="toggleReplyLike(comment, reply)"
                        >
                          <i class="pi pi-heart-fill text-[10px]" />
                          <span>{{ reply.reactions_count?.like ?? 0 }}</span>
                        </button>
                        <button
                            v-if="reply.can_delete"
                            class="text-xs text-red-400 hover:text-red-600 transition-colors ml-auto"
                            @click="deleteComment(reply)"
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- ── форма добавления комментария (прикреплена снизу) ── -->
      <div class="border-t border-[#E2E4E9] px-5 py-4 bg-white">
        <!-- превью фото -->
        <div v-if="newCommentPhotoPreview" class="mb-3 relative inline-block">
          <img :src="newCommentPhotoPreview" class="h-20 w-20 object-cover rounded-lg border border-[#E2E4E9]" alt="" />
          <button
              class="absolute -top-2 -right-2 bg-white border border-[#E2E4E9] rounded-full w-5 h-5 flex items-center justify-center text-gray-400 hover:text-red-500"
              @click="removePhoto"
          >
            <i class="pi pi-times text-[10px]" />
          </button>
        </div>

        <div class="flex items-end gap-3">
          <UIAvatar size="xs" class="shrink-0 mb-1" />
          <div class="flex-1 flex items-end gap-2 border border-[#E2E4E9] rounded-xl px-3 py-2 focus-within:border-black transition-colors">
            <textarea
                v-model="newCommentText"
                placeholder="Написать комментарий..."
                rows="2"
                class="flex-1 resize-none outline-none text-sm bg-transparent leading-5 max-h-32 overflow-y-auto"
                @input="($event.target as HTMLTextAreaElement).style.height = 'auto'; ($event.target as HTMLTextAreaElement).style.height = ($event.target as HTMLTextAreaElement).scrollHeight + 'px'"
                @keydown.enter.exact.prevent="submitComment"
            />
            <!-- кнопка прикрепить фото -->
            <label class="cursor-pointer text-gray-400 hover:text-black transition-colors shrink-0">
              <i class="pi pi-image text-lg" />
              <input type="file" accept="image/*" class="hidden" @change="onPhotoSelect" />
            </label>
          </div>
          <button
              class="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
              :class="newCommentText.trim() ? 'bg-black text-white' : 'bg-[#F7F8FA] text-gray-300 pointer-events-none'"
              :disabled="sendingComment || !newCommentText.trim()"
              @click="submitComment"
          >
            <i class="pi pi-send text-sm" :class="sendingComment ? 'pi-spin pi-spinner' : ''" />
          </button>
        </div>
      </div>

    </div>
  </Dialog>

  <!-- ── диалог ответа на комментарий ──────────────────────── -->
  <Dialog
      v-model:visible="replyDialogVisible"
      modal
      header="Ответить на комментарий"
      :style="{ width: '480px', maxWidth: '96vw' }"
      :pt="{ header: { class: 'font-semibold text-base' } }"
      @hide="removeReplyPhoto"
  >
    <!-- цитата -->
    <div v-if="replyTarget" class="bg-[#F7F8FA] rounded-xl px-4 py-3 mb-4">
      <p class="text-xs text-gray-400 mb-1">{{ replyTarget.author?.full_name }}</p>
      <p class="text-sm text-gray-700 line-clamp-3">{{ replyTarget.text }}</p>
    </div>

    <!-- превью фото ответа -->
    <div v-if="replyPhotoPreview" class="mb-3 relative inline-block">
      <img :src="replyPhotoPreview" class="h-20 w-20 object-cover rounded-lg border border-[#E2E4E9]" alt="" />
      <button
          class="absolute -top-2 -right-2 bg-white border border-[#E2E4E9] rounded-full w-5 h-5 flex items-center justify-center text-gray-400 hover:text-red-500"
          @click="removeReplyPhoto"
      >
        <i class="pi pi-times text-[10px]" />
      </button>
    </div>

    <!-- поле ввода ответа -->
    <div class="flex items-end gap-2 border border-[#E2E4E9] rounded-xl px-3 py-2 focus-within:border-black transition-colors mb-4">
      <textarea
          v-model="replyText"
          placeholder="Ваш ответ..."
          rows="3"
          class="flex-1 resize-none outline-none text-sm bg-transparent leading-5"
      />
      <label class="cursor-pointer text-gray-400 hover:text-black transition-colors shrink-0">
        <i class="pi pi-image text-lg" />
        <input :key="replyInputKey" type="file" accept="image/*" class="hidden" @change="onReplyPhotoSelect" />
      </label>
    </div>

    <div class="flex justify-end gap-3">
      <button
          class="px-4 py-2 rounded-lg border border-[#E2E4E9] text-sm hover:bg-[#F7F8FA] transition-colors"
          @click="replyDialogVisible = false"
      >
        Отмена
      </button>
      <button
          class="px-4 py-2 rounded-lg bg-black text-white text-sm disabled:opacity-40 transition-opacity"
          :disabled="sendingReply || !replyText.trim()"
          @click="submitReply"
      >
        <i v-if="sendingReply" class="pi pi-spin pi-spinner mr-1" />
        Отправить
      </button>
    </div>
  </Dialog>
</template>