import { isAdmin, isTokenValid, getAccesToken } from "#imports"

export default defineNuxtRouteMiddleware(async (to, from) => {
    const noAuthFilter = ["login", "register", "change-password"]
    const adminFilter = ["upload", "admin"]
    const accessToken = await getAccesToken()

    to.name = to.name ?? ""



    if(to.name !== "login" && accessToken === "") {
        return navigateTo("/login")
    }

    if (!noAuthFilter.includes(to.name.toString()) &&
        !isTokenValid()) {
        return navigateTo("/login")
    }
    if (to.name === "login" &&
        isTokenValid()) {
        return navigateTo("/")
    }
    if (adminFilter.includes(to.name.toString()) &&
        !isAdmin()) {
        return navigateTo("/")
    }
})