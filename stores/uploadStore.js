import { useMainStore } from "./mainStore"
import { useLocalStorage } from "@vueuse/core"

export const useUploadStore = defineStore("uploadStore", {
    state: () => ({
        config: useRuntimeConfig(),
        mainStore: useMainStore(),

        thumbnail: useLocalStorage("upload-thumbnail", undefined),
        name: useLocalStorage("upload-name", ""),
        type: useLocalStorage("upload-type", "MOVIE"),
        plot: useLocalStorage("upload-plot", ""),
        trailer: useLocalStorage("upload-trailer", ""),
        year: useLocalStorage("upload-year", ""),
        genres: useLocalStorage("upload-genres", []),
        directors: useLocalStorage("upload-directors", []),
        writers: useLocalStorage("upload-writers", []),
        creators: useLocalStorage("upload-creators", []),
        stars: useLocalStorage("upload-stars", []),
        cast: useLocalStorage("upload-cast", []),
        hidden: useLocalStorage("upload-hidden", false),
        scrapeImdb: useLocalStorage("upload-scrapeImdb", false),
        imdbId: useLocalStorage("upload-imdbId", "")
    }),
    actions: {
        async addMedia() {
            return fetch(this.config.public.baseURL + "/media", {
                method: "POST",
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${await getAccesToken()}`
                },
                body: JSON.stringify({
                    name: this.name,
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
                    hidden: this.hidden,
                    scrapeImdb: this.scrapeImdb,
                    imdbId: this.imdbId
                }),
            }).then((response) => {
                if (response.status >= 200 && response.status < 300) {
                    alert("Upload successful")
                }
            }).catch(e => {
                console.log(e)
                alert(e)
            })
        },
        async deletePerson(id) {
            return fetch(this.config.public.baseURL + "/persons/" + id, {
                method: "DELETE",
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${await getAccesToken()}`
                }
            }).then((response) => {
                if (response.status >= 200 && response.status < 300) {
                    this.mainStore.setAllPersons()
                    alert("Successfully deleted person")
                }
            }).catch(e => {
                console.log(e)
                alert(e)
            })
        },
        async deleteGenre(genre) {
            return fetch(this.config.public.baseURL + "/genres/" + genre, {
                method: "DELETE",
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${await getAccesToken()}`
                }
            }).then((response) => {
                if (response.status >= 200 && response.status < 300) {
                    this.mainStore.setAllGenres()
                    const index = this.genres.findIndex(entry => entry.name === genre)
                    this.genres.splice(index, 1)
                    alert("Successfully deleted actor")
                }
            }).catch(e => {
                console.log(e)
                alert(e)
            })
        }
    }
})