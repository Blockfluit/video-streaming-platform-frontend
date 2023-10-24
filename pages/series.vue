<script setup>
import { useMainStore } from "~/stores/mainStore";
import { storeToRefs } from "pinia";

definePageMeta({
    layout: "main",
});

const mainStore = useMainStore()

const { allMedia, searchbox, allGenres, watched } = storeToRefs(mainStore)

const allSeries = ref([])
const filteredMedia = ref(new Set())
const filters = ref([])
const filterElement = ref()

onBeforeMount(() => {
    mainStore.setAllMedia()
    mainStore.setWatched()
    mainStore.setAllGenres()
})

watch(allMedia, (o, n) => {
    allSeries.value = allMedia.value.filter(media => media["type"] === "SERIES")
    doFilter()
})

watch(filters, (o, n) => {
    doFilter()
})

watch(searchbox, (o, n) => {
    doFilter()
})

function scrollHorizontal(e) {
    e.preventDefault();
    filterElement.value.scrollLeft += e.deltaY;
}


const doFilter = () => {
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
        <div @wheel="scrollHorizontal" class="container-filter" ref="filterElement">
            <template v-for="(genre, index) in allGenres">
                <input type="checkbox" :id="index" :value="genre.name" v-model="filters" style="display: none;">
                <label :for="index"
                    :style="filters.includes(genre.name) ? 'color: var(--primary-color-200)' : 'color: white'"
                    class="filter">{{ genre.name
                    }}</label>
            </template>
        </div>
        <div v-if="filters.length === 0 && searchbox === ''">
            <!-- This monstrosity of a filter filters all watched media and sort them based on what was watched most recently -->
            <div
                :set="media = mainStore.getAllSeries.filter(media => watched.map(entry => entry.mediaId).includes(media.id))
                    .sort((a, b) => new Date(watched.filter(entry => entry.mediaId === b.id).sort((a, b) => new Date(b.updatedAt) -
                        new Date(a.updatedAt))[0].updatedAt) - new Date(watched.filter(entry => entry.mediaId === a.id).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0].updatedAt))">
                <h2 v-if="media.length > 0" class="carousel-title">Continue Watching</h2>
                <CardRow :allMedia="media" :showLastVideo=true />
            </div>
            <div :set="media = mainStore.getAllSeries.filter(media => new Date().setDate(new Date(media.updatedAt).getDate() + 7) > new Date())
                .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))">
                <h2 v-if="media.length > 0" class="carousel-title">Recently uploaded</h2>
                <CardRow :allMedia="media" />
            </div>
            <div>
                <h2 class="carousel-title">25 Most Popular</h2>
                <CardRow :allMedia="[...mainStore.getAllSeries].sort((a, b) => b.views - a.views).slice(0, 25)" />
            </div>
            <!-- <div>
                <h2 class="carousel-title">Popular</h2>
                <CardRow :allMedia="[...mainStore.getAllSeries]" />
            </div> -->
        </div>
        <transition name="slide-down">
            <div v-if="searchbox !== ''" class="search-results">
                <h2 class="carousel-title" style="display: flex; justify-content: center;">Search results
                </h2>
                <div class="container-filtered-cards">
                    <div style="margin: 5px !important;" v-for="(media) of filteredMedia">
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
.search-results  {
    height: 85vh;
    width: 100%;
    position:absolute;
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
    margin: 40px 0 10px 6px
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