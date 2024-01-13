import { defineStore } from "pinia"
import { useLocalStorage } from "@vueuse/core"

const extractClaim = (jwt, claim) => {
    if (jwt === null) return null
    return JSON.parse(atob(jwt.split(".")[1]))[claim]
}

export const useJwtStore = defineStore("jwtStore", {
    state: () => ({
        config: useRuntimeConfig(),
        jwt: useLocalStorage("token", "")
    }),
    getters: {
        getJwt: (state) => state.jwt,
        getSubject: (state) => extractClaim(state.jwt, "sub"),
        getRole: (state) => extractClaim(state.jwt, "role"),
        getIssuedAt: (state) => extractClaim(state.jwt, "iat"),
        getExpiration: (state) => extractClaim(state.jwt, "exp"),
        isAdmin: (state) => extractClaim(state.jwt, "role") === "ADMIN",
        isValid: (state) => (state.jwt !== "" && ((extractClaim(state.jwt, "exp") * 1000) > Date.now()))
    },
    actions: {
        async setJwt(username, password) {
            fetch(this.config.public.baseURL + "/auth/authenticate", {
                method: "POST",
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                }),
            }).then((response) => {
                if (response.status >= 200 && response.status < 300) {
                    return response.json()
                }
                throw new Error("Username or password is wrong")
            }).then((data) => {
                if (data !== undefined) {
                    this.jwt = data["token"]
                    navigateTo("/")
                }
            }).catch(e => {
                alert(e)
            })
        },
        destroyToken() {
            this.jwt = null
        }
    }
})