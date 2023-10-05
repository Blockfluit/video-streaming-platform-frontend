import { useJwtStore } from "./jwtStore"
import { useLocalStorage } from "@vueuse/core"

export const useMainStore = defineStore("mainStore", {
    state: () => ({
        config: useRuntimeConfig(),
        jwtStore: useJwtStore(),
        allMedia: useLocalStorage("all-media", []),
        watched: [],
        searchbox: "",
        actors: [],
        genres: [],
    }),
    getters: {
        getAllMovies: (state) => state.allMedia.filter(media => media["type"] === "MOVIE"),
        getAllSeries: (state) => state.allMedia.filter(media => media["type"] === "SERIES"),
    },
    actions: {
        setAllMedia() {
            fetch(this.config.public.baseURL + "/media/", {
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
                this.allMedia = data
            }).catch(e => {
                console.log(e)
            })
        },
        setWatched() {
            fetch(this.config.public.baseURL + "/watched", {
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
                this.watched = data
            }).catch(e => {
                console.log(e)
            })
        },
        setGenres() {
            fetch(this.config.public.baseURL + "/genres", {
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
                this.genres = data
            }).catch(e => {
                console.log(e)
            })
        },
        setActors() {
            fetch(this.config.public.baseURL + "/actors", {
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
                this.actors = data
            }).catch(e => {
                console.log(e)
            })
        }
    }
})