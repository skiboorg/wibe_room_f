<script setup>

const {$api} = useNuxtApp()
const communityStore = useCommunityStore()
const {currentCommunity} = storeToRefs(communityStore)
const pageBuilderRef = ref(null)

const preview = ref(null)
const is_edit_mode = ref(false)

const props = defineProps(['product'])
const editorStructure = ref(null)

const productData = ref({
  title: '',
  is_main: false,
  cover: null,
  short_description: '',
  price: null,
  community: currentCommunity.value.id,
  product_info: '',
  product_info_structure: ''
})

onMounted(async () => {
  if (props.product) {
    is_edit_mode.value = true
    productData.value = {
      ...props.product,
      community: currentCommunity.value.id
    }

    await nextTick()

    editorStructure.value = props.product.product_info_structure

    // 🎯 Приводим структуру к тому виду, который ожидает PageBuilder
    const normalized = {
      editor_data: props.product.product_info_structure
    }

    if (pageBuilderRef.value && props.product.product_info_structure) {
      console.log('🔄 Принудительная загрузка данных в редактор')

      setTimeout(() => {
        pageBuilderRef.value.loadData(normalized)
      }, 500)
    }
  }
})

const onCoverSelect = (event) => {
  const file = event.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      preview.value = e.target.result
      productData.value.cover = file
    }
    reader.readAsDataURL(file)
  }
}

const { send } = useForm({
  apiFn:  $api.community.product_create,
  formData: productData.value,
  asFormData: true,
  onSuccess: async ()=>{
    console.log('success')
  }
})

const saveProduct = async () => {

  if (pageBuilderRef.value) {
    try {
      const editorData = await pageBuilderRef.value.getEditorData()
      console.log('Данные редактора:', editorData.editor_data)

      productData.value.product_info = editorData.html_inline
      productData.value.product_info_structure = editorData.editor_data

      await send()

    } catch (error) {
      console.error('Ошибка:', error)
      alert('Редактор еще не загружен. Подождите немного.')
    }
  }
}

</script>
<template>
  <p class="text-red-500">sdfdsfds</p>
  <p>
    {{is_edit_mode}}
  </p>
  <pre>
    {{editorStructure}}
  </pre>

  <div class="container mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6">Редактор инфопродукта</h1>
    <Button label="Сохранить" @click="saveProduct" />

    <!-- Форма основных данных -->
    <div class="bg-white border rounded-lg p-6 mb-6">
      <h2 class="text-xl font-bold mb-4">Основная информация</h2>
      <div class="grid grid-cols-12 gap-4">
        <div class="col-span-6">
          <UIInput fluid placeholder="Введите название продукта" label="Название *" id="email" v-model="productData.title"/>
        </div>
        <div class="col-span-6">
          <UIInput type="numeric" fluid placeholder="Введите Цена продукта" label="Цена *" id="email" v-model="productData.price"/>
        </div>
        <div class="col-span-12">
          <UIInput type="textarea" placeholder="Краткое описание продукта" label="Короткое описание *" id="email" v-model="productData.short_description"/>
        </div>
        <div class="col-span-6">
          <label class="block text-sm font-medium mb-2">Обложка</label>
          <FileUpload
              mode="basic"
              chooseLabel="Выбрать обложку"
              @select="onCoverSelect"
              accept="image/*"
          />
          <img v-if="preview" :src="preview" class="mt-2 max-h-32 rounded" />
        </div>

        <div class="col-span-12 flex items-center">
          <Checkbox
              v-model="productData.is_main"
              inputId="is_main"
              :binary="true"
          />
          <label for="is_main" class="ml-2">Основной продукт</label>
        </div>
      </div>
    </div>

    <BlockPageBuilder
        ref="pageBuilderRef"
        :initial-data="editorStructure"

    />
  </div>
</template>

