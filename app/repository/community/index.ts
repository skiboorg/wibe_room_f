import type {
    CommunityResponse, EventResponse,
    Event,
    FullResult,
    PostResponse, Product,
    ProductResponse,
    ShortResult,
    MembersResult
} from "~/repository/community/types";

export function createCommunityRepository(appFetch: typeof $fetch){
    const communityStore = useCommunityStore()
    const {currentCommunity} = storeToRefs(communityStore)
    return {
        create(body: FormData){
            return  appFetch(`/api/communities/`,{
                method:'post',
                body
            })
        },
        update(body: FormData){
            console.log('slug', body.get('slug'));
            return  appFetch(`/api/communities/${body.get('slug')}/`,{
                method:'patch',
                body
            })
        },
        tags(){
            return appFetch(`/api/communities_tags/`);
        },
        all(params:{
            query: Record<string, any>,
        }){
            const formattedQueryString = getQueryString(params.query)
            return appFetch<CommunityResponse>(`/api/communities?${formattedQueryString}`);
        },
        one(community_slug:string){
            return appFetch<FullResult>(`/api/communities/${community_slug}/`);
        },
        my(){
            return appFetch<ShortResult[]>(`/api/communities/my/`);
        },
        members(){
            return appFetch<MembersResult[]>(`/api/communities/${currentCommunity.value.slug}/members/`);
        },
        join(){
            return appFetch<MembersResult[]>(`/api/communities/${currentCommunity.value.slug}/join/`,{
                method:'post',
            });
        },
        posts(params:{
            query: Record<string, any>,
        }){
            const formattedQueryString = getQueryString(params.query)
            return appFetch<PostResponse>(`/api/communities/${currentCommunity.value.slug}/posts?${formattedQueryString}`);
        },
        post_tags(){
            return appFetch(`/api/communities/${currentCommunity.value.slug}/tags`);
        },
        post_create(body: FormData){
            return  appFetch(`/api/communities/${body.get('community')}/posts/`,{
                method:'post',
                body
            })
        },

        post_delete(params:{
            id:number,
        }){
            return  appFetch(`/api/communities/${currentCommunity.value.slug}/posts/${params.id}/`,{
                method:'delete',
            })
        },

        products(
            params:{
                query: Record<string, any>,
            }
        ){
            const formattedQueryString = getQueryString(params.query)
            return  appFetch<ProductResponse>(`/api/communities/${currentCommunity.value.slug}/infoproducts/?${formattedQueryString}`)
        },

        product(product_slug:string){
            return  appFetch<Product>(`/api/communities/${currentCommunity.value.slug}/infoproducts/${product_slug}`)
        },
        edit_product_data(product_slug:string){
            return  appFetch<Product>(`/api/communities/${currentCommunity.value.slug}/infoproducts/${product_slug}/edit_data/`)
        },

        product_create(body: FormData){
            return  appFetch(`/api/communities/${currentCommunity.value.slug}/infoproducts/`,{
                method:'post',
                body
            })
        },
        product_update(body: FormData){
            console.log(body.get('slug'))
            return  appFetch(`/api/communities/${currentCommunity.value.slug}/infoproducts/${body.get('slug')}/`,{
                method:'patch',
                body
            })
        },


        events(){
            return appFetch<EventResponse>(`/api/communities/${currentCommunity.value.slug}/events/`);
        },

        event(event_slug:string){
            return appFetch<Event>(`/api/communities/${currentCommunity.value.slug}/events/${event_slug}`);
        },
        event_create(body: FormData){
            return  appFetch(`/api/communities/${currentCommunity.value.slug}/events/`,{
                method:'post',
                body
            })
        },
        event_update(body: FormData){
            return  appFetch(`/api/communities/${currentCommunity.value.slug}/events/${body.get('slug')}/`,{
                method:'patch',
                body
            })
        },
        event_delete(event_slug){
            return  appFetch(`/api/communities/${currentCommunity.value.slug}/events/${event_slug}/`,{
                method:'delete',

            })
        },
    }

}
