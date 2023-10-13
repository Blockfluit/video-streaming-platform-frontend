<script setup>
import { useMainStore } from "~/stores/mainStore";
import { useMediaStore } from "~/stores/mediaStore";
import { storeToRefs } from 'pinia'
import { useWatchStore } from "~/stores/watchStore";

definePageMeta({
    layout: "main",
});

const config = useRuntimeConfig()

const mainStore = useMainStore()
const mediaStore = useMediaStore()
const watchStore = useWatchStore()

const { watched } = storeToRefs(mainStore)
const { media } = storeToRefs(mediaStore)
const { startTime, video } = storeToRefs(watchStore)

const seasons = ref([])
const iframe = ref(null)
const latestVideo = ref()
const selectedSeason = ref(1)
const showDropdown = ref(false)
const episodeList = ref()

function scrollHorizontal(e) {
    e.preventDefault();
    episodeList.value.scrollLeft += e.deltaY;
}

watch(media, (o, n) => {
    seasons.value = [...new Set(media.value.videos.map(video => video.season))]
})

watch(watched, (o, n) => {
    latestVideo.value = watched.value.filter(entry => entry.mediaId === media.value.id)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0]
    if (latestVideo.value !== undefined) {
        selectedSeason.value = latestVideo.value.season
    }
})

onBeforeMount(() => {
    mediaStore.setMedia(media.value.id)
    mainStore.setWatched()
})

const playVideo = (selectedVideo) => {
    video.value = selectedVideo
    const currentWatched = watched.value.find(entry => entry.videoId === selectedVideo.id)
    startTime.value = currentWatched !== undefined ? currentWatched.timestamp : 0
    navigateTo(`/watch`)
}

const parseTrailer = (trailer) => {
    let trailerId = trailer.split('watch?v=')[1]
    if (trailer === undefined) {
        return ""
    }
    return trailer.replace('watch?v=', 'embed/') + `?playlist=${trailerId}&autoplay=1&showinfo=0&controls=0&disablekb&fs=0&loop=1&mute=1&rel=0`
}

const calcTimePercentage = (video) => {
    const currentWatched = mainStore.watched.find(entry => entry.videoId === video.id)

    if (currentWatched !== undefined) {
        return currentWatched.timestamp / video.duration * 100
    }
    return 0
}

</script>

<template>
    <div style="overflow-x: hidden;">

        <!-- Show trailer of movie or serie -->
        <div class="container-trailer">
            <div class="container-information">
                <h1 style="text-transform: uppercase; margin-bottom: -10px;">{{ media.name }}</h1>
                <span class="info">{{ media.year }} • {{ media.genre.join(", ") }}</span>
                <p class="plot-text">{{ media.plot }}</p>
                <div style="display: flex;">
                    <span>Cast:&nbsp;</span>
                    <span v-for="(actor, index) in media.actors">{{ actor.firstname }}<span v-if="actor.lastname">&nbsp;{{
                        actor.lastname }}</span><span v-if="index < media.actors.length - 1">,&nbsp;</span></span>
                </div>
                <Rating style="margin-top: 12px;" :media="media" />
            </div>
            <div class="overlay"></div>
            <iframe ref="iframe" :src="parseTrailer(media.trailer)" name="Trailer"
                allow="autoplay; encrypted-media;"></iframe>
        </div>

        <!-- Show season button if it is season -->
        <div v-if="!seasons.includes(-1)" class="season-btn">
            <span @click="showDropdown = !showDropdown" style="padding-left: 6px">Season {{ selectedSeason }}
                <Icon name="mdi:chevron-down" style="min-width: 20px;" />
            </span>
            <ul v-if="showDropdown" class="season-dropdown">
                <li v-for="season in seasons.sort((a, b) => a - b)" @click="selectedSeason = season; showDropdown = false"
                    class="season">Season {{ season }}</li>
            </ul>
        </div>

        <!-- Show season episodes based on choosen season -->
        <div class="container-episodes">
            <!-- Movie episode cards -->
            <ul v-if="seasons.includes(-1)" @wheel="scrollHorizontal" ref="episodeList" class="movie-content">
                <li @click="playVideo(video)" class="episode-card"
                    v-for="(video) in  media.videos.sort((a, b) => a.index - b.index)" :id="video.id">
                    <div class="darken"></div>
                    <span>{{ video.name }}</span>
                    <img :src="`${config.public.baseURL}/stream/snapshot/${video.id}`">
                    <div class="time" :style="`width:${calcTimePercentage(video)}%`"></div>
                </li>
            </ul>

            <!-- Serie episode cards -->
            <ul v-else @wheel="scrollHorizontal" ref="episodeList" class="season-content">
                <li @click="playVideo(video)" class="episode-card"
                    v-for="(video) in  media.videos.filter((video => video.season === selectedSeason)).sort((a, b) => a.index - b.index)"
                    :id="video.id">
                    <div class="darken"></div>
                    <span>{{ video.name }}</span>
                    <img :src="`${config.public.baseURL}/stream/snapshot/${video.id}`">
                    <div class="time" :style="`width:${calcTimePercentage(video)}%`"></div>
                </li>
            </ul>
        </div>
        <div class="review-container">
            <Reviews :media="media" />
        </div>
    </div>
