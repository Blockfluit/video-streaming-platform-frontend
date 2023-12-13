<script setup>
import { storeToRefs } from 'pinia';
import { useWatchlistStore } from '~/stores/watchlistStore';
import { useMainStore } from '~/stores/mainStore';

const watchlistStore = useWatchlistStore()
const mainStore = useMainStore()

const { watchlist } = storeToRefs(watchlistStore)

const tempWatchlist = new Set()

/*
This page needs rework 
when api is reworked.
*/

onMounted(() => {
    watchlistStore.setWatchlist()
})

watch(watchlist, (n, o) => {
    tempWatchlist.clear()
    n.forEach(entry => {
       const media = mainStore.allMedia.find(media => media.id === entry.MediaId) 
       tempWatchlist.add(media)
    })
})
</script>

<template>
    <div>
        <h1>watchlist</h1>
        <ul>
            <li v-for="media in tempWatchlist">
                <Card :shownMedia="media" />
            </li>
        </ul>
    </div>
</template>

<style scoped>
</style>