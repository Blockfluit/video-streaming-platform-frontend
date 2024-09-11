import { getAccesToken } from "#imports"
import { useLocalStorage } from "@vueuse/core"

export const useMainStore = defineStore("mainStore", {
    state: () => ({
        config: useRuntimeConfig(),
        allGenres: useLocalStorage("all-genres", []),
        allPersons: useLocalStorage("all-persons", []),
        watched: useLocalStorage("watched", []),
        showSearchBox: false,
        searchbox: "",
        selectedGenres: []
    }),
    actions: {
        async setWatched() {
            return fetch(this.config.public.baseURL + "/watched", {
                method: "GET",
                headers: {
                    Accept: 'application/json',
                    "Authorization": `Bearer ${await getAccesToken()}`
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
                    "Authorization": `Bearer ${await getAccesToken()}`
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
        async getPerson(pagenumber, pagesize, options) {
            return fetch(`${this.config.public.baseURL}/persons/` +
                `?pagenumber=${pagenumber ?? 0}` +
                `&pagesize=${pagesize ?? 30}` +
                `&search=${options?.search ?? ""}`,
                {
                    method: "GET",
                    headers: {
                        Accept: 'application/json',
                        "Authorization": `Bearer ${await getAccesToken()}`
                    }
                }).then((response) => {
                    if (response.status >= 200 && response.status < 300) {
                        return response.json()
                    }
                }).catch(e => {
                    console.log(e)
                })
        },
        async getMedia(endpoint, pagenumber, pagesize, options) {
            return fetch(`${this.config.public.baseURL}/media/${endpoint ?? ""}` +
                `?pagenumber=${pagenumber ?? 0}` +
                `&pagesize=${pagesize ?? 30}` +
                `&type=${options?.type ?? ""}` +
                `&genres=${options?.genres ?? ""}` +
                `&search=${options?.search ?? ""}`,
                {
                    method: "GET",
                    headers: {
                        Accept: 'application/json',
                        "Authorization": `Bearer ${await getAccesToken()}`
                    }
                }).then((response) => {
                    if (response.status >= 200 && response.status < 300) {
                        return response.json()
                    }
                }).catch(e => {
                    console.log(e)
                })
        },
        async getRecommendations() {
            return fetch(`${this.config.public.baseURL}/recommendations`, {
                method: "GET",
                headers: {
                    Accept: 'application/json',
                    "Authorization": `Bearer ${await getAccesToken()}`
                }
            }).then((response) => {
                if (response.status >= 200 && response.status < 300) {
                    return response.json()
                }
            }).catch(e => {
                console.log(e)
            })
        },
        async getAutoCompletion(pagenumber, pagesize, options) {
            return fetch(`${this.config.public.baseURL}/media/auto-completion` +
                `?pagenumber=${pagenumber ?? 0}` +
                `&pagesize=${pagesize ?? 10}` +
                `&type=${options?.type ?? ""}` +
                `&genres=${options?.genres ?? ""}` +
                `&search=${options?.search ?? ""}`, {
                method: "GET",
                headers: {
                    Accept: 'application/json',
                    "Authorization": `Bearer ${await getAccesToken()}`
                }
            }).then((response) => {
                if (response.status >= 200 && response.status < 300) {
                    return response.json()
                }
            }).catch(e => {
                console.log(e)
            })
        },
        async scraperSearch(search) {
            return fetch(`${this.config.public.baseURL}/scraper/search` + 
                `?title=${search}`, {
                method: "GET",
                headers: {
                    Accept: 'application/json',
                    "Authorization": `Bearer ${await getAccesToken()}`
                }
            }).then((response) => {
                if (response.status >= 200 && response.status < 300) {
                    return response.json()
                }
            }).catch(e => {
                console.log(e)
            })
        }
    }
})