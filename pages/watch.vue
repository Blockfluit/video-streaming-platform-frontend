<script setup>
import { useMediaStore } from "~/stores/mediaStore";
import { useWatchStore } from "~/stores/watchStore";
import { storeToRefs } from "pinia";

const mediaStore = useMediaStore()
const watchStore = useWatchStore()
const config = useRuntimeConfig()

const { media } = storeToRefs(mediaStore)
const { volume, video } = storeToRefs(watchStore)

const videoElement = ref({})
const showReturnElement = ref(true)
const countdownTimer = ref(0)
const isPlaying = ref(false)
const nextVideo = ref()

let intervalId
let timeoutId

onMounted(() => {
    if (process.client) {
        videoElement.value.currentTime = watchStore.startTime
        videoElement.value.volume = volume.value

        window.onmousemove = () => {
            clearTimeout(timeoutId)
            showReturnElement.value = true
            timeoutId = setTimeout(() => { showReturnElement.value = false }, 3000)
        }
    }
})

onBeforeUnmount(() => {
    if (process.client) {
        watchStore.updateWatched(video.value.id, videoElement.value.currentTime)
        volume.value = videoElement.value.volume
        window.onmousemove = null
    }
})

const playNextVideo = () => {
    const countdownInSec = 5

    videoElement.value.currentTime = 0
    watchStore.updateWatched(video.value.id, 0)

    nextVideo.value = media.value.videos.find(entry => entry.index === video.value.index + 1)
    countdownTimer.value = countdownInSec

    intervalId = setInterval(() => {
        countdownTimer.value--
        if (countdownTimer.value > 0) {
            return
        }

        if (nextVideo.value === undefined) {
            clearInterval(intervalId)
            navigateTo("/media")
            return
        }
        if (nextVideo.value !== undefined) {
            clearInterval(intervalId)
            video.value = nextVideo
            videoElement.value.load()
            videoElement.value.play()
            return
        }
    }, 1000)
}
</script>

<template>
    <div class="container">
        <div v-if="showReturnElement || !isPlaying" @click="navigateTo(`/media`)" class="container-return">
            <Icon name="bi:chevron-left" class="back-icon" size="1.5rem" />
            <div class="container-vertical">
                <span class="title">{{ video.name
                }}</span>
                <span v-if="video.season !== -1" style="font-size: var(--font-size-5);">Season
                    {{ video.season }}</span>
            </div>
        </div>
        <video @play="isPlaying = true" @pause="isPlaying = false" @ended="playNextVideo" ref="videoElement"
            crossorigin="anonymous" controls autoplay>
            <source :src="`${config.public.baseURL}/stream/video/${video.id}`" type="video/mp4" />
            <track v-for="subtitle in video.subtitles" :src="`${config.public.baseURL}/stream/subtitle/${subtitle.id}`"
                :label="subtitle.label" kind="subtitles" :srclang="subtitle.srcLang" :default="subtitle.defaultSub" />
        </video>
        <div v-if="countdownTimer > 0" class="container-center">
            <div v-if="nextVideo !== undefined" class="container-countdown">
                <h3>Next video:</h3>
                <h3 style="font-weight: 100;">{{ nextVideo.name }}</h3>
                <h1>{{ countdownTimer }}</h1>
            </div>
            <div v-else class="container-countdown">
                <h3>Returning to:</h3>
                <h3 style="font-weight: 100;">{{ media.name }}</h3>
                <h1>{{ countdownTimer }}</h1>
            </div>
        </div>
    </div>
</template>

<style scoped>
.container-center {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
}

.container-countdown {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: var(--background-color-200);
    z-index: 10;
    position: fixed;
    border-radius: var(--border-radius-1);
    padding: 10px;
    border: 4px solid var(--primary-color-100);
}

.container-countdown * {
    margin: 0;
}

.container-return {
    z-index: 10;
    position: absolute;
    display: flex;
    flex-direction: row;
    align-items: center;
    margin: 40px 30px;
    padding: 5px 15px;
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

.back-icon {
    margin-right: 15px;
}

.container {
    position: fixed;
    top: 0;
    /* top: var(--navbar-height); */
    width: 100%;
    /* height: calc(100% - var(--navbar-height)); */
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

@media screen and (max-width: 992px) {
    .container-vertical span {
        font-size: var(--font-size-4);
        text-transform: capitalize;
    }
}
</style>