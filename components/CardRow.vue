<script setup>
const props = defineProps({
    supplier: {
        default: () => Promise.resolve({ content: [] }),
        type: Function
    },
    title: {
        default: "Title undefined",
        type: String
    },
    showLastVideo: {
        default: false,
        type: Boolean
    }
})

const cardsElement = ref({})
const showButtons = ref(false)
const showLeftButton = ref(false)
const showRightButton = ref(false)
const allMedia = ref([])
const totalElements = ref(0)
let fetching = false
let totalPages = 0
let nextPage = 0

onBeforeMount(() => {
    fetchNextPage()
})

function fetchNextPage() {
    props.supplier(nextPage, 20).then(data => {
        allMedia.value.push(...data.content)
        totalElements.value = data.totalElements
        totalPages = data.totalPages
        nextPage++
        fetching = false
    })
}

function scrollHandler() {
    const cards = cardsElement.value.children
    const carouselRight = cardsElement.value.getBoundingClientRect().right

    if (cards[cards.length / 2].getBoundingClientRect().left < (carouselRight * 2) &&
        !fetching &&
        nextPage < totalPages) {
        fetching = true
        fetchNextPage()
    }
}

const nextCards = () => {
    const cards = cardsElement.value.children
    const carouselLeft = cardsElement.value.getBoundingClientRect().left
    const carouselRight = cardsElement.value.getBoundingClientRect().right

    for (let i = 0; i < cards.length; i++) {
        if (cards[i].getBoundingClientRect().right > carouselRight) {
            cardsElement.value.scrollLeft += cards[i].getBoundingClientRect().left - carouselLeft
            break
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
    if (cardsElement.value === null || cardsElement.value.children.length === 0) return

    showButtons.value = showButton
    showLeftButton.value = cardsElement.value.scrollLeft > 0
    showRightButton.value = cardsElement.value.getBoundingClientRect().right < cardsElement.value.children[cardsElement.value.children.length - 1].getBoundingClientRect().right - 10
}
</script>

<template>
    <div v-if="totalElements !== 0">
        <div class="container-title">
            <h2 class="carousel-title">{{ title }}</h2>
            <span class="carousel-title-count">{{ totalElements ?? allMedia.length }}</span>
        </div>
        <div @mouseover="hoverButtonHandler(true)"
             @mouseleave="hoverButtonHandler(false)"
             class="container-cards">
            <div v-if="showButtons && showLeftButton"
                 @click="previousCards()"
                 class="button left">
                <div class="background">
                    <Icon name="fa-solid:chevron-left"
                          class="icon" />
                </div>
            </div>
            <div ref="cardsElement"
                 class="carousel"
                 @scroll="scrollHandler()">
                <div class="media-card"
                     v-for="(media) of allMedia">
                    <Card :shownMedia="media"
                          :showLastVideo="showLastVideo ?? false" />
                </div>
            </div>
            <div v-if="showButtons && showRightButton"
                 @click="nextCards(1)"
                 class="button right">
                <div class="background">
                    <Icon name="fa-solid:chevron-right"
                          class="icon" />
                </div>
            </div>
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

.container-title {
    margin: 40px 0 10px 0px;
    display: flex;
    user-select: none;
    align-items: center;
}

.carousel-title {
    margin: 0 8px 0 0;
    font-weight: 800;
}

.carousel-title-count {
    font-weight: 400;
    color: var(--text-color-2);
}

.container-cards {
    position: relative;
    overflow: hidden;
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

.background {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 100px;
    height: 50px;
    width: 50px;
    background-color: var(--background-color-100);
}

.button {
    position: absolute;
    z-index: 11;
    top: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.button:hover {
    cursor: pointer;
}

.left {
    border-radius: var(--border-radius-1) 0px 0px var(--border-radius-1);
    left: 5px;
}

.right {
    border-radius: 0px var(--border-radius-1) var(--border-radius-1) 0px;
    right: 5px;
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