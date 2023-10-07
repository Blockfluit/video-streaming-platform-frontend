<script setup>
import { useMainStore } from '~/stores/mainStore';
import { useMediaStore } from '~/stores/mediaStore';

const props = defineProps({
    media: {},
    showLastVideo: false,
})

const mainStore = useMainStore()
const mediaStore = useMediaStore()

const config = useRuntimeConfig()
const showTrailer = ref(false)
const showExtraInformation = ref(false)
const timeElement = ref()
const lastVideoName = ref("")
let lastWatched

onMounted(() => {
    if (process.client) {
        setLastVideo()
    }
})

const setLastVideo = () => {
    lastWatched = mainStore.watched.filter(entry => entry.mediaId === props.media.id).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0] ?? {}
    lastVideoName.value = lastWatched !== undefined ? lastWatched.name : ""
    timeElement.value.style.width = lastWatched.timestamp / lastWatched.duration * 100 + "%"
}

const navigateToMedia = (e, media) => {
    if (e.target.id === "showTrailer") {
        return
    }
    if (props.showLastVideo) {
        mediaStore.video = lastWatched
        mediaStore.video.id = lastWatched.videoId
        mediaStore.setMedia(media.id)
        navigateTo(`watch?time=${lastWatched.timestamp}`)
        return
    }
    mediaStore.setMedia(media.id)
    navigateTo(`/media?id=${media.id}`)
}
</script>

<template>
    <div @mouseover="showExtraInformation = true" class="card">
        <img :src="config.public.baseURL + '/stream/thumbnail/' + media.id">
        <div class="information">
            <div v-show="showLastVideo" class="time" ref="timeElement"></div>
            <span v-show="showLastVideo" class="last-video-name">{{
                lastVideoName }}</span>
            <div class="title">
                <span class="name">{{ media.name }}</span>
                <span v-if="media.videos > 1" class="total-videos">{{ media.videos }}</span>
            </div>
        </div>
        <div @click="(e) => navigateToMedia(e, media)" @mouseleave="showExtraInformation = false"
            v-if="showExtraInformation" class="extra-information">
            <button v-if="media.trailer !== undefined" class="trailer-btn" @click="showTrailer = true;">
                <Icon name="fluent:movies-and-tv-16-regular" size="40px" class="overlay-icon" />
            </button>
            <div class="plot">
                <p class="plot-text">{{ media.plot }}</p>
            </div>
            <span>Release year: {{ media.year }}</span>
            <span>total videos: {{ media.videos }}</span>
            <span>unique views: {{ media.views }}</span>
            <span>rating: {{ media.rating === -1 ? "No ratings" : media.rating }}</span>
        </div>
    </div>
    <div @click="showTrailer = false; showExtraInformation = false" v-if="showTrailer" class="hide-trailer"></div>
    <iframe v-if="showTrailer" :src="media.trailer.replace('watch?v=', 'embed/')" name="Trailer"
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
    justify-content: flex-end;
    top: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.85);
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