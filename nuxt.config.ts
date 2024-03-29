// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    devtools: { enabled: true },
    ssr: false,
    modules: [
        '@nuxt/image',
        '@pinia/nuxt',
        'nuxt-icon',
        '@vite-pwa/nuxt',
    ],
    app: {
        pageTransition: { name: 'page', mode: 'out-in' },
    },
    pwa: {
        manifest: {
            name: "Video streaming",
            short_name: "Video streaming",
            description: "Video streaming service",
            background_color: "#121212",
            icons: [
                {
                    src: "icons/favicon-16x16.png",
                    sizes: "16x16",
                    type: "image/png"
                },
                {
                    src: "icons/favicon-32x32.png",
                    sizes: "32x32",
                    type: "image/png"
                },
                {
                    src: "icons/android-chrome-192x192.png",
                    sizes: "192x192",
                    type: "image/png"
                },
                {
                    src: "icons/android-chrome-192x192.png",
                    sizes: "512x512",
                    type: "image/png"
                },
            ],
        },
        workbox: {
            navigateFallback: "/"
        },
        devOptions: {
            enabled: true,
            type: "module"
        },
    },
    runtimeConfig: {
        public: {
            build: Math.floor(100000 + Math.random() * 900000).toString(),
            baseURL: 'https://api-beta.dellekes.nl/api/v1',
            cinemaURL: 'https://cinema.dellekes.nl/',
            // baseURL: process.env.BASE_URL || 'http://192.168.2.4:8085/api/v1',
            // cinemaURL: 'https://cinema.dellekes.nl/'
        },
    },
    css: [
        "/root.css"
    ],
    pinia: {
        autoImports: [
            'defineStore'
        ]
    },
    image: {
        inject: true,
        quality: 60,
    },
})