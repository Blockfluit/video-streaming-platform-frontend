<script setup>
import { useMainStore } from '~/stores/mainStore';
import { useUploadStore } from '~/stores/uploadStore';
import { storeToRefs } from 'pinia';

useHead({ title: "Upload" })

const mainStore = useMainStore()
const uploadStore = useUploadStore()

const { allGenres } = storeToRefs(mainStore)
const { name, thumbnail, type, plot, trailer, year, genres, directors, writers, creators, stars, cast, hidden, scrapeImdb, imdbId } = storeToRefs(uploadStore)

const acceptedFileExt = ["jpeg", "png", "jpg"]
const searchGenres = ref("")
const previewImageUrl = ref("https://s.w-x.co/in-cat_in_glasses.jpg")

onBeforeMount(() => {
    if (process.client) {
        mainStore.setAllPersons()
        mainStore.setAllGenres()
        initThumbnail()
    }
})

async function initThumbnail() {
    if(thumbnail.value === undefined || thumbnail.value === "") {
        return
    }

    return await fetch(thumbnail.value)
        .then(res => res.blob())
        .then(image => {
            previewImageUrl.value = URL.createObjectURL(image)
        })
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

function resetInputFields() {
    thumbnail.value = undefined
    type.value = "MOVIE"
    plot.value = ""
    trailer.value = ""
    year.value = ""
    genres.value = []
    directors.value = []
    writers.value = []
    creators.value = []
    stars.value = []
    cast.value = []
    hidden.value = false
    scrapeImdb.value = false
    imdbId.value = ""
    previewImageUrl.value = "https://s.w-x.co/in-cat_in_glasses.jpg"
}

async function uploadMedia() {
    uploadStore.addMedia()
        .then(() => resetInputFields())
}
</script>

<template>
    <div class="container">
        <div class="container-add-media">
            <form @submit.prevent="console.log('Form action submitted')" class="upload-form">
                <div style="max-width: 280px;">
                    <label>Thumbnail:</label>
                    <input @change="e => thumbnailHandler(e)" style="width: 100%;" type="file"
                        accept="image/jpeg, image/png" required>
                    <label>Name:</label>
                    <input class="input-field" v-model="name" placeholder="Name" type="text" required>
                    <label>Imdb id:</label>
                    <input class="input-field" v-model="imdbId" placeholder="Imdb id" type="text">
                    <label>Type:</label>
                    <div>
                        <input type="radio" v-model="type" required selected name="type"
                            value="MOVIE"><label>Movie</label>
                        <input type="radio" v-model="type" required name="type" value="SERIES"><label>Series</label>
                    </div>
                    <label>Plot:</label>
                    <textarea class="input-field plot-text" v-model="plot"></textarea>
                    <label>Trailer URL:</label>
                    <input class="input-field" v-model="trailer" placeholder="Trailer" type="url" required>
                    <label>Year of release:</label>
                    <input class="input-field" v-model="year" placeholder="Year" type="number">
                    <div style="display:flex; align-items: center;">
                        <input class="input-field" style="margin:0 6px 0 0;" v-model="hidden" type="checkbox">
                        <label>Hidden</label>
                    </div>
                    <div style="display:flex; align-items: center;">
                        <input class="input-field" style="margin:0 6px 0 0;" v-model="scrapeImdb" type="checkbox">
                        <label>Scrape Imdb</label>
                    </div>
                </div>
                <img style="margin: 50px; border-radius: 15px;" :src="previewImageUrl" class="preview-image">
                <div>
                   <PersonSearchBox :store="uploadStore"/>
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
                                        genre }}</label>
                                </div>
                                <Icon class="icon" @click="uploadStore.deleteGenre(genre)"
                                    name="material-symbols:delete">
                                </Icon>
                            </div>
                        </template>
                    </div>
                    <button @click="uploadMedia()" class="submit-btn" type="submit">Upload Media</button>
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
    border-radius: 5px;
    padding-left: 6px;
    display: flex;
    justify-content: flex-start;
    margin-bottom: 15px;
}

.plot-text {
    background-color: transparent;
    color: white;
    font-family: var(--font-family-1);
    min-width: 235px;
}

.icon:hover {
    color: var(--primary-color-100);
}

.upload-form {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-evenly;
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