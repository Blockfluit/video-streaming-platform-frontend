<script setup>
import { useMediaStore } from "~/stores/mediaStore";
import { storeToRefs } from "pinia";

const mediaStore = useMediaStore()
const config = useRuntimeConfig()

const { media, video } = storeToRefs(mediaStore)

const videoElement = ref({})
const showReturnElement = ref(true)
const countdownTimer = ref(0)
let timeoutId

onMounted(() => {
    if (process.client) {
        const queryString = window.location.search
        const urlParams = new URLSearchParams(queryString)
        const time = urlParams.get("time") ?? 0
        videoElement.value.currentTime = parseInt(time)
        videoElement.value.volume = localStorage.getItem("volume") ?? 0.5

        // window.onmousemove = () => {
        //     clearTimeout(timeoutId)
        //     showReturnElement.value = true
        //     timeoutId = setTimeout(() => { showReturnElement.value = false }, 3000)
        // }
    }
})

onBeforeUnmount(() => {
    if (process.client) {
        mediaStore.updateWatched(video.value.id, videoElement.value.currentTime)
        localStorage.setItem("volume", videoElement.value.volume)
        window.onmousemove = null
    }
})

const playNextVideo = () => {
    const nextVideo = mediaStore.media.videos.find(entry => entry.index === video.value.index + 1)
    if (nextVideo === undefined) return

    let coutdownInSec = 5

    const intervalId = setInterval(() => {
        coutdownInSec--
        countdownTimer.value = coutdownInSec + 1
        if (coutdownInSec < 0) {
            clearInterval(intervalId)
            mediaStore.video = nextVideo
            videoElement.value.load()
            videoElement.value.play()
        }
    }, 1000)

}
</script>

<template>
    <div class="container">
        <div v-if="showReturnElement" @click="navigateTo(`/media?id=${media.id}`)" class="container-return">
            <Icon name="bi:chevron-left" class="back-icon" size="1.5rem" />
            <div class="container-vertical">
                <span class="title">{{ video.name
                }}</span>
                <span v-if="video.season !== -1" style="font-size: var(--font-size-4);">Season
                    {{ video.season }}</span>
            </div>
        </div>
        <video @ended="playNextVideo" ref="videoElement" crossorigin="anonymous" controls autoplay>
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