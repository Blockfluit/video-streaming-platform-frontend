<script setup>
import { useMainStore } from "~/stores/mainStore";
import { storeToRefs } from "pinia";

definePageMeta({
    layout: "main",
});

const mainStore = useMainStore()

const { allMedia, searchbox, allGenres } = storeToRefs(mainStore)

const allSeries = ref([])
const filteredMedia = ref([])
const filters = ref([])
const filterElement = ref()

function scrollHorizontal(e) {
    e.preventDefault();
    filterElement.value.scrollLeft += e.deltaY;
}

const doFilter = (genre) => {
    filteredMedia.value = allSeries.value

    if (genre !== undefined) {
        const index = filters.value.findIndex(entry => entry === genre)

        index === -1 ?
            filters.value.push(genre) :
            filters.value.splice(index, 1)
    }

    for (const entry of filters.value) {
        filteredMedia.value = filteredMedia.value.filter(media => media.genre.includes(entry))
    }

    if (searchbox.value !== "") {
        filteredMedia.value = filteredMedia.value.filter(media => media.name.toLowerCase().includes(searchbox.value.toLowerCase()))
    }
}

onBeforeMount(() => {
    mainStore.setAllMedia()
    mainStore.setWatched()
    mainStore.setAllGenres()
})

watch(allMedia, (o, n) => {
    allSeries.value = allMedia.value.filter(media => media["type"] === "SERIES")
    doFilter()
})

watch(searchbox, (o, n) => {
    doFilter()
})
</script>

<template>
    <div class="container">
        <div @wheel="scrollHorizontal" class="container-filter" ref="filterElement">
            <span v-for="(genre) in allGenres" class="filter"
                :style="filters.includes(genre.name) ? 'color: var(--primary-color-100)' : 'color: white'"
                @click="doFilter(genre.name)">{{
                    genre.name }}</span>
        </div>
        <div v-if="filters.length === 0 && searchbox === ''" class="container-cards">
            <div
                :set="media = mainStore.getAllSeries.filter(media => mainStore.watched.map(entry => entry.mediaId).includes(media.id))">
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
        <div class="container-cards">
            <h2 class="carousel-title">{{ (filters.length === 0 && searchbox === '') ? "All Series" : "Filtered Series" }}</h2>
            <div class="container-filtered-cards">
                <div style="margin: 10px 10px 0px 0px !important;" v-for="(media) of filteredMedia">
                    <Card :shownMedia="media" />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
h2 {
    font-weight: 600;
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
}

.filter:hover {
    cursor: pointer;
    color: var(--primary-color-100);
}
</style>