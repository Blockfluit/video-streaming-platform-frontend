<script setup>
import { useMainStore } from "~/stores/mainStore";
import { useMediaStore } from "~/stores/mediaStore";
import { storeToRefs } from 'pinia'
import { isAdmin } from '#imports'
import { Vue3Lottie } from 'vue3-lottie'

const config = useRuntimeConfig()
const mainStore = useMainStore()
const mediaStore = useMediaStore()

const { watched } = storeToRefs(mainStore)
const { media } = storeToRefs(mediaStore)

let currentMediaId
let scrollAttempts = 10

const iframe = ref(null)
const lastVideo = ref()
const logoLottie = ref()
const selectedSeason = ref(1)
const showDropdown = ref(false)
const episodeContainer = ref()
const episodeElements = ref()
const showTrailer = ref(false)
const showExtraInformation = ref(false)
const admin = ref(isAdmin())
let intervalId

onBeforeMount(() => {
    if (process.client) {
        const route = useRoute()
        currentMediaId = parseInt(route.params.mediaId)

        mediaStore.setMedia(currentMediaId)
            .then(() => useHead({ title: media.value.name }))
        mainStore.setWatched()
            .then(() => setLastVideo())
    }
})

function scrollHorizontal(e) {
    e.preventDefault();
    episodeContainer.value.scrollLeft += e.deltaY;
}

const playVideo = (videoId) => {
    navigateTo(`/media/${currentMediaId}/watch/${videoId}`)
}

function attemptScroll() {
    intervalId = setInterval(() => {
        scrollAttempts--

        if (scrollAttempts < 0) {
            clearInterval(intervalId)
            return
        }
        if (episodeElements.value !== undefined) {
            scrollToLastVideo(episodeElements.value)
            clearInterval(intervalId)
            return
        }
    }, 100)
}

function setLastVideo() {
    lastVideo.value = watched.value.filter(entry => entry.mediaId === currentMediaId)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0]
    attemptScroll()
    if (lastVideo.value !== undefined) {
        selectedSeason.value = lastVideo.value.season
    }
}

function scrollToLastVideo(elementList) {
    for (let child of elementList) {
        if (parseInt(child.id) === lastVideo.value?.videoId) {
            episodeContainer.value.scrollTo({
                left: (child.getBoundingClientRect().left - episodeContainer.value.getBoundingClientRect().left),
                behavior: "smooth"
            })
            child.style.border = "2px solid rgba(255, 255, 255, 0.7)"
        }
    }

}

const formatTime = (seconds) => {
    return Math.floor(seconds / 60) + "min"
}

// Probably needs some refactoring
const playLastVideo = () => {
    const lastVideo = watched.value.filter(video => video.mediaId === media.value.id)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0]
    const lastVideoId = lastVideo !== undefined ? lastVideo.videoId : -1

    const video = media.value.videos.find(video => video.id === lastVideoId) ??
        media.value.videos.find(video => video.index === 0)
    playVideo(video.id)
}

const parseTrailer = (trailer, controls, mute) => {
    if (trailer === undefined) return ""

    const trailerLongId = trailer.split("watch?v=")[1]
    const trailerId = trailerLongId.split("&t=")[0]
    const time = trailerLongId.includes("&t=") ? trailerLongId.split("&t=")[1].replace("s", "") : ""
    const trailerUrl = trailer.replace('watch?v=', 'embed/') + `?playlist=${trailerId}&autoplay=1&showinfo=0&controls=${controls ? 1 : 0}&mute=${mute ? 0 : 1}&disablekb&fs=0&loop=1&rel=0&start=${time ?? 0}`
    return trailerUrl
}

function editMedia(mediaId) {
    navigateTo(`/edit/${mediaId}`)
}

const calcTimePercentage = (video) => {
    const currentWatched = mainStore.watched.find(entry => entry.videoId === video.id)

    if (currentWatched !== undefined) return currentWatched.timestamp / video.duration * 100
    return 0
}

