<script setup>
const props = defineProps({
    media: {
        default: {},
        type: Object
    },
    nextVideo: {
        default: {},
        type: Object
    },
    playNext: {
        type: Function
    }
})

const countdownTimer = ref(0)

function startCountdown() {
    const countdownInSec = 5
    countdownTimer.value = countdownInSec
    updateWatched(videoId, videoElement.value.currentTime)

    intervalId = setInterval(() => {
        countdownTimer.value--
        if (countdownTimer.value > 0) return
        playVideo(videoId)
    }, 1000)
}

</script>

<template>
    <div v-if="countdownTimer > 0" class="container-center">
            <div v-if="nextVideo" class="container-countdown">
                <h3>Next video:</h3>
                <h3 style="font-weight: 100;">{{ nextVideo.name }}</h3>
                <h1>{{ countdownTimer }}</h1>
            </div>
            <div v-else class="container-countdown">
                <h3>Returning to:</h3>
                <h3 style="font-weight: 100;">{{ media.name }}</h3>
                <h1>{{ countdownTimer }}</h1>
            </div>
        </div>
</template>

<style scoped>
.container-countdown {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    pointer-events: none;
    background: radial-gradient(rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.3) 100%);
    position: fixed;
    padding: 10px;
}

.container-countdown * {
    margin: 0;
}
</style>