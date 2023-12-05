<script setup>
import { useMainStore } from "~/stores/mainStore";
import { useMediaStore } from "~/stores/mediaStore";
import { storeToRefs } from 'pinia'

const mainStore = useMainStore()
const mediaStore = useMediaStore()

const { allMedia, watched, searchbox, lastWatchedUsers } = storeToRefs(mainStore)
const { media } = storeToRefs(mediaStore)

const recentMedia = ref([{ name: "" }])
let timeoutId

const showPlayIcon = ref(false)
const currentTrailerIndex = ref()
const trailerMediaId = ref(0)
const trailerMedia = ref(recentMedia.value[trailerMediaId.value])
const filteredMedia = ref(new Set())
const lazyAllMedia = ref([...allMedia.value.slice(0, 50)])
const recentWatched = ref([])

const iframe = ref()

definePageMeta({
    layout: "main",
});

onBeforeMount(() => {
    mainStore.setAllMedia()
    mainStore.setWatched()
    mainStore.setAllGenres()
    mainStore.setLastWatchedUsers()
    setRecentWatched()
})

onMounted(() => {
    setTrailerTimeout(0)
    window.addEventListener("scroll", addMediaOnScroll)
})

onBeforeUnmount(() => {
    clearTimeout(timeoutId)
    window.scrollTo({ top: 0, behavior: 'instant' })
})

onUnmounted(() => {
    window.removeEventListener("scroll", addMediaOnScroll)
})

watch(allMedia, () => {
    setRecentMedia()
    doFilter()
})

watch(searchbox, (o, n) => {
    doFilter()
})

function addMediaOnScroll() {
    const showAmount = ((document.body.getBoundingClientRect().top * -1) + document.body.clientHeight) / document.body.scrollHeight * allMedia.value.length
    if (showAmount > lazyAllMedia.value.length) {
        lazyAllMedia.value.push(...allMedia.value.slice(lazyAllMedia.value.length, showAmount))
    }
}

// Sets 5 most recent media + all media from past 7 days
const setRecentMedia = async () => {
    recentMedia.value = []
    recentMedia.value.push(...[...allMedia.value].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).splice(0, 5))
    recentMedia.value.push(...allMedia.value.filter(media => !recentMedia.value.includes(media) && new Date().setDate(new Date(media.updatedAt).getDate() + 7) > new Date())
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 10)
    )

    trailerMedia.value = ref(recentMedia.value[trailerMediaId.value])
    nextTrailer(trailerMediaId.value)
}

async function setRecentWatched() {
    recentWatched.value = allMedia.value.filter(media => watched.value.map(entry => entry.mediaId).includes(media.id))
        .filter(media => {
            const a = watched.value.find(entry => entry.mediaId === media.id)
            return (a.timestamp / a.duration) < 0.99
        })
        .sort((a, b) => new Date(watched.value.filter(entry => entry.mediaId === b.id).sort((a, b) => new Date(b.updatedAt) -
            new Date(a.updatedAt))[0].updatedAt) - new Date(watched.value.filter(entry => entry.mediaId === a.id).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0].updatedAt))
        .slice(0, 12)
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

const navigateToMedia = () => {
    media.value.id = trailerMedia.value.id
    navigateTo(`/media`)
}

// Needs refactoring
const parseTrailer = (trailer) => {
    if (trailer === undefined) {
        return "https://www.youtube.com/watch?v=J---aiyznGQ"
    }
    const trailerLongId = trailer.includes("watch?v=") ? trailer.split("watch?v=")[1] : "J---aiyznGQ"
    if (trailerLongId === "J---aiyznGQ") trailer = "https://www.youtube.com/watch?v=J---aiyznGQ"
    const trailerId = trailerLongId.split("&t=")[0]
    const time = trailerLongId.includes("&t=") ? trailerLongId.split("&t=")[1].replace("s", "") : ""

    return trailer.replace("watch?v=", "embed/") + `?playlist=${trailerId}&autoplay=1&showinfo=0&controls=0&disablekb&fs=0&loop=1&mute=1&rel=0${time !== "" ? "&start=" + time : ""}`
}

const doFilter = async () => {
    filteredMedia.value.clear()

    if (searchbox.value !== "") {
        if (filteredMedia.value.size === 0) {
            allMedia.value.filter(media => media.name.toLowerCase().includes(searchbox.value.toLowerCase()))
                .forEach(media => filteredMedia.value.add(media))
        } else {
            const tempFiltered = [...filteredMedia.value].filter(media => media.name.toLowerCase().includes(searchbox.value.toLowerCase()))
            filteredMedia.value.clear()
            tempFiltered.forEach(media => filteredMedia.value.add(media))
        }
    }

    if (searchbox.value === "") {
        [...allMedia.value].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .forEach(media => filteredMedia.value.add(media))
    }
}
</script>

