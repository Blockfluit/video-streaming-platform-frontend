<script setup>
import { useJwtStore } from '~/stores/jwtStore';
import { useMainStore } from '~/stores/mainStore';

const config = useRuntimeConfig()
const jwtStore = useJwtStore()
const mainStore = useMainStore()

const showAddGenre = ref(false)

const genre = ref()

const addGenre = () => {
    if (mainStore.genres.find(genre => genre.name === genre.value) !== undefined) {
        alert("Genre already exists")
        return
    }

    fetch(config.public.baseURL + "/genres", {
        method: "POST",
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtStore.getJwt}`
        },
        body: JSON.stringify({
            genre: genre.value,
        })
    }).then((response) => {
        if (response.status >= 200 && response.status < 300) {
            mainStore.setActors()
            genre.value = null
        }
    }).catch(e => {
        console.log(e)
    })
}

</script>

<template>
    <div>
        <Icon @click="showAddGenre = !showAddGenre" name="fa-solid:plus" size="25" />
        <form v-if="showAddGenre" @submit.prevent="addGenre">
            <input v-model="genre" type="text" placeholder="genre" required>
            <button type="submit">Add Genre</button>
        </form>
    </div>
</template>

<style scoped></style>