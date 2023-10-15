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

    watchStore.updateWatched(video.value.id, 0)

    const nextVideo = media.value.videos.find(entry => entry.index === video.value.index + 1)
    if (nextVideo === undefined) return

    let intervalId
    countdownTimer.value = countdownInSec

    intervalId = setInterval(() => {
        countdownTimer.value--
        if (countdownTimer.value < 0) {
            clearInterval(intervalId)
            video.value = nextVideo
            watchStore.updateWatched(video.value.id, 0)
            videoElement.value.load()
            videoElement.value.play()
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
        <div v-if="countdownTimer > 0" class="container-countdown">
            <h1>{{ countdownTimer }}</h1>
        </div>
    </div>
</template>

<style scoped>
.container-countdown {
    background-color: black;
    z-index: 10;
    position: fixed;
    top: 50%;
    left: 50%;
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