import { useJwtStore } from "./jwtStore"
import { useWatchStore } from "./watchStore"

export const useMediaStore = defineStore("mediaStore", {
    state: () => ({
        config: useRuntimeConfig(),
        jwtStore: useJwtStore(),
        watchStore: useWatchStore(),
        media: {}
    }),
    actions: {
        async setMedia(id) {
            return fetch(this.config.public.baseURL + "/media/" + id, {
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
                data.media.seasons = [...new Set(data.media.videos.map(video => video.season))]
                this.media = data.media
                return data.media
            }).catch(e => {
                console.log(e)
            })
        },
    }
})