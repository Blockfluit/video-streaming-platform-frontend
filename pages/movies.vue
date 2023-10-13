<script setup>
import { storeToRefs } from "pinia";
import { useMainStore } from "~/stores/mainStore";

definePageMeta({
    layout: "main",
});

const mainStore = useMainStore()

const { allMedia, searchbox, allGenres } = storeToRefs(mainStore)

const allMovies = ref([])
const filteredMedia = ref([])
const filters = ref([])

const doFilter = (genre) => {
    filteredMedia.value = allMovies.value

    if (genre !== undefined) {
        const index = filters.value.findIndex(entry => entry === genre)

        index === -1 ?
            filters.value.push(genre) :
            filters.value.splice(index, 1)
    }

    for (const entry of filters.value) {
        filteredMedia.value = filteredMedia.value.filter(media => media.genre.includes(entry))
        // filter searchbox
    }
}

onBeforeMount(() => {
    mainStore.setAllMedia()
    mainStore.setWatched()
    mainStore.setAllGenres()
})

watch(allMedia, (o, n) => {
    allMovies.value = allMedia.value.filter(media => media["type"] === "MOVIE")
})

watch(searchbox, (o, n) => {
    doFilter()
})
</script>

<template>
    <div class="container">
        <div class="container-filter">
            <span v-for="genre in allGenres" class="filter"
                :style="filters.includes(genre.name) ? 'color: var(--primary-color-100)' : 'color: white'"
                @click="doFilter(genre.name)">{{
                    genre.name }}</span>
        </div>
        <div v-if="filters.length === 0 && searchbox === ''" class="container-cards">
            <h1>{{ searchbox }}</h1>
            <h2 style="margin: 30px 6px 10px 0px">Continue Watching</h2>
            <CardRow
                :allMedia="mainStore.getAllMovies.filter(media => mainStore.watched.map(entry => entry.mediaId).includes(media.id))"
                :showLastVideo=true>
            </CardRow>
            <h2 style="margin: 30px 6px 10px 0px">Recently uploaded</h2>
            <CardRow :allMedia="mainStore.getAllMovies.filter(media => new Date().setDate(new Date(media.updatedAt).getDate() + 7) > new Date())
                .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))">
            </CardRow>
            <h2 style="margin: 30px 6px 10px 0px">Most Popular</h2>
            <CardRow :allMedia="[...mainStore.getAllMovies]"></CardRow>
            <h2 style="margin: 30px 6px 10px 0px">Popular</h2>
            <CardRow :allMedia="[...mainStore.getAllMovies]"></CardRow>
        </div>
        <div v-if="filters.length > 0" class="container-cards">
            <h2 style="margin: 30px 6px 10px 0px">Filtered</h2>
            <div class="container-filtered-cards">
                <Card v-for="(media) of filteredMedia" :shownMedia="media" />
            </div>
        </div>
    </div>
</template>

<style scoped>
h2 {
    font-weight: 600;
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
    flex-direction: row;
}

.filter-card {
    margin-right: 10px !important;
}

.filter {
    -webkit-user-select: none;
    -ms-user-select: none;
    user-select: none;
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