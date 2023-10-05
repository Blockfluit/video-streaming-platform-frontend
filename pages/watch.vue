<script setup>
import { useMediaStore } from "~/stores/mediaStore";
import { storeToRefs } from "pinia";

const mediaStore = useMediaStore()
const config = useRuntimeConfig()

const { media, video } = storeToRefs(mediaStore)

const videoElement = ref({})

onMounted(() => {
    if (process.client) {
        const queryString = window.location.search
        const urlParams = new URLSearchParams(queryString)
        const time = urlParams.get("time") ?? 0
        videoElement.value.currentTime = parseInt(time)
    }
})

onBeforeUnmount(() => {
    mediaStore.updateWatched(video.value.id, videoElement.value.currentTime)
})
</script>

<template>
    <div class="container">
        <div @click="navigateTo(`media?id=${media.id}`)" class="information">
            <Icon name="bi:chevron-left" class="back-icon" size="1.5rem" />
            <div class="container-vertical">
                <span style="font-size: var(--font-size-2); text-transform: capitalize;">{{ video.name
                }}</span>
                <span v-if="video.season !== -1" style="font-size: var(--font-size-4);">Season
                    {{ video.season }}</span>
            </div>
        </div>
        <video ref="videoElement" crossorigin="anonymous" controls>
            <source :src="`${config.public.baseURL}/stream/video/${video.id}`" type="video/mp4" />
            <track v-for="subtitle in video.subtitles" :src="`${config.public.baseURL}/stream/subtitle/${subtitle.id}`"
                :label="subtitle.label" kind="subtitles" :srclang="subtitle.srcLang" :default="subtitle.defaultSub" />
        </video>
    </div>
</template>

<style scoped>
.information {
    z-index: 10;
    position: absolute;
    display: flex;
    flex-direction: row;
    align-items: center;
    margin: 40px 30px;
    padding: 5px 15px;
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 250px;
}
.information:hover {
    cursor: pointer;
}
.container-vertical {
    display: flex;
    flex-direction: column;
}
.back-icon {
    margin-right: 15px;
}
.container {
    position: fixed;
    top: 0;
    /* top: var(--navbar-height); */
    width: 100%;
    /* height: calc(100% - var(--navbar-height)); */
    height: 100%;
    z-index: 100;
    left: 0;
    background-color: rgb(0, 0, 0);
}

.container video {
    position: absolute;
    width: 100%;
    height: 100%;
}
</style>