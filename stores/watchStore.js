import { useJwtStore } from "./jwtStore"
import { useLocalStorage } from "@vueuse/core"
import { useMainStore } from "./mainStore"
import { useMediaStore } from "./mediaStore"
import { storeToRefs } from "pinia"

export const useWatchStore = defineStore("watchStore", {
    state: () => ({
        config: useRuntimeConfig(),
        jwtStore: useJwtStore(),
        mainStore: useMainStore(),
        mediaStore: useMediaStore(),
        startTime: 0,
        volume: useLocalStorage("watch-volume", 0.5),
        video: {},
        nextVideo: {},
        previousVideo: {},
    }),
    actions: {
        async setVideo(mediaId, videoId) {
            const promise1 = this.mainStore.setWatched()
                .then(() => {
                    const video = this.mainStore.watched.find(entry => entry.videoId === videoId)
                    this.startTime = video?.timestamp ?? 0
                })
            const promise2 = this.mediaStore.getMedia(mediaId)
                .then((media) => {
                    this.video = media.videos.find(entry => entry.id === videoId)
                    this.nextVideo = media.videos.find(entry => entry.index === this.video.index + 1)
                    this.previousVideo = media.videos.find(entry => entry.index === this.video.index - 1)
                })
            return Promise.all([promise1, promise2])
        },
        async updateWatched(id, time) {
            return fetch(this.config.public.baseURL + "/watched", {
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
                    return
                }
            }).catch(e => {
                console.log(e)
            })
        },
    }
})