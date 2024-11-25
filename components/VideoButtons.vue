<script setup>
const props = defineProps({
    nextVideo: {
        type: Object
    },
    previousVideo: {
        type: Object
    }
})
</script>

<template>
    <div class="container-next-video">
            <div v-if="nextVideo" @click="playVideo(previousVideo.id, 0)" class="container-next-video-left">
                <h3 class="hide-on-desktop prev-btn" style="font-size: var(--font-size-4); font-weight: 600;">Previous
                </h3>
                <div class="container-vertical hide-on-phone prev-btn">
                    <span class="title" style="font-size: var(--font-size-4); font-weight: 600;">Previous episode</span>
                    <span v-if="previousVideo.season !== -1" style="font-size: var(--font-size-5);">
                        {{ previousVideo.name }}</span>
                </div>
            </div>
            <div style="flex-grow: 1;"></div>
            <div v-if="previousVideo" @click="playVideo(nextVideo.id, 0)" class="container-next-video-right">
                <div class="container-vertical hide-on-phone next-btn">
                    <span class="title" style="font-size: var(--font-size-4); font-weight: 600;">Next episode</span>
                    <span v-if="nextVideo.season !== -1" style="font-size: var(--font-size-5);">
                        {{ nextVideo.name }}</span>
                </div>
                <h3 class="hide-on-desktop next-btn" style="font-size: var(--font-size-4); font-weight: 600;">Next</h3>
            </div>
        </div>
</template>

<style scoped>
.container-next-video {
    width: 100%;
    display: flex;
    flex-direction: row;
    z-index: 10;
    position: absolute;
    bottom: 70px;
    padding: 30px;
}

.container-next-video-left {
    display: flex;
    flex-direction: row;
    align-items: center;
    left: 0;
    cursor: pointer;
}

.container-next-video-left:hover,
.container-next-video-right:hover {
    color: var(--primary-color-100);
}

.container-next-video-left:hover .prev-btn,
.container-next-video-right:hover .next-btn {
    border: 1px solid var(--primary-color-100);
}

.container-next-video-right {
    display: flex;
    flex-direction: row;
    align-items: center;
    right: 0;
    cursor: pointer;
}

.prev-btn,
.next-btn {
    border: 1px solid white;
    padding: 5px 10px;
    border-radius: 8px;
    font-weight: 300;
}

.hide-on-phone {
    display: flex;
}

.hide-on-desktop {
    display: none;
}

@media screen and (max-width: 992px) {
    .hide-on-phone {
        display: none;
    }

    .container-next-video {
        padding: 30px 15px;
    }

    .hide-on-desktop {
        display: flex;
    }
}
</style>