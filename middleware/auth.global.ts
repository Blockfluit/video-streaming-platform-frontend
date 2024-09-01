import { isAdmin } from "#imports"

export default defineNuxtRouteMiddleware(async (to, from) => {
    const noAuthFilter = ["login", "register", "change-password"]
    const adminFilter = ["upload", "admin"]
    const accessToken = await getAccesToken()

    to.name = to.name ?? ""

    // Check if 'to' requires accessToken but the user does not have one.
    if(!noAuthFilter.includes(to.name.toString()) && accessToken === "") {
        return navigateTo("/login")
    }

    // Check if 'to' requires admin privileges and user is admin.
    if (adminFilter.includes(to.name.toString()) &&
        !isAdmin()) {
        return navigateTo("/")
    }
})