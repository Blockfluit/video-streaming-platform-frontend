<script setup>
import { useMediaStore } from "~/stores/mediaStore";
import { useWatchStore } from "~/stores/watchStore";
import { storeToRefs } from "pinia";

const mediaStore = useMediaStore()
const watchStore = useWatchStore()
const config = useRuntimeConfig()

const { media } = storeToRefs(mediaStore)
const { volume, video, nextVideo, previousVideo, startTime } = storeToRefs(watchStore)

const videoElement = ref({})
const showOverlay = ref(true)
const countdownTimer = ref(0)
const isPlaying = ref(false)

let intervalId
let timeoutId
let updateIntervalId
let currentMediaId
let currentVideoId
let timestamp

onBeforeMount(() => {
    if (process.client) {
        const route = useRoute()
        currentMediaId = parseInt(route.params.mediaId)
        currentVideoId = parseInt(route.params.videoId)
        timestamp = route.query.t !== undefined ? parseInt(route.query.t) : undefined
    }
})

onMounted(() => {
    if (process.client) {
        videoElement.value.volume = volume.value
        playVideo(currentVideoId)

        window.addEventListener("mousemove", resetOverlay)
        window.addEventListener("touchend", resetOverlay)

        setTimeout(() => { showOverlay.value = false }, 3000)
        clearInterval(updateIntervalId)
        updateIntervalId = setInterval(() => {
            watchStore.updateWatched(video.value.id, videoElement.value.currentTime)
        }, 5000)
    }
})

onBeforeUnmount(() => {
    if (process.client) {
        watchStore.updateWatched(video.value.id, videoElement.value.currentTime)
        volume.value = videoElement.value.volume

        window.removeEventListener("mousemove", resetOverlay)
        window.removeEventListener("touchend", resetOverlay)

        clearInterval(updateIntervalId)
    }
})

function getStartTime() {
    if (timestamp !== undefined) {
        return timestamp
    }
    if ((startTime.value / video.value.duration) > 0.995) {
        return 0
    }
    return startTime.value
}

function resetOverlay() {
    clearTimeout(timeoutId)
    showOverlay.value = true
    timeoutId = setTimeout(() => { showOverlay.value = false }, 3000)
}

async function playVideo(videoId, time) {
    if (videoId === undefined) {
        clearInterval(intervalId)
        navigateToMedia(currentMediaId)
        return
    }
    if (videoId !== undefined) {
        clearInterval(intervalId)
        await watchStore.setVideo(currentMediaId, videoId)
        videoElement.value.load()
        videoElement.value.currentTime = time !== undefined ? time : getStartTime()
        videoElement.value.play()

        useRouter()
            .push(`/media/${currentMediaId}/watch/${videoId}`)
        return
    }
}

function playVideoWithCountdown(videoId) {
    const countdownInSec = 5
    countdownTimer.value = countdownInSec

    watchStore.updateWatched(video.value.id, videoElement.value.currentTime)

    intervalId = setInterval(() => {
        countdownTimer.value--
        if (countdownTimer.value > 0) {
            return
        }

        playVideo(videoId)
    }, 1000)
}

function navigateToMedia(mediaId) {
    navigateTo(`/media/${mediaId}`)
}
</script>

