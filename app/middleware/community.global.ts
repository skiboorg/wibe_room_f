export default defineNuxtRouteMiddleware(async (to, from) => {
    const communityStore = useCommunityStore()
    const {loading, needRefresh} = storeToRefs(communityStore);
    const {$api} = useNuxtApp()
    const slug = to.params.group_slug
    const previousSlug = from.params.group_slug
    if (to.path.includes('/group/') && slug) {
        // Загружаем данные только если slug изменился или данные еще не загружены
        const shouldLoad = slug !== previousSlug ||
            !communityStore.currentCommunity ||
            communityStore.currentCommunity.slug !== slug
        if (shouldLoad) {
            loading.value = true
            try {
                console.log('Loading community data for slug:', slug)
                const response = await $api.community.one(slug)
                communityStore.currentCommunity = response

                console.log('Community data loaded:', response)
            } catch (error) {
                console.error('Ошибка при загрузке сообщества:', error)
                communityStore.currentCommunity = null
                if (error.response?.status === 404) {
                    return navigateTo('/404')
                }
            }finally {
                loading.value = false
            }
        } else {
            console.log('Using cached community data for slug:', slug)
        }
    }

    if (from.path.includes('/group/') && !to.path.includes('/group/')) {
        communityStore.currentCommunity = null
    }
})