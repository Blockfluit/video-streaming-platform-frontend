<script setup>

const fileElement = ref(null)

const name = ref("")
const type = ref("MOVIE")


</script>

<template>
    <NuxtLayout name="main">
        <div>
            <div class="container-add-media">
                <input ref="fileElement" type="file">
                <input v-model="name" placeholder="name" type="text">
                <input placeholder="name" type="text">
                <select v-model="type">
                    <option value="MOVIE">Movie</option>
                    <option value="SERIES">Series</option>
                </select>
                <input placeholder="plot" type="text">
                <input placeholder="trailer" type="url">
                <input placeholder="year" type="number">
            </div>
        </div>
    </NuxtLayout>
</template>

<style scoped>
.container-add-media {
    max-width: 30vw;
    display: flex;
    flex-direction: column;
}
</style>