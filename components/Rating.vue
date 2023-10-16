<script setup>
import { storeToRefs } from 'pinia';
import { useJwtStore } from '~/stores/jwtStore';
import { useMediaStore } from '~/stores/mediaStore';

const props = defineProps({
    media: {},
})

const jwtStore = useJwtStore()
const mediaStore = useMediaStore()

const { media } = storeToRefs(mediaStore)

const stars = ref([0, 1, 2, 3, 4])
const ratingElement = ref()
const config = useRuntimeConfig()

onMounted(() => {
    resetRating()
})

watch(media, (o, n) => {
    resetRating()
})

const addRating = (rating) => {
    fetch(`${config.public.baseURL}/media/${props.media.id}/rate`, {
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
            mediaStore.setMedia(props.media.id)
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

const resetRating = (e) => {
    const rating = props.media.ratings.reduce((acc, rating) => acc + rating.score, 0) / props.media.ratings.length / 2

    for (const element of ratingElement.value.children) {
        if (element.id < rating) element.style.color = "var(--primary-color-100)"
        else element.style.color = "white"
    }
}
</script>

<template>
    <div class="container-rating">
        <div @mouseover="hoverHandler" @mouseleave="resetRating" ref="ratingElement" class="container-stars">
            <template v-for="(id) in stars">
                <Icon class="star" @click="addRating((id + 1) * 2)" :id="id" name="mdi:star" />
            </template>
        </div>
        <span>• {{ media.ratings.length }}</span>
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