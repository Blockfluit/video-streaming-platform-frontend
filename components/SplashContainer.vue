<script setup>
const props = defineProps({
    supplier: {
        default: () => Promise.resolve({ content: [] }),
        type: Function
    },
})

const recentMedia = ref([])
const trailerMediaId = ref(0)
const trailerMedia = ref({})
const showPlayIcon = ref(false)
const currentTrailerIndex = ref()
const iframe = ref()
let timeoutId

onBeforeMount(() => {
    fetchMedia()

})

onMounted(() => {
    if (process.client) {
        setTrailerTimeout(0)
    }
})

onBeforeUnmount(() => {
    if (process.client) {
        clearTimeout(timeoutId)
    }
})

function fetchMedia() {
    const duration = 7 * 24 * 60 * 60 * 1000

    props.supplier(0, 20).then(data => {
        let filteredMedia = data.content.filter(media => new Date(media.updatedAt).getTime() + duration > Date.now())
        if (filteredMedia.length < 5) {
            filteredMedia = data.content.slice(0, 5)
        }
        recentMedia.value.push(...filteredMedia)
        setTrailerTimeout(0)
    })
}

const setTrailerTimeout = (index) => {
    clearTimeout(timeoutId)
    nextTrailer(index)
    timeoutId = setTimeout(() => {
        setTrailerTimeout()
    }, 25000)
}

const nextTrailer = (index) => {
    index !== undefined ? trailerMediaId.value = index : trailerMediaId.value++

    if (trailerMediaId.value > recentMedia.value.length - 1) {
        trailerMediaId.value = 0
    }
    if (trailerMediaId.value < 0) {
        trailerMediaId.value = recentMedia.value.length - 1
    }
    trailerMedia.value = recentMedia.value[trailerMediaId.value]
    currentTrailerIndex.value = trailerMediaId.value
}

const navigateToMedia = (mediaId) => {
    navigateTo(`/media/${mediaId}`)
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
            <div @click="navigateToMedia(trailerMedia.id)" class="container-information-title">
                <span class="trailer-name">{{ trailerMedia?.name }}</span>
                <span class="watch-now">| WATCH NOW</span>
            </div>
            <div class="trailer-bullets">
                <Icon name="material-symbols:chevron-left-rounded" @click="setTrailerTimeout(currentTrailerIndex - 1)"
                    class="trailer-chevron" />
                <template v-for="(media, index) in recentMedia.length">
                    <span @click="setTrailerTimeout(index)" style="cursor: pointer;"
                        :style="index === trailerMediaId ? 'color: var(--primary-color-100)' : ''">•</span>
                </template>
                <Icon name="material-symbols:chevron-right-rounded" @click="setTrailerTimeout(currentTrailerIndex + 1)"
                    class="trailer-chevron" />
            </div>
        </div>
        <div @mouseover="showPlayIcon = true" @mouseleave="showPlayIcon = false" class="overlay"
            @click="navigateToMedia(trailerMedia.id)">
            <transition name="fade">
                <Icon v-if="showPlayIcon" name="material-symbols:play-arrow-rounded" class="play-icon" size="128px" />
            </transition>
        </div>
        <iframe ref="iframe" :src="parseTrailer(trailerMedia?.trailer)" name="Trailer"
            allow="autoplay; encrypted-media;"></iframe>
    </div>
</template>

<style scoped>
h2 {
    margin: 0;
    font-weight: 600;
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
    padding: 0 30px;
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