function intervalLogo() {
    logoLottie.value.stop()
    setTimeout(() => {
        logoLottie.value.play()
    }, 10000)
}
</script>

<template>
    <div>
        <div style="overflow-x: hidden;">

            <!-- Show trailer of movie or serie -->
            <div class="container-preview-trailer">
                <div class="container-information">

                    <div style="display: flex; align-items: baseline;">
                        <h1 style=" text-transform: uppercase; margin-bottom: -10px;">{{ media.name }}</h1>
                    </div>
                    <span class="info">{{ media?.year }} <span v-if="media.videos?.length === 1">• {{
                        formatTime(media.videos[0].duration) }}</span> • {{
                                media.genres?.join(", ") }}</span>
                    <p class="plot-text hide-on-phone">{{ media?.plot }}</p>
                    <div class="container-cast hide-on-phone" style="display: flex; flex-direction: column;">
                        <!-- <template v-for="role in ['directors', 'creators', 'stars', 'cast']"></template> -->
                        <template v-for="role in ['cast']">
                            <span v-if="media[role]?.length > 0" class="hide-on-phone"
                                style="text-transform: capitalize;">{{ role }}: {{ media[role]?.slice(0, 5).map(p =>
                                    `${p.firstname} ${p.lastname}`).join(", ") }}</span>
                        </template>
                    </div>
                    <div style="display: flex; align-items: center;">
                        <Vue3Lottie style="margin: 0 4px 0 0; padding-bottom: 4px;"
                            animationLink="/animations/dellekes_logo.json" ref="logoLottie" :height="30" :width="30"
                            :delay="5000" @on-loop-complete="intervalLogo" />
                        <Rating :media="media" :average="true" />
                        <span style="font-weight: 800; margin-left: 5px">{{ media.avgRating < 0 ? 0 : (media.avgRating /
                            2).toFixed(1) }}<span style="font-weight: normal; color: #aaaaaa">/5</span>
                        </span>
                        <span v-if="media.imdbRating" style=" margin: 0 12px;">•</span>
                        <a v-if="media.imdbRating" :href="`https://www.imdb.com/title/${media.imdbId}/`" target="_blank"
                            style="font-weight: 800; color: #F5C518; cursor: pointer; pointer-events: all; text-decoration: none; font-size: 16px;">
                            IMDb <span style="color: white; margin-left: 4px;">{{ media.imdbRating
                                }}<span style="font-weight: normal; color: #aaaaaa">/10</span> </span>
                        </a>
                    </div>

                    <div class="button-container">
                        <div @click="playLastVideo" class="button">
                            <Icon name="mdi:play" width="30px" height="30px" />
                            <span>Play</span>
                        </div>
                        <div style="flex-grow: 1;"></div>
                        <div @click="editMedia(currentMediaId)" v-if="admin" class="trailer-button">
                            <Icon name="mdi:pencil" width="25px" height="25px" class="edit-btn" />
                        </div>
                        <div class="trailer-button" @click="showTrailer = !showTrailer">
                            <Icon name="mdi:movie-open-play" width="25px" height="25px" />
                        </div>
                        <div class="trailer-button hide-on-desktop"
                            @click="showExtraInformation = !showExtraInformation">
                            <Icon name="mdi:information-slab-circle-outline" width="25px" height="25px" />
                        </div>
                    </div>
                </div>
                <div class="overlay"></div>
                <iframe ref="iframe" class="preview-trailer"
                    :src="media.trailer ? parseTrailer(media.trailer, false, false) : parseTrailer('https://www.youtube.com/watch?v=dQw4w9WgXcQ', false, false)"
                    allow="autoplay; encrypted-media;"></iframe>
            </div>

            <!-- Show season button if it is season -->
            <div v-if="!media.seasons?.includes(-1)" class="season-btn">
                <span @click="showDropdown = !showDropdown" style="padding-left: 6px">Season {{ selectedSeason }}
                    <Icon name="mdi:chevron-down" style="min-width: 20px;" />
                </span>
                <ul v-if="showDropdown" class="season-dropdown">
                    <li v-for="season in media.seasons?.sort((a, b) => a - b)"
                        @click="selectedSeason = season; showDropdown = false" class="season">Season {{ season }}</li>
                </ul>
            </div>

            <!-- Show season episodes based on choosen season -->
            <div v-if="media?.videos?.length > 1" class="container-episodes">
                <!-- Movie episode cards -->
                <ul v-if="media.seasons?.includes(-1)" @wheel="scrollHorizontal" ref="episodeContainer"
                    class="movie-content">
                    <li @click="playVideo(video.id)" ref="episodeElements" class="episode-card"
                        v-for="(video) in media.videos?.sort((a, b) => a.index - b.index)" :id="video.id">
                        <div class="darken"></div>
                        <span>{{ video.name }}</span>
                        <span style="position: absolute; bottom: 0; right: 0;">{{ formatTime(video.duration) }}</span>
                        <img :src="`${config.public.baseURL}/stream/snapshot/${video.id}`">
                        <div v-if="calcTimePercentage(video) !== 0" class="time"
                            style="background-color: rgba(255, 255, 255, 0.5);"></div>
                        <div class="time" :style="`width:${calcTimePercentage(video)}%`"></div>
                    </li>
                </ul>

                <!-- Serie episode cards -->
                <ul v-else @wheel="scrollHorizontal" ref="episodeContainer" class="season-content">
                    <li @click="playVideo(video.id)" ref="episodeElements" class="episode-card"
                        v-for="(video) in media.videos?.filter((video => video.season === selectedSeason)).sort((a, b) => a.index - b.index)"
                        :id="video.id">
                        <div class="darken"></div>
                        <span>{{ video.name }}</span>
                        <span style="position: absolute; bottom: 0; right: 0;">{{ formatTime(video.duration) }}</span>
                        <img :src="`${config.public.baseURL}/stream/snapshot/${video.id}`">
                        <div v-if="calcTimePercentage(video) !== 0" class="time"
                            style="background-color: rgba(255, 255, 255, 0.5);"></div>
                        <div class="time" :style="`width:${calcTimePercentage(video)}%`"></div>
                    </li>
                </ul>
                <!-- <div class="review-container">
                    <Reviews :media="media" />
                </div> -->
            </div>
            <div class="review-container-movie">
                <Reviews :media="media" />
            </div>
        </div>
        <div @click="showTrailer = false" v-if="showTrailer" class="container-popup">
            <iframe class="popup-trailer" :src="parseTrailer(media.trailer, true, true)"
                allow="autoplay; encrypted-media;"></iframe>
        </div>
        <div @click="showExtraInformation = false" v-if="showExtraInformation" class="container-popup">
            <div class="container-popup-information">
                <h1 style="text-transform: uppercase; margin-bottom: -10px; margin-top: 0;">{{ media.name }}</h1>
                <span class="info">{{ media.year }} • {{ media.genres?.join(", ") }}</span>
                <p class="plot-text">{{ media.plot }}</p>
                <div class="container-cast">
                    <span>Cast:&nbsp;</span>
                    <span v-for="(actor, index) in media?.actors">{{ actor.firstname }}<span
                            v-if="actor.lastname">&nbsp;{{
                                actor.lastname }}</span><span v-if="index < media.actors?.length - 1">,&nbsp;</span></span>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
