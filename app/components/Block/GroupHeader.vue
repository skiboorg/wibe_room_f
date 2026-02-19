<script setup lang="ts">
import type {ShortResult} from "~/repository/community/types";

const {$api} = useNuxtApp()
const authStore = useAuthStore()
const {user} = storeToRefs(authStore)
const { group_slug } = useRoute().params
const communities = ref<ShortResult[]>([])

const selectedCommunity = ref(null)
if (user.value){
  const {data: communities_resp} = await useHttpRequest(useAsyncData(() => $api.community.my()))
  communities.value = communities_resp.value
  selectedCommunity.value = communities.value?.find(community => community.slug === group_slug ) || null
}

// Функция для перехода в группу
const goToGroup = (community: any) => {
  navigateTo(`/group/${community.slug}`)

}
</script>

<template>

  <div class="bg-white py-[14px] mb-6">
    <div  class="container grid grid-cols-2 md:grid-cols-3 items-center gap-10">
      <div class="w-full md:w-auto">
        <Select
            v-if="user"
            v-model="selectedCommunity"
            :options="communities"
            optionLabel="name"
            placeholder="Выберите группу"
            class="w-full md:w-1/2"
            @change="(e) => e.value && goToGroup(e.value)"
        >
          <template #value="slotProps">
            <div v-if="slotProps.value" class="flex items-center gap-2">
              <UIAvatar size="xs" :image="slotProps.value.cover"/>
              <div class="truncate">{{ slotProps.value.name }}</div>
            </div>
            <span v-else>
            {{ slotProps.placeholder }}
          </span>
          </template>
          <template #option="slotProps">
            <div class="flex items-center gap-2">
              <UIAvatar size="xs" :image="slotProps.option.cover"/>
              <div class="truncate max-w-[80%]">{{ slotProps.option.name }}</div>
              <div class="ml-auto text-xs text-gray-500">
                {{ slotProps.option.members_count }}
              </div>
            </div>
          </template>
          <template #dropdownicon>
            <svg width="10" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.74896 9.99905C8.0809 9.6671 8.61819 9.6671 8.95013 9.99905C9.28208 10.331 9.28208 10.8683 8.95013 11.2002L5.20013 14.9502C4.86819 15.2822 4.3309 15.2822 3.99896 14.9502L0.248959 11.2002C-0.0829864 10.8683 -0.0829864 10.331 0.248959 9.99905C0.580905 9.6671 1.11819 9.6671 1.45013 9.99905L4.59955 13.1485L7.74896 9.99905ZM4.06341 0.190451C4.39727 -0.0817556 4.88897 -0.0621205 5.20013 0.249045L8.95013 3.99904C9.28208 4.33099 9.28208 4.86827 8.95013 5.20022C8.61819 5.53216 8.0809 5.53216 7.74896 5.20022L4.59955 2.0508L1.45013 5.20022C1.11819 5.53216 0.580905 5.53216 0.248959 5.20022C-0.0829864 4.86827 -0.0829864 4.33099 0.248959 3.99904L3.99896 0.249045L4.06341 0.190451Z" fill="#8D95A5"/>
            </svg>
          </template>
          <template #header>
            <div class="font-medium p-3">Мои группы</div>
          </template>
          <template #footer>
            <div class="p-3">
              <UIButton @click="navigateTo('/group/create')" label="Новая группа" variant="outline" extra-class="w-full" fluid severity="secondary"   />
            </div>
          </template>
        </Select>
      </div>


      <!-- Поиск -->
      <div class="w-full hidden md:flex items-center gap-3 bg-[#F1F2F4] px-[18px] py-[14px] rounded-lg">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5.41667 0C6.85326 0 8.23101 0.570683 9.24683 1.5865C10.2627 2.60233 10.8333 3.98008 10.8333 5.41667C10.8333 6.75833 10.3417 7.99167 9.53333 8.94167L9.75833 9.16667H10.4167L14.5833 13.3333L13.3333 14.5833L9.16667 10.4167V9.75833L8.94167 9.53333C7.95864 10.3721 6.70887 10.833 5.41667 10.8333C3.98008 10.8333 2.60233 10.2627 1.5865 9.24683C0.570683 8.23101 0 6.85326 0 5.41667C0 3.98008 0.570683 2.60233 1.5865 1.5865C2.60233 0.570683 3.98008 0 5.41667 0ZM5.41667 1.66667C3.33333 1.66667 1.66667 3.33333 1.66667 5.41667C1.66667 7.5 3.33333 9.16667 5.41667 9.16667C7.5 9.16667 9.16667 7.5 9.16667 5.41667C9.16667 3.33333 7.5 1.66667 5.41667 1.66667Z" fill="#8D95A5"/>
        </svg>
        <input class="bg-[#F1F2F4] w-full outline-0" placeholder="Поиск по сообществу"/>
      </div>

      <!-- Иконки и аватар -->
      <UIUserInfo/>
    </div>
  </div>
</template>