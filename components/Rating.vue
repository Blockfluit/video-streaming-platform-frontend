<script setup>
import { useJwtStore } from '~/stores/jwtStore';
import { useMediaStore } from '~/stores/mediaStore';

const props = defineProps({
    media: {
        type: Object
    },
    average: {
        default: true,
        type: Boolean
    }
})

const jwtStore = useJwtStore()
const mediaStore = useMediaStore()

const ratingElement = ref()
const config = useRuntimeConfig()

watch(props, (n, o) => {
    resetRating()
})

const addRating = (rating) => {
    fetch(`${config.public.baseURL}/media/${props.media?.id}/rate`, {
        method: "POST",
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${jwtStore.getJwt}`
        },
        body: JSON.stringify({
            rating: rating,
        })
    }).then((response) => {
        if (response.status >= 200 && response.status < 300) {
            mediaStore.setMedia(props.media?.id)
            return
        }
    }).catch(e => {
        console.log(e)
    })
}

const hoverHandler = (e) => {
    const id = e.target.id

    if (id === "") return
    for (const element of ratingElement.value.children) {
        if (element.id < id + 1) element.style.color = "var(--primary-color-100)"
        else element.style.color = "white"
    }
}

function resetRating() {
    const user = props.media?.ratings.find(entry => entry.username === jwtStore.getSubject)
    const userRating = user?.score ?? 0

    const rating = props.average ?
        Math.floor(props.media?.avgRating / 2) :
        userRating / 2

    for (const element of ratingElement.value.children) {
        if (element.id < rating) element.style.color = "var(--primary-color-100)"
        else element.style.color = "white"
    }
}
</script>

<template>
    <div class="container-rating">
        <div @mouseover="hoverHandler"
             @mouseleave="resetRating"
             ref="ratingElement"
             class="container-stars">
            <template v-for="(id) in 5">
                <Icon class="star"
                      @click="addRating((id) * 2)"
                      :id="id - 1"
                      name="mdi:star" />
            </template>
        </div>
    </div>
</template>

<style scoped>
svg {
    min-width: 25px;
    min-height: 25px;
}

.container-rating {
    display: flex;
    flex-direction: row;
    align-items: center;
}

.star:hover {
    cursor: pointer;
}

.container-stars {
    z-index: 20;
    display: flex;
    flex-direction: row;
    pointer-events: all;
}
</style>