<script setup>
const props = defineProps({
    allMedia: {},
    showLastVideo: false
})

const config = useRuntimeConfig()
const cardsElement = ref(null)

const handleScroll = (e) => {
    e.preventDefault()
    cardsElement.value.scrollLeft += e.deltaY
}
</script>

<template>
    <div @wheel="handleScroll" ref="cardsElement" class="container-cards">
        <Card v-for="(media) of allMedia" :media="media" :showLastVideo="showLastVideo ?? false" />
    </div>
</template>

<style scoped>
.container-cards {
    display: flex;
    flex-direction: row;
    overflow-x: scroll;
    overflow-y: hidden;
}
</style>