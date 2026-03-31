<script setup lang="ts">
import type { Product } from '~/repository/community/types'

const props = defineProps<{
  product: Product
  group_slug?: string
  is_full?: boolean
}>()

const emits = defineEmits(['update'])

const { $api } = useNuxtApp()
const communityStore = useCommunityStore()
const { currentCommunity } = storeToRefs(communityStore)

const isFavorite = ref( props.product.is_favorite ??props.is_fav ?? false)
const togglingFav = ref(false)

async function toggleFavorite() {
  togglingFav.value = true
  try {
    const res = await $api.community.toggle_favorite_product(props.product.id)
    isFavorite.value = res.is_favorite
    emits('update')
  } catch (e) {
    console.error(e)
  } finally {
    togglingFav.value = false
  }
}
</script>

<template>
  <CardBase>
    <div class="relative mb-5">
      <Button
          v-if="currentCommunity?.is_owner"
          icon="pi pi-pencil"
          @click="navigateTo(`/group/${group_slug ? group_slug :currentCommunity.slug}/products/${product.slug}/edit`)"
      />
      <img
          v-if="product.cover"
          class="rounded-lg w-full h-[300px] object-cover block"
          :src="product.cover"
          alt=""
      />
    </div>

    <div class="p-3">
      <p class="text-[20px] font-semibold mb-3">{{ product.title }}</p>
      <p class="text-md leading-[130%] mb-[18px]">{{ product.short_description }}</p>

      <div class=" gap-2 w-full" :class="is_full ? 'flex flex-wrap' : 'grid grid-cols-1'">
        <!-- цена -->
<!--        <UIButton-->
<!--            variant="outline"-->
<!--            :label="product.price ? `Доступ за ${product.price}₽` : 'Бесплатно'"-->
<!--        />-->

        <!-- перейти -->
        <nuxt-link  :to="`/group/${group_slug ? group_slug : currentCommunity?.slug}/products/${product.slug}`">
          <UIButton fluid label="Перейти" />
        </nuxt-link>

        <!-- в избранное -->
        <button
            class="flex items-center justify-center gap-2 px-3 py-3 rounded-lg border transition-colors text-sm"
            :class="isFavorite
            ? 'border-red-300 text-red-500 bg-red-50'
            : 'border-[#E2E4E9] text-[#8D95A5] hover:border-gray-400'"
            :disabled="togglingFav"
            @click="toggleFavorite"
        >
          <svg width="18" height="16" viewBox="0 0 21 19" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M3.10961 11.3496C7.60961 16.5996 10.2346 18.0996 10.2346 18.0996C10.2346 18.0996 12.8596 16.5996 17.3596 11.3496C21.8596 6.09961 18.8596 0.849609 15.1096 0.849609C11.3596 0.849609 10.2346 5.34961 10.2346 5.34961C10.2346 5.34961 9.10961 0.849609 5.35961 0.849609C1.60961 0.849609 -1.39039 6.09961 3.10961 11.3496Z"
                :fill="isFavorite ? '#ef4444' : 'none'"
                :stroke="isFavorite ? '#ef4444' : 'currentColor'"
                stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"
            />
          </svg>

          {{ isFavorite ? 'В избранном' : 'В избранное' }}
        </button>
      </div>
    </div>
  </CardBase>
</template>