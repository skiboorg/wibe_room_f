import {useAuthStore} from "~/stores/auth";
import type {User, PostCommentWithContext, ShortCommunity, FavoriteProduct, FavoriteEvent} from "~/repository/auth/types";

export function createAuthRepository(appFetch: typeof $fetch){
    const {setUser} = useAuthStore()

    const authCookie = useCookie('auth_token')
    return{
        register(payload:any){
            return appFetch('/auth/users/', {
                method: 'POST',
                body: {...payload}
            })
        },
        login(body: any){
            return appFetch('/auth/token/login/',{
                method: 'POST',
                body
            })
        },
        async logout(){
            authCookie.value = null
            await appFetch('/auth/token/logout/',{method:'post'})
            window.location.href='/'
        },
        async update(formData: FormData){
            const response = await appFetch<User>('/api/user/update', {
                method: 'patch',
                body: formData
            })
            setUser(response)
        },
        async me(){
            try{
                const response = await appFetch<User>('/api/user/me')
                setUser(response)
            }catch(error){
                console.log(error)
            }
        },
        reset_password(body: any){
            return appFetch('/api/user/reset_password',{
                method: 'POST',
                body
            })
        },
        my_comments(){
            return appFetch<PostCommentWithContext[]>('/api/user/my_comments/')
        },
        my_communities(){
            return appFetch<ShortCommunity[]>('/api/user/my_communities/')
        },
        favorites_products(){
            return appFetch<FavoriteProduct[]>('/api/favorites/products/')
        },
        favorites_events(){
            return appFetch<FavoriteEvent[]>('/api/favorites/events/')
        },
    }
}