<script setup lang="ts">
definePageMeta({
  auth: false,
  layout: 'group-form'
})
const {$api} = useNuxtApp()
const {product_slug} = useRoute().params
const {data:product, refresh, status} = await useHttpRequest( useAsyncData(()=>$api.community.edit_product_data(product_slug)))

</script>

<template>

<FormProduct :product="product"/>
</template>

<style scoped>

</style>