</template>

<style scoped>
::-webkit-scrollbar {
    height: 5px !important;
    width: 5px !important;
}

.time {
    height: 4px;
    background-color: var(--primary-color-100);
    width: 100%;
    position: absolute;
    bottom: 0;
}

img {
    width: 200px;
}
.plot-text {
    display: block; 
    text-overflow: ellipsis;
    font-size: 16px; 
    max-height: 200px;
    max-width: 50vw;
    overflow-x: hidden; 
    overflow-y: scroll; 
    pointer-events: all;
}
.plot-text::-webkit-scrollbar {
    display: none;
}
.review-container {
    margin: 30px 30px 80px 30px;
}
.season-dropdown {
    position: absolute;
    display: flex;
    flex-direction: column;
    padding: 0px;
    margin: 0;
    width: 100%;
    max-height: 300px;
    overflow-y: scroll;
    box-shadow: 0px 0px 0px 1px white;
    list-style: none;
    z-index: 99;
    background-color: var(--background-color-200);
    border-radius: 0px 0px 3px 3px;
}

.season-dropdown::-webkit-scrollbar {
    display: none;
}

.season-dropdown li {
    border-bottom: 1px solid white;
    padding: 5px;
}

.season-dropdown li:last-child {
    border: none;
}

.season-btn:hover {
    cursor: pointer;
}

.season-btn {
    background-color: transparent;
    color: white;
    font-family: "Poppins";
    font-size: 1.2rem;
    width: fit-content;
    box-shadow: 0px 0px 0px 1px white;
    border-radius: 3px;
    margin: 20px 30px;
    padding: 4px 0px;
    position: relative;
}

.season-content {
    display: flex;
    overflow-x: scroll;
    padding: 0;
    margin: 0;
    width: 100%;
}

.movie-content {
    display: flex;
    overflow-x: scroll;
    padding: 0;
    margin: 0;
    width: 100%;
    padding-top: 30px;
}

.darken {
    z-index: 1;
    position: absolute;
    width: 100%;
    height: 100%;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0) 100%);
}

.episode-card {
    position: relative;
    min-width: 250px;
    height: 200px;
    margin-right: 10px;
    margin-bottom: 10px;
    list-style: none;
    overflow: hidden;
    border-radius: 15px;
}

.episode-card:hover {
    cursor: pointer;
}

.darken:hover {
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.5) 100%);
}

.episode-card img {
    aspect-ratio: 16/9;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.episode-card span {
    z-index: 10;
    position: absolute;
    padding: 4px 8px;
}

.info {
    text-transform: capitalize;
    font-size: 16px;
    margin-bottom: 16px;
}

.container-episodes {
    margin: 0px 30px;
    overflow: hidden;
}

.wrapper {
    display: flex;
    width: 100%;
}

.container-trailer {
    position: relative;
    overflow: hidden;
    height: 65vh;
    width: 100vw;
    pointer-events: none;
}

.container-information {
    padding: 30px;
    bottom: 0;
    overflow-wrap: break-all;
    z-index: 2;
    position: absolute;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
}

iframe {
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
    .container-trailer {
        height: 50vh;
    }

    iframe {
        height: 300%;
        width: 140%;
        left: -20%;
        top: -100%;
    }
}

@media screen and (max-width: 992px) {}

@media screen and (max-width: 700px) {
    .container-trailer {
        height: 40vh;
    }
    .plot-text {
        max-width: 100%;
        max-height: 50px;
    }
    iframe {
        height: 300%;
        width: 180%;
        left: -40%;
        top: -100%;
    }
}
</style>
