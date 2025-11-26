import type {FullResult} from "~/repository/community/types";

export const useCommunityStore = defineStore('community', () => {
  const {$api} = useNuxtApp()
  const currentCommunity = ref<FullResult | null>(null);
  const loading = ref(false);
  const needRefresh = ref(false);

  async function fetchCommunity(slug: string) {
    try {
      currentCommunity.value = await $api.community.one(slug)
    } catch (error) {
      console.error('Ошибка при загрузке сообщества:', error)
      currentCommunity.value = null
    }
  }
  return {
    currentCommunity,
    needRefresh,
    loading,
    fetchCommunity
    }

})
