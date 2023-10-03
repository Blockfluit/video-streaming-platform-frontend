import { useJwtStore } from "~/stores/jwtStore"

export default defineNuxtRouteMiddleware((to, from) => {
    const jwtStore = useJwtStore()
    const filter = ["login", "register", "change-password"]

    to.name = to.name ?? ""

    if (!filter.includes(to.name.toString()) &&
        !jwtStore.isValid) {
        return navigateTo("/login")
    }
    if (to.name.toString() === "login" &&
        jwtStore.isValid) {
        return navigateTo("/")
    }
})