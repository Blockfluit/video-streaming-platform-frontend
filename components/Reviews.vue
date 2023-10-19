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
const toggleEdit = ref([])
const comment = ref()

watch(media, (o, n) => {
    reviews.value = [...media.value.reviews].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
})

const showReviewButtons = (username) => {
    return username === jwtStore.getSubject || jwtStore.getRole == "ADMIN"
}

onMounted(() => {
    for (let i = 0; reviews.value.length > i; i++) {
        toggleEdit.value.push(false)
    }
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
        <span>Reviews</span>
        <form v-if="jwtStore.getRole !== 'USER'" @submit.prevent="addReview(review)">
            <input v-model="review" placeholder="Write a review..." type="text">
            <button style="min-width: 150px;" type="submit">Post your review</button>
        </form>
        <ul class="scroll-container">
            <div v-for="(review, index) in reviews" class="container-review">
                <div class="review-header">

                    <p style="font-weight: 700; display: flex; align-items: center;">{{ review.user.username }}
                    <p class="review-date">{{ new Date(review.updatedAt).toLocaleDateString()
                    }}</p>
                    </p>

                    <div style="margin-left: 15px; display: flex;align-items: center;">
                        <Icon class="review-star" name="mdi:star"
                            v-for="star in (media.ratings.find(rating => rating.username === review.user.username).score / 2)" />
                    </div>

                    <div
                        style="display: flex; align-items: center; justify-content: center; height: 100%; position: absolute; top: 0; right: 0;">
                        <button class="review-btn"
                            v-if="showReviewButtons(review.user.username) && toggleEdit[index] == false"
                            @click="toggleEdit[index] = true; comment[index].classList.add('focus');">
                            <Icon class="icon" name="mdi:pencil" />
                        </button>
                        <button class="review-btn"
                            v-if="showReviewButtons(review.user.username) && toggleEdit[index] == true"
                            @click="updateReview(review.id, comment[index].innerText); toggleEdit[index] = false; comment[index].classList.remove('focus')">
                            <Icon class="icon" name="ic:outline-check" />
                        </button>
                        <button class="review-btn" v-if="showReviewButtons(review.user.username)"
                            @click="deleteReview(review.id)">
                            <Icon class="icon" name="material-symbols:delete"></Icon>
                        </button>
                    </div>

                </div>
                <div ref="comment" :contenteditable="toggleEdit[index]">{{ review.comment }}</div>
            </div>
        </ul>
    </div>
</template>

<style scoped>
span {
    font-size: 2rem;
    font-weight: 600;
}

.review-header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    position: relative;
}

.review-star {
    color: var(--primary-color-100);
}

.review-date {
    margin-left: 10px;
    font-weight: 400;
    font-size: 1.3rem;
    display: flex;
    align-items: center;
}

.scroll-container {
    padding: 0;
    overflow-y: scroll;
    overflow-x: hidden;
    max-height: 200px;
    height: 200px;
}

.review-star:hover {
    cursor: default !important;
}

.review-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0px 0px 0px 15px !important;
    background-color: transparent;
    padding: 0;
    color: white;
}

.review-btn:hover {
    background-color: transparent;
}

.icon {
    min-height: 25px;
    min-width: 25px;
}

.icon:hover {
    cursor: pointer;
    color: var(--primary-color-100);
}

form {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50px;
    margin-bottom: 15px
}

.focus {
    border: 1px dashed var(--primary-color-100);
    padding-left: 5px;
    border-radius: 3px;
}

.focus:focus {
    outline: none !important;
}

.container-review {
    border: 1px solid white;
    border-radius: 15px;
    padding: 5px 20px;
    margin-bottom: 20px;
    margin-right: 10px;
}

input {
    border: none;
    border-bottom: 1px solid white;
    padding-left: 1px;
    width: 100%;
    height: 100%;
    white-space: wrap;

}

button {
    height: 100%;
    margin-left: 10px;
    background-color: white;
    border: none;
    border-radius: 15px;
    padding: 10px 10px;
    font-family: var(--font-family-1);
    font-weight: 600;
    color: var(--background-color-100)
}

button:hover {
    cursor: pointer;
    background-color: var(--primary-color-100);
}

@media screen and (max-width: 550px) {
    .review-header p {
        font-size: 1.1rem !important;
    }

    .review-date {
        display: none;
    }

    .scroll-container {
        padding: 0;
        overflow-y: scroll;
        overflow-x: hidden;
        max-height: 400px;
        height: 400px;
    }
}
</style>