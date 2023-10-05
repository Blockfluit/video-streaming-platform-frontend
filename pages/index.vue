<script setup>
import { useMainStore } from "~/stores/mainStore";

const mainStore = useMainStore()

definePageMeta({
    layout: "main",
});

onBeforeMount(() => {
    mainStore.setAllMedia()
    mainStore.setWatched()
})
</script>

<template>
        <div class="container">
            <h2 style="margin: 20px 6px 0px 6px">Continue Watching</h2>
            <CardRow
                :allMedia="mainStore.allMedia.filter(media => mainStore.watched.map(entry => entry.mediaId).includes(media.id))"
                :showLastVideo=true>
            </CardRow>
            <h2 style="margin: 20px 6px 0px 6px">Recently uploaded</h2>
            <CardRow
                :allMedia="mainStore.allMedia.filter(media => new Date(media.updatedAt) < new Date(Date.now() + 1000 * 60 * 60 * 24 * 7))">
            </CardRow>
            <h2 style="margin: 20px 6px 0px 6px">Most Popular</h2>
            <CardRow :allMedia="mainStore.allMedia"></CardRow>
            <h2 style="margin: 20px 6px 0px 6px">Popular</h2>
            <CardRow :allMedia="mainStore.allMedia"></CardRow>
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