

<script setup lang="ts">
import { useToast } from 'primevue/usetoast'
import type {Event} from "~/repository/community/types";

const toast = useToast()
const communityStore = useCommunityStore()
const { $api } = useNuxtApp()
const { currentCommunity } = storeToRefs(communityStore)
const route = useRoute()
const router = useRouter()

const props = defineProps<{
  event?: Event,
  is_edit_mode: boolean,
}>()

// Состояние формы
const loading = ref(false)
const is_edit_mode = ref(false)
const previewImage = ref<string | null>(null)
const form = ref({
  id: props.event?.id || null,
  slug: props.event?.slug || null,
  title: props.event?.title || '',
  start_date: props.event?.start_date ? new Date(props.event?.start_date) : null,
  community: props.event?.community || currentCommunity.value?.id || null,
  time_text: props.event?.time_text || '',
  short_description: props.event?.short_description || '',
  long_description: props.event?.long_description || '',
  cover: null
})

// Инициализация формы
onMounted(() => {

  is_edit_mode.value = props.is_edit_mode

})



// Инициализация для редактирования
const initEditForm = () => {
  if (!props.event) return

  form.value = {
    title: props.event.title || '',
    start_date: props.event.start_date ? new Date(props.event.start_date) : null,
    community: props.event.community || currentCommunity.value?.id || null,
    time_text: props.event.time_text || '',
    short_description: props.event.short_description || '',
    long_description: props.event.long_description || '',
    cover: null
  }

  // Устанавливаем preview для существующей обложки
  if (props.event.cover) {
    previewImage.value = props.event.cover
  }
}

const errors = ref({})

