export default defineNuxtConfig({
  devtools: { enabled: false },
  css: ['~/assets/scss/main.scss'],
  modules: [
    '@nuxtjs/supabase',  
    'nuxt3-notifications',
  ],
  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/',
    }
  },
})
