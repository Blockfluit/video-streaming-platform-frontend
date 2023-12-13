import { useLocalStorage } from "@vueuse/core";
import { useJwtStore } from "./jwtStore"

export const useWatchlistStore = defineStore("watchlistStore", {
    state: () => ({
        config: useRuntimeConfig(),
        jwtStore: useJwtStore(),
        watchlist: useLocalStorage("watchlist", [])
    }),
    actions: {
        async setWatchlist() {
            return fetch(this.config.public.baseURL + "/watchlist", {
                method: "GET",
                headers: {
                    Accept: 'application/json',
                    "Authorization": `Bearer ${this.jwtStore.jwt}`
                }
            }).then((response) => {
                if (response.status >= 200 && response.status < 300) {
                    return response.json()
                }
            }).then((data)=> {
                this.watchlist = data
            })
            .catch(e => {
                console.log(e)
                alert(e)
            })
        },
        async addWatchlist(mediaId) {
            return fetch(this.config.public.baseURL + "/watchlist", {
                method: "POST",
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${this.jwtStore.jwt}`
                },
                body: JSON.stringify({
                    id: mediaId
                })
            }).catch(e => {
                console.log(e)
                alert(e)
            })
        },
        async deleteWatchlist(mediaId) {
            return fetch(this.config.public.baseURL + "/watchlist", {
                method: "DELETE",
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${this.jwtStore.jwt}`
                },
                body: JSON.stringify({
                    id: mediaId
                })
            }).catch(e => {
                console.log(e)
                alert(e)
            })
        },
    }
})