::-webkit-scrollbar {
    height: 5px !important;
    width: 5px !important;
}

.edit-btn {
    pointer-events: all;
    cursor: pointer;
    margin-left: 10px;
}

.edit-btn:hover {
    color: var(--primary-color-100);
}

img {
    width: 200px;
}

.container-popup-information {
    margin: 20px;
    padding: 20px;
    width: 90vw;
    background-color: var(--background-color-100);
    border-radius: var(--border-radius-1);
}

.review-container-movie {
    padding: 30px;
}

.trailer-button {
    padding: 5px;
}

.trailer-button:hover {
    cursor: pointer;
    color: var(--primary-color-100);
}

.preview-trailer {
    position: absolute;
    height: 300%;
    width: 100%;
    top: -100%;
    border: 0;
}

.popup-trailer {
    position: relative;
    width: 60vw;
    height: 70vh;
    border: 0;
    z-index: 50;
}

.container-cast {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    font-weight: 100;
}

.container-popup {
    z-index: 50;
    position: fixed;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
}

.button {
    display: flex;
    flex-direction: row;
    align-items: center;
    font-size: var(--font-size-4);
    color: var(--background-color-100);
    background-color: var(--text-color-1);
    border-radius: var(--border-radius-1);
    padding: 0 6px 0 2px;
    cursor: pointer;
}

