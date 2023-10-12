import { useJwtStore } from "./jwtStore"
import { useLocalStorage } from "@vueuse/core"
import { useMainStore } from "./mainStore"

export const useWatchStore = defineStore("watchStore", {
    state: () => ({
        config: useRuntimeConfig(),
        jwtStore: useJwtStore(),
        mainStore: useMainStore(),
        startTime: useLocalStorage("watch-start-time", 0),
        volume: useLocalStorage("watch-volume", 0.5),
        video: useLocalStorage("video", {}),
    }),
    actions: {
        updateWatched(id, time) {
            fetch(this.config.public.baseURL + "/watched", {
                method: "POST",
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${this.jwtStore.getJwt}`
                },
                body: JSON.stringify({
                    id: id,
                    timestamp: time
                })
            }).then((response) => {
                if (response.status >= 200 && response.status < 300) {
                    this.mainStore.setWatched()
                    return
                }
            }).catch(e => {
                console.log(e)
            })
        },
    }
})