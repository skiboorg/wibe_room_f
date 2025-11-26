<script setup lang="ts">
const {$api} = useNuxtApp()

const {data, refresh, status} = useHttpRequest(useAsyncData(()=>$api.community.members()))
</script>

<template>
  <div class="space-y-4">
    <CardBase padding="lg_sm">
      <div class="flex items-center justify-between">
        <p class="text-lg font-medium ">Участники сообщества</p>
        <div class="flex items-center gap-4">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.5 0C8.22391 0 9.87721 0.684819 11.0962 1.90381C12.3152 3.12279 13 4.77609 13 6.5C13 8.11 12.41 9.59 11.44 10.73L11.71 11H12.5L17.5 16L16 17.5L11 12.5V11.71L10.73 11.44C9.55037 12.4465 8.05065 12.9996 6.5 13C4.77609 13 3.12279 12.3152 1.90381 11.0962C0.684819 9.87721 0 8.22391 0 6.5C0 4.77609 0.684819 3.12279 1.90381 1.90381C3.12279 0.684819 4.77609 0 6.5 0ZM6.5 2C4 2 2 4 2 6.5C2 9 4 11 6.5 11C9 11 11 9 11 6.5C11 4 9 2 6.5 2Z" fill="black"/>
          </svg>

          <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0.850098 0.849609H14.8501L9.8501 7.34961V16.8496L5.8501 12.8496V7.34961L0.850098 0.849609Z" stroke="black" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>

        </div>
      </div>
    </CardBase>
<!--    <div class="flex gap-2">-->
<!--      <UIBadgeBtn is_active label="Все"/>-->
<!--      <UIBadgeBtn  number="123" label="Админы"/>-->
<!--    </div>-->

    <CardMember v-for="member in data" :member="member.user" :is_admin="member.is_owner"/>
  </div>

</template>

<style scoped>

</style>