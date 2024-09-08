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

const { thumbnail, type, plot, trailer, year, genres, directors, writers, creators, stars, cast, updateTimestamp, updateFiles, hidden, order, scrapeImdb, imdbId } = storeToRefs(editStore)
const { allGenres } = storeToRefs(mainStore)

const searchGenres = ref("")
const previewImageUrl = ref("")

const media = ref({})
let mediaId

onBeforeMount(() => {
    if (process.client) {
        const route = useRoute()
        mediaId = route.params.mediaId

        mediaStore.setMedia(mediaId).then(m => {
            useHead({ title: `Editing: ${m.name}` })
            media.value = m
            resetInputFields()
        })
        mainStore.setAllGenres()
    }
})

function resetInputFields() {
    thumbnail.value = undefined
    type.value = media.value.type
    plot.value = media.value.plot
    trailer.value = media.value.trailer
    year.value = media.value.year
    genres.value = media.value.genres
    directors.value = media.value.directors.map(p => p.id)
    writers.value = media.value.writers.map(p => p.id)
    creators.value = media.value.creators.map(p => p.id)
    stars.value = media.value.stars.map(p => p.id)
    cast.value = media.value.cast.map(p => p.id)
    updateFiles.value = false
    updateTimestamp.value = false
    hidden.value = media.value.hidden
    scrapeImdb.value = false
    imdbId.value = media.value.imdbId
    order.value = media.value.videos?.sort((a, b) => a.index - b.index)
    previewImageUrl.value = config.public.baseURL + "/stream/thumbnail/" + media.value.id
}

async function thumbnailHandler(e) {
    if (thumbnail.value !== undefined &&
        !acceptedFileExt.includes(e.target.files[0].type.split("/")[1])) {
        alert("Invalid File extension")
        thumbnail.value = undefined
        return
    }
    previewImageUrl.value = URL.createObjectURL(e.target.files[0])
    thumbnail.value = await parseImageToBase64(e.target.files[0])
}

async function updateMedia(mediaId) {
    editStore.updateMedia(mediaId)
        .then(async () => {
            await mediaStore.setMedia(mediaId)
            resetInputFields()
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
                    <label>Imdb id:</label>
                    <input class="input-field" v-model="imdbId" placeholder="Imdb id" type="text">
                    <label>Type:</label>
                    <div>
                        <input type="radio" v-model="type" selected name="type" value="MOVIE"><label>Movie</label>
                        <input type="radio" v-model="type" name="type" value="SERIES"><label>Series</label>
                    </div>
                    <label>Plot:</label>
                    <input class="input-field" v-model="plot" type="text">
                    <label>Trailer URL:</label>
                    <input class="input-field" v-model="trailer" type="url" required>
                    <label>Year of release:</label>
                    <input class="input-field" v-model="year" type="number">
                    <div style="display:flex; align-items: center;">
                        <input class="input-field" style="margin:0 6px 0 0;" v-model="updateFiles" type="checkbox">
                        <label>Update videos</label>
                    </div>
                    <div style="display:flex; align-items: center;">
                        <input class="input-field" style="margin:0 6px 0 0;" v-model="updateTimestamp" id="timestamp"
                            type="checkbox">
                        <label for="timestamp">Update timestamp</label>
                    </div>
                    <div style="display:flex; align-items: center;">
                        <input class="input-field" style="margin:0 6px 0 0;" v-model="hidden" type="checkbox">
                        <label>Hidden</label>
                    </div>
                    <div style="display:flex; align-items: center;">
                        <input class="input-field" style="margin:0 6px 0 0;" v-model="scrapeImdb" type="checkbox">
                        <label>Scrape Imdb</label>
                    </div>
                </div>
                <div style="margin: 20px 0px'; display: flex; align-items: center; flex-direction: column">
                    <img style="margin: 50px; margin-bottom: 0; border-radius: 15px;" :src="previewImageUrl"
                        class="preview-image">
                    <span style="margin: 10px 0px;">Video Order:</span>
                    <ul class="video-order">
                        <div v-for="(video, index) in order"
                            style="display: flex; align-items: center; border-bottom: 1px solid white;">
                            <input @change="e => order[index].index = e.target.valueAsNumber" type="number"
                                :value="video.index"
                                style="width: 50px; border: none; border-right: 1px solid white; display: flex; text-align: center;">
                            <li style="list-style-type: none; margin-left: 10px;">{{ video.name }}</li>
                        </div>
                    </ul>
                </div>
                <div>
                    <PersonSearchBox :store="editStore" :key="media" />
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
                    <button @click="updateMedia(mediaId)" class="submit-btn"
                        type="submit">Update Media</button>
                    <button @click="editStore.deleteMedia(mediaId)" class="submit-btn"
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