<script setup>
import { useJwtStore } from '~/stores/jwtStore';
import { useMainStore } from '~/stores/mainStore';
import { storeToRefs } from 'pinia';

definePageMeta({
    layout: "main",
});

const config = useRuntimeConfig()
const mainStore = useMainStore()
const jwtStore = useJwtStore()

const { genres, actors } = storeToRefs(mainStore)

const acceptedFileExt = ["jpeg", "png", "jpg"]

const searchGenres = ref("")
const searchActors = ref("")

const name = ref(localStorage.getItem("upload-name"))
const type = ref(localStorage.getItem("upload-type"))
const selectedActors = ref(localStorage.getItem("upload-actors").split(",").filter(a => a !== ""))
const selectedGenres = ref(localStorage.getItem("upload-genres").split(",").filter(a => a !== ""))
const plot = ref(localStorage.getItem("upload-plot"))
const trailer = ref(localStorage.getItem("upload-trailer"))
const year = ref(localStorage.getItem("upload-year"))
const thumbnail = ref()

const previewImageUrl = ref()

onBeforeMount(() => {
    if (process.client) {
        mainStore.setActors()
        mainStore.setGenres()
    }
})

onBeforeUnmount(() => {
    if (process.client) {
        localStorage.setItem("upload-name", name.value)
        localStorage.setItem("upload-type", type.value)
        localStorage.setItem("upload-actors", selectedActors.value)
        localStorage.setItem("upload-genres", selectedGenres.value)
        localStorage.setItem("upload-plot", plot.value)
        localStorage.setItem("upload-trailer", trailer.value)
        localStorage.setItem("upload-year", year.value)
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
    formData.append("genres", selectedGenres.value)
    formData.append("actors", selectedActors.value)
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
            selectedActors.value = []
            selectedGenres.value = []
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

const deleteActor = (id) => {
    fetch(config.public.baseURL + "/actors/" + id, {
        method: "DELETE",
        headers: {
            Accept: 'application/json',
            "Authorization": `Bearer ${jwtStore.getJwt}`
        }
    }).then((response) => {
        if (response.status >= 200 && response.status < 300) {
            mainStore.setActors()
            alert("Upload successfully deleted actor")
        }
    }).catch(e => {
        alert(e)
        console.log(e)
    })
}

const deleteGenre = (genre) => {
    fetch(config.public.baseURL + "/genres/" + genre, {
        method: "DELETE",
        headers: {
            Accept: 'application/json',
            "Authorization": `Bearer ${jwtStore.getJwt}`
        }
    }).then((response) => {
        if (response.status >= 200 && response.status < 300) {
            mainStore.setGenres()
            alert("Upload successfully deleted actor")
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
                    <template v-for="actor in actors.filter(actor => `${actor.firstname} ${actor.lastname}`.toLowerCase().includes(searchActors.toLowerCase()))
                        .sort((a, b) => `${a.firstname}${a.lastname}`.localeCompare(`${b.firstname}${b.lastname}`))">
                        <input v-model="selectedActors" type="checkbox" :id="actor.id" :value="actor.id">
                        <label :for="actor.id">{{ `${actor.firstname} ${actor.lastname}` }}</label>
                        <Icon @click="deleteActor(actor.id)" name="fa-solid:poo"></Icon>
                    </template>
                </div>
                <span>Genres:</span>
                <input v-model="searchGenres" placeholder="search genre" type="search">
                <AddGenre />
                <div>
                    <template v-for="genre in genres.filter(genre => genre.name.toLowerCase().includes(searchGenres.toLowerCase()))
                        .sort((a, b) => a.name.localeCompare(b.name))">
                        <input v-model="selectedGenres" type="checkbox" :id="genre.name" :value="genre.name">
                        <label :for="genre.name">{{ genre.name }}</label>
                        <Icon @click="deleteGenre(genre.name)" name="fa-solid:poo"></Icon>
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