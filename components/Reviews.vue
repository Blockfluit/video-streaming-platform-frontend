<script setup>
import { storeToRefs } from 'pinia';
import { useJwtStore } from '~/stores/jwtStore';
import { useMediaStore } from '~/stores/mediaStore';

const props = defineProps({
    media: {},
})

const config = useRuntimeConfig()

const jwtStore = useJwtStore()
const mediaStore = useMediaStore()

const { media } = storeToRefs(mediaStore)
const reviews = ref(props.media.reviews)
const review = ref()

watch(media, (o, n) => {
    reviews.value = media.value.reviews
})

const addReview = (review) => {
    fetch(`${config.public.baseURL}/media/${props.media.id}/review`, {
        method: "POST",
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${jwtStore.getJwt}`
        },
        body: JSON.stringify({
            comment: review,
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

const updateReview = (id, review) => {
    fetch(`${config.public.baseURL}/media/${props.media.id}/review`, {
        method: "PATCH",
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${jwtStore.getJwt}`
        },
        body: JSON.stringify({
            id: id,
            comment: review,
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

const deleteReview = (id) => {
    if (!confirm("Are you sure you want to delete this review?")) return

    fetch(`${config.public.baseURL}/media/${props.media.id}/review`, {
        method: "DELETE",
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${jwtStore.getJwt}`
        },
        body: JSON.stringify({
            id: id,
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
</script>

<template>
    <div>
        <form @submit.prevent="addReview(review)">
            <input v-model="review" placeholder="Write a review" type="text">
            <button type="submit">Add Review</button>
        </form>
        <div v-for="review in reviews" class="container-review">
            <h2>{{ review.user.username }} {{ new Date(review.updatedAt).toLocaleDateString() }}</h2>
            <p>{{ review.comment }}</p>
            <Icon name="mdi:pencil" />
            <Icon @click="deleteReview(review.id)" name="material-symbols:delete"></Icon>
        </div>
    </div>
</template>

<style scoped>
.container-review {
    margin: 30px;
    border: 1px solid white;
}
</style>