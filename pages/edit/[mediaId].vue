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

const acceptedFileExt = ["jpeg", "png", "jpg"]
const searchGenres = ref("")
const previewImageUrl = ref("")
const imgInput = ref()
const isEditing = ref(false)
const isDeleting = ref(false)

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
    isEditing.value = true
    editStore.updateMedia(mediaId)
        .then(async () => {
            await mediaStore.setMedia(mediaId)
            isEditing.value = false
            resetInputFields()
        })
}

async function deleteMedia(mediaId) {
    isDeleting.value = true
    editStore.deleteMedia(mediaId)
        .then(async () => {
            isDeleting.value = false
            resetInputFields()
        })
}
</script>

<template>
    <form @submit.prevent="console.log('Form action submitted')" class="edit-form">
        <div class="grid-container">
            <div class="grid-container-info">
                <h1
                    style="margin: 0 0 12px 0; padding-bottom: 12px; border-bottom: 1px solid white; line-height: 1; position: sticky; top: 0; background-color: var(--background-color-100); z-index:999;">
                    Edit Movie/Serie</h1>
                <label>Name:</label>
                <p>{{ media.name }}</p>
                <label>IMDb ID:</label>
                <input class="input-field" v-model="imdbId" placeholder="tt7631058" type="text">

                <div style="display: flex; align-items: center;">
                    <label>Type:</label>
                    <input type="radio" v-model="type" required selected name="type" value="MOVIE"><label>Movie</label>
                    <input type="radio" v-model="type" required name="type" value="SERIES"><label>Series</label>
                </div>
                <div style="display:flex; align-items: center;">
                    <label style="margin-right: 6px">Update videos:</label>
                    <input class="checkbox" style="margin:0 6px 0 0;" v-model="updateFiles" type="checkbox">
                </div>
                <div style="display:flex; align-items: center;">
                    <label style="margin-right: 6px">Update timestamp:</label>
                    <input class="checkbox" style="margin:0 6px 0 0;" v-model="updateTimestamp" type="checkbox">
                </div>
                <div style="display:flex; align-items: center;">
                    <label style="margin-right: 6px">Hidden:</label>
                    <input class="checkbox" style="margin:0 6px 0 0;" v-model="hidden" type="checkbox">
                </div>
                <div style="display:flex; align-items: center; margin-bottom: 12px;">
                    <label style="margin-right: 6px">Scrape IMDb:</label>
                    <input class="checkbox" style="margin:0 6px 0 0;" v-model="scrapeImdb" type="checkbox">
                </div>
                <label>Trailer URL:</label>
                <input class="input-field" v-model="trailer"
                    placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=18" type="url" required>

                <div style="display: flex; flex-direction: column">
                    <span>Video Order:</span>
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

                <div v-if="scrapeImdb === false">
                    <label>Plot:</label>
                    <textarea class="input-field plot-text" v-model="plot" placeholder="Plot"></textarea>
                    <label>Year of release:</label>
                    <input class="input-field" v-model="year" placeholder="Year" type="number">

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
                </div>
            </div>
            <div class="grid-container-img">
                <div class="img-wrapper">
                    <img :src="previewImageUrl" class="preview-image">
                </div>
                <div style="display: flex; ">
                    <button style="margin: 12px;" class="button" @click="imgInput.click()">
                        <Icon name="material-symbols:add-photo-alternate-outline" /> Add Image
                    </button>
                    <button @click="updateMedia(mediaId)" class="submit-btn">
                        <div v-if="!isEditing">
                            <Icon name="mdi:pencil" /> Update Media
                        </div>
                        <div v-if="isEditing">
                            <Icon class="loading-spinner" name="ri:loader-2-line" /> Updating...
                        </div>
                    </button>
                    <button @click="deleteMedia(mediaId)" class="submit-btn delete"
                        style="background-color: var(--primary-color-100)">
                        <div v-if="!isDeleting">
                            <Icon name="material-symbols:delete" /> Delete Media
                        </div>
                        <div v-if="isDeleting">
                            <Icon class="loading-spinner" name="mdi:pencil" /> Deleting...
                        </div>

                    </button>
                    <input @change="e => thumbnailHandler(e)" type="file"
                        style="visibility: hidden; height: 0px; width: 0px;" accept="image/jpeg, image/png"
                        ref="imgInput" required>
                </div>
            </div>
        </div>
    </form>
</template>

<style scoped>
.edit-form {
    margin: 50px;
    padding: 30px;
    border-radius: 6px;
    background-color: var(--background-color-100);
    height: 80vh;
    overflow: hidden;
}

.grid-container {
    display: grid;
    grid-template-columns: 5fr 1fr;
    gap: 50px;
    width: 100%;
    height: 100%;
}

.grid-container-img {
    display: flex;
    align-items: center;
    flex-direction: column;
    width: 100%;
    order: 2;
}

.grid-container-info {
    width: 100%;
    overflow-y: scroll;
    padding-right: 24px;
    order: 1;
}

.input-field {
    border: 1px solid white;
    border-radius: 5px;
    padding-left: 6px;
    display: flex;
    justify-content: flex-start;
    margin-bottom: 15px;
    width: 100%;
}

.button {
    background-color: transparent;
    border: 1px solid white;
    color: white;
    font-family: 'Poppins';
    padding: 5px 10px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;
}

.button:hover {
    border: 1px solid var(--primary-color-100);
    color: var(--primary-color-100);

}

.submit-btn {
    margin: 12px;
    background-color: white;
    border: none;
    border-radius: 6px;
    padding: 5px 10px;
    font-family: var(--font-family-1);
    font-weight: 500;
    font-size: 16px;
    color: var(--background-color-100);
}

.submit-btn:hover {
    cursor: pointer;
    background-color: var(--primary-color-100);
}

.edit-form {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-evenly;
}

.plot-text {
    background-color: transparent;
    color: white;
    font-family: var(--font-family-1);
    min-width: 235px;
    width: 100%;
}

.delete:hover {
    background-color: #d62215 !important;
}

textarea:focus,
input:focus {
    outline: none;
}

.video-order {
    display: flex;
    flex-direction: column;
    padding: 0;
    max-height: 200px;
    overflow-y: scroll;
    border: 1px solid white;
    border-radius: 5px;
    margin-top: 0;
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
    border-radius: 5px;
    aspect-ratio: 2/3;
    object-fit: cover;
    max-height: 65vh;
}

.loading-spinner {
    transform-origin: center;
    animation: spinner 2s ease-in-out infinite;
}

@media screen and (max-width: 993px) {
    .upload-form {
        margin: 25px 5px;
        overflow: hidden;
    }

    .grid-container {
        display: grid;
        grid-template-columns: repeat(auto-fill, 100%);
        gap: 50px;
        overflow-y: scroll;
        overflow-x: hidden
    }

    .grid-container-info {
        overflow: visible;
        padding-right: 10px;
    }

    .preview-image {
        max-height: 50vh;
    }
}

@keyframes spinner {
    0% {
        transform: rotate(0deg);
    }

    50% {
        transform: rotate(180deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>