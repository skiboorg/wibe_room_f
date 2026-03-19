<script setup lang="ts">
const authStore = useAuthStore()
const {user} = storeToRefs(authStore)
const {$api} = useNuxtApp()
const fileInput = ref(null)
import Toast from 'primevue/toast'

const toast = useToast()
// Состояние
const loading = ref(false)
const uploading = ref(false)
const userData = ref(null)
const selectedFile = ref(null)
const avatarPreview = ref(null)
const formData = reactive({
  email: '',
  full_name: '',
  phone: '',
  tg_username: '',
  comment: ''
})
const errors = {}
onMounted(() => {
  Object.assign(formData, {
    email: user.value?.email || '',
    full_name: user.value.full_name || '',
    phone: user.value.phone || '',
    tg_username: user.value.tg_username || '',
    comment: user.value.comment || ''
  })
})
const avatarLabel = computed(() => {
  if (user.value?.full_name) {
    const names = user.value.full_name.split(' ')
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`
    }
    return user.value.full_name[0]
  }
  return 'U'
})

// Методы
const onFileSelected = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Проверка размера файла (5MB)
  if (file.size > 5 * 1024 * 1024) {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: 'Файл слишком большой. Максимальный размер: 5MB',
      life: 5000
    })
    return
  }

  // Проверка типа файла
  const validTypes = ['image/jpeg', 'image/png', 'image/gif']
  if (!validTypes.includes(file.type)) {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: 'Неподдерживаемый формат файла',
      life: 5000
    })
    return
  }

  selectedFile.value = file

  // Предпросмотр
  const reader = new FileReader()
  reader.onload = (e) => {
    avatarPreview.value = e.target.result
  }
  reader.readAsDataURL(file)
  formData.avatar = selectedFile.value

  // Автоматическая загрузка

}

const { send } = useForm({
  apiFn: $api.auth.update,
  formData: formData,
  asFormData: true,
  onSuccess: async ()=>{
    toast.add({
      severity: 'success',
      summary: 'Успешно',
      detail: 'Обновлено',
      life: 2000
    })
    await fetchCommunity(community.slug)
    navigateTo(`/group/${community?.slug}`)
  }
})
</script>

<template>




          <Card>
            <template #title>Ваш профиль</template>
            <template #content>
              <div class="grid grid-cols-12 gap-10">
                <div class="col-span-2">
                  <!-- Предпросмотр аватара -->
                  <div class="relative">
                    <Avatar
                        :image="avatarPreview || user?.avatar"
                        :label="avatarPreview || user?.avatar ? null : avatarLabel"
                        size="xl"
                        shape="circle"
                        class="w-14 h-14 md:w-14 md:h-14 text-6xl"
                    />

                    <!-- Индикатор загрузки -->
                    <ProgressSpinner
                        v-if="uploading"
                        style="width: 50px; height: 50px"
                        strokeWidth="8"
                        class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                    />
                  </div>
                </div>
                <div class="col-span-10">
                  <!-- Кнопки загрузки -->
                  <div class="flex flex-col space-y-2 w-full">
                    <Button
                        label="Выбрать файл"
                        icon="pi pi-image"
                        @click="fileInput?.click()"
                        :disabled="uploading"
                    />


                  </div>

                  <!-- Скрытый input -->
                  <input
                      type="file"
                      ref="fileInput"
                      accept="image/*"
                      @change="onFileSelected"
                      class="hidden"
                  />

                  <!-- Информация о файле -->
                  <div v-if="selectedFile" class="text-sm text-gray-600 text-center">
                    <p>Выбран: {{ selectedFile.name }}</p>
                    <p>Размер: {{ (selectedFile.size / 1024).toFixed(2) }} KB</p>
                  </div>

                  <!-- Подсказки -->
                  <div class="text-xs text-gray-500 text-center">
                    <p>Поддерживаются JPG, PNG, GIF</p>
                    <p>Максимальный размер: 5MB</p>
                  </div>
                </div>



              </div>

              <form @submit.prevent="saveProfile">
                <div class="space-y-4">


                  <!-- ФИО -->
                  <div class="">
                    <div class="field">
                      <label for="full_name" class="block text-sm font-medium text-gray-700 mb-2">
                        ФИО
                      </label>
                      <InputText
                          id="full_name"
                          v-model="formData.full_name"
                          placeholder="Иванов Иван Иванович"
                          class="w-full"
                          :class="{ 'p-invalid': errors.full_name }"
                      />
                      <small v-if="errors.full_name" class="p-error">{{ errors.full_name }}</small>
                    </div>
                  </div>

                  <!-- Телефон -->
                  <div>
                    <div class="field">
                      <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
                        Телефон
                      </label>
                      <InputText
                          id="phone"
                          v-model="formData.phone"
                          placeholder="+7 (999) 123-45-67"
                          class="w-full"
                          :class="{ 'p-invalid': errors.phone }"
                      />
                      <small v-if="errors.phone" class="p-error">{{ errors.phone }}</small>
                    </div>
                  </div>



                  <!-- Комментарий -->
                  <div class="md:col-span-2">
                    <div class="field">
                      <label for="comment" class="block text-sm font-medium text-gray-700 mb-2">
                        Комментарий
                      </label>
                      <Textarea
                          id="comment"
                          v-model="formData.comment"
                          rows="4"
                          placeholder="Дополнительная информация..."
                          class="w-full"
                          :class="{ 'p-invalid': errors.comment }"
                      />
                      <small v-if="errors.comment" class="p-error">{{ errors.comment }}</small>
                    </div>
                  </div>
                </div>
              </form>
            </template>
            <template #footer>
              <div class="flex justify-between items-center">

                <div class="flex space-x-3">

                  <Button
                      label="Сохранить"
                      icon="pi pi-check"
                      @click="send"
                      :loading="loading"
                  />
                </div>
              </div>
            </template>
          </Card>




</template>

<style scoped>

</style>