<template>
    <div class="container">
        <header v-if="showOverlay || !isPlaying"
                class="container-header">
            <div style="display: flex; flex-direction: column;">
                <h3 style="pointer-events: none; margin: 0; font-weight: 700;">{{ video.name }}</h3>
                <h4 v-if="video.season !== -1"
                    style="margin: 0; font-weight: 300;">Season {{ video.season }}</h4>
            </div>
            <button @click="navigateToMedia(currentMediaId)"
                    class="back-button">
                <Icon name="radix-icons:cross-1"
                      class="back-icon"
                      size="1.5rem"
                      style="color: var(--text-color-1);" />
            </button>
        </header>
        <div class="container-next-video">
            <div v-if="(showOverlay || !isPlaying) && previousVideo !== undefined"
                 @click="playVideo(previousVideo.id, 0)"
                 class="container-next-video-left">
                <Icon name="bi:chevron-left"
                      class="back-icon"
                      size="2rem" />
                <h3 class="hide-on-desktop">Previous</h3>
                <div class="container-vertical hide-on-phone">
                    <span class="title"
                          style="font-size: var(--font-size-4);">{{ previousVideo.name
                          }}</span>
                    <span v-if="previousVideo.season !== -1"
                          style="font-size: var(--font-size-5);">Season
                        {{ previousVideo.season }}</span>
                </div>
            </div>
            <div style="flex-grow: 1;"></div>
            <div v-if="(showOverlay || !isPlaying) && nextVideo !== undefined"
                 @click="playVideo(nextVideo.id, 0)"
                 class="container-next-video-right">
                <div class="container-vertical hide-on-phone">
                    <span class="title"
                          style="font-size: var(--font-size-4);">{{ nextVideo.name
                          }}</span>
                    <span v-if="nextVideo.season !== -1"
                          style="font-size: var(--font-size-5);">Season
                        {{ nextVideo.season }}</span>
                </div>
                <h3 class="hide-on-desktop">Next</h3>
                <Icon name="bi:chevron-right"
                      class="back-icon"
                      size="2rem" />
            </div>
        </div>
        <video @play="isPlaying = true"
               @pause="isPlaying = false"
               @ended="playVideoWithCountdown(nextVideo === undefined ? unedefined : nextVideo.id)"
               ref="videoElement"
               crossorigin="anonymous"
               controls
               autoplay>
            <source :src="`${config.public.baseURL}/stream/video/${video.id}`"
                    type="video/mp4" />
            <track v-for="subtitle in video.subtitles"
                   :src="`${config.public.baseURL}/stream/subtitle/${subtitle.id}`"
                   :label="subtitle.label"
                   kind="subtitles"
                   :srclang="subtitle.srcLang"
                   :default="subtitle.defaultSub" />
        </video>
        <div v-if="countdownTimer > 0"
             class="container-center">
            <div v-if="nextVideo !== undefined"
                 class="container-countdown">
                <h3>Next video:</h3>
                <h3 style="font-weight: 100;">{{ nextVideo.name }}</h3>
                <h1>{{ countdownTimer }}</h1>
            </div>
            <div v-else
                 class="container-countdown">
                <h3>Returning to:</h3>
                <h3 style="font-weight: 100;">{{ media.name }}</h3>
                <h1>{{ countdownTimer }}</h1>
            </div>
        </div>
    </div>
</template>

<style scoped>
.container {
    position: fixed;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 100;
    left: 0;
    background-color: rgb(0, 0, 0);
}

.container video {
    position: absolute;
    width: 100%;
    height: 100%;
}

.container-center {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
}

.container-countdown {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    pointer-events: none;
    background: radial-gradient(rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.3) 100%);
    position: fixed;
    padding: 10px;
}

.container-countdown * {
    margin: 0;
}

.container-next-video {
    width: 100%;
    display: flex;
    flex-direction: row;
    z-index: 10;
    position: absolute;
    bottom: 70px;
    padding: 30px;
}

.container-next-video-left {
    display: flex;
    flex-direction: row;
    align-items: center;
    left: 0;
    cursor: pointer;
}

.container-next-video-left:hover {
    color: var(--primary-color-100);
}

.container-next-video-right {
    display: flex;
    flex-direction: row;
    align-items: center;
    right: 0;
    cursor: pointer;
}

.container-next-video-right:hover {
    color: var(--primary-color-100);
}

.container-header {
    width: 100%;
    z-index: 10;
    position: absolute;
    display: flex;
    justify-content: space-between;
    padding: 30px;
}

.title {
    font-size: var(--font-size-2);
    text-transform: capitalize;
}

.container-return:hover {
    cursor: pointer;
}

.container-vertical {
    display: flex;
    flex-direction: column;
}

.back-button {
    cursor: pointer;
    background-color: transparent;
    border: 0;
    height: fit-content;
    padding: 5px;
    margin-left: 10px;
}

.back-icon {
    margin: 0;

}

.hide-on-phone {
    display: flex;
}

.hide-on-desktop {
    display: none;
}

@media screen and (max-width: 992px) {
    .container-vertical span {
        font-size: var(--font-size-4);
        text-transform: capitalize;
    }

    .container-header h3 {
        font-size: 1.2rem;
    }

    .hide-on-phone {
        display: none;
    }

    .container-next-video {
        padding: 30px 15px;
    }

    .hide-on-desktop {
        display: flex;
    }
}
</style>