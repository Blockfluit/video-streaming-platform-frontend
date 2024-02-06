import { useMainStore } from "./mainStore"
import { useLocalStorage } from "@vueuse/core"

export const useUploadStore = defineStore("uploadStore", {
    state: () => ({
        config: useRuntimeConfig(),
        mainStore: useMainStore(),
        name: useLocalStorage("upload-name", ""),
        type: useLocalStorage("upload-type", "MOVIE"),
        plot: useLocalStorage("upload-plot", ""),
        trailer: useLocalStorage("upload-trailer", ""),
        year: useLocalStorage("upload-year", ""),
        genres: useLocalStorage("upload-genres", []),
        actors: useLocalStorage("upload-actors", []),
    }),
    actions: {
        async deleteActor(actor) {
            return fetch(this.config.public.baseURL + "/actors/" + actor.id, {
                method: "DELETE",
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${await getAccesToken()}`
                }
            }).then((response) => {
                if (response.status >= 200 && response.status < 300) {
                    this.mainStore.setAllActors()
                    const index = this.actors.findIndex(entry => entry.firstname === actor.firstname &&
                        entry.lastname === actor.lastname)
                    this.actors.splice(index, 1)
                    alert("Successfully deleted actor")
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