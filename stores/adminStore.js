import { useJwtStore } from "./jwtStore"

export const useAdminStore = defineStore("adminStore", {
    state: () => ({
        config: useRuntimeConfig(),
        jwtStore: useJwtStore(),
        users: [],
        tokens: [],
    }),
    actions: {
        async getAllUsers() {
            fetch(this.config.public.baseURL + "/users", {
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
                this.users = data
            }).catch(e => {
                console.log(e)
            })
        },
        async addUser(username, email, password, role) {
            fetch(this.config.public.baseURL + "/auth/register", {
                method: "POST",
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${this.jwtStore.getJwt}`
                },
                body: JSON.stringify({
                    username: username,
                    email: email === "" ? null : email,
                    password: password,
                    role: role,
                })
            }).then((response) => {
                if (response.status >= 200 && response.status < 300) {
                    username.value = ""
                    email.value = ""
                    password = ""
                    getAllUsers()
                }
            }).catch(e => {
                console.log(e)
            })
        },
        async updateUser(username, email, role) {
            if (this.jwtStore.getSubject === username &&
                role !== null &&
                !confirm("You are about to change your own role. This might not be reverseable. Are you sure?")) {
                getAllUsers()
                return
            }

            fetch(this.config.public.baseURL + "/users", {
                method: "PATCH",
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${this.jwtStore.getJwt}`
                },
                body: JSON.stringify({
                    username: username,
                    email: email,
                    role: role,
                })
            }).then((response) => {
                if (response.status >= 200 && response.status < 300) {
                    getAllUsers()
                }
            }).catch(e => {
                console.log(e)
            })
        },
        async deleteUser(username) {
            if (!confirm("Are you sure you want to delete this account?")) return

            fetch(this.config.public.baseURL + "/users", {
                method: "DELETE",
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${this.jwtStore.getJwt}`
                },
                body: JSON.stringify({
                    username: username,
                })
            }).then((response) => {
                if (response.status >= 200 && response.status < 300) {
                    getAllUsers()
                }
            }).catch(e => {
                console.log(e)
            })
        },
        async getAllTokens() {
            fetch(this.config.public.baseURL + "/invite-tokens", {
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
                this.tokens = data
            }).catch(e => {
                console.log(e)
            })
        },
        async addToken(expiration, role, master) {
            fetch(this.config.public.baseURL + "/invite-tokens", {
                method: "POST",
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${this.jwtStore.getJwt}`
                },
                body: JSON.stringify({
                    expiration: new Date(expiration),
                    role: role,
                    master: master,
                })
            }).then((response) => {
                if (response.status >= 200 && response.status < 300) {
                    getAllTokens()
                }
            }).catch(e => {
                console.log(e)
            })
        },
        async deleteToken(token) {
            if (!confirm("Are you sure you want to delete this token?")) return

            fetch(this.config.public.baseURL + "/invite-tokens/" + token, {
                method: "DELETE",
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${this.jwtStore.getJwt}`
                }
            }).then((response) => {
                if (response.status >= 200 && response.status < 300) {
                    getAllTokens()
                }
            }).catch(e => {
                console.log(e)
            })
        }
    }
})