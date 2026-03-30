<script setup lang="ts">
definePageMeta({ layout: 'profile' })

const { $api } = useNuxtApp()

const activeTab = ref<'products' | 'events'>('products')

const { data: favProducts, status: statusP, refresh: refreshP } = useAsyncData('fav-products', () => $api.auth.favorites_products())
const { data: favEvents, status: statusE, refresh: refreshE } = useAsyncData('fav-events', () => $api.auth.favorites_events())

const loading = computed(() => activeTab.value === 'products' ? statusP.value === 'pending' : statusE.value === 'pending')

async function removeFavProduct() {
  await refreshP()
}

async function removeFavEvent() {
  await refreshE()
}

async function clearAll() {
  if (activeTab.value === 'products') {
    for (const f of favProducts.value ?? []) await $api.community.toggle_favorite_product(f.product.id)
    await refreshP()
  } else {
    for (const f of favEvents.value ?? []) await $api.community.toggle_favorite_event(f.event.id)
    await refreshE()
  }
}
</script>

<template>
  <div>


    <!-- табы -->
    <div class="flex gap-2 mb-4">
      <button
          v-for="tab in [{ key: 'products', label: 'Инфопродукты', count: favProducts?.length ?? 0 },
                        { key: 'events',   label: 'Мероприятия',  count: favEvents?.length ?? 0  }]"
          :key="tab.key"
          class="px-4 py-2 rounded-lg border text-sm font-medium transition-colors bg-white"
          :class="activeTab === tab.key
          ? 'border-[#E1422D]  '
          : '  hover:border-[#e1422D50]'"
          @click="activeTab = tab.key as any"
      >
        {{ tab.label }} <span class="text-[#8D95A5]">{{ tab.count }}</span>
      </button>
    </div>

    <!-- очистить список -->
    <button
        v-if="(activeTab === 'products' ? favProducts?.length : favEvents?.length)"
        class="flex items-center gap-1.5 text-sm text-primary mb-4"
        @click="clearAll"
    >
      <i class="pi pi-trash text-xs" />
      Очистить список
    </button>

    <!-- скелетон -->
    <template v-if="loading">
      <div class="space-y-3">
        <CardBase v-for="i in 3" :key="i" padding="md">
          <div class="animate-pulse flex gap-4">
            <div class="w-32 h-20 rounded-xl bg-gray-100 shrink-0" />
            <div class="flex-1 space-y-2 py-1">
              <div class="h-4 bg-gray-100 rounded w-1/2" />
              <div class="h-3 bg-gray-100 rounded w-3/4" />
              <div class="h-3 bg-gray-100 rounded w-1/4" />
            </div>
          </div>
        </CardBase>
      </div>
    </template>

    <!-- продукты -->
    <template v-else-if="activeTab === 'products'">
      <div v-if="!favProducts?.length" class="text-center text-gray-400 text-sm py-8">
        Нет избранных продуктов
      </div>
      <div v-else class="space-y-3">
          <CardProduct v-for="fav in favProducts"
                       :is_full="true"
                       @update="refreshP"
                       :key="fav.product.id" :product="fav.product"/>
      </div>
    </template>

    <!-- мероприятия -->
    <template v-else>
      <div v-if="!favEvents?.length" class="text-center text-gray-400 text-sm py-8">
        Нет избранных мероприятий
      </div>
      <div v-else class="space-y-3">
        <CardBase v-for="fav in favEvents" :key="fav.id" padding="md">

          <CardEvent
              v-for="fav in favEvents"
              :key="fav.id"
              :event="fav.event"
              @update="refreshE"
          />
        </CardBase>
      </div>
    </template>

  </div>
</template>