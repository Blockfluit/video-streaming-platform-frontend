import { useLocalStorage } from "@vueuse/core"

export const useEditStore = defineStore("editStore", {
    state: () => ({
        type: useLocalStorage("edit-type", ""),
        plot: useLocalStorage("edit-plot", ""),
        trailer: useLocalStorage("edit-trailer", ""),
        year: useLocalStorage("edit-year", ""),
        genres: useLocalStorage("edit-genres", []),
        actors: useLocalStorage("edit-actors", []),
    })
})