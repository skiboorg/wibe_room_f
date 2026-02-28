<script setup lang="ts">
import type { FullResult, CommunityTag } from "~/repository/community/types";

definePageMeta({
  auth: false,
  layout: 'group-form'
})
const communityStore = useCommunityStore()
const {fetchCommunity} = communityStore
import { useToast } from 'primevue/usetoast';
const toast = useToast()
const { $api } = useNuxtApp()
const { callHook } = useNuxtApp()
const community = communityStore.currentCommunity

const props = defineProps(['is_edit_mode'])
const errors = ref<Record<string, string>>({})
const loading = ref(false)

const fileInput = ref<HTMLInputElement>()
const photosInput = ref<HTMLInputElement>()
const availableTags = ref<CommunityTag[]>([])
const isEditMode = ref(false)

const form = ref<FullResult>({
  name: '',
  slug: null,
  short_description: '',
  long_description: '',
  cover: null,
  community_links: [],
  community_photos: [],      // ← только НОВЫЕ файлы
  community_tags: [],
  photos_to_delete: [],
})

// ID фотографий на удаление
const photosToDelete = ref<number[]>([])

// Превью (старые + новые фото)
const previewImages = ref<{
  cover: string | null,
  photos: Array<{ id?: number; url: string; isMarkedForDelete: boolean }>
}>({
  cover: null,
  photos: []
})

const { data: tags } = useHttpRequest(
    useAsyncData(() => $api.community.tags())
)

const fillFormWithCommunityData = () => {
  if (!community) return

  isEditMode.value = true

  form.value.name = community.name || ''
  form.value.slug = community.slug || ''
  form.value.short_description = community.short_description || ''
  form.value.long_description = community.long_description || ''

  form.value.community_tags = [...(community.community_tags || [])]
  form.value.community_links = community.community_links.map(link => ({
    title: link.title || '',
    url: link.url || ''
  }))

  // обложка
  if (community.cover) {
    previewImages.value.cover = community.cover
  }

  // старые фото в превью
  previewImages.value.photos = community.community_photos.map(photo => ({
    id: photo.id,
    url: photo.image,
    isMarkedForDelete: false
  }))

  // ⚠️ ВАЖНО: существующие фото НЕ должны попадать в FormData
  form.value.community_photos = []
}

onMounted(async () => {
  try {
    const response = await $api.community.tags()
    availableTags.value = response.data || []
  } catch (e) {}

  if (props.is_edit_mode) {
    fillFormWithCommunityData()
  }
})

// загрузка обложки
const handleCoverUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files?.length) return

  const file = target.files[0]
  form.value.cover = file

  const reader = new FileReader()
  reader.onload = e => {
    previewImages.value.cover = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

// загрузка НОВЫХ фото
const handlePhotosUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files?.length) return

  const files = Array.from(target.files)

  files.forEach(file => {
    form.value.community_photos.push(file)

    const reader = new FileReader()
    reader.onload = e => {
      previewImages.value.photos.push({
        url: e.target?.result as string,
        isMarkedForDelete: false
      })
    }
    reader.readAsDataURL(file)
  })

  if (photosInput.value) photosInput.value.value = ''
}

// удаление фото
const removePhoto = (index: number) => {
  const photo = previewImages.value.photos[index]

  // существующее фото
  if (isEditMode.value && photo.id) {
    photo.isMarkedForDelete = true
    photosToDelete.value.push(photo.id)
    return
  }

  // новое фото
  previewImages.value.photos.splice(index, 1)
  form.value.community_photos.splice(index, 1)
}

// восстановление фото
const restorePhoto = (index: number) => {
  const photo = previewImages.value.photos[index]
  if (!photo.id) return

  photo.isMarkedForDelete = false

  const delIdx = photosToDelete.value.indexOf(photo.id)
  if (delIdx !== -1) {
    photosToDelete.value.splice(delIdx, 1)
  }
}

// ссылки
const addLink = () => {
  form.value.community_links.push({ title: '', url: '' })
}
const removeLink = (index: number) => {
  form.value.community_links.splice(index, 1)
}

// проверка URL
const isValidUrl = (string: string): boolean => {
  try {
    new URL(string)
    return true
  } catch {
    return false
  }
}