// Обработчик выбора файла
const onFileSelect = (event: any) => {
  const file = event.files[0]
  if (file) {
    form.value.cover = file

    // Создаем preview
    const reader = new FileReader()
    reader.onload = (e) => {
      previewImage.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

// Удаление обложки
const removeCover = () => {
  form.value.cover = null
  previewImage.value = null
}

// Компьютед свойства
const communitySlug = computed(() => route.params.slug as string)
const submitButtonLabel = computed(() =>
    is_edit_mode.value ? 'Обновить событие' : 'Создать событие'
)
const pageTitle = computed(() =>
    is_edit_mode.value ? 'Редактировать событие' : 'Добавить новое событие'
)
const submit = async () => {
  console.log('form', form.value)
  await send()
}

const { send } = useForm({
  apiFn:  props.is_edit_mode ? $api.community.event_update : $api.community.event_create,

  //apiFn:  $api.community.event_create,
  formData: form.value,
  asFormData: true,
  onSuccess: async ()=>{
    toast.add({
      severity: 'success',
      summary: 'Успешно',
      detail: is_edit_mode.value ? 'Cобытие обновлено' : 'Cобытие создано',
      life: 2000
    })
    navigateTo(`/group/${currentCommunity.value?.slug}/events`)
  }
})
</script>

<template>
<!--  {{is_edit_mode}}-->
<!--  {{form}}-->
  <div class="max-w-4xl mx-auto">
    <Card class="shadow-lg">
      <template #title>
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold text-gray-800">{{ pageTitle }}</h2>
          <Button
              label="Назад к событиям"
              icon="pi pi-arrow-left"
              text
              @click="$router.back()"
          />
        </div>
      </template>

      <template #content>
        <form @submit.prevent="submit" class="space-y-6">
          <!-- Название события -->
          <div class="space-y-2">
            <label for="title" class="block text-sm font-medium text-gray-700">
              Название события *
            </label>
            <InputText
                id="title"
                v-model="form.title"
                placeholder="Введите название события"
                class="w-full"
                :class="{ 'p-invalid': errors?.title }"
            />
            <small class="text-red-500" v-if="errors?.title">{{ errors?.title[0] }}</small>
          </div>

          <!-- Дата и время -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Дата начала -->
            <div class="space-y-2">
              <label for="start_date" class="block text-sm font-medium text-gray-700">
                Дата начала
              </label>
              <Calendar
                  id="start_date"
                  v-model="form.start_date"
                  dateFormat="dd.mm.yy"
                  showIcon
                  class="w-full"
                  :class="{ 'p-invalid': errors?.start_date }"
              />
              <small class="text-red-500" v-if="errors?.start_date">{{ errors?.start_date[0] }}</small>
            </div>

            <!-- Время проведения -->
            <div class="space-y-2">
              <label for="time_text" class="block text-sm font-medium text-gray-700">
                Время проведения
              </label>
              <InputText
                  id="time_text"
                  v-model="form.time_text"
                  placeholder="Например: 19:00 или 14:00-16:00"
                  class="w-full"
                  :class="{ 'p-invalid': errors?.time_text }"
              />
              <small class="text-red-500" v-if="errors?.time_text">{{ errors?.time_text[0] }}</small>
            </div>
          </div>

          <!-- Короткое описание -->
          <div class="space-y-2">
            <label for="short_description" class="block text-sm font-medium text-gray-700">
              Короткое описание
            </label>
            <Textarea
                id="short_description"
                v-model="form.short_description"
                placeholder="Краткое описание события (максимум 500 символов)"
                rows="3"
                class="w-full"
                :class="{ 'p-invalid': errors?.short_description }"
                :maxlength="500"
            />
            <div class="flex justify-between text-xs text-gray-500">
              <span>Максимум 500 символов</span>
              <span>{{ form.short_description?.length || 0 }}/500</span>
            </div>
            <small class="text-red-500" v-if="errors?.short_description">{{ errors?.short_description[0] }}</small>
          </div>

          <!-- Длинное описание -->
          <div class="space-y-2">
            <label for="long_description" class="block text-sm font-medium text-gray-700">
              Полное описание
            </label>
            <Editor
                v-model="form.long_description"
                editorStyle="height: 320px"
                :class="{ 'p-invalid': errors?.long_description }"
            >
              <template #toolbar>
                <span class="ql-formats">
                  <button class="ql-bold"></button>
                  <button class="ql-italic"></button>
                  <button class="ql-underline"></button>
                  <button class="ql-strike"></button>
                </span>
                <span class="ql-formats">
                  <button class="ql-blockquote"></button>
                  <button class="ql-code-block"></button>
                </span>
                <span class="ql-formats">
                  <button class="ql-list" value="ordered"></button>
                  <button class="ql-list" value="bullet"></button>
                  <button class="ql-indent" value="-1"></button>
                  <button class="ql-indent" value="+1"></button>
                </span>
                <span class="ql-formats">
                  <button class="ql-link"></button>
                  <button class="ql-image"></button>
                </span>
                <span class="ql-formats">
                  <button class="ql-clean"></button>
                </span>
              </template>
            </Editor>
            <small class="text-red-500" v-if="errors?.long_description">{{ errors?.long_description[0] }}</small>
          </div>

          <!-- Обложка -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">
              Обложка события
            </label>

            <!-- Предпросмотр обложки -->
            <div v-if="previewImage" class="mb-4 flex items-center gap-4">
              <img
                  :src="previewImage"
                  alt="Предпросмотр обложки"
                  class="max-w-xs rounded-lg shadow-md"
              />
              <Button
                  v-if="is_edit_mode"
                  label="Удалить обложку"
                  icon="pi pi-trash"
                  severity="danger"
                  @click="removeCover"
                  text
              />
            </div>

            <!-- Существующая обложка -->
            <div v-else-if="event?.cover && !previewImage" class="mb-4 flex items-center gap-4">
              <img
                  :src="event.cover"
                  alt="Текущая обложка"
                  class="max-w-xs rounded-lg shadow-md"
              />
              <Button
                  label="Удалить обложку"
                  icon="pi pi-trash"
                  severity="danger"
                  @click="removeCover"
                  text
              />
            </div>

            <FileUpload
                mode="basic"
                name="cover"
                accept="image/*"
                :maxFileSize="10000000"
                :chooseLabel="previewImage || event?.cover ? 'Заменить обложку' : 'Выберите обложку'"
                @select="onFileSelect"
                class="w-full"
                :class="{ 'p-invalid': errors?.cover }"
            />
            <small class="text-gray-500">Максимальный размер: 10MB</small>
            <small class="text-red-500" v-if="errors?.cover">{{ errors?.cover[0] }}</small>
          </div>

          <!-- Кнопки действий -->
          <div class="flex gap-3 pt-4">
            <Button
                type="submit"
                :label="submitButtonLabel"
                :icon="is_edit_mode ? 'pi pi-check' : 'pi pi-plus'"
                :loading="loading"
                class="flex-1"
            />
            <Button
                type="button"
                label="Отмена"
                icon="pi pi-times"
                severity="secondary"
                @click="$router.push(`/communities/${communitySlug}/events`)"
                class="flex-1"
            />
          </div>
        </form>
      </template>
    </Card>
  </div>
</template>

<style scoped>
:deep(.p-card-title) {
  margin-bottom: 0;
}

:deep(.p-editor-container .p-editor-content) {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}

:deep(.p-invalid) {
  border-color: #f87171 !important;
}
</style>