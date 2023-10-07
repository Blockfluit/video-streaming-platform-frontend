<script setup>
const props = defineProps({
    allMedia: {},
    showLastVideo: false
})

const config = useRuntimeConfig()
const cardsElement = ref(null)
const showButtons = ref(false)

const nextCards = () => {
    const cards = cardsElement.value.children
    const carouselLeft = cardsElement.value.getBoundingClientRect().left
    const carouselRight = cardsElement.value.getBoundingClientRect().right

    for (let i = 0; i < cards.length; i++) {
        if (cards[i].getBoundingClientRect().right > carouselRight) {
            cardsElement.value.scrollLeft += cards[i].getBoundingClientRect().left - carouselLeft
            return
        }
    }
}

const previousCards = () => {
    const cards = cardsElement.value.children
    const carouselLeft = cardsElement.value.getBoundingClientRect().left
    const carouselWidth = cardsElement.value.getBoundingClientRect().width
    const cardWidth = cardsElement.value.children[0].getBoundingClientRect().width
    const widthInCard = Math.floor(carouselWidth / cardWidth)

    for (let i = 0; i < cards.length; i++) {
        if (Math.abs((cards[i].getBoundingClientRect().left) + (cardWidth / 2)) < (cardWidth / 2)) {
            if (i - widthInCard < 0) {
                cardsElement.value.scrollLeft = 0
                return
            }
            cardsElement.value.scrollLeft += cards[i - widthInCard + 1].getBoundingClientRect().left - carouselLeft
            return
        }
    }
}
</script>

<template>
    <div @mouseover="showButtons = true" @mouseleave="showButtons = false" class="container-cards">
        <div v-if="showButtons" @click="previousCards()" class="button left" style="left: 0;">
            <Icon name="fa-solid:chevron-left" />
        </div>
        <div ref="cardsElement" class="carousel">
            <div class="media-card" v-for="(media) of allMedia">
                <Card :media="media" :showLastVideo="showLastVideo ?? false" />
            </div>
        </div>
        <div v-if="showButtons" @click="nextCards(1)" class="button right" style="right: 0;">
            <Icon name="fa-solid:chevron-right" />
        </div>
    </div>
</template>

<style scoped>
.media-card {
    margin-right: 10px;
}
.media-card:last-child {
    margin-right: 0px;
}
.container-cards {
    position: relative;
}

.carousel {
    scroll-behavior: smooth;
    position: relative;
    display: flex;
    flex-direction: row;
    overflow: hidden;
}
.carousel::-webkit-scrollbar {
    height: 0;
    width: 0;
}

.button {
    position: absolute;
    z-index: 11;
    top: 0;
    height: 100%;
    width: 40px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.8);
    
}
.button:hover {
    cursor: pointer;
}

.left {
    border-radius: 14px 0px 0px 14px;
}

.right {
    border-radius: 0px 14px 14px 0px;
}

@media screen  and (max-width: 992px){
    .carousel {
        overflow-x: scroll;
    }
    .carousel::-webkit-scrollbar {
        padding-top: 5px;
        height: 5px;
        width: 5px;
    }
    .media-card {
        margin-right: 10px;
        margin-bottom: 10px;
    }
    .left {
        display: none;
    }

    .right {
        display: none;
    }
}
</style>