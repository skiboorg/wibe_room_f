<script setup>
import { useToast } from 'primevue/usetoast';
const toast = useToast()

const {$api} = useNuxtApp()
const communityStore = useCommunityStore()
const {currentCommunity} = storeToRefs(communityStore)

const preview = ref(null)
const is_edit_mode = ref(false)
const editorStructure = ref(null)

const props = defineProps(['product', 'is_edit_mode'])

// --- InfoFiles ---
const infoFiles = ref([])

// useForm — form является reactive-объектом, все мутации делаем через него
const { form, send, errors, pending } = useForm({
  apiFn: props.is_edit_mode ? $api.community.product_update : $api.community.product_create,
  formData: {
    title: '',
    is_main: false,
    slug: null,
    cover: null,
    main_link: null,
    short_description: '',
    price: null,
    community: currentCommunity.value.id,
    product_info: '',
    product_info_structure: '',
    // Файловые поля — всегда присутствуют в form
    _new_files: [],
    _new_files_names: [],
    _delete_file_ids: [],
    _update_file_ids: [],
    _update_file_names: [],
  },
  asFormData: true,
  onSuccess: async (data) => {
    toast.add({
      severity: 'success',
      summary: 'Успешно',
      detail: is_edit_mode.value ? 'Продукт обновлен' : 'Продукт создан',
      life: 2000
    })
      navigateTo(`/group/${currentCommunity.value.slug}/products/${data.slug}`)
  }
})

const fillData = () => {
  form.title = props.product.title
  form.is_main = props.product.is_main
  form.slug = props.product.slug
  form.main_link = props.product.main_link
  form.short_description = props.product.short_description
  form.price = props.product.price
  form.community = props.product.community
  form.product_info = props.product.product_info
  form.product_info_structure = props.product.product_info_structure

  if (props.product.files?.length) {
    infoFiles.value = props.product.files.map(f => ({
      id: f.id,
      file: null,
      name: f.name || '',
      url: f.file,
      _delete: false,
      _isExisting: true,
    }))
  }
}

onMounted(async () => {
  if (props.product) {
    is_edit_mode.value = props.is_edit_mode
    fillData()

    await nextTick()

    editorStructure.value = props.product.product_info_structure

    if (props.product.product_info_structure) {
      setTimeout(() => {
        // pageBuilderRef.value?.loadData({ editor_data: props.product.product_info_structure })
      }, 500)
    }
  }
})

// --- Обложка ---
const onCoverSelect = (event) => {
  const file = event.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      preview.value = e.target.result
      form.cover = file   // мутируем form напрямую
    }
    reader.readAsDataURL(file)
  }
}

// --- InfoFile helpers ---
const addFileRow = () => {
  infoFiles.value.push({ id: null, file: null, name: '', url: null, _delete: false, _isExisting: false })
}

const removeFileRow = (index) => {
  const row = infoFiles.value[index]
  if (row._isExisting) {
    row._delete = true
  } else {
    infoFiles.value.splice(index, 1)
  }
}

const restoreFileRow = (index) => {
  infoFiles.value[index]._delete = false
}

const onFileSelect = (event, index) => {
  const file = event.files[0]
  if (file) {
    infoFiles.value[index].file = file
    if (!infoFiles.value[index].name) {
      infoFiles.value[index].name = file.name
    }
  }
}

// --- Синхронизация infoFiles → form перед отправкой ---
const syncFilesToForm = () => {
  const newFiles = infoFiles.value.filter(f => !f._isExisting && f.file)
  const toDelete = infoFiles.value.filter(f => f._isExisting && f._delete)
  const toUpdate = infoFiles.value.filter(f => f._isExisting && !f._delete)

  // Мутируем существующие ключи form — reactive их отслеживает
  form._new_files = newFiles.map(f => f.file)
  form._new_files_names = newFiles.map(f => f.name || f.file.name)
  form._delete_file_ids = toDelete.map(f => f.id)
  form._update_file_ids = toUpdate.map(f => f.id)
  form._update_file_names = toUpdate.map(f => f.name || '')
}

// --- Сохранение ---
const handleSave = async (data) => {
  form.product_info = data.html
  form.product_info_structure = data.json

  syncFilesToForm()
  await send()
}

