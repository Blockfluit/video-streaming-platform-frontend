<script setup>
const props = defineProps({
    allMedia: {},
    showLastVideo: false
})

const cardsElement = ref({})
const showButtons = ref(false)
const showLeftButton = ref(false)
const showRightButton = ref(false)

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
    const widthInCards = Math.floor(carouselWidth / cardWidth)

    for (let i = 0; i < cards.length; i++) {
        if (Math.abs((cards[i].getBoundingClientRect().left) + (cardWidth / 2)) < (cardWidth / 2)) {
            if (i - widthInCards < 0) {
                cardsElement.value.scrollLeft = 0
                return
            }
            cardsElement.value.scrollLeft += cards[i - widthInCards + 1].getBoundingClientRect().left - carouselLeft
            return
        }
    }
}

const hoverButtonHandler = (showButton) => {
    showButtons.value = showButton
    showLeftButton.value = cardsElement.value.scrollLeft > 0
    showRightButton.value = cardsElement.value.getBoundingClientRect().right < cardsElement.value.children[cardsElement.value.children.length - 1].getBoundingClientRect().right - 10
}
</script>

<template>
    <div @mouseover="hoverButtonHandler(true)" @mouseleave="hoverButtonHandler(false)" class="container-cards">
        <div v-if="showButtons && showLeftButton" @click="previousCards()" class="button left" style="left: 0;">
            <Icon name="fa-solid:chevron-left" />
        </div>
        <div ref="cardsElement" class="carousel">
            <div class="media-card" v-for="(media) of allMedia">
                <Card :shownMedia="media" :showLastVideo="showLastVideo ?? false" />
            </div>
        </div>
        <div v-if="showButtons && showRightButton" @click="nextCards(1)" class="button right" style="right: 0;">
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
    border-radius: var(--border-radius-1) 0px 0px var(--border-radius-1);
}

.right {
    border-radius: 0px var(--border-radius-1) var(--border-radius-1) 0px;
}

@media screen and (max-width: 992px) {
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