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

const showReviewButtons = (username) => {
    return username === jwtStore.getSubject || jwtStore.getRole == "ADMIN"
}

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
        <span>Reviews</span>
        <form v-if="jwtStore.getRole !== 'USER'" @submit.prevent="addReview(review)">
            <input v-model="review" placeholder="Write a review" type="text">
            <button type="submit">Post your review</button>
        </form>
        <div v-for="review in reviews" class="container-review">
            <div style="display: flex; align-items: center;">
                <p style="font-weight: 700;">{{ review.user.username }} {{ new Date(review.updatedAt).toLocaleDateString() }}</p>
                <Icon v-if="showReviewButtons(review.user.username)" class="icon" name="mdi:pencil" />
                <Icon v-if="showReviewButtons(review.user.username)" class="icon" @click="deleteReview(review.id)" name="material-symbols:delete"></Icon>
            </div>
            <p>{{ review.comment }}</p>
        </div>
    </div>
</template>

<style scoped>
span {
    font-size: 2rem;
    font-weight: 600;
}
.icon {
    min-height: 25px;
    min-width: 25px;
    margin-left: 15px;
}
.icon:hover {
    cursor: pointer;
    color: var(--primary-color-100);
}
form {
    display: flex;
    justify-content: center;
    align-items: center;
}
.container-review {
    border: 1px solid white;
    border-radius: 15px;
    padding: 5px 20px;
    margin-bottom: 20px;
}
input {
    border: 1px solid white;
    border-radius: 15px;
    padding-left: 20px;
    width: 100%;
    height: 40px;
    white-space: wrap;
    
}
button {
    margin: 10px;
    background-color: white;
    border: none;
    border-radius: 15px;
    padding: 10px 20px;
    font-family: var(--font-family-1);
    font-weight: 600;
    color: var(--background-color-100)
}
button:hover {
    cursor: pointer;
    background-color: var(--primary-color-100);
}
</style>