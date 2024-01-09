import { useJwtStore } from "./jwtStore"

export const useRequestStore = defineStore("requestStore", {
    state: () => ({
        config: useRuntimeConfig(),
        jwtStore: useJwtStore(),
    }),
    actions: {
        async getRequests(pagenumber, pagesize, options) {
            return fetch(`${this.config.public.baseURL}/request?pagenumber=${pagenumber}&pagesize=${pagesize}&search=${options.search}`, {
                method: "GET",
                headers: {
                    Accept: 'application/json',
                    "Content-Type": 'application/json',
                    Authorization: `Bearer ${this.jwtStore.jwt}`
                }
            }).then((response) => {
                if (response.status >= 200 && response.status < 300) {
                    return response.json()
                }
            }).then((data) => {
                return data
            }).catch(e => {
                console.log(e)
                alert(e)
            })
        },
        async addRequest(name, year, comment) {
            return fetch(this.config.public.baseURL + "/request", {
                method: "POST",
                headers: {
                    Accept: 'application/json',
                    "Content-Type": 'application/json',
                    Authorization: `Bearer ${this.jwtStore.jwt}`
                },
                body: JSON.stringify({
                    name: name,
                    year: year,
                    comment: comment
                })
            }).then((response) => {
                if (response.status >= 200 && response.status < 300) {
                    alert("Request Successful")
                }
            }).catch(e => {
                console.log(e)
                alert(e)
            })
        },
        async updateRequest(id, options) {
            return fetch(this.config.public.baseURL + "/request/" + id, {
                method: "PATCH",
                headers: {
                    Accept: 'application/json',
                    "Content-Type": 'application/json',
                    Authorization: `Bearer ${this.jwtStore.jwt}`
                },
                body: JSON.stringify({
                    name: options.name,
                    year: options.year,
                    comment: options.comment,
                    status: options.status,
                })
            }).then((response) => {
                if (response.status >= 200 && response.status < 300) {
                }
            }).catch(e => {
                console.log(e)
                alert(e)
            })
        },
        async deleteRequest(id) {
            if (!confirm("Are you sure you want to delete this request?")) return

            return fetch(this.config.public.baseURL + "/request/" + id, {
                method: "DELETE",
                headers: {
                    Accept: 'application/json',
                    "Content-Type": 'application/json',
                    Authorization: `Bearer ${this.jwtStore.jwt}`
                }
            }).then((response) => {
                if (response.status >= 200 && response.status < 300) {
                }
            }).catch(e => {
                console.log(e)
                alert(e)
            })
        }
    }
})