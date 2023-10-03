<script setup>
import { useMainStore } from "~/stores/mainStore";

const mainStore = useMainStore()

onBeforeMount(() => {
    mainStore.setAllMedia()
    mainStore.setWatched()
})
</script>

<template>
    <NuxtLayout name="main">
        <div class="container">
            <h2>Continue Watching</h2>
            <CardRow
                :allMedia="mainStore.allMedia.filter(media => mainStore.watched.map(entry => entry.mediaId).includes(media.id))"
                :showLastVideo=true>
            </CardRow>
            <h2>Recently uploaded</h2>
            <CardRow
                :allMedia="mainStore.allMedia.filter(media => new Date(media.updatedAt) < new Date(Date.now() + 1000 * 60 * 60 * 24 * 7))">
            </CardRow>
            <h2>Most Popular</h2>
            <CardRow :allMedia="mainStore.allMedia"></CardRow>
            <h2>Popular</h2>
            <CardRow :allMedia="mainStore.allMedia"></CardRow>
        </div>
    </NuxtLayout>
</template>

<style scoped>
h2 {
    font-weight: 600;
}

.container {
    padding: 2vh 2vw;
}
</style>