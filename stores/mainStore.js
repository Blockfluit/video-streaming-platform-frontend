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
        lastWatchedUsers: useLocalStorage("last-watched-users", []),
        watched: useLocalStorage("watched", []),
        searchbox: "",
    }),
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
                this.allMedia = data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                this.allMovies = data.filter(media => media["type"] === "MOVIE")
                this.allSeries = data.filter(media => media["type"] === "SERIES")
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
                this.watched = data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            }).catch(e => {
                console.log(e)
            })
        },
        setAllGenres() {
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
                this.allGenres = data.map(a => a.name)
                    .sort()
            }).catch(e => {
                console.log(e)
            })
        },
        setAllActors() {
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
                this.allActors = data
            }).catch(e => {
                console.log(e)
            })
        },
        setLastWatchedUsers() {
            fetch(this.config.public.baseURL + "/media/last-watched", {
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
                this.lastWatchedUsers = data.slice(0, 50)
            }).catch(e => {
                console.log(e)
            })
        }
    }
})