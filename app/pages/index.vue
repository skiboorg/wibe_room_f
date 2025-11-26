<script setup lang="ts">
definePageMeta({
  guest: true,
  layout: 'default',
})

const filters = ref({
  tag:'all',
  q:  null,
  page: 1,
})

const {$api} = useNuxtApp()
const {data:tags} = useHttpRequest( useAsyncData(()=>$api.community.tags()))
const {data:community_response, refresh, status} = useHttpRequest( useAsyncData(()=>$api.community.all(
    {
      query: filters.value,
    })
))


</script>
<template>

<CTACreateCommunity/>
<CardBase padding="lg">
    <TypingText40 text="Сообщества" class="text-center"/>
  <p  class="text-center font-medium">Найдите что то для себя и своё.</p>
  <p class="text-center font-medium mb-8"> Текст для второй строки</p>
  <div class="space-y-3 mb-8">
    <div class="w-full flex items-center gap-3 bg-[#F1F2F4] px-[20px] py-[22px] rounded-[16px] mb-3">
      <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.58333 0C9.59456 0 11.5234 0.798956 12.9456 2.22111C14.3677 3.64326 15.1667 5.57211 15.1667 7.58333C15.1667 9.46167 14.4783 11.1883 13.3467 12.5183L13.6617 12.8333H14.5833L20.4167 18.6667L18.6667 20.4167L12.8333 14.5833V13.6617L12.5183 13.3467C11.1421 14.5209 9.39242 15.1661 7.58333 15.1667C5.57211 15.1667 3.64326 14.3677 2.22111 12.9456C0.798956 11.5234 0 9.59456 0 7.58333C0 5.57211 0.798956 3.64326 2.22111 2.22111C3.64326 0.798956 5.57211 0 7.58333 0ZM7.58333 2.33333C4.66667 2.33333 2.33333 4.66667 2.33333 7.58333C2.33333 10.5 4.66667 12.8333 7.58333 12.8333C10.5 12.8333 12.8333 10.5 12.8333 7.58333C12.8333 4.66667 10.5 2.33333 7.58333 2.33333Z" fill="#8D95A5"/>
      </svg>

      <input class="bg-[#F1F2F4] w-full outline-0 text-lg"
             v-model="filters.q"
             @keyup.enter="refresh"
             placeholder="Найти сообщество"/>
    </div>
    <UIRadioBtns v-model="filters.tag"
                 :items="tags"
                 @select="refresh"/>
  </div>
  <div class="grid grid-cols-3 gap-5">
    <CardGroup :community="community" v-for="community in community_response?.results"/>
  </div>


</CardBase>
</template>