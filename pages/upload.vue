<script setup>
import { useJwtStore } from '~/stores/jwtStore';

const config = useRuntimeConfig()
const jwtStore = useJwtStore()

const acceptedFileExt = ["jpeg", "png", "jpg"]
const fileElement = ref(null)

const allGenres = ref([])
const allActors = ref([])

const name = ref("")
const type = ref("MOVIE")
const actors = ref([])
const genres = ref([])
const plot = ref("")
const trailer = ref("")
const year = ref(new Date(Date.now()).getFullYear())

const previewImageUrl = ref()

onBeforeMount(() => {
    getAllGenres()
    getAllActors()
})

const updatePreviewImage = () => {
    previewImageUrl.value = URL.createObjectURL(fileElement.value.files[0])
}

const addMedia = () => {
    const errors = []

    if (name.value === "") errors.push("Name missing")
    if (plot.value === "") errors.push("Plot missing")
    if (trailer.value === "") errors.push("Trailer missing")
    if (year.value === -1) errors.push("Year missing")
    if (fileElement.value.files.size > 0) errors.push("Thumbnail missing")
    if (!acceptedFileExt.includes(fileElement.value.files[0].type.split("/")[1])) errors.push("Invalid file extension")

    if (errors.length) {
        alert(errors)
        return
    }

    const formData = new FormData()
    formData.append("name", name.value)
    formData.append("thumbnail", fileElement.value.files[0])
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
            alert("Upload successful")
        }
    }).catch(e => {
        alert(e)
        console.log(e)
    })
}

const getAllGenres = () => {
    fetch(config.public.baseURL + "/genres", {
        method: "GET",
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${jwtStore.getJwt}`
        }
    }).then((response) => {
        if (response.status >= 200 && response.status < 300) {
            return response.json()
        }
    }).then((data) => {
        allGenres.value = data
    }).catch(e => {
        console.log(e)
    })
}

const getAllActors = () => {
    fetch(config.public.baseURL + "/actors", {
        method: "GET",
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${jwtStore.getJwt}`
        }
    }).then((response) => {
        if (response.status >= 200 && response.status < 300) {
            return response.json()
        }
    }).then((data) => {
        allActors.value = data
    }).catch(e => {
        console.log(e)
    })
}
</script>

<template>
    <NuxtLayout name="main">
        <div class="container">
            <div class="container-add-media">
                <span>Thumbnail:</span>
                <input ref="fileElement" @change="updatePreviewImage" type="file">
                <input v-model="name" placeholder="name" type="text">
                <select v-model="type">
                    <option value="MOVIE">Movie</option>
                    <option value="SERIES">Series</option>
                </select>
                <input v-model="plot" placeholder="plot" type="text">
                <input v-model="trailer" placeholder="trailer" type="url">
                <input v-model="year" placeholder="year" type="number">
                <span>Actors:</span>
                <div>
                    <template v-for="actor in allActors">
                        <input type="checkbox" :id="actor.id" :value="actor.id" v-model="actors">
                        <label :for="actor.id">{{ `${actor.firstname} ${actor.lastname}` }}</label>
                    </template>
                </div>
                <span>Genres:</span>
                <div>
                    <template v-for="genre in allGenres">
                        <input type="checkbox" :id="genre.name" :value="genre.name" v-model="genres">
                        <label :for="genre.name">{{ genre.name }}</label>
                    </template>
                </div>
                <button @click="addMedia">Add Media</button>
            </div>
            <img :src="previewImageUrl" style="width: 300px;">
        </div>
    </NuxtLayout>
</template>

<style scoped>
.container {
    display: flex;
    flex-direction: row;
}

.container-add-media {
    max-width: 30vw;
    display: flex;
    flex-direction: column;
    margin: 40px;
}
</style>