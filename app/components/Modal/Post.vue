
<template>

    <UIButton @click="visible = true" variant="outline" label="Напишите пост" fluid/>

    <Dialog v-model:visible="visible" :show-header="false" modal header="Edit Profile" class="new-post w-[90%] md:w-[568px]">
      <div class="p-4">
        <h2 class="font-medium mb-6">Новый пост</h2>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!--      &lt;!&ndash; Заголовок &ndash;&gt;-->
          <!--      <UIInput-->
          <!--          id="title"-->
          <!--          v-model="formData.title"-->
          <!--          label="Заголовок *"-->
          <!--          placeholder="Введите заголовок записи"-->
          <!--          :fluid="true"-->
          <!--          :error="errors.title"-->
          <!--          @blur="validateField('title')"-->
          <!--      />-->

          <!-- Выбор сообщества -->
<!--          <div class="w-full">-->
<!--            <label for="community" class="block text-sm font-medium text-gray-700 mb-2">-->
<!--              Выберите теги-->
<!--            </label>-->
<!--            <MultiSelect-->
<!--                v-model="formData.post_tags"-->
<!--                :options="tags?.filter(x=>x.slug !=='all')"-->
<!--                optionLabel="name"-->
<!--                placeholder="Выберите теги"-->
<!--                display="chip"-->
<!--                option-value="id"-->
<!--                class="w-full"-->
<!--                :class="{ 'border-red-500': errors.community_tags }"-->
<!--            />-->

<!--            <small v-if="errors.community" class="text-red-400 text-xs">{{ errors.community }}</small>-->
<!--          </div>-->

<!--          &lt;!&ndash; Теги &ndash;&gt;-->
<!--          <div class="w-full">-->
<!--            <label class="block text-sm font-medium text-gray-700 mb-2">-->
<!--              Или добавьте свои-->
<!--            </label>-->
<!--            <div class="flex flex-wrap gap-2 mb-2">-->
<!--              <div class="flex items-center gap-2"  v-for="(tag,index) in formData.new_tags"-->
<!--                   :key="index">-->
<!--                <UIBadge-->

<!--                    :label="tag"-->

<!--                />-->
<!--                <i @click="removeTag(index)" class="pi pi-times cursor-pointer"></i>-->
<!--              </div>-->


<!--            </div>-->
<!--            <div class="flex gap-2">-->
<!--              <InputText-->
<!--                  v-model="newTagName"-->
<!--                  placeholder="Введите название тега"-->
<!--                  class="flex-1"-->
<!--                  @keydown.enter.prevent="addTag"-->
<!--              />-->
<!--              <Button-->
<!--                  icon="pi pi-plus"-->
<!--                  label="Добавить"-->
<!--                  @click="addTag"-->
<!--                  severity="secondary"-->
<!--              />-->
<!--            </div>-->
<!--            <small class="text-gray-500 text-xs mt-1">Нажмите Enter или кнопку для добавления тега</small>-->
<!--          </div>-->

          <!-- Ссылка на видео ВК -->
<!--          <UIInput-->
<!--              id="vk_video_link"-->
<!--              v-model="formData.vk_video_link"-->
<!--              label="Ссылка на ВК видео"-->
<!--              placeholder="https://vk.com/video..."-->
<!--              :fluid="true"-->
<!--              :error="errors.vk_video_link"-->
<!--          />-->

          <!-- Закрепленная запись -->
<!--          <div class="flex items-center gap-2">-->
<!--            <Checkbox-->
<!--                id="is_pinned"-->
<!--                v-model="formData.is_pinned"-->
<!--                :binary="true"-->
<!--            />-->
<!--            <label for="is_pinned" class="text-sm font-medium text-gray-700">-->
<!--              Закрепить запись-->
<!--            </label>-->
<!--          </div>-->

          <!-- Текст записи -->
          <div class="w-full">
