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
    <div class="container">
        <Icon @click="showAddGenre = !showAddGenre" name="fa-solid:plus" size="1rem" class="icon" />
        <form v-if="showAddGenre" @submit.prevent="addGenre">
            <input v-model="genre" type="text" placeholder="genre" required>
            <button type="submit">Add Genre</button>
        </form>
    </div>
</template>

<style scoped>
.container {
    display: flex;
    align-items: center;
}
.container:hover {
    cursor: pointer;
}
.icon {
    height: 15px;
    margin-right: 6px;
}
.icon:hover {
    color: var(--primary-color-100);
}
.turn {
    rotate: 45deg;
}
input {
    border: 1px solid white;
    border-radius: 25px;
    padding-left: 15px;
    width: 100%;
}
button {
    width: 100%;
    background-color: transparent;
    border: 1px solid white;
    color: white;
    font-family: var(--font-family-1);
    border-radius: 15px;
    margin-bottom: 15px;
}
button:hover {
    cursor: pointer;
    color: var(--primary-color-100);
    border: 1px solid var(--primary-color-100);
}
</style>