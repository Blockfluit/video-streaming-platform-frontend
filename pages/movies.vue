<script setup>
import { storeToRefs } from "pinia";
import { useMainStore } from "~/stores/mainStore";

definePageMeta({
    layout: "main",
});

const mainStore = useMainStore()

const { allMedia, searchbox } = storeToRefs(mainStore)

const allMovies = ref([])
const showFilteredMedia = ref(false)
const filteredMedia = ref([])
const activeFilters = ref(new Set())

const filters = []

const toggleFilter = (filter, id) => {
    activeFilters.value.has(id) ?
        activeFilters.value.delete(id) :
        activeFilters.value.add(id)


    const index = filters.findIndex(entry => entry.toString() === filter.toString())

    index === -1 ?
        filters.push(filter) :
        filters.splice(index, 1)

    filterChain()
}

const filterChain = () => {
    filteredMedia.value = allMovies.value

    for (const filter of filters) {
        filteredMedia.value = filter(filteredMedia.value)
    }

    filteredMedia.value = filteredMedia.value.filter(media => media.name.includes(searchbox.value))

    showFilteredMedia.value = (filters.length !== 0 || searchbox.value !== "")
}

onBeforeMount(() => {
    mainStore.setAllMedia()
    mainStore.setWatched()
})

watch(allMedia, (o, n) => {
    allMovies.value = allMedia.value.filter(media => media["type"] === "MOVIE")
})

watch(searchbox, (o, n) => {
    filterChain()
})
</script>

<template>
        <div class="container">
            <div class="container-filter">
                <span class="filter" :style="activeFilters.has(1) ? 'color: var(--primary-color-100)' : 'color: white'"
                    @click="toggleFilter((entries) => entries.filter(entry => entry.genre.includes('comedy')), 1)">comedy</span>
                <span class="filter" :style="activeFilters.has(2) ? 'color: var(--primary-color-100)' : 'color: white'"
                    @click="toggleFilter((entries) => entries.filter(entry => entry.genre.includes('action')), 2)">action</span>
            </div>
            <div v-if="!showFilteredMedia" class="container-cards">
                <h1>{{ searchbox }}</h1>
                <h2 style="margin: 30px 6px 10px 0px">Continue Watching</h2>
                <CardRow
                    :allMedia="allMovies.filter(media => mainStore.watched.map(entry => entry.mediaId).includes(media.id))"
                    :showLastVideo=true>
                </CardRow>
                <h2 style="margin: 30px 6px 10px 0px">Recently uploaded</h2>
                <CardRow
                    :allMedia="allMovies.filter(media => new Date(media.updatedAt) < new Date(Date.now() + 1000 * 60 * 60 * 24 * 7))">
                </CardRow>
                <h2 style="margin: 30px 6px 10px 0px">Most Popular</h2>
                <CardRow :allMedia="allMovies"></CardRow>
                <h2 style="margin: 30px 6px 10px 0px">Popular</h2>
                <CardRow :allMedia="allMovies"></CardRow>
            </div>
            <div v-if="showFilteredMedia" class="container-cards">
                <h2 style="margin: 30px 6px 10px 0px">Filtered</h2>
                <div class="container-filtered-cards">
                    <Card v-for="(media) of filteredMedia" :media="media" />
                </div>
            </div>
        </div>
</template>

<style scoped>
h2 {
    font-weight: 600;
}
.filter-card {
    margin-right: 10px !important;
}
.container {
    padding: 2vh 2vw;
}

.container-filter {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;

}

.container-filter span {
    margin: 10px;
}

.container-filtered-cards {
    display: flex;
    flex-direction: row;
}

.filter:hover {
    cursor: pointer;
    color: var(--primary-color-100);
}
</style>