<!--            <label for="text" class="block text-sm font-medium text-gray-700 mb-2">-->
<!--              Текст записи *-->
<!--            </label>-->
<!--            <Editor-->
<!--                id="text"-->
<!--                v-model="formData.text"-->
<!--                editor-style="height: 320px"-->
<!--                :class="{ 'p-invalid': errors.text }"-->
<!--            />-->

          </div>
          <div class="w-full">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Фотографии
            </label>

            <!-- Зона загрузки -->
            <div class="upload-zone" @click="triggerUpload">
              <!-- FileUpload полностью скрыт, управляем через ref -->
              <FileUpload
                  ref="fileUploadRef"
                  mode="basic"
                  name="photos[]"
                  :multiple="true"
                  :custom-upload="true"
                  @select="handleFileSelect"
                  accept="image/*,video/*"
                  :auto="false"
                  :pt="{
            root: { style: 'display:none' },
          }"
              />

              <!-- Видимый контент -->
              <div class="upload-inner">
                <div class="upload-icon">
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="36" height="36" rx="9" fill="#F04E2E" fill-opacity="0.12"/>
                    <path
                        d="M25 12H11C10.4477 12 10 12.4477 10 13V23C10 23.5523 10.4477 24 11 24H25C25.5523 24 26 23.5523 26 23V13C26 12.4477 25.5523 12 25 12Z"
                        stroke="#F04E2E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
                    />
                    <path
                        d="M10 20L14 16L17.5 19.5L21 17L26 20"
                        stroke="#F04E2E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
                    />
                    <circle cx="14.5" cy="15.5" r="1.5" fill="#F04E2E"/>
                  </svg>
                </div>
                <p class="upload-title">Добавьте фото или видео</p>
                <span class="upload-btn">Загрузить с устройства</span>
              </div>
            </div>

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
                      @click.stop="removePhoto(index)"
                  />
                </div>
              </div>
            </div>
          </div>
          <Textarea
              id="text"
              fluid
              v-model="formData.text"
              placeholder="Написать текст к посту..."
              :pt="{
      root: { style: 'border: none; box-shadow: none; outline: none;' }
    }"
              :class="{ 'p-invalid': errors.text }"
          />
          <small v-if="errors.text" class="text-red-400 text-xs">{{ errors.text }}</small>
          <!-- Загрузка фотографий -->
<!--          <div class="w-full">-->
<!--            <label class="block text-sm font-medium text-gray-700 mb-2">-->
<!--              Фотографии-->
<!--            </label>-->
<!--            <FileUpload-->
<!--                mode="basic"-->
<!--                name="photos[]"-->
<!--                :multiple="true"-->
<!--                :custom-upload="true"-->
<!--                @select="handleFileSelect"-->
<!--                accept="image/*"-->
<!--                choose-label="Выбрать фото"-->
<!--                class="w-full"-->
<!--            />-->

<!--            &lt;!&ndash; Предпросмотр фотографий &ndash;&gt;-->
<!--            <div v-if="selectedPhotos.length > 0" class="mt-4">-->
<!--              <h4 class="text-sm font-medium text-gray-700 mb-2">Выбранные фото:</h4>-->
<!--              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">-->
<!--                <div-->
<!--                    v-for="(photo, index) in selectedPhotos"-->
<!--                    :key="index"-->
<!--                    class="relative group"-->
<!--                >-->
<!--                  <img-->
<!--                      :src="photo.preview"-->
<!--                      :alt="`Preview ${index + 1}`"-->
<!--                      class="w-full h-32 object-cover rounded-lg"-->
<!--                  />-->
<!--                  <Button-->
<!--                      icon="pi pi-times"-->
<!--                      severity="danger"-->
<!--                      class="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"-->
<!--                      @click="removePhoto(index)"-->
<!--                  />-->
<!--                </div>-->
<!--              </div>-->
<!--            </div>-->
<!--          </div>-->

          <!-- Кнопки действий -->
          <div class="flex gap-3 justify-end pt-4">
            <UIButton
                variant="outline"
                label="Отмена"
                severity="secondary"
                @click="visible=false"
            />
            <UIButton
                variant="filled"
                type="submit"
                label="Далее"
                :loading="loading"
                :disabled="loading"
            />
          </div>
        </form>
      </div>
    </Dialog>

