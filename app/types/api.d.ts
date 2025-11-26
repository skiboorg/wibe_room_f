import type { createCommunityRepository } from '~/repository/community'
import type { createAuthRepository } from '~/repository/auth'


export type CommunityRepository = ReturnType<typeof createCommunityRepository>
export type AuthRepository = ReturnType<typeof createAuthRepository>


export interface IApi {
    community: CommunityRepository
    auth: AuthRepository
}