<script setup>
import { useMainStore } from "~/stores/mainStore";
import { useMediaStore } from "~/stores/mediaStore";
import { storeToRefs } from 'pinia'

const mainStore = useMainStore()
const mediaStore = useMediaStore()

const { allMedia, watched } = storeToRefs(mainStore)
const { media } = storeToRefs(mediaStore)

let timeoutId

// Sets 5 most recent media + all media from past 7 days
const recentMedia = ref(allMedia.value.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).splice(0, 5))
recentMedia.value.push(...allMedia.value.filter(media => !recentMedia.value.includes(media) && new Date().setDate(new Date(media.updatedAt).getDate() + 7) > new Date()).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)))

const trailerMediaId = ref(0)
const trailerMedia = ref(recentMedia.value[trailerMediaId.value])

const iframe = ref()

definePageMeta({
    layout: "main",
});

onBeforeMount(() => {
    mainStore.setAllMedia()
    mainStore.setWatched()
})

onMounted(() => {
    setTrailerTimeout(0)
})

const setTrailerTimeout = (index) => {
    clearTimeout(timeoutId)
    nextTrailer(index)
    timeoutId = setTimeout(() => {
        setTrailerTimeout()
    }, 25000)
}

const nextTrailer = (index) => {
    index !== undefined ? trailerMediaId.value = index : trailerMediaId.value++

    if (trailerMediaId.value > recentMedia.value.length - 1) {
        trailerMediaId.value = 0
    }
    if (trailerMediaId.value < 0) {
        trailerMediaId.value = recentMedia.value.length - 1
    }
    trailerMedia.value = recentMedia.value[trailerMediaId.value]
}

const navigateToMedia = () => {
    media.value.id = trailerMedia.value.id
    navigateTo(`/media`)
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
                <h2 class="now-available">Now available:</h2>
                <div @click="navigateToMedia()" class="container-information-title">
                    <h1 class="trailer-name">{{ trailerMedia.name }}</h1>
                    <h1 class="watch-now">| WATCH NOW</h1>
                </div>
                <div class="trailer-bullets">
                    <template v-for="(media, index) in recentMedia.length">
                        <span @click="setTrailerTimeout(index)" style="cursor: pointer;"
                            :style="index === trailerMediaId ? 'color: var(--primary-color-100)' : ''">•</span>
                    </template>
                </div>
            </div>
            <div class="overlay"></div>
            <iframe ref="iframe" :src="parseTrailer(trailerMedia.trailer)" name="Trailer"
                allow="autoplay; encrypted-media;"></iframe>
        </div>
        <h2 class="carousel-title">Continue Watching</h2>
        <CardRow :allMedia="allMedia.filter(media => watched.map(entry => entry.mediaId).includes(media.id))"
            :showLastVideo=true>
        </CardRow>
        <!-- <h2 class="carousel-title">Recently uploaded</h2> -->
        <!-- <CardRow
            :allMedia="allMedia.filter(media => new Date(media.updatedAt) < new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))">
        </CardRow> -->
        <h2 class="carousel-title">10 Most Popular</h2>
        <CardRow :allMedia="allMedia.sort((a, b) => b.views - a.views).slice(0, 10)"></CardRow>
        <h2 class="carousel-title">10 Best Rated</h2>
        <CardRow :allMedia="allMedia.sort((a, b) => b.rating - a.rating).slice(0, 10)"></CardRow>
    </div>
</template>

<style scoped>
h2 {
    margin: 0;
    font-weight: 600;
}

.trailer-name {
    text-transform: uppercase;
    max-width: 70%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.watch-now {
    font-weight: 200;
    font-size: var(--font-size-2);
    max-width: 70%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.now-available {
    margin-bottom: -15px;

}

.carousel-title {
    margin: 40px 0 10px 6px
}

.container {
    padding: 4vh 2vw;
}

.container-trailer {
    position: relative;
    overflow: hidden;
    height: 60vh;
    width: 100%;
    border-radius: var(--border-radius-1);
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
    background: linear-gradient(0deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.3) 30%, rgba(255, 255, 255, 0) 100%);
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

    .trailer-name,
    .watch-now {
        font-size: var(--font-size-3);
    }

    .now-available {
        font-size: var(--font-size-4);
    }
}
</style>