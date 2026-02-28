<script setup lang="ts">
definePageMeta({
  auth: false,
  layout: 'group'
})
const {$api} = useNuxtApp()
const {product_slug} = useRoute().params
const {data:product, refresh, status} = useHttpRequest( useAsyncData(()=>$api.community.product(product_slug)))

</script>

<template>

    <CardBase padding="md">
      <img class="h-[300px] w-full object-cover rounded-2xl mb-6"  :src="product?.cover" alt="">

      <TypingText20 class="mb-2" :text="product?.title"/>

      <p class="leading-[130%] mb-[18px]">
        {{product?.short_description}}
      </p>

      <div class="grid grid-cols-1 gap-4">
        <a :href="product?.main_link" target="_blank" rel="noopener noreferrer">
          <UIButton fluid :label="product.price ?  `Доступ за ${product.price}₽` : 'Беслатно'"/>
        </a>

<!--        <UIButton variant="outline" label="Оформить рассрочку"/>-->
      </div>

      <div class="product-html-content mt-4" v-html="product?.product_info"></div>

      <div class="flex flex-wrap gap-4 mt-12">

        <a class="inline-block" v-for="file in product?.files" target="_blank" download="" :href="file.file">
          <UILink  :label="file.name"/>
        </a>


      </div>

    </CardBase>



</template>

<style scoped>

</style>