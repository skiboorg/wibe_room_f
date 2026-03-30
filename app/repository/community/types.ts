export interface CommunityResponse {
    count: number
    next: any
    previous: any
    results: ShortResult[]
}

export interface ShortResult {
    id: number
    name: string
    slug: string
    cover: string
    short_description: string
    created_at: string
    members_count: number
}

export interface FullResult {
    id: number
    name: string
    slug?: string | null
    cover: string
    short_description: string
    long_description: string
    community_tags?: CommunityTag[]
    community_photos: CommunityPhoto[]
    community_links: CommunityLink[]
    community_rules: [{ title: '', text: '' }]
    community_videos: [{ vk_video_link: '' }]
    members_count: number
    first_members: FirstMember[]
    is_owner: boolean
    is_member: boolean
    created_at: string
}

export interface CommunityTag {
    id: number
    name: string
    slug: string
}

export interface CommunityPhoto {
    id: number
    image: string
}

export interface CommunityLink {
    id: number
    title: string
    url: string
}

export interface FirstMember {
    id: number
    avatar: string
    full_name: string
}

export interface PostResponse {
    pinned: Post[]
    posts: Post[]
    count: number
    next: any
    previous: any
}

export interface PostTag {
    id: number
    name: string
    slug: string
}

export interface AddedBy {
    id: number
    avatar: any
    full_name: any
    is_admin: boolean
}

export interface Post {
    id: number | null
    community: number | null
    post_tags: PostTag[]
    date: string
    added_by: AddedBy
    title: string
    text: string
    vk_video_link: string | null
    is_pinned: boolean
    photos: PostPhoto[]
    is_own?: boolean
    reactions?: PostReaction[]
    reactions_count?: Record<string, number>
    my_reaction?: string | null
    comments_count?: number
    views?: number
    new_tags?: any[]
}

export interface PostPhoto {
    id: number
    image: string
}

export interface PostReaction {
    id: number
    post: number
    reaction: string
    author: AddedBy
}

export interface PostComment {
    id: number
    post: number
    parent: number | null
    author: AddedBy | null
    text: string
    image?: string | null
    date: string
    replies?: PostComment[]
    reactions?: CommentReaction[]
    reactions_count?: Record<string, number>
    my_reaction?: string | null
    is_own?: boolean
    can_delete?: boolean
}

export interface CommentReaction {
    id: number
    comment: number
    reaction: string
    author: AddedBy
}

export interface ProductResponse {
    main_products: Product[]
    products: Product[]
    count: number
    next: any
    previous: any
}

export interface Product {
    id: number
    is_main: boolean
    title: string
    slug: string
    cover: string
    short_description: string
    price: string
    product_info: string
    is_favorite?: boolean
}

export interface EventResponse {
    month: string
    events: Event[]
}

export interface Event {
    id: number
    start_date: string
    time_text: string
    title: string
    slug: string
    cover: string
    short_description: string
    is_favorite?: boolean
}

export interface MembersResult {
    users: MemberUser
    is_owner: boolean
    joined_at: string
}

export interface MemberUser {
    avatar: string
    tg_username: any
    full_name: string
    comment: any
    last_login: string
    date_joined: string
}