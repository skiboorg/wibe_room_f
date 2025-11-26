export const useAuthToken = () => {
    const token = useCookie<string | null>('auth_token')
    const authToken = useState<string | null>('auth_token_state', () => token.value || null)

    watch(token, (val) => {
        authToken.value = val
    })

    const reset_token =()=> token.value =null

    return {
        authToken,
        reset_token
    }
}