<template>
    <div class="container">
        <div v-if="searchbox === ''"
             class="container-trailer">
            <div class="container-information">
                <h2 class="now-available">Now available:</h2>
                <div @click="navigateToMedia()"
                     class="container-information-title">
                    <span class="trailer-name">{{ trailerMedia.name }}</span>
                    <span class="watch-now">| WATCH NOW</span>
                </div>
                <div class="trailer-bullets">
                    <Icon name="material-symbols:chevron-left-rounded"
                          @click="setTrailerTimeout(currentTrailerIndex - 1)"
                          class="trailer-chevron" />
                    <template v-for="(media, index) in recentMedia.length">
                        <span @click="setTrailerTimeout(index)"
                              style="cursor: pointer;"
                              :style="index === trailerMediaId ? 'color: var(--primary-color-100)' : ''">•</span>
                    </template>
                    <Icon name="material-symbols:chevron-right-rounded"
                          @click="setTrailerTimeout(currentTrailerIndex + 1)"
                          class="trailer-chevron" />
                </div>
            </div>
            <div @mouseover="showPlayIcon = true"
                 @mouseleave="showPlayIcon = false"
                 class="overlay"
                 @click="navigateToMedia()">
                <transition name="fade">
                    <Icon v-if="showPlayIcon"
                          name="material-symbols:play-arrow-rounded"
                          class="play-icon"
                          size="128px" />
                </transition>
            </div>
            <iframe ref="iframe"
                    :src="parseTrailer(trailerMedia.trailer)"
                    name="Trailer"
                    allow="autoplay; encrypted-media;"></iframe>
        </div>
        <div v-if="searchbox === ''">
            <div v-if="recentWatched.length > 0">
                <h2 class="carousel-title">Continue Watching</h2>
                <CardRow :allMedia="recentWatched"
                         :showLastVideo=true />
            </div>
            <div>
                <h2 class="carousel-title">What others are watching</h2>
                <CardRow :allMedia="lastWatchedUsers" />
            </div>
            <div>
                <h2 class="carousel-title">25 Most Viewed</h2>
                <CardRow :allMedia="[...allMedia]
                    .sort((a, b) => b.views - a.views)
                    .slice(0, 25)" />
            </div>
            <div>
                <h2 class="carousel-title">25 Best Rated</h2>
                <CardRow :allMedia="[...allMedia]
                    .sort((a, b) => {
                        if (a.rating < b.rating) return 1
                        if (a.rating > b.rating) return -1
                        if (a.views < b.views) return 1
                        if (a.views > b.views) return -1
                        return 0;
                    })
                    .slice(0, 25)" />
            </div>
            <div>
                <div style="display: flex; justify-content: center; align-items: center; margin-top: 75px;">
                    <span style="font-size: 3rem; font-weight: 800;">All media</span>
                    <span style="font-size: 1rem; margin: 0px 0px 0px 10px; color: var(--text-color-2)">{{ allMedia.length
                    }}</span>
                </div>
                <div class="container-filtered-cards">
                    <div style="margin: 5px !important;"
                         v-for="media of lazyAllMedia">
                        <Card :shownMedia="media" />
                    </div>
                </div>
            </div>
        </div>
        <transition name="slide-down">
            <div v-if="searchbox !== ''"
                 class="search-results">
                <div style="display: flex; justify-content: center; align-items: center; margin-top: 75px;">
                    <span style="font-size: 3rem; font-weight: 800;">Search results</span>
                    <span style="font-size: 1rem; margin: 0px 0px 0px 10px; color: var(--text-color-2)">{{
                        filteredMedia.size }}</span>
                </div>
                <div class="container-filtered-cards">
                    <div style="margin: 5px !important;"
                         v-for="media of filteredMedia">
                        <Card :shownMedia="media" />
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<style scoped>
h2 {
    margin: 0;
    font-weight: 600;
}

.search-results {
    height: 97.5vh;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0px;
    overflow-x: hidden;
    overflow-y: scroll;
    padding-top: var(--navbar-height);
    z-index: 5;
    transition: top .5 ease;
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

.search-results::-webkit-scrollbar {
    display: none;
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

.carousel-title {
    margin: 40px 0 10px 0px;
    font-weight: 800;
    user-select: none;
}

.container-filtered-cards {
    display: flex;
    justify-content: center;
    width: 100%;
    flex-wrap: wrap;
}

.container {
    padding: 4vh 2vw;
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

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.slide-down-enter-active,
.slide-down-leave-active {
    transition: all 0.5s ease-in-out;
}

.slide-down-enter-from,
.slide-down-leave-to {
    opacity: 0;
    top: -100%;
}

@media screen and (max-width: 1100px) {
    iframe {
        height: 300%;
        width: 140%;
        left: -20%;
        top: -100%;
    }
}

@media screen and (max-width: 700px) {
    iframe {
        height: 300%;
        width: 200%;
        left: -50%;
        top: -100%;
    }

    .trailer-bullets {
        font-size: 40px;
    }

    .trailer-chevron {
        font-size: 24px;
    }

    .container-trailer {
        height: 40vh;
    }

    .trailer-name,
    .watch-now {
        font-size: var(--font-size-3);
    }

    .now-available {
        font-size: var(--font-size-4);
    }
}
</style>