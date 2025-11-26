import { createCommunityRepository } from "~/repository/community";
import { createAuthRepository } from "~/repository/auth";

export default defineNuxtPlugin({
  name: 'fetch',
  parallel: true,
  async setup(nuxtApp){
    const config = useRuntimeConfig();

    const appFetch = $fetch.create({
      baseURL: config.public.apiUrl as string,
      retry: false,
      onRequest({ options }) {
        options.headers.append('Accept', 'application/json');

        const manager_auth_token = useCookie('auth_token')

        if(manager_auth_token.value){
          options.headers.append('Authorization', `Token ${manager_auth_token.value}`);
        }
       
      },
      async onResponseError({ response }) {

        if(response.status == 401){
          nuxtApp.runWithContext(() => navigateTo('/'));
          // mb with real page reload
        }
      }
    });

    const api = {
      community: createCommunityRepository(appFetch),
      auth: createAuthRepository(appFetch),
    };
    
    return {
      provide: {
        appFetch,
        api
      }
    }
  }
});