<script setup lang="ts">
const emits = defineEmits(['change_form'])
import { useToast } from 'primevue/usetoast';
const toast = useToast()
const {$api} = useNuxtApp()
const loading = ref(false)
const form_data = ref({
  full_name:'',//null,
  email:'',
  password:'',
  password1:'',
})

watch(
    () => form_data.value.email,
    (newEmail) => {
      form_data.value.email = newEmail.toLowerCase()
    }
)
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
const isValidPasswords = (): boolean => {
  return !! form_data.value.password &&
      form_data.value.password ===  form_data.value.password1
}

const send = async () => {
  if (!isValidEmail(form_data.value.email)) {
    toast.add({ severity: 'warn', summary: 'Внимание', detail: 'Введите корректный email', life: 3000 });
    return;
  }
  if (!isValidPasswords()) {
    toast.add({ severity: 'warn', summary: 'Внимание', detail: 'Пароли не совпадают', life: 3000 });
    return;
  }

  loading.value = true
  try{
    const response = await $api.auth.register(form_data.value)
    toast.add({ severity: 'success',summary:'Успешно', detail: 'Аккаунт создан', life: 3000 });
    emits('change_form','login')


  }catch(error){
    const responseErrors = error.data

    if (responseErrors && typeof responseErrors === 'object') {
      const messages: string[] = []

      for (const key in responseErrors) {
        const fieldErrors = responseErrors[key]
        if (Array.isArray(fieldErrors)) {
          for (const msg of fieldErrors) {
            console.log(fieldErrors)

            messages.push(msg)
          }
        }
      }

      toast.add({
        severity: 'error',
        summary: 'Ошибка',
        detail: messages.join('\n'),
        life: 6000,
      })
    } else {
      toast.add({
        severity: 'error',
        summary: 'Ошибка',
        detail: 'Ошибка',
        life: 3000,
      })
    }
  }finally {
    loading.value = false
  }
}

</script>

<template>
<CardBase padding="none" extra-class="min-w-[50%]">
  <div class="flex flex-col items-center justify-center w-full p-[60px]">
    <BlockLogo class="mb-8"/>
    <TypingText24 text="Создайте ваш Вайбрум-аккаунт" class="mb-8"/>
    <div class="space-y-3 w-full mb-8">

      <UIInput fluid placeholder="Ваше ФИО" label="ФИО" id="full_name" v-model="form_data.full_name"/>
      <UIInput fluid placeholder="Введите адрес почты" label="Email" id="email" v-model="form_data.email"/>
      <UIInput fluid placeholder="Не менее 8 символов" label="Пароль" id="password" type="password" v-model="form_data.password"/>
      <UIInput fluid placeholder="Не менее 8 символов" label="Повторите пароль" type="password" id="password1" v-model="form_data.password1"/>



    </div>
    <UIButton @click="send" :loading="loading" label="Войти" extra-class="w-full mb-3"/>
    <p class="text-center text-gray-400 text-sm mb-3">Нажимая кнопку вы соглашаетесь с <a href="#" class="border-b">политикой<br> конфиденциальности</a>  и
      <a class="border-b" href="#">согласием на обработку данных</a></p>
    <div class="flex items-center justify-center gap-2">
      Уже есть аккаунт?
      <UILink label="Войти" @click="emits('change_form','login')"/>
    </div>
  </div>
</CardBase>
</template>

<style scoped>

</style>