.button:hover {
    cursor: pointer;
    background-color: var(--primary-color-100);
}

.button * {
    padding: 0 4px;
}

.button-container {
    margin-top: 18px;
    display: flex;
    flex-direction: row;
    align-items: center;
    pointer-events: all;
}

.time {
    z-index: 2;
    height: 4px;
    background-color: var(--primary-color-100);
    width: 100%;
    position: absolute;
    bottom: 0;
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
    margin: 30px 0px 80px 0px;
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
    user-select: none;
}

.season-content {
    display: flex;
    overflow-x: scroll;
    overflow-y: hidden;
    padding: 0;
    margin: 0;
    width: 100%;
    margin-top: 15px;
}

.movie-content {
    display: flex;
    overflow-x: scroll;
    overflow-y: hidden;
    padding: 0;
    margin: 0;
    width: 100%;
    margin-top: 15px;
}

.darken {
    z-index: 1;
    position: absolute;
    width: 100%;
    height: 100%;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.25) 100%);
}

.episode-card {
    position: relative;
    aspect-ratio: 4/3;
    min-width: 20vw;
    height: 95%;
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
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.3) 100%);
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
    padding-bottom: 50px;
}

.container-preview-trailer {
    position: relative;
    overflow: hidden;
    height: 65vh;
    width: 100vw;
    pointer-events: none;
}

.container-information {
    width: 100%;
    padding: 30px;
    bottom: 0;
    overflow-wrap: break-all;
    z-index: 2;
    position: absolute;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
}

.overlay {
    z-index: 1;
    position: absolute;
    width: 100%;
    height: 100%;
    background: linear-gradient(0deg, rgba(0, 0, 0, 0.9) 0%, rgba(255, 255, 255, 0) 100%);
}

.hide-on-desktop {
    display: none;
}

@media screen and (min-width: 1200px) {

    .movie-content,
    .season-content {
        max-width: 100%;
    }

    .container-episodes {
        display: flex;
        margin: 0px 30px;
        overflow: hidden;
        justify-content: space-between;
    }

    .review-container {
        margin-top: 10px;
        width: 34%;
    }
}

@media screen and (max-width: 1100px) {
    .container-trailer {
        height: 50vh;
    }

    .preview-trailer {
        height: 300%;
        width: 140%;
        left: -20%;
        top: -100%;
    }

    .popup-trailer {
        width: 90vw;
    }
}

@media screen and (max-width: 992px) {
    .container-information {
        padding: 20px;
    }

    .button-container {
        margin-top: 8px;
    }

    .info {
        margin-bottom: 0;
    }

    .episode-card {
        min-width: 170px;
        height: 180px;
    }

    .hide-on-phone {
        display: none;
    }

    .hide-on-desktop {
        display: block;
    }
}

@media screen and (max-width: 700px) {
    .container-trailer {
        height: 40vh;
    }

    .review-container {
        margin: 30px 0px 0px 0px;
    }

    .plot-text {
        max-width: 100%;
        max-height: 50px;
    }

    .preview-trailer {
        height: 300%;
        width: 180%;
        left: -40%;
        top: -100%;
    }

    .popup-trailer {
        width: 95vw;
        height: 40vh;
    }
}
</style>
