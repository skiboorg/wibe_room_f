export interface User {
    id: number
    email: string
    full_name: string
    phone: string
    tg_username: string
    tg_id: string
    avatar: string
    comment: string
    last_login: string
    date_joined: string
}

export interface PostCommentWithContext {
    id: number
    text: string
    image: string | null
    date: string
    reactions_count: Record<string, number>
    my_reaction: string | null
    post_id: number
    post_title: string
    community_name: string
    community_slug: string
    community_cover: string | null
}
export interface FavoriteProduct {
    id: number
    product: {
        id: number
        title: string
        slug: string
        cover: string
        short_description: string
        price: string
        is_favorite: boolean
    }
    community_slug: string
    community_name: string
    created_at: string
}

export interface FavoriteEvent {
    id: number
    event: {
        id: number
        title: string
        slug: string
        cover: string
        short_description: string
        start_date: string
        time_text: string
        is_favorite: boolean
    }
    community_slug: string
    community_name: string
    created_at: string
}
export interface ShortCommunity {
    id: number
    name: string
    slug: string
    cover: string
    short_description: string
    members_count: number
    is_member: boolean
}