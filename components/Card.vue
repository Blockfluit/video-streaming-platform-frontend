<script setup>
import { storeToRefs } from 'pinia';
import { useMainStore } from '~/stores/mainStore';
import { useJwtStore } from '~/stores/jwtStore';

const props = defineProps({
    shownMedia: {},
    showLastVideo: false,
})

const mainStore = useMainStore()
const jwtStore = useJwtStore()

const { watched } = storeToRefs(mainStore)

const config = useRuntimeConfig()
const showExtraInformation = ref(false)
const timePercentage = ref(0)


onBeforeMount(() => {
    const lastWatched = getLastVideo(props.shownMedia.id)
    if (timePercentage.value !== undefined) {
        timePercentage.value = lastWatched.timestamp / lastWatched.duration * 100
    }
})

watch(watched, (o, n) => {
    const lastWatched = getLastVideo(props.shownMedia.id)
    if (timePercentage.value !== undefined) {
        timePercentage.value = lastWatched.timestamp / lastWatched.duration * 100
    }
},
    { deep: true })

function getLastVideo(mediaId) {
    return watched.value.filter(entry => entry.mediaId === mediaId)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0] ?? {}
}

function navigationHandler(mediaId, showLastVideo) {
    if (showLastVideo) {
        const lastWatched = getLastVideo(mediaId)
        navigateTo(`watch?mid=${mediaId}&vid=${lastWatched.videoId}`)
        return
    }
    navigateTo(`/media?id=${mediaId}`)
}
</script>

<template>
    <div class="card">
        <div @mouseover="showExtraInformation = true"
             class="container-information">
            <div class="container-img">
                <NuxtImg :src="config.public.baseURL + '/stream/thumbnail/' + shownMedia.id"
                         loading="lazy" />
            </div>
            <div v-if="showLastVideo"
                 class="information">
                <div style="background-color: rgba(255, 255, 255, 0.3)">
                    <div class="time"
                         :style="`width: ${timePercentage}%`"></div>
                </div>
                <span class="last-video-name">{{ getLastVideo(shownMedia.id).name }}</span>
            </div>
            <div @click="navigationHandler(shownMedia.id, showLastVideo)"
                 @mouseleave="showExtraInformation = false"
                 v-if="showExtraInformation"
                 class="show-rating">
                <div v-if="shownMedia.rating >= 1">
                    <template v-for="star in 5">
                        <Icon class="star"
                              :style="{ color: shownMedia.rating / 2 >= star ? 'var(--primary-color-100)' : 'var(--text-color-2)' }"
                              name="mdi:star" />
                    </template>
                </div>
                <div v-else>
                    <h3>No Rating</h3>
                </div>
                <span v-if="jwtStore.isAdmin">{{ shownMedia.views }} unique views</span>
            </div>
        </div>
        <div @click="navigationHandler(shownMedia.id)"
             class="title">
            <span class="name">{{ shownMedia.name }}</span>
            <span v-if="shownMedia.videos > 1"
                  class="total-videos">{{ shownMedia.videos }}</span>
        </div>
    </div>
</template>

<style scoped>
img {
    object-fit: cover;
    height: 100%;
    border-radius: var(--border-radius-1) var(--border-radius-1) 0px 0px;
}

.last-video-name {
    padding-top: 3px;
    font-size: var(--font-size-5);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.star {
    min-width: 40px;
    min-height: 40px;
    margin: 0px -8px;
    color: var(--primary-color-100);
}

.time {
    height: 4px;
    background-color: var(--primary-color-100);
}

.last-video-name {
    margin: 0px 10px;
}

.title {
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
    align-items: center;
    margin: 0px 10px;
    user-select: none;
}

.name {
    font-size: var(--font-size-3);
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 4px 0;
}

.total-videos {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    font-size: 0.9rem;
    color: var(--text-color-3);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 25px;
}

.container-img {
    width: 100%;
    aspect-ratio: 2/3;
    overflow: hidden;
}

.container-information {
    position: relative;
    height: 100%;
    width: 100%;
}

.information {
    display: flex;
    flex-direction: column;
    text-transform: capitalize;
}

.show-rating {
    display: flex;
    position: absolute;
    top: 0;
    z-index: 2;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: linear-gradient(0deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.5) 10%, rgba(0, 0, 0, 0.6) 20%, rgba(0, 0, 0, 0.7) 30%, rgba(0, 0, 0, 0.8) 40%, rgba(0, 0, 0, 0.8) 50%, rgba(0, 0, 0, 0.8) 60%, rgba(0, 0, 0, 0.7) 70%, rgba(0, 0, 0, 0.6) 80%, rgba(0, 0, 0, 0.5) 90%, rgba(0, 0, 0, 0.2) 100%);
    height: 100%;
    width: 100%;
    border-radius: var(--border-radius-1) var(--border-radius-1) 0 0;
    user-select: none;
}

.show-rating span,
p,
svg {
    white-space: nowrap;
    padding: 5px 10px;
}

.card {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 250px;
    border-radius: 15px;
    background-color: var(--background-color-100);
}

.card:hover {
    cursor: pointer;
}

@media screen and (max-width: 992px) {
    .card {
        width: 160px;
    }

    .name {
        font-size: var(--font-size-4);
        font-weight: 700;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        padding: 4px 0;
    }
}
</style>