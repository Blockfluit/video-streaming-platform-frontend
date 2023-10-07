<script setup>
import { useMainStore } from "~/stores/mainStore";
import { useMediaStore } from "~/stores/mediaStore";
import { storeToRefs } from 'pinia'

const mainStore = useMainStore()
const mediaStore = useMediaStore()

const { allMedia, watched } = storeToRefs(mainStore)

let timeoutId

const recentMedia = ref([...allMedia.value].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).splice(0, 5))
const trailerMediaId = ref(0)
const trailerMedia = ref(recentMedia.value[trailerMediaId.value])


definePageMeta({
    layout: "main",
});

onBeforeMount(() => {
    mainStore.setAllMedia()
    mainStore.setWatched()
})

onMounted(() => {
    nextTrailerTimeout()
})

const nextTrailerTimeout = (index) => {
    clearTimeout(timeoutId)

    timeoutId = setTimeout(() => {
        index !== undefined ? trailerMediaId.value = index : trailerMediaId.value++

        if (trailerMediaId.value > recentMedia.value.length - 1) {
            trailerMediaId.value = 0
        }
        if (trailerMediaId.value < 0) {
            trailerMediaId.value = recentMedia.value.length - 1
        }
        trailerMedia.value = recentMedia.value[trailerMediaId.value]

        nextTrailerTimeout()
    }, 20000)
}

const navigateToMedia = () => {
    navigateTo(`/media?id=${trailerMedia.value.id}`)
}

const parseTrailer = (trailer) => {
    let trailerId = trailer.split('watch?v=')[1]
    if (trailer === undefined) {
        return ""
    }
    return trailer.replace('watch?v=', 'embed/') + `?playlist=${trailerId}&autoplay=1&showinfo=0&controls=0&disablekb&fs=0&loop=1&mute=1&rel=0`
}
</script>

<template>
    <div class="container">
        <div class="container-trailer">
            <div class="container-information">
                <h2>Now available:</h2>
                <div @click="navigateToMedia()" class="container-information-title">
                    <h1 style="text-transform: uppercase;">{{ trailerMedia.name }}</h1>
                    <h1 style="font-weight: 200; font-size: var(--font-size-2)">| WATCH NOW</h1>
                </div>
                <div class="trailer-bullets">
                    <template v-for="(media, index) in recentMedia.length">
                        <span @click="nextTrailerTimeout(index)" style="cursor: pointer;"
                            :style="index === trailerMediaId ? 'color: var(--primary-color-100)' : ''">•</span>
                    </template>
                </div>
            </div>
            <div class="overlay"></div>
            <iframe ref="iframe" :src="parseTrailer(trailerMedia.trailer)" name="Trailer"
                allow="autoplay; encrypted-media;"></iframe>
        </div>
        <!-- <h2 style="margin: 20px 6px 0px 6px">Continue Watching</h2>
        <CardRow :allMedia="allMedia.filter(media => watched.map(entry => entry.mediaId).includes(media.id))"
            :showLastVideo=true>
        </CardRow> -->
        <!-- <h2 style="margin: 20px 6px 0px 6px">Recently uploaded</h2>
        <CardRow
            :allMedia="allMedia.filter(media => new Date(media.updatedAt) < new Date(Date.now() + 1000 * 60 * 60 * 24 * 7))">
        </CardRow> -->
        <h2 style="margin: 30px 6px 10px 0px">10 Most Popular</h2>
        <CardRow :allMedia="allMedia.slice(0, 10)"></CardRow>
        <h2 style="margin: 30px 6px 10px 0px">Popular</h2>
        <CardRow :allMedia="allMedia"></CardRow>
    </div>
</template>

<style scoped>
h2 {
    margin: 0;
    font-weight: 600;
}

.container {
    padding: 4vh 2vw;
}

.container-trailer {
    position: relative;
    overflow: hidden;
    height: 60vh;
    width: 100%;
    border-radius: 15px;
}

.container-information {
    z-index: 2;
    display: flex;
    flex-direction: column;
    position: absolute;
    width: 100%;
    padding: 0 30px;
    left: 0;
    bottom: 0;
}

.container-information-title {
    display: flex;
    flex-direction: row;
    align-items: center;
}

.container-information-title h1 {
    margin: 10px 10px 0 0;
    cursor: pointer;
}

.trailer-bullets {
    z-index: 3;
    display: flex;
    flex-direction: row;
    justify-content: center;
    font-size: 40px;
}

iframe {
    pointer-events: none;
    position: absolute;
    height: 300%;
    width: 100%;
    top: -100%;
    border: 0;
}

.overlay {
    z-index: 1;
    position: absolute;
    width: 100%;
    height: 100%;
    background: linear-gradient(0deg, rgba(0, 0, 0, 0.9) 0%, rgba(255, 255, 255, 0) 100%);
}

@media screen and (max-width: 1100px) {
    iframe {
        height: 300%;
        width: 140%;
        left: -20%;
        top: -100%;
    }
}

@media screen and (max-width: 700px) {
    iframe {
        height: 300%;
        width: 200%;
        left: -50%;
        top: -100%;
    }
}
</style>