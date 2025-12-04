<script setup lang="ts">

import type {Post, PostTag, PostPhoto} from "~/repository/community/types";
import { useToast } from 'primevue/usetoast';
const toast = useToast()
const props = defineProps(['is_edit_mode'])
const communityStore = useCommunityStore()
const { $api } = useNuxtApp()
const {currentCommunity} = communityStore

const {data:tags} = useHttpRequest( useAsyncData(()=>$api.community.post_tags(currentCommunity.slug)))
// Reactive data
const formData = ref<Post>({
  title: '',
  community: currentCommunity?.id | null,
  post_tags:[],
  vk_video_link: '',
  text: '',
  new_tags:[],
  photos:[],
  is_pinned: false
})

const newTagName = ref('')
const selectedPhotos = ref<PostPhoto[]>([])
const loading = ref(false)
const errors = reactive({
  title: '',
  community: '',
  text: ''
})

// Methods
const validateField = (field: keyof typeof errors) => {
  switch (field) {
    case 'title':
      errors.title = formData.value.title.trim() ? '' : 'Заголовок обязателен'
      break
    case 'text':
      errors.text = formData.value.text.trim() ? '' : 'Текст записи обязателен'
      break
  }
}

const validateForm = (): boolean => {
  validateField('title')
  validateField('community')
  validateField('text')

  return !errors.title && !errors.community && !errors.text
}

const addTag = () => {
  const tagName = newTagName.value.trim()
  if (!tagName) return

  // Проверяем, есть ли уже такой тег
  const existingTag = formData.value.new_tags.find(tag =>
      tag.toLowerCase() === tagName.toLowerCase()
  )

  if (!existingTag) {
    formData.value.new_tags.push(tagName)
  }

  newTagName.value = ''
}

const removeTag = (index) => {
  formData.value.new_tags.splice(index, 1)
}

const handleFileSelect = (event: any) => {
  const files = Array.from(event.files) as File[]

  files.forEach(file => {
    if (file.type.startsWith('image/')) {
      const preview = URL.createObjectURL(file)
      selectedPhotos.value.push({ file, preview })
    }
  })
}

const removePhoto = (index: number) => {
  // Освобождаем URL объекта
  URL.revokeObjectURL(selectedPhotos.value[index].preview)
  selectedPhotos.value.splice(index, 1)
}

const { send } = useForm({
  apiFn:  $api.community.post_create,
  formData: formData.value,
  asFormData: true,
  onSuccess: async ()=>{
    toast.add({ severity: 'success',summary:'Успешно', detail: 'Пост создан', life: 3000 });
    navigateTo(`/group/${currentCommunity?.slug}`)

  }
})


const handleSubmit = async () => {
  // if (!validateForm()) {
  //   return
  // }

  loading.value = true

  try {

    formData.value.photos = selectedPhotos.value.map(photo => photo.file)
    await send()

  } catch (error) {
    console.error('Ошибка при создании записи:', error)
  } finally {
    loading.value = false
  }
}

// Cleanup
onUnmounted(() => {
  selectedPhotos.value.forEach(photo => URL.revokeObjectURL(photo.preview))
})
</script>
<template>
<!--  {{formData}}-->
  <div class="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
    <h2 class="text-2xl font-bold mb-6">Создание новой записи</h2>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Заголовок -->
      <UIInput
          id="title"
          v-model="formData.title"
          label="Заголовок *"
          placeholder="Введите заголовок записи"
          :fluid="true"
          :error="errors.title"
          @blur="validateField('title')"
      />

      <!-- Выбор сообщества -->
      <div class="w-full">
        <label for="community" class="block text-sm font-medium text-gray-700 mb-2">
          Выберите теги
        </label>
        <MultiSelect
            v-model="formData.post_tags"
            :options="tags?.filter(x=>x.slug !=='all')"
            optionLabel="name"
            placeholder="Выберите теги"
            display="chip"
            option-value="id"
            class="w-full"
            :class="{ 'border-red-500': errors.community_tags }"
        />

        <small v-if="errors.community" class="text-red-400 text-xs">{{ errors.community }}</small>
      </div>

      <!-- Теги -->
      <div class="w-full">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Или добавьте свои
        </label>
        <div class="flex flex-wrap gap-2 mb-2">
          <div class="flex items-center gap-2"  v-for="(tag,index) in formData.new_tags"
               :key="index">
            <UIBadge

                :label="tag"

            />
            <i @click="removeTag(index)" class="pi pi-times cursor-pointer"></i>
          </div>


        </div>
        <div class="flex gap-2">
          <InputText
              v-model="newTagName"
              placeholder="Введите название тега"
              class="flex-1"
              @keydown.enter.prevent="addTag"
          />
          <Button
              icon="pi pi-plus"
              label="Добавить"
              @click="addTag"
              severity="secondary"
          />
        </div>
        <small class="text-gray-500 text-xs mt-1">Нажмите Enter или кнопку для добавления тега</small>
      </div>

      <!-- Ссылка на видео ВК -->
      <UIInput
          id="vk_video_link"
          v-model="formData.vk_video_link"
          label="Ссылка на ВК видео"
          placeholder="https://vk.com/video..."
          :fluid="true"
          :error="errors.vk_video_link"
      />

      <!-- Закрепленная запись -->
      <div class="flex items-center gap-2">
        <Checkbox
            id="is_pinned"
            v-model="formData.is_pinned"
            :binary="true"
        />
        <label for="is_pinned" class="text-sm font-medium text-gray-700">
          Закрепить запись
        </label>
      </div>

      <!-- Текст записи -->
      <div class="w-full">
        <label for="text" class="block text-sm font-medium text-gray-700 mb-2">
          Текст записи *
        </label>
        <Editor
            id="text"
            v-model="formData.text"
            editor-style="height: 320px"
            :class="{ 'p-invalid': errors.text }"
        />
        <small v-if="errors.text" class="text-red-400 text-xs">{{ errors.text }}</small>
      </div>

      <!-- Загрузка фотографий -->
      <div class="w-full">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Фотографии
        </label>
        <FileUpload
            mode="basic"
            name="photos[]"
            :multiple="true"
            :custom-upload="true"
            @select="handleFileSelect"
            accept="image/*"
            choose-label="Выбрать фото"
            class="w-full"
        />

        <!-- Предпросмотр фотографий -->
        <div v-if="selectedPhotos.length > 0" class="mt-4">
          <h4 class="text-sm font-medium text-gray-700 mb-2">Выбранные фото:</h4>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div
                v-for="(photo, index) in selectedPhotos"
                :key="index"
                class="relative group"
            >
              <img
                  :src="photo.preview"
                  :alt="`Preview ${index + 1}`"
                  class="w-full h-32 object-cover rounded-lg"
              />
              <Button
                  icon="pi pi-times"
                  severity="danger"
                  class="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  @click="removePhoto(index)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Кнопки действий -->
      <div class="flex gap-3 justify-end pt-4 border-t">
        <Button
            label="Отмена"
            severity="secondary"
            @click="$emit('cancel')"
        />
        <Button
            type="submit"
            label="Создать запись"
            :loading="loading"
            :disabled="loading"
        />
      </div>
    </form>
  </div>
</template>

