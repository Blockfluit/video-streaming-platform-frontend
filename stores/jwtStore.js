import { defineStore } from "pinia"
import { useLocalStorage } from "@vueuse/core"

const extractClaim = (jwt, claim) => {
    if (jwt === null) return null
    return JSON.parse(atob(jwt.split(".")[1]))[claim]
}

export const useJwtStore = defineStore("jwtStore", {
    state: () => ({
        // jwt: useLocalStorage("token", "")
        jwt: "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiQURNSU4iLCJzdWIiOiJuaWVscyIsImlhdCI6MTcwNDU0NzkzOSwiZXhwIjoxNzA1MTUyNzM5fQ.Cs6GVIZX2mvy-AmbZW7kx9oOt0uCt8kKgNYytQfHLDk"
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
        destroyToken() {
            this.jwt = null
        }
    }
})