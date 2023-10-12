<script setup>
import { useJwtStore } from '~/stores/jwtStore';
import { useMainStore } from '~/stores/mainStore';
import { useUploadStore } from '~/stores/uploadStore';
import { storeToRefs } from 'pinia';

definePageMeta({
    layout: "main",
});

const config = useRuntimeConfig()
const mainStore = useMainStore()
const uploadStore = useUploadStore()
const jwtStore = useJwtStore()

const { allGenres, allActors } = storeToRefs(mainStore)
const { name, type, plot, trailer, year, genres, actors } = storeToRefs(uploadStore)

const acceptedFileExt = ["jpeg", "png", "jpg"]

const searchGenres = ref("")
const searchActors = ref("")

const thumbnail = ref()
const previewImageUrl = ref()

onBeforeMount(() => {
    if (process.client) {
        mainStore.setAllActors()
        mainStore.setAllGenres()
    }
    console.log(type.value)
})

const thumbnailHandler = (e) => {
    if (!acceptedFileExt.includes(e.target.files[0].type.split("/")[1])) {
        alert("Invalid File extension")
        return
    }
    thumbnail.value = e.target.files[0]
    previewImageUrl.value = URL.createObjectURL(e.target.files[0])
}

const addMedia = () => {
    if (!acceptedFileExt.includes(thumbnail.value.type.split("/")[1])) {
        alert("Invalid File extension")
        return
    }

    const formData = new FormData()
    formData.append("name", name.value)
    formData.append("thumbnail", thumbnail.value)
    formData.append("type", type.value)
    formData.append("genres", genres.value)
    formData.append("actors", actors.value)
    formData.append("trailer", trailer.value)
    formData.append("year", year.value)
    formData.append("plot", plot.value)

    fetch(config.public.baseURL + "/media", {
        method: "POST",
        headers: {
            Accept: 'application/json',
            "Authorization": `Bearer ${jwtStore.getJwt}`
        },
        body: formData,
    }).then((response) => {
        if (response.status >= 200 && response.status < 300) {
            name.value = ""
            type.value = "MOVIE"
            actors.value = []
            genres.value = []
            plot.value = ""
            trailer.value = ""
            year.value = ""
            alert("Upload successful")
        }
    }).catch(e => {
        console.log(e)
        alert(e)
    })
}
</script>

<template>
    <div class="container">
        <div class="container-add-media">
            <form @submit.prevent="addMedia" class="container-vertical">
                <label>Thumbnail:</label>
                <input @change="e => thumbnailHandler(e)" type="file" accept="image/jpeg, image/png" required>
                <label>Name:</label>
                <input class="input-field" v-model="name" placeholder="Name" type="text" required>
                <label>Type:</label>
                <div>
                    <input type="radio" v-model="type" required selected name="type" value="MOVIE"><label>Movie</label>
                    <input type="radio" v-model="type" required name="type" value="SERIES"><label>Series</label>
                </div>
                <!-- <select v-model="type" required>
                    <option value="MOVIE" selected>Movie</option>
                    <option value="SERIES">Series</option>
                </select> -->
                <label>Plot:</label>
                <input class="input-field" v-model="plot" placeholder="Plot" type="text" required>
                <label>Trailer URL:</label>
                <input class="input-field" v-model="trailer" placeholder="Trailer" type="url" required>
                <label>Year of release:</label>
                <input class="input-field" v-model="year" placeholder="Year" type="number" required>
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
                        .sort((a, b) => `${a.firstname}${a.lastname}`.localeCompare(`${b.firstname}${b.lastname}`))">
                        <div class="actor">
                            <div>
                                <input class="actor-checkbox" v-model="actors" type="checkbox" :id="actor.id" :value="actor.id">
                                <label class="actor-checkbox" style="margin-left: 10px;" :for="actor.id">{{ `${actor.firstname} ${actor.lastname}` }}</label>
                            </div>
                            <Icon class="icon" @click="uploadStore.deleteActor(actor.id)" name="material-symbols:delete"></Icon>
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
                    <template v-for="genre in allGenres.filter(genre => genre.name.toLowerCase().includes(searchGenres.toLowerCase()))
                        .sort((a, b) => a.name.localeCompare(b.name))">
                        <div class="genre">
                            <div>
                                <input class="genre-checkbox" v-model="genres" type="checkbox" :id="genre.name" :value="genre.name">
                                <label class="genre-checkbox" style="margin-left: 10px;" :for="genre.name">{{ genre.name.charAt(0).toUpperCase() + genre.name.slice(1) }}</label>
                            </div>
                            <Icon class="icon" @click="uploadStore.deleteGenre(genre.name)" name="material-symbols:delete"></Icon>
                        </div>
                    </template>
                </div>
                <button class="submit-btn" type="submit">Add Media</button>
            </form>
        </div>
        <img style="margin-top: 50px; border-radius: 15px;" :src="previewImageUrl" class="preview-image">
    </div>
</template>

<style scoped>
.container {
    display: flex;
    flex-direction: row;
}
.input-field {
    border: 1px solid white;
    border-radius: 25px;
    padding-left: 15px;
    display: flex;
    justify-content: flex-start;
    margin-bottom: 15px;
}
.icon:hover {
    color: var(--primary-color-100);
}
.actor {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 5px;
}
.actor-checkbox {
    -webkit-user-select: none; /* Safari */
    -ms-user-select: none; /* IE 10 and IE 11 */
    user-select: none; /* Standard syntax */
}
.genre-checkbox {
    -webkit-user-select: none; /* Safari */
    -ms-user-select: none; /* IE 10 and IE 11 */
    user-select: none; /* Standard syntax */
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
    max-width: 50vw;
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
.container-horizontal {
    display: flex;
    flex-direction: row;
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