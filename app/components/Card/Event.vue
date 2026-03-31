<script setup lang="ts">
import type { Event } from '~/repository/community/types'

const communityStore = useCommunityStore()
const { currentCommunity } = storeToRefs(communityStore)
const { $api } = useNuxtApp()

const props = defineProps<{
  event: Event
  group_slug?: string
}>()
const emits = defineEmits(['delete-event', 'update'])

const isFavorite = ref(props.event.is_favorite ?? false)
const togglingFav = ref(false)

async function toggleFavorite() {
  togglingFav.value = true
  try {
    const res = await $api.community.toggle_favorite_event(props.event.id)
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
  <CardBase padding="sm">
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-4">
        <img class="rounded-lg w-full h-auto" :src="event.cover" alt="" />
      </div>
      <div class="col-span-8">
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <p class="text-sm text-gray-400 font-medium">
              {{ new Date(event.start_date).toLocaleDateString() }} {{ event.time_text }}
            </p>
            <div v-if="currentCommunity?.is_owner" class="flex">
              <Button text icon="pi pi-pencil" size="small" @click="navigateTo(`events/${event.slug}/edit/`)" />
              <Button text icon="pi pi-trash" size="small" severity="danger" @click="emits('delete-event', event.slug)" />
            </div>
          </div>

          <p class="text-lg font-medium leading-[130%]">{{ event.title }}</p>
          <p class="leading-[130%] text-sm text-gray-600 line-clamp-2">{{ event.short_description }}</p>

          <div class="flex flex-col items-start gap-2 flex-wrap">
            {{group_slug}}
            <UITextLink label="Перейти в мероприятие" :to="group_slug ? `/group/${group_slug}/events/${event.slug}`: ` events/${event.slug}`" />

            <!-- в избранное -->
            <button
                class="flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors text-sm"
                :class="isFavorite
            ? 'border-red-300 text-red-500 bg-red-50'
            : 'border-[#E2E4E9] text-[#8D95A5] hover:border-gray-400'"
                :disabled="togglingFav"
                @click="toggleFavorite"
            >
              <svg width="15" height="14" viewBox="0 0 21 19" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      </div>
    </div>
  </CardBase>
</template>