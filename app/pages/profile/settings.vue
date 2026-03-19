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
    <template #title>Настройки</template>

    <template #content>
      <form @submit.prevent="saveProfile">
        <div class="space-y-4">
          <!-- Email -->
          <div class="">
            <div class="field">
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <InputText
                  id="email"
                  v-model="formData.email"
                  type="email"
                  placeholder="example@mail.ru"
                  class="w-full min-w-0"
                  :class="{ 'p-invalid': errors.email }"
              />
              <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
            </div>
          </div>

          <!-- Telegram username -->
          <div>
            <div class="field">
              <label for="tg_username" class="block text-sm font-medium text-gray-700 mb-2">
                Telegram
              </label>
              <div class="p-inputgroup">
                <span class="p-inputgroup-addon">@</span>
                <InputText
                    id="tg_username"
                    v-model="formData.tg_username"
                    placeholder="username"
                    class="w-full"
                    :class="{ 'p-invalid': errors.tg_username }"
                />
              </div>
              <small v-if="errors.tg_username" class="p-error">{{ errors.tg_username }}</small>
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