import { useLocalStorage } from "@vueuse/core";
import { getAccesToken } from "#imports";

export const useWatchlistStore = defineStore("watchlistStore", {
    state: () => ({
        config: useRuntimeConfig(),
        watchlist: useLocalStorage("watchlist", [])
    }),
    actions: {
        async setWatchlist() {
            return fetch(this.config.public.baseURL + "/watchlist", {
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
                this.watchlist = data.watchlist
            }).catch(e => {
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
                    "Authorization": `Bearer ${await getAccesToken()}`
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
                    "Authorization": `Bearer ${await getAccesToken()}`
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