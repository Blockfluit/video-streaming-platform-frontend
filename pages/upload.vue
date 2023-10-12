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
                <input v-model="name" placeholder="name" type="text" required>
                <select v-model="type" required>
                    <option value="MOVIE" selected>Movie</option>
                    <option value="SERIES">Series</option>
                </select>
                <input v-model="plot" placeholder="plot" type="text" required>
                <input v-model="trailer" placeholder="trailer" type="url" required>
                <input v-model="year" placeholder="year" type="number" required>
                <label>Actors:</label>
                <input v-model="searchActors" placeholder="search actor" type="search">
                <AddActor />
                <div>
                    <template v-for="actor in allActors.filter(actor => `${actor.firstname} ${actor.lastname}`.toLowerCase().includes(searchActors.toLowerCase()))
                        .sort((a, b) => `${a.firstname}${a.lastname}`.localeCompare(`${b.firstname}${b.lastname}`))">
                        <input v-model="actors" type="checkbox" :id="actor.id" :value="actor.id">
                        <label :for="actor.id">{{ `${actor.firstname} ${actor.lastname}` }}</label>
                        <Icon @click="uploadStore.deleteActor(actor.id)" name="fa-solid:poo"></Icon>
                    </template>
                </div>
                <span>Genres:</span>
                <input v-model="searchGenres" placeholder="search genre" type="search">
                <AddGenre />
                <div>
                    <template v-for="genre in allGenres.filter(genre => genre.name.toLowerCase().includes(searchGenres.toLowerCase()))
                        .sort((a, b) => a.name.localeCompare(b.name))">
                        <input v-model="genres" type="checkbox" :id="genre.name" :value="genre.name">
                        <label :for="genre.name">{{ genre.name }}</label>
                        <Icon @click="uploadStore.deleteGenre(genre.name)" name="fa-solid:poo"></Icon>
                    </template>
                </div>
                <button type="submit">Add Media</button>
            </form>
        </div>
        <img :src="previewImageUrl" class="preview-image">
    </div>
</template>

<style scoped>
.container {
    display: flex;
    flex-direction: row;
}

.container-add-media {
    max-width: 50vw;
    margin: 40px;
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