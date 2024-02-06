<script setup>
import { useMainStore } from "~/stores/mainStore";
import { storeToRefs } from 'pinia'

useHead({ title: "DellekesHub" })

const config = useRuntimeConfig()
const mainStore = useMainStore()

const { searchbox, showSearchBox } = storeToRefs(mainStore)

onBeforeMount(() => {
    if (process.client) {
        mainStore.setWatched()
        mainStore.setAllGenres()
    }
})

onBeforeUnmount(() => {
    if (process.client) {
        searchbox.value = ""
        showSearchBox.value = false
    }
})
</script>

<template>
    <div class="container">
        <span style="position: absolute; top: calc(var(--navbar-height) + 8px); color: var(--background-color-400);">Build:
            {{ config.public.build }}</span>
        <div v-show="searchbox === ''">
            <SplashContainer :supplier="(number, size) => mainStore.getMedia('', number, size)" />

        </div>
        <div v-show="searchbox === ''">
            <CardRow :supplier="(number, size) => mainStore.getMedia('recent-watched', number, size)"
                     :showLastVideo=true
                     title="Continue Watching" />
            <CardRow :supplier="(number, size) => mainStore.getMedia('recent-uploaded', number, size)"
                     :showLastVideo=false
                     title="Recently Uploaded" />
            <CardRow :supplier="(number, size) => mainStore.getMedia('last-watched', number, size)"
                     :showLastVideo=false
                     title="What others are watching" />
            <CardRow :supplier="() => mainStore.getRecommendations()"
                     :showLastVideo=false
                     :recommendations="true"
                     title="Tailored specifically to you" />
            <CardRow :supplier="(number, size) => mainStore.getMedia('most-watched', number, size)"
                     :showLastVideo=false
                     title="Most Viewed" />
            <CardRow :supplier="(number, size) => mainStore.getMedia('best-rated', number, size)"
                     :showLastVideo=false
                     title="Best Rated" />
            <CardContainer style="margin-top: 50px;"
                           :supplier="(number, size) => mainStore.getMedia('', number, size)"
                           title="All Media" />
        </div>
        <transition name="slide-down">
            <div v-if="searchbox !== ''"
                 class="search-results">
                <CardContainer style="margin-top: 50px;"
                               :supplier="(number, size, genres, search) => mainStore.getMedia('', number, size, { type: '', genres: genres, search: search })"
                               title="Search results" />
            </div>
        </transition>
    </div>
</template>

<style scoped>
/* .search-results {
    transition: top .5 ease;
} */

.search-results {
    width: 100%;
    position: absolute;
    top: 55px;
    left: 0px;
    transition: top .5 ease;
}

.search-results::-webkit-scrollbar {
    display: none;
}

.container {
    padding: 4vh 2vw;
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