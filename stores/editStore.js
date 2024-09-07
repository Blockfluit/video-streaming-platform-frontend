import { getAccesToken, parseImageToBase64 } from "#imports";
import { useMainStore } from "./mainStore"
import { useMediaStore } from "./mediaStore"

export const useEditStore = defineStore("editStore", {
    state: () => ({
        config: useRuntimeConfig(),
        mainStore: useMainStore(),
        mediaStore: useMediaStore(),

        thumbnail: undefined,
        type: "MOVIE",
        genres: [],
        directors: [],
        writers: [],
        creators: [],
        stars: [],
        cast: [],
        trailer: "",
        year: 0,
        plot: "",
        updateFiles: false,
        updateTimestamp: false,
        hidden: false,
        order: [],
        scrapeImdb: false,
        imdbId: ""
    }),
    actions: {
        async updateMedia(mediaId) {
            return fetch(this.config.public.baseURL + "/media/" + mediaId, {
                method: "PATCH",
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${await getAccesToken()}`
                },
                body: JSON.stringify({
                    thumbnail: this.thumbnail,
                    type: this.type,
                    genres: this.genres,
                    directors: this.directors,
                    writers: this.writers,
                    creators: this.creators,
                    stars: this.stars,
                    cast: this.cast,
                    trailer: this.trailer,
                    year: this.year,
                    plot: this.plot,
                    updateFiles: this.updateFiles,
                    updateTimestamp: this.updateTimestamp,
                    hidden: this.hidden,
                    order: this.order.map(video => {return {id: video.id, index: video.index}}),
                    scrapeImdb: this.scrapeImdb,
                    imdbId: this.imdbId
                }),
            }).then((response) => {
                if (response.status >= 200 && response.status < 300) {
                    this.mediaStore.setMedia(mediaId)
                    alert("Update successful.")
                }
            }).catch(e => {
                console.log(e)
                alert(e)
            })
        },
        async deleteMedia(mediaId) {
            const confirmation = confirm("are you sure you want do delete this media? This cannot be undone!")
            console.log(confirmation)
            if (confirmation === false) return console.log('Media is NOT deleted.')

            return fetch(this.config.public.baseURL + "/media/" + mediaId, {
                method: "DELETE",
                headers: {
                    Accept: 'application/json',
                    "Content-Type": 'application/json',
                    Authorization: `Bearer ${await getAccesToken()}`
                }
            }).then((response) => {
                if (response.status >= 200 && response.status < 300) {
                    alert("Successfully deleted media.")
                }
            }).catch(e => {
                console.log(e)
                alert(e)
            })
        }
    }
})