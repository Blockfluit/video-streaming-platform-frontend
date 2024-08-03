<script setup>
import { useMainStore } from '~/stores/mainStore';
import { useUploadStore } from '~/stores/uploadStore';
import { useEditStore } from '~/stores/editStore'
import { storeToRefs } from 'pinia';
import { useMediaStore } from '~/stores/mediaStore';

const config = useRuntimeConfig()
const mainStore = useMainStore()
const uploadStore = useUploadStore()
const mediaStore = useMediaStore()
const editStore = useEditStore()

const { allGenres, allActors } = storeToRefs(mainStore)
const { media } = storeToRefs(mediaStore)

const type = ref("MOVIE")
const plot = ref("")
const trailer = ref("")
const year = ref(0)
const genres = ref([])
const actors = ref([])
const searchGenres = ref("")
const searchActors = ref("")
const updateVideos = ref(false)
const videosOrder = ref([])
const thumbnail = ref()
const previewImageUrl = ref("")

const filteredActors = ref([])
let currentMediaId

const isSelectedActor = computed((actor) => {
    return actors.includes(actor)
})

onBeforeMount(() => {
    if (process.client) {
        const route = useRoute()
        currentMediaId = route.params.mediaId

        mediaStore.setMedia(currentMediaId).then(() => {
            resetInputFields()
            useHead({ title: `Editing: ${media.value.name}` })
        })
        mainStore.setAllActors()
        mainStore.setAllGenres()
    }
})

onMounted(() => {
    if (process.client) {
        filterActors(searchActors.value)
    }
})

watch(actors, (n, o) => {
    filterActors(searchActors.value)
    console.log(actors.value)
})

function resetInputFields() {
    type.value = media.value.type
    plot.value = media.value.plot
    trailer.value = media.value.trailer
    year.value = media.value.year
    genres.value = media.value.genres
    actors.value = media.value.actors
    updateVideos.value = false
    videosOrder.value = media.value.videos?.sort((a, b) => a.index - b.index)
    previewImageUrl.value = config.public.baseURL + "/stream/thumbnail/" + media.value.id

}

function selectActors(actor) {
    return actors.value.includes(actor)
}

const thumbnailHandler = (e) => {
    if (thumbnail.value !== undefined &&
        !acceptedFileExt.includes(e.target.files[0].type.split("/")[1])) {
        alert("Invalid File extension")
        thumbnail.value = undefined
        return
    }
    thumbnail.value = e.target.files[0]
    previewImageUrl.value = URL.createObjectURL(e.target.files[0])
}

async function filterActors(search) {
    filteredActors.value = allActors.value.filter(actor => `${actor.firstname} ${actor.lastname}`.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => `${a.firstname}${a.lastname}`.localeCompare(`${b.firstname}${b.lastname}`))
        .sort((a, b) => {
            const cond1 = actors.value.findIndex(c => c.firstname === a.firstname && c.lastname === a.lastname) !== -1
            const cond2 = actors.value.findIndex(c => c.firstname === b.firstname && c.lastname === b.lastname) !== -1
            if (cond1 && !cond2) return -1
            if (!cond1 && cond2) return 1
            if (!cond1 === cond2) return 0
        })
}
</script>

<template>
    <div class="container">
        <div class="container-add-media">
            <form @submit.prevent="console.log('Form action submitted')" class="edit-form">
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
                    <input class="input-field" v-model="plot" type="text">
                    <label>Trailer URL:</label>
                    <input class="input-field" v-model="trailer" type="url">
                    <label>Year of release:</label>
                    <input class="input-field" v-model="year" type="number">
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
                    <input class="input-field" v-model="searchActors" placeholder="Search actor" type="search"
                        @keyup="filterActors(searchActors)">
                    <div class="title">
                        <div style="display: flex; align-items: center;">
                            <label style="margin-right: 10px;">Actors:</label>
                            <AddActor />
                        </div>
                        <span>Selected: {{ actors?.length }}</span>
                    </div>
                    <div class="actor-list">
                        <template v-for="actor in filteredActors">
                            <div class="actor">
                                <div>
                                    <input class="actor-checkbox" v-model="actors" type="checkbox" :id="actor.id"
                                        :value="actor">
                                    <span>{{ actor.id }}</span>
                                    <label class=" actor-checkbox" style="margin-left: 10px;" :for="actor.id">{{
                                        `${actor.firstname} ${actor.lastname}` }}</label>
                                </div>
                                <Icon class="icon" @click="uploadStore.deleteActor(actor)"
                                    name="material-symbols:delete">
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
                                <Icon class="icon" @click="uploadStore.deleteGenre(genre)"
                                    name="material-symbols:delete">
                                </Icon>
                            </div>
                        </template>
                    </div>
                    <button @click="editStore.updateMedia(currentMediaId, thumbnail, type, genres, actors, trailer,
                        year, plot, videosOrder, updateVideos)" class="submit-btn" type="submit">Update Media</button>
                    <button @click="editStore.deleteMedia(media.id)" class="submit-btn"
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