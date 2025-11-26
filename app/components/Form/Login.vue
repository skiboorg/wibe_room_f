<script setup lang="ts">
const emits = defineEmits(['change_form'])
import { useToast } from 'primevue/usetoast';
const toast = useToast()
const {$api} = useNuxtApp()
const loading = ref(false)

const form_data = ref({
  login:'123',
  password:'q1w2e3r4t5DFSS',
})

watch(
    () => form_data.value.login,
    (newEmail) => {
      form_data.value.login = newEmail.toLowerCase()
    }
)

const login = async () => {
  loading.value = true
  try{
    const response = await $api.auth.login(form_data.value)
    const authCookie = useCookie('auth_token',{
      maxAge: 60 * 60 * 24 * 7, // 7 дней
    })
    const { authToken } = useAuthToken()
    authCookie.value = response.auth_token
    //authToken.value = response.auth_token
    window.location.href = '/'
    toast.add({ severity: 'success',summary:'Успешно', detail: 'Получение данных пользователя...', life: 3000 });

  }catch(error){
    console.log(error)

    toast.add({ severity: 'error',summary:'Ошибка', detail: 'Не удалось войти с такими данными', life: 3000 });
  }
  finally {
    loading.value = false
  }

}
</script>

<template>
<CardBase padding="none" extra-class="min-w-[50%]">
  <div class="flex flex-col items-center justify-center w-full p-[60px]">
    <BlockLogo class="mb-8"/>
    <TypingText32 text="Вход в Вайбрум" class="mb-8"/>
    <div class="space-y-3 w-full mb-8">
      <UIInput fluid placeholder="Введите адрес почты или телефон" label="Email/Телефон" id="email" v-model="form_data.login"/>
      <UIInput fluid placeholder="Введите пароль" label="Пароль" id="password" v-model="form_data.password"/>
      <div class="">
        <UILink label="Забыли пароль?" @click="console.log(test)"/>
      </div>


    </div>
    <UIButton @click="login" :loading="loading" label="Войти" extra-class="w-full mb-3"/>
    <div class="flex items-center justify-center gap-2">
      Ещё нет аккаунта?
      <UILink label="Бесплатная регистрация" @click="emits('change_form','register')"/>
    </div>
  </div>
</CardBase>
</template>

<style scoped>

</style>