</template>



<script setup lang="ts">

  import type {Post, PostTag, PostPhoto} from "~/repository/community/types";
  import { useToast } from 'primevue/usetoast';
  const toast = useToast()
  const props = defineProps(['is_edit_mode'])
  const communityStore = useCommunityStore()
  const { $api } = useNuxtApp()
  const {currentCommunity} = communityStore
  const visible = ref(false);
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

  const emits = defineEmits(['created'])
  const fileUploadRef = ref(null)
  const newTagName = ref('')
  // const selectedPhotos = ref<PostPhoto[]>([])
  const loading = ref(false)
  const errors = reactive({
    title: '',
    community: '',
    text: ''
  })
  const selectedPhotos = ref([])

  function triggerUpload() {
    // Программно вызываем нативный input внутри FileUpload
    const input = fileUploadRef.value?.$el?.querySelector('input[type="file"]')
        ?? fileUploadRef.value?.input
    input?.click()
  }

  function handleFileSelect(event) {
    const files = Array.from(event.files || [])
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        selectedPhotos.value.push({ file, preview: e.target.result })
      }
      reader.readAsDataURL(file)
    })
  }

  function removePhoto(index) {
    selectedPhotos.value.splice(index, 1)
  }
  // Methods
  const validateField = (field: keyof typeof errors) => {
    switch (field) {
    // case 'title':
    //   errors.title = formData.value.title.trim() ? '' : 'Заголовок обязателен'
    //   break
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

  // const handleFileSelect = (event: any) => {
  //   const files = Array.from(event.files) as File[]
  //
  //   files.forEach(file => {
  //   if (file.type.startsWith('image/')) {
  //   const preview = URL.createObjectURL(file)
  //   selectedPhotos.value.push({ file, preview })
  // }
  // })
  // }

  // const removePhoto = (index: number) => {
  //   // Освобождаем URL объекта
  //   URL.revokeObjectURL(selectedPhotos.value[index].preview)
  //   selectedPhotos.value.splice(index, 1)
  // }

  const { send } = useForm({
    apiFn:  $api.community.post_create,
    formData: formData.value,
    asFormData: true,
    onSuccess: async ()=>{
    toast.add({ severity: 'success',summary:'Успешно', detail: 'Пост создан', life: 3000 });
    emits('created')
      visible.value = false

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

<style scoped>
/* Обёртка-зона */
.upload-zone {
  position: relative;
  width: 100%;
  border: 1.5px dashed #D1D5DB;
  border-radius: 12px;
  background: #FAFAFA;
  padding: 40px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: border-color 0.2s, background 0.2s;
  cursor: pointer;
}

.upload-zone:hover {
  border-color: #F04E2E;
  background: #FFF7F5;
}

/* FileUpload растянут поверх всей зоны — невидим, перехватывает клики */
.upload-file-input {
  position: absolute;
  inset: 0;
  width: 100% !important;
  height: 100% !important;
  z-index: 2;
}

:deep(.upload-file-input .p-fileupload-choose) {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  padding: 0;
  margin: 0;
  border: none;
  background: transparent;
  box-shadow: none;
}

/* Видимое содержимое */
.upload-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  pointer-events: none;
  z-index: 1;
}

.upload-icon {
  display: flex;
}

.upload-title {
  font-size: 15px;
  font-weight: 500;
  color: #1C1C1E;
  margin: 0;
}

.upload-btn {
  display: inline-block;
  padding: 8px 20px;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  background: #FFFFFF;
  color: #374151;
  font-size: 14px;
  font-weight: 400;
  transition: border-color 0.2s, color 0.2s;
}

.upload-zone:hover .upload-btn {
  border-color: #F04E2E;
  color: #F04E2E;
}
</style>