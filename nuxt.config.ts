// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    devtools: { enabled: true },
    ssr: false,
    modules: [
        '@pinia/nuxt',
        'nuxt-icon',
    ],
    runtimeConfig: {
        public: {
            baseURL: process.env.BASE_URL || 'https://beta.dellekes.nl/api/v1',
        },
    },
    css: [
        "/root.css"
    ],
    pinia: {
        autoImports: [
            'defineStore'
        ]
    }
})
