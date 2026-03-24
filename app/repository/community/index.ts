import type {
    CommunityResponse, EventResponse,
    Event,
    FullResult,
    PostResponse, PostComment, Product,
    ProductResponse,
    ShortResult,
    MembersResult
} from "~/repository/community/types";

export function createCommunityRepository(appFetch: typeof $fetch) {
    const communityStore = useCommunityStore()
    const { currentCommunity } = storeToRefs(communityStore)

    return {
        create(body: FormData) {
            return appFetch(`/api/communities/`, { method: 'post', body })
        },
        update(body: FormData) {
            return appFetch(`/api/communities/${body.get('slug')}/`, { method: 'patch', body })
        },
        tags() {
            return appFetch(`/api/communities_tags/`)
        },
        all(params: { query: Record<string, any> }) {
            const formattedQueryString = getQueryString(params.query)
            return appFetch<CommunityResponse>(`/api/communities?${formattedQueryString}`)
        },
        one(community_slug: string) {
            return appFetch<FullResult>(`/api/communities/${community_slug}/`)
        },
        my() {
            return appFetch<ShortResult[]>(`/api/communities/my/`)
        },
        members() {
            return appFetch<MembersResult[]>(`/api/communities/${currentCommunity.value.slug}/members/`)
        },
        join() {
            return appFetch<MembersResult[]>(`/api/communities/${currentCommunity.value.slug}/join/`, { method: 'post' })
        },

        // ── посты ─────────────────────────────────────────────
        posts(params: { query: Record<string, any> }) {
            const formattedQueryString = getQueryString(params.query)
            return appFetch<PostResponse>(`/api/communities/${currentCommunity.value.slug}/posts?${formattedQueryString}`)
        },
        post_tags() {
            return appFetch(`/api/communities/${currentCommunity.value.slug}/tags`)
        },
        post_create(body: FormData) {
            return appFetch(`/api/communities/${body.get('community')}/posts/`, { method: 'post', body })
        },
        post_delete(params: { id: number }) {
            return appFetch(`/api/communities/${currentCommunity.value.slug}/posts/${params.id}/`, { method: 'delete' })
        },
        // ── просмотры ─────────────────────────────────────────
        post_view(postId: number) {
            return appFetch(`/api/communities/${currentCommunity.value.slug}/posts/${postId}/view/`, {
                method: 'post',
            })
        },

        // ── реакция на пост (toggle) ──────────────────────────
        post_react(postId: number, reaction: string) {
            return appFetch(`/api/communities/${currentCommunity.value.slug}/posts/${postId}/react/`, {
                method: 'post',
                body: { reaction },
            })
        },

        // ── комментарии к посту ───────────────────────────────
        post_comments(postId: number) {
            return appFetch<PostComment[]>(
                `/api/communities/${currentCommunity.value.slug}/posts/${postId}/comments/`
            )
        },
        post_comment_add(postId: number, body: { text: string; parent: number | null; image?: File | null }) {
            const fd = new FormData()
            fd.append('text', body.text)
            if (body.parent) fd.append('parent', String(body.parent))
            if (body.image) fd.append('image', body.image)
            return appFetch<PostComment>(
                `/api/communities/${currentCommunity.value.slug}/posts/${postId}/comments/add/`,
                { method: 'post', body: fd }
            )
        },

        // ── реакция на комментарий (toggle) ───────────────────
        comment_react(commentId: number, reaction: string) {
            return appFetch(`/api/comments/${commentId}/react/`, {
                method: 'post',
                body: { reaction },
            })
        },

        // ── продукты ──────────────────────────────────────────
        products(params: { query: Record<string, any> }) {
            const formattedQueryString = getQueryString(params.query)
            return appFetch<ProductResponse>(`/api/communities/${currentCommunity.value.slug}/infoproducts/?${formattedQueryString}`)
        },
        product(product_slug: string) {
            return appFetch<Product>(`/api/communities/${currentCommunity.value.slug}/infoproducts/${product_slug}`)
        },
        edit_product_data(product_slug: string) {
            return appFetch<Product>(`/api/communities/${currentCommunity.value.slug}/infoproducts/${product_slug}/edit_data/`)
        },
        product_create(body: FormData) {
            return appFetch(`/api/communities/${currentCommunity.value.slug}/infoproducts/`, { method: 'post', body })
        },
        product_update(body: FormData) {
            return appFetch(`/api/communities/${currentCommunity.value.slug}/infoproducts/${body.get('slug')}/`, { method: 'patch', body })
        },

        // ── события ───────────────────────────────────────────
        events() {
            return appFetch<EventResponse>(`/api/communities/${currentCommunity.value.slug}/events/`)
        },
        event(event_slug: string) {
            return appFetch<Event>(`/api/communities/${currentCommunity.value.slug}/events/${event_slug}`)
        },
        event_create(body: FormData) {
            return appFetch(`/api/communities/${currentCommunity.value.slug}/events/`, { method: 'post', body })
        },
        event_update(body: FormData) {
            return appFetch(`/api/communities/${currentCommunity.value.slug}/events/${body.get('slug')}/`, { method: 'patch', body })
        },
        event_delete(event_slug: string) {
            return appFetch(`/api/communities/${currentCommunity.value.slug}/events/${event_slug}/`, { method: 'delete' })
        },
    }
}