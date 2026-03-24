<script setup lang="ts">
const communityStore = useCommunityStore()
const authStore = useAuthStore()

const { user } = storeToRefs(authStore)
const { currentCommunity } = storeToRefs(communityStore)
const {$api} = useNuxtApp()
const activeMedia = ref<any>(null)

/* VK iframe */
function vkIframeUrl(link: string) {
  const match = link.match(/video-?(\d+)_?(\d+)/)
  if (!match) return ''

  const oid = `-${match[1]}`
  const id = match[2]

  return `https://vkvideo.ru/video_ext.php?oid=${oid}&id=${id}&autoplay=0`
}
const join = async () => {
  await $api.community.join()
  window.location.reload()
}
const leaving = ref(false)
const confirmLeave = ref(false)
const leave = async () => {
  leaving.value = true
  try {
    await $api.community.leave()
    window.location.reload()
  } catch (e) {
    console.error(e)
  } finally {
    leaving.value = false
    confirmLeave.value = false
  }
}
/* медиа галерея */
const gallery = computed(() => {
  if (!currentCommunity.value) return []

  return [
    {
      type: "cover",
      src: currentCommunity.value.cover
    },

    ...(currentCommunity.value.community_videos || []).map(v => ({
      type: "video",
      src: v.vk_video_link
    })),

    ...(currentCommunity.value.community_photos || []).map(p => ({
      type: "photo",
      src: p.image
    }))
  ]
})

watch(
    currentCommunity,
    () => {
      if (currentCommunity.value) {
        activeMedia.value = {
          type: "cover",
          src: currentCommunity.value.cover
        }
      }
    },
    { immediate: true }
)

function selectMedia(media: any) {
  activeMedia.value = media
}
</script>

<template>
  <CardBase padding="md" class="mb-4">

    <!-- MEDIA BLOCK -->

    <div class="mb-6">

      <div class="rounded-2xl overflow-hidden">

        <!-- PHOTO -->
        <img
            v-if="activeMedia?.type === 'photo' || activeMedia?.type === 'cover'"
            :src="activeMedia.src"
            class="w-full h-[300px] object-cover"
        />

        <!-- VIDEO -->
        <iframe
            v-else-if="activeMedia?.type === 'video'"
            :src="vkIframeUrl(activeMedia.src)"
            width="100%"
            height="300"
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            frameborder="0"
            allowfullscreen
        />

      </div>

      <!-- THUMBNAILS -->

      <div class="flex gap-2 mt-3 overflow-x-auto">

        <div
            v-for="(media,index) in gallery"
            :key="index"
            @click="selectMedia(media)"
            class="relative w-[80px] h-[60px] rounded-lg overflow-hidden cursor-pointer border"
        >

          <img
              v-if="media.type === 'photo' || media.type === 'cover'"
              :src="media.src"
              class="w-full h-full object-cover"
          />

          <div v-else class="relative w-full h-full">

            <img
                :src="currentCommunity.cover"
                class="w-full h-full object-cover"
            />

            <div
                class="absolute inset-0 flex items-center justify-center text-white text-lg"
            >
              ▶
            </div>

          </div>

        </div>

      </div>

    </div>

    <!-- TITLE -->

    <TypingText20 class="mb-2" :text="currentCommunity?.name"/>

    <!-- MEMBERS -->

    <div class="flex items-center gap-2 mb-2">
      <p class="text-sm">
        {{ currentCommunity?.members_count }} подписчиков
      </p>
    </div>

    <!-- LINK -->

    <div class="mb-3">
      <UILink
          show_copy_icon
          external_link
          :label="`@${currentCommunity.slug}`"
          :link="`https://viberoom.org/group/${currentCommunity.slug}`"
      />
    </div>

    <!-- COMMUNITY LINKS -->

    <div class="space-y-2">
      <UILink
          v-for="link in currentCommunity.community_links"
          :key="link.url"
          show_link_icon
          external_link
          :label="link.title"
          :link="link.url"
      />
    </div>

    <!-- ABOUT -->

    <div class="mt-6">
      <p class="font-semibold mb-3">О группе</p>
      <div class="leading-[130%]" v-html="currentCommunity?.long_description"/>
    </div>


    <!-- JOIN BUTTON -->

    <div v-if="user" class="block md:hidden mt-4">

      <UIButton
          v-if="!currentCommunity.is_member"
          label="Вступить"
          @click="join"
          extra-class="w-full"
      />

      <template v-else-if="!currentCommunity.is_owner">
        <UIButton
            v-if="!confirmLeave"
            @click="confirmLeave = true"
            label="Выйти из группы"
            variant="outline"
            extra-class="w-full text-gray-500"
        />
        <!-- подтверждение -->
        <div v-else class="space-y-2">
          <p class="text-sm text-center text-gray-500">Вы уверены?</p>
          <div class="flex gap-2">
            <button
                class="flex-1 py-2 rounded-lg border border-[#E2E4E9] text-sm hover:bg-[#F7F8FA] transition-colors"
                @click="confirmLeave = false"
            >
              Отмена
            </button>
            <button
                class="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm hover:bg-red-600 transition-colors disabled:opacity-50"
                :disabled="leaving"
                @click="leave"
            >
              <i v-if="leaving" class="pi pi-spin pi-spinner mr-1 text-xs" />
              Выйти
            </button>
          </div>
        </div>
      </template>

    </div>

  </CardBase>
  <CardBase padding="md">
    <p class="font-bold text-xl mb-3">Правила</p>
    <Accordion >
      <AccordionPanel :value="index" v-for="(rule,index) in currentCommunity.community_rules"
                      :key="index">
        <AccordionHeader>{{rule.title}}</AccordionHeader>
        <AccordionContent>
          <p class="m-0">{{rule.text}}</p>
        </AccordionContent>
      </AccordionPanel>

    </Accordion>
  </CardBase>
</template>