// валидация
const validateForm = (): boolean => {
  errors.value = {}

  if (!form.value.name.trim()) {
    errors.value.name = 'Название обязательно'
  }

  if (form.value.name.length > 255) {
    errors.value.name = 'Слишком длинное название'
  }

  if (form.value.short_description.length > 500) {
    errors.value.short_description = 'Короткое описание слишком длинное'
  }

  form.value.community_links.forEach((l, i) => {
    if (l.title && !l.url) errors.value[`link_${i}`] = 'Введите URL'
    if (l.url && !l.title) errors.value[`link_${i}`] = 'Введите название'
    if (l.url && !isValidUrl(l.url)) errors.value[`link_${i}`] = 'Некорректный URL'
  })

  return Object.keys(errors.value).length === 0
}

const { send } = useForm({
  apiFn: props.is_edit_mode ? $api.community.update : $api.community.create,
  formData: form.value,
  asFormData: true,
  onSuccess: async (data)=>{
    toast.add({
      severity: 'success',
      summary: 'Успешно',
      detail: isEditMode.value ? 'Cообщество обновлено' : 'Cообщество создано',
      life: 2000
    })
    await callHook('community:refresh')
    await fetchCommunity(community.slug)
    isEditMode.value ? navigateTo(`/group/${community?.slug}`) : navigateTo(`/group/${data.slug}`)
  }
})

