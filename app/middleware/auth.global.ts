export default defineNuxtRouteMiddleware(async (to, from) => {
  // console.log(to);
  // if(to.meta.auth || to.meta.guest){
  //   const authStore = useAuthStore();
  //
  //   if(to.meta.auth && !authStore.user){
  //     return navigateTo('/')
  //   }
  //   else if(to.meta.guest && authStore.user){
  //     return navigateTo('/login')
  //   }
  // }
})
