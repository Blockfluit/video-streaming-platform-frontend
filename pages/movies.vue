<script setup>
import { storeToRefs } from "pinia";
import { useMainStore } from "~/stores/mainStore";

const mainStore = useMainStore()
const filterElement = ref()

const { searchbox, showSearchBox, allGenres, selectedGenres } = storeToRefs(mainStore)

function scrollHorizontal(e) {
    e.preventDefault();
    filterElement.value.scrollLeft += e.deltaY;
}

onBeforeMount(() => {
    if (process.client) {
        mainStore.setWatched()
        mainStore.setAllGenres()
    }
})

onBeforeUnmount(() => {
    if (process.client) {
        allGenres.value.splice(0, allGenres.value.length)
        searchbox.value = ""
        showSearchBox.value = false
    }
})
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
                       v-model="selectedGenres"
                       style="display: none;">
                <label :for="index"
                       :style="selectedGenres.includes(genre) ? 'color: var(--primary-color-200)' : 'color: white'"
                       class="filter">{{ genre }}</label>
            </template>
        </div>
        <div v-show="selectedGenres.length === 0 && searchbox === ''">
            <CardRow :supplier="(number, size) => mainStore.getMedia('recent-watched', number, size, { type: 'MOVIE' })"
                     :showLastVideo=true
                     title="Continue Watching" />
            <CardRow :supplier="(number, size) => mainStore.getMedia('recent-uploaded', number, size, { type: 'MOVIE' })"
                     :showLastVideo=false
                     title="Recently Uploaded" />
            <CardRow :supplier="(number, size) => mainStore.getMedia('best-rated', number, size, { type: 'MOVIE' })"
                     :showLastVideo=false
                     title="Best Rated" />
            <CardContainer style="margin-top: 50px;"
                           :supplier="(number, size) => mainStore.getMedia('', number, size, { type: 'MOVIE' })"
                           title="All Movies" />
        </div>

        <transition name="slide-down">
            <div v-if="searchbox !== '' || selectedGenres.length > 0"
                 class="search-results">
                <CardContainer :supplier="(number, size, genres, search) => mainStore.getMedia('', number, size, { type: '', genres: genres, search: search })"
                               title="Search results" />
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
    height: 85vh;
    width: 100%;
    position: absolute;
    top: var(--navbar-height * 1);
    left: 0px;
    margin-top: 30px;
    /* transition: top .5 ease; */
}

.search-results::-webkit-scrollbar {
    display: none;
}

.slide-down-enter-active,
.slide-down-leave-active {
    /* transition: all 0.5s ease-in-out; */
}

.slide-down-enter-from,
.slide-down-leave-to {
    opacity: 0;
    top: -100%;
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

.container-filter::-webkit-scrollbar {
    display: none;
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
</style>