import { useJwtStore } from "./jwtStore"
import { useWatchStore } from "./watchStore"
import { useLocalStorage } from "@vueuse/core"

export const useMediaStore = defineStore("mediaStore", {
    state: () => ({
        config: useRuntimeConfig(),
        jwtStore: useJwtStore(),
        watchStore: useWatchStore(),
        media: useLocalStorage("media", { name: "", videos: [], genre: [], actors: [] }),
    }),
    actions: {
        setMedia(id) {
            fetch(this.config.public.baseURL + "/media/" + id, {
                method: "GET",
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${this.jwtStore.getJwt}`
                }
            }).then((response) => {
                if (response.status >= 200 && response.status < 300) {
                    return response.json()
                }
            }).then((data) => {
                this.media = data[0]
            }).catch(e => {
                console.log(e)
            })
        },
    }
})