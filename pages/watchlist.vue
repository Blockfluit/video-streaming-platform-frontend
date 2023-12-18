<script setup>
import { storeToRefs } from 'pinia';
import { useWatchlistStore } from '~/stores/watchlistStore';

const watchlistStore = useWatchlistStore()

const { watchlist } = storeToRefs(watchlistStore)

onMounted(() => {
    watchlistStore.setWatchlist()
})
</script>

<template>
    <div class="container">
        <div style="display: flex; justify-content: center; align-items: center; margin-top: 10px;">
            <span style="font-size: 3rem; font-weight: 800;">Watchlist</span>
            <span style="font-size: 1rem; margin: 0px 0px 0px 10px; color: var(--text-color-2)">{{
                watchlist.length }}</span>
        </div>
        <ul>
            <li v-for="media in watchlist">
                <Card :shownMedia="media" />
            </li>
        </ul>
    </div>
</template>

<style scoped>
.container {
    padding: 2vh 2vw;
}

h1 {
    text-align: center;
    font-weight: 800;
    user-select: none;
}

ul {
    list-style-type: none;
    display: flex;
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
    padding: 0;
}

li {
    margin: 5px
}
</style>