const saveProduct = async () => {
  syncFilesToForm()
  await send()
}
</script>

<template>
  <div class="container mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6">Редактор инфопродукта</h1>



    <!-- Основная информация -->
    <div class="bg-white border rounded-lg p-6 mb-6">
      <h2 class="text-xl font-bold mb-4">Основная информация</h2>
      <div class="grid grid-cols-12 gap-4">
        <div class="col-span-6">
          <UIInput fluid placeholder="Введите название продукта" label="Название *" v-model="form.title"
                   :error="errors.title"/>
        </div>
        <div class="col-span-6">
          <UIInput fluid placeholder="Введите ссылку на курс продукта" label="Ссылка на курс *" v-model="form.main_link"
                   :error="errors.main_link"/>
        </div>
        <div class="col-span-6">
          <UIInput type="numeric" fluid placeholder="Введите цену продукта" label="Цена *" v-model="form.price"
                   :error="errors.price"/>
        </div>
        <div class="col-span-12">
          <UIInput type="textarea" placeholder="Краткое описание продукта" label="Короткое описание *"
                   v-model="form.short_description" :error="errors.short_description"/>
        </div>
        <div class="col-span-6">
          <label class="block text-sm font-medium mb-2">Обложка</label>
          <FileUpload mode="basic" chooseLabel="Выбрать обложку" @select="onCoverSelect" accept="image/*"/>
          <img v-if="preview" :src="preview" class="mt-2 max-h-32 rounded"/>
        </div>
        <div class="col-span-12 flex items-center">
          <Checkbox v-model="form.is_main" inputId="is_main" :binary="true"/>
          <label for="is_main" class="ml-2">Основной продукт</label>
        </div>
      </div>
    </div>

    <!-- Файлы -->
    <div class="bg-white border rounded-lg p-6 mb-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold">Файлы</h2>
        <Button label="+ Добавить файл" severity="secondary" size="small" @click="addFileRow"/>
      </div>

      <div v-if="infoFiles.length === 0" class="text-gray-400 text-sm">
        Файлы не добавлены
      </div>

      <div
          v-for="(fileRow, index) in infoFiles"
          :key="index"
          class="grid grid-cols-12 gap-3 items-center mb-3 p-3 rounded-lg border"
          :class="fileRow._delete ? 'bg-red-50 opacity-60' : 'bg-gray-50'"
      >
        <div class="col-span-5">
          <UIInput fluid placeholder="Название файла" label="Название" v-model="fileRow.name"
                   :disabled="fileRow._delete"/>
        </div>

        <div class="col-span-5">
          <label class="block text-sm font-medium mb-1">
            {{ fileRow._isExisting ? 'Заменить файл' : 'Файл *' }}
          </label>
          <a v-if="fileRow._isExisting && fileRow.url && !fileRow.file"
             :href="fileRow.url" target="_blank"
             class="text-blue-500 text-sm underline block mb-1 truncate">
            {{ fileRow.url.split('/').pop() }}
          </a>
          <FileUpload
              v-if="!fileRow._delete"
              mode="basic"
              :chooseLabel="fileRow._isExisting ? 'Заменить' : 'Выбрать файл'"
              @select="onFileSelect($event, index)"
          />
          <span v-if="fileRow.file" class="text-xs text-green-600 mt-1 block">
            Выбран: {{ fileRow.file.name }}
          </span>
        </div>

        <div class="col-span-2 flex justify-end gap-2 pt-5">
          <Button v-if="!fileRow._delete" icon="pi pi-trash" severity="danger" text size="small"
                  v-tooltip="'Удалить'" @click="removeFileRow(index)"/>
          <Button v-else icon="pi pi-undo" severity="secondary" text size="small"
                  v-tooltip="'Отменить удаление'" @click="restoreFileRow(index)"/>
        </div>

        <div v-if="fileRow._delete" class="col-span-12 text-red-500 text-xs -mt-1">
          Файл будет удалён при сохранении
        </div>
      </div>
    </div>

    <PageBuilderMain :initial-data="editorStructure" @save="handleSave"/>
<!--    <Button :label="is_edit_mode ? 'Обновить' : 'Сохранить'" :loading="pending" @click="saveProduct"/>-->
  </div>
</template>