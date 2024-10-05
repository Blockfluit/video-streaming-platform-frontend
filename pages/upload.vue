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
const imgInput = ref()
const isUploading = ref(false)

onBeforeMount(() => {
    if (process.client) {
        mainStore.setAllGenres()
        initThumbnail()
    }
})

async function initThumbnail() {
    if (thumbnail.value === undefined || thumbnail.value === "") {
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
    isUploading.value = true
    uploadStore.addMedia()
        .then(() => {
            isUploading.value = false
            resetInputFields()
        })
}
</script>

<template>
    <form @submit.prevent="console.log('Form action submitted')" class="upload-form">
        <div class="grid-container">
            <div class="grid-container-info">
                <h1
                    style="margin: 0 0 12px 0; padding-bottom: 12px; border-bottom: 1px solid white; line-height: 1; position: sticky; top: 0; background-color: var(--background-color-100); z-index:999;">
                    Upload Movie/Serie</h1>
                <label>Name:</label>
                <input class="input-field" v-model="name" placeholder="Lord of the Rings" type="text" required>
                <label>IMDb ID:</label>
                <input class="input-field" v-model="imdbId" placeholder="tt7631058" type="text">

                <div style="display: flex; align-items: center;">
                    <label>Type:</label>
                    <input type="radio" v-model="type" required selected name="type" value="MOVIE"><label>Movie</label>
                    <input type="radio" v-model="type" required name="type" value="SERIES"><label>Series</label>
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

                <div v-if="scrapeImdb === false">
                    <label>Plot:</label>
                    <textarea class="input-field plot-text" v-model="plot" placeholder="Plot"></textarea>
                    <label>Year of release:</label>
                    <input class="input-field" v-model="year" placeholder="Year" type="number">

                    <PersonSearchBox :store="uploadStore" />
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
                    <button @click="uploadMedia()" class="submit-btn">
                        <div v-if="!isUploading">
                            <Icon name="material-symbols:upload-rounded" /> Upload Media
                        </div>
                        <div v-if="isUploading">
                            <Icon class="loading-spinner" name="ri:loader-2-line" /> Uploading...
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
.upload-form {
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

.plot-text {
    background-color: transparent;
    color: white;
    font-family: var(--font-family-1);
    min-width: 235px;
    width: 100%;
}

.icon:hover {
    color: var(--primary-color-100);
}

textarea:focus,
input:focus {
    outline: none;
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

.img-wrapper {
    height: 100%;
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