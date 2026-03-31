<script setup lang="ts">
const {$api} = useNuxtApp()
const communityStore = useCommunityStore()
const authStore = useAuthStore()
const {currentCommunity} = storeToRefs(communityStore)
const {user} = storeToRefs(authStore)

const joining = ref(false)
const leaving = ref(false)
const confirmLeave = ref(false)

const join = async () => {
  joining.value = true
  try {
    await $api.community.join()
    window.location.href = `/group/${currentCommunity.value.slug}/about`
  } finally {
    joining.value = false
  }
}

const leave = async () => {
  leaving.value = true
  try {
    await $api.community.leave()
    window.location.href = `/group/${currentCommunity.value.slug}/about`
  } catch (e) {
    console.error(e)
  } finally {
    leaving.value = false
    confirmLeave.value = false
  }
}
</script>

<template>
  <div v-if="currentCommunity" class="space-y-4">
    <CardBase padding="none">
      <img class="h-[170px] w-full object-cover rounded-t-2xl"  :src="currentCommunity.cover" alt="">
      <div class="p-4">
        <TypingText20 class="mb-2" :text="currentCommunity.name" />
        <p class="text-[20px] font-semibold mb-2"></p>
        <div class="flex items-center gap-2 mb-2">
          <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.33333 16.6667C7.18056 16.6667 6.09722 16.4478 5.08333 16.01C4.06945 15.5722 3.1875 14.9786 2.4375 14.2292C1.6875 13.4797 1.09389 12.5978 0.656668 11.5833C0.219446 10.5689 0.00055661 9.48556 1.05485e-06 8.33333C-0.000554501 7.18111 0.218334 6.09778 0.656668 5.08333C1.095 4.06889 1.68861 3.18694 2.4375 2.4375C3.18639 1.68806 4.06833 1.09444 5.08333 0.656667C6.09833 0.218889 7.18167 0 8.33333 0C9.485 0 10.5683 0.218889 11.5833 0.656667C12.5983 1.09444 13.4803 1.68806 14.2292 2.4375C14.9781 3.18694 15.5719 4.06889 16.0108 5.08333C16.4497 6.09778 16.6683 7.18111 16.6667 8.33333C16.665 9.48556 16.4461 10.5689 16.01 11.5833C15.5739 12.5978 14.9803 13.4797 14.2292 14.2292C13.4781 14.9786 12.5961 15.5725 11.5833 16.0108C10.5706 16.4492 9.48722 16.6678 8.33333 16.6667ZM8.33333 15C10.1944 15 11.7708 14.3542 13.0625 13.0625C14.3542 11.7708 15 10.1944 15 8.33333C15 8.23611 14.9967 8.13528 14.99 8.03083C14.9833 7.92639 14.9797 7.83972 14.9792 7.77083C14.9097 8.17361 14.7222 8.50694 14.4167 8.77083C14.1111 9.03472 13.75 9.16667 13.3333 9.16667H11.6667C11.2083 9.16667 10.8161 9.00361 10.49 8.6775C10.1639 8.35139 10.0006 7.95889 10 7.5V6.66667H6.66667V5C6.66667 4.54167 6.83 4.14944 7.15667 3.82333C7.48333 3.49722 7.87556 3.33389 8.33333 3.33333H9.16667C9.16667 3.01389 9.25361 2.73278 9.4275 2.49C9.60139 2.24722 9.81306 2.04917 10.0625 1.89583C9.78472 1.82639 9.50361 1.77083 9.21917 1.72917C8.93472 1.6875 8.63945 1.66667 8.33333 1.66667C6.47222 1.66667 4.89583 2.3125 3.60417 3.60417C2.3125 4.89583 1.66667 6.47222 1.66667 8.33333H5.83333C6.75 8.33333 7.53472 8.65972 8.1875 9.3125C8.84028 9.96528 9.16667 10.75 9.16667 11.6667V12.5H6.66667V14.7917C6.94445 14.8611 7.21889 14.9133 7.49 14.9483C7.76111 14.9833 8.04222 15.0006 8.33333 15Z" fill="#8D95A5"/>
          </svg>
          <p class="text-sm text-gray-400 ">Бесплатная группа</p>
        </div>

        <UILink show_copy_icon external_link :label="`@${currentCommunity.slug}`" :link="`https://viberoom.org/group/${currentCommunity.slug}`"/>

        <p class="leading-[130%] mb-3  mt-4">
          {{currentCommunity.short_description}}
        </p>
        <div class="space-y-2">
          <UILink v-for="link in currentCommunity.community_links" show_link_icon external_link :label="link.title" :link="link.url"/>
        </div>
        <div v-if="currentCommunity.is_owner" class="mt-2">
          <nuxt-link :to="`/group/${currentCommunity.slug}/settings`">
            <UIButton extra-class="w-full" variant="outline" label="Настройки">
              <template #icon_left>
                <i class="pi pi-cog"></i>
              </template>
            </UIButton>
          </nuxt-link>
        </div>

        <div v-if="user" class="mt-3">
          <!-- Вступить -->
          <UIButton
              v-if="!currentCommunity.is_member"
              @click="join"
              label="Вступить"
              extra-class="w-full"
              :loading="joining"
          />

          <!-- Выйти — только для участников, не для владельца -->
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
      </div>
    </CardBase>

    <CardBase padding="none">
      <div class="p-5 border-b ">
        <div class="grid grid-cols-2">
          <div class="text-center border-r">
            <p class="text-lg font-semibold">{{currentCommunity.members_count}}</p>
            <p class="text-md">Подписчиков</p>
          </div>
          <div class="text-center">
            <p class="text-lg font-semibold">0</p>
            <p class="text-md">Онлайн</p>
          </div>
        </div>
      </div>

      <div class="p-4">
        <div class="grid grid-cols-3 gap-4">
          <div class="flex flex-col items-center justify-center" v-for="member in currentCommunity?.first_members">
            <UIAvatar class="mb-1" :image="member.avatar" size="lg"/>
            <p class="text-center text-sm">{{member.full_name}}</p>
          </div>
        </div>
      </div>
    </CardBase>

  </div>
</template>