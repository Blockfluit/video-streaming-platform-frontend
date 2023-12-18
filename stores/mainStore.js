import { useJwtStore } from "./jwtStore"
import { useLocalStorage } from "@vueuse/core"

export const useMainStore = defineStore("mainStore", {
    state: () => ({
        config: useRuntimeConfig(),
        jwtStore: useJwtStore(),
        allMedia: useLocalStorage("all-media", [{
            name: "",
            trailer: ""
        }]),
        allMovies: useLocalStorage("all-movies", []),
        allSeries: useLocalStorage("all-series", []),
        allGenres: useLocalStorage("all-genres", []),
        allActors: useLocalStorage("all-actors", []),
        lastWatched: useLocalStorage("last-watched", []),
        watched: useLocalStorage("watched", []),
        searchbox: "",
    }),
    actions: {
        async setAllMedia() {
            return fetch(this.config.public.baseURL + "/media/", {
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
                this.allMedia = data.allMedia.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                this.allMovies = data.allMedia.filter(media => media["type"] === "MOVIE")
                this.allSeries = data.allMedia.filter(media => media["type"] === "SERIES")
            }).catch(e => {
                console.log(e)
            })
        },
        async setWatched() {
            return fetch(this.config.public.baseURL + "/watched", {
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
                this.watched = data.allWatched.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            }).catch(e => {
                console.log(e)
            })
        },
        async setAllGenres() {
            return fetch(this.config.public.baseURL + "/genres", {
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
                this.allGenres = data.allGenres.map(a => a.name)
                    .sort()
            }).catch(e => {
                console.log(e)
            })
        },
        async setAllActors() {
            return fetch(this.config.public.baseURL + "/actors", {
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
                this.allActors = data.allActors
            }).catch(e => {
                console.log(e)
            })
        },
        async setLastWatched() {
            return fetch(this.config.public.baseURL + "/media/last-watched", {
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
                this.lastWatched = data.lastWatched.slice(0, 50)
            }).catch(e => {
                console.log(e)
            })
        }
    }
})