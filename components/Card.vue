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
    navigateTo(`media?id=${media.id}`)
}
</script>

<template>
    <div @mouseover="showExtraInformation = true" class="card">
        <img :src="config.public.baseURL + '/stream/thumbnail/' + media.id">
        <div class="information">
            <div v-show="showLastVideo" class="time" ref="timeElement"></div>
            <span v-show="showLastVideo" class="last-video-name">{{
                lastVideoName }}</span>
            <span>{{ media.name }}</span>
        </div>
        <div @click="(e) => navigateToMedia(e, media)" @mouseleave="showExtraInformation = false"
            v-if="showExtraInformation" class="extra-information">
            <Icon id="showTrailer" v-if="media.trailer !== undefined" @click="showTrailer = true;" name="iconoir:youtube"
                size="40px" class="overlay-icon" />
            <div class="plot">
                <p class="plot-text">{{ media.plot }}</p>
            </div>
            <span>Release year: {{ media.year }}</span>
            <span>total videos: {{ media.videos }}</span>
            <span>unique views: {{ media.views }}</span>
            <span>rating: {{ media.rating === -1 ? "No ratings" : media.rating }}</span>
        </div>
        <div @click="showTrailer = false; showExtraInformation = false" v-if="showTrailer" class="hide-trailer"></div>
        <iframe v-if="showTrailer" :src="media.trailer.replace('watch?v=', 'embed/')" name="Trailer"
            allow="autoplay; encrypted-media;"></iframe>
    </div>
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
    height: 3px;
    background-color: aqua;
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

.overlay-icon:hover {
    color: red
}

.information {
    display: flex;
    flex-direction: column;
    padding: 4px 0;
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
    border-radius: 0 0 10px 10px;
}

.extra-information span,
p,
svg {
    white-space: nowrap;
    padding: 5px 12px;
}



.card {
    position: relative;
    display: flex;
    flex-direction: column;
    max-width: 180px;
    min-width: 160px;
    margin: 6px;
}

.card img {
    width: 100%;
}
</style>