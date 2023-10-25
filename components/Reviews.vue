<script setup>
import { storeToRefs } from 'pinia';
import { useJwtStore } from '~/stores/jwtStore';
import { useMediaStore } from '~/stores/mediaStore';

const props = defineProps({
    media1: {},
})

const config = useRuntimeConfig()

const jwtStore = useJwtStore()
const mediaStore = useMediaStore()

const { media } = storeToRefs(mediaStore)
const reviews = ref(props.media1.reviews)
const title = ref()
const comment = ref()
const editTitle = ref()
const editComment = ref()
const toggleEdit = ref()

watch(media, (o, n) => {
    reviews.value = [...media.value.reviews]
})

const showReviewButtons = (username) => {
    return username === jwtStore.getSubject || jwtStore.getRole == "ADMIN"
}

const addReview = (title, comment) => {
    fetch(`${config.public.baseURL}/media/${props.media1.id}/review`, {
        method: "POST",
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${jwtStore.getJwt}`
        },
        body: JSON.stringify({
            title: title,
            comment: comment,
        })
    }).then((response) => {
        if (response.status >= 200 && response.status < 300) {
            mediaStore.setMedia(props.media1.id)
            return
        }
    }).catch(e => {
        console.log(e)
    })
}

const updateReview = (id, title, comment) => {
    fetch(`${config.public.baseURL}/media/${props.media1.id}/review`, {
        method: "PUT",
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${jwtStore.getJwt}`
        },
        body: JSON.stringify({
            id: id,
            title: title,
            comment: comment,
        })
    }).then((response) => {
        if (response.status >= 200 && response.status < 300) {
            mediaStore.setMedia(props.media1.id)
            return
        }
    }).catch(e => {
        console.log(e)
    })
}

const deleteReview = (id) => {
    if (!confirm("Are you sure you want to delete this review?")) return

    fetch(`${config.public.baseURL}/media/${props.media1.id}/review`, {
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
            mediaStore.setMedia(props.media1.id)
            return
        }
    }).catch(e => {
        console.log(e)
    })
}
</script>

<template>
    <div>
        <div style="display: flex;">
            <span style="margin-right: 15px;">Reviews</span>
            <Rating :media="media1" :average="false" />
        </div>
        <form v-if="jwtStore.getRole !== 'USER'" @submit.prevent="addReview(title, comment)">
            <div style="width: 100%;">
                <input v-model="title" placeholder="Title..." type="text" required>
                <input v-model="comment" placeholder="Review..." type="text" required>
            </div>
            <button class="post-btn" type="submit">Post review</button>
        </form>
        <div class="divider"></div>
        <ul class="scroll-container">
            <div v-for="(review, index) in reviews.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))"
                class="container-review">
                <div class="review-header">
                    <p style="font-weight: 700; display: flex; align-items: center;">{{ review.user.username }}
                    <p class="review-date">{{ new Date(review.updatedAt).toLocaleDateString() }}</p>
                    </p>
                    <div style="margin-left: 15px; display: flex;align-items: center;">
                        <Icon class="review-star" name="mdi:star"
                            v-for="star in (media.ratings.find(rating => rating.username === review.user.username).score / 2)" />
                    </div>
                    <div style="flex-grow: 1;"></div>
                    <div style="display: flex; align-items: center; justify-content: center; height: 100%;">
                        <button class="review-btn" v-if="showReviewButtons(review.user.username) && toggleEdit !== index"
                            @click="toggleEdit = index">
                            <Icon class="icon" name="mdi:pencil" />
                        </button>
                        <button class="review-btn" v-if="showReviewButtons(review.user.username) && toggleEdit === index"
                            @click="updateReview(review.id, editTitle[index].innerText, editComment[index].innerText); toggleEdit = null;">
                            <Icon class="icon" name="ic:outline-check" />
                        </button>
                        <button class="review-btn" v-if="showReviewButtons(review.user.username)"
                            @click="deleteReview(review.id)">
                            <Icon class="icon" name="material-symbols:delete"></Icon>
                        </button>
                    </div>
                </div>
                <div ref="editTitle" :class="toggleEdit === index ? 'focus' : ''" :contenteditable="toggleEdit === index">
                    <h3 style="margin: 0;">{{ review.title }}</h3>
                </div>
                <div ref="editComment" :class="toggleEdit === index ? 'focus' : ''" :contenteditable="toggleEdit === index">
                    {{ review.comment }}</div>
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
.divider {
    background-color: var(--background-color-100);
    width: 100%;
    height: 1px;
    margin: 5px 0px;
    filter: blur(1px);
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
    border: none;
    border-radius: 15px;
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
    margin-bottom: 15px;
    height: 80px;
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
    padding: 6px;
    padding-left: 5px;
    width: 100%;
    height: 100%;
    white-space: wrap;

}

input:focus {
    border-bottom: 1px solid var(--primary-color-100);
    outline: none;
}

.post-btn {
    height: 100%;
    margin-left: 10px;
    background-color: white;
    border: none;
    border-radius: 15px;
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
        max-height: 450px;
        height: 450px;
    }
}
</style>