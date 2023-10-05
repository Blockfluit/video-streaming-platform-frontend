<script setup>
import { useMainStore } from "~/stores/mainStore";
import { useMediaStore } from "~/stores/mediaStore";
import { storeToRefs } from 'pinia'

definePageMeta({
    layout: "main",
});

const config = useRuntimeConfig()

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
    let trailerId = trailer.split('watch?v=')[1]
    if (trailer === undefined) {
        return ""
    }
    return trailer.replace('watch?v=', 'embed/') + `?playlist=${trailerId}&autoplay=1&showinfo=0&controls=0&disablekb&fs=0&loop=1&mute=1&rel=0`
}

</script>

<template>
        <div>
            <div class="youtube-container">
                <div class="container-information">
                    <h1 style="text-transform: uppercase; margin-bottom: -10px;">{{ media.name }}</h1>
                    <span class="info">{{ media.year }} • {{ media.genre.join(", ") }}</span>
                    <p style="font-size: 16px">{{ media.plot }}</p>
                    <span>Cast: {{ media.actors.map(actor => `${actor.firstname} ${actor.lastname}`).join(', ') }}</span>
                </div>
                <div class="overlay"></div>
                <iframe class="trailer" ref="iframe" :src="parseTrailer(media.trailer)" name="Trailer"
                    allow="autoplay; encrypted-media;"></iframe>
            </div>
            <div v-if="seasons.includes(-1)" v-for="video in media.videos.sort((a, b) => a.index - b.index)">
                <span @click="playVideo(video)">{{ video.name }}<img
                        :src="`${config.public.baseURL}/stream/snapshot/${video.id}`"></span>
            </div>
            <div v-if="!seasons.includes(-1)" v-for="season in seasons.sort()">
                <span @click="selectedSeason = season">Season {{ season }}</span>
                <ul v-if="selectedSeason === season">
                    <li
                        v-for="video in  media.videos.filter((video => video.season === season)).sort((a, b) => a.index - b.index) ">
                        <span @click="playVideo(video)">{{
                            video.name }}<img :src="`${config.public.baseURL}/stream/snapshot/${video.id}`"></span>
                    </li>
                </ul>
            </div>
        </div>
</template>

<style scoped>
img {
    width: 200px;
}
.info {
    text-transform: capitalize;
    font-size: 16px;
    margin-bottom: 16px;
}
.youtube-container {
    position: relative;
    overflow: hidden;
    min-height: 60vh;
    width: 100vw;
    aspect-ratio: 16/9;
    pointer-events: none;
    margin-top: -20%;
}
.container-information {
    padding: 0px 30px;
    width: 100%;
    overflow-wrap: break-all;
    margin-bottom: 50px;
}

.trailer {
    z-index: 10;
    width: 100%;
    height: 100%;
    border: 0;
}

.overlay {
    position: absolute;
    width: 100%;
    height: 100%;
    background: linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(255,255,255,0) 100%);
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

@media screen and (max-width: 992px) {
  .youtube-container {
    aspect-ratio: 9/16;
  }
}
</style>
