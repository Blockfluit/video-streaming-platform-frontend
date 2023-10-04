import { useJwtStore } from "~/stores/jwtStore"

export default defineNuxtRouteMiddleware((to, from) => {
    const jwtStore = useJwtStore()
    const noAuthFilter = ["login", "register", "change-password"]
    const adminFilter = ["upload", "admin"]

    to.name = to.name ?? ""

    if (!noAuthFilter.includes(to.name.toString()) &&
        !jwtStore.isValid) {
        return navigateTo("/login")
    }
    if (to.name.toString() === "login" &&
        jwtStore.isValid) {
        return navigateTo("/")
    }
    if (adminFilter.includes(to.name.toString()) &&
        !jwtStore.isAdmin) {
        return navigateTo("/")
    }
})