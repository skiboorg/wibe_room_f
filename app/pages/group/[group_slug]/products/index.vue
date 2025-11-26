<script setup lang="ts">
const {$api} = useNuxtApp()
const communityStore = useCommunityStore()
const {currentCommunity} = storeToRefs(communityStore)
const filters = ref({
  page: 1,
})
const {data:products_response, refresh, status} = useHttpRequest( useAsyncData(()=>$api.community.products(
    {
      query: filters.value,
    }
)))
const page_update = async (page)=>{
  console.log(page)
  filters.value.page = page
  await refresh()
}


</script>

<template>
  <UIButton @click="navigateTo(`/group/${currentCommunity?.slug}/products/new`)" label="Добавить"/>
<CardProduct v-for="product in products_response?.main_products" :key="product.id" :product="product"/>
  <div class="grid grid-cols-2 gap-x-2 gap-y-4 ">
    <CardProduct v-for="product in products_response?.products" :key="product.id" :product="product"/>
  </div>
  <UIPaginator :total="products_response?.count" :page="filters.page" :per-page="10" @update:page="page_update"/>
</template>

<style scoped>

</style>