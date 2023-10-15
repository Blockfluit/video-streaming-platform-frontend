<script setup>
import { storeToRefs } from 'pinia';
import { useMainStore } from '~/stores/mainStore';
import { useMediaStore } from '~/stores/mediaStore';
import { useWatchStore } from '~/stores/watchStore';

const props = defineProps({
    shownMedia: {},
    showLastVideo: false,
})

const mainStore = useMainStore()
const mediaStore = useMediaStore()
const watchStore = useWatchStore()

const { watched } = storeToRefs(mainStore)
const { media } = storeToRefs(mediaStore)
const { startTime, video } = storeToRefs(watchStore)

const config = useRuntimeConfig()
const showTrailer = ref(false)
const showExtraInformation = ref(false)
const timePercentage = ref(0)
const lastWatched = ref({})

onBeforeMount(() => {
    lastWatched.value = getLastVideo(props.shownMedia.id)
    if (timePercentage.value !== undefined) {
        timePercentage.value = lastWatched.value.timestamp / lastWatched.value.duration * 100
    }
})

watch(watched, (o, n) => {
    lastWatched.value = getLastVideo(props.shownMedia.id)
    if (lastWatched.value !== undefined) {
        timePercentage.value = lastWatched.value.timestamp / lastWatched.value.duration * 100
    }
})

function getLastVideo(mediaId) {
    return watched.value.filter(entry => entry.mediaId === mediaId)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0] ?? {}
}

const navigateToMedia = (selectedMedia) => {
    media.value.id = selectedMedia.id

    if (props.showLastVideo) {
        lastWatched.value.id = lastWatched.value.videoId
        video.value = lastWatched.value
        startTime.value = lastWatched.value.timestamp
        navigateTo(`watch`)
        return
    }
    navigateTo(`/media`)
}
</script>

<template>
    <div @mouseover="showExtraInformation = true" class="card">
        <img :src="config.public.baseURL + '/stream/thumbnail/' + shownMedia.id">
        <div class="information">
            <div v-if="showLastVideo" class="time" :style="`width: ${timePercentage}%`"></div>
            <span v-if="showLastVideo" class="last-video-name">{{ lastWatched.name }}</span>
            <div class="title">
                <span class="name">{{ shownMedia.name }}</span>
                <span v-if="shownMedia.videos > 1" class="total-videos">{{ shownMedia.videos }}</span>
            </div>
        </div>
        <div @click="navigateToMedia(shownMedia)" @mouseleave="showExtraInformation = false" v-if="showExtraInformation"
            class="extra-information">
            <div v-if="shownMedia.rating >= 1">
                <template v-for="star in 5">
                    <Icon class="star"
                        :style="{ color: shownMedia.rating / 2 >= star ? 'var(--primary-color-100)' : 'var(--text-color-2)' }"
                        name="mdi:star" />
                </template>
            </div>
            <div v-else>
                <h3>No Rating</h3>
            </div>
        </div>
    </div>
    <div @click="showTrailer = false; showExtraInformation = false" v-if="showTrailer" class="hide-trailer"></div>
    <iframe v-if="showTrailer" :src="shownMedia.trailer.replace('watch?v=', 'embed/')" name="Trailer"
        allow="autoplay; encrypted-media;"></iframe>
</template>

<style scoped>
iframe {
    z-index: 5;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 60vw;
    height: 50vh;
    border: 0;
    box-shadow: var(--box-shadow-2);
    -webkit-box-shadow: var(--box-shadow-2);
    -moz-box-shadow: var(--box-shadow-2);
}

.last-video-name {
    font-size: var(--font-size-5);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.star {
    min-width: 40px;
    min-height: 40px;
    margin: 0px -8px;
    color: var(--primary-color-100);
}

.star-white {
    min-width: 40px;
    min-height: 40px;
    margin: 0px -8px;
    color: var(--text-color-2);
}

.time {
    height: 4px;
    background-color: var(--primary-color-100);
    margin-bottom: 5px;
}

.last-video-name {
    margin: 0px 10px;
}

.title {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin: 0px 10px;
}

.name {
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding-top: 5px;
}

.total-videos {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    font-size: 0.9rem;
    color: var(--text-color-3);
    margin-bottom: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 25px;
}

.plot {
    flex-grow: 1;
    overflow: hidden;
}

.plot-text {
    font-size: var(--font-size-5);
    white-space: pre-wrap;
    text-overflow: ellipsis;
}

.hide-trailer {
    left: 0;
    top: 0;
    z-index: 4;
    position: fixed;
    width: 100vw;
    height: 100vh;
}

.trailer-btn {
    background-color: transparent;
    border: none;
    color: white;
    z-index: 99;
    width: 100%;
}

.trailer-btn:hover {
    cursor: pointer;
}

.trailer-btn:hover .overlay-icon {
    color: red;
}

.overlay-icon {
    min-width: 25px;
    min-height: 25px;
}

.overlay-icon:hover {
    color: red;
}

.information {
    display: flex;
    flex-direction: column;
    padding-bottom: 4px;
    text-transform: capitalize;
    font-size: var(--font-size-3);
}

.extra-information {
    display: flex;
    z-index: 2;
    position: absolute;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    top: 0;
    left: 0;
    background: linear-gradient(0deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.5) 10%, rgba(0, 0, 0, 0.6) 20%, rgba(0, 0, 0, 0.7) 30%, rgba(0, 0, 0, 0.8) 40%, rgba(0, 0, 0, 0.8) 50%, rgba(0, 0, 0, 0.8) 60%, rgba(0, 0, 0, 0.7) 70%, rgba(0, 0, 0, 0.6) 80%, rgba(0, 0, 0, 0.5) 90%, rgba(0, 0, 0, 0.2) 100%);
    height: 100%;
    width: 100%;
    border-radius: var(--border-radius-1);
}

.extra-information span,
p,
svg {
    white-space: nowrap;
    padding: 5px 10px;
}



.card {
    position: relative;
    display: flex;
    flex-direction: column;
    max-width: 250px;
    min-width: 200px;
    border-radius: 15px;
    background-color: var(--background-color-100);
}

.card:hover {
    cursor: pointer;
}

.card img {
    border-radius: var(--border-radius-1) var(--border-radius-1) 0px 0px;
}
</style>