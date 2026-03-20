<script setup lang="ts">
const {$api} = useNuxtApp()

const {data, refresh, status} = useHttpRequest(useAsyncData(()=>$api.community.members()))
</script>

<template>
  <div class="space-y-4">
    <CardBase padding="lg_sm">
      <div class="flex items-center justify-between">
        <p class="text-lg font-medium ">Участники сообщества</p>

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