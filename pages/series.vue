<script setup>
import { useMainStore } from "~/stores/mainStore";
import { storeToRefs } from "pinia";

definePageMeta({
    layout: "main",
});

const mainStore = useMainStore()

const { allMedia, searchbox } = storeToRefs(mainStore)

const allSeries = ref([])

onBeforeMount(() => {
    mainStore.setAllMedia()
    mainStore.setWatched()
})

watch(allMedia, (o, n) => {
    allSeries.value = allMedia.value.filter(media => media["type"] === "SERIES")
})
</script>

<template>
        <div class="container">
            <h2>Continue Watching</h2>
            <CardRow
                :allMedia="mainStore.getAllSeries.filter(media => mainStore.watched.map(entry => entry.mediaId).includes(media.id))"
                :showLastVideo=true>
            </CardRow>
            <h2>Recently uploaded</h2>
            <CardRow
                :allMedia="mainStore.getAllSeries.filter(media => new Date(media.updatedAt) < new Date(Date.now() + 1000 * 60 * 60 * 24 * 7))">
            </CardRow>
            <h2>Most Popular</h2>
            <CardRow :allMedia="mainStore.getAllSeries"></CardRow>
            <h2>Popular</h2>
            <CardRow :allMedia="mainStore.getAllSeries"></CardRow>
        </div>
</template>

<style scoped>
h2 {
    font-weight: 600;
}

.container {
    padding: 2vh 2vw;
}
</style>