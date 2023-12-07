<script setup>
import { useMainStore } from "~/stores/mainStore";
import { storeToRefs } from "pinia";

definePageMeta({
    layout: "main",
});

const mainStore = useMainStore()

const { allMedia, searchbox, allGenres, watched, allSeries } = storeToRefs(mainStore)

const filteredMedia = ref(new Set())
const filters = ref([])
const filterElement = ref()
const lazyAllSeries = ref([])
const recentWatched = ref([])
const recentUploaded = ref([])

onBeforeMount(() => {
    mainStore.setAllMedia()
    mainStore.setWatched()
    mainStore.setAllGenres()
})

onMounted(() => {
    setRecentWatched()
    setRecentUploaded()
    lazyAllSeries.value = [...allSeries.value.slice(0, 50)]

    window.addEventListener("scroll", addMediaOnScroll)
})

onBeforeUnmount(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
})

onUnmounted(() => {
    window.removeEventListener("scroll", addMediaOnScroll)
})

watch(allMedia, () => {
    doFilter()
})

watch(filters, () => {
    doFilter()
})

watch(searchbox, () => {
    doFilter()
})

function scrollHorizontal(e) {
    e.preventDefault();
    filterElement.value.scrollLeft += e.deltaY;
}

function addMediaOnScroll() {
    const showAmount = ((document.body.getBoundingClientRect().top * -1) + document.body.clientHeight) / document.body.scrollHeight * allMedia.value.length
    if (showAmount > lazyAllSeries.value.length) {
        lazyAllSeries.value.push(...allSeries.value.slice(lazyAllSeries.value.length, showAmount))
    }
}

async function setRecentWatched() {
    recentWatched.value = allSeries.value
        .filter(media => watched.value.map(entry => entry.mediaId).includes(media.id))
        .filter(media => {
            const a = watched.value.find(entry => entry.mediaId === media.id)
            return (a.timestamp / a.duration) < 0.99
        })
        .sort((a, b) => new Date(watched.value.filter(entry => entry.mediaId === b.id).sort((a, b) => new Date(b.updatedAt) -
            new Date(a.updatedAt))[0].updatedAt) - new Date(watched.value.filter(entry => entry.mediaId === a.id).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0].updatedAt))
}

async function setRecentUploaded() {
    recentUploaded.value = allSeries.value.filter(media => new Date(media.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
}

// Needs refactoring (Maybe split up in multiple async functions). Probably the cause of lag when searching for an entry. 
async function doFilter() {
    filteredMedia.value.clear()

    for (const entry of filters.value) {
        allSeries.value.filter(media => media.genre.includes(entry))
            .forEach(media => filteredMedia.value.add(media))
    }

    if (searchbox.value !== "") {
        if (filteredMedia.value.size === 0) {
            allSeries.value.filter(media => media.name.toLowerCase().includes(searchbox.value.toLowerCase()))
                .forEach(media => filteredMedia.value.add(media))
        } else {
            const tempFiltered = [...filteredMedia.value].filter(media => media.name.toLowerCase().includes(searchbox.value.toLowerCase()))
            filteredMedia.value.clear()
            tempFiltered.forEach(media => filteredMedia.value.add(media))
        }
    }

    if (searchbox.value === "" &&
        filters.value.length === 0) {
        [...allSeries.value].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .forEach(media => filteredMedia.value.add(media))
    }
}
</script>

<template>
    <div class="container">
        <div @wheel="scrollHorizontal"
             class="container-filter"
             ref="filterElement">
            <template v-for="(genre, index) in allGenres">
                <input type="checkbox"
                       :id="index"
                       :value="genre"
                       v-model="filters"
                       style="display: none;">
                <label :for="index"
                       :style="filters.includes(genre) ? 'color: var(--primary-color-200)' : 'color: white'"
                       class="filter">{{ genre
                       }}</label>
            </template>
        </div>
        <div v-if="filters.length === 0 && searchbox === ''">
            <div v-if="recentWatched.length > 0">
                <h2 class="carousel-title">Continue Watching</h2>
                <CardRow :allMedia="recentWatched"
                         :showLastVideo=true />
            </div>
            <div v-if="recentUploaded.length > 0">
                <h2 class="carousel-title">Recently uploaded</h2>
                <CardRow :allMedia="recentUploaded" />
            </div>
            <div>
                <h2 class="carousel-title">25 Most Viewed</h2>
                <CardRow :allMedia="[...allSeries].sort((a, b) => b.views - a.views).slice(0, 25)" />
            </div>
            <div>
                <div style="display: flex; justify-content: center; align-items: center; margin-top: 75px;">
                    <span style="font-size: 3rem; font-weight: 800;">All series</span>
                    <span style="font-size: 1rem; margin: 0px 0px 0px 10px; color: var(--text-color-2)">{{
                        allSeries.length
                    }}</span>
                </div>
                <div class="container-filtered-cards">
                    <div style="margin: 5px !important;"
                         v-for="media of lazyAllSeries">
                        <Card :shownMedia="media" />
                    </div>
                </div>
            </div>
        </div>
        <transition name="slide-down">
            <div v-if="searchbox !== '' || filters.length > 0"
                 class="search-results">
                <div style="display: flex; justify-content: center; align-items: center; margin-top: 75px;">
                    <span style="font-size: 3rem; font-weight: 800;">Serie results</span>
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
    font-weight: 600;
}

.search-results {
    height: 85vh;
    width: 100%;
    position: absolute;
    top: 55px;
    left: 0px;
    overflow-x: hidden;
    overflow-y: scroll;
    margin-top: 60px;
    background-color: var(--background-color-200);
    z-index: 5;
    transition: top .5 ease;
}

.search-results::-webkit-scrollbar {
    display: none;
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

.carousel-title {
    margin: 40px 0 10px 0px;
    font-weight: 800;
    user-select: none;
}

.container {
    padding: 2vh 2vw;
}

.container-filter {
    width: 100%;
    display: flex;
    flex-direction: row;
    overflow-y: hidden;
    overflow-X: scroll;
}

.container-filter span {
    margin: 10px;
}

.container-filtered-cards {
    display: flex;
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
}

.filter-card {
    margin-right: 10px !important;
}

.filter {
    text-transform: capitalize;
    -webkit-user-select: none;
    -ms-user-select: none;
    user-select: none;
    margin: 0 6px 4px 6px;
    word-break: keep-all;
    white-space: nowrap;
}

.filter:hover {
    cursor: pointer;
    color: var(--primary-color-100);
}

@media screen and (max-width: 700px) {
    .container-filter::-webkit-scrollbar {
        display: none;
    }
}
</style>