<script setup>
import { useJwtStore } from '~/stores/jwtStore';
import { useMainStore } from '~/stores/mainStore';
import { useUploadStore } from '~/stores/uploadStore';
import { useEditStore } from '~/stores/editStore'
import { storeToRefs } from 'pinia';
import { useMediaStore } from '~/stores/mediaStore';

definePageMeta({
    layout: "main",
});

const config = useRuntimeConfig()
const mainStore = useMainStore()
const uploadStore = useUploadStore()
const editStore = useEditStore()
const jwtStore = useJwtStore()
const mediaStore = useMediaStore()

const { allGenres, allActors } = storeToRefs(mainStore)
const { type, plot, trailer, year, genres, actors } = storeToRefs(editStore)
const { media } = storeToRefs(mediaStore)

const acceptedFileExt = ["jpeg", "png", "jpg"]

const updateVideos = ref(false)
const searchGenres = ref("")
const searchActors = ref("")
const videosOrder = ref([...media.value.videos].sort((a, b) => a.index - b.index))

const thumbnail = ref()
const previewImageUrl = ref(config.public.baseURL + "/stream/thumbnail/" + media.value.id)

onBeforeMount(() => {
    if (process.client) {
        mainStore.setAllActors()
        mainStore.setAllGenres()
        type.value = media.value.type
        genres.value = media.value.genre
        actors.value = media.value.actors
    }
})

const thumbnailHandler = (e) => {
    if (thumbnail.value !== undefined &&
        !acceptedFileExt.includes(e.target.files[0].type.split("/")[1])) {
        alert("Invalid File extension")
        return
    }
    thumbnail.value = e.target.files[0]
    previewImageUrl.value = URL.createObjectURL(e.target.files[0])
}

