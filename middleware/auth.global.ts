import { isAdmin, isTokenValid } from "#imports"

export default defineNuxtRouteMiddleware(async (to, from) => {
    const noAuthFilter = ["login", "register", "change-password"]
    const adminFilter = ["upload", "admin"]

    to.name = to.name ?? ""

    if (to.name === "login" &&
        isTokenValid()) {
        return navigateTo("/")
    }
    if (!noAuthFilter.includes(to.name.toString()) &&
        !isTokenValid()) {
        return navigateTo("/login")
    }
    if (adminFilter.includes(to.name.toString()) &&
        !isAdmin()) {
        return navigateTo("/")
    }
})