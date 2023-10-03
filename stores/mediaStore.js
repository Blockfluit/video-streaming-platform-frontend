import { useJwtStore } from "./jwtStore"
import { useMainStore } from "./mainStore"
import { useLocalStorage } from "@vueuse/core"

export const useMediaStore = defineStore("mediaStore", {
    state: () => ({
        config: useRuntimeConfig(),
        jwtStore: useJwtStore(),
        mainStore: useMainStore(),
        media: useLocalStorage("media", { name: "", videos: [], genre: [], actors: [] }),
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
                if (this.video.id !== undefined) {
                    this.video = data[0].videos.find(entry => entry.id === this.video.id)
                }
            }).catch(e => {
                console.log(e)
            })
        }
    }
})