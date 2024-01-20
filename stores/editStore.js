import { getAccesToken } from "#imports";
import { useMainStore } from "./mainStore"
import { useMediaStore } from "./mediaStore"
import { storeToRefs } from 'pinia';

export const useEditStore = defineStore("editStore", {
    state: () => ({
        config: useRuntimeConfig(),
        mainStore: useMainStore(),
        mediaStore: useMediaStore(),
    }),
    actions: {
        async updateMedia(mediaId, thumbnail, type, genres, actors, trailer, year, plot, videosOrder, updateVideos) {
            const { media } = storeToRefs(this.mediaStore)

            const actorIds = []
            actors.forEach(a => {
                actorIds.push(this.mainStore.allActors.find(b => a.firstname === b.firstname &&
                    a.lastname === b.lastname).id)
            })

            const formData = new FormData()
            if (thumbnail !== undefined) formData.append("thumbnail", thumbnail)
            if (type !== media.value.type) formData.append("type", type)
            formData.append("genres", genres)
            formData.append("actors", actorIds)
            if (trailer !== media.value.trailer) formData.append("trailer", trailer)
            if (year !== media.value.year) formData.append("year", year)
            if (plot !== media.value.plot) formData.append("plot", plot)

            const order = videosOrder.map(video => { return { id: video.id, index: video.index } })
            order.forEach((entry, index) => {
                formData.append(`order[${index}].id`, entry.id)
                formData.append(`order[${index}].index`, entry.index)
            })
            formData.append("updateFiles", updateVideos)

            return fetch(this.config.public.baseURL + "/media/" + mediaId, {
                method: "PATCH",
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${await getAccesToken()}`
                },
                body: formData,
            }).then((response) => {
                if (response.status >= 200 && response.status < 300) {
                    this.mediaStore.setMedia(mediaId)
                    alert("Update successful.")
                }
            }).catch(e => {
                console.log(e)
                alert(e)
            })
        },
        async deleteMedia(mediaId) {
            if (!confirm("are you sure you want do delete this media? This cannot be undone!")) return

            return fetch(this.config.public.baseURL + "/media/" + mediaId, {
                method: "DELETE",
                headers: {
                    Accept: 'application/json',
                    "Content-Type": 'application/json',
                    Authorization: `Bearer ${await getAccesToken()}`
                }
            }).then((response) => {
                if (response.status >= 200 && response.status < 300) {
                    alert("Successfully deleted media.")
                }
            }).catch(e => {
                console.log(e)
                alert(e)
            })
        }
    }
})