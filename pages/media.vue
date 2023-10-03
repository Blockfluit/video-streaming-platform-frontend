<script setup>
import { useMainStore } from "~/stores/mainStore";
import { useMediaStore } from "~/stores/mediaStore";
import { storeToRefs } from 'pinia'

const mainStore = useMainStore()
const mediaStore = useMediaStore()

const { media } = storeToRefs(mediaStore)
const seasons = ref([])
const iframe = ref(null)
const selectedSeason = ref(-1)
let urlParams;

watch(media, async (o, n) => {
    seasons.value = [...new Set(media.value.videos.map(video => video.season))]
})

onMounted(() => {
    if (process.client) {
        const queryString = window.location.search
        urlParams = new URLSearchParams(queryString)
        const id = urlParams.get("id") !== null ? parseInt(urlParams.get("id")) : 0
        if (id === 0) navigateTo("/")
        mediaStore.setMedia(id)
        mainStore.setWatched()
    }
})

const playVideo = (video) => {
    mediaStore.video = video
    mediaStore.setMedia(media.value.id)
    const watched = mainStore.watched.find(entry => entry.videoId === video.id)
    navigateTo(`/watch${watched !== undefined ? "?time=" + watched.timestamp : ""}`)
}

const parseTrailer = (trailer) => {
    if (trailer === undefined) {
        return ""
    }
    return trailer.replace('watch?v=', 'embed/') + '?autoplay=1&showinfo=0&controls=0&disablekb&fs=0&loop=1&mute=1&rel=0'
}

</script>

<template>
    <NuxtLayout name="main">
        <div>
            <div class="youtube-container">
                <div class="container-information">
                    <h1 style="text-transform: uppercase;">{{ media.name }}</h1>
                    <span>{{ media.year }}</span>
                    <span>{{ media.genre.join(" ") }}</span>
                    <p>{{ media.plot }}</p>
                    <span>Cast:</span>
                    <span>{{ media.actors.map(actor => `${actor.firstname} ${actor.lastname}`).join() }}</span>
                </div>
                <div class="overlay"></div>
                <iframe class="trailer" ref="iframe" :src="parseTrailer(media.trailer)" name="Trailer"
                    allow="autoplay; encrypted-media;"></iframe>
            </div>
            <div v-if="seasons.includes(-1)" v-for="video in media.videos.sort((a, b) => a.index - b.index)">
                <span @click="playVideo(video)">{{ video.name }}</span>
            </div>
            <div v-if="!seasons.includes(-1)" v-for="season in seasons.sort()">
                <span @click="selectedSeason = season">Season {{ season }}</span>
                <ul v-if="selectedSeason === season">
                    <li
                        v-for="video in  media.videos.filter((video => video.season === season)).sort((a, b) => a.index - b.index) ">
                        <span @click="playVideo(video)">{{
                            video.name }}</span>
                    </li>
                </ul>
            </div>
        </div>
    </NuxtLayout>
</template>

<style scoped>
.youtube-container {
    position: relative;
    overflow: hidden;
    width: 100%;
    aspect-ratio: 16/9;
    pointer-events: none;
    margin-top: -20%;
}

.youtube-container iframe {
    z-index: 10;
    width: 300%;
    height: 100%;
    margin-left: -100%;
    border: 0;
}

.overlay {
    position: absolute;
    width: 100%;
    height: 100%;
    -webkit-box-shadow: inset 0px -10vh 50px -30px #000000;
    box-shadow: inset 0px -10vh 50px -30px #000000;
}

.hide-video-player {
    left: 0;
    top: 0;
    z-index: 4;
    position: absolute;
    width: 100vw;
    height: 100vh;
}

.container-information {
    z-index: 10;
    position: absolute;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    width: 100%;
    height: 100%;
}

.container-information-left {
    display: flex;
    flex-direction: column;
    padding: 30px
}

.container-information-left h1 {
    margin: 10px 0 0 0;
}

.container-information-right {
    position: relative;
    min-width: 50%;
    overflow: hidden;
}

.container-information img {
    object-fit: cover;
    width: 100%;
    height: auto;
}
</style>