const updateMedia = () => {
    if (thumbnail.value !== undefined &&
        !acceptedFileExt.includes(thumbnail.value.type.split("/")[1])) {
        alert("Invalid File extension")
        return
    }

    const actorIds = []
    actors.value.forEach(a => {
        actorIds.push(allActors.value.find(b => a.firstname === b.firstname &&
            a.lastname === b.lastname).id)
    })

    const order = videosOrder.value.map(video => { return { id: video.id, index: video.index } })

    const formData = new FormData()
    if (thumbnail.value !== undefined) formData.append("thumbnail", thumbnail.value)
    if (type.value !== "") formData.append("type", type.value)
    if (genres.value.length !== 0) formData.append("genres", genres.value)
    if (actors.value.length !== 0) formData.append("actors", actorIds)
    if (trailer.value !== "") formData.append("trailer", trailer.value)
    if (year.value !== "") formData.append("year", year.value)
    if (plot.value !== "") formData.append("plot", plot.value)
    if (videosOrder.value.length !== 0) {
        order.forEach((entry, index) => {
            formData.append(`order[${index}].id`, entry.id)
            formData.append(`order[${index}].index`, entry.index)
        })
    }
    formData.append("updateFiles", updateVideos.value)

    fetch(config.public.baseURL + "/media/" + media.value.id, {
        method: "PATCH",
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${jwtStore.getJwt}`
        },
        body: formData,
    }).then((response) => {
        if (response.status >= 200 && response.status < 300) {
            updateVideos.value = false
            alert("Update successful.")
            mediaStore.setMedia(media.value.id)
        }
    }).catch(e => {
        console.log(e)
        alert(e)
    })
}

const deleteMedia = (id) => {
    if (!confirm("are you sure you want do delete this media? This cannot be undone!")) return

    fetch(config.public.baseURL + "/media/" + id, {
        method: "DELETE",
        headers: {
            Accept: 'application/json',
            "Content-Type": 'application/json',
            Authorization: `Bearer ${jwtStore.getJwt}`
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

watch(videosOrder, (o, n) => {
    console.log(videosOrder.value)
}, { deep: true })

</script>

<template>
    <div class="container">
        <div class="container-add-media">
            <form @submit.prevent="updateMedia" class="edit-form">
                <div style="max-width: 280px;">
                    <label>Thumbnail:</label>
                    <input @change="e => thumbnailHandler(e)" type="file" accept="image/jpeg, image/png">
                    <label>Name:</label>
                    <p>{{ media.name }}</p>
                    <label>Type:</label>
                    <div>
                        <input type="radio" v-model="type" selected name="type" value="MOVIE"><label>Movie</label>
                        <input type="radio" v-model="type" name="type" value="SERIES"><label>Series</label>
                    </div>
                    <label>Plot:</label>
                    <input class="input-field" v-model="plot" :placeholder="media.plot" type="text">
                    <label>Trailer URL:</label>
                    <input class="input-field" v-model="trailer" :placeholder="media.trailer" type="url">
                    <label>Year of release:</label>
                    <input class="input-field" v-model="year" :placeholder="media.year" type="number">
                    <label>Update videos:</label>
                    <input class="input-field" v-model="updateVideos" type="checkbox">
                </div>
                <div style="margin: 20px 0px'; display: flex; align-items: center; flex-direction: column">
                    <img style="margin: 50px; margin-bottom: 0; border-radius: 15px;" :src="previewImageUrl"
                        class="preview-image">
                    <span style="margin: 10px 0px;">Video Order:</span>
                    <ul class="video-order">
                        <div v-for="(video, index) in videosOrder"
                            style="display: flex; align-items: center; border-bottom: 1px solid white;">
                            <input @change="e => videosOrder[index].index = e.target.valueAsNumber" type="number"
                                :value="video.index"
                                style="width: 50px; border: none; border-right: 1px solid white; display: flex; text-align: center;">
                            <li style="list-style-type: none; margin-left: 10px;">{{ video.name }}</li>
                        </div>
                    </ul>
                </div>
                <div>
                    <label>Search actor:</label>
                    <input class="input-field" v-model="searchActors" placeholder="Search actor" type="search">
                    <div class="title">
                        <div style="display: flex; align-items: center;">
                            <label style="margin-right: 10px;">Actors:</label>
                            <AddActor />
                        </div>
                        <span>Selected: {{ actors.length }}</span>
                    </div>
                    <div class="actor-list">
                        <template v-for="actor in allActors.filter(actor => `${actor.firstname} ${actor.lastname}`.toLowerCase().includes(searchActors.toLowerCase()))
                            .sort((a, b) => `${a.firstname}${a.lastname}`.localeCompare(`${b.firstname}${b.lastname}`))
                            .sort((a, b) => {
                                const cond1 = actors.findIndex(c => c.firstname === a.firstname && c.lastname === a.lastname) !== -1
                                const cond2 = actors.findIndex(c => c.firstname === b.firstname && c.lastname === b.lastname) !== -1
                                if (cond1 && !cond2) return -1
                                if (!cond1 && cond2) return 1
                                if (!cond1 === cond2) return 0
                            })">
                            <div class="actor">
                                <div>
                                    <input class="actor-checkbox" v-model="actors" type="checkbox" :id="actor.id"
                                        :value="{ firstname: actor.firstname, lastname: actor.lastname ?? null }">
                                    <label class="actor-checkbox" style="margin-left: 10px;" :for="actor.id">{{
                                        `${actor.firstname} ${actor.lastname}` }}</label>
                                </div>
                                <Icon class="icon" @click="uploadStore.deleteActor(actor)" name="material-symbols:delete">
                                </Icon>
                            </div>
                        </template>
                    </div>
                    <div class="title">
                        <div style="display: flex; align-items: center;">
                            <span style="margin-right: 10px;">Genres:</span>
                            <AddGenre />
                        </div>
                        <span>Selected: {{ genres.length }}</span>
                    </div>
                    <input v-model="searchGenres" class="input-field" placeholder="Search genre" type="search">

                    <div class="genre-list">
                        <template v-for="genre in allGenres.filter(genre => genre.toLowerCase().includes(searchGenres.toLowerCase()))
                            .sort((a, b) => a.localeCompare(b))
                            .sort((a, b) => {
                                const cond1 = genres.includes(a)
                                const cond2 = genres.includes(b)
                                if (cond1 && !cond2) return -1
                                if (!cond1 && cond2) return 1
                                if (!cond1 === cond2) return 0
                            })">
                            <div class="genre">
                                <div>
                                    <input class="genre-checkbox" v-model="genres" type="checkbox" :id="genre"
                                        :value="genre">
                                    <label class="genre-checkbox" style="margin-left: 10px;" :for="genre">{{
                                        genre.charAt(0).toUpperCase() + genre.slice(1) }}</label>
                                </div>
                                <Icon class="icon" @click="uploadStore.deleteGenre(genre)" name="material-symbols:delete">
                                </Icon>
                            </div>
                        </template>
                    </div>
                    <button class="submit-btn" type="submit">Update Media</button>
                    <button @click="deleteMedia(media.id)" class="submit-btn"
                        style="background-color: var(--primary-color-100);">Delete Media</button>
                </div>
            </form>
        </div>
    </div>
</template>

<style scoped>
.container {
    display: flex;
    flex-direction: row;
    justify-content: center;
}

.input-field {
    border: 1px solid white;
    border-radius: 25px;
    padding-left: 15px;
    display: flex;
    justify-content: flex-start;
    margin-bottom: 15px;
}

.edit-form {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-evenly;
}

.icon:hover {
    color: var(--primary-color-100);
}

.video-order {
    display: flex;
    flex-direction: column;
    margin: 0px 50px;
    padding: 0;
    max-height: 200px;
    overflow-y: scroll;
    border: 1px solid white;
    border-radius: 5px;
}

.video-order div:last-child {
    border-bottom: none !important;
}

.actor {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 5px;
}

.actor-checkbox {
    -webkit-user-select: none;
    /* Safari */
    -ms-user-select: none;
    /* IE 10 and IE 11 */
    user-select: none;
    /* Standard syntax */
}

.genre-checkbox {
    -webkit-user-select: none;
    /* Safari */
    -ms-user-select: none;
    /* IE 10 and IE 11 */
    user-select: none;
    /* Standard syntax */
}

.actor-checkbox:hover {
    cursor: pointer;
}

.genre-checkbox:hover {
    cursor: pointer;
}

.title {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.submit-btn {
    margin: 10px;
    background-color: white;
    border: none;
    border-radius: 15px;
    padding: 10px 20px;
    font-family: var(--font-family-1);
    font-weight: 600;
    color: var(--background-color-100)
}

.submit-btn:hover {
    cursor: pointer;
    background-color: var(--primary-color-100);
}

.genre {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 5px;
}

.container-add-media {
    max-width: 90vw;
    margin: 40px;
}

.actor-list {
    height: 200px;
    overflow-y: scroll;
    border: 1px solid white;
    border-radius: 4px;
    margin-bottom: 15px;
}

.genre-list {
    height: 200px;
    overflow-y: scroll;
    border: 1px solid white;
    border-radius: 4px;
}

.icon:hover {
    cursor: pointer;
}

.container-vertical {
    display: flex;
    flex-direction: column;
}

.preview-image {
    object-fit: cover;
    width: 300px;
    height: 450px;
}
</style>