const submitForm = async () => {
  if (!validateForm()) return
  loading.value = true

  try {
    if (isEditMode.value) {
      form.value.photos_to_delete = photosToDelete.value
      await send()
    } else {
      await send()
    }
  } catch (error: any) {
    if (error.response?.data) {
      errors.value = error.response.data
    } else {
      toast.add({
        severity: 'error',
        summary: 'Ошибка',
        detail: 'Не удалось сохранить сообщество',
        life: 4000
      })
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen ">
    <div class="container ">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">
          {{ isEditMode ? 'Редактировать сообщество' : 'Создать новое сообщество' }}
        </h1>
        <p class="text-gray-600 mt-2">
          {{ isEditMode ? 'Обновите информацию о вашем сообществе' : 'Заполните информацию о вашем сообществе' }}
        </p>
      </div>

      <!-- Форма -->
      <form @submit.prevent="submitForm" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <!-- Название сообщества -->
        <div class="mb-6">
          <UIInput
              v-model="form.name"
              id="name"
              label="Название сообщества *"
              placeholder="Введите название сообщества"
              fluid
              :error="errors.name"
          />
        </div>

        <!-- Короткое описание -->
        <div class="mb-6">
          <Textarea
              auto-resize
              v-model="form.short_description"
              id="short_description"
              label="Короткое описание"
              placeholder="Краткое описание вашего сообщества"
              fluid
              :error="errors.short_description"
          />
        </div>

        <!-- Длинное описание -->
        <div class="mb-6">
          <label for="long_description" class="block text-sm font-medium text-gray-700 mb-2">
            Длинное описание
          </label>
          <ClientOnly>
            <Editor
                v-model="form.long_description"
                :class="{ 'border-red-500': errors.long_description }"
                class="w-full  rounded-md"
            />
          </ClientOnly>
          <div v-if="errors.long_description" class="text-red-500 text-sm mt-1">
            {{ errors.long_description }}
          </div>
        </div>

        <!-- Теги -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Теги сообщества
          </label>
          <MultiSelect
              v-model="form.community_tags"
              :options="tags?.filter(x=>x.slug !=='all')"
              optionLabel="name"
              :placeholder="form.community_tags.length ? '' : 'Выберите теги'"
              display="chip"
              class="w-full"
              :class="{ 'border-red-500': errors.community_tags }"
          />
          <div v-if="errors.community_tags" class="text-red-500 text-sm mt-1">
            {{ errors.community_tags }}
          </div>
        </div>

        <!-- Обложка -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Обложка сообщества
          </label>
          <div class="flex items-center gap-4">
            <div v-if="previewImages.cover" class="w-32 h-32 border rounded-md overflow-hidden">
              <img :src="previewImages.cover" alt="Preview cover" class="w-full h-full object-cover" />
            </div>
            <div class="flex-1">
              <input
                  type="file"
                  ref="fileInput"
                  @change="handleCoverUpload"
                  accept="image/*"
                  class="hidden"
              />
              <Button
                  @click="fileInput?.click()"
                  :label="previewImages.cover ? 'Изменить обложку' : 'Выбрать обложку'"
                  severity="secondary"
                  size="small"
              />
              <div class="text-sm text-gray-500 mt-2">
                Рекомендуемый размер: 1200×400px
              </div>
            </div>
          </div>
          <div v-if="errors.cover" class="text-red-500 text-sm mt-1">
            {{ errors.cover }}
          </div>
        </div>

        <!-- Фотографии сообщества -->
        <div class="mb-6">
          <div class="flex items-center justify-between mb-4">
            <label class="block text-sm font-medium text-gray-700">
              Фотографии сообщества
            </label>
            <div>
              <input
                  type="file"
                  ref="photosInput"
                  @change="handlePhotosUpload"
                  accept="image/*"
                  multiple
                  class="hidden"
              />
              <Button
                  @click="photosInput?.click()"
                  label="Добавить фотографии"
                  severity="secondary"
                  size="small"
                  icon="pi pi-plus"
              />
            </div>
          </div>

          <!-- Сетка превью фотографий -->
          <div v-if="previewImages.photos.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
            <div
                v-for="(photo, index) in previewImages.photos"
                :key="index"
                class="relative group"
            >
              <img
                  :src="photo.url"
                  :alt="`Photo ${index + 1}`"
                  class="w-full h-32 object-cover rounded-lg border"
                  :class="{'opacity-50': photo.isMarkedForDelete}"
              />
              <div class="absolute inset-0 flex items-center justify-center" v-if="photo.isMarkedForDelete">
                <span class="bg-red-500 text-white px-2 py-1 rounded text-sm">Будет удалено</span>
              </div>
              <div class="absolute -top-2 -right-2 flex gap-1">
                <Button
                    v-if="!photo.isMarkedForDelete"
                    @click="removePhoto(index)"
                    severity="danger"
                    size="small"
                    icon="pi pi-trash"
                    class="opacity-0 group-hover:opacity-100 transition-opacity"
                />
                <Button
                    v-else
                    @click="restorePhoto(index)"
                    severity="success"
                    size="small"
                    icon="pi pi-undo"
                    class="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <div class="text-gray-500">
              <i class="pi pi-image text-2xl mb-2 block"></i>
              <p>Нет загруженных фотографий</p>
            </div>
          </div>

          <div class="text-sm text-gray-500">
            Вы можете загрузить несколько фотографий одновременно
          </div>
          <div v-if="errors.community_photos" class="text-red-500 text-sm mt-1">
            {{ errors.community_photos }}
          </div>
        </div>

        <!-- Ссылки -->
        <div class="mb-6">
          <div class="flex items-center justify-between mb-4">
            <label class="block text-sm font-medium text-gray-700">
              Ссылки сообщества
            </label>
            <Button
                @click="addLink"
                label="Добавить ссылку"
                severity="secondary"
                size="small"
                icon="pi pi-plus"
            />
          </div>

          <div v-for="(link, index) in form.community_links" :key="index" class="flex gap-3 mb-3">
            <InputText
                v-model="link.title"
                :id="`link-title-${index}`"
                placeholder="Название ссылки"
                class="flex-1"
            />
            <InputText
                v-model="link.url"
                :id="`link-url-${index}`"
                placeholder="https://example.com"
                class="flex-1"
            />
            <Button
                @click="removeLink(index)"
                severity="danger"
                size="small"
                icon="pi pi-trash"
                class="flex-shrink-0"
            />
          </div>
          <div v-if="form.community_links.length === 0" class="text-center py-4 text-gray-500">
            Нет добавленных ссылок
          </div>
        </div>

        <!-- Кнопки действий -->
        <div class="flex gap-3 justify-end pt-6 border-t border-gray-200">
          <Button
              type="button"
              @click="$router.back()"
              label="Отмена"
              severity="secondary"
              variant="outlined"
          />
          <Button
              type="submit"
              :loading="loading"
              :label="isEditMode ? 'Обновить сообщество' : 'Создать сообщество'"
              :disabled="loading"
          />
        </div>
      </form>
    </div>
  </div>
</template>