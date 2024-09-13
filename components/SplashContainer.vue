<script setup>
const props = defineProps({
    supplier: {
        default: () => Promise.resolve({ content: [] }),
        type: Function
    }
})

const recentMedia = ref([])
const index = ref(0)
const media = ref({})
const progress = ref(0)
const showPlayIcon = ref(false)
const iframe = ref()

let timeoutId
let intervalId

const duration = 25000

onBeforeMount(() => {
    fetchMedia()
})

onBeforeUnmount(() => {
    if (process.client) {
        clearTimeout(timeoutId)
    }
})

function fetchMedia() {
    const duration = 7 * 24 * 60 * 60 * 1000

    props.supplier(0, 20).then(data => {
        // If the media that are upload recently equal to an amount less than 10 than pick the last five media.
        let filteredMedia = data.content.filter(m => new Date(m.updatedAt).getTime() + duration > Date.now()).slice(0, 7)
        if (filteredMedia.length < 5) {
            filteredMedia = data.content.slice(0, 5)
        }

        recentMedia.value.push(...filteredMedia)

        setTrailer(0)
    })
}

function setProgress() {
    progress.value = 0
    clearInterval(intervalId)

    intervalId = setInterval(() => {
        if(progress.value < 1) progress.value += 50 / duration
    }, 50)
}

function getProgressWidth(curr, i) {
    if(curr < i) return 'width: 0'
    else if(curr > i) return 'width: 100%'
    return `width: ${progress.value * 100}%`
}

function setTrailer(i) {
    if(i !== undefined) index.value = i

    clearTimeout(timeoutId)
    media.value = recentMedia.value[index.value % recentMedia.value.length]

    timeoutId = setTimeout(() => {
        setTrailer(++index.value)
    }, duration)

    setProgress()
}

function navigateToMedia(i) {
    navigateTo(`/media/${i}`)
}

// Needs refactoring
const parseTrailer = (trailer) => {
    if (trailer === undefined) {
        return ""
    }
    const trailerLongId = trailer.includes("watch?v=") ? trailer.split("watch?v=")[1] : ""
    const trailerId = trailerLongId.split("&t=")[0]
    const time = trailerLongId.includes("&t=") ? trailerLongId.split("&t=")[1].replace("s", "") : ""
    const fullTrailerUrl = trailer.replace("watch?v=", "embed/") + `?playlist=${trailerId}&autoplay=1&showinfo=0&controls=0&disablekb&fs=0&loop=1&mute=1&rel=0${time !== "" ? "&start=" + time : ""}`

    return fullTrailerUrl
}
</script>

<template>
    <div class="container-trailer">
        <div class="container-information">
            <h2 class="now-available">Now available:</h2>
            <div @click="navigateToMedia(media.id)" class="container-information-title">
                <span class="trailer-name">{{ media?.name }}</span>
                <span class="watch-now">| WATCH NOW</span>
            </div>
            <div class="trailer-bullets">
                <template v-for="(media, i) in recentMedia.length">
                    <div @click="setTrailer(i)" class="container-progress">
                        <div class="container-progress-bottom" />
                        <div class="container-progress-top" :style="getProgressWidth(index % recentMedia.length, i)" />
                    </div>
                </template>
            </div>
        </div>
        <div @mouseover="showPlayIcon = true" @mouseleave="showPlayIcon = false" class="overlay"
            @click="navigateToMedia(media.id)">
            <transition name="fade">
                <Icon v-if="showPlayIcon" name="material-symbols:play-arrow-rounded" class="play-icon" size="128px" />
            </transition>
        </div>
        <iframe ref="iframe" :src="parseTrailer(media?.trailer)" name="Trailer"
            allow="autoplay; encrypted-media;"></iframe>
    </div>
</template>

<style scoped>
h2 {
    margin: 0;
    font-weight: 600;
}

.container-progress {
    cursor: pointer;
    width: 34px; 
    margin: 6px 4px; 
    padding: 6px 0; 
    position: relative;
    
}

.container-progress, .container-progress > * {
    border-radius: 10px;
}

.container-progress-bottom, .container-progress-top {
    pointer-events: none;
    height: 4px;
}

.container-progress-bottom {
    position: absolute; 
    background-color: grey; 
    width: 100%; 
}

.container-progress-top {
    position: relative; 
    background-color: white; 
}

.container-progress:hover > * {
    background-color: var(--primary-color-100);
}

.play-icon {
    color: rgba(255, 255, 255, 0.7)
}

.trailer-name {
    text-transform: uppercase;
    max-width: 70%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 2rem;
    font-weight: 700;
}

.trailer-chevron {
    margin-top: 2px;
    font-size: 40px;
    min-width: fit-content;
    min-height: fit-content;
}

.trailer-chevron:hover {
    cursor: pointer;
    color: var(--primary-color-100);
}

.watch-now {
    font-weight: 200;
    font-size: var(--font-size-2);
    max-width: 70%;
    font-size: 2rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.now-available {
    margin-bottom: -15px;
}

.container-trailer {
    position: relative;
    overflow: hidden;
    height: 60vh;
    width: 100%;
    border-radius: var(--border-radius-1);
}

.container-information {
    z-index: 2;
    display: flex;
    flex-direction: column;
    position: absolute;
    width: 100%;
    padding: 0 30px 10px 30px;
    left: 0;
    bottom: 0;
    user-select: none;
}

.container-information-title {
    display: flex;
    flex-direction: row;
    align-items: center;
}

.container-information-title span {
    margin: 10px 10px 0 0;
    cursor: pointer;
}

.trailer-bullets {
    z-index: 3;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    font-size: 64px;
}

iframe {
    pointer-events: none;
    position: absolute;
    height: 300%;
    width: 100%;
    top: -100%;
    border: 0;
}

.overlay {
    z-index: 1;
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background: linear-gradient(0deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.3) 30%, rgba(255, 255, 255, 0) 100%);
}

.overlay:hover {
    cursor: pointer;
}

@media screen and (max-width: 700px) {
    .now-available {
        font-size: 16px;
    }

    .container-information-title span {
        font-size: 16px;
    }
}
</style>